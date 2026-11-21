// Prova (b): validate estrito recusa migration alterada, removida (inclusive a última) e fora de
// ordem. Usa um banco e uma cópia temporária das migrations; as reais não são tocadas.
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { DIR_MIGRACOES, flyway } from '../../db/scripts/ambiente.js';
import { amb, bancoMigrado, removerBanco } from './apoio.js';

const BANCO = 'condomifacil_teste_flyway';
const copia = mkdtempSync(path.join(os.tmpdir(), 'condomifacil-flyway-'));
const arquivos = readdirSync(DIR_MIGRACOES)
  .filter((f) => f.endsWith('.sql'))
  .sort();
const primeira = arquivos[0]!;
const ultima = arquivos.at(-1)!;
const validar = () => flyway(amb, ['validate'], BANCO, copia);

beforeAll(async () => {
  cpSync(DIR_MIGRACOES, copia, { recursive: true });
  await bancoMigrado(BANCO);
  const ok = await validar();
  expect(ok.code, ok.out).toBe(0);
});
afterAll(async () => {
  rmSync(copia, { recursive: true, force: true });
  await removerBanco(BANCO);
});

test('migration aplicada e alterada: validate e migrate recusam (checksum)', async () => {
  const alvo = path.join(copia, primeira);
  const original = readFileSync(alvo, 'utf8');
  writeFileSync(alvo, `${original}\n-- alteração depois de aplicada\n`);
  try {
    const v = await validar();
    expect(v.code).not.toBe(0);
    expect(v.out).toMatch(/checksum mismatch/i);
    const m = await flyway(amb, ['migrate'], BANCO, copia);
    expect(m.code).not.toBe(0);
  } finally {
    writeFileSync(alvo, original);
  }
});

test.each([
  ['a última aplicada', ultima],
  ['uma do meio/início', primeira],
])('migration aplicada removida (%s): validate recusa', async (_rotulo, arquivo) => {
  const alvo = path.join(copia, arquivo);
  const conteudo = readFileSync(alvo);
  rmSync(alvo);
  try {
    const v = await validar();
    expect(v.code, v.out).not.toBe(0);
    expect(v.out).toMatch(/not resolved locally/i);
    if (arquivo === ultima) {
      // Controle: o padrão do Flyway (*:future) aceitaria; quem recusa é o flyway.conf estrito.
      const padrao = await flyway(
        amb,
        ['-ignoreMigrationPatterns=*:future', 'validate'],
        BANCO,
        copia,
      );
      expect(padrao.code, padrao.out).toBe(0);
    }
  } finally {
    writeFileSync(alvo, conteudo);
  }
});

test('migration nova com versão anterior à última aplicada (fora de ordem): validate e migrate recusam', async () => {
  const alvo = path.join(copia, 'V202611200001__fora_de_ordem.sql');
  writeFileSync(alvo, 'select 1;\n');
  try {
    const v = await validar();
    expect(v.code).not.toBe(0);
    expect(v.out).toMatch(/202611200001/);
    const m = await flyway(amb, ['migrate'], BANCO, copia);
    expect(m.code).not.toBe(0);
  } finally {
    rmSync(alvo);
  }
});

test('controle: com a cópia íntegra o validate volta a passar', async () => {
  const v = await validar();
  expect(v.code, v.out).toBe(0);
});
