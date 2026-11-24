// Critérios 4 e 5 do RM-24 (parte estática): o lint barra o driver fora do tenant e o escopo
// sistema fora do worker. Roda o ESLint do repositório sobre arquivos de controle.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ESLint } from 'eslint';
import { expect, test } from 'vitest';

const RAIZ = path.resolve(import.meta.dirname, '../../../..');
const SRC = path.join(RAIZ, 'backend/apps/api/src');
const eslint = new ESLint({ cwd: RAIZ });

const regras = async (arquivo: string, codigo: string) =>
  (await eslint.lintText(codigo, { filePath: path.join(SRC, arquivo) }))[0]!.messages
    .filter((m) => m.ruleId === 'no-restricted-imports')
    .map((m) => m.message);

test('driver e Kysely em tempo de execução são barrados fora de compartilhado/tenant', async () => {
  for (const origem of ['postgres', 'pg', 'kysely', 'kysely-postgres-js']) {
    const msgs = await regras(
      'modulos/auditoria/infra/controle.ts',
      `import x from '${origem}';\nexport { x };\n`,
    );
    expect(msgs, origem).toHaveLength(1);
  }
});

test('import de tipo do Kysely e o próprio tenant são permitidos', async () => {
  expect(
    await regras(
      'modulos/auditoria/infra/controle.ts',
      "import type { Selectable } from 'kysely';\nexport type T = Selectable<{ a: 1 }>;\n",
    ),
  ).toHaveLength(0);
  expect(
    await regras(
      'compartilhado/tenant/controle.ts',
      "import postgres from 'postgres';\nexport { postgres };\n",
    ),
  ).toHaveLength(0);
});

test('escopo sistema e despachante só entram no worker', async () => {
  const codigo =
    "import { EscopoSistema } from '../../compartilhado/tenant/escopo-sistema.js';\nexport { EscopoSistema };\n";
  expect(await regras('interfaces/http/morador/controle.ts', codigo)).toHaveLength(1);
  const despachante =
    "import { Despachante } from '../compartilhado/outbox/despachante.js';\nexport { Despachante };\n";
  expect(
    await regras(
      'modulos/auditoria/controle.ts',
      despachante.replace('../compartilhado', '../../compartilhado'),
    ),
  ).toHaveLength(1);
  expect(await regras('worker.module.ts', despachante)).toHaveLength(0);
});

test('internos do tenant (transacao, banco, guarda, gerado) só pelo index fora da pasta', async () => {
  for (const interno of ['transacao', 'banco', 'guarda', 'gerado/tipos-banco']) {
    const codigo = `import * as x from '../../../compartilhado/tenant/${interno}.js';\nexport { x };\n`;
    expect(await regras('interfaces/http/morador/controle.ts', codigo), interno).toHaveLength(1);
    expect(
      await regras('worker.module.ts', codigo.replace('../../../', '../')),
      interno,
    ).toHaveLength(1);
  }
  expect(
    await regras(
      'interfaces/http/morador/controle.ts',
      "import { TenantContext } from '../../../compartilhado/tenant/index.js';\nexport { TenantContext };\n",
    ),
  ).toHaveLength(0);
});

test('ExecutorDeAutenticacao não sai pelo index do tenant e só o módulo autenticacao o importa', async () => {
  const tenant = await import('../src/compartilhado/tenant/index.js');
  expect(tenant).not.toHaveProperty('ExecutorDeAutenticacao');
  const donos = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.replaceAll(path.sep, '/'))
    .filter((f) => /tenant\/autenticacao\.js/.test(readFileSync(path.join(SRC, f), 'utf8')));
  expect(donos.every((f) => f.startsWith('modulos/autenticacao/'))).toBe(true);
  expect(donos.length).toBeGreaterThan(0);
}, 60_000);
