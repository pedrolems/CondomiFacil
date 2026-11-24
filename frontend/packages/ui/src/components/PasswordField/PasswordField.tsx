import { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { radius, touchTarget } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { anelDeFoco, useFoco } from '../foco';
import { TextField, type TextFieldProps } from '../TextField/TextField';

export type PasswordFieldProps = Omit<
  TextFieldProps,
  'secureTextEntry' | 'acessorio' | 'autoComplete' | 'autoCapitalize' | 'autoCorrect'
> & {
  /** `new-password` na criação e na troca; `current-password` ao entrar ou informar a atual. */
  autoComplete: 'current-password' | 'new-password';
};

/** Campo de senha com botão Mostrar/Ocultar de 48 dp e nome acessível (DS 10.2). */
export function PasswordField(props: PasswordFieldProps) {
  const { tema } = useTheme();
  const [visivel, setVisivel] = useState(false);
  const { focado, aoFocar, aoDesfocar } = useFoco();
  const Icone = visivel ? EyeOff : Eye;
  return (
    <TextField
      {...props}
      secureTextEntry={!visivel}
      autoCapitalize="none"
      autoCorrect={false}
      acessorio={
        <Pressable
          accessibilityRole="button"
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          onPress={() => setVisivel((v) => !v)}
          onFocus={aoFocar}
          onBlur={aoDesfocar}
          style={[
            {
              width: touchTarget.min,
              height: touchTarget.min,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.sm,
            },
            focado && anelDeFoco(tema.focus),
          ]}
        >
          <Icone size={20} color={tema.text.secondary} />
        </Pressable>
      }
    />
  );
}
