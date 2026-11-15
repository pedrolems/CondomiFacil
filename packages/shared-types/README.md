# Contratos compartilhados

Pacote canônico de transporte da API e dos clientes. Decisão de Pedro em 14/11/2026, registrada no [ADR-015](../../docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md).

Os contratos HTTP em `docs/05-backend/api/openapi/` são a fonte para gerar tipos TypeScript, esquemas de validação estrutural, estados e códigos públicos de erro. Mensagens de tempo real têm fonte em `docs/05-backend/api/asyncapi/tempo-real.yaml`. Não editar os artefatos gerados nem manter DTOs ou esquemas Zod manuais equivalentes. Esquemas HTTP e de eventos não se redefinem entre si: referenciar componentes comuns quando aplicável.

O gerador, sua versão, os exports e a compilação serão definidos após prova de conceito. A prova deve cobrir os recursos efetivamente usados de OpenAPI 3.1/JSON Schema e AsyncAPI 3.0, referências entre arquivos, nulabilidade, obrigatoriedade, enums, composição e erros, além de validar consumo por Node e Expo. Zod só será usado nos contratos se o fluxo de geração preservar sua semântica; não é uma segunda fonte. Nenhum tipo ou esquema foi gerado nesta preparação.

DTOs de entrada e resposta por perfil pertencem ao contrato. Mapeadores de resposta ficam na borda HTTP; entidades, permissões, acesso a banco, parâmetros dinâmicos e regras de negócio ficam no servidor. O pacote não importa apps, NestJS, React Native ou segredos. Consumidores futuros declaram `@condomifacil/shared-types: workspace:*` em suas dependências reais.

Na implementação, o CI validará os contratos, regenerará os artefatos com ferramenta fixada e falhará se houver diferença não registrada; testes de conformidade verificarão requisições, respostas e eventos. O fluxo deve detectar uma alteração de campo sem regeneração. Não há gerador, scripts, testes ou CI executáveis neste pacote.
