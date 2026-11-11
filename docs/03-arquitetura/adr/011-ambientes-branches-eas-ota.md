# ADR-011: Ambientes, branches, promoção, EAS e OTA

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** definição da equipe
- **Relacionado a:** [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-002](002-gateway-de-pagamento.md), [ADR-003](003-banco-local-e-sync-offline.md), [ADR-008](008-orm-query-builder-migracoes.md)

## Contexto

O repositório já tem as branches `develop`, `staging` e `main`, além da branch de documentação (AGENTS.md). Ainda não há aplicação para publicar. É preciso decidir quantos ambientes existem, como o código é promovido e como o app é distribuído.

Restrições:

- **Dados reais só em produção** (regra da arquitetura, coerente com SEG-01 e a LGPD). Nunca copiar dump de produção, nem anonimizado.
- Segredos só no servidor (SEG-02); variáveis `EXPO_PUBLIC_*` são públicas.
- **Regra do projeto:** nenhum commit vai para uma branch sem validação do Pedro.
- RNF-04 (app abaixo de 30 MB, medido no CI), RNF-09 (99,5% ao mês, deploy sem indisponibilidade), RNF-16 (testes offline a cada versão), RNF-17 (teste de carga), RNF-18 (alertas de custo).
- Módulos nativos (SQLCipher, [ADR-003](003-banco-local-e-sync-offline.md)) exigem *dev build*; o Expo Go não basta.
- O PRD não cita EAS; é proposta de uso da arquitetura.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Três ambientes remotos (dev, staging, produção) mapeados às branches existentes + EAS** | Reaproveita `develop`, `staging`, `main`; staging idêntico à produção para carga e restauração | Custo de manter três ambientes (RNF-18) |
| **B. Só staging e produção** | Mais barato | Sem ambiente de integração contínua do time |
| **C. Ambiente de API efêmero por PR** | Isolamento máximo na revisão | Custo e complexidade; a arquitetura não recomenda no MVP |
| Builds: **EAS** x Fastlane ou GitHub Actions com builds locais | EAS cuida de build, distribuição e OTA | Custo por build e limites do plano |

## Decisão (proposta)

Opção **A**, com ambiente de preview por PR só para web e OTA, e API efêmera por PR apenas se o custo justificar.

| | Local | Dev | Staging | Produção |
| --- | --- | --- | --- | --- |
| Branch | qualquer | `develop` | `staging` | `main` |
| Deploy | processos locais | automático a cada merge | automático, promoção da `develop` | com aprovação manual |
| Banco | PostgreSQL em contêiner | instância pequena | mesma versão e configuração da produção, menor | gerenciado, com backup e PITR |
| Gateway | sandbox | sandbox | sandbox | produção |
| E-mail | captura local | caixa de saída falsa | caixa de saída falsa | provedor real |
| Dados | semente fictícia | fictícios | fictícios, gerador de carga de 5.000 unidades | reais |

**Fluxo:** pull request, CI (lint, tipos, testes unitários, isolamento de RLS, offline, catálogo de RLS, axe na web, tamanho do app), merge em `develop` (deploy dev), merge em `staging` (deploy staging, testes de ponta a ponta e de carga), merge em `main` (aprovação manual, deploy produção). Reverter por imagem anterior da API e por republicação do OTA anterior. Proteção de branch com revisão obrigatória e CI verde. Mudanças só em `docs/` e `prototipo/` não acionam pipeline.

**EAS e OTA:**

| Perfil EAS | Uso | Distribuição | API | Canal OTA |
| --- | --- | --- | --- | --- |
| `development` | *Dev build* com módulos nativos | Interna | local ou dev | `development` |
| `preview` | Aceitação, validação com síndicos e porteiros, pilotos internos | TestFlight ou Play interno | staging | `staging` |
| `production` | Lojas | App Store e Google Play | produção | `production` |

- Cada canal só recebe atualizações do seu ambiente. A `runtimeVersion` amarra a atualização à versão nativa compatível, para o OTA nunca chegar a binário incompatível.
- OTA só para JavaScript e assets; código nativo exige novo build e envio às lojas.
- Versão mínima obrigatória: a API responde 426 abaixo do mínimo (UF 15); OTA reduz a necessidade, mas não a elimina.
- O adaptador do gateway se recusa a iniciar em staging com chave de produção.
- Migrações: dev, depois staging com volume, depois produção ([ADR-008](008-orm-query-builder-migracoes.md)).

## Consequências

**Positivas**

- Usa a estrutura de branches existente.
- Staging permite ensaiar restauração, carga e pilotos internos sem dados reais.
- OTA agiliza correções de JavaScript.

**Negativas**

- Três ambientes e três projetos de Sentry custam dinheiro (RNF-18); desligar dev fora do horário é proposta.
- O fluxo depende de EAS e do plano contratado.

**Riscos**

- Dependência do ecossistema Expo (versões, limites de build). Mitigação: fixar versões do SDK e manter o domínio fora da camada de UI.
- OTA mal configurado atingindo binário incompatível. Mitigação: política de `runtimeVersion`.
- OTA precisa respeitar as políticas das lojas.
- Não há equipe definida nos documentos; a revisão obrigatória em `develop` depende do tamanho dela.

## Critérios de validação e o que falta para aceitar

- Confirmação da equipe e de quem aprova deploy em produção.
- Estimativa de custo dos três ambientes e de EAS contra RNF-18. A [ADR-004](004-nuvem-regiao-residencia-dados.md) (Aceito com ressalvas em 10/11/2026) fixa Supabase e Render, gratuitos, para dev e staging; a estimativa vale para produção e entra na revisão do ADR-004 antes do piloto.
- Teste do fluxo completo com um app mínimo: build `development`, `preview`, OTA por canal, rollback.
- Aprovação do Pedro, mantida a regra de que nenhum commit vai para uma branch sem validação dele.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 5.3, 6.1 a 6.8, 8 (RNF-04, RNF-09, RNF-18).
- `docs/01-produto/02-prd.md`: seção 10; SEG-02; RNF-04, RNF-09, RNF-16, RNF-17, RNF-18.
- `AGENTS.md`: branches e regra de commit.
- `docs/02-design/02-user-flows.md`: seção 15 (versão obrigatória).
