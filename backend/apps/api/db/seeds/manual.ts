// Seed manual mínimo (RM-25): três condomínios fictícios. Unidades entram no RM-21.
import { condominio, type Manifesto } from './fixtures.js';

const CENARIO = 'seed-manual';

export const SEED_MANUAL: Manifesto = {
  cenario: CENARIO,
  condominios: [
    condominio(CENARIO, 'alfa', { nome: 'Condomínio Residencial Alfa (fictício)' }),
    condominio(CENARIO, 'beta', { nome: 'Condomínio Residencial Beta (fictício)' }),
    condominio(CENARIO, 'gama', {
      nome: 'Condomínio Residencial Gama (fictício)',
      fuso_horario: 'America/Manaus',
    }),
  ],
};
