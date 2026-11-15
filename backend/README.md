# Backend do CondomiFacil

Estrutura inicial de 14/11/2026, sem implementação. Arquivos TypeScript contêm somente comentários; diretórios ainda sem arquivos definidos têm READMEs.

Esta pasta agrupa a API e o worker no workspace pnpm único da raiz, junto ao frontend. Não é uma raiz independente de instalação. Decisão de Pedro em 14/11/2026: [ADR-015](../docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md).

| Caminho | Finalidade |
| --- | --- |
| apps/api/src/interfaces | HTTP por perfil, WebSocket, sincronização e webhooks |
| apps/api/src/modulos | Núcleo por domínio e camadas |
| apps/api/src/rotinas | Agendamento e execução de jobs |
| apps/api/src/integracoes | Adaptadores de serviços externos |
| apps/api/src/compartilhado | Recursos transversais |
| apps/api/test | Isolamento, integração e ponta a ponta |
| apps/api/db | Migrações e seeds futuros |
| ../packages/shared-types | Tipos e esquemas a gerar dos contratos OpenAPI/AsyncAPI |
| ../packages/config | Presets compartilhados de ferramentas, sem segredos |

As entradas/montagens da API e worker e o exemplo de reservas reproduzem os arquivos explícitos da seção 3 da documentação. Os demais módulos recebem a mesma organização interna, sem novos casos de uso.

O manifesto de apps/api apenas identifica o pacote privado, sem dependências, versões ou scripts. A instalação será coordenada pela raiz, com um único lockfile real; versões de Node/pnpm e packageManager serão fixados antes da primeira instalação. Não há serviço executável, testes ou migrações implementados. Antes da execução será necessário implementar a montagem, fixar dependências e configurar compilação, lint e testes. O modelo .env.example contém nomes propostos com valores vazios.

A criação da estrutura não aceita automaticamente ADRs ou contratos e não resolve pendências de negócio ou segurança. Relatórios são jobs privados sob demanda, sem nova rotina diária.

Fontes:

- [Backend](../docs/05-backend/01-backend.md)
- [Contrato da API](../docs/05-backend/api/README.md)
- [Migrações e seeds](../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md)
- [Variáveis e segredos](../docs/09-infra/infra-e-devops.md)
