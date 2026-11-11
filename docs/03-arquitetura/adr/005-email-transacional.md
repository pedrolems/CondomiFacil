# ADR-005: E-mail transacional

- **Estado:** Aceito, com ressalvas (Resend). Decisão de Pedro em 10/11/2026
- **Data:** 06/11/2026 (proposta); 10/11/2026 (decisão)
- **Decisores:** Pedro Lemos
- **Depende de:** revisão do [ADR-004](004-nuvem-regiao-residencia-dados.md) antes do piloto (região, LGPD); teste de entregabilidade
- **Relacionado a:** [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 listava "Resend ou Amazon SES" para e-mail transacional. A escolha não estava feita.

O e-mail é essencial em três pontos:

- Código de 6 dígitos do primeiro acesso, válido 15 min, com mesma resposta para e-mail cadastrado ou não (RF-AC-01, SEG-04). Sem e-mail, ninguém entra.
- Comprovante de pagamento (RF-PG-04).
- Cópia dos dados do titular, por link expirável, em até 15 dias (RF-LG-01, SEG-11).

Lembretes de cobrança têm canal não especificado em RF-FI-11 (push e e-mail são proposta da arquitetura).

Também pesam: entregabilidade (SPF, DKIM, DMARC), custo (RNF-18) e a avaliação de transferência internacional da LGPD, já que o Resend é provedor internacional. Em dev e staging nenhum e-mail real pode sair (arquitetura 6.1 e 6.2).

## Opções consideradas (histórico)

| Critério | Resend | Amazon SES |
| --- | --- | --- |
| Custo | Plano gratuito e planos pagos simples | Muito barato por volume |
| Integração | API simples, boa experiência de desenvolvimento | API e SDK da AWS, mais configuração |
| Entregabilidade | Boa, com domínio verificado | Boa, exige cuidado com reputação e saída do *sandbox* |
| Coerência com a nuvem | Independente | Natural se a nuvem for AWS |
| Região e LGPD | Provedor internacional | Região escolhida |

## Decisão

**E-mail transacional: Resend.** Decisão de Pedro em 10/11/2026.

- **Motivo:** o [ADR-004](004-nuvem-regiao-residencia-dados.md) descartou a AWS nesta fase por não caber no custo zero pedido pelo Pedro (decisão de 10/11/2026); o Amazon SES sai junto.
- O domínio acessa o e-mail por uma **porta `Mailer`** com o `AdaptadorResend`. A troca de provedor é de adaptador. Em dev e staging a porta aponta para caixa de saída falsa; local usa captura (ex.: Mailpit). Nenhum e-mail real sai fora de produção.

### Fatos conferidos na documentação oficial (consulta de 10/11/2026)

| Tema | O que a documentação diz | Página |
| --- | --- | --- |
| Plano gratuito | 3.000 e-mails transacionais por mês, 100 por dia, 3 domínios próprios, retenção de dados de 30 dias; e-mails de entrada contam na mesma cota | https://resend.com/pricing |
| Região de envio (**a confirmar**: veio de busca, página não lida diretamente) | Cada domínio escolhe a região de envio: N. Virginia (`us-east-1`), Irlanda (`eu-west-1`), São Paulo (`sa-east-1`) e Tóquio (`ap-northeast-1`). Contas existentes começam em `us-east-1` | https://resend.com/docs/dashboard/domains/regions (obtida por busca) |
| Onde ficam os dados | Segundo a busca, a região escolhida define de onde o e-mail é despachado, mas os dados da conta continuam nos EUA | mesma página (**a confirmar**) |
| Região São Paulo no plano gratuito | A página de regiões indicava São Paulo apenas em planos pagos; um registro de mudanças posterior cita ampliação ("multi-region for everyone"). **A confirmar** se o plano gratuito pode usar `sa-east-1` | https://resend.com/changelog/multi-region-for-everyone |

O limite de 100 e-mails por dia no plano gratuito basta para desenvolvimento e staging e **não basta para produção** (um condomínio com muitos primeiros acessos no mesmo dia passa disso). Isso entra na revisão antes do piloto.

## Consequências

**Positivas**

- A porta `Mailer` mantém a decisão reversível.
- API simples; plano gratuito cobre dev e staging sem custo.
- Um fornecedor de e-mail independente da nuvem, que acompanha qualquer troca do [ADR-004](004-nuvem-regiao-residencia-dados.md).

**Negativas**

- O Resend é subprocessador internacional: **os dados de e-mail (endereços, conteúdo, eventos) saem do Brasil** e a avaliação de transferência internacional da LGPD é obrigatória. A região de envio `sa-east-1` pode reduzir latência, mas, segundo a documentação consultada, não muda a localização dos dados da conta (a confirmar).
- Limite diário do plano gratuito exige plano pago antes do piloto.
- Há que configurar domínio, SPF, DKIM e DMARC antes do primeiro envio real.

**Riscos**

- Falha de entregabilidade do código de acesso bloqueia o primeiro acesso.
- Retenção de 30 dias dos dados no provedor conflita com política de retenção da plataforma, se houver; avaliar na revisão de LGPD.

## Critérios de validação (ressalvas que continuam)

- Teste de entregabilidade (SPF, DKIM, DMARC) do código de acesso nos principais provedores de e-mail dos usuários.
- Custo estimado por volume e plano pago, contra RNF-18.
- Avaliação de transferência internacional (LGPD), com a lista de subprocessadores: parte da revisão do [ADR-004](004-nuvem-regiao-residencia-dados.md) antes do piloto.
- Confirmar regiões disponíveis no plano gratuito e a localização dos dados da conta.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.7, 5.1, 5.2 (e-mail transacional), 6.1, 6.2, 7.
- `docs/01-produto/02-prd.md`: seção 10; SEG-04, SEG-11, RNF-18; RF-AC-01, RF-PG-04, RF-LG-01, RF-FI-11.
- Documentação oficial do Resend, consultada em 10/11/2026 (endereços na tabela acima).
