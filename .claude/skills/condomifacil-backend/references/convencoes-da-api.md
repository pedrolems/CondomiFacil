# Convenções da API e estrutura do código

Fontes: [guia da API](../../../../docs/05-backend/api/01-guia-da-api.md), [01-backend.md](../../../../docs/05-backend/01-backend.md), [README da API](../../../../docs/05-backend/api/README.md). Tudo é **proposta de 10/11/2026**, salvo o que está marcado como aceito ou implementado.

## Estrutura (decidida por Pedro em 09/11/2026; árvore em 01-backend.md linhas 86-153)

- **Implementado**: `main.api.ts`, `main.worker.ts` (stub), `api.module.ts`, `worker.module.ts`, `compartilhado/config/config.ts`, `interfaces/http/comum/saude.controller.ts`, `request-id.ts`. O `request-id` gera o `X-Request-Id` no servidor e nunca aceita o do cliente; CORS só nas origens configuradas, nunca `*`; `x-powered-by` desligado. O restante (`modulos/`, `rotinas/`, `integracoes/`, `compartilhado/*`) tem só README.
- **Proposta** (linhas 194-203): interface chama módulo só pelo `index.ts`; `dominio/` sem NestJS, banco ou outros módulos; `compartilhado/` não importa `modulos/`; `integracoes/` só implementa portas.
- Perfis (linhas 211-224): comum, morador, sindico (usa também morador), limpeza, portaria, administradora, plataforma, conselho-fiscal, proprietario-nao-residente. `comum/` guarda DTO igual em 3 ou mais perfis. "A pasta organiza, não protege": autorização em guards e RLS.
- Nomes em kebab-case com sufixos `.caso-de-uso.ts`, `.repositorio.ts`, `.repositorio-sql.ts`, `.rotina.ts`; eventos `<entidade>.<fato no passado>`.

## Fluxo da requisição (proposta)

Versão (426), autenticação (401), contexto (403), papel (403), unidade (403), validação (Ajv do contrato), `TenantContext`, caso de uso, mesma transação com outbox e auditoria, COMMIT, DTO.

## Caminhos, cabeçalhos e formatos

- `/v1` no caminho; mudança compatível não cria versão; obsoleta com `Deprecation` e `Sunset`. Webhooks ficam fora de `/v1`, sem `Authorization` nem cabeçalhos de contexto.
- `/v1/<perfil>/<recurso>`, kebab-case, plural. Sem prefixo de perfil: `/v1/acesso/*`, `/v1/eu/*`, `/v1/arquivos/*`, `/v1/score`, `/v1/recursos`, `/v1/denuncias`, `/v1/notas-dos-setores`, `/v1/sync`.
- Cabeçalhos: `Authorization: Bearer` (JWT de 15 min só com `sub` e `sid`, ADR-007 aceito), `X-Condominio-Id`, `X-Unidade-Id` (UUID), `X-App-Version`, `Idempotency-Key`, `X-Request-Id`.
- Paginação por cursor: `?limite=20&cursor=...`, máximo 100 (acima: 400); resposta `{ dados, paginacao: { proximo_cursor, tem_mais } }`. Filtros `estado=a,b`, `de`/`ate` (aaaa-mm-dd), `busca`, `ordenar=campo|-campo`; campo não declarado dá 400.
- JSON em snake_case, UUID, ISO 8601 com fuso, dinheiro inteiro com sufixo `_centavos`.
- Arquivos não passam pela API: URL assinada de envio (tipo e tamanho) e de leitura curta; chave `c/{condominio_id}/{modulo}/{uuid}`.
- 429 com `Retry-After`; valores de limite de taxa **pendentes** (E16).

## Erros

Formato `{ codigo, mensagem, detalhes?, request_id }`.

| Código | HTTP |
| --- | --- |
| REQUISICAO_INVALIDA | 400 |
| SESSAO_EXPIRADA | 401 |
| SEM_PERMISSAO, VINCULO_INVALIDO | 403 |
| RECURSO_NAO_ENCONTRADO | 404 |
| CONFLITO_DADO_ALTERADO | 409 |
| REGRA_DE_NEGOCIO_VIOLADA, CHAVE_DE_IDEMPOTENCIA_REUTILIZADA | 422 |
| VERSAO_DO_APP_NAO_SUPORTADA | 426 |
| LIMITE_DE_TAXA_EXCEDIDO | 429 |
| ERRO_INTERNO | 500 |
| SERVICO_INDISPONIVEL | 503 |

- **Aceito por Pedro em 16/11/2026**: estado inválido responde 409 `<MODULO>_ESTADO_INVALIDO` (ex.: `RESERVA_ESTADO_INVALIDO`); prazo, regra temporal e mês fechado respondem 422. Prevalece sobre o texto anterior de 01-backend.md.
- Outro condomínio ou inexistente: 404 idêntico (ADR-001, provado na P3). Vínculo ausente: 403 com corpo idêntico (**pendente**, E8).
- Erro nunca devolve corpo de reclamação, avaliação ou voto (ADR-010, proposto).

## Idempotência

- `Idempotency-Key` em POST que cobra ou reserva: mesma chave e mesmo corpo devolvem a resposta original (proposta). **Aceito** (E17, aprovada por Pedro em 20/11/2026): tabela por condomínio, usuário e chave, hash do corpo, 24 h, 422 se o corpo for diferente.
- Outros mecanismos: sincronização por `op_id` (ADR-003, aceito com ressalvas), webhook por id do evento, rotina por chave única por efeito, consumidor do outbox idempotente.

## Contrato

OpenAPI e AsyncAPI são canônicos (ADR-015, aceito quanto à organização e às fontes). Valide com `pnpm lint:openapi`. Mudança de contrato atualiza a contagem de operações e a tabela de cobertura RF para operação no README da API.

## Lacunas (não invente)

Valores de limite de taxa, expiração da URL de arquivo, mecanismo de reautenticação e comportamento sem `X-App-Version`.
