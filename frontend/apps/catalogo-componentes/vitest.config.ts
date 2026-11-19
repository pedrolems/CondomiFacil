import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const configDir = fileURLToPath(new URL('.storybook', import.meta.url));

// Cada story roda com o axe do addon-a11y (`a11y.test: 'error'`), uma vez em cada tema.
const projetoNoTema = (tema: 'claro' | 'escuro') => ({
  extends: true as const,
  plugins: [storybookTest({ configDir })],
  define: { 'import.meta.env.TEMA_DO_TESTE': JSON.stringify(tema) },
  test: {
    name: `a11y-${tema}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' as const }],
    },
  },
});

export default defineConfig({
  test: { projects: [projetoNoTema('claro'), projetoNoTema('escuro')] },
});
