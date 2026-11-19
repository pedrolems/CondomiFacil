// Entrada do Storybook nativo: só existe no bundle com STORYBOOK_ENABLED=true, quando o
// withStorybook (metro.config.js) a coloca no lugar de `expo-router/entry`.
import { registerRootComponent } from 'expo';
import { LiteUI } from '@storybook/react-native-ui-lite';
import { view } from './storybook.requires';

// Sem persistir a story aberta: evita o AsyncStorage, outro módulo nativo só do catálogo.
registerRootComponent(
  view.getStorybookUI({ CustomUIComponent: LiteUI, shouldPersistSelection: false }),
);
