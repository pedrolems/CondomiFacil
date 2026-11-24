import { space } from '@condomifacil/design-tokens';
import { TextField, type TextFieldProps } from '../TextField/TextField';

export type CodeFieldProps = Pick<
  TextFieldProps,
  'rotulo' | 'valor' | 'ajuda' | 'erro' | 'editable' | 'onSubmitEditing' | 'autoFocus'
> & { onChangeText: (valor: string) => void };

export const DIGITOS_DO_CODIGO = 6;

// Um único campo (e não seis caixas): aceita colar, preenchimento automático do e-mail ou SMS
// (`one-time-code`) e é lido pelo leitor de tela como um campo só.
/** Campo do código de 6 dígitos do primeiro acesso e da recuperação (RN-CD-02). */
export function CodeField({ onChangeText, ...resto }: CodeFieldProps) {
  return (
    <TextField
      {...resto}
      onChangeText={(texto) => onChangeText(texto.replace(/\D/g, '').slice(0, DIGITOS_DO_CODIGO))}
      inputMode="numeric"
      keyboardType="number-pad"
      maxLength={DIGITOS_DO_CODIGO}
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      autoCorrect={false}
      estiloDoTexto={{ fontSize: 28, lineHeight: 36, letterSpacing: space[2], textAlign: 'center' }}
    />
  );
}
