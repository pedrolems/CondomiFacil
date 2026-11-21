// Prova (f): a carga de fixtures é recusada fora de banco descartável e com namespace repetido.
import { afterAll, expect, test } from 'vitest';
import { conectar } from '../../db/scripts/ambiente.js';
import { carregarCenario, condominio, type Manifesto } from '../../db/seeds/fixtures.js';
import { amb, bancoMigrado, removerBanco } from './apoio.js';

const SEM_MARCADOR = 'condomifacil_teste_sem_marcador';
const MARCADO = 'condomifacil_teste_fixtures';
afterAll(async () => {
  await removerBanco(SEM_MARCADOR);
  await removerBanco(MARCADO);
});

const manifesto = (nome: string): Manifesto => ({
  cenario: 'fixtures-namespace',
  condominios: [condominio('fixtures-namespace', 'unico', { nome })],
});

const contar = async (banco: string) => {
  const su = conectar(amb, 'postgres', banco);
  try {
    return (await su<[{ n: number }]>`select count(*)::int as n from condomifacil.condominio`)[0].n;
  } finally {
    await su.end();
  }
};

test('host fora da lista de descartáveis: recusada antes de conectar (não depende de NODE_ENV)', async () => {
  for (const host of ['db.exemplo.supabase.co', '10.0.0.5', 'staging-db']) {
    await expect(carregarCenario({ ...amb, host }, manifesto('X'))).rejects.toThrow(
      /não é banco descartável/,
    );
  }
});

test('banco sem marcador de descartável: recusada antes de qualquer DML', async () => {
  await bancoMigrado(SEM_MARCADOR, { marcar: false });
  await expect(carregarCenario(amb, manifesto('X'), SEM_MARCADOR)).rejects.toThrow(
    /não está marcado como descartável/,
  );
  expect(await contar(SEM_MARCADOR)).toBe(0);
});

test('namespace repetido: mesmo manifesto em estado inicial só informa "já pronto"; outro manifesto ou estado alterado é recusado', async () => {
  await bancoMigrado(MARCADO);
  expect(await carregarCenario(amb, manifesto('Original'), MARCADO)).toBe('carregado');
  expect(await carregarCenario(amb, manifesto('Original'), MARCADO)).toBe('ja-pronto');
  await expect(carregarCenario(amb, manifesto('Outro nome'), MARCADO)).rejects.toThrow(/já existe/);

  const su = conectar(amb, 'postgres', MARCADO);
  try {
    await su`update condomifacil.condominio set nome = 'Alterado'`;
  } finally {
    await su.end();
  }
  await expect(carregarCenario(amb, manifesto('Original'), MARCADO)).rejects.toThrow(
    /estado alterado/,
  );
  expect(await contar(MARCADO)).toBe(1);
});
