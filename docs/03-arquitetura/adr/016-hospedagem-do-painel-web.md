# ADR-016: Hospedagem do painel web

- **Estado:** Aceito, com ressalvas, para construir o MVP (desenvolvimento e staging). Decisão de Pedro em 16/11/2026. **Revisão obrigatória antes do piloto com dados reais**
- **Data:** 15/11/2026 (proposta); 16/11/2026 (decisão)
- **Decisores:** Pedro Lemos
- **Depende de:** revisão antes do piloto (hospedagem, custo, LGPD), junto com a revisão obrigatória do [ADR-004](004-nuvem-regiao-residencia-dados.md); confirmação dos limites do plano gratuito de site estático do Render
- **Relacionado a:** [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-011](011-ambientes-branches-eas-ota.md), [ADR-015](015-workspaces-e-contratos-compartilhados.md)

## Contexto

O painel web da administradora e do suporte da plataforma é a versão web do app Expo (React Native Web), descrita em [`painel-web.md`](../../06-frontend/painel-web.md). A estrutura de ambientes de [`infra-e-devops.md`](../../09-infra/infra-e-devops.md) assume um projeto Vercel por ambiente (dev, staging e produção). O mesmo documento registra, com base nas diretrizes de uso do provedor, que o plano **Hobby da Vercel é restrito a uso pessoal não comercial** e que é preciso planejar um plano compatível com uso comercial, como o Pro, inclusive para o desenvolvimento do produto. Isso contradiz a premissa de custo zero do [ADR-004](004-nuvem-regiao-residencia-dados.md), que cobre apenas Supabase e Render e não escolheu hospedagem do cliente web. O ADR-004 está aceito e **não é alterado** por este registro.

Não havia decisão registrada sobre onde o painel web é publicado. A escolha também afeta a lista de subprocessadores e transferência internacional (LGPD, SEG-11) e o custo (RNF-18).

## Opções consideradas (histórico)

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Vercel Pro** | Integração direta com o repositório e pré-visualização por branch; projeto próprio por ambiente (ADR-011); compatível com uso comercial | Custo recorrente por assento; fora do custo zero do ADR-004. **Rejeitada** (ver Decisão) |
| **B. Vercel Hobby** | Sem custo | Uso pessoal não comercial: não serve para um SaaS pago, nem para dev e staging do produto |
| **C. Site estático no mesmo provedor da API (Render)** | Sem custo no plano gratuito; site estático não dorme; reduz fornecedores (mesmo provedor da API, WebSocket e worker do ADR-004) | Recursos de pré-visualização e limites a conferir; concentra API e cliente em um só fornecedor. **Escolhida** |
| **D. Armazenamento de objetos com CDN (Supabase Storage ou outro)** | Poucos componentes novos | Não foi pensado para SPA com rotas; exige configuração de redirecionamento e cabeçalhos |

## Decisão

**Para construir o MVP: site estático do Render, plano gratuito, em dev e staging.** Decisão de Pedro em 16/11/2026.

- **Escopo:** construção do MVP, em desenvolvimento e staging, a custo zero. Não é decisão para produção nem para o piloto com dados reais.
- **Motivos:**
  - **Gratuito:** o MVP deve ser completamente gratuito, sem custo recorrente (decisão de Pedro em 16/11/2026).
  - **Não dorme:** o site estático não é suspenso por inatividade, diferente do serviço web gratuito do Render, que dorme após 15 minutos sem tráfego ([ADR-004](004-nuvem-regiao-residencia-dados.md)).
  - **Mesmo provedor:** o Render já hospeda API, WebSocket e worker ([ADR-004](004-nuvem-regiao-residencia-dados.md)), cuja consulta de 10/11/2026 registra instâncias gratuitas para sites estáticos. Não entra novo subprocessador.
- **Vercel Pro rejeitada** por gerar custo recorrente por assento, incompatível com o MVP sem custo. **Vercel Hobby** continua fora: o plano é restrito a uso pessoal não comercial.
- **Gatilho de revisão (obrigatório):** antes do piloto com dados reais (marco M7), na mesma revisão do [ADR-004](004-nuvem-regiao-residencia-dados.md). A revisão reavalia hospedagem, plano, custo (RNF-18), região da borda e transferência internacional (LGPD, SEG-11). As opções A, C e D acima voltam à mesa nessa revisão.

## Consequências

**Positivas**

- Custo zero para o painel web durante a construção do MVP, coerente com o [ADR-004](004-nuvem-regiao-residencia-dados.md).
- Painel disponível sem espera de despertar, ao contrário da API no serviço web gratuito.
- Um fornecedor a menos na cadeia de subprocessadores (Render, Supabase, Resend, Sentry, Expo).
- Separação por ambiente mantida (ADR-011); o cliente web continua independente da API.

**Negativas**

- A API no Render gratuito continua dormindo: o painel abre de imediato, mas a primeira chamada à API após inatividade pode esperar o serviço acordar (cerca de 1 minuto, [ADR-004](004-nuvem-regiao-residencia-dados.md)).
- Pré-visualização por branch e demais recursos do site estático gratuito: **a confirmar**.
- Concentra API e cliente web em um só fornecedor.

**Riscos**

- Limites do plano gratuito de site estático (banda, minutos de build e afins): **a confirmar** na documentação oficial do Render; não constam nos documentos do projeto.
- Mudança de preços e de termos do plano gratuito.
- Usar o ambiente gratuito com dados reais. Mitigação: **proibido**; dev e staging só com dados fictícios, até a revisão (como no [ADR-004](004-nuvem-regiao-residencia-dados.md)).

## Critérios de validação (ressalvas que continuam)

1. **Antes do piloto com dados reais**, rever a hospedagem do painel junto com a revisão obrigatória do [ADR-004](004-nuvem-regiao-residencia-dados.md): plano, custo (RNF-18), região da borda, subprocessadores e transferência internacional (SEG-11).
2. Confirmar na documentação oficial do Render os limites e recursos do site estático gratuito (banda, build, pré-visualização, redirecionamento de rotas da SPA). Marcados "a confirmar".
3. `infra-e-devops.md` e a seção 6 de `01-arquitetura.md` foram atualizados em 16/11/2026 para refletir esta decisão.

## Referências

- [Arquitetura, seção 6](../01-arquitetura.md#6-ambientes)
- [Infraestrutura e DevOps, seção 2.2](../../09-infra/infra-e-devops.md)
- [Painel web](../../06-frontend/painel-web.md)
- [ADR-004, fatos conferidos na documentação oficial (consulta de 10/11/2026)](004-nuvem-regiao-residencia-dados.md#fatos-conferidos-na-documentação-oficial-consulta-de-10112026)
