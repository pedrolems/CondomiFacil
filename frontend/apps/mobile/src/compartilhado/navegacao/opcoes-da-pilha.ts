import { useTheme } from '@condomifacil/ui';

// Barra superior (DS 10.14): fundo `brand` e texto `text.onBrand` nos dois temas.
export function useOpcoesDaPilha() {
  const { tema } = useTheme();
  return {
    title: 'CondomiFácil',
    headerStyle: { backgroundColor: tema.brand },
    headerTintColor: tema.text.onBrand,
    contentStyle: { backgroundColor: tema.bg },
  } as const;
}
