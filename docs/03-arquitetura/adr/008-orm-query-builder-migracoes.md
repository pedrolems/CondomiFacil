# ADR-008: ORM ou query builder e migrações

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** necessidade de controle da transação (contexto de tenant)
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD fixa Node.js, NestJS e PostgreSQL, mas não a camada de acesso a dados nem a ferramenta de migrações (lacuna 9.3).

Restrições que vêm da arquitetura multi-tenant ([ADR-001](001-multi-tenant-rls.md)):

- Todo acesso passa por um `TenantContext` que abre a transação e chama `set_config(..., true)` antes de qualquer consulta de negócio. A camada de dados precisa dar **controle total da transação e da conexão**.
- Recursos específicos de PostgreSQL entram no desenho: RLS, `EXCLUDE USING gist` para conflito de reservas (sem sobreposição de área e intervalo), gatilhos de imutabilidade em `lancamento` e `auditoria`, funções `SECURITY DEFINER`, `LISTEN/NOTIFY`. O código de migração precisa expressá-los em SQL.
- Migrações rodam com papel **dono**, distinto do `app_user`, em etapa separada do deploy. Somente para frente, no padrão expandir e contrair, com índices em modo concorrente (arquitetura 6.6).
- Toda migração que cria tabela de tenant inclui `condominio_id`, RLS e política; o teste de catálogo de RLS quebra o build se faltar.
- Tipos compartilhados entre app e API por esquemas Zod em `packages/shared-types`.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Kysely** (query builder tipado) | SQL explícito e tipado; transação e conexão sob controle; migrações em SQL ou TypeScript | Menos "mágica" que um ORM; mais código de mapeamento |
| **Drizzle** (query builder/ORM leve, tipado) | Esquema em TypeScript; migrações SQL versionadas | Precisa confirmar que o suporte a RLS, `set_config` por transação e recursos como `EXCLUDE` e gatilhos cabe sem contornos |
| **ORM completo (ex.: TypeORM, Prisma)** | Produtividade em CRUD | ORMs que escondem a conexão complicam o contexto de tenant; recursos específicos de PostgreSQL exigem SQL cru de qualquer modo |

Os documentos mencionam só Kysely e Drizzle. A linha do ORM completo registra a alternativa implícita descartada pela restrição acima.

## Decisão (proposta)

Usar um **query builder tipado, Kysely ou Drizzle**, com **migrações SQL versionadas**. A escolha final entre os dois depende de uma verificação curta do controle de transação.

Critérios de desempate:

1. A transação e a conexão do `TenantContext` são nossas, com `set_config` antes de qualquer consulta.
2. Migração escrita em SQL, capaz de expressar RLS, `FORCE ROW LEVEL SECURITY`, `EXCLUDE`, gatilhos e criação concorrente de índices.
3. Tipos gerados ou inferidos do esquema, compatíveis com Zod.

Regras que valem para qualquer escolha:

- Migrações somente para frente, executadas pelo papel dono, antes do deploy da API.
- Padrão expandir e contrair, compatível com duas versões da API durante o deploy.
- Em produção: ponto de restauração imediatamente antes; migração com tempo limite.
- Ordem: dev, staging (com volume de carga), produção.

## Consequências

**Positivas**

- O contexto de tenant fica simples e verificável: uma só porta de acesso.
- Migrações legíveis e revisáveis; recursos avançados do PostgreSQL ficam à vista.

**Negativas**

- Mais SQL e mapeamento manual do que em um ORM completo.
- A escolha entre Kysely e Drizzle fica em aberto até a verificação.

**Riscos**

- Uma ferramenta que abra conexões fora do `TenantContext` quebraria o isolamento. Mitigação: cliente de banco encapsulado e regra de lint que proíbe usar o pool diretamente.
- Migração com trava longa em tabela grande. Mitigação: índices concorrentes e tempo limite.

## Critérios de validação e o que falta para aceitar

- Prova curta, com cada candidata: abrir transação, `set_config` local, consulta sob RLS, e confirmar que a conexão volta limpa ao pool (teste de vazamento de contexto).
- Escrever uma migração de exemplo com RLS forçada, `EXCLUDE` e gatilho, e rodá-la pelo papel dono.
- Teste de catálogo de RLS funcionando sobre o esquema produzido pela ferramenta.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.6 (restrição de exclusão), 3.11, 4.3, 4.11, 5.2 (itens menores), 6.6, 9.3.
- `docs/01-produto/02-prd.md`: seção 10; SEG-05.
