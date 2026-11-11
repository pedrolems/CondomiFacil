# ADR-013: RPO, RTO e política de backup e PITR

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** custo (RNF-18) e revisão da nuvem ([ADR-004](004-nuvem-regiao-residencia-dados.md), Aceito com ressalvas em 10/11/2026 só para construir o MVP). **RPO e RTO não são atendidos no plano gratuito do Supabase (sem PITR, conforme consulta de 10/11/2026) e dependem da revisão do ADR-004 antes do piloto**
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-004](004-nuvem-regiao-residencia-dados.md)

## Contexto

O RNF-13 define backup diário, retenção de 7 dias e teste de restauração por mês. O RNF-09 define disponibilidade de 99,5% ao mês (cerca de 3,6 h de indisponibilidade tolerada). **RPO e RTO não estão definidos.**

Com só backup diário, a perda aceitável seria de até 24 h de dados, que incluem pagamentos, votos e finanças. Confirmações de pagamento perdidas poderiam ser recuperadas parcialmente pela conciliação diária com o gateway (SEG-17), mas votos e lançamentos manuais não.

Fatores adicionais:

- Mês financeiro fechado é imutável (SEG-18), então perda de dados já fechados seria grave.
- A LGPD exige que o titular excluído não "volte" ao restaurar um backup (SEG-11, RF-LG-02).
- Isolamento por RLS: um tenant só se restaura por extração ([ADR-001](001-multi-tenant-rls.md)).
- Custo limitado (RNF-18).
- Arquivos (fotos, atas) são parte da restauração.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Só backup diário, 7 dias (RNF-13)** | Mais barato; atende o requisito escrito | RPO de até 24 h; sem recuperação a um instante antes de um erro |
| **B. Backup diário + PITR (recuperação a qualquer ponto), 7 dias** | RPO muito menor; permite voltar a antes de uma migração errada | Custo maior; depende do PostgreSQL gerenciado oferecer PITR |
| **C. B + réplica em outra zona** | Também sustenta a disponibilidade | Custo ainda maior |

Os documentos não trazem custos por opção.

## Decisão (proposta)

Opção **B** como meta, condicionada ao custo, com os números abaixo como **metas a validar, não como compromisso**:

- **RPO ≤ 15 min** e **RTO ≤ 4 h**.
- Backup diário automático do PostgreSQL gerenciado, retenção de 7 dias, mais PITR.
- **Teste de restauração mensal** (RNF-13) em ambiente isolado: restaurar, subir a API e rodar a suíte de isolamento e de integridade (soma de lançamentos; cobranças x pagamentos).
- Objetos: versionamento do bucket e replicação opcional; arquivos entram na restauração.
- **Reaplicar exclusões LGPD** feitas desde o backup, mantendo um registro de pedidos de exclusão e anonimizações. A retenção de 7 dias dos backups deve constar na política de privacidade.
- Alta disponibilidade: ao menos duas instâncias de API e réplica do banco em zona diferente, para sustentar 99,5% durante deploys e falhas (custo a validar contra RNF-18).
- Ponto de restauração imediatamente antes de cada migração em produção.

Se o custo de PITR não couber, a ADR volta à opção A e o RPO de 24 h passa a ser aceito de forma explícita.

## Consequências

**Positivas**

- RPO e RTO explícitos permitem planejar e testar a recuperação.
- PITR cobre erro humano e migração malsucedida.
- A restauração mensal prova que o backup serve.

**Negativas**

- Custo maior que o do requisito mínimo.
- Reaplicar exclusões LGPD exige um registro próprio e um procedimento no runbook.

**Riscos**

- Disponibilidade de 99,5% com equipe pequena (arquitetura 9.4).
- Backup que retém dado excluído (LGPD). Mitigação: política de 7 dias e reaplicação de exclusões ao restaurar.
- Metas de RPO e RTO não validadas podem ser inatingíveis no provedor escolhido.
- Retenção de logs e auditoria é lacuna separada.

## Critérios de validação e o que falta para aceitar

- Definição dos números de RPO e RTO pelo Pedro, a partir do impacto de negócio.
- Confirmação de PITR no PostgreSQL gerenciado da [ADR-004](004-nuvem-regiao-residencia-dados.md) (o plano gratuito do Supabase não tem PITR; o provedor e o plano do piloto saem da revisão do ADR-004) e do custo contra RNF-18.
- Primeiro teste de restauração em staging, com tempo medido contra o RTO.
- Procedimento escrito de reaplicação de exclusões LGPD.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 6.9, 7, 8 (RNF-09, RNF-13), 9.4.
- `docs/01-produto/02-prd.md`: RNF-09, RNF-13, RNF-18; SEG-11, SEG-17, SEG-18; RF-LG-02.
