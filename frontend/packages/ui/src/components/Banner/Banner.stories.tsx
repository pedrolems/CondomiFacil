// Faixas de aviso (DS 10.10): ícone e texto juntos, nunca só cor.
import { Clock } from 'lucide-react-native';
import { Banner } from './Banner';

export default {
  title: 'Feedback/Faixa de aviso',
  component: Banner,
};

export const Informacao = {
  name: 'Informação',
  args: { tom: 'info', texto: 'Se o e-mail estiver cadastrado, um código foi enviado.' },
};

export const Sucesso = {
  args: { tom: 'success', texto: 'Senha alterada. Você saiu dos outros aparelhos.' },
};

export const PausaComAcao = {
  name: 'Pausa com ação',
  args: {
    tom: 'warning',
    icone: Clock,
    texto: 'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.',
    acao: { rotulo: 'Esqueci minha senha', onPress: () => {} },
  },
};

export const Erro = {
  args: {
    tom: 'danger',
    texto:
      'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.',
  },
};
