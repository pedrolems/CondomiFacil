import { ActivityIndicator, View } from 'react-native';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

export type TomDeEstado = 'success' | 'warning' | 'danger' | 'info';

// Ícone padrão de cada tom (DS 4.4).
const ICONE_DO_TOM: Record<TomDeEstado, LucideIcon> = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
};

export type StatusViewProps =
  | {
      carregando: true;
      titulo: string;
    }
  | {
      carregando?: false;
      tom: TomDeEstado;
      /** Substitui o ícone padrão do tom; ex.: `WifiOff` para sem internet (DS 8.3). */
      icone?: LucideIcon;
      titulo: string;
      descricao?: string;
      acao?: { rotulo: string; onPress: () => void };
    };

const TAMANHO_DO_ICONE = 32;

/** Estado de tela (DS 10.21): ícone e texto sempre juntos, nunca só cor (DS 4.4). */
export function StatusView(props: StatusViewProps) {
  const { tema } = useTheme();

  // O ícone e o indicador são decorativos: o título já diz o estado ao leitor de tela.
  if (props.carregando) {
    return (
      <View style={{ alignItems: 'center', gap: space[3] }}>
        {/* `info` é o tom de "em andamento" (DS 4.4). */}
        <ActivityIndicator size="large" color={tema.info.fg} aria-hidden />
        <Text variante="titleMd" accessibilityRole="header" style={{ textAlign: 'center' }}>
          {props.titulo}
        </Text>
      </View>
    );
  }

  const { tom, titulo, descricao, acao } = props;
  const Icone = props.icone ?? ICONE_DO_TOM[tom];
  return (
    <View style={{ alignItems: 'center', gap: space[3] }}>
      <View aria-hidden>
        <Icone size={TAMANHO_DO_ICONE} color={tema[tom].fg} testID={`icone-${tom}`} />
      </View>
      <Text variante="titleMd" accessibilityRole="header" style={{ textAlign: 'center' }}>
        {titulo}
      </Text>
      {descricao && (
        <Text tom="secondary" style={{ textAlign: 'center' }}>
          {descricao}
        </Text>
      )}
      {acao && <Button rotulo={acao.rotulo} onPress={acao.onPress} />}
    </View>
  );
}
