# apps/api/db/migracoes

Migrations SQL versionadas do Flyway 13.12.2 OSS (ADR-008, aceito com ressalvas em 20/11/2026), aplicadas só pelo papel `migrador`, por ligação direta. Instalação e comandos em `../README.md`; configuração em `../flyway.conf`.

| Versão | Conteúdo |
| --- | --- |
| `V202611210001__fundacao_condominio.sql` | `USAGE` do `app_user` em `condomifacil`, função `condominio_atual()` e tabela `condominio` (RLS habilitada e forçada; `app_user` só lê o próprio tenant) |
| `V202611210002__catalogo_de_parametros.sql` | Catálogos globais `parametro_definicao` e `parametro_padrao` (E4), RLS forçada e leitura pelo `app_user` |
| `V202611210003__carga_parametros.sql` | CHECK do vocabulário de `tipo`, política `FOR INSERT TO migrador` nos dois catálogos e carga versionada dos 36 parâmetros da RN 13 (35 padrões; `reserva.valor` sem padrão), vigentes desde 21/11/2026 00:00 em America/Sao_Paulo |

`parametro_condominio` e a FK `parametro_padrao.registrado_por_id -> usuario` entram no RM-20.

## Regras

- Nome `VAAAAMMDDNNNN__descricao_sem_acentos.sql`, UTF-8 e LF; forward-only; migration aplicada em ambiente compartilhado nunca é editada (o `validate` estrito recusa alterada, removida e fora de ordem).
- Cabeçalho com objetivo, referência, pré-condições, compatibilidade, risco de lock e recuperação; `set local lock_timeout` e `set local statement_timeout` finitos; nada de `SET` de sessão.
- Entidade, grants e políticas na mesma migration transacional; toda tabela de `condomifacil` com `ENABLE` e `FORCE ROW LEVEL SECURITY` e política para cada privilégio do `app_user`; sem `SECURITY DEFINER` (E7).
- `CREATE INDEX CONCURRENTLY` sempre reexecutável (`drop index concurrently if exists` + `create`) e com `<arquivo>.sql.conf` contendo `executeInTransaction=false`.
- O teste de catálogo (`test/isolamento/catalogo.test.ts`) falha para tabela nova sem RLS, sem política ou com dono diferente de `migrador`.
