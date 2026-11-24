import { View } from 'react-native';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { radius, space } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import type { TomDeEstado } from '../StatusView/StatusView';

const ICONE_DO_TOM: Record<TomDeEstado, LucideIcon> = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
};

export type BannerProps = {
  tom: TomDeEstado;
  texto: string;
  /** Substitui o ícone padrão do tom (ex.: `Clock` na pausa de acesso). */
  icone?: LucideIcon;
  acao?: { rotulo: string; onPress: () => void };
  /** Anuncia o texto ao leitor de tela quando aparece (erros e avisos de ação do usuário). */
  anunciar?: boolean;
};

/** Faixa de aviso dentro da tela (DS 10.10): ícone e texto juntos, nunca só cor (DS 4.4). */
export function Banner({ tom, texto, icone, acao, anunciar = false }: BannerProps) {
  const { tema } = useTheme();
  const Icone = icone ?? ICONE_DO_TOM[tom];
  return (
    <View
      style={{
        gap: space[3],
        padding: space[3],
        borderRadius: radius.md,
        backgroundColor: tema[tom].container,
      }}
    >
      <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
        <View aria-hidden style={{ paddingTop: 2 }}>
          <Icone size={20} color={tema[tom].fg} testID={`icone-banner-${tom}`} />
        </View>
        <Text
          variante="bodySm"
          role={anunciar ? 'alert' : undefined}
          accessibilityLiveRegion={anunciar ? 'assertive' : undefined}
          style={{ flex: 1, color: tema[tom].onContainer }}
        >
          {texto}
        </Text>
      </View>
      {acao && <Button rotulo={acao.rotulo} variante="secundario" onPress={acao.onPress} />}
    </View>
  );
}
