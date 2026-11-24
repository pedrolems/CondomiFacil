import { useEffect, useId, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Platform,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { CircleX } from 'lucide-react-native';
import { radius, space, touchTarget, typography } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { anelDeFoco, useFoco } from '../foco';
import { Text } from '../Text/Text';

export type TextFieldProps = Omit<
  TextInputProps,
  'value' | 'style' | 'placeholder' | 'onFocus' | 'onBlur' | 'aria-label' | 'accessibilityLabel'
> & {
  /** Rótulo sempre visível acima do campo (DS 10.2); também é o nome acessível. */
  rotulo: string;
  valor: string;
  ajuda?: string;
  /** Mensagem de erro com ícone e texto, anunciada pelo leitor de tela. */
  erro?: string;
  /** Elemento à direita dentro do campo (ex.: mostrar/ocultar senha). */
  acessorio?: ReactNode;
  estiloDoTexto?: TextStyle;
};

/** Campo de texto de uma linha (DS 10.2): rótulo, ajuda e erro, toque mínimo de 48 dp. */
export function TextField({
  rotulo,
  valor,
  ajuda,
  erro,
  acessorio,
  estiloDoTexto,
  editable = true,
  ...resto
}: TextFieldProps) {
  const { tema } = useTheme();
  const { focado, aoFocar, aoDesfocar } = useFoco();
  const idDaMensagem = useId();
  const mensagem = erro ?? ajuda;
  // O leitor repete o erro (ou a ajuda) quando o foco volta ao campo: `aria-describedby` na web,
  // dica de acessibilidade no app (o RN não tem `aria-describedby`).
  const descricao = !mensagem
    ? {}
    : Platform.OS === 'web'
      ? ({ 'aria-describedby': idDaMensagem } as object)
      : { accessibilityHint: mensagem };

  // O iOS não anuncia sozinho um texto que aparece; na web e no Android vale o `role="alert"`.
  useEffect(() => {
    if (erro && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(erro);
  }, [erro]);

  return (
    <View style={{ gap: space[1] }}>
      <Text variante="labelSm" aria-hidden>
        {rotulo}
      </Text>
      <View
        style={[
          {
            minHeight: touchTarget.min,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radius.sm,
            borderWidth: erro ? 2 : 1,
            borderColor: erro ? tema.danger.fg : tema.border.control,
            backgroundColor: editable ? tema.surfaceRaised : tema.action.disabled,
          },
          focado && anelDeFoco(tema.focus),
        ]}
      >
        <TextInput
          {...resto}
          {...descricao}
          aria-label={rotulo}
          aria-disabled={!editable}
          value={valor}
          editable={editable}
          onFocus={aoFocar}
          onBlur={aoDesfocar}
          style={[
            typography.body,
            {
              flex: 1,
              minHeight: touchTarget.min,
              paddingHorizontal: space[3],
              color: editable ? tema.text.primary : tema.text.disabled,
              outlineWidth: 0,
            },
            estiloDoTexto,
          ]}
        />
        {acessorio}
      </View>
      {erro ? (
        <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
          <View aria-hidden style={{ paddingTop: 2 }}>
            <CircleX size={16} color={tema.danger.fg} />
          </View>
          <Text
            variante="bodySm"
            nativeID={idDaMensagem}
            role="alert"
            accessibilityLiveRegion="assertive"
            style={{ flex: 1, color: tema.danger.fg }}
          >
            {erro}
          </Text>
        </View>
      ) : ajuda ? (
        <Text variante="bodySm" tom="secondary" nativeID={idDaMensagem}>
          {ajuda}
        </Text>
      ) : null}
    </View>
  );
}
