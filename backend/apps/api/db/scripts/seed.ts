// Carga do seed manual no banco local: "pnpm --filter @condomifacil/api db:seed".
import { carregarCenario } from '../seeds/fixtures.js';
import { SEED_MANUAL } from '../seeds/manual.js';
import { carregarAmbiente } from './ambiente.js';

const resultado = await carregarCenario(carregarAmbiente(), SEED_MANUAL);
console.log(resultado === 'ja-pronto' ? 'Seed manual já pronto.' : 'Seed manual carregado.');
