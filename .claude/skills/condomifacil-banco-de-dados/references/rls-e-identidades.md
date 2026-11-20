# RLS e identidades

Fontes: [ADR-001](../../../../docs/03-arquitetura/adr/001-multi-tenant-rls.md) (**Aceito** com ressalvas em 20/11/2026), [política de acesso a dados](../../../../docs/04-banco-de-dados/02-politica-de-acesso-a-dados.md) (Proposta), [pacote da fase 2](../../../../docs/09-infra/pacote-tecnico-fase-2.md) (identidades, linhas 90-98, Proposta, E6). Uso pela API (`TenantContext`, pool, Kysely): [dados, RLS e sessões](../../condomifacil-backend/references/dados-rls-e-sessoes.md). Nada disto está **Implementado** como produto.

## 1. Contexto da transação (Aceito no ADR-001)

- A API define o contexto com `set_config('app.condominio_id' | 'app.usuario_id' | 'app.unidade_id' | 'app.papel', valor, true)` **dentro** de `BEGIN ... COMMIT`.
- Nunca `SET` de sessão: vaza entre requisições no pool (provado na P3 e na P5).
- Falha fechada: sem contexto, zero linhas.
- Funções `STABLE` leem `nullif(current_setting('app.condominio_id', true), '')::uuid`.

## 2. Forma da política

```sql
alter table <t> enable row level security;
alter table <t> force row level security;
create policy tenant on <t> for all to app_user
  using (condominio_id = app.condominio_atual())
  with check (condominio_id = app.condominio_atual());
```

O schema `app` é o da PoC; no produto, objetos em `condomifacil`, histórico do Flyway em `infra_migracoes` e `btree_gist` em `extensoes` (estratégia, seção 4.2).

| Regra | Fonte |
| --- | --- |
| RLS habilitada **e** forçada em toda tabela de condomínio | ADR-001 |
| Unidade e papel em políticas adicionais; a API aplica a regra, a RLS é rede de segurança | ADR-001, política |
| Proibido combinar políticas que ampliem por OR (políticas permissivas somam por OR) | Política, linha 92 |
| Distinguir USING de WITH CHECK; apagar exige regra explícita; ler não basta para apagar | Política, linhas 100-102 |
| RLS não substitui privilégio por coluna nem DTO | Política |
| `condominio_id` nulo nunca é acesso a todos | Política, linha 110 |
| Tabelas globais não são legíveis automaticamente | Política |
| Administradora multi-condomínio: um condomínio por vez no contexto | Política |
| Quarentena do gateway: global, só backend e Admin | Política |

Exceções sem RLS (Aceito, exceção do módulo `autenticacao` em 20/11/2026): só `sessao`, `desafio_acesso` e `controle_login`, listadas explicitamente no teste de catálogo. Lista consolidada das tabelas globais com e sem RLS: **Pendente** (não existe).

SECURITY DEFINER: ADR-001 (linha 46) e estratégia (seção 4.4) admitiam função pequena e revisada; **substituído** por E7 (aprovada por Pedro em 20/11/2026): proibido, com teste de catálogo exigindo a ausência.

Referências oficiais: [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 3. Identidades de banco (pacote linhas 90-98; E6 aprovada por Pedro em 20/11/2026)

| Identidade | Papel | Restrições |
| --- | --- | --- |
| provisionamento | Superusuário só no Docker local e no CI; cria schemas e a extensão `btree_gist` | Nunca em ambiente compartilhado |
| migrador | Dono dos objetos; usado só pelo Flyway | Sem BYPASSRLS |
| `app_user` | API e worker | NOSUPERUSER, NOBYPASSRLS, NOINHERIT, não dono; sem TRUNCATE, REFERENCES nem TRIGGER |
| `app_autenticacao` | Módulo `autenticacao` | Só colunas de credencial em `usuario`, `sessao`, `desafio_acesso`, `controle_login` |
| fixtures | Carga de dados de teste | BYPASSRLS só em banco descartável |

A estratégia (seção 4.1) foi alinhada a E6; a identidade de backfill fica a definir antes do primeiro backfill.

Exemplos de forma (PoC descartável): `pocs/rm-16/p3/sql/00-papeis.sql` (papéis), `pocs/rm-16/p3/sql/01-esquema.sql` (políticas), `pocs/rm-16/p5/test/p5b-catalogo.test.ts` (teste de catálogo).

## 4. Checklist de revisão de política

- [ ] `ENABLE` e `FORCE` presentes; política para cada comando necessário, inclusive DELETE explícito ou ausente de propósito.
- [ ] WITH CHECK impede gravar em outro condomínio ou trocar `condominio_id`.
- [ ] Nenhuma política permissiva adicional amplia o acesso por OR.
- [ ] `GRANT` mínimo por tabela (e por coluna quando houver dado `_protegido`).
- [ ] Testado como `app_user` real, com acesso negado.
