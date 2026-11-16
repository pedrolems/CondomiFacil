# ADR-016: Hospedagem do painel web

- **Estado:** Proposto
- **Data:** 15/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** verificação das condições comerciais do provedor escolhido; orçamento (RNF-18)
- **Relacionado a:** [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-011](011-ambientes-branches-eas-ota.md), [ADR-015](015-workspaces-e-contratos-compartilhados.md)

## Contexto

O painel web da administradora e do suporte da plataforma é a versão web do app Expo (React Native Web), descrita em [`painel-web.md`](../../06-frontend/painel-web.md). A estrutura de ambientes de [`infra-e-devops.md`](../../09-infra/infra-e-devops.md) assume um projeto Vercel por ambiente (dev, staging e produção). O mesmo documento registra, com base nas diretrizes de uso do provedor, que o plano **Hobby da Vercel é restrito a uso pessoal não comercial** e que é preciso planejar um plano compatível com uso comercial, como o Pro, inclusive para o desenvolvimento do produto. Isso contradiz a premissa de custo zero do [ADR-004](004-nuvem-regiao-residencia-dados.md), que cobre apenas Supabase e Render e não escolheu hospedagem do cliente web. O ADR-004 está aceito e **não é alterado** por este registro.

Não existe hoje decisão registrada sobre onde o painel web é publicado. A escolha também afeta a lista de subprocessadores e transferência internacional (LGPD, SEG-11) e o custo (RNF-18).

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Vercel Pro (proposta)** | Integração direta com o repositório e pré-visualização por branch; projeto próprio por ambiente (ADR-011); compatível com uso comercial | Custo recorrente por assento; fora do custo zero do ADR-004; condições e orçamento a validar |
| **B. Vercel Hobby** | Sem custo | Uso pessoal não comercial: não serve para um SaaS pago, nem para dev e staging do produto |
| **C. Hospedagem estática no mesmo provedor da API (Render Static Sites ou equivalente)** | Reduz fornecedores; custo baixo ou zero | Recursos de pré-visualização e limites a conferir; concentra API e cliente em um só fornecedor |
| **D. Armazenamento de objetos com CDN (Supabase Storage ou outro)** | Poucos componentes novos | Não foi pensado para SPA com rotas; exige configuração de redirecionamento e cabeçalhos |

## Decisão proposta

**Proposta, ainda não aceita:** publicar o painel web em hospedagem estática com **Vercel em plano compatível com uso comercial (Pro)** para produção, e reavaliar a opção C para dev e staging se o custo for um impedimento. Não usar o plano Hobby para o produto. Antes de provisionar, conferir as condições vigentes do provedor e o orçamento. Esta proposta não autoriza contratação.

## Consequências

- **Positivas:** clareza sobre a conformidade comercial; separação por ambiente mantida (ADR-011); o cliente web continua independente da API.
- **Negativas:** custo recorrente que o ADR-004 não previa; mais um subprocessador na cadeia (Vercel, Render, Resend, Sentry, Expo).
- **Riscos:** limites do plano, mudança de preços e de termos; região da borda e transferência internacional ainda por analisar.
- O desenvolvimento pode seguir com servidor local até a decisão; nenhum deploy do painel usa o Hobby.

## Pendências e critérios de validação

1. Pedro decidir entre as opções A, C ou outra, com orçamento aprovado (RNF-18).
2. Conferir as condições comerciais vigentes do provedor escolhido (planos, limites, política de uso).
3. Incluir o provedor na análise de subprocessadores e transferência internacional (SEG-11) e na revisão obrigatória do ADR-004 antes do piloto.
4. Atualizar `infra-e-devops.md` e a seção 6 de `01-arquitetura.md` quando houver decisão (fora do escopo desta proposta).

## Referências

- [Arquitetura, seção 6](../01-arquitetura.md#6-ambientes)
- [Infraestrutura e DevOps, seção 2.2](../../09-infra/infra-e-devops.md)
- [Painel web](../../06-frontend/painel-web.md)
