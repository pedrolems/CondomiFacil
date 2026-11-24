# Pacote técnico da fase 2 — acesso, condomínio e permissões (RM-20 a RM-25)

**Data:** 20/11/2026. **Atualizado em:** 23/11/2026. **Autor do produto e responsável pelas decisões:** Pedro Lemos.

**Estado:** fase 2 liberada por Pedro em 20/11/2026. **Pacote aprovado por Pedro em 21/11/2026, com todas as decisões E1 a E22 na opção A (E1, E6, E7 e E17 já aprovadas em A em 20/11/2026; as demais em 21/11/2026; seção 7).** O código de produto da fase 2 está liberado, na ordem RM-25 e RM-24, RM-20 e RM-21, RM-23 e RM-22, na branch `feat/fase-2-acesso`, com commit por pacote RM aprovado um a um por Pedro (E22). O recorte do MER, da política de acesso e do contrato descrito aqui vale pelo aceite em E1 (opção A); o restante desses documentos continua proposta não aceita. Nada aqui libera deploy no Render ou no Supabase, dados reais, integração com o Asaas, commit, push ou merge. O formato segue o [pacote da fase 1](pacote-tecnico-fase-1.md). As fontes são o [roadmap](../roadmap.md) (seções 5.5, 5.6, 5.8 e 7), os [resultados das PoCs P2 a P5](../03-arquitetura/criterios-de-poc.md) e os relatórios em `pocs/rm-16/*/RELATORIO.md`. RM-25 executado em 21/11/2026 (commit `b883ba8`); RM-24 executado em 23/11/2026.

## Índice

1. [Decisões de Pedro na liberação](#1-decisões-de-pedro-na-liberação-20112026)
2. [Objetivo e limites](#2-objetivo-e-limites)
3. [Recorte de dados](#3-recorte-de-dados)
4. [Recorte de contrato](#4-recorte-de-contrato)
5. [Estrutura no monorepo](#5-estrutura-no-monorepo-preserva-esqueletos-existentes)
6. [Etapas e verificações](#6-etapas-e-verificações-na-ordem-decidida)
7. [Decisões E1 a E22 — aprovadas (opção A)](#7-decisões-e1-a-e22--aprovadas-opção-a)
8. [Riscos](#8-riscos)
9. [Rastreabilidade](#9-rastreabilidade)

## 1. Decisões de Pedro na liberação (20/11/2026)

| Nº | Decisão |
| --- | --- |
| 1 | **Fase 2 liberada.** A reprodução da instalação por outra pessoa continua pendente da fase 1 e corre em paralelo, sem bloquear a fase 2 |
| 2 | **Pacote técnico primeiro.** Nenhum código de produto antes de Pedro aprovar as decisões deste pacote (aprovadas em 21/11/2026, decisão 5). O recorte do MER, da política de acesso e do contrato para RM-20 a RM-25 é aprovado por meio do pacote |
| 3 | **Banco:** PostgreSQL 17 local em Docker, a versão principal do Supabase, como nas PoCs, sem Supabase nem Render. Deploy continua bloqueado. No CI, um Postgres de serviço para os testes de isolamento |
| 4 | **Ordem:** primeiro a fundação (RM-25 com dados, migrations e fixtures; RM-24 com erros, idempotência, transações, auditoria, outbox e observabilidade mínima). Depois RM-20 (conta, acesso e sessões) e RM-21 (condomínios, unidades e vínculos). Em seguida RM-23 (autorização em todos os canais) e, por último, RM-22 (implantação por modalidade) |
| 5 | **Pacote aprovado (21/11/2026).** Pedro aprovou todas as decisões E1 a E22 na opção A (E1, E6, E7 e E17 já em 20/11/2026). Código de produto liberado na ordem da decisão 4, com commit por pacote RM aprovado um a um (E22). Deploy, dados reais e commit, merge ou push sem aprovação específica seguem bloqueados |

**Já fechado e aplicado aqui, sem reabrir:**

- **Acesso a dados e migrations:** Kysely 0.29.9 com postgres.js (`kysely-postgres-js` 5.1.0) e Flyway 13.12.2 OSS, com as regras da P5.
- **RLS:** conforme a P3.
- **Sessões:** conforme a P2, com jose, refresh rotativo e retry B+E de 30 s.
- **Módulo de autenticação:** módulo `autenticacao` com papel de banco próprio e tabelas sem RLS como exceção explícita.
- **Validação e tipos:** sem Zod. A borda é validada pelo Ajv gerado do contrato e os tipos do banco vêm do kysely-codegen.
- **Código das PoCs:** `pocs/` é descartável. O código é reescrito a partir dos relatórios, não copiado sem revisão.

## 2. Objetivo e limites

**Saída da fase 2** ([roadmap](../roadmap.md), seção 7):

- O fluxo de acesso até a tela permitida funciona com persistência.
- Mudar ou revogar o contexto não conserva o acesso antigo.
- Os testes usam os privilégios reais da aplicação.
- Dados de outro condomínio ou unidade não aparecem em resposta, arquivo ou cache.
- Aprovação visual sozinha não fecha o pacote.

**Entra:** RM-20 a RM-25, com jornadas entre tela, API e banco local, inclusive os estados de erro e de acesso negado, no recorte das seções 3 e 4 e no escopo de telas de E12.

**Fica de fora:**

- deploy no Render ou no Supabase, Supavisor, nuvem do piloto e qualquer serviço provisionado;
- dados reais, pessoas reais e documentos pessoais: só dados fictícios ([autogestão](../01-produto/06-autogestao-e-conducao-eleitoral.md), decisão 1C);
- Asaas, conta recebedora e KYC (RF-AD-08, US-AD-05), cobrança, pagamentos e reservas (fase 3);
- portaria, visitantes, offline e sync (fase 3), inclusive a mitigação da lista do dia (E19);
- demais módulos das fases 3 e 4 (chamados, reclamações e score, comunicados, eleições, pesquisa, finanças, relatórios, LGPD além da revogação de sessões);
- envio real de e-mail pelo Resend (E14), push, Sentry com dados e WebSocket;
- aceite dos ADRs ainda propostos, exceto o que E13 pedir explicitamente do ADR-006.

## 3. Recorte de dados

Os nomes vêm do [MER/DER](../04-banco-de-dados/01-mer-e-der.md) e as ações por entidade vêm da [política de acesso](../04-banco-de-dados/02-politica-de-acesso-a-dados.md), seção 5. "G" é entidade global e "T" é entidade de tenant (com `condominio_id`). Em toda tabela T, a RLS fica habilitada e forçada, e as FKs são compostas com `condominio_id` (MER, seção 6). Colunas, constraints, índices e estados são detalhados na migration de cada pacote e revisados com ela.

### 3.1 Tabelas por pacote

| Pacote | Tabelas (MER) | Classe | Política resumida (política de acesso, 5.1 a 5.12) |
| --- | --- | --- | --- |
| RM-25/RM-24 | `parametro_definicao`, `parametro_padrao` | G | Catálogo carregado por migration versionada; o processo lê; Admin publica padrões. Autoria da carga (E4, solução de Pedro em 21/11/2026): coluna `origem` (`carga_versionada` ou `usuario`) com `versao_migracao`; `registrado_por_id` nulo só na carga, por constraint; carga dos 36 parâmetros da RN 13 na migration `V202611210003__carga_parametros.sql`; FK para `usuario` no RM-20 |
| RM-20 (decisão de Pedro, 21/11/2026; antes RM-25/RM-24) | `parametro_condominio` | T | Administradora ou suporte configura, pelo processo; RN-GE-01 (autor, data, valor antigo e novo) |
| RM-24 | `auditoria` | T | Só inserção e leitura pelo `app_user`, gravada na mesma transação do ato; sem alteração nem exclusão (P5) |
| RM-24 | `auditoria_plataforma` | G | Inserção pelo processo; consulta humana não definida (8.2) |
| RM-24 | `evento_saida` | T | Gravado na transação do fato; sem acesso humano (E13) |
| RM-24 | `requisicao_idempotente` | T | Registrada no MER em 23/11/2026 (E17) |
| RM-20 | `usuario` | G | Titular lê o próprio e altera senha e tema; pré-cadastro só pelo processo; sem DELETE operacional. Colunas de credencial só pelo papel de autenticação (E6) |
| RM-20 | `sessao`, `desafio_acesso`, `controle_login` | G | Só o módulo `autenticacao`, **sem RLS como exceção explícita**, listada no teste de catálogo (P2, seção 6, item 2) |
| RM-20 | `documento`, `documento_versao`, `aceite` | G/T | Documento só existe com versão publicada (P-15); aceite imutável do titular; novo aceite por versão (RN-CD-03). Publicação global sem autor definido (8.2): só fixture na fase 2 |
| RM-21 | `condominio` | T (raiz) | Admin cria pelo processo (E7); `modalidade_gestao` e `fuso_horario` (E3) |
| RM-21 | `bloco`, `unidade`, `portaria`, `portaria_bloco` | T | Administradora, suporte ou responsável local administra; morador ou proprietário lê a própria unidade; sem DELETE. Bloco opcional (E2) |
| RM-21 | `vinculo_condominio` | T | Titular lê os próprios contextos sem condomínio aberto (E7); administradora, suporte ou responsável local cria e encerra; sem DELETE |
| RM-21 | `vinculo_unidade`, `episodio_moradia`, `habilitacao_unidade` | T | Alteração com vigência `[inicio, fim)`. Exatamente um morador habilitado em unidade ocupada e nenhum em desocupada (RN-CD-04, MER, seção 6). Novo episódio sem herdar o anterior (RN-CD-25) |
| RM-21 | `contrato_locacao`, `versao_locacao` | T | Só o necessário para inquilino e proprietário não residente (RN-CD-20; P-14: o contrato é a fonte); aviso e carência de fim de contrato são rotinas, fora da fase 2 |
| RM-21 | `mandato`, `substituicao`, `funcionario` | T | Operadores por modalidade; síndico e subsíndico de unidades diferentes (RN-CD-10); preservar histórico |
| RM-22 | `plano`, `preco_plano`, `assinatura_condominio` | G/T | Admin mantém pelo processo; sem recalcular o passado; sem fatura na fase 2 |
| RM-22 | `administradora`, `usuario_administradora`, `administracao_condominio` | G/T | Criação de administradora sem RN/RF/US (lacuna, E11); no máximo uma vigente (E2) |
| RM-22 | `solicitacao` | T | Solicitante lê as próprias; administradora ou suporte atende; o solicitante não marca como atendida (RN-CD-06) |
| RM-22 | `autorizacao_suporte`, `acesso_suporte`, `atribuicao_plataforma` | G/T | Suporte só no Gestão + Suporte (RN-CD-16, SEG-13); primeira atribuição de Admin em E5 |
| RM-22 (condicional) | `arquivo` | T | Só se E11 incluir os comprovantes da primeira habilitação (AG-02 A, decisão 2A) |

**Fora do recorte:** `lotacao_funcionario`, `funcionario_portaria` (E1, 20/11/2026), `parametro_area`, `pedido_lgpd` (só a revogação de sessões que ele causa), `dispositivo`, `operacao_sync`, `notificacao`, `entrega_notificacao`, `preferencia_notificacao`, `execucao_rotina` e todos os domínios das fases 3 e 4.

### 3.2 Identidades técnicas de banco (proposta; decisão em E6)

| Identidade | Poder | Onde existe |
| --- | --- | --- |
| Provisionamento | Superusuário do contêiner. Cria banco, schemas (`condomifacil`, histórico do Flyway em schema próprio), papéis e extensões (`btree_gist` em `extensoes`) | Só no script de inicialização do Docker local e do CI |
| `migrador` | Dono dos objetos; só o Flyway o usa; sem BYPASSRLS | Flyway local e no CI |
| `app_user` | `NOSUPERUSER NOBYPASSRLS NOINHERIT`, não dono, sem `TRUNCATE`, `REFERENCES` e `TRIGGER`. Só pelo `TenantContext` com `set_config(..., true)` (P3, P5) | API e worker |
| `app_autenticacao` (nome proposto) | Privilégios por coluna em `usuario` (credencial) e em `sessao`, `desafio_acesso` e `controle_login`; sem acesso a tabelas de tenant | Só o módulo `autenticacao` da API |
| `fixtures` | BYPASSRLS, só para preparar dados; encerra a sessão antes dos testes, que rodam como `app_user` | Só banco descartável local e CI; nunca em staging, piloto ou produção |

Além do contexto do condomínio, o `app_user` usa a variável local `app.escopo` (`plataforma`, única condição para inserir em `auditoria_plataforma`; `sistema`, só para o despachante do worker ler `evento_saida` pendentes sem condomínio aberto), com o mesmo modelo de confiança de `app.condominio_id` (ADR-001).

Regras da P5 herdadas: `validate` estrito (`-ignoreMigrationPatterns=` vazio); `transactional.lock=false`; todo `CONCURRENTLY` reexecutável (drop e create) com `.conf` explícito; `connectRetries`; migrations só por ligação direta; listener de erro no driver; `inflightQueryAbortStrategy` padrão, sem conexão de controle; teste de catálogo de RLS a cada migration; guarda no driver e `no-restricted-imports` impedem consulta fora do `TenantContext`. A P3 acrescenta que é proibido `SET` de sessão.

## 4. Recorte de contrato

O contrato está em [`docs/05-backend/api/`](../05-backend/api/README.md), proposta de 10/11/2026, e as convenções estão no [guia da API](../05-backend/api/01-guia-da-api.md). Aceitar o recorte (E1) só vale para estas operações.

| Pacote | Arquivo | Operações (operationId) |
| --- | --- | --- |
| RM-24 (todas) | `componentes/comum.yaml` | Esquema `Erro` (`codigo`, `mensagem`, `request_id`, `detalhes`), `X-Request-Id`, `Idempotency-Key`, respostas de erro reutilizáveis (`Erro403`, `Erro404`, `Erro426`, `Erro429` e as demais do guia, seção 8) |
| RM-20 | `openapi/comum.yaml` | `comumPedirCodigo`, `comumAtivar`, `comumEntrar`, `comumRedefinirSenha`, `comumRenovar`, `comumSair`, `comumListarAceitesPendentes`, `comumRegistrarAceites`, `comumObterPerfil`, `comumAtualizarPerfil` (tema), `comumListarSessoes`, `comumEncerrarSessao` |
| RM-21 | `openapi/comum.yaml` | `comumListarContextos` (o contexto vai por `X-Condominio-Id` e `X-Unidade-Id` em cada requisição; não existe operação de troca) |
| RM-21 | `openapi/morador.yaml`, `openapi/proprietario-nao-residente.yaml` | `moradorConsultarCondominio`, `moradorConsultarUnidadeAtiva`, `proprietarioNaoResidenteConsultarUnidade` |
| RM-21 | `openapi/administradora.yaml` | Unidades (listar, criar, obter, atualizar), `administradoraDefinirMoradorHabilitado`, `administradoraRegistrarMudancaDeMorador`, `administradoraMarcarUnidadeDesocupada`, `administradoraRegistrarRetornoDoProprietario`, `administradoraListarVinculos`, `administradoraPreCadastrarPessoa`, `administradoraListarFuncionarios`, `administradoraDesligarFuncionario`, `administradoraCadastrarContratoDeLocacao`, mandatos (listar, registrar, encerrar), substituição (obter, ativar, desativar) |
| RM-21/RM-22 | `openapi/sindico.yaml` | Prefixo `/v1/sindico/gestao/*` da autogestão (unidades, morador habilitado, mudança, desocupação, retorno, vínculos, pré-cadastro, funcionários); `sindicoListarSolicitacoes`, `sindicoCriarSolicitacao`; substituição (obter, ativar, desativar) |
| RM-22 | `openapi/administradora.yaml` | `administradoraListarSolicitacoesDeCadastro`, `administradoraAtenderSolicitacaoDeCadastro`, `administradoraRecusarSolicitacaoDeCadastro` |
| RM-22 | `openapi/plataforma.yaml` | `plataformaListarCondominios`, `plataformaCadastrarCondominio`, `plataformaObterCondominio`, `plataformaAtualizarCondominio`, `plataformaRegistrarContratacaoDeAdministradora`, `plataformaListarAutorizacoesDeSuporte`, `plataformaConcederAcessoDeSuporte`, `plataformaEncerrarAcessoDeSuporte`, `plataformaAbrirContextoDeSuporte`, `plataformaEncerrarContextoDeSuporte`, `plataformaListarAcessosDeSuporte` (RF-AD-24, SEG-13) |

**Fora do recorte de contrato:** `administradoraPreCadastrarEmLote` (formato da planilha é lacuna), conta recebedora e termo do titular pessoa física, bloqueios de entrada, dispositivos, pedidos LGPD e todas as demais operações.

**O que falta no contrato (E9, E10 e E11):**

- Os caminhos de `entrar`, `redefinir-senha`, `renovar` e `sair` estão marcados como Proposta. `renovar`, `sair` e as sessões estão sem RF (`x-rastreabilidade` vazia).
- Não há operação de troca de senha com sessão aberta. A P2 usou `/v1/eu/senha`.
- Não está definido como o servidor distingue web (cookie httpOnly com CSRF) de app (corpo).
- Não há valores de limite de taxa, guarda da `Idempotency-Key`, nem `X-App-Version` e versão mínima (API README, pendência 19).
- O DTO de substituição é legado e "exige revisão antes de implementar" (`sindico.yaml`).
- Não há operação para cadastrar administradora nem para listar os condomínios da administradora (`administradora.yaml` e `plataforma.yaml`, `x-lacunas`).
- Não há operação para a primeira atribuição de Admin ou Suporte, nem para a primeira habilitação com comprovantes, ausência, contestação e transição (BL-DV-05 e BL-DV-06 da [baseline](../baseline-de-escopo-mvp.md)).
- `packages/shared-types` hoje gera só `comum.yaml` e o AsyncAPI (D3 da fase 1). Os demais arquivos do recorte precisam entrar na geração (E10).

## 5. Estrutura no monorepo (preserva esqueletos existentes)

| Local | O que entra | Fonte |
| --- | --- | --- |
| `backend/apps/api/db/migracoes/` | SQL do Flyway (`VAAAAMMDDNNNN__descricao.sql`, `.conf` para os não transacionais); papéis e grants na migration da entidade | [Estratégia de migrations](../04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md), 3.1 e 3.2; P5 |
| `backend/apps/api/db/` (local) | Compose do PostgreSQL 17 com o digest fixado, script de provisionamento local e configuração do Flyway sem segredo | Decisão 3 |
| `backend/apps/api/db/seeds/` | Base fictícia mínima para uso manual (três condomínios com pelo menos duas unidades), carregada pela identidade `fixtures` | Estratégia, 6.1 e 7 |
| `backend/apps/api/src/compartilhado/tenant/` | `TenantContext` (`sql.begin` + `set_config` local), guarda no driver, única porta para dados de tenant | P3, P5; ADR-001, item 4 |
| `compartilhado/autorizacao/` | Guards de autenticação (verificação do JWT numa função só, com algoritmo, emissor e audiência fixos), contexto (`X-Condominio-Id`), papel efetivo com cache curto (E15) e unidade | P2, seção 6; guia, seção 3 |
| `compartilhado/erros/`, `logger/`, `outbox/`, `parametros/`, `portas/` | Filtro global com `Erro`; log JSON com `request_id`, sem nome, e-mail ou documento; gravação do `evento_saida`; `ParametrosService`; porta `Mailer` | [Backend](../05-backend/01-backend.md), 4.5 a 4.8 |
| `src/modulos/autenticacao/` (**novo**) | Login, código, ativação, recuperação, renovação, sessões; conexão com `app_autenticacao`, fora do `TenantContext` | Decisão já fechada; P2, seção 6, item 2 |
| `src/modulos/acesso/` (existe) | Aceites, perfil, contextos do titular, papel efetivo | Backend 3.1 |
| `src/modulos/condominio/` (existe) | Condomínio, blocos, unidades, portarias, vínculos, habilitação, locação mínima, funcionários | Backend 3.3 |
| `src/modulos/governanca/` (existe) | Mandatos e substituição (sem eleições) | Backend 3.3 |
| `src/modulos/plataforma/`, `configuracao/`, `auditoria/` (existem) | Cadastro de condomínio, planos e assinatura, suporte; catálogo de parâmetros; auditoria | Backend 3.3 |
| `src/interfaces/http/comum/` (existe) | `/v1/acesso/*`, `/v1/eu/*`, além da saúde | Backend 3.3, decisão 5 |
| `src/interfaces/http/{administradora,sindico,morador,proprietario-nao-residente,plataforma}/` (existem) | Controllers do recorte da seção 4 | Backend 3.3 |
| `src/integracoes/email/` (existe) | Caixa de saída falsa (E14) | Backend 3.1 |
| `backend/apps/api/test/{isolamento,integracao,e2e}/` | Banco real com `app_user`; dois condomínios, unidades e funções; concorrência com conexões independentes; factories determinísticas | Backend 3.1; estratégia, 6.2 e 7 |
| `frontend/apps/mobile/src/app/(acesso)/` e `(autenticado)/_layout.tsx` (existem) | Login, código, senha, recuperação e aceites; guarda de sessão e contexto | [Frontend](../06-frontend/frontend.md), 2.1 |
| `src/modulos/acesso/`, `src/modulos/contexto/`, `src/infraestrutura/{api,seguranca}/` (existem) | Sessão, renovação single-flight com trava entre abas e processos, expo-secure-store, limpeza do cache no logout e na revogação | Frontend, 2.1; ADR-007; P2, seção 7 |
| `src/app/(web)/` (existe) | Telas administrativas conforme E12 | Frontend, 2.1; ADR-016 |
| `frontend/packages/ui` e `frontend/apps/catalogo-componentes` | Componentes do acesso (campo de texto, campo de código, senha, seletor de contexto), com stories e axe | D4 da fase 1 |
| `packages/shared-types` | Geração ampliada aos arquivos do recorte (E10); tipos do banco do kysely-codegen ficam no backend (E18) | ADR-015; P1, P5 |
| `.github/workflows/ci.yml` | Job de banco com Postgres de serviço e Flyway (E18), sem deploy; tipos do banco gerados por `pnpm db:tipos` (kysely-codegen 0.20.0) em `src/compartilhado/tenant/gerado/` e conferidos por `git diff --exit-code` no job `banco` (RM-24, 23/11/2026) | Decisão 3; D6 |

Regras mantidas: a pasta organiza, não protege (backend 3.4); `dominio/` sem NestJS nem banco; módulos se falam só pelo `index.ts`; pacotes não dependem de apps (ADR-015); a camada de acesso é a única que importa o driver.

## 6. Etapas e verificações (na ordem decidida)

| Ordem | RM | Entrega | Prova objetiva |
| --- | --- | --- | --- |
| 1 | RM-25 | PostgreSQL 17 em Docker; papéis da seção 3.2; Flyway com as regras da P5; teste de catálogo de RLS; factories determinísticas (UUID estável, namespace rejeitado se já existir); harness de isolamento com dois condomínios; catálogos (E4) | Instalação limpa por um comando documentado; `validate` estrito recusa migration alterada, removida ou fora de ordem; o catálogo aponta uma tabela de tenant criada sem RLS; testes rodam como `app_user` (não dono, sem BYPASSRLS); a carga de fixtures é recusada fora de banco descartável; restauração do cenário de teste (recriar e recarregar) dá o mesmo estado |
| 2 | RM-24 | Erro padronizado, `X-Request-Id`, idempotência (E17), `TenantContext` como única porta, auditoria e `evento_saida` na mesma transação, despachante (E13), log estruturado sem dado pessoal, porta `Mailer` com a caixa falsa | Toda resposta de erro valida contra `Erro`; mesma chave e mesmo corpo devolvem a resposta original e corpo diferente dá 422; falha depois do ato desfaz ato, auditoria e evento juntos; consulta fora do `TenantContext` é recusada antes do banco; busca no log não acha e-mail nem nome |
| 3 | RM-20 | Pedir código, ativar, entrar, recuperar, renovar (B+E de 30 s), sair, sessões, troca de senha, aceites por versão, tema; telas do app e da web | Os critérios da P2 repetidos sobre o código novo, mais: retry dentro de 30 s com sucessor não usado passa uma única vez; fora disso revoga; resposta igual para e-mail existente ou não (RN-CD-02); código de 6 dígitos, 15 min, 5 tentativas e reenvio em 60 s; pausa de 15 min após 5 senhas erradas (SEG-04); troca de senha encerra as outras sessões (US-AC-04); nova versão de documento bloqueia até novo aceite (RN-CD-03); sessão no expo-secure-store provada em aparelho (E21) |
| 4 | RM-21 | Condomínio, blocos, unidades, portarias, vínculos, morador habilitado, proprietário, inquilino e dependente, funcionários, mandatos e substituição, contextos do titular | Unidade ocupada com exatamente um habilitado e desocupada com nenhum, inclusive sob duas transações concorrentes; mudança de morador encerra o acesso e preserva o histórico (RN-CD-07); novo vínculo não herda score nem acessos (RN-CD-25); síndico e subsíndico de unidades diferentes; FK cruzando condomínio é recusada (23503) |
| 5 | RM-23 | Autorização em HTTP e RLS, cache de papel, cache do cliente; escopo dos canais ainda inexistentes em E20 | Revogar função, vínculo ou tenant tira a capacidade dentro da janela do cache (E15), inclusive por rota direta; `X-Condominio-Id` sem vínculo dá a resposta de E8 com corpo idêntico para existente e inexistente; recurso de outro condomínio dá 404; logout e revogação limpam o cache do app; suporte fora do Gestão + Suporte não abre contexto; administradora sem acesso a reclamações e scores segue por guard e RLS |
| 6 | RM-22 | Cadastro de condomínio com plano e modalidade pela plataforma; administradora vinculada; autogestão (síndico executa, sub em substituição, conselho fiscaliza, AG-01 A); solicitações; suporte só no Gestão + Suporte; primeira habilitação conforme E11 | Ninguém concede poder a si mesmo (decisão 3A); solicitação só é atendida por outro perfil; transição de modalidade auditada (RN-PL, 11.1); primeiro responsável só com a comprovação aprovada em E11; todas as ações em `auditoria` ou `auditoria_plataforma` |
| Saída | Fase 2 | Jornada completa: pré-cadastro, primeiro acesso, aceites, contexto, tela permitida por perfil | Critérios do roadmap, seção 7; `pnpm check`, job de banco do CI e `test:a11y` passando; relatório com versões, hashes, saída dos testes e falhas, sem segredo |

## 7. Decisões E1 a E22 — aprovadas (opção A)

**Vigente: a opção A de todas as decisões.** Aprovadas por Pedro em 20/11/2026: E1, E6, E7 e E17. Aprovadas por Pedro em 21/11/2026: E2, E3, E4, E5, E8 a E16 e E18 a E22. As colunas abaixo preservam as opções e a recomendação apresentadas na época.

| ID | Decisão | Opções e consequência | Recomendação e motivo |
| --- | --- | --- | --- |
| E1 | Aceite do recorte do MER, da política e do contrato | **A.** Aceitar só as tabelas da seção 3 e as operações da seção 4, para implementar a fase 2; o resto segue proposta. **B.** Aceitar os documentos inteiros. **C.** Revisar cada documento por completo antes | **A.** É o que a decisão 2 pede. Aceitar o todo antes da hora congelaria pendências das fases 3 e 4 (P-03, P-06, P-09), e a opção C atrasa sem reduzir risco no recorte **Aprovada por Pedro em 20/11/2026: opção A.** |
| E2 | P-10 no recorte (cardinalidades) | Blocos: **A.** opcionais (`bloco_id` nulo); **B.** obrigatórios. Administradora: **A.** no máximo uma operacional vigente, com restrição de vigência; **B.** sem restrição física, só regra na aplicação. Listas, reentrada e procuração ficam fora (fases 3 e 4) | Blocos **A** e administradora **A**. Prédio sem bloco é caso legítimo, e uma restrição obrigatória recusaria esse caso. Uma administradora vigente segue RN-PL-06 e a proposta do MER, e a restrição física evita duas administradoras ao mesmo tempo. **Muda o MER (seção 9):** registrar a resposta |
| E3 | Outras pendências do MER que tocam o recorte | **P-05 (fuso):** vigências em `timestamptz` e `condominio.fuso_horario` com o padrão `America/Sao_Paulo`, sem rotinas na fase 2, ou decidir o ADR-012 agora. **P-09 (retenção):** sem expurgo na fase 2 (só dados fictícios) ou fixar prazos. **P-11:** criar `episodio_moradia` sem crédito após troca de responsável | Adiar as três, com as salvaguardas citadas. Sem rotinas nem dados reais, nenhuma delas muda o resultado da fase 2. O ADR-012 e a retenção ficam como bloqueio antes das rotinas (fase 3) e do piloto |
| E4 | Autoria técnica da primeira carga de catálogos (roadmap 5.5, passo 3; estratégia, linha 204) | **A.** Coluna de origem: `registrado_por_id` nulo só quando `origem = 'carga_versionada'`, com a versão da migration, garantido por constraint. **B.** Tabela de ator técnico ("sistema") referenciada pela FK. **C.** Não carregar `parametro_padrao` na fase 2 | **A.** Não inventa administrador humano nem senha global (a estratégia proíbe), deixa a autoria rastreável pelo histórico do Flyway e é a menor mudança. B cria uma identidade que parece usuário. C adia o problema e deixa a `ParametrosService` sem dados. **Muda o MER** (`parametro_padrao`, linha 318) |
| E5 | Primeira atribuição de Admin da plataforma | **A.** Na fase 2, só um Admin fictício criado pela identidade `fixtures`; a atribuição real fica num procedimento de provisionamento auditado, definido antes do primeiro condomínio oficial. **B.** Criar agora a operação de API para isso | **A.** O operador ainda não foi nomeado e Pedro não assume como Admin (decisão 1C, AG-02 A). Não há dado real na fase 2. A lacuna 8.2 da política continua aberta para o pré-piloto |
| E6 | Identidades técnicas de banco | **A.** As cinco da seção 3.2 (provisionamento, `migrador`, `app_user`, `app_autenticacao`, `fixtures`), com o worker usando `app_user`. **B.** Seguir a estratégia à risca: `fixtures` sem BYPASSRLS, com política auxiliar temporária removida antes dos testes | **A**, com `fixtures` BYPASSRLS só em banco descartável. Foi o que a P3 e a P5 provaram, é mais simples e não chega à API. **Diverge da estratégia (4.1, linha 114):** registrar a escolha lá **Aprovada por Pedro em 20/11/2026: opção A.** |
| E7 | Leituras sem condomínio aberto e contexto de plataforma | **A.** Políticas explícitas sob `app_user`: titular lê os próprios `vinculo_condominio` por `app.usuario_id`; escopo `plataforma` (atribuição conferida no servidor) cria `condominio`, assinatura e administradora. Sem `SECURITY DEFINER`. **B.** Funções `SECURITY DEFINER` de travessia | **A.** O teste de catálogo da P5 exige ausência de `SECURITY DEFINER`, e políticas explícitas ficam visíveis no catálogo e testáveis. A travessia da administradora com vários condomínios continua por contexto, um condomínio por vez **Aprovada por Pedro em 20/11/2026: opção A.** |
| E8 | 403 ou 404 para `X-Condominio-Id` sem vínculo (P2, seção 7) | **A.** 403 com corpo idêntico para existente e inexistente, e 404 para recurso de outro condomínio. **B.** 404 também no contexto | **A.** É o que o guia (seção 3) e o `comum.yaml` já dizem, e a P2 provou que o corpo idêntico não confirma existência. B mudaria o contrato sem ganho real |
| E9 | Lacunas do contrato em RM-20 e RM-21 (seção 4) | **A.** Uma tarefa de contrato antes do código de cada pacote: fixar caminhos, troca de senha, distinção web/app, códigos de erro e substituição, e levar a Pedro. **B.** Implementar o contrato como está e corrigir depois | **A.** O ADR-015 põe o contrato como fonte da geração, e corrigir depois obriga a regenerar e refazer clientes. As operações sem RF (renovar, sair, sessões) precisam do vínculo com ADR-007 e SEG-04 na rastreabilidade |
| E10 | Ampliar a geração de `shared-types` | **A.** Gerar todos os arquivos OpenAPI do recorte (comum, morador, proprietário não residente, administradora, síndico, plataforma). **B.** Gerar todos os 11 arquivos de uma vez | **A.** Segue o D3 (gera só o que se usa) e mantém pequeno o diff de geração verificado no CI. Os demais entram com seus módulos |
| E11 | Operações ausentes para o RM-22 (BL-DV-05 e BL-DV-06) | **A.** Pedro autoriza escrever RF, US e contrato da primeira habilitação comprovada (AG-02 A, decisões 2A e 5A), do cadastro de administradora e da lista de condomínios, antes do RM-22, com a rastreabilidade completa. **B.** O RM-22 fica só com o que já tem contrato, e a primeira habilitação é feita por fixture. **C.** Adiar o RM-22 | **A**, feita em paralelo aos pacotes anteriores (o RM-22 é o último). A saída do RM-22 exige "primeiro responsável comprovado", e B não prova isso. Se A incluir comprovantes, entram `arquivo` e um armazenamento local (sem Supabase Storage) |
| E12 | Escopo de telas na fase 2 | **A.** App e web: acesso, aceites, contexto e tela inicial permitida por perfil; painel web mínimo para pré-cadastro, unidades, morador habilitado e solicitações (administradora e `/sindico/gestao`); plataforma só por API e testes de ponta a ponta. **B.** Telas para todas as operações do recorte. **C.** Só API, sem telas administrativas | **A.** Cobre a jornada "pré-cadastro, primeiro acesso e tela permitida" que a saída pede, com o menor volume de UI. A plataforma tem um único operador, ainda não nomeado. C não fecha o critério "entre tela, API e banco" |
| E13 | Outbox e ADR-006 (Proposto) | **A.** Aceitar do ADR-006 só o outbox transacional em PostgreSQL e um despachante em laço no processo worker (no plano gratuito, no mesmo serviço), sem decidir fila nem agendador. **B.** Só gravar `evento_saida` na fase 2, sem despachante. **C.** Aceitar o ADR-006 inteiro | **A.** O RM-24 pede outbox e o e-mail do código precisa sair por algum caminho. B deixaria o outbox sem prova de entrega, e C decide carga sem dado. O despachante lê `evento_saida` por condomínio, com `app_user`. **Complemento de Pedro em 23/11/2026:** `evento_saida` continua de tenant; os e-mails de acesso do RM-20 (código e recuperação) saem pela porta `Mailer` direto, sem outbox; se o envio falhar, o usuário pede reenvio (60 s), com resposta igual com ou sem conta (RN-CD-02); o despachante do RM-24 é provado com evento de condomínio. **Decisão de Pedro em 23/11/2026:** o despachante descobre os condomínios com pendência pelo escopo `sistema` do `app_user`, que lê só `evento_saida` pendentes e não publica; só o worker usa esse escopo. |
| E14 | E-mail na fase 2 | **A.** Só a caixa de saída falsa (adaptador em memória ou arquivo, mais Mailpit opcional no Docker). **B.** Resend em sandbox | **A.** Não envia nada para fora nem testa entregabilidade, que é outra prova (ADR-005). Evita dado em serviço externo |
| E15 | Parâmetros de sessão herdados da P2 | Checagem do `sid`: **A.** sem cache, uma consulta por PK a cada requisição; **B.** com cache igual ao do papel. Cache do papel: 5 s (P2) configurável. Algoritmo: **A.** HS256 na fase 2; **B.** EdDSA ou ES256 já | `sid` **A**, cache de papel de 5 s configurável e HS256 **A**. A revogação imediata custa uma consulta barata. Só a API verifica o JWT na fase 2, e a troca de algoritmo fica como condição antes do WebSocket (fase 3) |
| E16 | Limites de taxa e Argon2 | **A.** Implementar SEG-04 e RN-CD-02 persistidos em `controle_login` e `desafio_acesso`, mais um limitador por IP e e-mail em memória com valores provisórios configuráveis. **B.** Fixar valores definitivos agora | **A.** Os limites do produto já estão nas regras, e os valores de abuso dependem de medição (API README, pendência 19). Argon2 com parâmetros padrão, só registrado como risco (seção 8) |
| E17 | Guarda da `Idempotency-Key` | **A.** Tabela de idempotência por condomínio, usuário e chave, com hash do corpo e resposta, guarda provisória de 24 h e 422 para corpo diferente. **B.** Só restrições naturais na fase 2 | **A.** O RM-24 exige idempotência e a P4 mostrou que o React Native reenvia POST sozinho. **Muda o MER**: a tabela não existe nele **Aprovada por Pedro em 20/11/2026: opção A.** |
| E18 | CI do banco e imagem do Flyway | **A.** Job próprio `banco` em PR: `postgres:17` como serviço e imagem `flyway/flyway:13.12.2` fixada por digest com cache; kysely-codegen regenerado e conferido por diff. **B.** Java 25 com o pacote da CLI. **C.** Rodar o job só quando `db/` mudar | **A**, em paralelo ao job `verificar`. Fixar o digest torna o resultado reproduzível, e o job separado isola o peso de cerca de 1,1 GB. Antes, conferir na documentação oficial a telemetria do Flyway e como desligá-la. C deixaria passar mudança de código que quebra a RLS |
| E19 | Lista do dia da portaria sob RLS (P3) | **A.** Não mitigar na fase 2, porque não toca o recorte; reavaliar na fase 3. **B.** Mitigar já | **A.** A portaria é fase 3. A ressalva continua no ADR-001 |
| E20 | Escopo do RM-23 nos canais que ainda não existem | **A.** Provar HTTP, RLS e cache do servidor e do cliente agora, mais um teste reutilizável de revogação que arquivos, WebSocket, jobs e exportações terão de passar quando chegarem. **B.** Criar canais mínimos só para testar | **A.** Não cria código sem uso. O roadmap continua exigindo o teste quando cada canal entrar |
| E21 | Prova de expo-secure-store em aparelho (ressalva do ADR-007) | **A.** Expo Go no emulador Android e no iPhone (o expo-secure-store vem no Expo Go), mais a web com cookie. **B.** Dev build | **A.** É o mesmo caminho do D8 e fecha a ressalva sem conta de loja. Dev build só se o Expo Go não bastar |
| E22 | Branch e destino do código | **A.** Este pacote e o código na `feat/fase-2-acesso` (de `develop`, commit `108ae7a`), com commits por pacote RM aprovados um a um e PR para `develop` quando Pedro indicar. **B.** Uma branch por RM | **A.** A ordem é sequencial e uma branch evita rebases entre pacotes. Promoção a `staging`, `main` ou à branch de docs só por indicação de Pedro (regra de Git) |

## 8. Riscos

- **Argon2 e memória no Render:** com os parâmetros padrão (64 MiB, 3 passes, paralelismo 4), cada login simultâneo aloca 64 MiB, e o plano gratuito tem 512 MiB. Não medido, e o deploy está fora da fase 2. Medir e ajustar antes de qualquer deploy (P2, seção 7).
- **Retry B+E:** durante 30 s, um refresh roubado também renova. É um risco aceito, mas ainda sem prova; a trava entre abas na web não foi testada na P2.
- **HS256 simétrico:** qualquer processo que verifica também emite. Rever antes do WebSocket.
- **Supavisor e Supabase real não testados:** os prepared statements pelo pooler podem exigir `prepare: false`.
- **Carga com Kysely e NestJS não medida:** RNF-01 e RNF-17 da API inteira ficam para a carga antes do lançamento.
- **Imagem do Flyway de cerca de 1,1 GB:** pesa no CI, e a telemetria da CLI não foi verificada.
- **Docker no Windows:** variação de desempenho entre rodadas e limite de 260 caracteres de caminho no build nativo (P4).
- **Contrato e MER propostos:** E2, E4 e E17 mudam o MER, e E9 e E11 mudam o contrato. Implementar antes de registrar essas mudanças quebraria a rastreabilidade. Em 21/11/2026, a E4 já foi registrada no MER (P-17 e `parametro_padrao`) e a E2 também já consta (P-10); a E17 foi incluída no MER em 23/11/2026 (`requisicao_idempotente`); E9 e E11 seguem como estão.
- **Divergências encontradas, não corrigidas (fora do pedido):**
  - RN-CD-18 (`03-regras-de-negocio.md`, linha 94) tem texto embaralhado.
  - RF-AD-01, 04 e 05 (PRD) citam só a administradora, enquanto RN-CD-01 inclui o responsável local da autogestão.
  - O guia da API (linha 311) e o `frontend.md` (linhas 23, 193 e 391) ainda tratam o refresh e os ADRs 003 e 007 como em aberto.
  - RF-AC-07 diz "texto revisado pelo parecer" e a baseline diz "texto provisório".
  - Política (5.3, linha 171) e estratégia (6.1, linha 200) divergem sobre quem mantém planos e preços.
- **Pendências paralelas:** reprodução da instalação por outra pessoa (fase 1) e operador da plataforma não nomeado (1C).

## 9. Rastreabilidade

- **Roadmap:** RM-20 a RM-25; seções 5.5, 5.6 e 5.8.
- **Decisões:** IN-01 A ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md)).
- **ADRs:** ADR-001, 003 (achados da P4), 007, 008 e 015 (aceitos); ADR-006 e ADR-012 (propostos, E13 e E3); ADR-004, 005 e 016 (fora da fase 2); ADR-014 (condicionado, fora).
- **PoCs:** P2, P3 e P5 ([critérios](../03-arquitetura/criterios-de-poc.md)).
- **Regras de negócio:** RN-CD-01 a 07, 10 a 12, 16, 17, 19 a 28; RN-PL-01, 02, 06, 08 e 09; RN-GE-01.
- **Requisitos:** RF-AC-01 a 08; RF-AD-01 a 06, 09 a 13, 17 a 25.
- **Histórias:** US-AC-01 a 06; US-AD-01 a 03, 06 a 12; US-PL-03 a 05.
- **Segurança e não funcionais:** SEG-03, 04, 05, 08 e 13; RNF-01, 11 e 17.
- **Autogestão:** AG-01 A, AG-02 A e as decisões 1C, 2A, 3A, 4A e 5A ([autogestão](../01-produto/06-autogestao-e-conducao-eleitoral.md)).
- **Pendências:** MER P-05, P-09, P-10, P-11, P-14 e P-15; BL-DV-05, 06, 09, 10 e 11 ([baseline](../baseline-de-escopo-mvp.md)).
