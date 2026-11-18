# apps/api/src/interfaces/http/comum

Borda HTTP do perfil: valida entrada, chama caso de uso pela fachada e monta DTO de resposta. Não conter regras de negócio; autorização contextual independente da pasta.

Existe hoje `GET /v1/saude` (`saude.controller.ts`, sem banco) e o middleware `X-Request-Id` (`request-id.ts`).

Demais itens: estrutura sem implementação. Fonte: docs/05-backend/01-backend.md, seção 3 e atualizações.
