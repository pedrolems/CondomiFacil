// Preparação global dos testes de banco: roda o mesmo comando documentado da instalação limpa
// (db:instalar = tsx db/scripts/instalar.ts) apontando para o banco condomifacil_teste.
import { createRequire } from 'node:module';
import path from 'node:path';
import type { TestProject } from 'vitest/node';
import { DIR_DB, rodar } from '../../db/scripts/ambiente.js';

declare module 'vitest' {
  export interface ProvidedContext {
    instalacao: { code: number | null; out: string };
  }
}

export default async function preparar(projeto: TestProject): Promise<void> {
  const tsx = createRequire(import.meta.url).resolve('tsx/cli');
  const r = await rodar(process.execPath, [tsx, path.join(DIR_DB, 'scripts', 'instalar.ts')], {
    ...process.env,
    DB_NOME: 'condomifacil_teste',
  });
  if (r.code !== 0) throw new Error(`db:instalar falhou:\n${r.out}`);
  projeto.provide('instalacao', r);
}
