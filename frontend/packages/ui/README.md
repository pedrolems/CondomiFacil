# Biblioteca de componentes

Componentes base, layout e apresentações puras. Recebem propriedades e callbacks; não consultam API, banco local, sessão, cache ou SDK de pagamentos. Cores, tipografia e medidas vêm de `@condomifacil/design-tokens`; ícones são Lucide (`lucide-react-native`, DS 8.1).

**RM-14 (decisão D4):** só o necessário para a tela de saúde.

| Exportação | O que faz |
| --- | --- |
| `ThemeProvider`, `useTheme` | Tema claro ou escuro; `preferencia` `'sistema'` (padrão, segue o aparelho), `'claro'` ou `'escuro'`. `useTheme()` devolve `{ tema, esquema }`. Não guarda a preferência |
| `Text` | Variantes da escala DS 5.2, cor `text.primary` ou `tom="secondary"`; acompanha a fonte ampliada |
| `Button` | Primário e secundário (DS 10.1), médio 48 e grande 56; ícone opcional; carregando bloqueia o toque e marca ocupado; desabilitado exige `motivoDesabilitado`, exibido abaixo do botão; anel de foco |
| `StatusView` | Estado de tela (DS 10.21): tom `success`, `warning`, `danger` ou `info`, ícone padrão do tom (ou outro, como `WifiOff`), título, descrição e ação; variante `carregando` |

`Dialog`, `DataTable` e as stories continuam reservados. `react`, `react-native` e `react-native-svg` são `peerDependencies`: o app instala as versões do Expo SDK.

Comandos: `pnpm --filter @condomifacil/ui build` (`dist/`), `typecheck` e `test` (Jest com jest-expo e Testing Library). No Jest, `lucide-react-native` aponta para o build CommonJS (`moduleNameMapper`), porque a condição `react-native` entrega `.mjs`, que o preset não transforma. `testTimeout` é 20000 ms: o primeiro teste de cada arquivo paga a partida a frio (react-native, lucide e tema sob jest-expo) e estourava os 5000 ms padrão no CI e com cache limpo.

Referência: `docs/06-frontend/biblioteca-de-componentes.md`, seções 2 e 5.
