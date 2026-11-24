// RM-20, API de conta, acesso, sessões, aceites e tema: ponta a ponta pelo HTTP, com banco real e os
// papéis reais (app_user pelo TenantContext, app_autenticacao pelo módulo autenticacao). Banco
// próprio e descartável; relógio injetável congelado, avançado à mão (sem sleep de 30 s ou 15 min).
// Prova do pacote da fase 2, seção 6, linha 3.
import { createHmac, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validarComum } from '@condomifacil/shared-types';
import argon2 from 'argon2';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { conectar, senha as senhaDoPapel } from '../../db/scripts/ambiente.js';
import { ApiComBancoModule, configurarApp } from '../../src/api.module.js';
import { lerConfig } from '../../src/compartilhado/config/config.js';
import { LoggerJson } from '../../src/compartilhado/logger/index.js';
import { MAILER } from '../../src/compartilhado/portas/index.js';
import {
  TenantContext,
  type OpcoesDoBanco,
  type Transacao,
} from '../../src/compartilhado/tenant/index.js';
import type { CaixaDeSaidaFalsa } from '../../src/integracoes/email/caixa-de-saida-falsa.mailer.js';
import { lerConfigAcesso } from '../../src/modulos/autenticacao/index.js';
import { amb, bancoMigrado } from './apoio.js';

const BANCO = 'condomifacil_teste_acesso_api';
const WEB = 'http://web.exemplo.test';
const SENHA = 'senha-correta-123';
const DISPOSITIVO = { identificador_instalacao: 'inst-teste-fixture', plataforma: 'android' };
const CHAVE_JWT = 'j'.repeat(40);
const CHAVE_HMAC = 'h'.repeat(40);

// Relógio congelado: o teste avança o tempo sem esperar.
const base = Date.now();
let deslocamentoMs = 0;
const relogio = { agora: () => new Date(base + deslocamentoMs) };
const avancar = (ms: number) => (deslocamentoMs += ms);

const linhasDeLog: string[] = [];
const logger = new LoggerJson((l) => linhasDeLog.push(l));
// Tudo o que é dado pessoal ou segredo nos testes: nenhum pode aparecer no log.
const sensiveis = new Set<string>();

const opcoes = (usuario: string, papel: 'app_user' | 'app_autenticacao'): OpcoesDoBanco => ({
  host: amb.host,
  port: amb.porta,
  database: BANCO,
  username: usuario,
  password: senhaDoPapel(papel),
  max: 4,
});

const configDoAcesso = (extra: Record<string, string> = {}) =>
  lerConfigAcesso({
    JWT_SIGNING_KEY: CHAVE_JWT,
    IDENTITY_HMAC_KEY: CHAVE_HMAC,
    JWT_ISSUER: 'condomifacil-api-teste',
    JWT_AUDIENCE: 'condomifacil-app-teste',
    CORS_ALLOWED_ORIGINS: WEB,
    RATE_LIMIT_IP_PER_MIN: '10000',
    RATE_LIMIT_EMAIL_PER_MIN: '10000',
    ...extra,
  });

async function criarApp(extra: Record<string, string> = {}): Promise<INestApplication> {
  const mod = await Test.createTestingModule({
    imports: [
      ApiComBancoModule.registrar({
        acesso: configDoAcesso(extra),
        banco: opcoes('app_user', 'app_user'),
        bancoAutenticacao: opcoes('app_autenticacao', 'app_autenticacao'),
        relogio,
        logger,
      }),
    ],
  }).compile();
  const a = mod.createNestApplication();
  configurarApp(a, lerConfig({ APP_ENV: 'dev', PORT: '3000', CORS_ALLOWED_ORIGINS: WEB }), logger);
  await a.init();
  return a;
}

let app: INestApplication;
let caixa: CaixaDeSaidaFalsa;
const fx = conectar(amb, 'fixtures', BANCO);
const obs = conectar(amb, 'postgres', BANCO);
let hashDaSenha: string;
let contador = 0;

const http = () => request(app.getHttpServer());

interface Pessoa {
  id: string;
  email: string;
}

/** Usuário de fixture (papel fixtures, BYPASSRLS, só em banco descartável). */
async function usuario(
  estado: 'pre_cadastrado' | 'ativo' | 'desativado' = 'ativo',
): Promise<Pessoa> {
  const email = `pessoa${++contador}.acesso@exemplo.test`;
  const [u] = await fx<{ id: string }[]>`
    insert into condomifacil.usuario (nome, email_normalizado, senha_hash, estado)
    values (${`Pessoa Ficticia ${contador}`}, ${email}, ${estado === 'pre_cadastrado' ? null : hashDaSenha}, ${estado})
    returning id`;
  sensiveis.add(email).add(`Pessoa Ficticia ${contador}`);
  return { id: u!.id, email };
}

const hmac = (dominio: string, valor: string) =>
  createHmac('sha256', Buffer.from(CHAVE_HMAC)).update(`${dominio}\0${valor}`).digest('hex');
type LinhaControle = {
  falhas: number;
  janela_iniciada_em: Date | null;
  bloqueado_ate: Date | null;
};
/** Linha de controle_login (só observação) de uma chave: dominio 'login' ou 'codigo-teto'. */
async function controle(dominio: 'login' | 'codigo-teto', email: string) {
  const [l] = await obs<LinhaControle[]>`
    select falhas, janela_iniciada_em, bloqueado_ate from condomifacil.controle_login
    where chave_tentativa_protegida = ${hmac(dominio, email)}`;
  return l;
}

const web = (r: request.Test, origem: string | null = WEB) => {
  r.set('X-CondomiFacil-Web', '1');
  if (origem !== null) r.set('Origin', origem);
  return r;
};

/** Toda resposta de erro tem de validar contra `Erro` (contrato) e trazer o request_id. */
function erro(res: request.Response, status: number, codigo: string) {
  expect(res.status, JSON.stringify(res.body)).toBe(status);
  expect(res.body.codigo).toBe(codigo);
  expect(validarComum('Erro', res.body)).toEqual({ valido: true });
  expect(res.body.request_id).toBe(res.headers['x-request-id']);
  return res;
}

async function entrar(p: Pessoa, senha = SENHA) {
  return http().post('/v1/acesso/entrar').send({ email: p.email, senha, dispositivo: DISPOSITIVO });
}

interface SessaoApp {
  acesso: string;
  refresh: string;
  sid: string;
}
async function sessao(p: Pessoa): Promise<SessaoApp> {
  const r = await entrar(p);
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  guardar(r.body);
  const acesso = r.body.token_acesso as string;
  const refresh = r.body.refresh_token as string;
  return { acesso, refresh, sid: refresh.split('.')[0]! };
}
const guardar = (corpo: { token_acesso?: string; refresh_token?: string | null }) => {
  if (corpo.token_acesso) sensiveis.add(corpo.token_acesso);
  if (corpo.refresh_token) sensiveis.add(corpo.refresh_token.split('.')[1]!);
};
const comAcesso = (r: request.Test, s: { acesso: string }) =>
  r.set('Authorization', `Bearer ${s.acesso}`);
const renovar = (refresh: string) =>
  http().post('/v1/acesso/renovar').send({ refresh_token: refresh });

/** Último código enviado a um e-mail (a caixa falsa guarda o texto). */
function codigoEnviadoA(email: string): string {
  const m = [...caixa.enviados].reverse().find((e) => e.para === email);
  const codigo = /\b(\d{6})\b/.exec(m?.texto ?? '')?.[1];
  expect(codigo, 'nenhum código enviado').toBeDefined();
  sensiveis.add(codigo!);
  return codigo!;
}
const pedir = (email: string, finalidade = 'primeiro_acesso') =>
  http().post('/v1/acesso/codigo').send({ email, finalidade });
const ativar = (email: string, codigo: string, nova = 'nova-senha-456') =>
  http()
    .post('/v1/acesso/ativar')
    .send({ email, codigo, nova_senha: nova, dispositivo: DISPOSITIVO });

beforeAll(async () => {
  await bancoMigrado(BANCO);
  hashDaSenha = await argon2.hash(SENHA);
  sensiveis.add(SENHA).add('nova-senha-456').add('outra-senha-789').add('senha-errada-000');
  app = await criarApp();
  caixa = app.get<CaixaDeSaidaFalsa>(MAILER);
  // Documento global (RN-CD-03): uma versão publicada; a versão 2 entra no teste de aceites.
  await fx.begin(async (tx) => {
    const [d] = await tx<{ id: string }[]>`
      insert into condomifacil.documento (tipo, titulo) values ('termos_de_uso', 'Termos de uso (fictício)')
      returning id`;
    await tx`insert into condomifacil.documento_versao (documento_id, numero, conteudo_texto, vigente_desde)
      values (${d!.id}, 1, 'Termos de uso, versão 1 (fictícia).', now())`;
  });
}, 300_000);

afterAll(async () => {
  await app?.close();
  await fx.end();
  await obs.end();
});

describe('código de acesso (RN-CD-02)', () => {
  test('resposta idêntica para e-mail cadastrado ou não, sem criar usuário e sem e-mail para quem não tem conta', async () => {
    const conhecido = await usuario('pre_cadastrado');
    const desconhecido = `ninguem${Date.now()}@exemplo.test`;
    sensiveis.add(desconhecido);
    const antes = caixa.enviados.length;
    const a = await pedir(conhecido.email);
    const b = await pedir(desconhecido);
    expect(a.status).toBe(202);
    expect(b.status).toBe(a.status);
    expect(b.body).toEqual(a.body);
    expect(validarComum('res_comumPedirCodigo_202', a.body)).toEqual({ valido: true });
    expect(caixa.enviados.length - antes).toBe(1);
    const [{ n }] = await obs<[{ n: number }]>`
      select count(*)::int as n from condomifacil.usuario where email_normalizado = ${desconhecido}`;
    expect(n).toBe(0);
  });

  test('o texto do e-mail traz código de 6 dígitos e a validade de 15 minutos', async () => {
    const p = await usuario('pre_cadastrado');
    await pedir(p.email);
    const codigo = codigoEnviadoA(p.email);
    expect(codigo).toMatch(/^\d{6}$/);
    expect(caixa.enviados.at(-1)!.texto).toContain('15 minutos');
  });

  test('ativar erra igual para e-mail cadastrado ou não, inclusive as tentativas restantes (5 tentativas)', async () => {
    const conhecido = await usuario('pre_cadastrado');
    const desconhecido = `fantasma${Date.now()}@exemplo.test`;
    sensiveis.add(desconhecido);
    await pedir(conhecido.email);
    await pedir(desconhecido);
    const sequencia = async (email: string) => {
      const saida = [];
      for (let i = 0; i < 6; i++) {
        const r = await ativar(email, '000000');
        saida.push([r.status, r.body.codigo, r.body.mensagem]);
        expect(validarComum('Erro', r.body)).toEqual({ valido: true });
      }
      return saida;
    };
    const a = await sequencia(conhecido.email);
    const b = await sequencia(desconhecido);
    expect(b).toEqual(a);
    expect(a.map((x) => x[2])).toEqual([
      'Código incorreto. Você tem mais 4 tentativas.',
      'Código incorreto. Você tem mais 3 tentativas.',
      'Código incorreto. Você tem mais 2 tentativas.',
      'Código incorreto. Você tem mais 1 tentativa.',
      'Este código não vale mais. Peça um novo.',
      'Este código não vale mais. Peça um novo.',
    ]);
    // Na quinta o desafio foi invalidado: nem o código certo vale mais.
    expect((await ativar(conhecido.email, codigoEnviadoA(conhecido.email))).body.codigo).toBe(
      'CODIGO_INVALIDO_OU_VENCIDO',
    );
  });

  test('o código vale 15 minutos', async () => {
    const dentro = await usuario('pre_cadastrado');
    const fora = await usuario('pre_cadastrado');
    await pedir(dentro.email);
    await pedir(fora.email);
    const cDentro = codigoEnviadoA(dentro.email);
    const cFora = codigoEnviadoA(fora.email);
    avancar(14 * 60_000);
    const ok = await ativar(dentro.email, cDentro);
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    avancar(61_000);
    erro(await ativar(fora.email, cFora), 422, 'CODIGO_INVALIDO_OU_VENCIDO');
  });

  test('reenvio só depois de 60 s e o novo código invalida o anterior', async () => {
    const p = await usuario('pre_cadastrado');
    expect((await pedir(p.email)).status).toBe(202);
    const antigo = codigoEnviadoA(p.email);
    const cedo = erro(await pedir(p.email), 429, 'CODIGO_REENVIO_ANTECIPADO');
    expect(Number(cedo.headers['retry-after'])).toBeGreaterThan(0);
    avancar(61_000);
    expect((await pedir(p.email)).status).toBe(202);
    const novo = codigoEnviadoA(p.email);
    erro(await ativar(p.email, antigo === novo ? '000000' : antigo), 422, 'CODIGO_INCORRETO');
    const ok = await ativar(p.email, novo);
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
  });

  test('reenvio antecipado responde igual para e-mail desconhecido', async () => {
    const e = `semconta${Date.now()}@exemplo.test`;
    sensiveis.add(e);
    await pedir(e);
    const r = erro(await pedir(e), 429, 'CODIGO_REENVIO_ANTECIPADO');
    expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
  });

  test('ativar cria a senha, ativa a conta e devolve a sessão; só vale para pré-cadastrado', async () => {
    const p = await usuario('pre_cadastrado');
    await pedir(p.email);
    const r = await ativar(p.email, codigoEnviadoA(p.email));
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(validarComum('res_comumAtivar_200', r.body)).toEqual({ valido: true });
    guardar(r.body);
    expect(r.body.refresh_token).toEqual(expect.stringContaining('.'));
    const [u] = await obs<[{ estado: string; senha_hash: string }]>`
      select estado, senha_hash from condomifacil.usuario where id = ${p.id}`;
    expect(u.estado).toBe('ativo');
    expect(u.senha_hash).toMatch(/^\$argon2id\$/);
    // Conta já ativa pede código de primeiro acesso: nada é enviado e ativar não passa.
    const antes = caixa.enviados.length;
    avancar(61_000);
    await pedir(p.email);
    expect(caixa.enviados.length).toBe(antes);
    // Indistinguível de e-mail desconhecido: desafio simulado, com tentativas restantes iguais.
    erro(await ativar(p.email, '123456'), 422, 'CODIGO_INCORRETO');
    expect((await entrar(p, 'nova-senha-456')).status).toBe(200);
  });

  test('corpo inválido responde 400 REQUISICAO_INVALIDA sem repetir o valor enviado', async () => {
    const r = erro(
      await http().post('/v1/acesso/codigo').send({ email: 'isto-nao-e-email', finalidade: 'x' }),
      400,
      'REQUISICAO_INVALIDA',
    );
    expect(JSON.stringify(r.body)).not.toContain('isto-nao-e-email');
    erro(
      await http().post('/v1/acesso/ativar').send({
        email: 'a@b.test',
        codigo: '123456',
        nova_senha: 'curta',
        dispositivo: DISPOSITIVO,
      }),
      400,
      'REQUISICAO_INVALIDA',
    );
  });

  test('o envio do e-mail falhar não muda a resposta', async () => {
    const p = await usuario('pre_cadastrado');
    const antes = caixa.enviar.bind(caixa);
    caixa.enviar = () => Promise.reject(new Error(`falha do provedor para ${p.email}`));
    try {
      const r = await pedir(p.email);
      expect(r.status).toBe(202);
    } finally {
      caixa.enviar = antes;
    }
  });

  test('a resposta não espera o envio do e-mail (provedor que nunca responde)', async () => {
    const p = await usuario('pre_cadastrado');
    const antes = caixa.enviar.bind(caixa);
    caixa.enviar = () => new Promise(() => {});
    try {
      const r = await pedir(p.email);
      expect(r.status).toBe(202);
    } finally {
      caixa.enviar = antes;
    }
  });
});

describe('teto de códigos errados (RN-CD-02, decisão de 24/11/2026)', () => {
  const errado = (email: string, rota: 'ativar' | 'redefinir-senha' = 'ativar') =>
    http()
      .post(`/v1/acesso/${rota}`)
      .send({ email, codigo: '000000', nova_senha: 'nova-senha-456', dispositivo: DISPOSITIVO });

  test('10 códigos errados em 24 h pausam pedir, ativar e redefinir por 24 h, igual para e-mail desconhecido', async () => {
    const conhecido = await usuario('pre_cadastrado');
    const desconhecido = `teto${Date.now()}@exemplo.test`;
    sensiveis.add(desconhecido);
    const resultados: unknown[][] = [];
    for (const email of [conhecido.email, desconhecido]) {
      const saida: unknown[][] = [];
      for (let ciclo = 0; ciclo < 2; ciclo++) {
        expect((await pedir(email)).status, `pedido ${ciclo}`).toBe(202);
        for (let i = 0; i < 5; i++) {
          const r = await errado(email);
          saida.push([r.status, r.body.codigo]);
        }
        avancar(61_000);
      }
      // A própria 10ª tentativa errada já foi o 429 (última da saída).
      expect(saida.at(-1)).toEqual([429, 'CODIGO_PAUSADO']);
      expect(saida.slice(0, -1).every(([st]) => st === 422)).toBe(true);
      // Pausado: pedir, ativar e redefinir.
      const pedido = erro(await pedir(email), 429, 'CODIGO_PAUSADO');
      expect(pedido.headers['retry-after']).toMatch(/^\d+$/);
      expect(Number(pedido.headers['retry-after'])).toBeGreaterThan(23 * 3600);
      expect(Number(pedido.headers['retry-after'])).toBeLessThanOrEqual(24 * 3600);
      erro(await errado(email), 429, 'CODIGO_PAUSADO');
      erro(await errado(email, 'redefinir-senha'), 429, 'CODIGO_PAUSADO');
      erro(await pedir(email, 'recuperacao_senha'), 429, 'CODIGO_PAUSADO');
      resultados.push(saida);
    }
    expect(resultados[1]).toEqual(resultados[0]);
    // O teto usa outra chave: o contador do login não é tocado.
    expect(await controle('login', conhecido.email)).toBeUndefined();
    // Passadas as 24 h, o pedido volta.
    avancar(24 * 3_600_000 + 1000);
    expect((await pedir(conhecido.email)).status).toBe(202);
    expect((await ativar(conhecido.email, codigoEnviadoA(conhecido.email))).status).toBe(200);
  });

  test('janela vencida reinicia o contador (a janela nasce no primeiro erro)', async () => {
    const p = await usuario('pre_cadastrado');
    await pedir(p.email);
    for (let i = 0; i < 3; i++) await errado(p.email);
    const antes = await controle('codigo-teto', p.email);
    expect(antes).toMatchObject({ falhas: 3, bloqueado_ate: null });
    expect(antes!.janela_iniciada_em).not.toBeNull();
    avancar(25 * 3_600_000);
    for (let i = 0; i < 9; i++) {
      const r = await errado(p.email);
      expect(r.status, `tentativa ${i + 1} depois da janela`).toBe(422);
    }
    const depois = await controle('codigo-teto', p.email);
    expect(depois!.falhas).toBe(9);
    expect(depois!.janela_iniciada_em!.getTime()).toBeGreaterThan(
      antes!.janela_iniciada_em!.getTime(),
    );
    erro(await errado(p.email), 429, 'CODIGO_PAUSADO');
  });
});

describe('login (SEG-04, RN-CD-07)', () => {
  test('sessão aberta com tokens, refresh no corpo e sem cookie no app', async () => {
    const p = await usuario();
    const r = await entrar(p);
    expect(r.status).toBe(200);
    expect(validarComum('res_comumEntrar_200', r.body)).toEqual({ valido: true });
    guardar(r.body);
    expect(r.headers['set-cookie']).toBeUndefined();
    expect(r.body.refresh_token).toMatch(/^[0-9a-f-]{36}\./);
    const expira = Date.parse(r.body.token_acesso_expira_em);
    expect(expira).toBe(Math.floor(relogio.agora().getTime() / 1000) * 1000 + 15 * 60_000);
  });

  test('e-mail ou senha errados dão a mesma resposta, sem dizer qual', async () => {
    const p = await usuario();
    const senhaErrada = erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    const emailErrado = erro(
      await http()
        .post('/v1/acesso/entrar')
        .send({ email: `x${Date.now()}@exemplo.test`, senha: SENHA, dispositivo: DISPOSITIVO }),
      401,
      'CREDENCIAIS_INVALIDAS',
    );
    expect(emailErrado.body.mensagem).toBe(senhaErrada.body.mensagem);
  });

  test('5 senhas erradas pausam por 15 min, também para e-mail inexistente; login certo zera o contador', async () => {
    const p = await usuario();
    const fantasma = `pausa${Date.now()}@exemplo.test`;
    sensiveis.add(fantasma);
    const errar = (email: string) =>
      http()
        .post('/v1/acesso/entrar')
        .send({ email, senha: 'senha-errada-000', dispositivo: DISPOSITIVO });
    for (const email of [p.email, fantasma]) {
      for (let i = 0; i < 4; i++) erro(await errar(email), 401, 'CREDENCIAIS_INVALIDAS');
      // A própria 5ª senha errada já responde com a pausa (UF 3.2), e a seguinte também.
      for (let i = 0; i < 2; i++) {
        const pausado = erro(await errar(email), 429, 'ACESSO_PAUSADO');
        expect(pausado.headers['retry-after']).toMatch(/^\d+$/);
        expect(Number(pausado.headers['retry-after'])).toBeGreaterThan(0);
        expect(Number(pausado.headers['retry-after'])).toBeLessThanOrEqual(900);
      }
    }
    // Na pausa nem a senha certa entra.
    erro(await entrar(p), 429, 'ACESSO_PAUSADO');
    avancar(15 * 60_000 + 1000);
    expect((await entrar(p)).status).toBe(200);
    // Contador e janela zerados: mais 4 erros não pausam.
    expect(await controle('login', p.email)).toMatchObject({
      falhas: 0,
      janela_iniciada_em: null,
      bloqueado_ate: null,
    });
    for (let i = 0; i < 4; i++) erro(await errar(p.email), 401, 'CREDENCIAIS_INVALIDAS');
    expect((await entrar(p)).status).toBe(200);
  });

  test('janela_iniciada_em nasce na primeira falha, não anda nas seguintes e zera junto com falhas', async () => {
    const p = await usuario();
    expect(await controle('login', p.email)).toBeUndefined();
    erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    const primeira = await controle('login', p.email);
    expect(primeira).toMatchObject({ falhas: 1, bloqueado_ate: null });
    expect(primeira!.janela_iniciada_em).toEqual(relogio.agora());
    avancar(5_000);
    erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    const segunda = await controle('login', p.email);
    expect(segunda!.falhas).toBe(2);
    expect(segunda!.janela_iniciada_em).toEqual(primeira!.janela_iniciada_em);
    expect((await entrar(p)).status).toBe(200);
    expect(await controle('login', p.email)).toMatchObject({ falhas: 0, janela_iniciada_em: null });
    // Pausa vencida reinicia a contagem e a janela.
    for (let i = 0; i < 5; i++) await entrar(p, 'senha-errada-000');
    avancar(15 * 60_000 + 1000);
    erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    const nova = await controle('login', p.email);
    expect(nova).toMatchObject({ falhas: 1, bloqueado_ate: null });
    expect(nova!.janela_iniciada_em).toEqual(relogio.agora());
  });

  test('senhas erradas simultâneas não passam do limite: reserva antes do Argon2 (4 erros, o resto pausa)', async () => {
    const p = await usuario();
    const rs = await Promise.all(Array.from({ length: 10 }, () => entrar(p, 'senha-errada-000')));
    const status = rs.map((r) => r.status);
    expect(status.filter((s) => s === 401)).toHaveLength(4);
    expect(status.filter((s) => s === 429)).toHaveLength(6);
    expect((await controle('login', p.email))!.falhas).toBe(5);
    // Nem a senha certa entra na pausa.
    erro(await entrar(p), 429, 'ACESSO_PAUSADO');
  });

  test('ACESSO_ENCERRADO só depois de e-mail e senha corretos', async () => {
    const p = await usuario('desativado');
    erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    erro(await entrar(p), 403, 'ACESSO_ENCERRADO');
  });

  test('conta pré-cadastrada (sem senha) não entra', async () => {
    const p = await usuario('pre_cadastrado');
    erro(await entrar(p), 401, 'CREDENCIAIS_INVALIDAS');
  });
});

describe('renovação do refresh (ADR-007)', () => {
  test('retry dentro de 30 s com o sucessor não usado passa uma única vez', async () => {
    const s = await sessao(await usuario());
    const r1 = await renovar(s.refresh);
    expect(r1.status).toBe(200);
    expect(validarComum('res_comumRenovar_200', r1.body)).toEqual({ valido: true });
    guardar(r1.body);
    avancar(10_000);
    const retry = await renovar(s.refresh);
    expect(retry.status, JSON.stringify(retry.body)).toBe(200);
    guardar(retry.body);
    // Segunda vez com o mesmo anterior: replay, revoga a sessão inteira.
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(retry.body.refresh_token), 401, 'SESSAO_EXPIRADA');
    erro(
      await comAcesso(http().get('/v1/eu'), { acesso: retry.body.token_acesso }),
      401,
      'SESSAO_EXPIRADA',
    );
  });

  test('fora de 30 s o anterior é replay e revoga a sessão', async () => {
    const s = await sessao(await usuario());
    const r1 = await renovar(s.refresh);
    guardar(r1.body);
    avancar(31_000);
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(r1.body.refresh_token), 401, 'SESSAO_EXPIRADA');
  });

  test('usar o sucessor encerra a janela do anterior', async () => {
    const s = await sessao(await usuario());
    const r1 = await renovar(s.refresh);
    guardar(r1.body);
    const r2 = await renovar(r1.body.refresh_token);
    expect(r2.status).toBe(200);
    guardar(r2.body);
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(r2.body.refresh_token), 401, 'SESSAO_EXPIRADA');
  });

  test('segredo antigo (de rotação anterior) revoga a sessão', async () => {
    const s = await sessao(await usuario());
    const r1 = await renovar(s.refresh);
    const r2 = await renovar(r1.body.refresh_token);
    guardar(r1.body);
    guardar(r2.body);
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(r2.body.refresh_token), 401, 'SESSAO_EXPIRADA');
  });

  test('id malformado ou inexistente dá 401 sem revogar nada', async () => {
    const s = await sessao(await usuario());
    erro(await renovar('lixo'), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(`${randomUUID()}.segredo`), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(`${s.sid}.`), 401, 'SESSAO_EXPIRADA');
    erro(await http().post('/v1/acesso/renovar').send({}), 401, 'SESSAO_EXPIRADA');
    // Id certo com segredo errado é replay e revoga; id errado nunca.
    expect((await renovar(s.refresh)).status).toBe(200);
  });

  test('o banco guarda só o hash do segredo, nunca o refresh', async () => {
    const s = await sessao(await usuario());
    const segredo = s.refresh.split('.')[1]!;
    const [l] = await obs<[{ renovacao_hash: string }]>`
      select renovacao_hash from condomifacil.sessao where id = ${s.sid}`;
    expect(l.renovacao_hash).not.toContain(segredo);
    expect(l.renovacao_hash).toBe(
      createHmac('sha256', Buffer.from(CHAVE_HMAC)).update(`renovacao\0${segredo}`).digest('hex'),
    );
  });

  test('a sessão vence depois de 30 dias sem renovar', async () => {
    const s = await sessao(await usuario());
    avancar(31 * 86_400_000);
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
  });
});

describe('teto absoluto da sessão (ADR-007)', () => {
  test('90 dias desde criada_em: a janela de 30 dias não passa do teto e a renovação depois dele dá 401', async () => {
    const s = await sessao(await usuario());
    // Sessão criada há 89 dias (o relógio do teste anda; criada_em é do banco).
    const criada = new Date(relogio.agora().getTime() - 89 * 86_400_000);
    await fx`update condomifacil.sessao set criada_em = ${criada} where id = ${s.sid}`;
    const r = await renovar(s.refresh);
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    guardar(r.body);
    const [l] = await obs<[{ expira_em: Date }]>`
      select expira_em from condomifacil.sessao where id = ${s.sid}`;
    expect(l.expira_em.getTime()).toBe(criada.getTime() + 90 * 86_400_000);
    expect(l.expira_em.getTime()).toBeLessThan(relogio.agora().getTime() + 30 * 86_400_000);
    avancar(2 * 86_400_000);
    erro(await renovar(r.body.refresh_token), 401, 'SESSAO_EXPIRADA');
  });

  test('antes do teto a janela deslizante de 30 dias segue valendo', async () => {
    const s = await sessao(await usuario());
    const r = await renovar(s.refresh);
    expect(r.status).toBe(200);
    guardar(r.body);
    const [l] = await obs<[{ expira_em: Date }]>`
      select expira_em from condomifacil.sessao where id = ${s.sid}`;
    expect(l.expira_em.getTime()).toBe(relogio.agora().getTime() + 30 * 86_400_000);
  });
});

describe('token de acesso (JWT)', () => {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const assinar = (cab: object, corpo: object, chave = CHAVE_JWT) => {
    const p = `${b64(cab)}.${b64(corpo)}`;
    return `${p}.${createHmac('sha256', chave).update(p).digest('base64url')}`;
  };

  test('HS256, só sub e sid (mais emissor, audiência e prazo), 15 minutos', async () => {
    const p = await usuario();
    const s = await sessao(p);
    const [cab, corpo] = s.acesso
      .split('.')
      .slice(0, 2)
      .map((x) => JSON.parse(Buffer.from(x, 'base64url').toString()));
    expect(cab).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(Object.keys(corpo).sort()).toEqual(['aud', 'exp', 'iat', 'iss', 'sid', 'sub']);
    expect(corpo.sub).toBe(p.id);
    expect(corpo.sid).toBe(s.sid);
    expect(corpo.exp - corpo.iat).toBe(900);
  });

  test('token adulterado, de outra chave, de outro emissor ou audiência, "none" ou vencido dá 401', async () => {
    const p = await usuario();
    const s = await sessao(p);
    const claims = {
      sub: p.id,
      sid: s.sid,
      iss: 'condomifacil-api-teste',
      aud: 'condomifacil-app-teste',
      iat: 0,
      exp: Math.floor(relogio.agora().getTime() / 1000) + 600,
    };
    const cab = { alg: 'HS256', typ: 'JWT' };
    expect((await comAcesso(http().get('/v1/eu'), { acesso: assinar(cab, claims) })).status).toBe(
      200,
    );
    const ruins = [
      assinar(cab, claims, 'k'.repeat(40)),
      assinar(cab, { ...claims, iss: 'outro' }),
      assinar(cab, { ...claims, aud: 'outra' }),
      assinar(cab, { ...claims, exp: claims.exp - 3600 }),
      assinar({ alg: 'none', typ: 'JWT' }, claims),
      `${b64({ alg: 'none', typ: 'JWT' })}.${b64(claims)}.`,
      assinar({ alg: 'HS512', typ: 'JWT' }, claims),
      `${s.acesso.slice(0, -2)}xx`,
      'isto.nao.e-jwt',
    ];
    for (const t of ruins)
      erro(await comAcesso(http().get('/v1/eu'), { acesso: t }), 401, 'SESSAO_EXPIRADA');
    erro(await http().get('/v1/eu'), 401, 'SESSAO_EXPIRADA');
  });

  test('token vencido (mais de 15 min) dá 401', async () => {
    const s = await sessao(await usuario());
    avancar(15 * 60_000 + 1000);
    erro(await comAcesso(http().get('/v1/eu'), s), 401, 'SESSAO_EXPIRADA');
  });

  test('sessão revogada dá 401 mesmo com o access ainda válido, sem cache', async () => {
    const s = await sessao(await usuario());
    expect((await comAcesso(http().get('/v1/eu'), s)).status).toBe(200);
    expect((await comAcesso(http().post('/v1/acesso/sair').send({}), s)).status).toBe(204);
    erro(await comAcesso(http().get('/v1/eu'), s), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(s.refresh), 401, 'SESSAO_EXPIRADA');
  });
});

describe('web x app e CSRF (ADR-007)', () => {
  test('na web o refresh vai só no cookie rt (HttpOnly, Secure, SameSite=Lax, Path) e nunca no corpo', async () => {
    const p = await usuario();
    const r = await web(
      http()
        .post('/v1/acesso/entrar')
        .send({ email: p.email, senha: SENHA, dispositivo: DISPOSITIVO }),
    );
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(validarComum('res_comumEntrar_200', r.body)).toEqual({ valido: true });
    guardar(r.body);
    expect(r.body.refresh_token).toBeNull();
    const cookie = (r.headers['set-cookie'] as unknown as string[]).find((c) =>
      c.startsWith('rt='),
    )!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\/v1\/acesso(;|$)/);
    const valor = decodeURIComponent(cookie.split(';')[0]!.slice(3));
    sensiveis.add(valor.split('.')[1]!);
    expect(JSON.stringify(r.body)).not.toContain(valor.split('.')[1]!);
  });

  test('sem o cabeçalho, ou com Origin ausente, null ou de terceiro, dá 403 sem consumir o token', async () => {
    const p = await usuario();
    const login = await web(
      http()
        .post('/v1/acesso/entrar')
        .send({ email: p.email, senha: SENHA, dispositivo: DISPOSITIVO }),
    );
    const cookie = (login.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    const comCookie = (r: request.Test) => r.set('Cookie', cookie);
    // Cookie rt sem o cabeçalho: 403.
    erro(await comCookie(http().post('/v1/acesso/renovar')), 403, 'ORIGEM_NAO_PERMITIDA');
    // Cabeçalho com Origin ausente, null ou fora da lista: 403.
    for (const origem of [null, 'null', 'http://terceiro.test']) {
      erro(
        await comCookie(web(http().post('/v1/acesso/renovar'), origem)),
        403,
        'ORIGEM_NAO_PERMITIDA',
      );
    }
    // O token segue válido: a renovação legítima ainda passa.
    const ok = await comCookie(web(http().post('/v1/acesso/renovar')));
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    expect(ok.body.refresh_token).toBeNull();
    guardar(ok.body);
  });

  test('origem inválida não consome tentativa de senha nem conta para a pausa', async () => {
    const p = await usuario();
    for (let i = 0; i < 8; i++) {
      erro(
        await web(
          http()
            .post('/v1/acesso/entrar')
            .send({ email: p.email, senha: 'senha-errada-000', dispositivo: DISPOSITIVO }),
          'http://terceiro.test',
        ),
        403,
        'ORIGEM_NAO_PERMITIDA',
      );
    }
    expect((await entrar(p)).status).toBe(200);
  });

  test('sair na web sem o cabeçalho (com cookie) dá 403 e não revoga; com ele apaga o cookie', async () => {
    const p = await usuario();
    const login = await web(
      http()
        .post('/v1/acesso/entrar')
        .send({ email: p.email, senha: SENHA, dispositivo: DISPOSITIVO }),
    );
    guardar(login.body);
    const s = { acesso: login.body.token_acesso as string };
    const cookie = (login.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    erro(
      await comAcesso(http().post('/v1/acesso/sair').set('Cookie', cookie).send({}), s),
      403,
      'ORIGEM_NAO_PERMITIDA',
    );
    expect((await comAcesso(http().get('/v1/eu'), s)).status).toBe(200);
    const sair = await comAcesso(
      web(http().post('/v1/acesso/sair').set('Cookie', cookie).send({})),
      s,
    );
    expect(sair.status).toBe(204);
    const apagado = (sair.headers['set-cookie'] as unknown as string[]).find((c) =>
      c.startsWith('rt='),
    )!;
    expect(apagado).toMatch(/Max-Age=0/i);
    expect(apagado).toMatch(/Path=\/v1\/acesso/);
  });

  test('cookie rt malformado é tratado como ausente: 401 normal, nunca 500', async () => {
    const malformado = 'rt=%E0%A4%A';
    erro(
      await web(http().post('/v1/acesso/renovar').set('Cookie', malformado)),
      401,
      'SESSAO_EXPIRADA',
    );
    erro(await http().post('/v1/acesso/renovar').set('Cookie', malformado), 401, 'SESSAO_EXPIRADA');
  });

  test('o app (sem cabeçalho) não ganha cookie, e no app o refresh vem do corpo, não de cookie', async () => {
    const p = await usuario();
    const r = await entrar(p);
    expect(r.headers['set-cookie']).toBeUndefined();
    guardar(r.body);
    const out = await renovar(r.body.refresh_token);
    expect(out.status).toBe(200);
    expect(out.headers['set-cookie']).toBeUndefined();
    guardar(out.body);
  });

  test('CORS só libera as origens da lista, com credenciais, e nunca curinga', async () => {
    const ok = await http()
      .options('/v1/acesso/entrar')
      .set('Origin', WEB)
      .set('Access-Control-Request-Method', 'POST');
    expect(ok.headers['access-control-allow-origin']).toBe(WEB);
    expect(ok.headers['access-control-allow-credentials']).toBe('true');
    const outra = await http()
      .options('/v1/acesso/entrar')
      .set('Origin', 'http://terceiro.test')
      .set('Access-Control-Request-Method', 'POST');
    expect(outra.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('senha: troca e redefinição (RN-CD-29, US-AC-04)', () => {
  test('trocar encerra as outras sessões, mantém a atual e não emite token nem mexe em cookie', async () => {
    const p = await usuario();
    const a = await sessao(p);
    const b = await sessao(p);
    const r = await comAcesso(
      http().post('/v1/eu/senha').send({ senha_atual: SENHA, nova_senha: 'outra-senha-789' }),
      a,
    );
    expect(r.status, JSON.stringify(r.body)).toBe(204);
    expect(r.text).toBe('');
    expect(r.headers['set-cookie']).toBeUndefined();
    expect((await comAcesso(http().get('/v1/eu'), a)).status).toBe(200);
    erro(await comAcesso(http().get('/v1/eu'), b), 401, 'SESSAO_EXPIRADA');
    erro(await renovar(b.refresh), 401, 'SESSAO_EXPIRADA');
    expect((await renovar(a.refresh)).status).toBe(200);
    erro(await entrar(p), 401, 'CREDENCIAIS_INVALIDAS');
    expect((await entrar(p, 'outra-senha-789')).status).toBe(200);
  });

  test('senha atual errada dá 422 (nunca 401) e conta no mesmo contador do login, com pausa de 15 min', async () => {
    const p = await usuario();
    const s = await sessao(p);
    const trocar = (atual: string) =>
      comAcesso(
        http().post('/v1/eu/senha').send({ senha_atual: atual, nova_senha: 'outra-senha-789' }),
        s,
      );
    // 3 erros na troca + 2 no login = 5 no mesmo contador.
    for (let i = 0; i < 3; i++)
      erro(await trocar('senha-errada-000'), 422, 'SENHA_ATUAL_INCORRETA');
    erro(await entrar(p, 'senha-errada-000'), 401, 'CREDENCIAIS_INVALIDAS');
    // A 5ª (no login) já pausa; a troca pausada responde com o texto da troca.
    erro(await entrar(p, 'senha-errada-000'), 429, 'ACESSO_PAUSADO');
    const pausada = erro(await trocar('senha-errada-000'), 429, 'ACESSO_PAUSADO');
    expect(pausada.headers['retry-after']).toMatch(/^\d+$/);
    expect(Number(pausada.headers['retry-after'])).toBeGreaterThan(0);
    expect(pausada.body.mensagem).toContain('troca de senha');
    erro(await trocar(SENHA), 429, 'ACESSO_PAUSADO');
    erro(await entrar(p), 429, 'ACESSO_PAUSADO');
    avancar(15 * 60_000 + 1000);
    // A sessão do teste passou de 15 min de access: renova antes.
    const nova = await renovar(s.refresh);
    guardar(nova.body);
    const r = await comAcesso(
      http().post('/v1/eu/senha').send({ senha_atual: SENHA, nova_senha: 'outra-senha-789' }),
      { acesso: nova.body.token_acesso },
    );
    expect(r.status, JSON.stringify(r.body)).toBe(204);
  });

  test('a 5ª senha atual errada na troca já responde 429 ACESSO_PAUSADO', async () => {
    const p = await usuario();
    const s = await sessao(p);
    const errada = () =>
      comAcesso(
        http()
          .post('/v1/eu/senha')
          .send({ senha_atual: 'senha-errada-000', nova_senha: 'outra-senha-789' }),
        s,
      );
    for (let i = 0; i < 4; i++) erro(await errada(), 422, 'SENHA_ATUAL_INCORRETA');
    const quinta = erro(await errada(), 429, 'ACESSO_PAUSADO');
    expect(quinta.body.mensagem).toContain('troca de senha');
  });

  test('trocar exige Authorization e valida o corpo', async () => {
    erro(
      await http().post('/v1/eu/senha').send({ senha_atual: SENHA, nova_senha: 'outra-senha-789' }),
      401,
      'SESSAO_EXPIRADA',
    );
    const s = await sessao(await usuario());
    erro(
      await comAcesso(
        http().post('/v1/eu/senha').send({ senha_atual: SENHA, nova_senha: 'curta' }),
        s,
      ),
      400,
      'REQUISICAO_INVALIDA',
    );
  });

  test('redefinir encerra todas as outras sessões; a devolvida é a única ativa', async () => {
    const p = await usuario();
    const a = await sessao(p);
    const b = await sessao(p);
    expect((await pedir(p.email, 'recuperacao_senha')).status).toBe(202);
    const r = await http()
      .post('/v1/acesso/redefinir-senha')
      .send({
        email: p.email,
        codigo: codigoEnviadoA(p.email),
        nova_senha: 'outra-senha-789',
        dispositivo: DISPOSITIVO,
      });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(validarComum('res_comumRedefinirSenha_200', r.body)).toEqual({ valido: true });
    guardar(r.body);
    erro(await comAcesso(http().get('/v1/eu'), a), 401, 'SESSAO_EXPIRADA');
    erro(await comAcesso(http().get('/v1/eu'), b), 401, 'SESSAO_EXPIRADA');
    const nova = { acesso: r.body.token_acesso as string };
    expect((await comAcesso(http().get('/v1/eu'), nova)).status).toBe(200);
    const lista = await comAcesso(http().get('/v1/eu/sessoes'), nova);
    expect(lista.body.dados).toHaveLength(1);
    erro(await entrar(p), 401, 'CREDENCIAIS_INVALIDAS');
    expect((await entrar(p, 'outra-senha-789')).status).toBe(200);
  });

  test('recuperação só envia código para conta ativa e ativação só para pré-cadastrada', async () => {
    const ativo = await usuario();
    const pre = await usuario('pre_cadastrado');
    const antes = caixa.enviados.length;
    await pedir(pre.email, 'recuperacao_senha');
    await pedir(ativo.email, 'primeiro_acesso');
    expect(caixa.enviados.length).toBe(antes);
    await pedir(ativo.email, 'recuperacao_senha');
    expect(caixa.enviados.length).toBe(antes + 1);
  });
});

describe('sessões do titular', () => {
  test('lista só as não revogadas, sem hash, e marca a atual', async () => {
    const p = await usuario();
    const a = await sessao(p);
    const b = await sessao(p);
    expect((await comAcesso(http().delete(`/v1/eu/sessoes/${b.sid}`), a)).status).toBe(204);
    const r = await comAcesso(http().get('/v1/eu/sessoes'), a);
    expect(r.status).toBe(200);
    expect(validarComum('res_comumListarSessoes_200', r.body)).toEqual({ valido: true });
    expect(r.body.dados).toEqual([
      expect.objectContaining({
        id: a.sid,
        atual: true,
        dispositivo_identificador: 'inst-teste-fixture',
      }),
    ]);
    expect(JSON.stringify(r.body)).not.toMatch(/hash|segredo/i);
  });

  test('lista só as vivas: sessão vencida (expira_em no passado) não aparece', async () => {
    const p = await usuario();
    const a = await sessao(p);
    const b = await sessao(p);
    await fx`update condomifacil.sessao set expira_em = criada_em + interval '1 second' where id = ${b.sid}`;
    avancar(2_000);
    const r = await comAcesso(http().get('/v1/eu/sessoes'), a);
    expect(r.body.dados.map((d: { id: string }) => d.id)).toEqual([a.sid]);
  });

  test('encerrar sessão de outro usuário dá 404 e não revoga; id malformado também', async () => {
    const dono = await sessao(await usuario());
    const intruso = await sessao(await usuario());
    erro(
      await comAcesso(http().delete(`/v1/eu/sessoes/${dono.sid}`), intruso),
      404,
      'RECURSO_NAO_ENCONTRADO',
    );
    erro(
      await comAcesso(http().delete(`/v1/eu/sessoes/${randomUUID()}`), intruso),
      404,
      'RECURSO_NAO_ENCONTRADO',
    );
    erro(
      await comAcesso(http().delete('/v1/eu/sessoes/nao-e-uuid'), intruso),
      404,
      'RECURSO_NAO_ENCONTRADO',
    );
    expect((await comAcesso(http().get('/v1/eu'), dono)).status).toBe(200);
  });

  test('paginação por cursor e validação de limite', async () => {
    const p = await usuario();
    const s = await sessao(p);
    await sessao(p);
    await sessao(p);
    const um = await comAcesso(http().get('/v1/eu/sessoes?limite=2'), s);
    expect(um.body.dados).toHaveLength(2);
    expect(um.body.paginacao.tem_mais).toBe(true);
    const dois = await comAcesso(
      http().get(`/v1/eu/sessoes?limite=2&cursor=${um.body.paginacao.proximo_cursor}`),
      s,
    );
    expect(dois.body.dados).toHaveLength(1);
    expect(dois.body.paginacao).toEqual({ proximo_cursor: null, tem_mais: false });
    erro(await comAcesso(http().get('/v1/eu/sessoes?limite=0'), s), 400, 'REQUISICAO_INVALIDA');
    erro(await comAcesso(http().get('/v1/eu/sessoes?cursor=lixo'), s), 400, 'REQUISICAO_INVALIDA');
  });
});

describe('aceites (RN-CD-03)', () => {
  test('nova versão de documento bloqueia até novo aceite', async () => {
    const p = await usuario();
    const login = await entrar(p);
    expect(login.body.aceites_pendentes).toBe(true);
    const s = { acesso: login.body.token_acesso as string };
    const lista = await comAcesso(http().get('/v1/acesso/aceites'), s);
    expect(lista.status).toBe(200);
    expect(validarComum('res_comumListarAceitesPendentes_200', lista.body)).toEqual({
      valido: true,
    });
    expect(lista.body.dados).toHaveLength(1);
    expect(lista.body.dados[0]).toMatchObject({
      tipo: 'termos_de_uso',
      numero: 1,
      condominio_id: null,
    });
    const v1 = lista.body.dados[0].documento_versao_id as string;

    const aceitar = await comAcesso(
      http()
        .post('/v1/acesso/aceites')
        .send({ documento_versao_ids: [v1] }),
      s,
    );
    expect(aceitar.status, JSON.stringify(aceitar.body)).toBe(201);
    expect(validarComum('res_comumRegistrarAceites_201', aceitar.body)).toEqual({ valido: true });
    expect(aceitar.body.pendentes_restantes).toBe(0);
    // Repetir não duplica.
    const repetido = await comAcesso(
      http()
        .post('/v1/acesso/aceites')
        .send({ documento_versao_ids: [v1, v1] }),
      s,
    );
    expect(repetido.status).toBe(201);
    expect(repetido.body.aceitos).toHaveLength(1);
    expect(repetido.body.aceitos[0].aceito_em).toBe(aceitar.body.aceitos[0].aceito_em);
    const [{ n }] = await obs<
      [{ n: number }]
    >`select count(*)::int as n from condomifacil.aceite where usuario_id = ${p.id}`;
    expect(n).toBe(1);
    expect((await entrar(p)).body.aceites_pendentes).toBe(false);

    // Versão 2: volta a exigir aceite, e a versão 1 deixa de ser aceitável.
    await fx`insert into condomifacil.documento_versao (documento_id, numero, conteudo_texto, vigente_desde)
      select id, 2, 'Termos de uso, versão 2 (fictícia).', now() from condomifacil.documento where tipo = 'termos_de_uso'`;
    expect((await entrar(p)).body.aceites_pendentes).toBe(true);
    const v2 = (await comAcesso(http().get('/v1/acesso/aceites'), s)).body.dados[0];
    expect(v2.numero).toBe(2);
    const velho = erro(
      await comAcesso(
        http()
          .post('/v1/acesso/aceites')
          .send({ documento_versao_ids: [v1] }),
        s,
      ),
      422,
      'ACEITE_VERSAO_DESATUALIZADA',
    );
    expect(velho.body.detalhes).toEqual([
      { campo: 'documento_versao_ids', mensagem: 'Versão não vigente.' },
    ]);
    expect(
      (
        await comAcesso(
          http()
            .post('/v1/acesso/aceites')
            .send({ documento_versao_ids: [randomUUID()] }),
          s,
        )
      ).body.codigo,
    ).toBe('ACEITE_VERSAO_DESATUALIZADA');
    const ok = await comAcesso(
      http()
        .post('/v1/acesso/aceites')
        .send({ documento_versao_ids: [v2.documento_versao_id] }),
      s,
    );
    expect(ok.status).toBe(201);
    expect(ok.body.pendentes_restantes).toBe(0);
  });

  test('versão com vigente_desde no futuro não é pendência nem aceitável (RN-CD-03)', async () => {
    const s = await sessao(await usuario());
    const [v3] = await fx<{ id: string }[]>`
      insert into condomifacil.documento_versao (documento_id, numero, conteudo_texto, vigente_desde)
      select id, 3, 'Termos de uso, versão 3 agendada (fictícia).', now() + interval '1 day'
      from condomifacil.documento where tipo = 'termos_de_uso' returning id`;
    try {
      const lista = await comAcesso(http().get('/v1/acesso/aceites'), s);
      expect(lista.body.dados.map((d: { numero: number }) => d.numero)).toEqual([2]);
      erro(
        await comAcesso(
          http()
            .post('/v1/acesso/aceites')
            .send({ documento_versao_ids: [v3!.id] }),
          s,
        ),
        422,
        'ACEITE_VERSAO_DESATUALIZADA',
      );
    } finally {
      await fx`delete from condomifacil.documento_versao where id = ${v3!.id}`;
    }
  });

  test('o aceite é de cada titular: o de um não vale para o outro', async () => {
    const a = await sessao(await usuario());
    const b = await sessao(await usuario());
    const pend = (await comAcesso(http().get('/v1/acesso/aceites'), a)).body.dados[0]
      .documento_versao_id;
    await comAcesso(
      http()
        .post('/v1/acesso/aceites')
        .send({ documento_versao_ids: [pend] }),
      a,
    );
    expect((await comAcesso(http().get('/v1/acesso/aceites'), b)).body.dados).toHaveLength(1);
  });
});

describe('perfil e tema (RF-AC-05)', () => {
  test('lê o perfil sem expor credencial e grava só o tema', async () => {
    const p = await usuario();
    const s = await sessao(p);
    const lido = await comAcesso(http().get('/v1/eu'), s);
    expect(lido.status).toBe(200);
    expect(validarComum('res_comumObterPerfil_200', lido.body)).toEqual({ valido: true });
    expect(lido.body).toEqual({
      id: p.id,
      nome: expect.any(String),
      email: p.email,
      tema_preferido: 'aparelho',
    });
    const nova = await comAcesso(http().patch('/v1/eu').send({ tema_preferido: 'escuro' }), s);
    expect(nova.status).toBe(200);
    expect(validarComum('res_comumAtualizarPerfil_200', nova.body)).toEqual({ valido: true });
    expect(nova.body.tema_preferido).toBe('escuro');
    expect((await comAcesso(http().get('/v1/eu'), s)).body.tema_preferido).toBe('escuro');
    erro(
      await comAcesso(http().patch('/v1/eu').send({ tema_preferido: 'roxo' }), s),
      400,
      'REQUISICAO_INVALIDA',
    );
    // Só o tema muda: nome e e-mail enviados são ignorados.
    await comAcesso(
      http().patch('/v1/eu').send({ tema_preferido: 'claro', nome: 'Outro', email: 'x@y.test' }),
      s,
    );
    expect((await comAcesso(http().get('/v1/eu'), s)).body).toMatchObject({
      email: p.email,
      tema_preferido: 'claro',
    });
  });

  test('TenantContext.executarComoUsuario enxerga só o próprio titular e nenhum dado de condomínio', async () => {
    const a = await usuario();
    await usuario();
    const tenant = app.get(TenantContext);
    const visiveis = await tenant.executarComoUsuario({ usuarioId: a.id }, (tx) =>
      tx.selectFrom('usuario').select('id').execute(),
    );
    expect(visiveis).toEqual([{ id: a.id }]);
    const condominios = await tenant.executarComoUsuario({ usuarioId: a.id }, (tx) =>
      tx.selectFrom('condominio').select('id').execute(),
    );
    expect(condominios).toEqual([]);
  });

  // Só compila se os tipos restringirem: o DB do TenantContext não tem o plano de autenticação.
  test('tipos: o DB do app_user não enxerga sessao, desafio_acesso, controle_login nem senha_hash', () => {
    const _tipos = (tx: Transacao) => {
      // @ts-expect-error sessao não existe no DbApp
      tx.selectFrom('sessao');
      // @ts-expect-error desafio_acesso não existe no DbApp
      tx.selectFrom('desafio_acesso');
      // @ts-expect-error controle_login não existe no DbApp
      tx.selectFrom('controle_login');
      // @ts-expect-error senha_hash não existe em usuario do DbApp
      tx.selectFrom('usuario').select('senha_hash');
    };
    expect(typeof _tipos).toBe('function');
  });
});

describe('limites de tamanho do contrato', () => {
  test('e-mail, senhas, identificador de instalação e lista de aceites acima do máximo dão 400', async () => {
    const longo = (n: number) => 'x'.repeat(n);
    erro(
      await http()
        .post('/v1/acesso/codigo')
        .send({ email: `${longo(250)}@b.test`, finalidade: 'primeiro_acesso' }),
      400,
      'REQUISICAO_INVALIDA',
    );
    erro(
      await http()
        .post('/v1/acesso/entrar')
        .send({ email: 'a@b.test', senha: longo(129), dispositivo: DISPOSITIVO }),
      400,
      'REQUISICAO_INVALIDA',
    );
    erro(
      await http()
        .post('/v1/acesso/entrar')
        .send({
          email: 'a@b.test',
          senha: SENHA,
          dispositivo: { ...DISPOSITIVO, identificador_instalacao: longo(65) },
        }),
      400,
      'REQUISICAO_INVALIDA',
    );
    erro(
      await http()
        .post('/v1/acesso/ativar')
        .send({
          email: 'a@b.test',
          codigo: '123456',
          nova_senha: longo(129),
          dispositivo: DISPOSITIVO,
        }),
      400,
      'REQUISICAO_INVALIDA',
    );
    const s = await sessao(await usuario());
    erro(
      await comAcesso(
        http()
          .post('/v1/eu/senha')
          .send({ senha_atual: SENHA, nova_senha: longo(129) }),
        s,
      ),
      400,
      'REQUISICAO_INVALIDA',
    );
    erro(
      await comAcesso(
        http()
          .post('/v1/acesso/aceites')
          .send({ documento_versao_ids: Array.from({ length: 21 }, () => randomUUID()) }),
        s,
      ),
      400,
      'REQUISICAO_INVALIDA',
    );
  });
});

describe('limite de taxa de /v1/acesso/* (E16)', () => {
  test('por e-mail e por IP, com 429 e Retry-After', async () => {
    const pequeno = await criarApp({ RATE_LIMIT_IP_PER_MIN: '5', RATE_LIMIT_EMAIL_PER_MIN: '3' });
    try {
      const tentar = (email: string) =>
        request(pequeno.getHttpServer())
          .post('/v1/acesso/entrar')
          .send({ email, senha: 'senha-errada-000', dispositivo: DISPOSITIVO });
      const e = `limite${Date.now()}@exemplo.test`;
      for (let i = 0; i < 3; i++) expect((await tentar(e)).status).toBe(401);
      const porEmail = erro(await tentar(e), 429, 'LIMITE_DE_TAXA_EXCEDIDO');
      expect(Number(porEmail.headers['retry-after'])).toBeGreaterThan(0);
      // 4 chamadas já contadas por IP (a 4ª também); a 5ª passa e a 6ª estoura o IP.
      expect((await tentar(`outro1${Date.now()}@exemplo.test`)).status).toBe(401);
      const porIp = erro(
        await tentar(`outro2${Date.now()}@exemplo.test`),
        429,
        'LIMITE_DE_TAXA_EXCEDIDO',
      );
      expect(Number(porIp.headers['retry-after'])).toBeGreaterThan(0);
      // A janela é de 1 minuto.
      avancar(61_000);
      expect((await tentar(`outro3${Date.now()}@exemplo.test`)).status).toBe(401);
    } finally {
      await pequeno.close();
    }
  });
});

describe('privacidade', () => {
  test('o log não traz e-mail, nome, código, senha nem token de nenhuma das chamadas anteriores', () => {
    const log = linhasDeLog.join('\n');
    expect(linhasDeLog.length).toBeGreaterThan(50);
    expect(sensiveis.size).toBeGreaterThan(20);
    for (const s of sensiveis) {
      // Código de 6 dígitos só conta como vazamento isolado: não dentro de UUID, tempo ou hash.
      const achou = /^\d{6}$/.test(s)
        ? new RegExp(String.raw`(?<![\w-])${s}(?![\w-])`).test(log)
        : log.includes(s);
      expect(achou, `log contém dado sensível (${s.length} caracteres)`).toBe(false);
    }
    expect(log).not.toMatch(/Bearer\s/i);
    // Cada requisição loga a rota e o status, sem corpo nem cabeçalho.
    expect(log).toContain('/v1/acesso/entrar');
    expect(log).not.toMatch(/"(corpo|body|authorization|cookie)"\s*:\s*"(?!\[removido\])/i);
  });

  test('falha do e-mail registra só o tipo do erro, sem o destinatário', async () => {
    expect(linhasDeLog.join('\n')).toContain('envio_de_codigo_falhou');
  });
});
