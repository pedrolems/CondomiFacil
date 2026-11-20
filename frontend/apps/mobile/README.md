# Aplicativo e versão web

Aplicativo React Native + TypeScript com Expo SDK 58 e Expo Router, para Android, iOS e web (react-native-web). **Fase 1 (RM-13):** uma única tela, que chama `GET /v1/saude` e mostra carregando, API disponível, API indisponível, sem conexão ou resposta fora do contrato (sempre texto e ícone). Sem telas de domínio, sessão, offline ou push. **RM-14:** a tela usa o tema (claro, escuro ou igual ao aparelho) e os componentes `StatusView` e `Button` de `@condomifacil/ui`, com tokens de `@condomifacil/design-tokens` e ícones Lucide.

Os demais diretórios de `src/` seguem reservados (READMEs). Referência: `docs/06-frontend/frontend.md`, seção 2.1.

## Comandos

Na raiz do repositório, com o Node 26.13.1 e o pnpm 12.21.0 no PATH (ver [Como instalar](../../../README.md#como-instalar)) e `pnpm install` antes:

| Comando | O que faz |
| --- | --- |
| `pnpm dev:app` | Expo (Metro) persistente; abre os menus `w` (web), `a` (Android) e o QR Code do Expo Go |
| `pnpm --filter @condomifacil/mobile test` | Jest (jest-expo) e Testing Library |
| `pnpm --filter @condomifacil/mobile build` | `expo export --platform web`, saída em `dist/` |
| `pnpm --filter @condomifacil/mobile storybook` | Storybook nativo no lugar do app (`STORYBOOK_ENABLED=true expo start`), para Expo Go, emulador ou `w` (web); ver `.rnstorybook/README.md` |
| `pnpm check` | lint, contratos, typecheck, build e testes de todo o workspace |

## URL da API: `EXPO_PUBLIC_API_URL`

Base HTTP da API, sem barra final (a tela chama `${EXPO_PUBLIC_API_URL}/v1/saude`). **É pública:** o Metro a embute no bundle, então nunca pode conter segredo (infra-e-devops.md, linha 184). Sem ela, a tela mostra "Sem conexão com a API". Veja `.env.example`; crie um `.env` local (ignorado pelo Git) ou defina a variável ao iniciar.

A API local precisa de `APP_ENV`, `PORT` e, para a web, `CORS_ALLOWED_ORIGINS` igual à origem do app (variáveis em `backend/apps/api/.env.example`). Aplicativo nativo não usa CORS.

Web local (exemplo):

```text
APP_ENV=dev PORT=3000 CORS_ALLOWED_ORIGINS=http://localhost:8081 pnpm dev:api
EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm dev:app   # tecla w
```

## iPhone com Expo Go (prova do iOS, D8)

Não foi executada nesta máquina. Passo a passo:

1. Instale o Expo Go na App Store. O iPhone e o computador ficam na **mesma rede Wi-Fi** (sem VPN; redes com isolamento de clientes bloqueiam a conexão).
2. Descubra o IP do computador na rede (`ipconfig`, adaptador Wi-Fi, "Endereço IPv4"), por exemplo `192.168.0.10`.
3. Inicie a API aceitando conexões da rede. Ela escuta em todas as interfaces; libere a porta no Firewall do Windows se pedir. O app nativo não faz CORS, então `CORS_ALLOWED_ORIGINS` só importa se você também abrir a web:
   `APP_ENV=dev PORT=3000 pnpm dev:api`
4. Inicie o app com o IP: `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000 pnpm dev:app` (no PowerShell: `$env:EXPO_PUBLIC_API_URL="http://192.168.0.10:3000"; pnpm dev:app`). Não use `localhost`: no iPhone ele é o próprio aparelho.
5. Escaneie o QR Code com a câmera do iPhone e abra no Expo Go. A tela deve mostrar "API disponível" e a versão. Se a rede bloquear o Metro, rode com `pnpm dev:app -- --tunnel`.
6. Para o Android real, os mesmos passos valem com o app Expo Go do Android.

O iOS recusa HTTP puro em apps de produção (ATS); o Expo Go em desenvolvimento aceita. Staging e produção usam HTTPS.

## Decisões técnicas

- **Metro no monorepo pnpm:** o `metro.config.js` parte do `getDefaultConfig` do Expo SDK 58, que já configura monorepos (pastas observadas, links simbólicos do pnpm e `exports` de pacotes); `@condomifacil/shared-types` é resolvido pelo `exports`. A única adição é o `withStorybook`, inerte sem `STORYBOOK_ENABLED=true`.
- **Storybook nativo (RM-14):** entrada própria em `.rnstorybook/`, trocada pelo Metro só com `STORYBOOK_ENABLED=true`; o build de produção não contém Storybook nem stories (verificado no bundle Android e web). Abrir no Android ou iPhone com Expo Go: passo a passo em `.rnstorybook/README.md`.
- **Tipos:** preset `@condomifacil/config/tsconfig/expo.json` (estende `expo/tsconfig.base`).
- **Contrato:** o cliente em `src/infraestrutura/api/saude.ts` valida a resposta com `validarComum('SaudeComum', ...)` (Ajv, prova P1-03).
- **Testes (R6-06):** Jest com `jest-expo`, o preset oficial do Expo (transforma React Native e resolve Expo Router). Os testes da tela mockam o cliente; os do cliente usam o Ajv real.
- **Scripts de build de dependências:** `@parcel/watcher` fica bloqueado em `allowBuilds` (`false`); o export web, o export Android e o `expo start` funcionaram sem ele (reavaliar se algum recurso de observação de arquivos falhar).
