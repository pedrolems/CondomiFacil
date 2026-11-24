# apps/api/db/migracoes

Migrations SQL versionadas do Flyway 13.12.2 OSS (ADR-008, aceito com ressalvas em 20/11/2026), aplicadas só pelo papel `migrador`, por ligação direta. Instalação e comandos em `../README.md`; configuração em `../flyway.conf`.

| Versão | Conteúdo |
| --- | --- |
| `V202611210001__fundacao_condominio.sql` | `USAGE` do `app_user` em `condomifacil`, função `condominio_atual()` e tabela `condominio` (RLS habilitada e forçada; `app_user` só lê o próprio tenant) |
| `V202611210002__catalogo_de_parametros.sql` | Catálogos globais `parametro_definicao` e `parametro_padrao` (E4), RLS forçada e leitura pelo `app_user` |
| `V202611210003__carga_parametros.sql` | CHECK do vocabulário de `tipo`, política `FOR INSERT TO migrador` nos dois catálogos e carga versionada dos 36 parâmetros da RN 13 (35 padrões; `reserva.valor` sem padrão), vigentes desde 21/11/2026 00:00 em America/Sao_Paulo |
| `V202611230001__auditoria_outbox_idempotencia.sql` | RM-24: `auditoria` (tenant) e `auditoria_plataforma` (global) append-only por gatilho; outbox `evento_saida` por condomínio; `requisicao_idempotente` (E17, guarda de 24 h); função `escopo_atual()` (`app.escopo` = `plataforma` para incluir na auditoria de plataforma; `sistema`, sem tenant, para o despachante listar pendentes) |

| `V202611240001__usuario_e_autenticacao.sql` | RM-20: `usuario` (RLS forçada; titular lê a própria linha sem `senha_hash` e muda só o tema; `app_autenticacao` lê e grava só as colunas de credencial), `usuario_atual()`, `sessao` (retry B+E do ADR-007 numa linha; refresh no formato `<sessao_id>.<segredo>`, com a sessão buscada pela PK), `desafio_acesso` (um ativo por destino e finalidade) e `controle_login`, sem RLS e só para o `app_autenticacao`; FKs para `usuario` em `parametro_padrao.registrado_por_id`, `auditoria.ator_usuario_id`, `auditoria_plataforma.ator_usuario_id` e `requisicao_idempotente.usuario_id` |
| `V202611240002__documentos_e_aceites.sql` | RM-20: `documento` (constraint trigger diferida: só existe com versão na mesma transação), `documento_versao` e `aceite`; global legível com titular, de condomínio só no contexto dele; versão e aceite herdam; publicação só por fixture; índices únicos `documento_tipo_global` (`tipo`) e `documento_tipo_condominio` (`condominio_id`, `tipo`) |
| `V202611240003__parametro_condominio.sql` | RM-20: `parametro_condominio` (tenant), histórico imutável; `app_user` lê e inclui no próprio tenant com o titular como autor |

Exceções sem RLS (ADR-007): só `sessao`, `desafio_acesso` e `controle_login`, listadas em `test/isolamento/apoio.ts`; o `app_user` não tem privilégio nelas.

## Regras

- Nome `VAAAAMMDDNNNN__descricao_sem_acentos.sql`, UTF-8 e LF; forward-only; migration aplicada em ambiente compartilhado nunca é editada (o `validate` estrito recusa alterada, removida e fora de ordem).
- Cabeçalho com objetivo, referência, pré-condições, compatibilidade, risco de lock e recuperação; `set local lock_timeout` e `set local statement_timeout` finitos; nada de `SET` de sessão.
- Entidade, grants e políticas na mesma migration transacional; toda tabela de `condomifacil` com `ENABLE` e `FORCE ROW LEVEL SECURITY` e política para cada privilégio do `app_user`; sem `SECURITY DEFINER` (E7).
- `CREATE INDEX CONCURRENTLY` sempre reexecutável (`drop index concurrently if exists` + `create`) e com `<arquivo>.sql.conf` contendo `executeInTransaction=false`.
- O teste de catálogo (`test/isolamento/catalogo.test.ts`) falha para tabela nova sem RLS, sem política ou com dono diferente de `migrador`.
