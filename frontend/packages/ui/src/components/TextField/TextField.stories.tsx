// Estados de TextField (DS 10.2). Sem DOM nem API web: serve também ao Storybook nativo.
import { TextField } from './TextField';

export default {
  title: 'Formulário/Campo de texto',
  component: TextField,
  args: { rotulo: 'E-mail', valor: '', onChangeText: () => {} },
};

export const Vazio = {
  args: { keyboardType: 'email-address', autoComplete: 'email', autoCapitalize: 'none' },
};

export const ComAjuda = {
  name: 'Com ajuda',
  args: { valor: 'ana.lima@email.com', ajuda: 'Use o e-mail que você informou à administradora.' },
};

export const ComErro = {
  name: 'Com erro',
  args: { valor: 'ana.lima', erro: 'Informe um e-mail válido, como nome@email.com.' },
};

export const Desabilitado = { args: { valor: 'ana.lima@email.com', editable: false } };
