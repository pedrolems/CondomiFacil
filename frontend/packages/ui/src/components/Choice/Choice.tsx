import { useId } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { radius, space, touchTarget } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { anelDeFoco, useFoco } from '../foco';
import { Text } from '../Text/Text';

export type ChoiceProps = {
  /** `checkbox` marca vários; `radio` escolhe um entre vários (DS 10.3). */
  tipo: 'checkbox' | 'radio';
  rotulo: string;
  marcado: boolean;
  onChange: () => void;
  descricao?: string;
};

const LADO = 24;

/** Caixa de seleção ou opção única: o estado é um ícone/forma, nunca só cor (DS 4.4). */
export function Choice({ tipo, rotulo, marcado, onChange, descricao }: ChoiceProps) {
  const { tema } = useTheme();
  const { focado, aoFocar, aoDesfocar } = useFoco();
  const redondo = tipo === 'radio';
  const idDaDescricao = useId();
  // O texto visual fica oculto ao leitor (o nome é o rótulo); a descrição entra como dica, sem repetir o rótulo.
  const dica = !descricao
    ? {}
    : Platform.OS === 'web'
      ? ({ 'aria-describedby': idDaDescricao } as object)
      : { accessibilityHint: descricao };
  return (
    <Pressable
      role={tipo}
      aria-checked={marcado}
      aria-label={rotulo}
      {...dica}
      onPress={onChange}
      onFocus={aoFocar}
      onBlur={aoDesfocar}
      style={[
        {
          minHeight: touchTarget.min,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingVertical: space[2],
          borderRadius: radius.sm,
        },
        focado && anelDeFoco(tema.focus),
      ]}
    >
      <View
        aria-hidden
        style={{
          width: LADO,
          height: LADO,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: redondo ? radius.full : radius.sm / 2,
          borderWidth: 2,
          borderColor: marcado ? tema.action.primary : tema.border.control,
          backgroundColor: marcado && !redondo ? tema.action.primary : 'transparent',
        }}
      >
        {marcado &&
          (redondo ? (
            <View
              style={{
                width: LADO / 2 - 2,
                height: LADO / 2 - 2,
                borderRadius: radius.full,
                backgroundColor: tema.action.primary,
              }}
            />
          ) : (
            <Check size={16} color={tema.action.onPrimary} strokeWidth={3} />
          ))}
      </View>
      <View style={{ flex: 1 }} aria-hidden>
        <Text>{rotulo}</Text>
        {descricao && (
          <Text variante="bodySm" tom="secondary" nativeID={idDaDescricao}>
            {descricao}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
