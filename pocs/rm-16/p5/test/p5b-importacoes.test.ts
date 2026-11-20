// Autoteste da verificação estática: ela pega o que deve pegar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { violacoesEm } from '../scripts/verificar-importacoes.mjs';

test('verificação estática: driver fora da camada de acesso e segunda cadeia de migrations são apontados', () => {
  assert.deepEqual(violacoesEm('src/acesso-kysely.ts', "import pg from 'pg';"), []);
  assert.deepEqual(violacoesEm('src/guarda.ts', "import postgres from 'postgres';"), []);
  assert.equal(violacoesEm('src/modulos/reservas/servico.ts', "import pg from 'pg';").length, 1);
  assert.equal(violacoesEm('src/servico.ts', "import { drizzle } from 'drizzle-orm/postgres-js';").length, 1);
  assert.equal(violacoesEm('src/acesso-drizzle.ts', "import { migrate } from 'drizzle-orm/node-postgres/migrator';").length, 1);
  assert.equal(violacoesEm('src/x.ts', "import { defineConfig } from 'drizzle-kit';").length, 1);
  assert.equal(violacoesEm('src/x.ts', "import { Migrator, FileMigrationProvider } from 'kysely';").length, 1);
  assert.deepEqual(violacoesEm('src/repositorios.ts', "import { sql } from 'kysely';\nimport { eq } from 'drizzle-orm';"), []);
});
