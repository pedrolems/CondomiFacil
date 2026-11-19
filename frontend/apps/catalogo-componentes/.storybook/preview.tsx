import type { Decorator, Preview } from '@storybook/react-native-web-vite';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { space } from '@condomifacil/design-tokens';
import { ThemeProvider, useTheme, type PreferenciaDeTema } from '@condomifacil/ui';

// Na prova de acessibilidade, cada projeto do Vitest fixa um tema (vitest.config.ts).
const temaDoTeste = import.meta.env.TEMA_DO_TESTE as PreferenciaDeTema | undefined;

function Fundo({ children }: { children: ReactNode }) {
  const { tema } = useTheme();
  return (
    <View style={{ minHeight: '100vh', padding: space[6], backgroundColor: tema.bg }}>
      {children}
    </View>
  );
}

const comTema: Decorator = (Story, { globals }) => (
  <ThemeProvider preferencia={globals.tema as PreferenciaDeTema}>
    <Fundo>
      <Story />
    </Fundo>
  </ThemeProvider>
);

const preview: Preview = {
  decorators: [comTema],
  globalTypes: {
    tema: {
      description: 'Tema (DS 12 e 17)',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'claro', title: 'Claro' },
          { value: 'escuro', title: 'Escuro' },
          { value: 'sistema', title: 'Igual ao aparelho' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { tema: temaDoTeste ?? 'claro' },
  parameters: {
    layout: 'fullscreen',
    // O fundo vem do tema, não do addon de fundos.
    backgrounds: { disable: true },
    // Violação de axe falha o teste (`pnpm test:a11y`), não só aparece no painel.
    a11y: { test: 'error' },
  },
};

export default preview;
