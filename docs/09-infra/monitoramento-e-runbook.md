# Monitoramento e runbook — CondomiFacil

**Data:** 14/11/2026. **Atualizado em:** 15/11/2026. **Autor do produto e responsável pelas aprovações:** Pedro Lemos.

**Estado:** proposta operacional para implementação e validação. O projeto está em Design, sem API, aplicativo, banco, monitores ou alertas implantados. Este documento detalha a observabilidade e a resposta a falhas com base nas fontes existentes; não aprova ADRs, contrata ferramentas, define plantão nem altera regras de negócio.

## Índice

1. [Escopo e fontes](#1-escopo-e-fontes)
2. [Requisitos e limites dos ambientes](#2-requisitos-e-limites-dos-ambientes)
3. [Sinais, painéis e proteção dos dados](#3-sinais-painéis-e-proteção-dos-dados)
4. [Catálogo de métricas e alertas](#4-catálogo-de-métricas-e-alertas)
5. [Resposta comum a incidentes](#5-resposta-comum-a-incidentes)
6. [Runbooks por cenário](#6-runbooks-por-cenário)
7. [Rotina de operação e exercícios](#7-rotina-de-operação-e-exercícios)
8. [Pendências antes do piloto](#8-pendências-antes-do-piloto)
9. [Rastreabilidade](#9-rastreabilidade)

## 1. Escopo e fontes

O runbook é um roteiro para reconhecer, delimitar, conter, corrigir e verificar incidentes. Os passos se destinam à futura equipe técnica autorizada; não concedem a suporte, administradora ou outro perfil acesso adicional aos dados do aplicativo. Comandos, endereços, painéis e contatos reais serão preenchidos no provisionamento, em inventário restrito quando necessário. Não há comandos executáveis hoje.

| Fonte | Uso neste documento |
| --- | --- |
| [PRD](../01-produto/02-prd.md), seções 7, 8 e 10 | Metas RNF, segurança e serviços planejados |
| [Regras de negócio](../01-produto/03-regras-de-negocio.md), seção 14, RN-OF, RN-CH, RN-RE e RN-RL | Horários, efeitos de rotina, offline, reservas e exportações |
| [Arquitetura](../03-arquitetura/01-arquitetura.md), seções 3, 6, 8 e 9 | Componentes, monitoramento, isolamento e recuperação |
| [Backend](../05-backend/01-backend.md), seções 4 a 6 | Idempotência, outbox, execução de rotinas e adaptadores |
| [Integrações externas](../05-backend/api/03-integracoes-externas.md) e [eventos/webhooks](../05-backend/api/02-eventos-e-webhooks.md) | Cadeias de entrega, recibos, autenticação e conciliação |
| [Infra e DevOps](infra-e-devops.md), seções 2 a 9 | Vercel web, Render API/worker, Supabase, ambientes, publicação, cópias e restauração |
| [Segurança](../07-seguranca/seguranca.md), seções 8 e 9; [LGPD](../07-seguranca/lgpd.md) | Papéis, severidade, evidências, comunicação e dados pessoais |
| [Plano de testes](../08-qualidade/01-plano-de-testes.md) | Ensaios de isolamento, offline, carga, integrações e recuperação |
| [ADR-004](../03-arquitetura/adr/004-nuvem-regiao-residencia-dados.md), [ADR-006](../03-arquitetura/adr/006-fila-agendador-eventos.md) e [ADR-013](../03-arquitetura/adr/013-rpo-rto-backup-pitr.md) | Limites da construção gratuita; fila e metas de recuperação ainda propostas |

O grafo de conhecimento de 12/11/2026 foi consultado para localizar relações entre disponibilidade, jobs, pagamentos, offline e nuvem. Os documentos atuais prevalecem sobre esse retrato anterior às revisões de infraestrutura e relatórios.

## 2. Requisitos e limites dos ambientes

### 2.1 O que já está definido nas fontes

| Referência | Meta ou obrigação existente | Como acompanhar |
| --- | --- | --- |
| RNF-01 | 95% das requisições em menos de 500 ms | Distribuição de latência e proporção abaixo de 500 ms; p95 por rota normalizada e ambiente |
| RNF-02 | Tela utilizável em 3 s no 4G, aparelho de 3 GB de RAM | Medição por versão em aparelho de referência; telemetria de abertura não substitui o ensaio |
| RNF-05 | Novo visitante aparece na portaria em até 5 s | Tempo da confirmação do cadastro até atualização visível no cliente conectado; medir etapas separadamente |
| RNF-09 | Disponibilidade de 99,5% ao mês | Sonda externa e histórico de incidentes; relatório por mês e componente |
| RNF-06/07/08 | Portaria e limpeza offline; sincronização automática com pendências visíveis | Idade/tamanho da fila, última sincronização bem-sucedida e resultados de reenvio |
| RNF-11 | Isolamento entre condomínios | Detecção de acesso cruzado e verificações negativas de isolamento; estatística de erros não comprova isolamento |
| RNF-13 | Backup diário, sete dias de retenção, restauração testada mensalmente | Evidência de cópia íntegra e recuperável, retenção e último exercício aprovado |
| RNF-18 | Alertas em 80% e 100% do orçamento nos serviços pagos | Consumo por serviço/ambiente e consolidado; orçamento aprovado antes de ativar |
| SEG-17 | Conciliação diária entre cobranças e pagamentos | Última execução por condomínio, cobertura, pendências e divergências |
| RN seção 14 | Registrar execução das 22 rotinas (inclui a rotina 22, Conciliação diária com o gateway, na madrugada, ordem do ADR-012; atende SEG-17) e respeitar frequência/horário | Comparar janela esperada com execução e efeito; não apenas contar processos vivos |

As janelas de avaliação de latência, a cadência da sonda, a definição operacional de indisponibilidade e as exclusões do cálculo mensal ainda precisam ser validadas. Registrar interrupções e manutenção separadamente; não retirar períodos do denominador para declarar atendimento da meta. Ausência de tráfego não comprova sucesso.

### 2.2 Limites que afetam a operação

- **Dev e staging gratuitos:** somente dados fictícios e sandbox. O Render pode suspender o serviço; API, WebSocket e worker compartilhados param juntos. Um processo de API saudável não prova que jobs estão sendo consumidos. Monitoramento não deve ser usado como artifício para contornar a suspensão do plano.
- **Banco e arquivos:** Supabase apenas como PostgreSQL e Storage, acessados pelo backend conforme o desenho existente. Pausa, quotas e ausência de garantias de recuperação do gratuito impedem apresentá-lo como produção validada.
- **Web:** Vercel conforme Infra e DevOps (hospedagem do painel web: [ADR-016](../03-arquitetura/adr/016-hospedagem-do-painel-web.md), Proposto). A web pode abrir normalmente durante queda da API; verificar ambos os caminhos. A escolha não pressupõe Next.js nem funcionalidades adicionais.
- **Notificações de teste:** dev/staging usam caixa de saída falsa para e-mail; push só em aparelhos de teste autorizados. Silêncio do Resend nesse ambiente não indica falha de envio real.
- **Piloto:** continuidade, capacidade, monitoramento externo, responsáveis e recuperação devem ser demonstrados na revisão do ADR-004. RPO/RTO do ADR-013 seguem propostos; não apresentar 15 minutos/quatro horas como compromisso aprovado.

## 3. Sinais, painéis e proteção dos dados

### 3.1 Coleta proposta

| Sinal | Origem planejada | Uso e limite |
| --- | --- | --- |
| Disponibilidade externa | Verificação fora da API/worker e da dependência monitorada | Detectar falha mesmo se o serviço cair; ferramenta e canal ainda a selecionar |
| Saúde e prontidão | Verificação mínima do processo e checagem das dependências necessárias | Separar vivo de apto a atender; rotas exatas ainda não definidas; resposta pública sem detalhes internos |
| Métricas de aplicação | API, Socket.IO, worker, outbox, adaptadores e clientes de teste | Identificar em que etapa o fluxo parou; métricas propostas, ainda sem instrumentação |
| Infraestrutura | Painéis/logs autorizados de Vercel, Render e Supabase | Capacidade, reinícios, implantação, conexões e quotas; disponibilidade das métricas depende do plano |
| Erros | Sentry e logs sanitizados, previstos no PRD | Correlacionar falha e versão; quota ou queda do Sentry não pode silenciar o monitor externo |
| Evidência de negócio | `execucao_rotina`, estado de jobs/outbox, entregas e eventos do gateway | Confirmar efeitos e atrasos; acesso técnico delimitado, sem consulta indiscriminada ao conteúdo |

Manter painéis de visão geral, API/tempo real, processamento assíncrono, integrações e dados/recuperação. Mostrar ambiente, período, versão, última amostra e lacunas de coleta. Comparar com a versão anterior e tráfego equivalente. Um gráfico sem amostras deve mostrar ausência de dados, não zero falhas.

Registrar correlação por `request_id`, release, rotina/janela, operação e identificadores técnicos permitidos. Usar rotas normalizadas nas métricas, sem IDs individuais na URL. Não usar usuário, token, e-mail, documento ou unidade como rótulo de série. Consulta detalhada por condomínio fica em ferramenta restrita, com necessidade e acesso registrados; identificadores também exigem proteção.

Logs, alertas e Sentry não recebem senha, chave, cabeçalho de autenticação, token push, URL assinada completa, cartão, voto, identidade protegida, texto de reclamação/avaliação, anexos nem conteúdo de relatório. Captura automática de corpo, URL e contexto deve ser filtrada também no cliente. Telemetria offline usa contagens/estados mínimos e só é enviada quando houver conectividade; não copiar a fila pessoal para diagnosticar atraso.

### 3.2 Contrato de cada alerta

Cada regra futura precisa registrar: identificador, ambiente/componente, métrica e unidade, condição, janela, amostra mínima, severidade, responsável e substituto, canal, escalonamento, runbook e critério de recuperação. Guardar última avaliação e testar a chegada do aviso ao responsável. O canal de incidente precisa funcionar sem o push do próprio app e sem depender exclusivamente da API monitorada.

Agrupar alertas da mesma causa em um incidente. Se o banco cair, correlacionar os alertas de API, jobs e notificações; preservar a visibilidade dos impactos sem emitir um chamado independente por mensagem atrasada. Silenciamento de manutenção tem início, fim, dono e registro; não silencia vazamento ou corrupção. A falta de coleta também exige investigação.

## 4. Catálogo de métricas e alertas

**Leitura da tabela:** as metas citadas já vêm das fontes. As demais condições são critérios propostos de detecção, sem limiar numérico novo. Antes de ativar cada regra, calibrar janela, frequência e tolerância com carga e ensaios, registrar a aprovação e testar ruído/recuperação. Não há promessa de resposta em minutos nem cobertura 24 horas.

| ID | Métricas e sinais | Condição de alerta / interpretação | Runbook |
| --- | --- | --- | --- |
| MON-01 | Resultado/duração da sonda HTTP, prontidão, 5xx, timeouts, reinícios, CPU/memória | Falha persistente confirmada por verificação independente ou prontidão perdida; distinguir suspensão de dev/staging | RB-01 |
| MON-02 | Latência por rota, p95, fração abaixo de 500 ms, chamadas externas e banco | Violação sustentada de RNF-01 em janela validada; avaliar amostra e separar cold start, sem ocultá-lo da experiência | RB-01/03 |
| MON-03 | Abertura web, erro de bundle/configuração, HTTPS, DNS, versão publicada | Web inacessível, certificado inválido ou erro após publicação; web saudável com API falhando é MON-01 | RB-02 |
| MON-04 | Conexões/espera do pool, consultas lentas, bloqueios, espaço, erros e prontidão do banco | Saturação, indisponibilidade, crescimento em direção à quota ou falha de consulta de controle | RB-03 |
| MON-05 | Último sinal do worker, jobs prontos/em execução/falhos, idade do mais antigo **elegível**, tentativas, outbox não despachado | Trabalho elegível envelhece sem progresso, falha repetida ou execução travada; job agendado para o futuro não é atraso | RB-04 |
| MON-06 | Rotina/janela esperada x iniciada/concluída, duração, contagens e erro sanitizado | Janela não executada ou efeito ausente; erro repetido conforme backend; usar horário local e catálogo das 21 rotinas | RB-04 |
| MON-07 | Evento de pagamento recebido/duravelmente gravado/processado, HTTP de webhook, fila interrompida, divergências | Falha de autenticação inesperada, evento persistido sem efeito, interrupção do webhook ou conciliação diária ausente/divergente | RB-05 |
| MON-08 | Pendências de pagamento por meio e idade, timeout/erro do adaptador, reembolso incerto | Estado local difere do gateway ou ultrapassa prazo de confirmação **a validar por meio**; silêncio sem pagamento esperado não é falha | RB-05 |
| MON-09 | Notificações elegíveis, fila, tickets, recibos, erros por plataforma/versão, tokens inválidos, teste em aparelho | Falha sistemática de envio/recibo ou teste controlado sem chegada; aceitação não comprova entrega no aparelho | RB-06 |
| MON-10 | Código/e-mail enfileirado, aceito, falho, atraso, quota e teste de entregabilidade | Acesso/comprovante não enviado, rejeição sistêmica ou quota próxima do limite; evento de entrega só se webhook Resend for aprovado | RB-07 |
| MON-11 | Conexões/desconexões, reconexões, atraso de evento, confirmação de atualização no cliente | Novo visitante excede 5 s em cliente conectado (RNF-05), perda de atualização ou falha sistemática de reconexão | RB-08 |
| MON-12 | Último sync, quantidade/idade de operações pendentes, reenvios, duplicidades, conflitos e anexos pendentes | Fila deixa de progredir **após restabelecer rede/autorização**, divergência não tratada ou perda suspeita; aparelho offline não informa métricas em tempo real | RB-09 |
| MON-13 | Autorização de upload/download, erro Storage, objetos ausentes, capacidade e cópia | Falha sistêmica, quota, metadado sem objeto ou acesso indevido; URL vencida isolada exige reautorizar, não abrir bucket | RB-10 |
| MON-14 | Estado/idade do job de exportação, duração, falhas, acesso negado e expiração | Exportações sem progresso ou autorização quebrada; prazos/volume/concorrência seguem pendentes em RN-RL-08 | RB-11 |
| MON-15 | Último backup recuperável, resultado/cópia de objetos, retenção e teste mensal | Cópia diária ausente/falha, conjunto incompleto ou teste mensal vencido/falho; job iniciado não prova backup válido | RB-12 |
| MON-16 | Acesso cruzado, contexto ausente aceito, credencial exposta, alteração financeira indevida | Um caso confirmado já exige contenção; falhas de login/403 isolados não comprovam vazamento | RB-13 |
| MON-17 | Consumo/gasto por serviço/ambiente e total | 80% e 100% do orçamento (RNF-18); quotas técnicas também acompanhadas, sem inventar cota comercial | RB-14 |
| MON-18 | Última amostra, falha de sonda/coletor, quota Sentry e teste de alerta | Ausência inesperada de telemetria ou aviso não recebido; verificar por caminho independente | RB-14 |

Para RNF-05, o intervalo interno evento-a-socket ajuda a investigar, mas não mede sozinho a atualização visível. Telemetria do aparelho precisa tratar diferença de relógio e indisponibilidade de rede; complementar com ensaio controlado. Para notificações, apresentar separadamente eventos gerados, elegíveis após preferência/horário, tentativas e resultado; não classificar aviso opcional desligado como perda.

## 5. Resposta comum a incidentes

### 5.1 Severidade, responsabilidade e escalonamento

Aplicam-se as três severidades e os papéis de [Segurança, seção 9](../07-seguranca/seguranca.md). Não há uma escala operacional concorrente.

| Severidade | Aplicação à operação |
| --- | --- |
| Crítica | Indisponibilidade ampla sem contenção, vazamento confirmado entre condomínios, exposição de voto/identidade, credencial amplamente comprometida ou alteração indevida de pagamentos; acionar imediatamente os responsáveis designados |
| Alta | Comprometimento/integridade restritos ou degradação relevante de fluxo essencial, com alcance ainda em avaliação; priorizar contenção e recuperação |
| Moderada | Falha isolada com alternativa segura, tentativa bloqueada ou vulnerabilidade sem exploração identificada; investigar e corrigir, reclassificando se o impacto crescer |

O coordenador registra e acompanha; o responsável técnico investiga/recupera; comunicação prepara os avisos; privacidade/jurídico avaliam dados e obrigações; Pedro valida prioridades e decisões de produto/infra sob sua responsabilidade. Titulares, substitutos, horários e meios de acionamento estão pendentes. Sem reconhecimento no intervalo que vier a ser aprovado, acionar o substituto e o coordenador pelo canal alternativo; não pressupor que e-mail ou push confirmou ciência humana.

### 5.2 Sequência de atendimento

1. **Abrir registro:** horário com fuso, ambiente, alerta/relato, sintomas, versão, operações afetadas e responsável. Registrar início estimado e detecção separadamente.
2. **Confirmar e delimitar:** reproduzir com conta fictícia de teste autorizada; verificar outro caminho/rede; comparar API, web, banco, worker e provedores. Distinguir um dispositivo, um condomínio, uma plataforma ou falha geral.
3. **Conter com menor impacto:** proteger filas e evidências, suspender somente o processamento afetado se houver risco de duplicidade/exposição. Não desligar controles de autorização para acelerar retorno.
4. **Investigar a causa:** correlacionar horário com publicação, configuração, credencial, quota, suspensão e falha externa. Registrar hipóteses e evidências separadamente. Consultar situação oficial do provedor sem concluir que ela explica todos os sintomas.
5. **Recuperar de forma controlada:** corrigir configuração/código ou aplicar retorno compatível conforme Infra e DevOps. Reinício é medida delimitada, com evidência e resultado registrados; não repetir reinícios indefinidamente. Migração não recebe reversão destrutiva improvisada.
6. **Verificar o fluxo completo:** leitura e escrita autorizadas, persistência, processamento e resultado no cliente; conferir efeitos externos/idempotência e isolamento. Sonda verde isolada não encerra o incidente.
7. **Comunicar e encerrar:** registrar impacto conhecido, limites, ações, evidências e pendências. Coordenador confirma estabilização na janela que vier a ser aprovada; análise posterior registra causa, correção e prevenção com responsável.

Modelo de aviso operacional: “Identificamos falha em [funcionalidade/ambiente] desde [horário/fuso]. Impacto confirmado: [descrição mínima]. Orientação: [alternativa validada]. Estamos [ação]. Próxima atualização: [horário definido pelo coordenador].” Não anunciar prazo de recuperação sem evidência nem publicar dados de condomínio/usuário. Comunicações legais seguem Segurança/LGPD e os responsáveis jurídicos, sem criar novo prazo neste runbook.

## 6. Runbooks por cenário

### RB-01 — API fora do ar, erro elevado ou lentidão

**Diagnosticar:** verificar sonda externa, DNS/TLS, prontidão, logs sanitizados, versão e reinícios. Comparar uma rota de leitura autorizada com uma escrita de teste; separar falha de rede de 5xx. Conferir suspensão em dev/staging, banco/pool, dependências, memória e implantação recente. Se web abre mas chamadas falham, comparar URL da API e CORS do ambiente.

**Conter/recuperar:** preservar a fila durável; corrigir configuração ou retornar à versão anterior compatível pelo procedimento de Infra e DevOps. Em dev/staging, retomar serviço suspenso para a sessão de teste e registrar backlog esperado. Em produção futura, suspensão inesperada exige revisão do provisionamento. Não restaurar banco por simples queda de processo. Se banco for a causa, seguir RB-03; se houver corrupção, RB-12/13.

**Alternativa:** portaria e limpeza usam apenas operações e dados previstos para offline, com última sincronização visível. Reserva paga, vistoria que exige internet, pagamentos e demais operações online aguardam retorno; não confirmar sucesso localmente nem sugerir duplicar pagamento.

**Validar saída:** prontidão e caminho externo estáveis; requisições autorizadas persistem; worker e outbox progridem; portaria reconecta e sincroniza sem duplicidade. Acompanhar latência e erros após a retomada.

### RB-02 — Web indisponível ou quebrada após publicação

**Diagnosticar:** verificar DNS, certificado, disponibilidade Vercel, publicação ativa, carregamento de arquivos e erros de inicialização. Comparar versão/configuração pública com a API correta, origem CORS e Socket.IO. Checar se o problema se limita a navegador/cache ou ocorre em cliente novo.

**Conter/recuperar:** usar retorno do artefato web compatível com API/esquema, conforme Infra e DevOps; corrigir DNS/configuração com registro do estado anterior. Não inserir segredos no build para corrigir autenticação. Preservar rascunhos quando possível; limpeza de cache do navegador só após avaliar dados locais pendentes.

**Validar saída:** abrir em sessão nova, autenticar com conta de teste, navegar no perfil permitido, consultar API e executar fluxo afetado; verificar ambiente e versão. App mobile é alternativa somente para fluxos já suportados por ele, sem prometer substituição integral do painel.

### RB-03 — Banco indisponível, conexões saturadas ou consultas bloqueadas

**Diagnosticar:** consultar situação do projeto, pausa, conexão/TLS, credencial, pool, bloqueios e consultas lentas por ferramenta autorizada. Conferir alteração recente de SQL/RLS, crescimento de carga e concorrência do worker. Falha de permissão não deve ser tratada como justificativa para usar superusuário.

**Conter/recuperar:** reduzir carga não essencial, como exportações, preservando fila e chaves de idempotência; corrigir vazamento de conexão ou consulta identificada. Retomar projeto pausado apenas no ambiente correto. Encerrar consulta/bloqueio somente após avaliar transação e efeito; não apagar tabela de fila. Restaurar somente quando houver perda/corrupção confirmada e pelo RB-12.

**Validar saída:** conexão com papel real da aplicação, leitura/escrita por condomínio, negação cruzada, commits sem falha e consumo de jobs. Reabrir carga gradualmente e verificar se a causa da saturação foi resolvida.

### RB-04 — Worker, outbox ou rotinas pararam

**Diagnosticar:** API viva não basta. Verificar sinal do consumidor, banco/fila, jobs elegíveis, locks, tentativas, início/fim e resultado de `execucao_rotina`. Comparar o catálogo de backend §5.2 com janela/fuso do condomínio. Distinguir evento imediato, disparo a cada cinco minutos, rotina diária e envio agendado. O mecanismo `pg-boss` é proposta do ADR-006; usar o diagnóstico da fila efetivamente aprovada.

**Conter/recuperar:** corrigir consumidor/conexão e recuperar execução interrompida conforme o mecanismo validado de lease/lock. Reprocessar por janela e condomínio, com as mesmas chaves e rechecagem da regra atual. Classificar efeitos já concluídos, pendentes e incertos antes de repetir. Após suspensão, não disparar toda a fila de uma vez nem recriar cobranças para compensar silêncio do worker.

**Cuidados por efeito:** geração de cobranças precede marcação de atraso; recorrências precedem fechamento financeiro. Mês fechado se corrige por estorno. Não reiniciar janela de reabertura de 48 h por correção de conclusão offline. Push de rotina da madrugada segue 09:00 locais; lembrete de reserva tem regra própria, só antes do início e uma vez. Não reenviar lembrete vencido como se ainda fosse útil. Consultar o catálogo para as demais dependências.

**Validar saída:** execução conclui com contagens coerentes, outbox é despachado, job repetido não duplica efeito e backlog diminui. Conferir amostra autorizada dos efeitos, incluindo expiração de reservas, conciliação, prazos e limpeza/anonimização afetados.

### RB-05 — Pagamento confirmado no gateway sem baixa, webhook falhando ou reembolso incerto

**Diagnosticar:** delimitar ambiente, conta/subconta e referência da tentativa. Conferir Asaas, autenticação do endpoint, registro durável do evento e consumo. Distinguir evento não recebido, recebido sem persistência, persistido sem processamento e transição rejeitada. Verificar interrupção da fila de webhooks no provedor; consultar prazos por meio validados na PoC, sem assumir confirmação instantânea de boleto/Pix.

**Conter/recuperar:** autenticação do Asaas é token `asaas-access-token`, conforme ADR-002, sem HMAC de corpo. Nunca desabilitar validação; corrigir/rotacionar credencial pelo procedimento de segredos. Confirmar entrega somente após persistência durável, antes do processamento assíncrono. Corrigir a causa antes de retomar reenvio no provedor. Reprocessar evento já persistido pelo seu ID; consultar/conciliar cobranças pelo identificador externo e aplicar a mesma máquina de estados, sem regressão ou baixa dupla.

Se a criação ou o reembolso terminou com timeout, consultar resultado externo antes de repetir. Não orientar novo pagamento, recriar cobrança ou fazer baixa manual genérica para “destravar”. Baixa externa manual continua ação de negócio com comprovante, motivo e permissão. Preservar histórico e mês fechado; divergências financeiras seguem responsáveis autorizados.

**Validar saída:** gateway e estado local conciliados, baixa/estorno e receita automática sem duplicidade, comprovante enfileirado uma vez e ausência de confirmação indevida. Conferir conciliação diária de todos os condomínios atingidos; informar explicitamente casos ainda incertos. Falha de e-mail/push não reverte o pagamento.

### RB-06 — Push parou de chegar

**Diagnosticar por etapa:** evento de negócio → outbox → notificação interna → elegibilidade/preferência/horário → job de envio → ticket → recibo → aparelho de teste. Separar Android/iOS, versão, um token e falha ampla. Verificar permissão do sistema, canal/configuração do aparelho, registro após login e remoção no logout, sem expor tokens. Checar fila/worker, credenciais do projeto e erros do adaptador.

Ticket aceito pelo Expo não prova recebimento. Recibo também não prova exibição/leitura pelo usuário; confirmar em aparelho de teste. Consultar recibos na cadência prevista no documento de integrações, a validar na implementação. Falta de amostra/recibo exige diagnóstico, não conclusão de entrega.

**Conter/recuperar:** corrigir credencial/configuração ou consumidor; aplicar recuo para falhas transitórias/limite de taxa, sem laço de reenvio. Ao receber `DeviceNotRegistered`, remover/inativar token conforme arquitetura e aguardar novo registro; não repetir erro permanente. Preservar notificação interna. Não disparar teste para moradores reais nem mensagens sensíveis na tela bloqueada.

**Reenvio:** revalidar preferência, vínculo, destinatário, validade, horário e chave de entrega; não reenviar em massa avisos antigos. Decisão de reclamação e divergência de sync são os tipos obrigatórios existentes; cobrança em atraso obrigatória segue pendente. Aviso de rotina da madrugada pode estar corretamente aguardando 09:00; lembrete de reserva usa RN-RE-14.

**Validar saída:** evento fictício elegível gera notificação interna, ticket e recibo sem erro e chega a aparelhos autorizados de cada plataforma atingida; abrir detalhe exige autenticação/permissão. Conferir que token inválido não recebe novas tentativas e que o backlog útil progrediu. Sem push, orientar consulta das atualizações dentro do app, quando a API estiver disponível; não criar SMS/e-mail alternativo sem regra aprovada.

### RB-07 — E-mail de acesso ou comprovante não chega

**Diagnosticar:** em dev/staging conferir caixa de saída falsa; em teste real autorizado/produção, percorrer outbox, `Mailer`, resposta do Resend e ID de envio. Verificar domínio/remetente, DNS de envio, quota, credencial, rejeição e spam com destinatário de teste. Aceitação pelo provedor não comprova leitura. Webhook Resend e métricas de entrega dependem de aprovação própria; não pressupor que existam.

**Conter/recuperar:** corrigir remetente/credencial/consumidor e respeitar idempotência; não repetir envio incerto apenas porque expirou a janela de deduplicação do provedor. Código vencido não deve ser reenviado: usar novo pedido pelo fluxo normal com validade/limites, sem revelar se há conta cadastrada. Falha do comprovante não repete pagamento/reembolso. Manter links privados/expiráveis; não anexar dados pessoais como alternativa improvisada.

**Validar saída:** caixa de teste recebe código válido e o fluxo de acesso mantém resposta sem enumeração; comprovante corresponde à operação correta. Se webhook aprovado, verificar assinatura sobre corpo bruto e atualização da entrega; jamais desabilitar assinatura para restaurar visibilidade.

### RB-08 — Lista da portaria não atualiza em tempo real

**Diagnosticar:** verificar HTTP e WSS separadamente, autenticação da conexão, salas autorizadas/blocos, queda/reconexão, consumidor de outbox e versão do cliente. Usar visitante fictício e medir do cadastro confirmado à lista visível. Distinguir dispositivo sem rede de falha geral de Socket.IO; confirmar edição/cancelamento e entregas esperadas, não apenas conexão aberta.

**Conter/recuperar:** corrigir publicação/configuração de socket e reconectar com contexto atual. Fazer `pull` incremental autorizado ao reconectar para recuperar mudanças; consulta periódica é fallback proposto e só pode ser acionada se implementada/testada. Não substituir tempo real por push, abrir sala global nem transmitir todos os blocos.

**Alternativa:** quando sem rede, usar a lista local do dia prevista para offline, com última atualização e pendências visíveis. Cache antigo não representa autorização atual garantida; aplicar as regras de divergência na sincronização. Não prometer cadastro novo em cinco segundos enquanto o aparelho estiver desconectado.

**Validar saída:** novo visitante aparece em até cinco segundos no cenário conectado, edições/cancelamentos chegam, reconexão recupera mudanças e outro condomínio/bloco não recebe eventos indevidos.

### RB-09 — Fila offline não sincroniza ou surgem divergências

**Diagnosticar:** distinguir ausência de rede, sessão/vínculo revogado, falha de API, rejeição por regra, cursor inválido e foto não enviada. Registrar contagens, instante da última sincronização, versão e IDs técnicos protegidos. Comparar operação enviada, confirmação e efeito persistido; HTTP perdido pode esconder operação já aplicada.

**Conter/recuperar:** preservar fila e anexos protegidos. Não mandar reinstalar, apagar dados, limpar banco local ou fazer logout para “resolver” antes de tratar as pendências. Reautenticar quando permitido e reenviar com o mesmo `op_id`; upload de anexo e conclusão devem manter correlação/idempotência. Operação sob vínculo revogado não pode ser reassociada a outro usuário para forçar aceitação.

**Divergência:** aplicar RN-OF-04 e o fluxo da portaria. Para conclusões do mesmo ciclo de limpeza, vale o menor horário registrado no celular, mesmo enviado depois; avaliação da conclusão superada fica no histórico, fora das médias, sem transferência, e a correção não reinicia as 48 h. Empate exato/relógio incorreto seguem ADR-014 proposto; não escolher vencedor operacionalmente por ordem de chegada. Após restauro do servidor, validar cursores/deduplicação antes de liberar reenvios (RB-12).

**Validar saída:** fila progride sem perda/duplicação, pendências e rejeições ficam visíveis, resultado converge em dois dispositivos e anexos são autorizados. Se uma operação não puder ser recuperada, registrar e encaminhar pelo procedimento aprovado; não descartá-la silenciosamente.

### RB-10 — Arquivo não sobe, não abre ou aparece ausente

**Diagnosticar:** separar autorização da API, URL expirada, envio direto ao Storage, confirmação do upload e objeto inexistente. Verificar endpoint/bucket/ambiente, credencial, quota, tamanho/tipo permitido e CORS web. Comparar metadado com existência do objeto sem baixar conteúdo pessoal desnecessário.

**Conter/recuperar:** reautorizar para emitir nova URL temporária quando cabível; corrigir configuração sem tornar bucket público nem distribuir credencial S3. Repetir envio pela mesma operação idempotente, preservando arquivo local pendente. Confirmar existência/integridade antes de marcar anexo concluído. Se houve exclusão/perda, recuperar pelo conjunto de cópias de objetos de Infra e DevOps; backup do PostgreSQL sozinho não recupera arquivo.

**Validar saída:** upload, confirmação e leitura por usuário permitido; negação para outro contexto e expiração correta da autorização. Objeto ausente deve gerar falha explícita; não disponibilizar arquivo parcial. Acesso indevido segue RB-13.

### RB-11 — Relatório/exportação preso, falho ou download indevido

**Diagnosticar:** conferir estado Solicitada/Em processamento/Pronta/Falhou/Expirada, solicitante, contexto, tipo/formato permitido, worker, erro sanitizado, objeto e etapa de autorização. Comparar com referência de cálculo e filtros sem registrar conteúdo do relatório. Não inventar prazo de conclusão ou retenção: RN-RL-08 mantém esses parâmetros pendentes.

**Conter/recuperar:** suspender somente a geração afetada se houver sobrecarga; corrigir worker/Storage e retomar idempotentemente, revalidando vínculo/permissão. Falha não oferece arquivo parcial. Não mudar job para Pronta manualmente nem criar URL pública para contornar download negado. Revogação de acesso continua bloqueando listagem/consulta/download, ainda que o arquivo exista.

**Validar saída:** arquivo privado correto para solicitante autorizado; estado e filtros coerentes; usuário revogado e outros solicitantes/condomínios negados. PNG/SVG continuam apenas de gráficos agregados. Se houve exposição, conter entrega e seguir RB-13; cópia já baixada não pode ser apagada remotamente.

### RB-12 — Backup falhou, dado foi perdido ou restauração é necessária

**Diagnosticar:** confirmar último conjunto realmente recuperável, banco/objetos/chaves, janela de perda, falha da execução/cópia e resultado mensal. Backup falho não exige restaurar o banco íntegro; corrigir execução/destino/chave e produzir/verificar nova cópia. Não apagar última cópia válida para liberar espaço antes de avaliar retenção/recuperação.

**Recuperar:** seguir [Infra e DevOps, seção 8](infra-e-devops.md#8-restauração-e-recuperação), procedimento completo: conter escritas/efeitos externos, preservar evidências, restaurar em recinto isolado, selecionar código/esquema compatíveis, reconstruir objetos/acessos e reaplicar exclusões/anonimizações/revogações posteriores ao ponto. Restauração de um condomínio não pode regredir os demais.

Conciliar pagamentos com Asaas antes de liberar fila/outbox; separar efeitos concluídos, pendentes e incertos para não duplicar cobrança, reembolso ou aviso. Validar cursores/IDs offline preservando dispositivos. Votos ou lançamentos manuais perdidos podem não ser reconstruíveis; registrar perda conhecida sem inventar voto ou efeito financeiro.

**Validar saída:** isolamento/integridade, arquivos privados, permissões atuais, conciliação, efeitos externos controlados e retomada por etapas aprovada pelo responsável designado/Pedro conforme Infra e DevOps. Medir perda e tempos reais; comparar com RPO/RTO somente após aprovados. Arquivar evidência restrita do exercício/recuperação.

### RB-13 — Suspeita de vazamento, credencial exposta ou integridade comprometida

Acionar [Segurança, seção 9](../07-seguranca/seguranca.md#9-plano-de-resposta-a-incidentes). Conter a menor superfície eficaz — rota, exportação, sala, job, URL ou chave — preservando evidências. Revogar/rotacionar credenciais pelo inventário de consumidores. Não dar acesso de suporte a reclamações, score ou voto para investigar.

Identificar período, contextos afetados e possíveis cópias; corrigir causa e testar negação cruzada como papel da aplicação, inclusive arquivos, cache, sockets e jobs. Restauração não corrige política de autorização defeituosa. Retorno exige comprovação de isolamento/integridade e decisão registrada. Privacidade/jurídico e controladores avaliam comunicações e guarda de evidências conforme Segurança/LGPD; não aguardar encerramento técnico para acioná-los.

### RB-14 — Custo/quota excedendo limite ou monitoramento silencioso

**Custo/quota:** conferir origem, período, ambiente, tráfego, repetição de jobs, volume de arquivos/exportações e erro de credencial exposta. Alertas em 80%/100% seguem RNF-18. Reduzir carga não essencial e desperdício com responsável; Pedro avalia orçamento/plano. Não desligar produção, apagar evidência/cópia válida ou retirar proteção automaticamente para caber no limite. Se consumo vier de abuso, RB-13.

**Monitoramento:** verificar quota/ingestão, configuração de ambiente/release, coletor, sonda e canal; testar falha fictícia e confirmação humana por caminho independente. Usar registros de infraestrutura e verificações manuais autorizadas enquanto a telemetria estiver degradada. Falta de erro no Sentry não prova serviço disponível. Registrar janela sem visibilidade e reavaliar possíveis incidentes no período.

**Validar saída:** consumo explicado e ação registrada, coleta atualizada, alerta de teste recebido e recuperação reconhecida; orçamento e retenção continuam sob aprovação, sem contratação automática.

## 7. Rotina de operação e exercícios

| Cadência / evento | Verificação e evidência |
| --- | --- |
| Durante atendimento e após publicação | Disponibilidade/prontidão, versão, erros, latência, fluxo de portaria e consumo do worker; acompanhar aumento de falhas e duplicidades |
| Revisão operacional diária proposta | Janela das 22 rotinas, conciliação diária (rotina 22; divergências registradas para tratamento), filas elegíveis, notificações, cópia diária e capacidade; registrar exceções e responsável |
| Mensal | Teste de restauração exigido por RNF-13; relatório de disponibilidade RNF-09; revisão de custos/orçamento e lacunas de monitoramento |
| A cada versão | Ensaios offline RNF-16, isolamento e fluxos alterados; verificar filtros de telemetria e instrumentação por release |
| Antes do lançamento e a cada versão principal | Carga RNF-17 com 5.000 unidades/dez portarias, mantendo RNF-01 e RNF-05, em ambiente adequado |
| Antes do piloto e após mudança relevante de operação | Exercitar queda de API/banco, worker parado, push ausente, webhook duplicado/atrasado, restauro e canal de alerta indisponível |
| Após incidente | Revisar causa, efetividade do alerta/runbook, detecção, reconhecimento e recuperação; acompanhar ação corretiva até evidência de conclusão |

Os exercícios usam dados fictícios, sandbox, aparelhos e contas de teste autorizados; não desligar produção para testar monitor. Simular falha por porta/adaptador e relógio/rede controlados, preservando SOLID e baixo acoplamento (GRASP). Observer/outbox, Adapter e idempotência já propostos permitem verificar recuperação sem duplicar efeitos; não introduzir nova plataforma para executar o exercício.

Medir tempos de detecção, ciência, contenção, recuperação e encerramento com marcos explícitos; médias isoladas não substituem o registro de cada incidente. Revisão diária depende de titular/substituto e cobertura a designar. Manter links do painel, inventário de recursos, acesso de emergência e contatos atualizados em local restrito e acessível durante queda da aplicação.

## 8. Pendências antes do piloto

| Pendência | Responsável a validar / evidência necessária |
| --- | --- |
| Titular, substituto, canal independente, horários e escalonamento | Pedro/equipe: designação nominal em inventário restrito; teste de acionamento e reconhecimento |
| Ferramenta de métricas/sonda e notificações do monitor | Engenharia/Pedro: selecionar dentro do orçamento, acessos, localização/retenção dos dados e tolerância à queda da API; Sentry permanece para erros |
| Janelas, amostra mínima, tolerâncias, severidade e recuperação dos alertas | Engenharia/produto: medir baseline em carga/ensaios, calibrar sem ocultar RNF e validar ruído; preencher contrato da seção 3.2 |
| Disponibilidade mensal | Pedro/engenharia: aprovar pontos de medição, cadência e método de cálculo; manter incidentes e manutenção visíveis |
| Continuidade e capacidade | Revisão obrigatória ADR-004, planos adequados, região, web/API/worker, fila aprovada e ausência de suspensão no piloto |
| RPO/RTO, PITR e cópias recuperáveis | ADR-013 e Infra e DevOps: metas aprovadas, destino/chaves/objetos e exercício comprovado; não aceitar ADR por este documento |
| Pagamentos | PoC ADR-002: prazos por meio, consulta/retomada de webhook, KYC/chargeback, reembolso e conciliação demonstrados |
| Entregabilidade | Validar credenciais/projetos push e teste nos dois sistemas; webhook Resend só mediante aprovação; não pressupor canal novo |
| Retenção e acesso à telemetria/evidências | Segurança/LGPD/P-09: finalidade, prazo, minimização, subprocessadores, guarda restrita e descarte; não fixar retenção arbitrária |
| Offline e exportações | Resolver pendências ADR-014/P-07 e RN-RL-08; provar tratamento de fila pendente, autorização/expiração e recuperação |

## 9. Rastreabilidade

| Tema | Seções deste documento | Referências |
| --- | --- | --- |
| Disponibilidade e desempenho | 2, 3, MON-01/02/03/11, RB-01/02/08 | RNF-01/02/05/09/17; arquitetura 3.3/3.4/6.8; Infra e DevOps 9 |
| Jobs e efeitos de negócio | MON-05/06, RB-04 | RN seção 14; backend 5; ADR-006/012 ainda propostos |
| Pagamentos | MON-07/08, RB-05/12 | SEG-12/17/18; RN-PG/RN-FI; ADR-002; eventos/webhooks; integrações 2 |
| Push e e-mail | MON-09/10, RB-06/07 | RF-NO-01; US-NO-01; RN-RE-14; RN-RC-10; RN-OF-04; RN seção 14; integrações 3/5 |
| Offline e sincronização | MON-12, RB-08/09/12 | RNF-06/07/08/16; RN-OF; RN-CH-04/15; SEG-09; ADR-003/014 |
| Arquivos e relatórios | MON-13/14, RB-10/11 | RN-FI-24/30; RN-RL-01 a 08; RF-RL-01 a 11; backend e painel web |
| Banco, backup e recuperação | MON-04/15, RB-03/12 | RNF-11/13; ADR-001/004/013; Infra e DevOps 7/8; Segurança/LGPD |
| Incidentes, proteção e custos | 3, 5, MON-16/17/18, RB-13/14 | SEG-02/05/08/11/17/18; RNF-18; Segurança 8/9; LGPD; Infra e DevOps 9 |

As referências documentam a origem dos cuidados operacionais. IDs MON e RB são identificadores locais para navegação deste runbook, sem criar requisitos RF, RN ou novos acessos.
