import { useState } from 'react';
import { ActivityIndicator, Pressable, Text as TextoNativo, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { radius, space, touchTarget, typography } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text/Text';

type PropsBase = {
  /** Verbo no infinitivo que diz o que acontece (DS 10.1). */
  rotulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'texto';
  /** Médio (48) é o padrão; grande (56) na portaria e no rodapé de largura total. */
  tamanho?: 'medio' | 'grande';
  /** Ícone Lucide opcional à esquerda, 20 dp. */
  icone?: LucideIcon;
  /** Mantém o texto, troca o ícone por um indicador e ignora novos toques. */
  carregando?: boolean;
};

// Botão desabilitado sempre explica por quê e o que fazer (DS 10.1), por isso o motivo é obrigatório.
export type ButtonProps = PropsBase &
  (
    | { desabilitado?: false; motivoDesabilitado?: never }
    | { desabilitado: true; motivoDesabilitado: string }
  );

const TAMANHO_DO_ICONE = 20;

export function Button({
  rotulo,
  onPress,
  variante = 'primario',
  tamanho = 'medio',
  icone: Icone,
  carregando = false,
  desabilitado = false,
  motivoDesabilitado,
}: ButtonProps) {
  const { tema } = useTheme();
  const [focado, setFocado] = useState(false);
  const primario = variante === 'primario';
  const corDoTexto = desabilitado
    ? tema.text.disabled
    : primario
      ? tema.action.onPrimary
      : tema.action.secondary;

  return (
    <View style={{ gap: space[2] }}>
      <Pressable
        accessibilityRole="button"
        // Carregando também bloqueia o toque (evita registro ou pagamento em dobro), mas mantém
        // a aparência normal; o leitor de tela ouve "ocupado".
        accessibilityState={{ disabled: desabilitado || carregando, busy: carregando }}
        disabled={desabilitado || carregando}
        onPress={onPress}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={({ pressed: pressionado }) => [
          {
            minHeight: tamanho === 'grande' ? touchTarget.portaria : touchTarget.min,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space[2],
            paddingHorizontal: space[5],
            borderRadius: radius.md,
          },
          desabilitado
            ? { backgroundColor: tema.action.disabled }
            : primario
              ? {
                  backgroundColor: pressionado ? tema.action.primaryPressed : tema.action.primary,
                }
              : { backgroundColor: pressionado ? tema.surface : 'transparent' },
          !primario &&
            variante !== 'texto' && {
              borderWidth: 1.5,
              borderColor: desabilitado ? tema.action.disabled : tema.action.secondary,
            },
          // Anel de foco do DS 10: 2 dp em `focus`, afastado 2 dp do botão.
          focado && {
            outlineColor: tema.focus,
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 2,
          },
        ]}
      >
        {carregando ? (
          // Decorativo: o botão já anuncia "ocupado" (axe aria-progressbar-name).
          <ActivityIndicator size="small" color={corDoTexto} aria-hidden />
        ) : (
          Icone && <Icone size={TAMANHO_DO_ICONE} color={corDoTexto} />
        )}
        <TextoNativo style={[typography.label, { color: corDoTexto }]}>{rotulo}</TextoNativo>
      </Pressable>
      {desabilitado && (
        <Text variante="bodySm" tom="secondary">
          {motivoDesabilitado}
        </Text>
      )}
    </View>
  );
}
