// Seed manual mínimo: três condomínios fictícios (RM-25) e os documentos globais fictícios com a
// versão 1 publicada (RM-20). Unidades entram no RM-21.
import { condominio, documento, documentoVersao, type Manifesto } from './fixtures.js';

const CENARIO = 'seed-manual';

const DOCUMENTOS = [
  documento(CENARIO, 'termos-de-uso', {
    tipo: 'termos_de_uso',
    titulo: 'Termos de uso (fictício)',
  }),
  documento(CENARIO, 'politica-de-privacidade', {
    tipo: 'politica_de_privacidade',
    titulo: 'Política de privacidade (fictício)',
  }),
  documento(CENARIO, 'como-funciona', {
    tipo: 'como_funciona',
    titulo: 'Como funciona (fictício)',
  }),
];

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
  documentos: DOCUMENTOS,
  documentoVersoes: DOCUMENTOS.map((d) => documentoVersao(CENARIO, d, 1)),
};
