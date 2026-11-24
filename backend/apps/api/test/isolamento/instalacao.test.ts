// Provas (a) instalação limpa por um comando e (g) restauração reprodutível do cenário.
import { readdirSync } from 'node:fs';
import { afterAll, expect, inject, test } from 'vitest';
import { conectar, DIR_MIGRACOES, flyway } from '../../db/scripts/ambiente.js';
import { carregarCenario } from '../../db/seeds/fixtures.js';
import { SEED_MANUAL } from '../../db/seeds/manual.js';
import { amb, BANCO_TESTE, bancoMigrado, inventario, removerBanco } from './apoio.js';

const RESTAURACAO = 'condomifacil_teste_restauracao';
afterAll(() => removerBanco(RESTAURACAO));

test('(a) db:instalar aplica todas as migrations do zero e termina com validate estrito', async () => {
  const { code, out } = inject('instalacao');
  expect(code).toBe(0);
  const versoes = readdirSync(DIR_MIGRACOES)
    .filter((f) => /^V\d+__.+\.sql$/.test(f))
    .map((f) => f.slice(1, f.indexOf('__')))
    .sort();
  expect(versoes.length).toBeGreaterThan(0);
  expect(out).toContain(`Successfully applied ${versoes.length} migrations`);
  expect(out).toContain(`Successfully validated ${versoes.length} migrations`);

  const su = conectar(amb, 'postgres', BANCO_TESTE);
  try {
    const hist = await su<{ version: string; success: boolean; installed_by: string }[]>`
      select version, success, installed_by from infra_migracoes.flyway_schema_history
      where version is not null order by installed_rank`;
    expect(hist.map((h) => h.version)).toEqual(versoes);
    expect(hist.every((h) => h.success && h.installed_by === 'migrador')).toBe(true);
    const tabelas = await su<{ t: string }[]>`select tablename::text as t from pg_tables
      where schemaname = 'condomifacil' order by 1`;
    expect(tabelas.map((t) => t.t)).toEqual([
      'aceite',
      'auditoria',
      'auditoria_plataforma',
      'condominio',
      'controle_login',
      'desafio_acesso',
      'documento',
      'documento_versao',
      'evento_saida',
      'parametro_condominio',
      'parametro_definicao',
      'parametro_padrao',
      'requisicao_idempotente',
      'sessao',
      'usuario',
    ]);
  } finally {
    await su.end();
  }

  // Repetir não reaplica nada.
  const repete = await flyway(amb, ['migrate'], BANCO_TESTE);
  expect(repete.code).toBe(0);
  expect(repete.out).toMatch(/up to date\. No migration necessary/);
});

test('(g) recriar o banco e recarregar o cenário dá o mesmo inventário', async () => {
  const rodada = async () => {
    await bancoMigrado(RESTAURACAO);
    expect(await carregarCenario(amb, SEED_MANUAL, RESTAURACAO)).toBe('carregado');
    return inventario(RESTAURACAO);
  };
  const primeira = await rodada();
  const segunda = await rodada();
  expect(primeira['condomifacil.condominio']).toMatch(/^3:/);
  expect(primeira['condomifacil.parametro_definicao']).toMatch(/^36:/);
  expect(primeira['condomifacil.parametro_padrao']).toMatch(/^35:/);
  expect(primeira['condomifacil.documento']).toMatch(/^3:/);
  expect(primeira['condomifacil.documento_versao']).toMatch(/^3:/);
  expect(segunda).toEqual(primeira);
  console.log('inventário restaurado:', primeira);
});
