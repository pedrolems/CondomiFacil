import { Text as TextoNativo, type TextProps } from 'react-native';
import { typography, type TypographyToken } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';

export type TextoProps = TextProps & {
  /** Token da escala tipográfica (DS 5.2). */
  variante?: TypographyToken;
  /** Cor do texto (DS 4.2): principal ou de apoio. */
  tom?: 'primary' | 'secondary';
};

// Sem `maxFontSizeMultiplier`: o texto acompanha a fonte ampliada do sistema (DS 5.3).
export function Text({ variante = 'body', tom = 'primary', style, ...resto }: TextoProps) {
  const { tema } = useTheme();
  return (
    <TextoNativo {...resto} style={[typography[variante], { color: tema.text[tom] }, style]} />
  );
}
