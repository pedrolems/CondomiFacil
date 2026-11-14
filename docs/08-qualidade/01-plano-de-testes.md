# Plano de testes — CondomiFacil

**Data:** 14/11/2026  
**Status:** Proposta para revisão de Pedro Lemos.  
**Fase:** Design, antes da implementação. Não existem app, API, banco, migrações ou suítes automatizadas; o protótipo HTML simula comportamentos.

## 1. Objetivo e fontes

Este plano organiza a validação do produto, a estratégia de testes do futuro MVP, os cenários críticos e a matriz de compatibilidade. As RN, os RF, os RNF, os SEG e os critérios de aceite existentes definem o comportamento esperado. A execução, as ferramentas e os critérios operacionais propostos aqui precisam de revisão; este documento não aceita ADRs nem decide pendências de negócio.

| Fonte | Uso no plano |
| --- | --- |
| [PRD](../01-produto/02-prd.md), seções 3, 4, 7 e 8 | Perfis, funcionalidades, metas RNF-01 a 18, plataformas e SEG-01 a 18 |
| [Regras de negócio](../01-produto/03-regras-de-negocio.md), seções 3 a 15 | Invariantes, parâmetros, transições, rotinas e relatórios |
| [Histórias de usuário](../01-produto/04-historias-de-usuario.md) | Critérios de aceite e cobertura RF → US para derivar testes |
| [Design System](../02-design/01-design-system.md), seções 2, 10 a 15 e 19 | Contagem de toques, componentes, navegação, acessibilidade e privacidade |
| [User Flows](../02-design/02-user-flows.md), seções 3 a 15, 17 e 18 | Caminhos principais, erros, relatórios e pendências |
| [Arquitetura](../03-arquitetura/01-arquitetura.md), seções 3, 4.11, 6, 8 e 9, e [ADRs](../03-arquitetura/adr/README.md) | Isolamento, ambientes, desempenho e mecanismos técnicos ainda propostos |
| [MER/DER](../04-banco-de-dados/01-mer-e-der.md), seções 5 a 9 | Integridade, transações, autorização e ciclos de vida; modelo ainda proposto |
| [Backend](../05-backend/01-backend.md), seções 4.9, 5 e 6, e [contrato da API](../05-backend/api/README.md) | Níveis de teste, jobs, idempotência, integrações e contratos propostos |
| [Frontend mobile](../06-frontend/frontend.md), seções 4 a 9 | Cache, fila, builds nativas, push, arquivos e permissões |
| [Painel web](../06-frontend/painel-web.md), seções 3 a 8 | Relatórios, exportações, revalidação e testes do painel |
| [Protótipo](../../prototipo/README.md) | Material para validação de navegação e compreensão dos fluxos |

O grafo de conhecimento foi consultado como mapa de relações. Sua geração de 12/11/2026 antecede as decisões de relatórios de 14/11/2026; os documentos atuais prevalecem. Propostas técnicas citadas nas fontes continuam propostas.

## 2. Plano geral

### 2.1 Escopo e prioridade

O plano cobre os 11 perfis do PRD, os planos Essencial e Gestão + Suporte, condomínio com administradora e autogestão nas permissões já definidas, unidades ocupadas/alugadas/desocupadas e usuários com mais de um vínculo. O perfil Manutenção do protótipo não é perfil aceito; o acompanhamento de empresas permanece com a gestão autorizada.

| Prioridade proposta | Risco | Exemplos |
| --- | --- | --- |
| P0 — crítica | Vazamento, perda de fatos, reserva duplicada, dinheiro ou voto incorretos | Isolamento; concorrência de reservas; baixa/reembolso duplicados; fila offline; voto secreto e único; revogação de acesso |
| P1 — alta | Fluxo essencial interrompido ou regra aplicada à pessoa/unidade errada | Primeiro acesso; score por vínculo; locação; chamados; vistoria; cobrança; relatórios privados |
| P2 — complementar | Problemas de apresentação e caminhos secundários | Textos, filtros, estados vazios e ajustes visuais; elevar para P0/P1 se impedirem acesso ou expuserem dados |

Todos os módulos do MVP entram na cobertura: acesso e conta, cadastros, reservas/pagamentos, visitantes/portaria, encomendas/entregas esperadas, chamados, reclamações/score, pesquisa, comunicação, reuniões/eleições, planos/suporte, notificações/LGPD, cobrança/finanças e os nove relatórios da administradora. Parcelamento da V2 e contabilidade oficial ficam fora. Pendência não vira comportamento aprovado por existir no protótipo.

### 2.2 Etapas e entregáveis

| Etapa | Atividade | Evidência/saída |
| --- | --- | --- |
| Design atual | Revisar coerência RN → RF → US → fluxo → tela; validar protótipo com síndicos, porteiros e moradores | Roteiro, observações e problemas encontrados; simulação HTML não comprova RLS, pagamento, criptografia ou offline nativo |
| PoCs antes das partes dependentes | Gateway/sandbox, banco local e criptografia, sincronização, permissões/sessão, infraestrutura | Relatório de limites e erros, decisões de Pedro e atualização dos ADRs correspondentes quando autorizada |
| Construção do MVP | Automatizar regra e integração junto do módulo; acrescentar casos dos defeitos corrigidos | Suítes versionadas, massa sintética e cobertura rastreável |
| Candidato a versão | Regressão P0/P1, contratos, offline automatizado a cada versão, compatibilidade e acessibilidade | Relatório por build/ambiente e dispositivo, com falhas e bloqueios explícitos |
| Antes do piloto | Validar fluxos completos e operação com usuários; rever nuvem para dados reais conforme ADR-004 | Evidências e decisões dos marcos de produto; testes não substituem a revisão da infraestrutura nem o parecer jurídico |
| Antes do lançamento e versões principais | Carga RNF-17; revisão de segurança proposta; regressão completa aplicável | Resultados comparados às metas e riscos aceitos por Pedro |
| Operação futura | Restauração mensal, disponibilidade e custos; testar correções e mudanças de configuração | Registro mensal e histórico de regressão |

### 2.3 Preparação, dados e responsabilidades

Usar massa fictícia reproduzível em local/dev/staging, sem cópia de produção. Preparar condomínios A e B com áreas e unidades de nomes semelhantes, usuário só de A, só de B e com vínculo nos dois; duas portarias com blocos distintos; papéis revogados, mandatos encerrados e substituição ativa/encerrada. Preparar limites de score, atraso, reserva, locação, quórum, quantidade de avaliações e parâmetros configuráveis.

Datas devem ser controláveis: antes/no/depois do prazo, meia-noite, fim de mês/trimestre/contrato e fusos distintos. Injetar relógio em testes de domínio; nas integrações, registrar instante UTC e horário local do condomínio. Mudanças de parâmetros não alteram processos em andamento que conservam regras aplicadas (RN-GE-03).

| Responsabilidade proposta | Atividade |
| --- | --- |
| Desenvolvimento | Testes de domínio, componentes, API, banco, jobs e correção de defeitos |
| Responsável pela qualidade, a designar | Manter matriz, coordenar execução e conferir evidências; não pressupõe contratação de equipe separada |
| Responsável técnico por segurança/infra, a designar | Revisar isolamento, segredos, restauração, carga e configuração dos ambientes |
| Pedro Lemos | Validar decisões de produto e proposta do plano, priorizar pendências e avaliar resultado de homologação |
| Participantes do piloto | Validar compreensão e operação real por perfil; não substituem testes técnicos |

E-mails, push e pagamentos em dev/staging usam destinatários/aparelhos de teste e sandbox do Asaas, sem movimentar dinheiro real. Conservar fixtures de sucesso, recusa, timeout e resposta inválida dos adaptadores. Asaas, Supabase + Render e Resend foram escolhidos com ressalvas; o plano gratuito que dorme não prova as metas de produção.

## 3. Estratégias por nível e tipo

### 3.1 Testes funcionais e automatização

| Nível/tipo | Estratégia e exemplos | Ambiente e frequência propostos |
| --- | --- | --- |
| Revisão estática | Rastreabilidade, lint/checagem de tipos quando houver código, validação OpenAPI/AsyncAPI, segredos e projeções sensíveis | Revisão atual de documentos; depois, em cada alteração relevante no CI |
| Unitários | Funções de domínio e casos de uso com relógio, repositórios e portas falsas: score, limites, juros em centavos, antecedência, estados, lembretes e elegibilidade | Sem rede/banco; a cada alteração |
| Componentes | Formulário, validação, estado vazio/erro/carregamento, foco, texto+ícone, dois temas e renderização por permissão | Cliente isolado com respostas controladas; a cada alteração |
| Integração com banco | PostgreSQL real com RLS e migrações futuras; restrições, transações, concorrência, rollback, auditoria e outbox | Ambiente descartável; PR/alteração de módulo, políticas ou esquema |
| Contratos | Requisições, respostas, erros, paginação e campos por perfil conforme OpenAPI; canais/mensagens conforme AsyncAPI; contrato comum dos adaptadores | CI com dublês; sandbox valida comportamento real do provedor |
| Integrações externas | Asaas, Resend, Storage e push: autenticação, timeout, indisponibilidade, limites, repetição, retorno inválido e reconciliação | Sandbox/contas de teste; alterações do adaptador e candidato a versão |
| Ponta a ponta (E2E) | Cliente → API → banco/jobs → integração de teste: login, reserva, pagamento, portaria, chamado, voto e relatório; resultado persistido e autorização revalidados | Staging e builds distribuíveis; fluxos P0/P1 em cada candidato |
| Exploratórios/usabilidade | Usuários executam tarefas sem instrução passo a passo; testar erro, retorno, compreensão de prazo/score e operação de portaria | Protótipo agora; app/painel depois, antes do piloto e em mudanças de fluxo |
| Regressão | Casos existentes afetados pelo domínio alterado e todos os P0; defeito corrigido ganha teste no nível que detecta a causa | A cada mudança; regressão de versão inclui RNF-16 |

Domínio testável segue SOLID (inversão de dependência) e GRASP (responsabilidade na camada que conhece a regra). Dublês das portas `PaymentGateway`, `Mailer` e repositórios devem respeitar o contrato dos adaptadores, inclusive erros. Testar efeitos de Strategy/Adapter/Observer/outbox quando adotados; a presença de um padrão não é critério de aprovação por si só.

Não fixar percentual de cobertura como substituto de critérios de aceite. Medir ramos críticos e manter cada critério implementado ligado a casos e evidências; uma suíte verde com critério sem teste permanece incompleta. Ferramentas de unitário, componente e E2E serão escolhidas com a implementação; k6 e axe aparecem como propostas na arquitetura, sem impor versões ou novas dependências neste documento.

### 3.2 Segurança, privacidade e isolamento

Testar autorização diretamente na API e no banco, além da interface. Esconder botão não comprova proteção. Incluir alteração de ID/cabeçalho, entrada em sala WebSocket, URL de arquivo, job de relatório e respostas atrasadas após troca de contexto. Executar o catálogo de isolamento da arquitetura 4.11 como suíte bloqueante proposta para o CI.

Verificar SEG-01 a 18: transporte protegido, segredos ausentes dos clientes, códigos/limites de login, termos versionados, DTOs sem identidade protegida, auditoria, cartões nunca armazenados, direitos do titular, suporte limitado por plano e dados financeiros por responsável. No Asaas, validar o token de webhook `asaas-access-token`, conforme ressalva do ADR-002; não escrever teste que espere assinatura de corpo inexistente nesse contrato.

Inspecionar resposta, exportação, logs, Sentry, notificações e metadados, não apenas a tela. Casos de pesquisa/avaliação incluem conjuntos abaixo/no/acima dos mínimos já definidos; privacidade de pequenos grupos nos novos relatórios permanece pendente (RN-RL-08), sem inventar limiar.

### 3.3 Offline, resiliência e ciclo de vida

Conforme RNF-16, automatizar a cada versão queda antes/durante/depois do envio, confirmação perdida, reconexão, duplicação, reinício do app e divergências. Acrescentar app em segundo plano, aparelho reiniciado, armazenamento cheio, upload interrompido, sessão expirada, revogação e atualização/migração local interrompida. Não mostrar sucesso quando a gravação local falhar.

Separar cache apagável e fila pendente: RN-OF-06 exige apagar cópia de consulta na virada do dia/logout, preservando operações/anexos pendentes protegidos até sincronização ou tratamento explícito. A redação geral de SEG-09 e de trechos anteriores da arquitetura não autoriza apagar fatos pendentes. A retenção, custódia de chave, recuperação após logout e limite de autorização offline ainda dependem de decisão; os testes correspondentes ficam bloqueados nesses detalhes, sem prazo inventado. Outra conta não pode ler nem enviar a fila do funcionário anterior com suas credenciais.

Só visitantes da portaria e conclusões de chamados de limpeza têm o offline previsto. Reservas/vistorias, encomendas, pagamento, voto, julgamento e gestão não ganham fila offline. Testes de rede no navegador/protótipo não substituem build nativa com banco, anexos e criptografia reais.

### 3.4 Desempenho, acessibilidade e operação

| Área | Meta existente e forma de verificar |
| --- | --- |
| API — RNF-01 | 95% das requisições abaixo de 500 ms; registrar cenário, concorrência, amostra, erros e percentil, com RLS ativa |
| App — RNF-02 e 04 | Tela utilizável até 3 s em 4G/aparelho de 3 GB de RAM; download abaixo de 30 MB. Registrar build, instalação/início, rede e tamanho do artefato entregue; método concreto de medição deve ser documentado |
| Tempo real/carga — RNF-05, 10 e 17 | Visitante visível até 5 s; cenário de 5.000 unidades e 10 portarias simultâneas antes do lançamento e a cada versão principal. Cobrir também 100 condomínios/15.000 usuários, reconexões, rajadas e consultas concorrentes sem cruzar dados |
| Acessibilidade — RNF-12 | WCAG 2.2 AA nos dois temas, texto 4,5:1 e ícones/componentes 3:1, toque 48 × 48 dp e 56 dp na portaria, fonte até 200%, TalkBack/VoiceOver; teclado, foco e tabelas/gráficos acessíveis na web. Combinar automação e teste manual |
| Simplicidade — RNF-15 | Até 3 toques nas tarefas comuns, entrada na portaria até 2 sem diálogo; contar conforme DS 2 e verificar Desfazer de 10 s |
| Disponibilidade — RNF-09 | Meta de 99,5% ao mês depende de monitoramento operacional; teste de staging não comprova disponibilidade mensal |
| Backup — RNF-13 | Backup diário, retenção de 7 dias e restauração mensal em ambiente isolado; conferir integridade, vínculos, isolamento e reaplicação de exclusões/anonimizações posteriores ao backup. Registrar resultado; RPO/RTO seguem pendentes |
| Custos — RNF-18 | Validar limite de gasto e alertas de 80%/100% do orçamento por serviço pago, com simulação/configuração verificável, sem gerar despesa para provocar o alerta |

Medir concorrência de exportações, memória, paginação e falha/retomada do worker; volume, concorrência e prazo de geração ainda não têm valores aceitos. Separar testes de carga do ambiente compartilhado com homologação e respeitar limites dos planos gratuitos. A PoC de 10.000 operações na fila em aparelho de 3 GB vem do ADR-003 proposto e não é nova meta aceita do produto.

## 4. Casos de testes críticos

Os IDs `CT-*` são identificadores locais deste plano, sem criar RF ou RN. Cada execução deve registrar pré-condições concretas, entradas, passos, resultado esperado, resultado obtido e evidência. Casos bloqueados por decisão pendente não podem ser marcados como aprovados.

### 4.1 CT-RE-01 — Conflito de reserva sob concorrência (P0)

**Base:** RN-RE-02 a 07 e 13; RF-RE-01 a 03; US-RE-01 a 03 e 06; fluxos 5.1 e 5.3; MER/DER 5.  
**Níveis:** unidade, integração transacional e E2E com dois clientes.

**Pré-condições:** área de A, horário futuro livre dentro da antecedência, duas unidades autorizadas sem bloqueios e limite disponível. Repetir com área gratuita e paga.

1. Abrir o mesmo intervalo nos dois clientes antes de qualquer pedido.
2. Disparar pedidos concorrentes com chaves de idempotência distintas, sincronizando as chamadas no teste de integração para atingir a gravação simultaneamente.
3. Consultar os dois resultados, o calendário e os registros persistidos.
4. Reenviar o pedido vencedor com a mesma chave e carga, inclusive simulando timeout após gravação.

**Esperado:** apenas uma reserva ocupa o intervalo; gratuita fica Confirmada e paga Aguardando pagamento. O segundo pedido recebe conflito/ocupado sem nome ou unidade do vencedor; reenvio não cria outra reserva nem cobrança. O banco e a API preservam a invariante sob concorrência, sem depender de calendário atualizado.

| Variação | Resultado esperado |
| --- | --- |
| Sobreposição parcial, total ou um intervalo contido no outro | Continua existindo no máximo uma ocupação incompatível na mesma área |
| Mesma hora em outra área ou outro condomínio | Sem falso conflito entre recursos independentes |
| Cancelamento ou expiração da reserva paga | Libera ocupação na mesma operação consistente; novo pedido pode ocupar o horário |
| Cumprida antes do fim previsto | Intervalo original continua ocupado até o fim |
| Webhook de pagamento após expiração/cancelamento e nova reserva no horário | Registra recebimento e pendência assistida; não reativa a anterior, recupera horário ou reembolsa automaticamente |
| Falha na transação | Sem reserva parcial, cobrança local duplicada ou evento confirmado sem estado correspondente |

O mecanismo físico de exclusão de intervalos é proposta da arquitetura/MER. Fronteiras exatas de intervalos adjacentes e simultaneidade no instante de expiração devem seguir o contrato/modelo físico validado; não deduzir precisão ou tolerância novas neste plano.

### 4.2 CT-PG-01 — QR Code Pix expirado (P0)

**Base:** RF-PG-01/02/04, RF-FI-07 a 09; RN-RE-03 e RN-FI-08/13; US-RE-03 e US-FI-03; frontend 4.3; backend 5.5(a); ADR-002.  
**Níveis:** unidade, contrato de adaptador, sandbox e E2E.

**Pré-condições:** cobrança ainda em aberto e QR com validade informada pelo provedor; relógio controlável no dublê e expiração observável no sandbox. Preparar uma cobrança condominial e uma reserva paga.

1. Abrir o pagamento com QR válido; manter a tela até passar a validade e testar também abrir um QR já expirado.
2. Voltar do aplicativo bancário ou retomar o CondomiFacil após expiração.
3. Reconsultar a cobrança e simular resposta do provedor sem pagamento, timeout e pagamento confirmado.
4. Testar evento duplicado e confirmação perdida; conferir reserva/cobrança, comprovante e lançamento financeiro.

**Esperado:** QR vencido exige nova consulta; retorno do banco, clique, imagem ou contador não confirmam pagamento. A interface não apresenta confirmação sem estado confirmado pela API. Timeout mantém situação reconciliável e não gera cobrança duplicada. Confirmação válida produz uma única baixa e os efeitos correspondentes.

| Situação | Verificação |
| --- | --- |
| QR expirou e reserva ainda está dentro do prazo | Expiração do QR não equivale à expiração da reserva; tentativa segue apenas meios e prazo autorizados |
| Prazo da reserva venceu | Expira/libera conforme RN-RE-03; confirmação posterior segue pendência assistida, sem reativação |
| Cobrança condominial vencida e segunda via solicitada | Servidor recalcula multa/juros do dia; não reutiliza valor antigo como valor atualizado |
| Pagamento chega por webhook e consulta ao mesmo tempo | Efeito financeiro único; evento atrasado não regride o estado |
| Provedor indisponível | Mensagem e nova tentativa sem sucesso falso; não expõe segredo ou dado de cartão |

**Dependência:** validade real do QR, natureza estática/dinâmica e operações de renovação/consulta serão verificadas na PoC do Asaas. Renovação automática por job é proposta técnica do backend 5.5(a); não exigir sua execução, frequência ou prazo como regra aceita. A expiração do QR e o prazo de pagamento da reserva são relógios distintos.

### 4.3 CT-IS-01 — Isolamento entre condomínios e contextos (P0)

**Base:** RNF-11, SEG-05/07/13/17/18; matriz de permissões do PRD; arquitetura 4.11; MER/DER 6; frontend 4.2; painel web 3.2.  
**Níveis:** catálogo do banco, integração RLS, API, WebSocket, jobs, arquivos e E2E.

**Pré-condições:** massa A/B da seção 2.3; IDs conhecidos de B para tentativas de A; papel real de execução da aplicação, não o dono/superusuário usado para migrar.

1. Autenticar usuário só de A e tentar ler/criar/alterar/excluir recursos de B por ID, filtros, corpo e cabeçalho de contexto.
2. Repetir no PostgreSQL com RLS ativa para leitura e escrita; testar ausência de contexto e reutilização da mesma conexão após outra requisição/erro/rollback.
3. Tentar sala WebSocket, chave/URL de arquivo, job e download de exportação de B.
4. Trocar A → B com usuário de vínculo duplo durante consulta lenta; entregar resposta atrasada de A e voltar por link/notificação antiga.
5. Revogar vínculo/função durante tela aberta, processamento do relatório e tentativa de download; repetir em aparelho compartilhado após logout.

**Esperado:** nenhuma leitura, escrita, evento, arquivo ou dado em cache cruza o contexto autorizado. ID de outro condomínio não confirma sua existência; o contrato proposto usa resposta indistinguível de recurso inexistente (404). Vínculo duplo não concede visão mesclada; resposta atrasada não preenche a tela atual. Autorizações são revalidadas no servidor e fila do usuário anterior não é acessível à conta seguinte.

**Verificações técnicas propostas da arquitetura 4.11:** catálogo completo de tabelas de tenant, RLS habilitada/forçada e política presente; inventário explícito de exceções globais; papel sem superusuário, propriedade das tabelas ou `BYPASSRLS`; `WITH CHECK` para escrita; contexto ausente bloqueia acesso; jobs/fan-out e conexões não herdam outro tenant. Repetir sempre que tabela/política/interface for adicionada. A forma física final depende de revisão dos ADRs, sem reduzir o resultado exigido por RNF-11.

Dentro do mesmo condomínio, repetir por unidade, blocos da portaria e função. Suporte não lê reclamações/score; novo relatório não amplia acesso de síndico, conselho, suporte ou plataforma. Considerar RN-VO-13 e permissões específicas existentes: não copiar como regra geral a simplificação antiga de que conselho só lê finanças, pois há responsabilidades eleitorais e de julgamento previstas nas RN.

### 4.4 Demais casos prioritários

| Caso/prioridade | Preparação/ação | Resultado esperado e base |
| --- | --- | --- |
| CT-AC-01/P1 — acesso e sessão | Código antes/depois de 15 min, quinta senha errada, recuperar conta, sessão expirada e vínculo removido | Limites de SEG-04, erro sem revelar cadastro; retorno só a destino autorizado e sem repetir ação sensível (US-AC-01/04; UF 3/15) |
| CT-OF-01/P0 — portaria offline | Entrada/saída, queda após envio, reenvio, cancelamento remoto durante queda e reconexão | Fato único, pendência visível; divergência exige confirmação por interfone sem fechar antes, sem avisar síndico; lista dos blocos atendidos e última sincronização (RN-OF-01 a 06; US-VI-03/04; UF 6.2/6.3) |
| CT-OF-02/P0 — cache e fila | Logout, virada do dia, reinício, nova conta e fila com anexos | Cache apagado; fila protegida preservada sem acesso cruzado, sem descarte silencioso; retenção/recuperação pendentes (RN-OF-06; frontend 5.2) |
| CT-CH-01/P0 — conclusões concorrentes | Mesmo ciclo: conclusão de horário anterior chega depois, inclusive após avaliação da primeira recebida; reenviar operação | Menor horário do celular prevalece, ambas no histórico, sem nova conclusão por reenvio; nota superada fora das médias/sem transferência, nova janela desde correção e sem reiniciar reabertura de 48h (RN-CH-04/07/15/17; US-CH-02/04) |
| CT-RE-02/P1 — vistoria e faltas | Usada/não usada, antes/depois do fim, gratuita/paga, sem internet e conclusão antecipada | RN-RE-09/10/13: falta paga sem pontos/reembolso; intervalo não liberado antes do fim; sem fila offline; limpeza não marca início (US-RE-06; UF 5.3) |
| CT-RE-03/P1 — limites e cancelamento | Score 60/61, limite mensal, atraso ligado/desligado, cancelar em torno de 12h, lembrete em torno de 09:00 e confirmação após envio | Bloqueios por pessoa/unidade corretos, canceladas fora da contagem, regras de reembolso e único push com antecipação às 21:00 quando aplicável (RN-RE-06 a 08/11/14; RN-CA; US-RE-02/04/05) |
| CT-PG-02/P0 — dinheiro e eventos | Webhook inválido, duplicado, fora de ordem, conta desconhecida, reembolso falha, conciliação e baixa manual concorrentes | Validar token/correlação no servidor; não confiar em condomínio do corpo; dinheiro real preservado, sem baixa/receita/reembolso duplicados; falha não vira sucesso (SEG-12/17; US-RE-03/04; US-FI-03/04; eventos e webhooks 5 a 7) |
| CT-CD-01/P1 — vínculos/locação | Trocar ocupante, pessoa com duas unidades, fim do contrato e alteração de mandato/substituição | Morador habilitado e responsável vigentes; score inicia em 100 por novo vínculo sem herança/cruzamento; dívidas anteriores não transferidas silenciosamente; permissões revogadas (RN-CD; RN-SC; US-AC-05; US-AD-03/07/10/11) |
| CT-RC-01/P0 — reclamação e score | Alvo síndico, autor/alvo/julgador distintos, prazo, recurso, novos vínculos e consulta do suporte | Julgador autorizado sem conflito, defesa/recurso conforme RN, auditoria, identidade protegida e score restrito; não aplicar ao vínculo errado (RN-RC; RN-SC; SEG-07/08; US-RS-01 a 08) |
| CT-VO-01/P0 — voto e eleição | Duas tentativas online/presencial, procurador, proprietário substitui inquilino em pauta permitida, atraso, encerramento e condutor substituto | Um voto vigente por unidade conforme regra, conteúdo secreto separado da participação, resultado só após encerramento, empate/inconclusivo sem vencedor automático; permissão temporária restrita (RN-VO; SEG-06; US-VO-02/03). Concessão técnica pendente não se presume aprovada |
| CT-FI-01/P0 — finanças | Pagamento duplicado, lançamento avulso, fechamento, edição/exclusão posterior e estorno | Receita automática agregada sem unidade/responsável, sem dupla soma; mês fechado imutável, estorno e comentários auditados; folha só total (RN-FI-23 a 30; SEG-18; US-FI-07 a 10) |
| CT-RL-01/P0 — relatórios privados | Nove tipos, filtros, várias páginas, formatos permitidos, operador diferente da mesma administradora e revogação durante geração/download | Só solicitante autorizado no condomínio; conjunto completo permitido, referência e totais coerentes, formatos com mesmo recorte, sem dado oculto/pessoal indevido, voto ou score individual; sem arquivo parcial (RN-RL-01 a 08; RF-RL-01 a 11; US-RL-01 a 03; UF 18) |
| CT-RL-02/P1 — arquivos exportados | Link expirado com arquivo válido, arquivo expirado, falha/repetição, CSV/XLSX com acentos e zeros iniciais; conteúdo iniciado por fórmula | Renovar acesso apenas se autorizado/arquivo válido; arquivo expirado exige gerar de novo; tipos/extensões corretos; verificar que conteúdo de usuário não execute fórmulas ao abrir planilha (RN-RL-04 a 08; painel 5/7). Validades e mitigação técnica serão validadas no desenho |
| CT-PE-01/P1 — anonimato de avaliações | Abaixo/no/acima de 2 funcionários e 3 avaliações; usuário desligado e avaliação superada | Limites existentes aplicados na API/DTO e UI, sem reidentificação por campos proibidos; avaliação de atendimento não altera score nem pesquisa (RN-PE; RN-CH-19 a 21; US-PE-01/02; US-CH-05) |
| CT-EN-01/P1 — encomendas | Entrega esperada vinculada, registro/retirada repetidos, cancelamento e aviso de comida | Sem duplicação, vínculos/estados e visões corretos; comida por app só aviso, sem registro de encomenda; mutações exigem rede (RN-EN; US-EN-01 a 04; UF 7) |
| CT-NO-01/P1 — push, links e anexos | Primeiro plano/fundo/encerrado, negar permissão, link para unidade antiga, upload interrompido e URL expirada | Sem conteúdo sensível na tela bloqueada; destino revalidado, ação não executada automaticamente; foto opcional não bloqueia; anexos privados sem duplicação (RF-NO-01; SEG-01/02/07; frontend 6/7) |
| CT-LG-01/P0 — exclusão e restauração | Solicitar acesso/exclusão, anonimizar visitante após 6 meses, restaurar backup anterior | Exportação pessoal autorizada; retenção conforme finalidade/regra e reaplicação de exclusões/anonimizações, sem restaurar acesso revogado (SEG-10/11; RNF-13; US-LG-01; MER/DER 6.2) |

## 5. Dispositivos, sistemas e navegadores suportados

### 5.1 Política existente

A fonte de suporte é **RNF-03**, sem criar versões mínimas diferentes neste plano:

| Plataforma | Suporte previsto no PRD | Cobertura de testes proposta |
| --- | --- | --- |
| Android | Android 9 ou superior | Versão mínima 9 em aparelho de entrada, versões intermediárias presentes no piloto e versão principal atual na data de homologação |
| iOS | Duas últimas versões principais | As duas versões principais vigentes na data da homologação, com aparelho compatível em cada uma |
| Web | Chrome, Safari e Edge atuais | Versão estável atual de cada navegador na data da homologação; registrar sistema operacional, versão completa e tamanho de janela |

“Atual” e “duas últimas” são janelas móveis, não números congelados em 14/11/2026. Antes de cada candidato, preencher inventário com números concretos, data, versão do app/build, modelo e resultado. Não se declara compatibilidade executada enquanto esse inventário não existir. Versões mínimas de Windows/macOS, versões antigas de navegador e modelos específicos de aparelho não estão definidos nas fontes.

Se a versão futura do Expo ou uma biblioteca impedir Android 9 ou qualquer plataforma prevista, registrar incompatibilidade e levar a decisão a Pedro antes de reduzir suporte. Política de atualização obrigatória/versão mínima do **cliente** é pendência distinta de RNF-03.

### 5.2 Matriz de execução por características

| Dispositivo/configuração | Verificações prioritárias |
| --- | --- |
| Android de entrada, 3 GB de RAM, tela pequena, Android 9 | Abertura 4G, memória/armazenamento, listas, tamanho do app, toque, teclado e fila offline; referência RNF-02 |
| Android de fabricante/versão diferente dos anteriores | Suspensão do app, economia de bateria, reconexão, arquivos, push, permissões e retomada |
| iPhone de tela pequena compatível com a janela de iOS | Layout, fonte 200%, teclado, áreas seguras, VoiceOver, permissões e links |
| iPhone com a outra versão principal suportada | Regressão de navegação, push em build própria, arquivos, retorno do banco e sincronização |
| Computador com Chrome e Edge atuais; Mac com Safari atual | Painel administrativo, teclado/foco/leitor de tela aplicável, tabelas, filtros e download dos cinco formatos conforme catálogo |
| Telas maiores/tablets usados na validação | Layout e operação adaptados ao tamanho. Certificação de modelos/tablets, orientações e eventual suporte específico não foram definidos; selecionar com Pedro antes do piloto se fizerem parte da operação |
| Aparelho compartilhado de portaria/limpeza | Troca de turno/conta/contexto, bloqueio de sessão, fila anterior protegida e dados do dia; testar nos modelos reais selecionados para o piloto |

Em cada plataforma: temas claro/escuro, fonte padrão/ampliada até 200%, rede boa/4G lenta/instável/sem rede e retorno. Em aparelhos físicos, testar permissões nativas, TalkBack/VoiceOver, criptografia, notificações, background e reinício. Emuladores/simuladores ajudam na cobertura, mas não substituem essas evidências no binário distribuível; Expo Go e o HTML não comprovam compatibilidade nativa.

## 6. Critérios de execução, saída e evidências

### 6.1 Entrada e saída propostas

**Entrada:** requisito/critério aplicável identificado, comportamento esperado definido, contrato e dados necessários disponíveis, ambiente/build identificados e dependências autorizadas. Um caso pode ser desenhado antes disso, mas permanece Não executado ou Bloqueado.

**Saída de um candidato a versão, proposta para validação:**

- Todos os P0 e P1 aplicáveis executados/aprovados; nenhum defeito aberto de vazamento, perda de fatos, corrupção financeira, voto inválido ou fluxo essencial bloqueado.
- Suíte de isolamento aprovada e offline automatizado executado a cada versão (RNF-16); carga na cadência de RNF-17 e restauração na cadência mensal de RNF-13.
- Matriz de plataformas preenchida, acessibilidade e metas mensuráveis verificadas no ambiente adequado; nenhuma meta declarada atendida com base apenas no protótipo ou no Render gratuito adormecido.
- Critérios de aceite implementados rastreados, falhas restantes descritas e avaliadas por Pedro; aprovação técnica de testes não substitui homologação de produto, parecer jurídico ou revisão da nuvem.

Pendências que impeçam resultado esperado ou sua comprovação bloqueiam o fluxo dependente; não são “aprovado com ressalva” automaticamente. Este plano não autoriza iniciar implementação/piloto fora dos marcos do projeto.

### 6.2 Registro e rastreabilidade

| Campo do registro | Conteúdo |
| --- | --- |
| Identificação | CT, RN/RF/US e critério de aceite exato; fluxo/tela/contrato correspondente |
| Execução | Data, responsável, build/revisão, ambiente, modelo/SO/navegador, tema e rede |
| Reprodução | Massa/fixtures, configuração, pré-condições, passos e relógio/fuso usados |
| Resultado | Esperado × obtido; Aprovado, Falhou, Bloqueado, Não executado ou Não aplicável com justificativa |
| Evidência | Logs sanitizados, resposta/campos ausentes, estado persistido, captura/gravação e métricas aplicáveis |
| Defeito e reteste | Severidade, efeito, causa/correção quando conhecida e resultado da regressão |

Evidências ficam em acesso restrito e sem segredos, cartão, identidade de reclamante ou conteúdo individual do voto. Retenção e ferramenta de gestão dessas evidências serão definidas; não adicionar prazo arbitrário.

A tabela de cobertura RF → US das histórias é o ponto de partida, não prova de teste executado. Na implementação, expandir cada critério de aceite em casos positivos, negativos, fronteiras e concorrência aplicável. Manter ligação RN → RF → US → CT → execução/defeito. Os casos da seção 4 são o núcleo crítico e não esgotam os critérios das histórias.

## 7. Pendências que afetam a homologação

| Pendência existente ou operacional | Efeito no teste e encaminhamento |
| --- | --- |
| Parecer jurídico SEG-16 e regras de locação/reclamações | Testar regras escritas como base atual, sem tratar como validação jurídica; lançamento depende do parecer aprovado |
| PoC do Asaas/ADR-002 | Confirmar QR, Pix/boleto, KYC, chargeback e erros reais antes de fechar testes dependentes; não substituir prazo observado por suposição |
| ADR-003/007/014 e contrato de sync | Criptografia, fila após logout, autorização offline, compensação Desfazer, cursores, relógio incorreto e empate exato precisam de decisão; preservar RN-CH-04 e RN-OF-06 |
| Autogestão e condução eleitoral | Distribuição fina, concessão/validade/revogação de poderes temporários e validação independente seguem no registro [06](../01-produto/06-autogestao-e-conducao-eleitoral.md); não conceder acesso por analogia |
| Relatórios RN-RL-08 | Definir retenção/link, período/volume/concorrência, referência temporal e pequenos grupos; casos correspondentes bloqueados até desenho validado |
| ADR-004/infra e ADR-013 | Rever nuvem antes do piloto, formalizar medição de disponibilidade, restauração e RPO/RTO; gratuito de desenvolvimento não comprova operação com dados reais |
| Versões do cliente e inventário físico | Definir política do cliente e escolher modelos efetivos do piloto sem alterar RNF-03 implicitamente |
| Execução do plano | Validar proposta de critérios de saída, responsáveis, ferramentas e armazenamento de evidências com Pedro quando a implementação for preparada |

Nenhuma regra de produto, documento fonte, contrato ou tela foi alterado por este plano. Mudanças futuras no comportamento esperado exigem decisão e atualização da rastreabilidade do projeto no escopo autorizado.
