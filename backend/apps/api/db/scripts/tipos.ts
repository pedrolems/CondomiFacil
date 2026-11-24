// Regenera os tipos do Kysely a partir do banco já migrado (E18): "pnpm db:tipos".
// Só introspecção, como app_user (vê apenas o que o aplicativo pode acessar). A senha vai por
// variável de ambiente (env(...) do kysely-codegen), nunca na linha de comando.
import { createRequire } from 'node:module';
import path from 'node:path';
import { carregarAmbiente, DIR_DB, rodar, senha } from './ambiente.js';

const amb = carregarAmbiente();
const req = createRequire(import.meta.url);
const saida = path.join(DIR_DB, '..', 'src', 'compartilhado', 'tenant', 'gerado', 'tipos-banco.ts');
const url = `postgres://app_user:${encodeURIComponent(senha('app_user'))}@${amb.host}:${amb.porta}/${amb.banco}`;

const gerar = await rodar(
  process.execPath,
  [
    req.resolve('kysely-codegen/dist/cli/bin.js'),
    '--dialect=postgres',
    '--url=env(DATABASE_URL)',
    '--default-schema=condomifacil',
    '--include-pattern=condomifacil.*',
    `--out-file=${saida}`,
  ],
  { ...process.env, DATABASE_URL: url },
);
if (gerar.code !== 0) throw new Error(`kysely-codegen falhou:\n${gerar.out}`);

// Mesma formatação do repositório, para o arquivo gerado passar no format:check e ser estável.
const prettier = path.join(
  DIR_DB,
  '..',
  '..',
  '..',
  '..',
  'node_modules',
  'prettier',
  'bin',
  'prettier.cjs',
);
const fmt = await rodar(process.execPath, [prettier, '--write', saida]);
if (fmt.code !== 0) throw new Error(`prettier falhou:\n${fmt.out}`);
console.log('Tipos do banco gerados em src/compartilhado/tenant/gerado/tipos-banco.ts');
