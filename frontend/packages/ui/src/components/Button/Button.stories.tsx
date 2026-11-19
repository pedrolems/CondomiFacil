// Estados de Button (DS 10.1; biblioteca-de-componentes.md §6.3). Sem DOM nem API web: as
// mesmas stories servem ao Storybook nativo.
import { DoorOpen, Send } from 'lucide-react-native';
import { Button } from './Button';

export default {
  title: 'Ações/Botão',
  component: Button,
  args: { rotulo: 'Reservar', onPress: () => {} },
};

export const Primario = { name: 'Primário' };

export const Secundario = {
  name: 'Secundário',
  args: { rotulo: 'Ver regras da área', variante: 'secundario' },
};

export const GrandePortaria = {
  name: 'Grande (56 dp, portaria)',
  args: { rotulo: 'Registrar entrada', tamanho: 'grande', icone: DoorOpen },
};

export const ComIcone = { name: 'Com ícone', args: { rotulo: 'Enviar comunicado', icone: Send } };

export const Carregando = { args: { rotulo: 'Pagar com Pix', carregando: true } };

export const DesabilitadoComMotivo = {
  name: 'Desabilitado com motivo',
  args: {
    desabilitado: true,
    motivoDesabilitado: 'Escolha um horário para continuar.',
  },
};

export const RotuloLongo = {
  name: 'Rótulo longo',
  args: { rotulo: 'Confirmar presença na assembleia geral extraordinária de dezembro' },
};
