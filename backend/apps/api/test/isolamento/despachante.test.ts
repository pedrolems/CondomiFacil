// RM-24, critério 5: despachante do outbox (E13) com eventos de dois condomínios, caixa de saída falsa
// (E14) e escopo sistema só para descobrir pendências. Tudo pelo app_user real.
import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { carregarCenario, condominio } from '../../db/seeds/fixtures.js';
import { Despachante } from '../../src/compartilhado/outbox/despachante.js';
import { LoggerJson } from '../../src/compartilhado/logger/index.js';
import {
  MANIPULADORES_DE_EVENTO,
  registrarEvento,
  type ManipuladorDeEvento,
} from '../../src/compartilhado/outbox/index.js';
import { EscopoSistema, SistemaModule } from '../../src/compartilhado/tenant/escopo-sistema.js';
import { TenantContext, TenantModule } from '../../src/compartilhado/tenant/index.js';
import { CaixaDeSaidaFalsa } from '../../src/integracoes/email/caixa-de-saida-falsa.mailer.js';
import { amb } from './apoio.js';
import { observador, opcoesApp } from './apoio-api.js';

const CENARIO = 'despachante-dois-condominios';
const A = condominio(CENARIO, 'a', { nome: 'Condomínio Despacho A (fictício)' });
const B = condominio(CENARIO, 'b', { nome: 'Condomínio Despacho B (fictício)' });
const EMAIL = 'ciclana.ficticia@exemplo.test';

const caixa = new CaixaDeSaidaFalsa();
const linhasDeLog: string[] = [];
// Strategy por tipo: um que entrega à caixa falsa e outro que sempre falha.
const manipuladores: ManipuladorDeEvento[] = [
  {
    tipo: 'teste.criado',
    tratar: (e) =>
      caixa.enviar({ para: 'caixa@teste.invalid', assunto: e.entidade_referencia, texto: 'oi' }),
  },
  {
    tipo: 'teste.falha',
    tratar: () => Promise.reject(new Error(`falhou para ${EMAIL}`)),
  },
];

let despachante: Despachante;
let tenant: TenantContext;
let sistema: EscopoSistema;
let obs: ReturnType<typeof observador>;
const refs = { a: randomUUID(), b: randomUUID(), falha: randomUUID() };

beforeAll(async () => {
  expect(['carregado', 'ja-pronto']).toContain(
    await carregarCenario(amb, { cenario: CENARIO, condominios: [A, B] }),
  );
  obs = observador();
  const mod = await Test.createTestingModule({
    imports: [TenantModule.registrar(opcoesApp()), SistemaModule],
    providers: [
      Despachante,
      { provide: LoggerJson, useValue: new LoggerJson((l) => linhasDeLog.push(l)) },
      { provide: MANIPULADORES_DE_EVENTO, useValue: manipuladores },
    ],
  }).compile();
  await mod.init();
  despachante = mod.get(Despachante);
  tenant = mod.get(TenantContext);
  sistema = mod.get(EscopoSistema);
  const novo = (condominioId: string, tipo: string, ref: string) =>
    tenant.executar({ condominioId }, (tx) =>
      registrarEvento(tx, { condominioId, tipo, entidadeReferencia: ref, carga: { ref } }),
    );
  await novo(A.id, 'teste.criado', refs.a);
  await novo(B.id, 'teste.criado', refs.b);
  await novo(A.id, 'teste.falha', refs.falha);
});
afterAll(async () => {
  await obs`delete from condomifacil.evento_saida where condominio_id in (${A.id}, ${B.id})`;
  await obs.end();
});

const estado = async (ref: string) =>
  (
    await obs<[{ publicado: boolean; tentativas: number; erro: string | null }]>`
      select publicado_em is not null as publicado, tentativas, ultimo_erro_sanitizado as erro
      from condomifacil.evento_saida where entidade_referencia = ${ref}`
  )[0];
const entregues = (ref: string) => caixa.enviados.filter((m) => m.assunto === ref).length;

test('o escopo sistema enxerga pendentes de todos os condomínios, mas não consegue alterá-los', async () => {
  const vistos = await sistema.executar((tx) =>
    tx.selectFrom('evento_saida').select(['condominio_id', 'entidade_referencia']).execute(),
  );
  const refsVistas = vistos.map((v) => v.entidade_referencia);
  expect(refsVistas).toEqual(expect.arrayContaining([refs.a, refs.b]));
  expect(new Set(vistos.map((v) => v.condominio_id))).toEqual(new Set([A.id, B.id]));
  const r = await sistema.executar((tx) =>
    tx
      .updateTable('evento_saida')
      .set({ tentativas: 9 })
      .where('entidade_referencia', '=', refs.a)
      .executeTakeFirst(),
  );
  expect(r.numUpdatedRows).toBe(0n);
  expect((await estado(refs.a)).tentativas).toBe(0);
});

test('entrega o evento dos dois condomínios à caixa falsa e marca publicado_em; falha incrementa tentativas', async () => {
  const publicados = await despachante.executarUmaVez();
  expect(publicados).toBeGreaterThanOrEqual(2);
  for (const ref of [refs.a, refs.b]) {
    expect(entregues(ref)).toBe(1);
    expect((await estado(ref)).publicado).toBe(true);
  }
  const f = await estado(refs.falha);
  expect(f).toMatchObject({ publicado: false, tentativas: 1 });
  expect(f.erro).toBe('Error');
  expect(f.erro).not.toContain(EMAIL);
  expect(linhasDeLog.join('\n')).not.toContain(EMAIL);
});

test('uma segunda execução não reenvia o que já foi publicado e tenta de novo só o que falhou', async () => {
  await despachante.executarUmaVez();
  expect(entregues(refs.a)).toBe(1);
  expect(entregues(refs.b)).toBe(1);
  expect((await estado(refs.falha)).tentativas).toBe(2);
});

test('no limite de tentativas registra o log sem carga e o condomínio some da descoberta', async () => {
  for (let i = 0; i < 8; i++) await despachante.executarUmaVez(); // chega a 10 tentativas
  expect((await estado(refs.falha)).tentativas).toBe(10);
  const limite = linhasDeLog.filter((l) => l.includes('evento_limite_de_tentativas'));
  expect(limite).toHaveLength(1);
  expect(limite[0]).not.toContain('carga');
  await despachante.executarUmaVez();
  expect((await estado(refs.falha)).tentativas).toBe(10);
});
