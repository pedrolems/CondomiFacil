# Frontend — CondomiFacil

Estrutura inicial criada em 14/11/2026, sem implementação. Os arquivos TypeScript e TSX contêm somente comentários de responsabilidade; os manifestos contêm somente metadados. Não há aplicativo, componentes, catálogo ou configuração de build executáveis.

## Fontes

- [Frontend mobile](../docs/06-frontend/frontend.md), seção 2: organização do aplicativo, módulos e infraestrutura.
- [Painel web](../docs/06-frontend/painel-web.md), seções 2 e 3: páginas administrativas e seus limites de acesso.
- [Biblioteca de componentes](../docs/06-frontend/biblioteca-de-componentes.md), seção 2: tokens, biblioteca própria e catálogos Storybook.

A pasta `frontend/` reúne os caminhos `apps/` e `packages/` descritos nesses documentos, conforme o pedido de preparação da estrutura. Integra o workspace pnpm único da raiz, conforme decisão de Pedro em 14/11/2026 ([ADR-015](../docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md)); não é raiz independente de instalação. Isso não aceita as demais propostas técnicas ou ADRs pendentes.

## Organização

| Caminho | Responsabilidade planejada |
| --- | --- |
| `apps/mobile` | Aplicativo Expo Android/iOS e versão web via React Native Web |
| `apps/mobile/src/app` | Borda de navegação por perfil e layouts web |
| `apps/mobile/src/modulos` | Funcionalidades compartilhadas por domínio |
| `apps/mobile/src/compartilhado` | Componentes do app, navegação, provedores, portas e utilitários |
| `apps/mobile/src/infraestrutura` | Adaptadores de API, persistência, sincronização e dispositivo |
| `apps/catalogo-componentes` | Catálogo Storybook web e exemplos sintéticos |
| `packages/design-tokens` | Valores centralizados do Design System |
| `packages/ui` | Componentes de apresentação reutilizáveis |
| `../packages/shared-types` | Tipos e esquemas gerados dos contratos canônicos, sem cópias manuais |
| `../packages/config` | Presets de ferramentas compartilhados, sem ambiente ou segredos |

A versão web permanece no mesmo projeto Expo. O grupo `(web)` reserva a borda dos painéis; não há aplicativo web separado. READMEs mantêm no Git os diretórios sem arquivos específicos definidos nas fontes. Arquivos vazios também podem ser versionados pelo Git; diretórios vazios não são versionados.

## Limites desta preparação

- Rotas, telas, permissões, estados, integrações, stories e testes ainda não foram implementados.
- Os arquivos de exemplo de Button, Dialog e DataTable apenas reservam os caminhos explícitos da documentação; o restante do catálogo será criado conforme necessário.
- A variante `Dialog.native.tsx` depende de uma diferença de plataforma comprovada e não foi criada.
- As camadas internas dos módulos serão criadas quando houver comportamento concreto; não há pastas de casos de uso ou domínio sem necessidade.
- A existência de um diretório de perfil ou módulo não concede acesso a recursos. Valem as permissões de produto e a revalidação pela API.
- O protótipo HTML existente continua como referência navegável.

## Preparação futura

Ao iniciar a implementação autorizada, revisar as propostas e pendências dos documentos antes de escolher versões e ferramentas. Preencher dependências e scripts respeitando o workspace raiz já declarado; configuração TypeScript e resolução entre pacotes; configuração Expo por ambiente, permissões, links e recursos; lint e formatação; configuração e inicialização Storybook web/nativo; e ferramentas de testes pertinentes ao comportamento implementado.

O gerenciador escolhido é pnpm. Antes da primeira instalação, fixar versões compatíveis de Node/pnpm e packageManager na raiz; então gerar um único pnpm-lock.yaml real na raiz. Pacotes internos usarão workspace:* em dependências reais. Turborepo será configurado quando houver tarefas executáveis. Não há comandos de instalação ou execução definidos nesta estrutura. Nenhuma credencial, URL de produção, SDK externo ou recurso real foi incluído.
