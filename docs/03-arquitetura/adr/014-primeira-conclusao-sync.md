# ADR-014: "Primeira conclusão" na sincronização, por relógio do aparelho ou por chegada

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** decisão de produto
- **Relacionado a:** [ADR-003](003-banco-local-e-sync-offline.md), [ADR-012](012-fuso-horario-por-condominio.md)

## Contexto

A RN-CH-04 diz que, se duas pessoas da limpeza concluem o mesmo chamado offline, vale a **primeira conclusão** e a segunda é recusada com aviso. A RN-CH-15 diz que a avaliação do atendimento vale para o funcionário da primeira.

As regras não dizem o que é "primeira":

- pela **hora em que cada pessoa concluiu** (relógio do aparelho), ou
- pela **ordem de chegada ao servidor**.

Isso é uma lacuna das RN (arquitetura 3.1.1). A diferença importa: quem conclui primeiro de fato pode sincronizar depois, e o aparelho pode estar com o relógio errado.

Contexto técnico: cada operação offline tem `op_id`, `registrado_em` (relógio do aparelho) e ordem sequencial ([ADR-003](003-banco-local-e-sync-offline.md)); o servidor aplica operações de forma idempotente.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Relógio do aparelho (`registrado_em`)** | Reflete quem concluiu primeiro na vida real; independe de quando houve sinal | Relógio do aparelho pode estar errado ou ser manipulado |
| **B. Ordem de chegada ao servidor** | Sem dependência de relógio do aparelho; simples | Premia quem sincronizou primeiro, não quem concluiu primeiro; injusto com quem ficou mais tempo sem conexão |
| **C. A com desempate por B, e limite de desvio de relógio** | Mantém o benefício de A, trata empate e reduz o risco do relógio | Regra mais elaborada de explicar e de testar |

## Decisão (proposta)

Opção **C**:

1. Vale a conclusão com menor `registrado_em` (relógio do aparelho).
2. Em empate, vale a que chegou primeiro ao servidor.
3. O servidor **limita o desvio de relógio aceito**: rejeita horas no futuro. O limite numérico não está definido nos documentos; é parâmetro a definir.
4. A segunda conclusão é recusada com aviso, como a RN-CH-04 já determina. A avaliação do atendimento vale para o funcionário da primeira conclusão (RN-CH-15).

Esta é uma proposta de interpretação de regra de produto, não uma regra. Se aceita, deve entrar na RN-CH-04 com rastreabilidade para PRD, histórias, fluxos, Design System e protótipo, como manda a convenção do projeto.

## Consequências

**Positivas**

- A "primeira" corresponde à ordem real do trabalho, o que é o espírito da RN-CH-04.
- Um aparelho sem sinal por horas não perde a conclusão por sincronizar mais tarde.

**Negativas**

- A decisão depende de relógio do aparelho, que o servidor não controla.
- Exige parâmetro de desvio máximo e testes de relógio.

**Riscos**

- Relógio adiantado ou atrasado de propósito para "ganhar" a avaliação. Mitigação: rejeitar futuro; um relógio atrasado dentro do limite continua possível, e o efeito é pequeno (avaliação de atendimento).
- Conclusão aceita e depois derrubada por outra com `registrado_em` anterior que chega mais tarde: o funcionário que já viu "concluído" pode ver o estado mudar ao sincronizar. Como comunicar isso é questão de UX em aberto.

## Critérios de validação e o que falta para aceitar

- Decisão do Pedro entre A, B e C.
- Se C: definir o desvio máximo de relógio aceito.
- Testes automatizados de RNF-16 para: duas conclusões offline em ordem inversa à de chegada; empate; hora no futuro; conclusão recusada com aviso.
- Atualizar RN-CH-04 (e dependentes) quando aceita.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.1.1 (resolução de conflitos), 9.1, 9.3.
- `docs/01-produto/03-regras-de-negocio.md`: RN-CH-04, RN-CH-15.
- `docs/01-produto/02-prd.md`: RNF-16.
