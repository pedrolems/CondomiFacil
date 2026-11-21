// Flyway no banco local: "pnpm --filter @condomifacil/api db:flyway info" (ou migrate, validate).
import { carregarAmbiente, flyway } from './ambiente.js';

const r = await flyway(carregarAmbiente(), process.argv.slice(2));
console.log(r.out.trim());
process.exitCode = r.code ?? 1;
