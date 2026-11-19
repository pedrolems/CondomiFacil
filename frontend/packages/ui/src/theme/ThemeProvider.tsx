import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Theme } from '@condomifacil/design-tokens';

/** Preferência de tema (DS 12 e 17): "Igual ao aparelho", "Claro" ou "Escuro". */
export type PreferenciaDeTema = 'sistema' | 'claro' | 'escuro';
export type EsquemaDeCor = 'claro' | 'escuro';

type ValorDoTema = { tema: Theme; esquema: EsquemaDeCor };

const ContextoDoTema = createContext<ValorDoTema | null>(null);

type Props = { preferencia?: PreferenciaDeTema; children: ReactNode };

// Sem persistência da preferência: quem guarda a escolha da pessoa é o app (fora do RM-14).
export function ThemeProvider({ preferencia = 'sistema', children }: Props) {
  const doAparelho = useColorScheme();
  const esquema: EsquemaDeCor =
    preferencia === 'sistema' ? (doAparelho === 'dark' ? 'escuro' : 'claro') : preferencia;
  const valor = useMemo(() => ({ tema: esquema === 'escuro' ? dark : light, esquema }), [esquema]);
  return <ContextoDoTema.Provider value={valor}>{children}</ContextoDoTema.Provider>;
}

export function useTheme(): ValorDoTema {
  const valor = useContext(ContextoDoTema);
  if (!valor) throw new Error('useTheme precisa estar dentro de ThemeProvider.');
  return valor;
}
