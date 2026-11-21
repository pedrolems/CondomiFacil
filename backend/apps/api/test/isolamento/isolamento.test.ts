// Prova (e): harness de isolamento com dois condomínios, como app_user, pool de 1 conexão.
// Contexto só por set_config('app.condominio_id', id, true) dentro da transação (ADR-001, P3).
import type { Sql } from 'postgres';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { conectar } from '../../db/scripts/ambiente.js';
import { carregarCenario, condominio } from '../../db/seeds/fixtures.js';
import { amb, BANCO_TESTE } from './apoio.js';

const CENARIO = 'isolamento-dois-condominios';
const A = condominio(CENARIO, 'a', { nome: 'Condomínio Isolamento A (fictício)' });
const B = condominio(CENARIO, 'b', { nome: 'Condomínio Isolamento B (fictício)' });
const app = conectar(amb, 'app_user', BANCO_TESTE, 1); // pool de 1: toda consulta reusa a mesma conexão

beforeAll(async () => {
  expect(['carregado', 'ja-pronto']).toContain(
    await carregarCenario(amb, { cenario: CENARIO, condominios: [A, B] }),
  );
});
afterAll(() => app.end());

const idsVisiveis = async (q: Sql) =>
  (await q<{ id: string }[]>`select id from condomifacil.condominio order by id`).map((r) => r.id);

const comContexto = (id: string, fn: (tx: Sql) => Promise<unknown>) =>
  app.begin(async (tx) => {
    await tx`select set_config('app.condominio_id', ${id}, true)`;
    return fn(tx as unknown as Sql);
  });

/** Detector de vazamento: fora de transação com contexto, a conexão não pode ver tenant algum. */
const contextoVazou = async () => {
  const [r] = await app<
    [{ ctx: string | null }]
  >`select current_setting('app.condominio_id', true) as ctx`;
  return (r.ctx ?? '') !== '' || (await idsVisiveis(app)).length > 0;
};

test('com contexto A vê só A; com contexto B vê só B; consulta direta ao outro tenant devolve zero', async () => {
  expect(await comContexto(A.id, idsVisiveis)).toEqual([A.id]);
  expect(await comContexto(B.id, idsVisiveis)).toEqual([B.id]);
  const cruzado = await comContexto(
    A.id,
    (tx) => tx`select id from condomifacil.condominio where id = ${B.id}`,
  );
  expect(cruzado).toHaveLength(0);
});

test('sem contexto vê zero linhas (falha fechada), inclusive com contexto vazio', async () => {
  expect(await idsVisiveis(app)).toEqual([]);
  expect(await comContexto('', idsVisiveis)).toEqual([]);
});

test('contexto local não vaza para a próxima transação na mesma conexão', async () => {
  const pids = new Set<number>();
  await comContexto(A.id, async (tx) =>
    pids.add((await tx<[{ p: number }]>`select pg_backend_pid() as p`)[0].p),
  );
  pids.add((await app<[{ p: number }]>`select pg_backend_pid() as p`)[0].p);
  expect(pids.size).toBe(1); // mesma conexão física
  expect(await contextoVazou()).toBe(false);
  expect(await app.begin((tx) => idsVisiveis(tx as unknown as Sql))).toEqual([]);
});

test('contexto local não vaza depois de erro e rollback', async () => {
  await expect(
    comContexto(A.id, async (tx) => {
      expect(await idsVisiveis(tx)).toEqual([A.id]);
      await tx`select 1 / 0`;
    }),
  ).rejects.toMatchObject({ code: '22012' });
  expect(await contextoVazou()).toBe(false);
  expect(await comContexto(B.id, idsVisiveis)).toEqual([B.id]);
});

test('controle negativo: set_config de sessão (false) vaza e o detector acusa', async () => {
  try {
    await app`select set_config('app.condominio_id', ${A.id}, false)`;
    expect(await contextoVazou()).toBe(true);
    expect(await idsVisiveis(app)).toEqual([A.id]);
  } finally {
    await app`select set_config('app.condominio_id', '', false)`;
  }
  expect(await contextoVazou()).toBe(false);
});

test('catálogos globais são legíveis com ou sem contexto; app_user não escreve neles', async () => {
  await expect(app`select count(*) from condomifacil.parametro_definicao`).resolves.toBeDefined();
  await expect(
    app`insert into condomifacil.parametro_definicao (id, chave, tipo, niveis_permitidos, regra_id, descricao)
      values (gen_random_uuid(), 'x', 'inteiro', '{plataforma}', 'RN', 'x')`,
  ).rejects.toMatchObject({ code: '42501' });
});
