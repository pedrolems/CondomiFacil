// Estados de CodeField: 6 dígitos, `one-time-code` (RN-CD-02).
import { CodeField } from './CodeField';

export default {
  title: 'Formulário/Campo de código',
  component: CodeField,
  args: { rotulo: 'Código de 6 dígitos', valor: '', onChangeText: () => {} },
};

export const Vazio = { args: { ajuda: 'Código válido por 15 minutos.' } };

export const Preenchido = { args: { valor: '483920' } };

export const ComErro = {
  name: 'Com erro',
  args: { valor: '483920', erro: 'Código incorreto. Você tem mais 3 tentativas.' },
};
