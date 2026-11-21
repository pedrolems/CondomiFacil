---
name: condomifacil-backend
description: Orienta quem escreve, altera ou revisa o backend do CondomiFacil (API NestJS, worker e rotinas, acesso a dados com Kysely e RLS, contrato OpenAPI/AsyncAPI, integrações como Asaas e Resend, testes). Use ao criar ou alterar módulo, caso de uso, rota, migration, rotina agendada, integração ou teste de backend, ao revisar código de backend e ao responder dúvidas de arquitetura de backend.
---

# Backend do CondomiFacil

Estado em 21/11/2026: **só existe `GET /v1/saude`** (sem banco). Worker (`main.worker.ts`), rotinas, integrações e módulos são esqueleto ou README. As decisões E1 a E22 da fase 2 (acesso) foram **aprovadas em A (20 e 21/11/2026)** e o código da fase 2 está liberado, na ordem RM-25 e RM-24, RM-20 e RM-21, RM-23 e RM-22, com commit por pacote RM aprovado por Pedro ([pacote da fase 2](../../../docs/09-infra/pacote-tecnico-fase-2.md), seção 7). Idioma de tudo: português do Brasil.

Legenda usada aqui e nas referências: **Implementado** (está no código), **Aceito** (Pedro, com data), **Proposta** (documentada, não aceita), **Pendente** (lacuna ou ponto ainda não decidido).

## 1. Antes de codar

Anote, em uma linha cada:

1. **Perfil e rota**: pasta de `interfaces/http/<perfil>/` e caminho `/v1/<perfil>/<recurso>`. Não existe pasta de subsíndico; Manutenção foi retirado (17/11/2026).
2. **Módulo e caso de uso**: `modulos/<dominio>/`.
3. **IDs que sustentam**: RN-XX-nn, RF-*, US-XX-nn.
4. **Estado da decisão**: o que dela é aceito e o que é proposta ou pendente (E1 a E22 aprovadas em A, em 20 e 21/11/2026).

Se houver decisão de produto ou arquitetura, ampliação de escopo ou conflito entre fontes, **pergunte ao Pedro** com opções, consequências e recomendação, e pause até a resposta (AGENTS.md). Fora do recorte aprovado de E1 a E22, só leitura, planejamento e o que o briefing autorizar explicitamente.

## 2. Fontes de trabalho

Leia por seção (os docs são grandes).

1. Regra e requisito: [Regras de Negócio](../../../docs/01-produto/03-regras-de-negocio.md), [PRD](../../../docs/01-produto/02-prd.md), [Histórias](../../../docs/01-produto/04-historias-de-usuario.md).
2. Backend: [01-backend.md](../../../docs/05-backend/01-backend.md) (estrutura, padrões, rotinas; proposta). Contrato: [README da API](../../../docs/05-backend/api/README.md), [guia](../../../docs/05-backend/api/01-guia-da-api.md), [eventos e webhooks](../../../docs/05-backend/api/02-eventos-e-webhooks.md), [integrações](../../../docs/05-backend/api/03-integracoes-externas.md).
3. Dados: [MER/DER](../../../docs/04-banco-de-dados/01-mer-e-der.md), [política de acesso](../../../docs/04-banco-de-dados/02-politica-de-acesso-a-dados.md), [migrations e seeds](../../../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md).
4. Decisões: [ADRs](../../../docs/03-arquitetura/adr/README.md) (aceitos: 001, 002, 003, 004, 005, 007, 008, 015, 016, todos com ressalvas), [critérios e resultados das PoCs](../../../docs/03-arquitetura/criterios-de-poc.md), [pacote da fase 2](../../../docs/09-infra/pacote-tecnico-fase-2.md).
5. Código: [API](../../../backend/apps/api/README.md) e [shared-types](../../../packages/shared-types/README.md). Confira o que existe de fato antes de afirmar.
6. Arquitetura ou relação entre documentos: consulte primeiro o grafo em `graphify-out/` (`/graphify`).

## 3. Regras duras

- **Multi-tenant por RLS** com `condominio_id` (ADR-001, aceito com ressalvas). Nunca contorne RLS nem use credencial dona ou BYPASSRLS no aplicativo; teste o acesso negado com os privilégios reais. Detalhes em [dados, RLS e sessões](references/dados-rls-e-sessoes.md).
- **Todo acesso a banco passa por `TenantContext.executar`** (proposta de estrutura, base aceita no ADR-001); nunca use o pool direto nem `SET` de sessão.
- **Dinheiro, voto e estado**: idempotência, transação e auditoria na mesma transação do ato, com `evento_saida` (outbox). Webhook do Asaas autenticado por token e sem baixa duplicada.
- **Contrato é a fonte** (ADR-015): OpenAPI e AsyncAPI primeiro; tipos e validação gerados em `packages/shared-types`; sem Zod na borda (aceito no ADR-008). Mudança de contrato atualiza a contagem e a tabela de cobertura em `docs/05-backend/api/README.md`.
- **Borda burra**: controller só traduz; autorização é de guards e RLS, não da pasta. Domínio sem NestJS, banco nem outro módulo.
- Erro nunca devolve corpo de reclamação, avaliação ou voto (ADR-010, proposto). Outro condomínio e inexistente respondem 404 idêntico.
- Segredos só por variável de ambiente; **dados somente fictícios** até o piloto; migration em banco remoto, deploy, Asaas real e dados reais só com autorização do Pedro.
- Termos do domínio: condomínio, unidade, Proprietário, Inquilino; nunca "locador" ou "locatário". Padrões SOLID, GRASP e GoF só quando resolvem problema real.
- Migrations SQL (Flyway) são do `engenheiro-de-dados`; o backend as consome, não as escreve.

## 4. Estrutura e padrões

Estrutura híbrida decidida por Pedro em 09/11/2026: `interfaces/http/<perfil>/` na borda, `modulos/<dominio>/` (`dominio/`, `aplicacao/`, `infra/`, `portas/`) no núcleo, mais `compartilhado/`, `integracoes/` e `rotinas/`. Implementado hoje: `main.api.ts`, `main.worker.ts` (stub), `api.module.ts`, `compartilhado/config/config.ts`, `saude.controller.ts` e `request-id.ts`. Cada módulo tem `<dominio>.module.ts` e `index.ts` vazios, e `modulos/reservas/` tem os arquivos do exemplo da seção 3.2 de 01-backend.md só como esqueleto ("Sem implementação"): use-o como modelo de nomes e pastas, não como código pronto. Detalhes: [convenções da API](references/convencoes-da-api.md), [rotinas e integrações](references/rotinas-e-integracoes.md).

Passo a passo de um caso de uso novo (proposta de 01-backend.md; só após o aceite):

1. **Contrato**: operação no OpenAPI do perfil (ou AsyncAPI) e `pnpm lint:openapi`; regenere os tipos.
2. **Módulo**: `<nome>.caso-de-uso.ts` em `aplicacao/`; regra pura em `dominio/`; portas em `portas/`; repositório SQL em `infra/` (`.repositorio-sql.ts`) com Kysely.
3. **Rota**: controller em `interfaces/http/<perfil>/`, importando o módulo só pelo `index.ts`. Fluxo da requisição: versão (426), autenticação (401), contexto (403), papel (403), unidade (403), validação Ajv, `TenantContext`.
4. **Transação**: caso de uso dentro de `TenantContext.executar`; gravar mudança, `evento_saida` e auditoria juntos; COMMIT; só então o DTO.
5. **Erros e idempotência**: código `{ codigo, mensagem, detalhes?, request_id }`; `Idempotency-Key` em POST que cobra ou reserva (guarda de 24 h, E17 aprovada por Pedro em 20/11/2026).
6. **Efeitos**: consumidor do outbox ou rotina idempotente, por porta (`PaymentGateway`, `Mailer`), nunca chamando o provedor dentro da transação.
7. **Testes** conforme [testes e verificação](references/testes-e-verificacao.md).

## 5. Verificação antes de entregar

- [ ] `pnpm check` e, se o contrato mudou, `pnpm lint:openapi`; `pnpm format:check` se tocou formatação.
- [ ] Teste de caso de uso com relógio injetável e portas falsas.
- [ ] Isolamento: dois condomínios, sem contexto (zero linhas), vazamento no pool, como `app_user`.
- [ ] Idempotência e repetição: mesma chave, mesmo `op_id`, mesmo evento de webhook, rotina executada duas vezes.
- [ ] Erros no formato padrão, sem dado pessoal em log, mensagem ou corpo.
- [ ] Contrato, tipos gerados e tabela de cobertura coerentes com o código.
- [ ] Nada afirmado como existente que não está no código; propostas rotuladas.

## 6. Rastreabilidade e entrega

- Cite RN, RF, US, ADR e E que sustentam a mudança. Regra mudou: RN, PRD, história, fluxo, contrato e código na mesma alteração (autorizada).
- Informe: arquivos alterados, verificações e resultados reais, pendências e limitações. Não commite nem faça push sem aprovação do Pedro e indicação da branch.

## Divergências resolvidas

As cinco divergências registradas na criação desta skill foram resolvidas por Pedro em 20/11/2026: Zod retirado do código e dos docs; retry de refresh e regra 409/422 alinhados no guia e em 01-backend.md; sem `SECURITY DEFINER` (E7); guarda de idempotência de 24 h (E17). Nova divergência: registre aqui e pergunte ao Pedro, sem resolver por conta própria.
