# ADR-012: Fuso horário por condomínio para rotinas "à meia-noite"

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** decisão de produto
- **Relacionado a:** [ADR-006](006-fila-agendador-eventos.md), [ADR-001](001-multi-tenant-rls.md)

## Contexto

Várias rotinas automáticas são definidas "à meia-noite" ou "no último dia do mês, 23h59" sem dizer em qual fuso (lacuna 9.3). O Brasil tem mais de um fuso e, no caso de condomínios, o dia deve ser o dia local do prédio.

Rotinas afetadas (RN seção 14):

| # | Rotina | Quando | Origem |
| --- | --- | --- | --- |
| 3 | Visitantes que não vieram ("não compareceu") | Diária, meia-noite | RN-VI-09 |
| 6 | Fechamento da pesquisa mensal | Último dia do mês, 23h59 | RN-PE-05 a 08 |
| 9 | Entregas esperadas que não chegaram | Diária, meia-noite | RN-EN-12, RN-EN-13 |
| 13 | Limpeza de dados offline | Diária, meia-noite | RN-OF-06, SEG-09 |

Risco concreto: com fuso errado, efeitos saem fora de hora, por exemplo visitantes marcados "não compareceu" cedo demais (arquitetura 9.4). A rotina 13 também tem um complemento local no aparelho, que apaga o cache na primeira abertura de um novo dia ([ADR-003](003-banco-local-e-sync-offline.md)), e esse "dia" precisa usar o mesmo critério.

A regra de produto sobre o fuso não existe nas RN. A decisão é de produto.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Fuso único da plataforma (ex.: `America/Sao_Paulo`)** | Simples | Errado para condomínios em outros fusos do Brasil |
| **B. Fuso por condomínio, com padrão `America/Sao_Paulo`** | Dia local correto; configuração simples | Um campo a mais por condomínio; disparo precisa considerar fusos |
| **C. Fuso por usuário** | Sem precedente nas regras | Inconsistente: o dia da portaria é do prédio, não de quem vê |

## Decisão (proposta)

Opção **B**.

- O condomínio tem um campo de fuso, com padrão `America/Sao_Paulo`. Não é um dos 35 parâmetros da RN seção 13; é configuração do condomínio, junto de módulo de cobrança, blocos, portarias e plano.
- O agendador dispara **de hora em hora** e verifica quais condomínios entraram em "00:00 local" naquela hora; para a rotina 6, quais entraram em "23:59 local" do último dia do mês. Em seguida enfileira um job por condomínio ([ADR-006](006-fila-agendador-eventos.md)).
- Cada rotina é idempotente, então um disparo repetido na virada não duplica efeito.
- Datas de negócio (vencimento, mês financeiro, prazos) são interpretadas no fuso do condomínio; o banco guarda instantes em UTC.
- A verificação local de "novo dia" no app usa o mesmo fuso do condomínio.

Pontos sem definição nos documentos e que ficam abertos: tratamento de horário de verão, caso o Brasil volte a adotá-lo, e a granularidade exata da janela de disparo.

## Consequências

**Positivas**

- Rotinas rodam na virada real do dia do condomínio.
- Funciona com o fan-out por condomínio já proposto.

**Negativas**

- Um campo e uma regra de disparo a mais para manter e testar.
- Mudança de fuso de um condomínio no meio do mês exige cuidado com rotinas do dia.

**Riscos**

- Disparo horário perdido (worker fora do ar) adia a rotina para a próxima hora; a idempotência permite recuperar, mas o efeito sai atrasado.
- Divergência entre o "dia" do servidor e o do aparelho, se o relógio do aparelho estiver errado (ver [ADR-014](014-primeira-conclusao-sync.md)).

## Critérios de validação e o que falta para aceitar

- Decisão de produto do Pedro sobre fuso por condomínio.
- Testes das rotinas 3, 6, 9 e 13 com condomínios em dois fusos diferentes e na virada do mês.
- Teste de recuperação após queda do worker na hora da virada.
- Registro da regra nas RN (rastreabilidade: RN, PRD, histórias, fluxos), quando aceita.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.1.1, 3.5, 4.9, 9.3, 9.4.
- `docs/01-produto/03-regras-de-negocio.md`: seção 14; RN-VI-09, RN-EN-12, RN-EN-13, RN-OF-06, RN-PE-05 a RN-PE-08.
- `docs/01-produto/02-prd.md`: SEG-09.
