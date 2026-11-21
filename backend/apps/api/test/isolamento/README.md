# apps/api/test/isolamento

Testes contra o PostgreSQL 17 real, conectados como os papéis reais (`app_user` nas provas de acesso). Rodam com `pnpm --filter @condomifacil/api test:banco` (exige Docker localmente ou o Postgres de serviço no CI) e ficam fora do `test` comum, para o `pnpm check` não depender de banco.

`preparar.ts` executa a instalação limpa (`db/scripts/instalar.ts`, o mesmo do `db:instalar`) no banco `condomifacil_teste`; os demais bancos `condomifacil_teste_*` são criados e removidos por cada arquivo.

| Arquivo | Prova |
| --- | --- |
| `instalacao.test.ts` | (a) instalação limpa por um comando e repetição sem reaplicar; (g) recriar e recarregar dá o mesmo inventário (hash) |
| `flyway.test.ts` | (b) `validate` estrito recusa migration alterada, removida (inclusive a última, com controle pelo padrão `*:future`) e fora de ordem, em cópia temporária |
| `catalogo.test.ts` | (c) RLS habilitada e forçada, dono `migrador`, privilégios do `app_user` cobertos por política, sem `SECURITY DEFINER`, `TRUNCATE`, `REFERENCES` e `TRIGGER`, 42501 em `infra_migracoes`, exceções explícitas (vazias) e controle negativo; (d) `app_user` não dono e sem BYPASSRLS, sem desligar a RLS, truncar ou contornar com `row_security = off`; constraint E4 |
| `parametros.test.ts` | Carga da RN 13: 36 definições, 35 padrões, cada padrão no tipo e na faixa, origem `carga_versionada` com a versão da migration, níveis, e política de carga só para o `migrador` |
| `isolamento.test.ts` | (e) dois condomínios: contexto A vê só A, sem contexto vê zero, sem vazamento na mesma conexão (pool de 1) inclusive após erro; controle negativo com `set_config(..., false)` |
| `fixtures.test.ts` | (f) carga recusada fora de banco descartável (host e marcador) e com namespace repetido |

`apoio.ts` reúne a auditoria do catálogo, o inventário e a criação de bancos temporários.
