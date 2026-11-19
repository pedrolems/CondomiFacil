// Storybook nativo (RM-14; biblioteca-de-componentes.md §6.1). Sem `STORYBOOK_ENABLED=true` o
// withStorybook devolve a configuração padrão do Expo intacta: nada do Storybook nem das stories
// entra no bundle. Com a variável (script `storybook`), troca a entrada do app por
// `.rnstorybook/index.tsx`.
/* eslint-disable @typescript-eslint/no-require-imports -- o Metro carrega este arquivo em CommonJS */
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');

// Sem telemetria, como no catálogo web (`core.disableTelemetry`), e sem o servidor de canal na
// porta 7007 (aberto em todas as interfaces e só usado por websockets/MCP, que não ativamos).
process.env.STORYBOOK_DISABLE_TELEMETRY ??= 'true';
process.env.STORYBOOK_SERVER ??= 'false';

const config = getDefaultConfig(__dirname);

// Interface leve (@storybook/react-native-ui-lite): a completa exige reanimated, gesture-handler e
// bottom-sheet, módulos nativos que o app não usa. shortcut: no Windows o liteMode 10.7.2 compara
// o caminho com "/" e não esvazia a interface completa; esvaziamos pelo nome do módulo. Remover
// quando o pacote corrigir.
if (process.env.STORYBOOK_ENABLED === 'true') {
  config.resolver.resolveRequest = (context, moduleName, platform) =>
    moduleName === '@storybook/react-native-ui'
      ? { type: 'empty' }
      : context.resolveRequest(context, moduleName, platform);
}

module.exports = withStorybook(config, { liteMode: true });
