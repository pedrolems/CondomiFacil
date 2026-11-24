// Caixa de seleção e opção única (DS 10.3): forma e ícone marcam o estado.
import { Choice } from './Choice';

export default {
  title: 'Formulário/Seleção',
  component: Choice,
  args: { rotulo: 'Li e aceito: Termos de uso', marcado: false, onChange: () => {} },
};

export const CaixaDesmarcada = { name: 'Caixa desmarcada', args: { tipo: 'checkbox' } };

export const CaixaMarcada = { name: 'Caixa marcada', args: { tipo: 'checkbox', marcado: true } };

export const OpcaoMarcada = {
  name: 'Opção marcada',
  args: { tipo: 'radio', rotulo: 'Escuro', marcado: true },
};

export const OpcaoComDescricao = {
  name: 'Opção com descrição',
  args: { tipo: 'radio', rotulo: 'Igual ao aparelho', descricao: 'Segue o tema do celular.' },
};
