# ADR-005: E-mail transacional

- **Estado:** Em aberto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** [ADR-004](004-nuvem-regiao-residencia-dados.md) (provedor de nuvem)
- **Relacionado a:** [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 lista "Resend ou Amazon SES" para e-mail transacional. A escolha não foi feita.

O e-mail é essencial em três pontos:

- Código de 6 dígitos do primeiro acesso, válido 15 min, com mesma resposta para e-mail cadastrado ou não (RF-AC-01, SEG-04). Sem e-mail, ninguém entra.
- Comprovante de pagamento (RF-PG-04).
- Cópia dos dados do titular, por link expirável, em até 15 dias (RF-LG-01, SEG-11).

Lembretes de cobrança têm canal não especificado em RF-FI-11 (push e e-mail são proposta da arquitetura).

Também pesam: entregabilidade (SPF, DKIM, DMARC), custo (RNF-18) e a avaliação de transferência internacional da LGPD, já que o Resend é provedor internacional. Em dev e staging nenhum e-mail real pode sair (arquitetura 6.1 e 6.2).

## Opções consideradas

| Critério | Resend | Amazon SES |
| --- | --- | --- |
| Custo | Plano gratuito e planos pagos simples | Muito barato por volume |
| Integração | API simples, boa experiência de desenvolvimento | API e SDK da AWS, mais configuração |
| Entregabilidade | Boa, com domínio verificado | Boa, exige cuidado com reputação e saída do *sandbox* |
| Coerência com a nuvem | Independente | Natural se a nuvem for AWS |
| Região e LGPD | Provedor internacional | Região escolhida |

## Recomendação

Não há decisão. Recomendação condicional da arquitetura 5.2, que depende da [ADR-004](004-nuvem-regiao-residencia-dados.md):

- **SES**, se a nuvem for AWS: um fornecedor a menos e custo mínimo.
- **Resend**, se a nuvem for outra e a equipe quiser simplicidade.

Independentemente da escolha, o domínio acessa o e-mail por uma **porta `Mailer`** com adaptador do provedor. A troca é de adaptador. Em dev e staging a porta aponta para caixa de saída falsa; local usa captura (ex.: Mailpit).

## Consequências

**Positivas**

- A porta `Mailer` mantém a decisão reversível.
- Escolher junto com a nuvem reduz fornecedores.

**Negativas**

- Enquanto aberta, não há como configurar domínio, SPF, DKIM e DMARC.
- Escolher Resend soma um subprocessador internacional à avaliação de LGPD.

**Riscos**

- Falha de entregabilidade do código de acesso bloqueia o primeiro acesso.
- Saída do *sandbox* do SES leva tempo, se esse for o caminho.

## Critérios de validação e o que falta para aceitar

- [ADR-004](004-nuvem-regiao-residencia-dados.md) decidida.
- Teste de entregabilidade (SPF, DKIM, DMARC) do código de acesso nos principais provedores de e-mail dos usuários.
- Custo estimado por volume, contra RNF-18.
- Avaliação de transferência internacional, se for Resend.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.7, 5.1, 5.2 (e-mail transacional), 6.1, 6.2, 7.
- `docs/01-produto/02-prd.md`: seção 10; SEG-04, SEG-11, RNF-18; RF-AC-01, RF-PG-04, RF-LG-01, RF-FI-11.
