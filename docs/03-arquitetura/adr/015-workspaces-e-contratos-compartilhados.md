# ADR-015: Workspaces e contratos compartilhados

- **Estado:** Aceito quanto à organização e às fontes; versões Node 26.13.1 e pnpm 12.21.0 aprovadas em 18/11/2026 (D1); ferramenta de geração pendente, condicionada à PoC P1 (R6-02)
- **Data:** 14/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** prova de conceito do gerador antes da implementação dos contratos

## Contexto

As estruturas preparatórias de backend e frontend duplicavam os pacotes `@condomifacil/shared-types` e `@condomifacil/config`. A arquitetura 5.3 sugeria pnpm e Turborepo sem uma decisão registrada. Compartilhamento precisa preservar baixo acoplamento e alta coesão (SOLID e GRASP), sem transportar entidades ou autorização do servidor para os clientes.

## Opções consideradas

| Decisão | Opções e consequências |
| --- | --- |
| Workspace | pnpm único preservando backend/frontend reduz movimentos; árvore plana `apps/*` também permite compartilhar, mas muda mais caminhos; instalações separadas exigem distribuição e versionamento adicionais |
| Gerenciador | pnpm tem workspaces e protocolo `workspace:*`; npm e Yarn também têm workspaces, mas exigiriam convenções diferentes da proposta já documentada |
| Contratos | OpenAPI como fonte aproveita o contrato design-first; Zod gerando OpenAPI inverteria a autoria; manter dois esquemas manuais concorrentes favorece divergência |
| Execução de tarefas | pnpm atende a organização; Turborepo adiciona grafo de tarefas e cache quando houver tarefas executáveis |

## Decisão de Pedro

Um workspace pnpm na raiz preserva `backend/apps/api`, `frontend/apps/mobile`, `frontend/apps/catalogo-componentes` e `frontend/packages/{ui,design-tokens}`. Apenas `shared-types` e `config` ficam em `packages/` na raiz, com uma única definição por nome. `backend/` e `frontend/` são agrupamentos, não raízes independentes de instalação. Há um `package.json` raiz privado e um `pnpm-workspace.yaml`.

Antes da primeira instalação, fixar versões compatíveis de Node e pnpm e registrar `packageManager`; gerar e versionar um único `pnpm-lock.yaml` real na raiz. Na implementação, o CI usará instalação congelada. Não criar lockfile fictício nem escolher versões implicitamente. Dependências pertencem ao consumidor, com `workspace:*` para pacotes internos; configuração de ferramentas entra em `devDependencies`. Não usar aliases de caminhos para contornar manifests.

OpenAPI 3.1 é fonte dos contratos HTTP; AsyncAPI 3.0 é fonte das mensagens de tempo real. Tipos e esquemas estruturais compartilhados serão gerados em `packages/shared-types`; não manter cópias manuais Zod/TypeScript concorrentes. DTOs de resposta por perfil também seguem o contrato, com mapeamento local na borda. Regras de negócio e autorização continuam no servidor. Configurações comuns de ferramentas ficam em `packages/config`, com presets de plataforma; ambiente e segredos permanecem nos apps/infra.

Turborepo será adotado quando houver tarefas executáveis de geração, compilação e verificação. Então a geração precederá os consumidores, o build respeitará dependências e o cache declarará entradas, saídas e variáveis relevantes. Não configurar tarefas vazias ou afirmar que cache garante conformidade.

## Consequências e limites

- Apps dependem de pacotes; pacotes nunca dependem de apps. `shared-types` não importa NestJS ou React Native. `ui` pode depender de tokens e contratos públicos, sem acessar API ou sessão.
- Uma alteração de contrato atualiza fonte e artefatos na mesma mudança. A compatibilidade com clientes mobile já distribuídos continua necessária; regeneração conjunta não autoriza quebra da API.
- Geração não substitui validação em execução nem testes de conformidade. Regras dinâmicas não são duplicadas em esquemas estruturais.
- A aceitação deste ADR não aceita os demais ADRs, contratos propostos ou decisões de produto pendentes. As estruturas continuam sem implementação funcional, dependências ou scripts.

## Critérios de validação antes da implementação

1. Selecionar e fixar ferramenta após PoC de OpenAPI 3.1/JSON Schema, AsyncAPI 3.0, referências entre arquivos, enums, nulabilidade, campos obrigatórios/opcionais e composição efetivamente usados; falhar explicitamente em recurso não suportado. Validar esquemas em execução, entradas e respostas por perfil e eventos. Se houver adaptadores distintos para HTTP/eventos, ambos partem dos contratos canônicos.
2. Demonstrar geração determinística, consumo Node/Expo e detecção no CI de artefatos desatualizados. Se o gerador gerar apenas tipos, complementar validação estrutural a partir da mesma fonte; não escrever esquemas equivalentes à mão. Definir build/exports dos pacotes e integração Metro/Nest antes de usá-los.
3. Validar instalação limpa com lockfile congelado, ausência de nomes duplicados e imports proibidos, build dos consumidores e testes de conformidade. Estas verificações executáveis ainda não foram realizadas.

## Referências

- [Arquitetura, seção 5.3](../01-arquitetura.md#53-organização-técnica-e-workspaces)
- [Contrato da API](../../05-backend/api/README.md)
- [Workspaces pnpm](https://pnpm.io/workspaces)
- [Monorepos Expo](https://docs.expo.dev/guides/monorepos/)
- [Tarefas Turborepo](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)
