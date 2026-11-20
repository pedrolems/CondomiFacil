// Verificação estática (protótipo da regra de lint do ADR-001 item 4 / ADR-008, riscos):
// - só src/guarda.ts e src/acesso-*.ts importam drivers (pg, postgres) e os adaptadores das bibliotecas;
// - ninguém importa drizzle-kit nem o migrator do Kysely/Drizzle (uma só cadeia de migrations: Flyway).
// Na fase 2, virar regra no-restricted-imports do ESLint. Uso: node scripts/verificar-importacoes.mjs
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DRIVERS = ['pg', 'postgres', 'kysely-postgres-js', 'drizzle-orm/node-postgres', 'drizzle-orm/postgres-js'];
const PROIBIDOS_SEMPRE = [/^drizzle-kit/, /^drizzle-orm\/[^/]+\/migrator$/, /^drizzle-orm\/migrator$/];
const PERMITIDOS_DRIVER = [/^src\/guarda\.ts$/, /^src\/acesso-[a-z]+\.ts$/];
const MIGRADOR_KYSELY = /\b(Migrator|FileMigrationProvider)\b/;

/** Devolve as violações de um arquivo (caminho relativo com "/"). Exportada para o autoteste. */
export function violacoesEm(arquivo, conteudo) {
  const v = [];
  for (const [, mod] of conteudo.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
    if (DRIVERS.includes(mod) && !PERMITIDOS_DRIVER.some((r) => r.test(arquivo))) v.push(`${arquivo}: importa ${mod} fora da camada de acesso`);
    if (PROIBIDOS_SEMPRE.some((r) => r.test(mod))) v.push(`${arquivo}: importa ${mod} (segunda cadeia de migrations)`);
  }
  if (/from\s+['"]kysely['"]/.test(conteudo) && MIGRADOR_KYSELY.test(conteudo)) v.push(`${arquivo}: usa o Migrator do Kysely`);
  return v;
}

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arquivos = readdirSync(path.join(raiz, 'src')).filter((f) => f.endsWith('.ts')).map((f) => `src/${f}`);
  const v = arquivos.flatMap((f) => violacoesEm(f, readFileSync(path.join(raiz, f), 'utf8')));
  const pkg = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8'));
  if (Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).includes('drizzle-kit')) v.push('package.json: drizzle-kit na aplicação');
  console.log(`arquivos verificados: ${arquivos.length}`);
  if (v.length) { console.error(v.join('\n')); process.exit(1); }
  console.log('nenhuma importação proibida');
}
