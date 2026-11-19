// Estados de tela (DS 10.21; biblioteca-de-componentes.md §6.3): ícone e texto, nunca só cor.
// Sem DOM nem API web: as mesmas stories servem ao Storybook nativo.
import { WifiOff } from 'lucide-react-native';
import { StatusView } from './StatusView';

export default {
  title: 'Feedback/Estado da tela',
  component: StatusView,
};

export const Carregando = { args: { carregando: true, titulo: 'Carregando encomendas' } };

export const Sucesso = {
  args: {
    tom: 'success',
    titulo: 'Reserva confirmada',
    descricao: 'Salão de festas, sábado, 14/12, das 18h às 23h.',
  },
};

export const Atencao = {
  name: 'Atenção',
  args: {
    tom: 'warning',
    titulo: 'Pagamento pendente',
    descricao: 'A taxa de novembro vence em 3 dias.',
  },
};

export const SemInternet = {
  name: 'Atenção sem internet',
  args: {
    tom: 'warning',
    icone: WifiOff,
    titulo: 'Sem internet',
    descricao: 'As entradas ficam salvas no aparelho e são enviadas quando a conexão voltar.',
  },
};

export const ErroComAcao = {
  name: 'Erro com ação',
  args: {
    tom: 'danger',
    titulo: 'Não foi possível carregar',
    descricao: 'Verifique a conexão e tente de novo.',
    acao: { rotulo: 'Tentar de novo', onPress: () => {} },
  },
};

export const TextoLongo = {
  name: 'Texto longo',
  args: {
    tom: 'info',
    titulo: 'Assembleia geral extraordinária convocada para aprovar a reforma da fachada',
    descricao:
      'A votação abre na segunda-feira às 8h e fica disponível por sete dias. Quem vota pela ' +
      'unidade é o proprietário; o resultado só aparece depois do encerramento.',
  },
};
