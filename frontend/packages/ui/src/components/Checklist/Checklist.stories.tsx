// Requisitos da senha (RF-AC-01): ícone, texto e estado, nunca só cor.
import { Checklist } from './Checklist';

export default {
  title: 'Formulário/Lista de requisitos',
  component: Checklist,
};

const itens = [
  { texto: 'Pelo menos 8 caracteres', atendido: true },
  { texto: 'Confirmação igual à senha', atendido: false },
];

export const Pendente = { args: { itens } };

export const AposTentativa = { name: 'Após a tentativa', args: { itens, tentou: true } };
