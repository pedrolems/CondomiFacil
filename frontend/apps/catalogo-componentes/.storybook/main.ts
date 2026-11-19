import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

const raiz = (caminho: string) => fileURLToPath(new URL(caminho, import.meta.url));

const config: StorybookConfig = {
  framework: '@storybook/react-native-web-vite',
  // Stories ficam junto dos componentes (biblioteca-de-componentes.md §6.1). Dialog e DataTable
  // ainda são reservas sem story (fora do RM-14, D4).
  stories: ['../../../packages/ui/src/components/!(Dialog|DataTable)/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  core: { disableTelemetry: true },
  // Sem docgen: o react-docgen segue imports até o código Flow do react-native e falha, e o
  // react-docgen-typescript ignora arquivos fora do projeto TS do catálogo. Os args são explícitos.
  typescript: { reactDocgen: false },
  viteFinal: (vite) => {
    vite.resolve ??= {};
    // As stories importam o código-fonte da biblioteca; o preview precisa do mesmo módulo
    // (mesmo contexto do ThemeProvider), por isso o pacote aponta para `src` e não para `dist`.
    vite.resolve.alias = {
      ...vite.resolve.alias,
      '@condomifacil/ui': raiz('../../../packages/ui/src/index.ts'),
    };
    // Resolvidos a partir do catálogo, numa única cópia: a biblioteca não depende de
    // react-native-web, e o react-native-svg web importa o registro de assets do react-native.
    vite.resolve.dedupe = [
      'react',
      'react-dom',
      'react-native-web',
      '@react-native/assets-registry',
    ];
    // O react-native-svg importa `TurboModuleRegistry` (só nativo), ausente no react-native-web;
    // sem o shim, a pré-otimização de dependências do modo dev e do Vitest falha.
    vite.optimizeDeps ??= {};
    vite.optimizeDeps.rolldownOptions = {
      ...vite.optimizeDeps.rolldownOptions,
      shimMissingExports: true,
    };
    return vite;
  },
};

export default config;
