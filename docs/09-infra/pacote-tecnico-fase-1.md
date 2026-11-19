# Pacote técnico da fase 1 — base executável (IN-01 A)

**Data:** 18/11/2026. **Atualizado em:** 18/11/2026. **Autor do produto e responsável pelas decisões:** Pedro Lemos.

**Estado:** decisões D1 a D8 aceitas por Pedro em 18/11/2026; **G0 liberado em 18/11/2026; fase 1 executada em 18 e 19/11/2026 (RM-10 a RM-15; resultados e pendências na seção 3)** (limite no [roadmap](../roadmap.md), RM-09). O G0 não estava liberado quando as decisões foram registradas; Pedro o revisou depois; as versões de Node e pnpm (D1) foram confirmadas e aprovadas por ele em 18/11/2026 (seção 5), e o G0 foi liberado depois, só para a fase 1. Nada aqui libera código, instalação, dependências, dados reais, publicação, commit ou push. É o pacote técnico concreto previsto no [lote 4](../decisoes-para-iniciar-o-desenvolvimento.md#6-lote-4--o-mínimo-para-liberar-a-primeira-entrega-técnica) (IN-01 A) e no [roadmap](../roadmap.md), fase 1 (RM-10 a RM-15).

## Índice

1. [Objetivo e limites](#1-objetivo-e-limites)
2. [Estrutura proposta](#2-estrutura-proposta-preserva-esqueletos-existentes)
3. [Etapas e verificações](#3-etapas-e-verificações)
4. [Ferramentas](#4-ferramentas)
5. [Decisões D1 a D8](#5-decisões-d1-a-d8--aceitas-por-pedro-em-18112026-recomendações)
6. [Riscos](#6-riscos)
7. [Rastreabilidade](#7-rastreabilidade)

## 1. Objetivo e limites

**Saída da fase 1** ([roadmap](../roadmap.md), linha 379): outra pessoa reproduz instalação e execução pelas instruções; o app alcança a API; nenhuma configuração pública contém segredo; contratos não são duplicados à mão; checks executáveis passam. Tela inicial e saúde da API não significam acesso, tenant ou segurança implementados.

**Entra:** RM-10 a RM-15. Recorte de geração = operação de saúde (`GET /v1/saude`, `comumConsultarSaude`, [`comum.yaml`](../05-backend/api/openapi/comum.yaml), linha 2612) + `comum.yaml` inteiro, só gerado, sem implementar ([baseline de escopo](../baseline-de-escopo-mvp.md), linha 41).

**Fica de fora:**

- acesso, condomínio e permissões (fase 2), portaria/offline e cobrança (fase 3), na ordem do IN-01 A;
- PoCs de RLS, sessões, persistência e migrations (RM-16), exceto a prova do gerador autorizada em D2;
- banco persistido e migrations ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md), linha 143);
- dados reais e nuvem do piloto; deploy no Render ou Supabase;
- contratar ou provisionar serviços, publicar, migrar banco real ou usar dados pessoais ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md), linha 141).

## 2. Estrutura proposta (preserva esqueletos existentes)

| Local | O que é feito | Fonte |
| --- | --- | --- |
| Raiz | Completar `package.json` (`packageManager`, `engines`, scripts reais); `pnpm-lock.yaml` real e único; arquivo de versão do Node; `turbo.json` só com tarefas reais | [ADR-015](../03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md) (linhas 23-29); [roadmap](../roadmap.md) RM-10/RM-11 |
| `.github/workflows/ci.yml` | Novo, só verificação em PR (D6) | [infra-e-devops](infra-e-devops.md), seção 5.1 (linhas 134-138) |
| `backend/apps/api` | NestJS com configuração validada e saúde em `interfaces/http/comum/` | [backend](../05-backend/01-backend.md) (linhas 82-155) |
| `frontend/apps/mobile` | Expo Router (Android, iOS, web), painel em `src/app/(web)/` no mesmo projeto, cliente HTTP da saúde | [frontend](../06-frontend/frontend.md) (linhas 35-90); [arquitetura](../03-arquitetura/01-arquitetura.md) (linhas 794-819) |
| `frontend/apps/catalogo-componentes`, `frontend/packages/{ui,design-tokens}` | Storybook, tokens, componentes | [biblioteca de componentes](../06-frontend/biblioteca-de-componentes.md) (linhas 13 e 59-108) |
| `packages/shared-types`, `packages/config` | Código gerado dos contratos; presets TS/lint | ADR-015 (linhas 23 e 27) |

Regras do ADR-015 (linha 33): pacotes nunca dependem de apps; `shared-types` não importa NestJS nem React Native; sem aliases de caminho no lugar dos manifests; sem tarefas vazias no Turborepo.

## 3. Etapas e verificações

| RM | Entrega | Prova objetiva |
| --- | --- | --- |
| RM-10 | Node/pnpm fixados (D1), `packageManager`, `engines`, lockfile real, instruções de instalação | Em clone limpo, `pnpm install --frozen-lockfile` sai com código 0; `node -v` e `pnpm -v` batem com o fixado |
| RM-11 | Dependências no consumidor (`workspace:*`), exports/build dos pacotes, tsconfig base, ESLint + Prettier, Turborepo só com `lint` por ora (decisão de 18/11/2026: sem código-fonte real, typecheck e build seriam tarefas vazias; entram por pacote com código: `shared-types` no RM-12, apps no RM-13, `ui` e `design-tokens` no RM-14), fronteiras com eslint-plugin-boundaries, fim de linha LF em `.gitattributes` | `pnpm turbo run lint` passa, com a regra de fronteiras (antes: `lint typecheck build`); a checagem de fronteiras falha quando pacote importa app |
| RM-12 | Geração OpenAPI 3.1/AsyncAPI 3.0 para `shared-types`, validação em execução da mesma fonte, detecção de artefato desatualizado (prova do gerador, D2; critérios P1, PC-01 a PC-03 e limite de 2 dias em [critérios das PoCs](../03-arquitetura/criterios-de-poc.md)) | Gerar duas vezes = diff vazio; no CI `git diff --exit-code` acusa artefato velho; resposta fora do esquema é rejeitada; Node e Expo importam o pacote. **Executado em 18/11/2026: P1 aprovada** ([resultado](../03-arquitetura/criterios-de-poc.md#resultado-18112026-aprovada)) |
| RM-13 | API NestJS com `GET /v1/saude` sem banco (D5); app Expo exibindo a saúde com tipo gerado | `curl` devolve corpo conforme `SaudeComum`; app mostra estado na web, no emulador Android e no iOS via Expo Go (D8); API não sobe sem variável obrigatória. **Executado em 18/11/2026:** API NestJS 12.5.1 com `GET /v1/saude` sem banco (corpo `{estado, versao}` validado contra `SaudeComum`; `X-Request-Id` gerado; `X-Powered-By` removido; CORS só GET por origens configuradas; configuração em Zod com `APP_ENV` `dev`, `staging` ou `production` e `PORT` obrigatórios e `CORS_ALLOWED_ORIGINS` opcional, sem aceitar `*`); `429`, `503` e filtro de erros no formato `Erro` não implementados. App Expo SDK 58 em `frontend/apps/mobile` com tela de saúde (carregando, disponível, indisponível, sem conexão e resposta inesperada, com texto e ícone). **Provas:** web passou (navegador headless mostrou "API disponível" com a API real e CORS); bundle Android Hermes compila (`expo export --platform android`); `pnpm check` com 12 tarefas ok. **Provas em dispositivo (D8, 19/11/2026):** emulador Android 36.1 (x86_64, Google Play) com Expo Go passou: a tela mostrou "API disponível" e a versão 0.1.0 com a API real em `http://10.0.2.2:3000`; o Metro pela rede local travou o download do bundle, resolvido com `adb reverse` e abertura por `127.0.0.1`. iPhone com Expo Go passou em parte: o app abriu e rodou no iOS (Hermes), pelo túnel do Expo (`--tunnel`, com o Expo Go logado na mesma conta do CLI, porque a rede local não alcançava o PC), e mostrou o estado "Sem conexão com a API", pois a API não estava acessível ao aparelho. **Pendente (a cargo de Pedro):** decidir se a prova do iPhone com o estado "Sem conexão" basta ou se é preciso repeti-la com "API disponível" (exige liberar a rede local ou expor a API por túnel) |
| RM-14 | Tokens do DS, ThemeProvider claro/escuro, componentes só da tela de saúde (D4), stories web e nativas | Storybook web e nativo abrem; nenhum hex solto fora de `design-tokens`; estado com texto e ícone; toque 48/56 dp; axe sem violações. **Executado em 18/11/2026:** `design-tokens` com todos os tokens das seções 4 a 9 do DS (paleta, temas claro e escuro com os seis tons de status, tipografia sem Inter, espaçamento, alvos de toque 48/56, raios, movimento); `ui` com ThemeProvider (Igual ao aparelho, Claro, Escuro; sem persistência), Button (primário e secundário, 48/56 dp, carregando, desabilitado com motivo obrigatório), Text e StatusView (ícone Lucide e texto por tom), só os componentes da tela de saúde (D4); a tela de saúde passou a usá-los, com "Tentar de novo" (DS 10.21); `userInterfaceStyle` do app mudou para `automatic`. Versões: lucide-react-native 1.73.0, react-native-svg 15.16.0; Storybook web 10.6.7 (`@storybook/react-native-web-vite`, addon-a11y e addon-vitest, Vitest 5.1.0, Playwright 1.65.1) em `frontend/apps/catalogo-componentes`; Storybook nativo `@storybook/react-native` 10.7.2 com `@storybook/react-native-ui-lite` em `frontend/apps/mobile/.rnstorybook`, ativado só por `STORYBOOK_ENABLED=true`. **Provas:** regra ESLint barra hex fora de `design-tokens` (falhou com hex plantado, passa no repositório); 15 stories; `test:a11y` (axe) 30/30 nos dois temas e falha com violação plantada; Storybook web aberto no navegador nos dois temas; Storybook nativo: bundle Android Hermes compila com as stories e a versão web do Storybook nativo abriu com troca de story e tema; bundles de produção (Android e web) sem Storybook nem stories (verificado por busca no bundle); `pnpm check` 19/19. **Limitações:** `test:a11y` fora do `pnpm check` (exige Chromium do Playwright; o CI do RM-15 precisa instalá-lo); sem tabela de props (docgen desligado); Storybook nativo sem controles de args e com seletor de tema como botão no topo da story; Inter e elevação (DS 7.2) não implementadas. **Pendente (a cargo de Pedro):** abrir o Storybook nativo em aparelho Android e iPhone (passo a passo em `frontend/apps/mobile/.rnstorybook/README.md`). |
| RM-15 | CI de PR só de verificação (D6): instalação congelada, lint/tipos/build, geração sem diff, lint Redocly/AsyncAPI, gitleaks; fixtures fictícias | Nenhum job de deploy ou promoção; gitleaks falha com segredo plantado; `.env` no `.gitignore`; fixtures sem dados que possam ser reais. **Executado em 18/11/2026 (concluído em 19/11/2026 com a prova do gitleaks):** `.github/workflows/ci.yml` dispara só em `pull_request` e `workflow_dispatch`, com `contents: read` e `pull-requests: read` (o gitleaks-action lista os commits do PR; comentários desligados com `GITLEAKS_ENABLE_COMMENTS: "false"`, decisão de Pedro em 19/11/2026), sem deploy, promoção, release nem segredos; actions fixadas por SHA (checkout v6.1.0, setup-node v6.5.0, gitleaks-action v2.3.9); Node pelo `.node-version`; pnpm 12.21.0 instalado por `npm install -g` (sem Corepack); passos: `pnpm install --frozen-lockfile`, `pnpm check` (lint, geração, tipos, build, testes e `verificar-contratos`, que acusa artefato gerado com diff; a geração também valida o AsyncAPI e falha em erro), `pnpm format:check`, `pnpm lint:openapi` e gitleaks (`.gitleaks.toml` mínimo na raiz: regras padrão mais allowlist restrita às regras `jwt` e `generic-api-key` nos arquivos `docs/05-backend/api/openapi/comum.yaml` e `packages/shared-types/src/gerado/comum.tipos.ts`, que trazem tokens de exemplo fictícios do contrato; decisão de Pedro em 19/11/2026; `GITLEAKS_VERSION` fixada em 8.30.1 porque a action v2.3.9 usa por padrão uma versão fixa que não confirmei suportar `[[allowlists]]`); telemetria do Turborepo desligada. Dependência de ferramenta adicionada: `@redocly/cli` 1.34.24 (mesma versão do `openapi-core` já usado), com `core-js: false` em `allowBuilds`; `lint:openapi` usa `docs/05-backend/api/redocly.yaml` (0 erros, 240 avisos preexistentes). `.gitignore` da raiz passou a cobrir `.env` e `.env.*`, com exceção para `.env.example`; a regra da raiz já cobre `frontend/` (não existe `frontend/.gitignore`; arquivo redundante não criado). **Provas locais:** gitleaks 8.30.1 (binário oficial, SHA256 conferido com o arquivo de checksums da release): `gitleaks git` no repositório (64 commits) sem a allowlist achou 18 falsos positivos nos dois arquivos de contrato e, com a config, termina com código 0; `gitleaks dir` com chave AWS falsa plantada termina com código 1 e, sem ela, com 0; chave AWS falsa em arquivo com o caminho do allowlist continua sendo acusada (a allowlist é por regra e caminho); install congelado, `pnpm check` (19/19), `format:check` e `lint:openapi` com código 0; `git check-ignore -v` confirma `.env`, `frontend/.env`, `backend/.env` ignorados e `.env.example` não ignorado; fixtures e código sem CPF, telefone ou e-mail reais (só `example.com` e UUIDs sintéticos). **Limitações:** o workflow não rodou no GitHub (exige push); `test:a11y` (Playwright) fora do CI. |

## 4. Ferramentas

**Fixado pelas fontes:** pnpm com workspace único; Turborepo só com tarefas reais; OpenAPI 3.1 e AsyncAPI 3.0 (ADR-015); NestJS; Expo, React Native e TypeScript; Storybook web e nativo; GitHub Actions (proposta, [infra-e-devops](infra-e-devops.md)).

**Versões confirmadas (D1, aprovadas em 18/11/2026):** Node 26.13.1 e pnpm 12.21.0. Fontes: [Node (Release)](https://github.com/nodejs/Release); [Expo SDK 58 aceita Node 26](https://docs.expo.dev/versions/latest/); [NestJS 12 aceita Node 26 na CLI](https://docs.nestjs.com/migration-guide); [pnpm](https://pnpm.io/installation); [setup-node v7](https://github.com/actions/setup-node); [Corepack removido no Node 25](https://nodejs.org/en/blog/release/v25.0.0).

**Escolhas propostas:** ESLint + Prettier ([arquitetura](../03-arquitetura/01-arquitetura.md), linha 808); testes: Vitest 5.1.0 na API (NestJS 12 só ESM; sem `emitDecoratorMetadata`, usar `@Inject(token)` explícito ou `unplugin-swc`) e Jest 30.5.2 com jest-expo 58.0.15 no app, decidido em 18/11/2026 (R6-06, R13-01); `shared-types` com `node:test`; TypeScript 6.0.3 (PC-09, alterado em 18/11/2026: o template do Expo SDK 58 declara `~6.0.3`, `@nestjs/cli` e `schematics` 12.0.13 exigem `>=6.0.0`, o typescript-eslint 8.73.0 aceita `<6.1.0`; fonte: registro npm em 18/11/2026); ESLint na major mais nova compatível com typescript-eslint, eslint-plugin-boundaries e eslint-config-prettier (10 se todos declararem suporte, senão 9.39.5); gitleaks fixado no CI; Expo SDK 58 com Storybook nativo 10.7.2 compatível (verificado no RM-14, 18/11/2026); gerador de contratos escolhido após a prova P1 no RM-12, em 18/11/2026: openapi-typescript 7.13.0 + Ajv 8.20.0 + @asyncapi/parser 3.6.6, com ressalva do peer de TypeScript (Hey API e Orval reprovados); ver o [resultado da P1](../03-arquitetura/criterios-de-poc.md#resultado-18112026-aprovada).

## 5. Decisões D1 a D8 — aceitas por Pedro em 18/11/2026 (recomendações)

| ID | Decisão | Resposta |
| --- | --- | --- |
| D1 | Versões de Node e pnpm | Versões confirmadas e **aprovadas por Pedro em 18/11/2026**: **Node 26.13.1** (Active LTS, fim de vida 30/04/2029), em `.node-version` e `engines` `">=26.13.1 <27"`; **pnpm 12.21.0**, em `packageManager: "pnpm@12.21.0"`, instalado diretamente porque o Node 26 não traz Corepack. Fontes na seção 4; riscos na seção 6 |
| D2 | Prova do gerador de contratos | Autorizada só a prova do gerador dentro do RM-12; demais PoCs seguem no RM-16 |
| D3 | Recorte de contrato | `comum.yaml` e AsyncAPI aceitos só para gerar, sem aceite do conteúdo do contrato |
| D4 | Componentes do primeiro fluxo (RM-14) | Só os da tela de saúde; os do acesso na fase 2 |
| D5 | Saúde sem banco | Saúde informa só o processo; sem PostgreSQL local na fase 1 |
| D6 | Escopo do CI | Só verificação em PR, sem deploy nem promoção (conflito com o ADR-011 proposto registrado; ADR-011 não aceito). **R6-01:** o ADR-011 segue Proposto e não é usado na fase 1; o RM-15 se apoia no D6 e na linha de PR da infra 5.2 |
| D7 | Branch do código | Branch de tarefa a partir de `develop`; nome e destino indicados por Pedro antes de commitar |
| D8 | Prova no iOS | Expo Go no aparelho, mais web e emulador Android |

**Recorte aceito para a fase 1 (RM-06, R6-01 a R6-06, Pedro em 18/11/2026; [decisões, seção 6.2](../decisoes-para-iniciar-o-desenvolvimento.md)):**

- **R6-03:** árvores do [backend](../05-backend/01-backend.md) (seção 3.1) e do [frontend](../06-frontend/frontend.md) (seção 2.1) aceitas só nos caminhos usados na fase 1 (`main.api.ts`, `interfaces/http/comum/` para a saúde, compartilhado/config com Zod, Expo Router e `src/app/(web)/`); o restante segue Proposta.
- **R6-05:** aceitos para a fase 1 apenas [infra-e-devops](infra-e-devops.md) 5.1 (só GitHub Actions como ferramenta), 5.2 (só a linha PR), 6.1 (política de `.env`) e [segurança](../07-seguranca/seguranca.md), seção 6, itens 2 e 4; publicação e cofre do Render seguem Propostos. Corrigir o `.gitignore` da raiz e de `frontend/` no RM-15 (o `backend/.gitignore` já cobre `.env`).
- **R6-02 e R6-04:** o ADR-015 mantém o aceite (organização e fontes), com a ferramenta de geração condicionada à P1; a biblioteca de componentes mantém a orientação de 14/11/2026, com versões decididas no RM-14 (se o Storybook nativo falhar com RN 0.88, fica só o web, como limitação).

Estas respostas **não liberam o G0 nem a execução**: Pedro decidiu em 18/11/2026 que o G0 será revisado depois do registro; as versões (D1) estão confirmadas, e resta a revisão de Pedro. Os critérios das PoCs (PC-01 a PC-09) foram aceitos na mesma data, sem executar PoC: [critérios das PoCs](../03-arquitetura/criterios-de-poc.md). A prova do gerador (D2) só pode ser executada depois dessa liberação.

## 6. Riscos

- O `.gitignore` atual não cobre `.env` (SEG-02); corrigir no RM-15 ou antes do primeiro `.env`.
- `EXPO_PUBLIC_*` é público ([infra-e-devops](infra-e-devops.md), linha 184).
- Render gratuito dorme a API após 15 min; Supabase gratuito pausa após 7 dias (fora da fase 1).
- Cache do Turborepo não prova conformidade (ADR-015, linha 29).
- Render: a página de versões do Render não cita o Node 26, só o [aviso](https://render.com/docs/advisory-emudhra); o teste fica para quando o Render entrar, fora da fase 1.
- EAS Build: a imagem usa Node 22; é preciso fixar node e pnpm no `eas.json`, ainda sem teste.
- CI: instalar o pnpm explicitamente (o Node 26 não traz Corepack).
- Storybook nativo: `@storybook/react-native` 10.7.2 não declara compatibilidade com React Native 0.88; testar no RM-14. Testado no RM-14 (18/11/2026): funciona com a 10.7.2 e a interface leve; falta prova em aparelho.
- NestJS 12 só funciona com ESM, o que afeta a configuração do Jest (ou do Vitest, R6-06).
- Ferramentas 0.x ou pouco mantidas candidatas ao gerador (RM-12): ver riscos e critérios de reprovação em [critérios das PoCs](../03-arquitetura/criterios-de-poc.md).

## 7. Rastreabilidade

RM-09 a RM-15 ([roadmap](../roadmap.md)); IN-01 A e IN-02 A ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md)); ADR-015 (workspace e geração); ADR-004 e ADR-016 (fora da fase 1); ADR-011 (proposto, conflito em D6); ADR-001, 007 e 008 (fase 2); BL-DV-03 (saúde, [baseline](../baseline-de-escopo-mvp.md)); RNF-03 (Android, iOS e web); SEG-02 (segredos); RNF-18 (custo zero); WCAG AA do Design System (RM-14).
