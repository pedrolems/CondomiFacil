# Pacote técnico da fase 1 — base executável (IN-01 A)

**Data:** 18/11/2026. **Atualizado em:** 18/11/2026. **Autor do produto e responsável pelas decisões:** Pedro Lemos.

**Estado:** decisões D1 a D8 aceitas por Pedro em 18/11/2026; **G0 liberado em 18/11/2026; fase 1 não iniciada** (limite no [roadmap](../roadmap.md), RM-09). O G0 não estava liberado quando as decisões foram registradas; Pedro o revisou depois; as versões de Node e pnpm (D1) foram confirmadas e aprovadas por ele em 18/11/2026 (seção 5), e o G0 foi liberado depois, só para a fase 1. Nada aqui libera código, instalação, dependências, dados reais, publicação, commit ou push. É o pacote técnico concreto previsto no [lote 4](../decisoes-para-iniciar-o-desenvolvimento.md#6-lote-4--o-mínimo-para-liberar-a-primeira-entrega-técnica) (IN-01 A) e no [roadmap](../roadmap.md), fase 1 (RM-10 a RM-15).

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
| RM-13 | API NestJS com `GET /v1/saude` sem banco (D5); app Expo exibindo a saúde com tipo gerado | `curl` devolve corpo conforme `SaudeComum`; app mostra estado na web, no emulador Android e no iOS via Expo Go (D8); API não sobe sem variável obrigatória |
| RM-14 | Tokens do DS, ThemeProvider claro/escuro, componentes só da tela de saúde (D4), stories web e nativas | Storybook web e nativo abrem; nenhum hex solto fora de `design-tokens`; estado com texto e ícone; toque 48/56 dp; axe sem violações |
| RM-15 | CI de PR só de verificação (D6): instalação congelada, lint/tipos/build, geração sem diff, lint Redocly/AsyncAPI, gitleaks; fixtures fictícias | Nenhum job de deploy ou promoção; gitleaks falha com segredo plantado; `.env` no `.gitignore`; fixtures sem dados que possam ser reais |

## 4. Ferramentas

**Fixado pelas fontes:** pnpm com workspace único; Turborepo só com tarefas reais; OpenAPI 3.1 e AsyncAPI 3.0 (ADR-015); NestJS; Expo, React Native e TypeScript; Storybook web e nativo; GitHub Actions (proposta, [infra-e-devops](infra-e-devops.md)).

**Versões confirmadas (D1, aprovadas em 18/11/2026):** Node 26.13.1 e pnpm 12.21.0. Fontes: [Node (Release)](https://github.com/nodejs/Release); [Expo SDK 58 aceita Node 26](https://docs.expo.dev/versions/latest/); [NestJS 12 aceita Node 26 na CLI](https://docs.nestjs.com/migration-guide); [pnpm](https://pnpm.io/installation); [setup-node v7](https://github.com/actions/setup-node); [Corepack removido no Node 25](https://nodejs.org/en/blog/release/v25.0.0).

**Escolhas propostas:** ESLint + Prettier ([arquitetura](../03-arquitetura/01-arquitetura.md), linha 808); teste: ferramenta decidida na prova do RM-11/RM-13, com hipótese inicial Vitest na API (NestJS 12 só ESM) e Jest no app (R6-06); TypeScript 6.0.3 (PC-09, alterado em 18/11/2026: o template do Expo SDK 58 declara `~6.0.3`, `@nestjs/cli` e `schematics` 12.0.13 exigem `>=6.0.0`, o typescript-eslint 8.73.0 aceita `<6.1.0`; fonte: registro npm em 18/11/2026); ESLint na major mais nova compatível com typescript-eslint, eslint-plugin-boundaries e eslint-config-prettier (10 se todos declararem suporte, senão 9.39.5); gitleaks fixado no CI; Expo SDK mais recente com Storybook nativo compatível (verificar no RM-14); gerador de contratos escolhido após a prova P1 no RM-12, em 18/11/2026: openapi-typescript 7.13.0 + Ajv 8.20.0 + @asyncapi/parser 3.6.6, com ressalva do peer de TypeScript (Hey API e Orval reprovados); ver o [resultado da P1](../03-arquitetura/criterios-de-poc.md#resultado-18112026-aprovada).

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
- Storybook nativo: `@storybook/react-native` 10.7.2 não declara compatibilidade com React Native 0.88; testar no RM-14.
- NestJS 12 só funciona com ESM, o que afeta a configuração do Jest (ou do Vitest, R6-06).
- Ferramentas 0.x ou pouco mantidas candidatas ao gerador (RM-12): ver riscos e critérios de reprovação em [critérios das PoCs](../03-arquitetura/criterios-de-poc.md).

## 7. Rastreabilidade

RM-09 a RM-15 ([roadmap](../roadmap.md)); IN-01 A e IN-02 A ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md)); ADR-015 (workspace e geração); ADR-004 e ADR-016 (fora da fase 1); ADR-011 (proposto, conflito em D6); ADR-001, 007 e 008 (fase 2); BL-DV-03 (saúde, [baseline](../baseline-de-escopo-mvp.md)); RNF-03 (Android, iOS e web); SEG-02 (segredos); RNF-18 (custo zero); WCAG AA do Design System (RM-14).
