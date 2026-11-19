import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  // As mesmas stories do catálogo web, junto dos componentes (biblioteca-de-componentes.md §6.1).
  // Dialog e DataTable ainda são reservas sem story (fora do RM-14, D4).
  stories: ['../../../packages/ui/src/components/!(Dialog|DataTable)/*.stories.tsx'],
};

export default main;
