import type { ExpoConfig } from 'expo/config';

// Fase 1 (RM-13): configuração mínima. Identificadores de loja, links, permissões e ambientes
// (dev, staging, produção) entram quando houver build de loja.
const config: ExpoConfig = {
  name: 'CondomiFácil',
  slug: 'condomifacil',
  version: '0.1.0',
  scheme: 'condomifacil',
  orientation: 'portrait',
  // RM-14: `automatic` para o ThemeProvider seguir o tema do aparelho; com `light` o
  // `useColorScheme` do app nativo sempre responde claro.
  userInterfaceStyle: 'automatic',
  plugins: ['expo-router'],
  web: { bundler: 'metro' },
};

export default config;
