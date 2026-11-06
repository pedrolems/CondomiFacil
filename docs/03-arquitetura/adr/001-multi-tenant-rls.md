# ADR-001: Multi-tenant com banco compartilhado, `condominio_id` e RLS

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** prova de conceito de RLS com carga (RNF-17)
- **Relacionado a:** [ADR-007](007-autorizacao-jwt-sem-papeis.md), [ADR-008](008-orm-query-builder-migracoes.md), [ADR-006](006-fila-agendador-eventos.md), [ADR-010](010-anonimato-identidade-separada.md)

## Contexto

O tenant do CondomiFacil é o **condomínio**. Os requisitos que moldam a escolha:

- RNF-11: dados de um condomínio nunca são visíveis a outro.
- SEG-05: isolamento entre condomínios por Row Level Security no PostgreSQL.
- RNF-10: 100 condomínios e 15.000 usuários no lançamento; um condomínio com até 5.000 unidades e 10 portarias, sem mudar a arquitetura.
- RNF-18: limite de gasto com alertas. A Visão de Produto fixa meta de custo de R$ 17 a 28 por condomínio.
- RNF-01: 95% das requisições abaixo de 500 ms. Política de RLS cara degrada esse número.
- O PRD seção 10 já indica PostgreSQL com RLS. Esta ADR registra o desenho e o que falta provar.

Existem também dois níveis dentro do tenant: **unidade** e **papel** (SEG-17, SEG-18, SEG-07). Um usuário pode ter vínculos em vários condomínios e unidades (RN-CD-05, RF-AC-04). Uma administradora atende vários condomínios (RN 3).

## Opções consideradas

| Critério | Banco por tenant | Schema por tenant | Banco compartilhado + `condominio_id` + RLS |
| --- | --- | --- | --- |
| Isolamento | Físico, o mais forte | Lógico por schema | Forte se a RLS for correta e testada; o risco é erro de política |
| Operação com 100 condomínios | 100 bancos | 100 schemas | 1 banco |
| Migrações | Rodar em N bancos | Rodar em N schemas, risco de divergência | Uma vez |
| Conexões | Pool por banco, explode | Pool compartilhado com `search_path` | Pool único |
| Vínculos entre condomínios (usuário, administradora) | Exige camada extra | Possível, desajeitado | Natural |
| Custo (RNF-18) | Alto | Médio | Baixo |
| Backup de um tenant | Fácil | Média | Difícil, exige extração |
| Condomínio gigante | Migra fácil | Migra com esforço | Exige plano de evolução |
| Aderência ao PRD 10 | Contraria | Contraria | É o que o PRD indica |

## Decisão (proposta)

Adotar **banco PostgreSQL compartilhado**, com `condominio_id uuid not null` em toda tabela de tenant e RLS aplicada por um papel de banco sem privilégio de contorná-la. Detalhes da proposta (arquitetura seções 4.2 a 4.4):

1. **Papel `app_user`** sem `BYPASSRLS`, que não é dono das tabelas. As tabelas usam `ENABLE` e `FORCE ROW LEVEL SECURITY`. Migrações rodam com outro papel (dono), em etapa separada do deploy.
2. **Contexto por transação.** O `TenantContext` abre `BEGIN` e chama `set_config('app.condominio_id', ..., true)` (equivalente parametrizável de `SET LOCAL`), além de `app.usuario_id`, `app.unidade_id` e `app.papel`. As variáveis somem no `COMMIT`, então a conexão volta limpa ao pool. Nunca usar `SET` de sessão.
3. **Falha fechada.** Sem `app.condominio_id`, a política resolve para nenhuma linha.
4. **`TenantContext` é o único caminho** de acesso ao banco, na API e nos jobs. Uma regra de lint proíbe usar o pool diretamente.
5. **Chaves estrangeiras compostas** com `condominio_id` (ex.: `reserva(condominio_id, unidade_id)` referencia `unidade(condominio_id, id)`), para que um bug de aplicação não aponte para registro de outro condomínio.
6. **Segundo nível** (unidade e papel) por políticas adicionais sobre `app.unidade_id`, `app.usuario_id` e `app.papel`. A API aplica a regra primeiro; a RLS é a rede de segurança.
7. **Travessias da fronteira** só por funções ou visões `SECURITY DEFINER` pequenas e revisadas (administradora com vários condomínios, jobs globais). Nenhum papel de caminho de requisição de usuário tem `BYPASSRLS`. Tabelas de plataforma ficam fora do tenant e são listadas explicitamente.
8. **Proibir junções entre tenants** nos caminhos de requisição de usuário, o que preserva a evolução para banco dedicado.

Evolução se um tenant crescer demais, em ordem de custo: réplica de leitura e mais instâncias; particionar tabelas grandes (visita, notificação, auditoria, `evento_gateway`); fila e canal dedicados; tenant em banco dedicado ("célula"), com tabela `condominio.celula` e `TenantContext` escolhendo a conexão. Schema por tenant não é caminho de evolução.

## Consequências

**Positivas**

- Uma única instância para operar, migrar e fazer backup; custo compatível com RNF-18.
- Consultas com vínculos entre condomínios são simples.
- Alinhado ao PRD 10 e a SEG-05; sem reabrir decisão de produto.

**Negativas**

- O isolamento depende da qualidade das políticas. Uma política errada ou ausente vaza dados entre condomínios (RNF-11).
- Restaurar um único condomínio exige extração, não restauração simples.
- Exige disciplina: todo acesso passa pelo `TenantContext`, o que limita ORMs que escondem a conexão (ver ADR-008).

**Riscos**

- Política de RLS cara pode degradar RNF-01; funções de política devem ser `STABLE` e as colunas indexadas.
- Tabela nova sem política. Mitigado pelo teste de catálogo de RLS no CI.
- Vazamento de contexto no pool, se alguém usar `SET` de sessão. Mitigado por teste dedicado.
- Painel da administradora, que atravessa condomínios, precisará consultar por célula caso um tenant migre para banco dedicado.

## Critérios de validação e o que falta para aceitar

- **Prova de conceito de RLS com carga:** 5.000 unidades e 10 portarias com RLS ativa, mantendo RNF-01 e RNF-05 (RNF-17), com `EXPLAIN` das consultas críticas.
- **Testes de isolamento obrigatórios no CI** (arquitetura 4.11), que bloqueiam o merge: catálogo de RLS (habilitada, forçada, com política), papel de banco sem `BYPASSRLS`, dois tenants em leitura e escrita, sem contexto, vazamento de contexto no pool, API ponta a ponta (404, nunca 403 que confirme existência), vínculos, papéis, anonimato, WebSocket, arquivos, jobs, offline.
- Teste de penetração focado em tenant antes do lançamento (proposta).
- Confirmação do Pedro de que o custo e o risco residual de RLS são aceitos.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 4.1 a 4.11, 5.1, 7 (SEG-05), 9.4.
- `docs/01-produto/02-prd.md`: seção 10; RNF-10, RNF-11, RNF-17, RNF-18; SEG-05.
- `docs/01-produto/03-regras-de-negocio.md`: RN-CD-05, RN-CD-16, RN-PL-06.
- Visão de Produto (`docs/01-produto/01-visao-de-produto.md`): meta de custo por condomínio.
