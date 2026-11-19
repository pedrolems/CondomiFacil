import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@condomifacil/ui';

// Barra superior (DS 10.14): fundo `brand` e texto `text.onBrand` nos dois temas.
function PilhaComTema() {
  const { tema } = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'CondomiFácil',
        headerStyle: { backgroundColor: tema.brand },
        headerTintColor: tema.text.onBrand,
        contentStyle: { backgroundColor: tema.bg },
      }}
    />
  );
}

export default function LayoutRaiz() {
  return (
    <ThemeProvider preferencia="sistema">
      <PilhaComTema />
    </ThemeProvider>
  );
}
