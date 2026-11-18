# apps/api/src/compartilhado/config

Leitura e validação de variáveis com Zod; consultar apps/api/.env.example. Não importar módulos de domínio.

Existe hoje `config.ts`: `lerConfig` valida `APP_ENV`, `PORT` e `CORS_ALLOWED_ORIGINS` com Zod e falha sem expor valores.

Demais itens: estrutura sem implementação. Fonte: docs/05-backend/01-backend.md, seção 3 e atualizações.
