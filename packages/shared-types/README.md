# Contratos compartilhados

Pacote canônico de transporte da API e dos clientes. Decisão de Pedro em 14/11/2026, registrada no [ADR-015](../../docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md).

Os contratos HTTP em `docs/05-backend/api/openapi/` são a fonte para gerar tipos TypeScript, esquemas de validação estrutural, estados e códigos públicos de erro. Mensagens de tempo real têm fonte em `docs/05-backend/api/asyncapi/tempo-real.yaml`. Não editar os artefatos gerados nem manter DTOs ou esquemas Zod manuais equivalentes. Esquemas HTTP e de eventos não se redefinem entre si: referenciar componentes comuns quando aplicável.

Gerador (prova P1, RM-12): `openapi-typescript` gera os tipos e `scripts/gerar.mjs` extrai o JSON Schema do mesmo contrato (OpenAPI de `comum.yaml` com seus `$ref` e AsyncAPI de `tempo-real.yaml`, lido pelo `@asyncapi/parser`); o Ajv valida em execução (`validarComum`, `validarEventoTempoReal`). Palavra-chave de esquema que os tipos não traduzem sem perda faz a geração falhar. Zod não é usado. Saída versionada em `src/gerado/`. Comandos: `pnpm --filter @condomifacil/shared-types gerar-contratos`, `verificar-contratos` (`git diff --exit-code` nos artefatos), `typecheck`, `build`, `test`. A importação por Expo/Metro fica para o RM-13.

DTOs de entrada e resposta por perfil pertencem ao contrato. Mapeadores de resposta ficam na borda HTTP; entidades, permissões, acesso a banco, parâmetros dinâmicos e regras de negócio ficam no servidor. O pacote não importa apps, NestJS, React Native ou segredos. Consumidores futuros declaram `@condomifacil/shared-types: workspace:*` em suas dependências reais.

O CI (RM-15) regenerará os artefatos com a ferramenta fixada e falhará se houver diferença não registrada (`verificar-contratos`); testes de conformidade verificarão requisições, respostas e eventos.
