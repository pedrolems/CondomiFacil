// Instalação limpa por um comando (RM-25): "pnpm --filter @condomifacil/api db:instalar".
// Sobe o PostgreSQL 17 (salvo DB_COMPOSE=0, no CI), provisiona papéis, recria o banco DB_NOME e
// aplica as migrations pelo Flyway como migrador, terminando com validate estrito.
import { carregarAmbiente, flyway, subirCompose } from './ambiente.js';
import { provisionarPapeis, recriarBanco } from './provisionar.js';

const amb = carregarAmbiente();
if (amb.compose) await subirCompose();
await provisionarPapeis(amb);
await recriarBanco(amb, amb.banco);
for (const comando of ['migrate', 'validate', 'info']) {
  const r = await flyway(amb, [comando]);
  console.log(r.out.trim());
  if (r.code !== 0) throw new Error(`flyway ${comando} falhou (código ${r.code}).`);
}
console.log(`Banco ${amb.banco} pronto em ${amb.host}:${amb.porta} (descartável).`);
