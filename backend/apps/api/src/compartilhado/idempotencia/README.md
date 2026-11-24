# apps/api/src/compartilhado/idempotencia

Implementado (RM-24, E17): `Idempotencia.executar`, Idempotency-Key opcional em POST com contexto de condomínio. A guarda de 24 h é gravada na mesma transação do ato; corpo diferente com a mesma chave dá 422 `CHAVE_DE_IDEMPOTENCIA_REUTILIZADA`. Não importar módulos de domínio.
