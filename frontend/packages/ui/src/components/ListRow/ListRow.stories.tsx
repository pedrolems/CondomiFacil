// Linha de menu (DS 10.5).
import { KeyRound, Smartphone } from 'lucide-react-native';
import { ListRow } from './ListRow';

export default {
  title: 'Navegação/Linha de menu',
  component: ListRow,
  args: { icone: KeyRound, titulo: 'Trocar senha', onPress: () => {} },
};

export const Simples = {};

export const ComDescricao = {
  name: 'Com descrição',
  args: { icone: Smartphone, titulo: 'Sessões', descricao: 'Aparelhos com a conta aberta.' },
};
