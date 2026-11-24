import { Pressable, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { radius, space, touchTarget } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { anelDeFoco, useFoco } from '../foco';
import { Text } from '../Text/Text';

export type ListRowProps = {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  onPress: () => void;
};

/** Linha tocável de menu (DS 10.5): ícone, título e seta, com 48 dp de altura mínima. */
export function ListRow({ icone: Icone, titulo, descricao, onPress }: ListRowProps) {
  const { tema } = useTheme();
  const { focado, aoFocar, aoDesfocar } = useFoco();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onFocus={aoFocar}
      onBlur={aoDesfocar}
      style={({ pressed }) => [
        {
          minHeight: touchTarget.min,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingVertical: space[3],
          paddingHorizontal: space[3],
          borderRadius: radius.md,
          backgroundColor: pressed ? tema.surface : 'transparent',
        },
        focado && anelDeFoco(tema.focus),
      ]}
    >
      <View aria-hidden>
        <Icone size={24} color={tema.text.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variante="label">{titulo}</Text>
        {descricao && (
          <Text variante="bodySm" tom="secondary">
            {descricao}
          </Text>
        )}
      </View>
      <View aria-hidden>
        <ChevronRight size={20} color={tema.text.secondary} />
      </View>
    </Pressable>
  );
}
