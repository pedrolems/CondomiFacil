// Estados de PasswordField (DS 10.2): botão Mostrar/Ocultar com nome acessível.
import { PasswordField } from './PasswordField';

export default {
  title: 'Formulário/Campo de senha',
  component: PasswordField,
  args: {
    rotulo: 'Senha',
    valor: 'senha-de-exemplo',
    autoComplete: 'current-password',
    onChangeText: () => {},
  },
};

export const Oculta = { name: 'Senha oculta' };

export const ComErro = {
  name: 'Com erro',
  args: { rotulo: 'Senha atual', erro: 'Senha atual incorreta.' },
};

export const NovaSenha = {
  name: 'Nova senha',
  args: { rotulo: 'Nova senha', autoComplete: 'new-password' },
};
