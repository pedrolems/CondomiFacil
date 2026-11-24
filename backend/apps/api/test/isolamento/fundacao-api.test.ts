// RM-24, critérios 2, 3, 4 e 6: guarda do TenantContext, idempotência, atomicidade ato+auditoria+evento
// e ausência de dado pessoal no log. Tudo pelo app_user real; o superusuário só conta linhas.
import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  Res,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validarComum } from '@condomifacil/shared-types';
import type { Response } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { carregarCenario, condominio } from '../../db/seeds/fixtures.js';
import { ApiModule, configurarApp } from '../../src/api.module.js';
import { lerConfig } from '../../src/compartilhado/config/config.js';
import { Idempotencia } from '../../src/compartilhado/idempotencia/index.js';
import { LoggerJson } from '../../src/compartilhado/logger/index.js';
import { registrarEvento } from '../../src/compartilhado/outbox/index.js';
import { EscopoSistema } from '../../src/compartilhado/tenant/escopo-sistema.js';
import {
  ForaDoTenantContext,
  sql,
  TenantContext,
  TenantModule,
} from '../../src/compartilhado/tenant/index.js';
import { AuditoriaModule, AuditoriaServico } from '../../src/modulos/auditoria/index.js';
import { criarBanco } from '../../src/compartilhado/tenant/banco.js';
import { amb } from './apoio.js';
import { opcoesApp, observador } from './apoio-api.js';

const CENARIO = 'fundacao-api-dois-condominios';
const A = condominio(CENARIO, 'a', { nome: 'Condomínio Fundação A (fictício)' });
const B = condominio(CENARIO, 'b', { nome: 'Condomínio Fundação B (fictício)' });
const USUARIO = '00000000-0000-5000-8000-0000000000bb';
const EMAIL = 'fulana.ficticia@exemplo.test';
const NOME = 'Fulana Ficticia da Silva';

// Só de teste, montado aqui e não no ApiModule: o ato grava auditoria e evento (não há tabela de
// negócio ainda), sob Idempotency-Key opcional.
@Controller('v1/teste-fundacao')
class AtoController {
  constructor(
    @Inject(Idempotencia) private readonly idem: Idempotencia,
    @Inject(AuditoriaServico) private readonly auditoria: AuditoriaServico,
  ) {}

  @Post('atos')
  async criar(
    @Headers('x-condominio-id') condominioId: string,
    @Headers('idempotency-key') chave: string | undefined,
    @Body() corpo: { ref: string; email: string; nome: string; demora?: boolean; falhar?: boolean },
    @Res({ passthrough: true }) res: Response,
  ) {
    const r = await this.idem.executar(
      { condominioId, usuarioId: USUARIO },
      { chave, metodo: 'POST', rota: '/v1/teste-fundacao/atos', corpo },
      async (tx) => {
        await this.auditoria.registrar(tx, {
          condominioId,
          ator: { usuarioId: USUARIO },
          papelEfetivo: 'sindico',
          acao: 'teste.ato',
          entidadeTipo: 'teste',
          entidadeReferencia: corpo.ref,
          depois: { email: corpo.email, nome: corpo.nome, estado: 'criado' },
          correlacaoOperacao: corpo.ref,
        });
        await registrarEvento(tx, {
          condominioId,
          tipo: 'teste.criado',
          entidadeReferencia: corpo.ref,
          carga: { ref: corpo.ref },
        });
        if (corpo.demora) await sql`select pg_sleep(0.4)`.execute(tx);
        if (corpo.falhar)
          throw new Error(`falha depois do ato para ${corpo.email} (${corpo.nome})`);
        return { status: 201, corpo: { ref: corpo.ref } };
      },
    );
    res.status(r.status);
    return r.corpo;
  }
}

const linhasDeLog: string[] = [];
const enviadasAoServidor: string[] = [];
let app: INestApplication;
let obs: ReturnType<typeof observador>;

beforeAll(async () => {
  expect(['carregado', 'ja-pronto']).toContain(
    await carregarCenario(amb, { cenario: CENARIO, condominios: [A, B] }),
  );
  obs = observador();
  const mod = await Test.createTestingModule({
    imports: [TenantModule.registrar(opcoesApp()), AuditoriaModule],
    controllers: [AtoController],
    providers: [Idempotencia],
  }).compile();
  app = mod.createNestApplication();
  configurarApp(
    app,
    lerConfig({ APP_ENV: 'dev', PORT: '3000' }),
    new LoggerJson((l) => linhasDeLog.push(l)),
  );
  await app.init();
});
afterAll(async () => {
  await app.close();
  // Eventos pendentes de teste não podem poluir outros arquivos (o escopo sistema enxerga todos).
  await obs`delete from condomifacil.evento_saida where condominio_id in (${A.id}, ${B.id})`;
  await obs.end();
});

const contar = async (ref: string) => {
  const [r] = await obs<[{ aud: number; evt: number }]>`
    select (select count(*)::int from condomifacil.auditoria where correlacao_operacao = ${ref}) as aud,
           (select count(*)::int from condomifacil.evento_saida where entidade_referencia = ${ref}) as evt`;
  return r;
};
const guardas = async (chave: string) =>
  (
    await obs<
      [{ n: number }]
    >`select count(*)::int as n from condomifacil.requisicao_idempotente where chave = ${chave}`
  )[0].n;

const post = (corpo: object, chave?: string) => {
  const req = request(app.getHttpServer())
    .post('/v1/teste-fundacao/atos')
    .set('X-Condominio-Id', A.id);
  return (chave ? req.set('Idempotency-Key', chave) : req).send({
    email: EMAIL,
    nome: NOME,
    ...corpo,
  });
};

test('mesma chave e mesmo corpo devolvem a resposta original e o efeito ocorre uma vez', async () => {
  const ref = randomUUID();
  const chave = randomUUID();
  const a = await post({ ref }, chave);
  const b = await post({ ref }, chave);
  expect([a.status, b.status]).toEqual([201, 201]);
  expect(b.body).toEqual(a.body);
  expect(await contar(ref)).toEqual({ aud: 1, evt: 1 });
  expect(await guardas(chave)).toBe(1);
});

test('mesma chave com corpo diferente dá 422 CHAVE_DE_IDEMPOTENCIA_REUTILIZADA e não repete o efeito', async () => {
  const ref = randomUUID();
  const chave = randomUUID();
  await post({ ref }, chave);
  const outra = randomUUID();
  const r = await post({ ref: outra }, chave);
  expect(r.status).toBe(422);
  expect(r.body.codigo).toBe('CHAVE_DE_IDEMPOTENCIA_REUTILIZADA');
  expect(validarComum('Erro', r.body)).toEqual({ valido: true });
  expect(await contar(outra)).toEqual({ aud: 0, evt: 0 });
});

test('sem a chave não há guarda: dois envios produzem dois efeitos', async () => {
  const ref = randomUUID();
  await post({ ref });
  await post({ ref });
  expect(await contar(ref)).toEqual({ aud: 2, evt: 2 });
});

test('duas requisições simultâneas com a mesma chave, em conexões independentes, produzem um único efeito', async () => {
  const ref = randomUUID();
  const chave = randomUUID();
  const [a, b] = await Promise.all([
    post({ ref, demora: true }, chave),
    post({ ref, demora: true }, chave),
  ]);
  expect([a.status, b.status]).toEqual([201, 201]);
  expect(b.body).toEqual(a.body);
  expect(await contar(ref)).toEqual({ aud: 1, evt: 1 });
  expect(await guardas(chave)).toBe(1);
});

test('chave expirada é aceita de novo e renova a guarda por 24 h', async () => {
  const chave = randomUUID();
  const ref = randomUUID();
  const app_ = criarBanco(opcoesApp());
  try {
    // Linha expirada nasce pelo próprio app_user (o INSERT aceita informar criada_em e expira_em).
    await new TenantContext(app_).executar({ condominioId: A.id }, (tx) =>
      sql`insert into condomifacil.requisicao_idempotente
          (condominio_id, usuario_id, chave, metodo, rota, hash_corpo, status_http, criada_em, expira_em)
          values (${A.id}, ${USUARIO}, ${chave}, 'POST', '/v1/teste-fundacao/atos', 'antigo', 201,
                  now() - interval '25 hours', now() - interval '1 hour')`.execute(tx),
    );
  } finally {
    await app_.encerrar();
  }
  expect((await post({ ref }, chave)).status).toBe(201);
  expect(await contar(ref)).toEqual({ aud: 1, evt: 1 });
  const [g] = await obs<[{ horas: number }]>`
    select extract(epoch from expira_em - criada_em)::int / 3600 as horas
    from condomifacil.requisicao_idempotente where chave = ${chave}`;
  expect(g.horas).toBe(24);
  expect((await post({ ref }, chave)).status).toBe(201); // agora é repetição
  expect(await contar(ref)).toEqual({ aud: 1, evt: 1 });
});

test('falha depois do ato desfaz juntos o ato, a auditoria, o evento e a guarda', async () => {
  const ref = randomUUID();
  const chave = randomUUID();
  const r = await post({ ref, falhar: true }, chave);
  expect(r.status).toBe(500);
  expect(r.body.codigo).toBe('ERRO_INTERNO');
  expect(JSON.stringify(r.body)).not.toContain(EMAIL);
  expect(await contar(ref)).toEqual({ aud: 0, evt: 0 });
  expect(await guardas(chave)).toBe(0);
  // A chave não ficou "queimada": o mesmo pedido, agora sem falha, executa.
  expect((await post({ ref }, chave)).status).toBe(201);
  expect(await contar(ref)).toEqual({ aud: 1, evt: 1 });
});

test('auditoria nasce com o horário do banco e sem dado pessoal em depois_sanitizado', async () => {
  const ref = randomUUID();
  await post({ ref });
  const [l] = await obs<[{ depois: Record<string, unknown>; texto: string; recente: boolean }]>`
    select depois_sanitizado as depois, depois_sanitizado::text as texto,
           registrada_em > now() - interval '1 minute' as recente
    from condomifacil.auditoria where correlacao_operacao = ${ref}`;
  expect(l.recente).toBe(true);
  expect(l.depois.estado).toBe('criado');
  expect(l.texto).not.toMatch(/fulana|Ficticia/i);
});

test('escopo plataforma só insere em auditoria_plataforma; o tenant não consegue', async () => {
  const banco = criarBanco(opcoesApp());
  const tenant = new TenantContext(banco);
  const aud = new AuditoriaServico();
  const entrada = {
    atorUsuarioId: USUARIO,
    acao: 'teste.plataforma',
    entidadeTipo: 'teste',
    entidadeReferencia: randomUUID(),
  };
  try {
    await tenant.executarComoPlataforma({ usuarioId: USUARIO }, (tx) =>
      aud.registrarPlataforma(tx, entrada),
    );
    await expect(
      tenant.executar({ condominioId: A.id }, (tx) => aud.registrarPlataforma(tx, entrada)),
    ).rejects.toMatchObject({ code: '42501' });
    const [c] = await tenant.executar({ condominioId: A.id }, async (tx) => {
      const r = await sql<{ cond: string | null; esc: string | null }>`
        select condomifacil.condominio_atual()::text as cond, condomifacil.escopo_atual() as esc`.execute(
        tx,
      );
      return r.rows;
    });
    expect(c).toEqual({ cond: A.id, esc: null });
  } finally {
    await banco.encerrar();
  }
  const [n] = await obs<[{ n: number }]>`
    select count(*)::int as n from condomifacil.auditoria_plataforma where entidade_referencia = ${entrada.entidadeReferencia}`;
  expect(n.n).toBe(1);
});

test('consulta fora do TenantContext é recusada antes de chegar ao servidor', async () => {
  const banco = criarBanco(opcoesApp((t) => enviadasAoServidor.push(t)));
  try {
    await expect(banco.db.selectFrom('condominio').selectAll().execute()).rejects.toThrow(
      /fora do TenantContext/,
    );
    await expect(banco.db.selectFrom('evento_saida').selectAll().execute()).rejects.toBeInstanceOf(
      ForaDoTenantContext,
    );
    expect(banco.violacoes()).toHaveLength(2);
    expect(enviadasAoServidor).toHaveLength(0);
    // Controle: dentro do contexto, o mesmo contador enxerga as consultas que chegam ao servidor.
    await new TenantContext(banco).executar({ condominioId: A.id }, (tx) =>
      tx.selectFrom('condominio').select('id').execute(),
    );
    expect(enviadasAoServidor.length).toBeGreaterThan(0);
  } finally {
    await banco.encerrar();
  }
});

test('o escopo sistema não é alcançável pela API (ApiModule real e módulo com tenant)', async () => {
  const real = await Test.createTestingModule({ imports: [ApiModule] }).compile();
  expect(() => real.get(EscopoSistema, { strict: false })).toThrow();
  expect(() => app.get(EscopoSistema, { strict: false })).toThrow();
});

test('o log capturado não contém e-mail nem nome usados como entrada', () => {
  const log = linhasDeLog.join('\n');
  expect(log).toContain('"evento":"requisicao"');
  expect(log).toContain('erro_interno');
  expect(log).not.toContain(EMAIL);
  expect(log).not.toContain('Ficticia');
  expect(log).not.toContain('exemplo.test');
});
