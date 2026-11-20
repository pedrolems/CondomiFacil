# Storybook nativo

Validação complementar em Android e iOS das mesmas stories CSF do catálogo web (`frontend/packages/ui/src/components/*/*.stories.tsx`, sem Dialog e DataTable). Referência: `docs/06-frontend/biblioteca-de-componentes.md`, seções 6.1 e 6.2.

## Versões (RM-14, 18/11/2026)

| Pacote | Versão | Motivo |
| --- | --- | --- |
| `@storybook/react-native` | 10.7.2 | Peer `storybook ^10.5.4` (o lock já tem 10.6.7 no catálogo web) e `react-native >=0.72`. Testado com Expo SDK 58 e React Native 0.88.1 |
| `@storybook/react-native-ui-lite` | 10.7.2 | Interface leve: só exige `react-native-safe-area-context`, que o app já tem |
| `storybook` | 10.6.7 | Mesmo núcleo do catálogo web |

A interface completa (`@storybook/react-native-ui`) e os addons on-device (controles, ações) não são usados: exigem reanimated, gesture-handler, bottom-sheet, slider e datetimepicker, módulos nativos que o app não tem. Sem controles, os args vêm só das stories.

## Como funciona

- `metro.config.js` usa o `withStorybook` independente de bundler. Sem `STORYBOOK_ENABLED=true` ele devolve a configuração do Expo intacta. Com a variável, troca a entrada `expo-router/entry` por `index.tsx` desta pasta: o bundle tem só o Storybook e as stories, sem as telas do app.
- `storybook.requires.ts` é gerado pelo Metro ao iniciar com o Storybook ligado (ignorado pelo Git e pelo ESLint).
- `preview.tsx` envolve cada story no `ThemeProvider` da biblioteca. O botão "Trocar tema" no topo alterna Claro, Escuro e Igual ao aparelho, e o rótulo mostra o tema atual.
- Telemetria desligada e servidor de canal (porta 7007) desligado no `metro.config.js`.

## Exclusão do build de produção (verificada em 18/11/2026)

Com o Storybook desligado, `expo export --platform android` e `--platform web` não contêm `storybook`, `getStorybookUI` nem títulos de story ("Feedback/Estado da tela", "Reserva confirmada"); o texto da tela do app está presente. Com `STORYBOOK_ENABLED=true`, o bundle Android (Hermes) compila a partir de `.rnstorybook/index.tsx` e contém as 15 stories, sem reanimated nem bottom-sheet. Para repetir:

```text
cd frontend/apps/mobile
npx expo export --platform android --output-dir <pasta> --clear
grep -a -c "getStorybookUI" <pasta>/_expo/static/js/android/*.hbc   # 0
```

## Abrir no aparelho (Android ou iPhone, com Expo Go)

1. Instale o Expo Go no aparelho; aparelho e computador na mesma rede Wi-Fi.
2. Na raiz do repositório: `pnpm --filter @condomifacil/mobile storybook` (no PowerShell também funciona, o pnpm emula o shell). Se a rede bloquear, acrescente `-- --tunnel`.
3. Escaneie o QR Code (câmera no iPhone, app Expo Go no Android). Abre o Storybook no lugar do app; o menu lateral lista Ações, Feedback e Fundamentos.
4. Se aparecer o app em vez do Storybook, pare o Metro e rode de novo com `-- --clear` (cache da entrada anterior).

No emulador Android, com um AVD criado no Android Studio: rode o passo 2 e tecle `a`.

## Limitações conhecidas

- **Windows:** o `liteMode` do `withStorybook` 10.7.2 compara caminhos com `/` e não esvazia a interface completa. O `metro.config.js` contorna esvaziando `@storybook/react-native-ui` pelo nome do módulo (comentário `shortcut:`); remover quando o pacote corrigir.
- O pacote declara testes com React Native 0.86 e Expo 57; com 0.88 e Expo 58 o bundle compila, a interface abre na web e, em 19/11/2026, abriu no emulador Android 36.1 e, em 20/11/2026, no iPhone, ambos com Expo Go (troca de tema e navegação entre stories funcionando).
- **Emulador Android:** se o Expo Go travar em "Bundling" pela rede local, encaminhe a porta e abra por localhost: `adb reverse tcp:<porta> tcp:<porta>` e `adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:<porta>" host.exp.exponent`.
