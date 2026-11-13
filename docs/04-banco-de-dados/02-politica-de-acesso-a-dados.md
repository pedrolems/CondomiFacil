# Política de acesso a dados do CondomiFacil

**Estado:** Proposta para validação por Pedro Lemos.

**Data:** 12/11/2026.

**Natureza:** política documental baseada no MER/DER lógico; não contém SQL executável, migrações nem concessões de acesso implementadas.

## 1. Objetivo, limites e fontes

Documentar quem pode **ler/consultar, criar, atualizar e apagar** os dados do MVP, em qual contexto e por qual ação. As permissões são de negócio: não representam acesso direto dos aplicativos às tabelas. O backend autoriza a ação e grava somente os efeitos previstos. Uma entidade estar no inventário não significa que alguém receba CRUD completo sobre ela.

Esta proposta consolida fontes existentes, sem alterar regras, aceitar ADRs ou resolver pendências por inferência. As decisões de Pedro para este documento são: coluna única **Ler/consultar**, inclusão de **Atualizar** e política sem SQL executável. Isso não amplia as permissões de nenhum perfil.

| Referência | Fonte e uso |
| --- | --- |
| MER | [MER/DER](01-mer-e-der.md), especialmente §2 (escopos e vigência), §4.1 a §4.12 (dicionário), §5 (integridade), §6 (acesso e privacidade), §9 (pendências) e §10 (modelo físico). Inventário principal de entidades |
| PRD | [PRD §3](../01-produto/02-prd.md#3-perfis-de-usuário-e-permissões), §4 (RF), §8 (SEG) e §10 (stack). Perfis, matriz de permissões e requisitos |
| RN | [Regras de Negócio](../01-produto/03-regras-de-negocio.md), por seção e ID citados nas matrizes. Fonte das ações, limites, estados e exceções |
| Arq. | [Arquitetura §4](../03-arquitetura/01-arquitetura.md#4-estratégia-multi-tenant) e §3. Propostas de isolamento e componentes; nomes ilustrativos de tabelas não substituem o MER |
| ADRs | [ADR-001](../03-arquitetura/adr/001-multi-tenant-rls.md) e [ADR-007](../03-arquitetura/adr/007-autorizacao-jwt-sem-papeis.md): mecanismos propostos de RLS e autorização. [Índice e estados dos ADRs](../03-arquitetura/adr/README.md) |
| Backend | [Backend §4 a §6](../05-backend/01-backend.md) e [contrato da API](../05-backend/api/README.md): propostas de execução das ações, rotinas e integrações; não criam permissões de produto |

As RN e o PRD fundamentam a permissão; o MER traduz sua organização lógica. Quando a fonte não especifica uma operação ou houver divergência que exija decisão, este documento registra a lacuna e não concede o acesso. O contrato da API permanece proposta: a existência de uma rota ou método HTTP não basta para conceder CRUD em uma entidade.

**Classificação:**

- **Regra:** comportamento já previsto nas RN, no PRD ou em decisão expressa de Pedro citada no MER.
- **Proposta técnica:** mecanismo para cumprir uma regra, ainda sujeito à validação; inclui organização em entidades auxiliares e atores técnicos das matrizes.
- **Pendente:** depende de decisão de Pedro, engenharia, segurança ou jurídico.
- **NC — não concedido por este documento:** não há autorização suficientemente especificada para a operação. Não significa apagar a funcionalidade de uma fonte nem resolver uma pendência como proibição definitiva; a implementação precisa de definição antes de conceder acesso.

Ficam fora: acordos de parcelamento e relatórios gerais da V2, contabilidade oficial, login de empresa de manutenção, integração com catracas/interfones e o perfil Manutenção ainda não definido no PRD. Exportações financeiras do MVP continuam incluídas (MER §1 e §8).

## 2. Operações e sujeitos

### 2.1 Como ler as matrizes

| Coluna ou termo | Significado |
| --- | --- |
| Ler/consultar | Detalhe, listagem e busca da projeção autorizada. Não inclui automaticamente exportar, consultar fontes restritas ou navegar por FKs |
| Criar | Solicitar a ação de negócio que origina o registro. B grava e valida os efeitos; o solicitante não escolhe livremente autor, tenant, saldo, responsável ou estado |
| Atualizar | Somente ação/campos descritos e transições permitidas. Nunca UPDATE irrestrito da linha, troca arbitrária de FKs ou reescrita de autoria/histórico |
| Apagar | Exclusão física, quando expressamente prevista. Cancelar, encerrar, revogar, estornar, marcar como lida ou anonimizar não significam apagar |
| Preservar | Sem exclusão operacional concedida; eventual anonimização/expurgo segue §7, sem retenção eterna presumida |
| B | Backend: serviço do domínio que executa a ação autorizada. Não é perfil humano nem acesso irrestrito de operador |
| R | Rotina automática específica, com contexto e finalidade delimitados. B/worker executa e registra seus efeitos |
| I | Integração autenticada e correlacionada. B recebe/processa; o provedor não recebe CRUD no banco |
| A | Administradora autorizada no condomínio, conforme vínculo de usuário e contrato de administração vigentes |
| S | Suporte autorizado, apenas em Gestão + Suporte vigente, com atribuição global e autorização local válidas e cada acesso registrado |
| G | Síndico morador ou profissional em função vigente; subsíndico em substituição, exceto ativar/desativar a própria substituição |
| M | Morador vinculado à unidade ativa: proprietário residente, inquilino ou dependente, conforme a ação. Ser habilitado não é requisito universal para toda ação de M |
| P | Proprietário não residente vinculado à unidade, com as restrições próprias |
| J | Julgador elegível e atribuído ao caso, segundo RN-RC-03, RN-RC-07, RN-RC-11 e RN-RC-14; não é um novo perfil |
| Titular | Pessoa dona do dado no escopo especificado. Não autoriza consultar dados de terceiros relacionados |

**Atualização de 13/11/2026:** nas matrizes de cadastro, configuração, cobranças/pagamentos e finanças, a proposta de execução local da autogestão estende as ações administrativas A/S ao síndico vigente ou sub em substituição válida quando Essencial sem administradora (RN-PL-08/RN-FI-29), revalidando contexto e finalidade. Não estende por equivalência a reclamações, score, governo da própria autoridade ou poderes do conselho. Mandatos, concessão inicial e divisão fina de tarefas dependem revisão; contratos específicos estão em `/v1/sindico/gestao/`. Na projeção fiscal, conselho e síndico continuam sem ligação individual; somente finalidade administrativa explícita permite ao executor local consultar a origem restrita.

Quando a célula indica A/S, S tem apenas a equivalência autorizada no PRD: nunca reclamações, julgamentos, recursos ou scores. Uma referência a B, R ou I descreve processamento técnico proposto dos efeitos da regra, não uma permissão de edição manual por suporte, admin ou equipe de engenharia.

Toda célula é limitada pelas condições da seção 3 e pelas proteções da seção 6. Campos secretos não são devolvidos só porque a leitura de outros campos foi autorizada. Uma célula NC não é substituída por uma permissão geral de “administrar”.

### 2.2 Os 11 perfis e suas condições

| Perfil do PRD | Contexto e alcance; não há concessão geral de CRUD |
| --- | --- |
| Morador | M, na unidade ativa e vínculo vigente; proprietário, inquilino e dependente não têm as mesmas condições para voto e responsabilidade financeira. Um único habilitado por unidade ocupada; os demais moradores não são excluídos das ações que lhes cabem |
| Síndico (morador) | Funções M mais G pelo mandato; o score público usa a unidade de referência do mandato. A função de gestão não expõe a rotina de outras unidades fora das ações previstas |
| Síndico profissional | G sem funções de M nem unidade fictícia; pode abrir chamados, mas não avaliar atendimento ou pesquisa como morador |
| Subsíndico | Mantém M; fora da substituição, acompanha manutenção, sugere comunicados, registra votos presenciais, lê encomendas vencidas e julga os casos atribuídos. Na substituição torna-se G, sem poder ativar/desativar a substituição |
| Funcionário de limpeza | Vínculo funcional/setor vigentes; atende chamados de limpeza, conclui inclusive offline, faz vistoria online e vê suas avaliações nas projeções permitidas; não controla o início de uso de reserva |
| Funcionário de portaria | Lotação vigente em portaria do condomínio; visitantes dos blocos atendidos e período permitido, encomendas/entregas conforme módulo, chamados e reservas do dia. Offline apenas no escopo previsto |
| Administradora | A, por usuário da organização e contrato vigente em cada condomínio; não recebe acesso a outros tenants nem a voto individual |
| Suporte da plataforma | S; equivalência limitada a A fora de reclamações/scores. Troca para Essencial retira o acesso conforme RN-PL-06. Conta de suporte não recebe poderes por conhecer um UUID |
| Admin da plataforma | Condomínios, planos, acessos de suporte e padrões de plataforma conforme fontes; não é superusuário operacional. Leitura da quarentena é exceção explícita, não acesso a pagamentos/reclamações de tenants |
| Conselho fiscal | Leitura, comentários e exportação financeira sem origem individual; J somente nos casos previstos. M por seu vínculo de moradia, sem ampliar direitos financeiros pessoais |
| Proprietário não residente | P: situação da unidade e suas cobranças, datas da locação, comunicados gerais, voto/procuração e projeção de reclamações validadas/multas; pedidos de locação. Nunca rotina ou score do inquilino. Hóspede de temporada só na exceção RN-VI-10 |

Fonte: PRD §3; RN-CD-04 a RN-CD-05, RN-CD-11 a RN-CD-28; RN-SC-02; RN-FI-03 e RN-FI-10. Mandatos encerrados, emprego desligado e procurações/contratos encerrados não concedem acesso atual por aparecerem no histórico.

## 3. Modelo de autorização e RLS

### 3.1 Resultados obrigatórios e mecanismos propostos

**Regra:** isolamento entre condomínios com RLS no PostgreSQL (SEG-05, RNF-11); restrições por unidade, função, titularidade e sigilo continuam obrigatórias (SEG-06, SEG-07, SEG-17 e SEG-18). Uma política só de tenant não cumpre a matriz de produto.

**Proposta técnica — ADR-001/007, ainda Propostos:**

1. A API autentica sessão e usuário, valida os vínculos com condomínio/unidade declarados e resolve a função vigente no servidor. O cliente não pode definir a própria autorização em cabeçalhos, token, corpo ou campo de formulário.
2. `TenantContext` abre uma transação e define contexto local: `app.condominio_id`, `app.usuario_id`, `app.unidade_id` quando aplicável e `app.papel` efetivo. Não se inventa unidade para profissional, funcionário ou job sem unidade. O tratamento físico de contexto sem unidade precisa preservar as ações legítimas desses sujeitos.
3. `app_user` não é dono de tabelas, superusuário ou portador de `BYPASSRLS`. Tabelas de tenant usam RLS habilitada e forçada. O contexto é transacional, não de sessão do pool; ausência de contexto necessário falha fechada.
4. A barreira de tenant é combinada com vínculo vigente, ação, titularidade, unidade, função, atribuição de julgamento, portaria/blocos e estado/prazo, quando aplicáveis. Não se implementam políticas permissivas independentes cuja união lógica permita “mesmo tenant OU mesmo papel”.
5. Toda entidade C tem `condominio_id` obrigatório; FKs C→C incluem tenant, conforme MER §2.1. FKs para identidade global exigem validação de vínculo: existir `usuario.id` não autoriza usar essa identidade no condomínio.
6. B usa o mesmo caminho contextual na API, sincronização e jobs. Migração roda com outro papel, fora do caminho de usuário. Exceções de fronteira são pequenas, revisadas e testadas; não criam um papel operacional com bypass geral.

O papel de banco não é sinônimo de perfil de produto. A forma de distribuir credenciais, privilégios e funções entre API, suporte, jobs e integrações é desenho físico a validar. Deve permitir negar inclusive a consulta da identidade/score ao suporte, sem depender apenas de esconder telas.

### 3.2 USING e WITH CHECK, em termos conceituais

- **USING:** quais linhas existentes a operação pode alcançar. Consultar uma cobrança exige alcançar a projeção daquele responsável/proprietário/gestor autorizado; estar no mesmo condomínio não basta.
- **WITH CHECK:** se a linha nova ou resultante permanece dentro do escopo autorizado. Criar ou atualizar não permite trocar tenant, autor, unidade, titular ou referência para atravessar a fronteira.
- **Atualizar:** avaliar tanto a linha acessível antes da alteração quanto o resultado permitido. Além de RLS, validar campos editáveis, transição, prazo e integridade no serviço e por mecanismos físicos adequados. Um morador não confirma pagamento editando o estado de uma cobrança.
- **Apagar:** alcançar uma linha não autoriza excluí-la; a operação exige regra explícita. Não há um WITH CHECK que transforme uma exclusão indevida em legítima.

RLS controla linhas; não substitui privilégios por operação/coluna, projeções/DTOs, regras de negócio e integridade. Não resolve, sozinha, anonimato, metadados, correlação de horários, agregação ou vazamento por arquivos. Fonte: MER §5 e §6.1; arq. §4.3; ADR-001/007.

### 3.3 Globais e travessias da fronteira

- G e C no MER significam **global** e **de condomínio**, não público e privado. As tabelas globais não são automaticamente legíveis pelo admin nem por todos os usuários.
- `usuario`, sessões, dispositivos e pedidos LGPD exigem caminhos limitados por titular/finalidade. Hash de senha, segredo de renovação, código e token push não integram as projeções comuns.
- `documento`, `documento_versao`, `aceite` e `arquivo` podem herdar escopo de documento/titular. `condominio_id` nulo nunca significa acesso a todos os tenants.
- A lista de entidades globais é explícita no inventário da seção 5. O admin atua apenas nas ações de plataforma documentadas; seus poderes não se propagam às relações C.
- Administradora multitenant valida seus contratos por condomínio. Painel agregado exige leitura separada por contexto ou exceção revisada que valide cada condomínio; não autoriza junções irrestritas de tenants.
- `evento_gateway_quarentena` é global e lido só por B e Admin da plataforma, conforme decisão de Pedro no MER P-13. Sua referência de correlação não abre acesso ao `evento_gateway` do tenant.

## 4. Solicitantes humanos e processos que gravam

| Origem da ação | Quem decide/solicita | Quem grava e limite |
| --- | --- | --- |
| Cadastro ou configuração | A/S; G só nas exceções expressas, como empresa de manutenção | B valida campos, vínculo, vigência e referências; G solicitar cadastro não equivale a executá-lo |
| Reserva e pagamento | M reserva/cancela; pagador inicia tentativa | B cria intenção; I autenticada confirma pagamento; R expira quando cabível. Pagador não grava recebimento ou score |
| Julgamento e recurso | J decide; afetado que perdeu pontos recorre | B registra decisão/recurso e efeitos idempotentes; mudança de saldo não é edição humana de `perfil_score` |
| Rotina automática | Finalidade prevista nas 21 rotinas da RN §14 | R abre um tenant, altera só o domínio necessário e registra execução; não herda todas as funções G/A |
| Webhook | Provedor autenticado; sem sessão de usuário | B valida e correlaciona conta/transação; não confia no condomínio do corpo. Sem correlação, quarentena; com correlação, processamento contextual e idempotente |
| Operação offline | Portaria ou limpeza dentro da ação admitida | Cliente guarda fila; B valida autoria, escopo e divergência ao receber. Recibo técnico não autoriza nova ação de negócio |
| Direito do titular | Titular pede cópia/exclusão | B executa procedimento autorizado, com fontes/cópias/retenção avaliadas. Pedir exclusão não é DELETE livre de tabelas |

**Proposta técnica:** manter autorização na borda e no caso de uso, regras no domínio e persistência contextual por portas/adaptadores, conforme backend §4 (SOLID/GRASP). Eventos/outbox e consumidores idempotentes representam efeitos de domínio (Observer/ADR-006 proposto), não canal alternativo para contornar a autorização.

## 5. Matrizes e inventário explícito das entidades

As 130 entidades do dicionário MER §4 estão nomeadas nas linhas abaixo, organizadas em seus 12 domínios. Nomes e escopos físicos continuam propostas do MER. Cada linha compartilhada aplica suas condições a todas as entidades nela listadas; diferenças constam na própria célula. A coluna Apagar distingue exclusão operacional de anonimização/expurgo da seção 7.

### 5.1 Identidade, acesso e aceites — 10 entidades

Fonte: [MER §4.1](01-mer-e-der.md#41-identidade-acesso-e-aceites); PRD RF-AC-01 a RF-AC-08, RF-LG-01/02 e SEG-03/04/11; RN-CD-01 a RN-CD-07 e RN-CD-18.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `usuario` / global | Titular: projeção própria; A/S: dados necessários ao cadastro autorizado, não catálogo global; demais só identidade projetada pelo módulo | A/S pré-cadastra por B; sem autocadastro | Titular: senha pelos desafios e tema; A/S: cadastro dentro do vínculo autorizado. Alterar identidade global compartilhada sem regra específica: NC; não trocar autoria histórica | Sem DELETE operacional; pedido LGPD pelo titular e procedimento §7 |
| `atribuicao_plataforma` / global | Admin: gestão dos acessos de suporte; outras consultas administrativas não especificadas: NC | Admin concede suporte por B; primeira atribuição de Admin depende da implantação | Admin encerra acesso de suporte; não pode se conceder leitura operacional | Preservar vigência/auditoria; remoção física NC |
| `sessao` / global | B para autenticar; ao titular apenas informações necessárias à própria sessão, sem hash/segredo. Catálogo humano de sessões: NC | B após autenticação | B renova/revoga por login, logout, senha ou exclusão; rotação conforme ADR-007 proposto | NC operacional; expurgo técnico depende de retenção |
| `desafio_acesso`, `controle_login` / globais | B: validação e limite de tentativas; resposta pública uniforme, sem confirmar existência da conta | B por ativação/recuperação/tentativa de login | B incrementa tentativas, invalida/consome código e aplica pausa conforme regra; usuário não edita contadores | NC operacional; retenção/expurgo não definidos |
| `vinculo_condominio` / condomínio | Titular: seus contextos; A/S: cadastro local necessário; demais projeções do domínio, não lista geral de pessoas | A/S por B conforme cadastro | A/S encerra/regulariza vínculo; B executa efeitos e preserva os demais condomínios | Encerrar não apaga; preservação do histórico e §7 |
| `documento`, `documento_versao` / globais com escopo próprio ou herdado | Leitor do documento aplicável ao seu contexto; conteúdos globais não incluem dados de tenant | A/S publica documentos de condomínio por B; autor de publicação global não especificado: NC | Nova versão, não edição de conteúdo publicado; alterações administrativas globais não especificadas: NC | Versão publicada preservada; exclusão operacional NC |
| `aceite` / global com escopo herdado | Titular: seus aceites; B verifica versão e contexto; leitura administrativa além da finalidade definida: NC | Titular aceita por B; regimento separado por condomínio | Imutável; nova versão exige novo aceite | NC operacional; tratamento LGPD conforme finalidade/retenção |
| `pedido_lgpd` / global | Titular: próprio pedido e arquivo exclusivo; B processa. A/S recebe alerta de substituição quando previsto, não acesso geral a todos os pedidos | Titular solicita cópia ou exclusão por B | B registra andamento/conclusão; operador humano do procedimento ainda não especificado | NC operacional; retenção pendente |

### 5.2 Unidades, locação, trabalho e gestão — 19 entidades

Fonte: [MER §4.2](01-mer-e-der.md#42-unidades-locação-trabalho-e-gestão); PRD §3 e RF-AD-01 a RF-AD-21; RN-CD-04 a RN-CD-28; RN-VO-04 a RN-VO-19.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `condominio` / global, raiz | Admin no painel de plataforma; usuário somente contextos autorizados e projeção necessária | Admin cadastra por B | Admin mantém cadastro de plataforma; não edita por isso dados operacionais C | NC; não cascatar tenants |
| `bloco`, `unidade`, `portaria`, `portaria_bloco` / condomínio | A/S administra; M/P lê dados da própria unidade permitidos; portaria lê recorte necessário dos blocos atendidos; G usa projeções de suas tarefas, não cadastro global irrestrito | A/S por B | A/S mantém identificação, ocupação, associações e blocos atendidos, preservando referências/histórico; não alterar tenant | Apagar estrutura com fatos associados: NC; não confundir marcar Desocupada com excluir unidade |
| `vinculo_unidade`, `episodio_moradia`, `habilitacao_unidade` / condomínio | Titular: seus contextos; A/S: cadastro/habilitação; G somente projeções necessárias às funções previstas | A/S por B; novo episódio na nova residência e habilitado coerente | A/S altera vínculo/habilitação com vigência; B encerra dependências e cria episódio novo, sem reescrever episódio anterior | Encerrar, não apagar; exceção transitória sem habilitado bloqueia reserva/visitante |
| `contrato_locacao`, `versao_locacao` / condomínio | A/S; P acompanha datas/contrato da sua unidade; inquilino recebe informações necessárias ao próprio vínculo e avisos, sem consulta a outros contratos | A/S por B; P somente solicita | A/S renova/encerra; B cria versão e aplica efeitos. Não permitir inquilino/fonte divergente ou sobrescrever versão antiga | Preservar versões e fatos; NC operacional |
| `mandato` / condomínio | A/S administra; contexto de função vigente/projeções eleitorais aos usuários elegíveis; não catálogo de dados pessoais irrestrito | A/S registra por B, inclusive contratação profissional | A/S registra fim/renúncia/destituição; B aplica sucessão prevista. Reatribuição pela tabela vigente ao perder função, sem manter acesso anterior (RN-RC-03) | Encerrar, não apagar autoria dos atos |
| `substituicao` / condomínio | A/S e síndico/subsíndico envolvidos, na finalidade de função vigente | A/S ou síndico ativa por B | A/S ou síndico desativa; subsíndico não ativa nem desativa, mesmo substituindo | Preservar histórico/auditoria |
| `funcionario`, `lotacao_funcionario`, `funcionario_portaria` / condomínio | A/S: gestão funcional; próprio funcionário: seu contexto; M vê funcionários ativos na pesquisa sem dados privados; portaria e demais projeções só para tarefas autorizadas | A/S por B | A/S cadastra setor/lotação/desligamento; B historiza e devolve chamados à fila | Desligar não apaga notas, conclusões ou autoria |
| `empresa_manutencao` / condomínio | G acompanha/seleciona no fluxo de manutenção; A/S cadastra; avaliação agregada nos recortes previstos | A/S ou síndico; sub em substituição, por B (RF-AD-14) | Campos de cadastro: nome/serviço/telefone; alterações posteriores de cadastro/estado não detalhadas: NC para concessão adicional. Não alterar conclusões passadas | Exclusão física não especificada: NC; sem login/score |
| `administradora`, `usuario_administradora`, `administracao_condominio` / global, global e condomínio | B resolve autorização; A acessa seus vínculos/condomínios no painel. Consulta administrativa global adicional: NC | Responsável por cadastrar organização e conceder vínculos não detalhado nas fontes: NC para concessão humana; modelo precisa suportar os vínculos legítimos | B considera vigência/contrato e mudança de plano; executor humano de alterações desses vínculos: NC até definição | Não excluir fatos/contratos históricos; NC operacional |

### 5.3 Planos, solicitações e parâmetros — 12 entidades

Fonte: [MER §4.3](01-mer-e-der.md#43-planos-da-plataforma-solicitações-e-parâmetros); PRD §2/§3; RN-PL-01 a RN-PL-07, RN-CD-06/16/23, RN-GE-01 a RN-GE-03 e RN §13.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `plano`, `preco_plano` / globais | Admin no painel; apresentação comercial aplicável não expõe contratos de outros condomínios | Admin mantém planos/preços por B, nos planos existentes | Novas vigências/faixas, sem recalcular fatura antiga. Não criar novos direitos de acesso pela edição de preço | Preservar versões utilizadas; exclusão física NC |
| `assinatura_condominio` / condomínio | B valida plano/franquia; Admin no fluxo de gestão do plano, limitado aos dados comerciais necessários. Leitura humana adicional de contrato: NC | B registra contratação no fluxo de plano; detalhamento da formalização comercial permanece pendente | B aplica troca no ciclo previsto; não concede acesso operacional ao Admin | Preservar histórico; NC |
| `fatura_plataforma`, `item_fatura_plataforma` / condomínio | B apura base comercial; destinatários/telas de consulta humana não especificados: NC | R/B gera base por ciclo e extras de solicitações atendidas | B processa efeitos comerciais definidos; forma de cobrança/liquidação da assinatura não especificada: NC para ações adicionais | Preservar; não apagar fatura para recalcular preço |
| `solicitacao` / condomínio | Solicitante: seus pedidos; A/S: fila autorizada | G solicita cadastro/alteração/remoção/cobrança extra; P nos pedidos de locação; B registra | A/S atende/recusa com motivo; B registra execução e contagem da franquia, sem permitir solicitante marcar como atendida | Exclusão operacional NC; atendimento/recusa preservados |
| `autorizacao_suporte` / condomínio | Admin gerencia concessão; B verifica plano/atribuição/vigência; S usa apenas sua autorização | Admin concede por B | Admin encerra concessão; B bloqueia acesso por perda de condições, inclusive mudança para Essencial | Preservar trilha, não apagar para esconder acesso |
| `acesso_suporte` / condomínio | Admin no painel de acessos; B para auditoria. S não recebe consulta irrestrita ao histórico de outros acessos | B registra cada acesso S | B registra encerramento; S não reescreve finalidade/recurso para apagar rastros | NC operacional; retenção P-09 |
| `parametro_definicao` / global | B resolve catálogo; usuários só os parâmetros necessários à ação autorizada | Manutenção humana do catálogo técnico não especificada: NC; não há editor livre de regras | Alterar definição/tipo/faixa não é configurar valor; NC até definição | NC |
| `parametro_padrao` / global | B resolve padrão; Admin configura padrões da plataforma | Admin publica valor por B conforme RN §13 | Nova vigência imutável, dentro do catálogo e limites | Preservar versões; NC |
| `parametro_condominio`, `parametro_area` / condomínio | A/S configura; M/G/funcionários recebem regras resolvidas necessárias ao módulo, não segredos ou todas as configurações | A/S por B, no nível permitido | Nova vigência; área precede condomínio e padrão quando permitido; instantâneos antigos não mudam | Preservar versões; NC |

### 5.4 Reservas, vistorias e visitantes — 15 entidades

Fonte: [MER §4.4](01-mer-e-der.md#44-reservas-vistorias-e-visitantes); RN-RE-01 a RN-RE-14, RN-CA-01 a RN-CA-06, RN-VI-01 a RN-VI-17, RN-OF-01 a RN-OF-06 e RN-CD-15/17/19/24.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `area_comum` / condomínio | M para reservar; A/S configura; portaria/limpeza no fluxo de uso/vistoria | A/S por B; paga exige conta apta | A/S altera cadastro/regras futuras; não muda instantâneo de reserva antiga | Exclusão física com histórico NC |
| `reserva` / condomínio | M: contexto autorizado da unidade ativa; calendário de terceiros só Ocupado, sem unidade/pessoa. Portaria: reservas do dia com área/horário/unidade/estado, sem valores, meio ou score. Limpeza: dados necessários à vistoria | M por B, com ocupação, vínculo, prazo de locação, limite, score e atraso aplicáveis | M cancela até início; B confirma gratuita, I confirma paga, R expira. Portaria inicia uso; portaria/limpeza conclui por vistoria. Cancelamento pelo condomínio segue RN-CA-05; executor humano além dos fluxos expressos: NC | Cancelar/expirar não apaga; preserva fato financeiro/uso |
| `cancelamento_reserva` / condomínio | Mesma barreira da reserva e projeção financeira autorizada | B por cancelamento elegível; intenção de reembolso separada | Fato preservado; confirmação financeira fica em devolução, não reescrita do cancelamento | NC |
| `vistoria`, `item_vistoria`, `evento_uso_reserva` / condomínio | Portaria/limpeza no fluxo autorizado; evidência segue também barreiras da reserva e, se vinculada a reclamação, do caso. Não concede listagem geral de vistorias a A/S | Portaria/limpeza faz vistoria online; portaria inicia Em andamento; B registra eventos/checklist e eventual reclamação em nome do condomínio | Sem edição livre de resultado/evento. Não comparecimento só Confirmada após fim; uso não iniciado em Aguardando/Cancelada/Expirada; Cumprida antecipada conserva intervalo | Preservar eventos/evidências; NC |
| `lista_visitantes`, `autorizacao_visita`, `dia_recorrencia_visita` / condomínio | M: unidade ativa; portaria: blocos/dia autorizados. P só seus hóspedes de temporada na exceção RN-VI-10, nunca visitantes do inquilino | M por B; P só unidade desocupada e temporada permitida; portaria registra autorização por interfone junto da entrada | M adiciona/remove ainda não chegados/cancela segundo prazo; B cancela futuras da reserva cancelada e encerra recorrentes na saída. Dados herdados da reserva não são editáveis. Quem já entrou permanece | Remover visitante da lista cancela autorização; não apaga ocorrência. Retenção/anonimização §7 |
| `visita`, `evento_visita` / condomínio | Portaria nos blocos e período necessário; M na unidade conforme fluxo; P não lê rotina do inquilino | B gera ocorrência; portaria registra entrada/saída inclusive offline | Portaria registra transições/Desfazer por novo evento, não apaga o anterior; R encerra sem saída/sem comparecimento, sem inventar hora de saída | NC operacional; anonimização de identificadores §7 |
| `bloqueio_entrada` / condomínio | A/S, síndico, subsíndico e portaria nos contextos previstos; não lista pública de moradores | A/S mantém lista por B | A/S mantém dados/motivo/vigência; portaria decide entrada, não altera bloqueio por esse poder | Remoção física não especificada: NC; cessação do bloqueio não apaga decisões anteriores |
| `decisao_bloqueio` / condomínio | Portaria na decisão necessária; acesso posterior além das barreiras do fato não especificado: NC | Portaria por B; liberar apesar do alerta exige motivo | Registro histórico sem edição livre | NC |
| `modelo_lista`, `item_modelo_lista` / condomínio | Somente unidade autorizada; sem acesso à unidade anterior ou por P à rotina do inquilino | M salva modelo por B | Reutilização não concede edição física de qualquer modelo; manutenção adicional não especificada: NC | B apaga modelo e itens do criador ao sair/trocar de unidade (RN-VI-16); demais exclusões humanas não especificadas: NC |

A limpeza não ganha controle de início de uso; reserva paga não utilizada não gera pontos nem reembolso automático. Consulta atualizada de reservas e marcações/vistoria exigem internet. Fonte: RN-RE-09/10/13.

### 5.5 Encomendas e entregas esperadas — 3 entidades

Fonte: [MER §4.5](01-mer-e-der.md#45-encomendas-e-entregas-esperadas); RN-EN-01 a RN-EN-13.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `entrega_esperada` / condomínio | Qualquer M da unidade; portaria vê as do dia e candidatas à vinculação nas condições RN-EN-11/13 | M por B, não P | Qualquer M da unidade edita campos/cancela em Esperada ou Não chegou; B altera Chegou por vínculo confirmado, desfaz vínculo em correção, R encerra/atualiza por data. Chegou não edita/cancela | Cancelar não apaga; 30 dias de exibição não definem expurgo físico |
| `encomenda` / condomínio | M da unidade; portaria no recebimento/retirada; síndico e subsíndico: vencidas. P sem rotina do inquilino | Portaria por B, com remetente/unidade/foto opcional | Portaria registra retirante M e corrige unidade antes da retirada; G marca devolução após prazo, sub normal apenas lê. B aplica estados e notificações | Preservar fato; exclusão física NC |
| `evento_encomenda` / condomínio | Mesma barreira do fato/projeção; correção não autoriza unidade errada a continuar lendo encomenda da nova unidade | B registra recebimento/correção/retirada/devolução autorizados | Fato histórico, sem edição manual | NC |

iFood/entregador é só aviso: não gera encomenda, não vincula pacote, não autoriza acesso ou retirada.

### 5.6 Chamados, conclusões e atendimento — 5 entidades

Fonte: [MER §4.6](01-mer-e-der.md#46-chamados-conclusões-e-avaliação-do-atendimento); RN-CH-01 a RN-CH-21; PRD §3.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `chamado` / condomínio | Autor, gestão no fluxo previsto e limpeza na fila do setor; subsíndico acompanha manutenção. Portaria não recebe fila de atendimento. Não estender leitura a P/A/S por serem gestores de cadastro | M, síndico profissional e portaria por B; sem chamado por unidade desocupada | Limpeza atende/conclui limpeza; G indica empresa/status/conclui manutenção e ajusta urgência de aberto; autor reabre em até 48h. Sub normal acompanha sem mudar manutenção/urgência | NC; encerramento não apaga histórico |
| `evento_chamado` / condomínio | Leitores autorizados do chamado, com projeção pertinente | B registra ação autorizada, incluindo urgência antes/depois e reabertura | Imutável como fato; correções por novo evento | NC |
| `conclusao_chamado`, `foto_conclusao` / condomínio | Autor, síndico e subsíndico no detalhe autorizado; limpeza recebe seu fluxo e aviso de conclusão superada. Anexo não libera outras avaliações | Limpeza ou G conclui conforme tipo; B registra candidato/ciclo e até cinco fotos opcionais | B resolve efetiva pela menor hora do celular, preserva superadas e janelas; sem sobrescrever autoria/atendente; empate/relógio pendentes | NC; superação não apaga conclusão/foto/avaliação |
| `avaliacao_atendimento` / condomínio | Autor no chamado; síndico/sub no detalhe; G agregado; A/S só agregado sem comentário/chamado/avaliador. Funcionário somente suas avaliações projetadas conforme RN-CH-20 | Autor M elegível, inclusive síndico morador/sub, dentro da janela e com base válida; profissional/portaria não avaliam | Não se edita; correção tardia permite outra avaliação da nova conclusão, não transferência da anterior | Não se apaga operacionalmente (RN-CH-17); LGPD segue §7 |

Projeção do funcionário: sem unidade, autor, chamado, local, FK de conclusão ou metadado navegável; mês em vez de data. Média/comentários só a partir de três avaliações; antes, mensagem de poucas avaliações. Avaliação superada fica somente no histórico autorizado e fora das médias; não muda score nem pesquisa mensal.

### 5.7 Reclamações, recursos e score — 9 entidades

Fonte: [MER §4.7](01-mer-e-der.md#47-reclamações-recursos-e-score); RN-RC-01 a RN-RC-19; RN-SC-01 a RN-SC-05 e RN-SC-08 a RN-SC-14; SEG-07. A separação física de identidade é proposta do [ADR-010](../03-arquitetura/adr/010-anonimato-identidade-separada.md), sem aceitar o ADR.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `categoria_reclamacao` / global | M/J/A recebe catálogo necessário à ação autorizada, não identidades dos casos | Mantenedor global não especificado: NC | Gravidade aplicada pode ser alterada por J no caso com justificativa, não no catálogo; CRUD do catálogo NC | NC |
| `reclamacao` / condomínio | Reclamante: próprias; alvo: conteúdo permitido sem autor/semáforo; J e gestores conforme PRD/RN; A: todas. P: só categoria/data/decisão/multa das validadas contra sua unidade, sem conversa. S/Admin sem acesso operacional | M reclama contra alvos previstos; B cria em nome do condomínio a partir de dano em vistoria. Síndico profissional não ganha permissão de reclamar como M | B conduz estados; J conversa/decide; sem edição irrestrita da denúncia, alvo ou autoria. Quem é parte não julga seu caso/recurso | Preservar; anonimização LGPD sem apagar contagem/fato |
| `reclamacao_identidade` / condomínio | J/A nos casos autorizados; B verifica a própria autoria sem expor tabela ao reclamante. Alvo, S e Admin nunca recebem identidade | B com a abertura; autor humano/episódio ou condomínio conforme XOR | Sem troca de reclamante/episódio; tratamento LGPD por procedimento restrito | Sem exclusão operacional isolada para ocultar ato; §7 |
| `atribuicao_julgamento` / condomínio | J/A e projeção de estado aos interessados, sem identidades indevidas | B atribui pela tabela RN §5.1 e conflitos; pode permanecer Pendente | Mudança de vigência preserva histórico; reatribuição após mandato segue tabela vigente e encerra acesso anterior (RN-RC-03) | NC |
| `decisao_reclamacao` / condomínio | Projeções da reclamação por destinatário, nunca identidade ao alvo | J por B após resposta ou prazo; motivo/justificativa exigidos conforme resultado | B registra efeitos; sem reescrever decisão para substituir recurso | Preservar; NC operacional |
| `recurso_reclamacao` / condomínio | Recorrente, julgador elegível e A no contexto autorizado; não S/Admin | Afetado que perdeu pontos, uma vez em sete dias, quando admitido pela decisão de origem | J do recurso decide por B; parte não julga; administradora/conselho como instância final conforme RN §5.3 | Preservar; NC operacional |
| `perfil_score`, `movimento_score` / condomínio | Dono no perfil correto; score público do síndico; J/A no contexto de reclamação; A vê funcionários e, sem A, síndico/sub vê funcionários. Histórico do alvo nunca identifica reclamante | B cria perfil por episódio/função e movimentos oriundos de decisão, recurso, pesquisa ou faltas; sem edição humana do saldo | B atualiza saldo/regularidade de modo transacional e reconciliável; reversão referencia perfil original. Não somar unidades/condomínios | Preservar histórico; novo episódio não apaga o anterior; §7 |
| `apuracao_faltas` / condomínio | B apura; dono vê efeito no histórico do score, não relatório irrestrito de faltas alheias | R/B para pares de faltas gratuitas do mesmo episódio/unidade/trimestre | Efeito idempotente, sem reutilizar faltas ou incluir reserva paga; correção manual não definida: NC | NC |

Consultar todas as reclamações como síndico não inclui consultar contra si pela função de gestão; o tratamento como alvo continua limitado. J depende da atribuição e dos conflitos, não apenas de ostentar mandato. Quem reclama sendo julgador desloca o julgamento conforme RN-RC-11. P não tem score por sua propriedade não residente.

### 5.8 Pesquisa e comunicação — 9 entidades

Fonte: [MER §4.8](01-mer-e-der.md#48-pesquisa-mensal-e-comunicação); RN-PE-01 a RN-PE-09; RN-CO-01 a RN-CO-05; RN-RC-13; ADR-010 proposto.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `pesquisa_mensal` / condomínio | Elegíveis veem pesquisa do mês; funcionário recebe resultados permitidos, não dados de autores | R/B abre por competência | R/B fecha uma vez em efeito, sem permitir humano reabrir/editar mês fechado | NC |
| `resposta_pesquisa` / condomínio | Avaliador localiza a própria para editar enquanto aberta; funcionário vê notas/comentários recebidos sem autor; nenhuma lista nominal para gestores | M elegível por B, uma por pessoa/funcionário/mês; profissional/funcionários não avaliam | Avaliador muda nota na janela; edição não prevista de outros campos: NC. Após fechar não altera | Exclusão operacional NC; direitos do titular/rotação dependem P-12 |
| `resultado_pesquisa_funcionario` / condomínio | Próprio funcionário recebe notas/comentários sem autor; B usa apuração restrita para score; não expor respostas individuais a A/G pela gestão | R/B apura no fechamento | Reconstrução técnica não muda regra nem duplica score; edição manual NC | NC; retenção P-09 |
| `resultado_pesquisa_setor` / condomínio | Perfis autorizados pelo PRD veem nota publicada só com dois ou mais funcionários avaliados; P não recebe permissão nova pelo termo genérico todos | R/B calcula média das médias | B publica após fechamento e limiar; sem resultado parcial indevido | NC |
| `comunicado`, `destinatario_comunicado`, `mensagem_comunicado` / condomínio | Autor/destinatários e público escolhido; P recebe gerais para moradores/todos. Conversa de reclamação somente participantes autorizados, nunca P por acompanhamento da unidade | G envia; J inicia individual vinculado ao caso, mesmo fora de G; destinatário responde individual por B | B marca entrega/leitura e insere respostas. Editar sugestão antes do envio não autoriza reescrever mensagem enviada; NC para edição/exclusão não prevista | Preservar histórico da conversa; remoção/moderação não especificada: NC |
| `sugestao_comunicado` / condomínio | Sub autor e síndico revisor | Sub fora da substituição por B | Síndico edita/envia ou descarta; substituição devolve pendentes ao sub. Autoria da sugestão não é a da publicação | Descartar é estado, não DELETE |
| `denuncia_conteudo` / condomínio | Denunciante no próprio fluxo e destinatário competente; conteúdo protegido não vira consulta geral | Usuário denuncia origem que pode acessar; B valida conflito de destinatário conforme RN-RC-13 | B encaminha; poderes humanos de moderação/alteração do conteúdo não especificados: NC | NC; denunciar não apaga nem libera conteúdo |

Proposta HMAC: `resposta_pesquisa` sem FK direta do avaliador, chave derivada por condomínio/pessoa/funcionário/competência e segredo fora do banco. Isso não equivale a anonimização irreversível nem autoriza ocultar do titular os direitos previstos. P-12 continua aberto.

### 5.9 Reuniões, eleições e votos — 12 entidades

Fonte: [MER §4.9](01-mer-e-der.md#49-reuniões-eleições-e-votos); RN-VO-01 a RN-VO-19, SEG-06; [ADR-009 proposto](../03-arquitetura/adr/009-votacao-sigilo.md). O submodelo de substituição de voto está bloqueado por P-03.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `reuniao`, `pauta` / condomínio | Participantes elegíveis do contexto da unidade, incluindo P; G organiza. Não concede a qualquer perfil dados financeiros de outras unidades | G convoca/define pautas por B; exceção de nova eleição sem titular segue RN-CD-13 | G registra encerramento, arquivos e dados previstos; sem reescrever voto. Alterações de pauta já votada não especificadas: NC | NC; reunião encerrada preservada |
| `eleicao`, `turno_eleicao` / condomínio | Elegíveis e condutor autorizado, sem voto individual nem resultado antes do encerramento | Condutor por B conforme RN-VO-13 em qualquer plano: síndico, sub se ausente/vago, conselho sem ambos, proprietário designado sem todos; A/S também podem | Mesmo condutor legitimado encerra por B; revalidar condições a cada ação. R/B segundo turno; edição irrestrita NC | Preservar fatos e auditoria sem conteúdo do voto |
| `candidatura` / condomínio | Projeção eleitoral aos elegíveis; candidato vê elegibilidade/motivo no seu fluxo | Morador elegível se candidata por B na janela; inquilino salvo proibição da convenção | B verifica elegibilidade e resultado; edição/retirada humana não especificada: NC | NC |
| `votacao`, `opcao_votacao` / condomínio | Votante elegível consulta opções/estado; nenhum perfil consulta parcial pelo fato de gerir a votação | G define por B; mínimo duas opções na abertura | G encerra conforme regra; B controla estado/quórum. Opções imutáveis após abrir; não manipular contagem | NC |
| `procuracao` / condomínio | Outorgante/procurador nos próprios contextos; B verifica escopo e elegibilidade; consulta geral de procurações: NC | Proprietário indica antes do voto por B; mesmo condomínio e limite de representação | B considera vigência/revogação; procedimento humano de revogação e escopo reunião/eleição ainda não detalhados: NC para ações adicionais | Preservar se usada; NC operacional |
| `voto_registro` / condomínio | Própria participação/confirmação imediatamente; ler participação de outras unidades depende autorização específica ainda pendente | Proprietário/procurador ou inquilino na pauta admitida; G/sub registra presencial conforme RN-VO-11; B grava elegibilidade/autor do registro | Substituição por voto do proprietário é regra, mas mecanismo não resolvido P-03; não conceder edição livre da participação | NC; P-03 não autoriza apagar participação para contornar sigilo |
| `voto_conteudo` / condomínio | B somente na operação protegida e apuração; nenhum perfil humano recebe conteúdo individual ou parcial, nem mesmo autor do registro presencial | B na mesma operação indivisível da participação, sem FK de identidade/unidade/registro | Sem reescrita humana; mecanismo de substituição pendente P-03, não inventar associação oculta | NC operacional; solução de substituição depende decisão específica |
| `resultado_votacao`, `resultado_eleicao` / condomínio | Elegíveis veem resultado publicado só após fechamento; contagens por opção, sem voto individual | B apura/publica segundo estado/quórum/empate | B aplica classificação/sucessão prevista; correção humana de contagem não especificada: NC | Preservar; NC |

Não implementar o fluxo de substituição como resolvido. A separação participação/conteúdo, sozinha, não permite localizar e substituir o conteúdo anterior. Registro por unidade não permite outra unidade votar por ela sem procuração. Atraso bloqueia voto conforme RN-FI-11/VO-16; o motivo não é publicado aos demais participantes.

### 5.10 Cobranças, pagamentos e integração — 17 entidades

Fonte: [MER §4.10](01-mer-e-der.md#410-cobrança-condominial-e-pagamentos); RN-FI-01 a RN-FI-20 (RN-FI-18 é V2), RN-PG-01 a RN-PG-07, SEG-12/15/17; [ADR-002](../03-arquitetura/adr/002-gateway-de-pagamento.md), Asaas aceito com ressalvas. Detalhes do provedor continuam condicionados à prova de conceito.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `responsabilidade_financeira` / condomínio | A/S administra; titular recebe suas obrigações e P a situação da unidade; G conforme painel. Dependente/outro morador sem responsabilidade não consulta dívida | A/S por B, por natureza ordinária/extraordinária | A/S altera vigência conforme contrato; B congela responsável na emissão, não transfere dívida histórica | Preservar histórico; NC |
| `configuracao_cobranca`, `meio_cobranca_aceito`, `valor_taxa_unidade` / condomínio | A/S configura; pagador recebe condições da cobrança; G recebe informações de seu fluxo sem edição | A/S por B, conta apta e pelo menos um meio | A/S publica configuração/valor vigente; não reescreve emissão anterior ou saldo de recebimento | Exclusão física não especificada: NC; desativar módulo não apaga cobranças |
| `conta_recebedora` / condomínio | A/S no cadastro; titular aceita termo PF; demais recebem só dados necessários ao pagamento/comprovante, nunca credenciais | A/S por B; PF exige aceite do titular | A/S mantém conta com auditoria; I/B registra verificação; condições do Asaas pendentes não são aprovação fictícia | Encerrar vigência não apaga histórico financeiro; NC |
| `lote_cobranca_extra` / condomínio | A/S administra; G acompanha solicitação; destinatário vê sua cobrança, não lote de outras unidades | A/S lança por B; G solicita | B emite cobranças com tipo/unidades/valor/vencimento e snapshot; edição de lote emitido não especificada: NC | NC |
| `cobranca` / condomínio | Responsável nas emitidas a ele; P vê situação das demais da sua unidade; A/S e G conforme RN-FI-10. CSV individual só A/S autorizado por equivalência do plano; conselho sem lista individual por finanças | R/B mensal; A/S extra/reemissão prevista | A/S cancela com motivo/baixa manual com comprovante; I/B confirma e R deriva atraso. Pagador solicita segunda via, não edita valor/estado. Reemissão não cobra duas vezes | Cancelar não apaga; NC operacional |
| `tentativa_pagamento` / condomínio | Pagador da cobrança/reservante e A/S nos fluxos necessários, com projeção sem segredos; portaria não vê meio/valor de reserva | Pagador inicia por B, nos meios/prazo aceitos | I/B registra retorno/expiração; cliente não marca aprovado nem altera origem/conta | Preservar; NC |
| `recebimento` / condomínio | Pagador: histórico/comprovante autorizado; A/S: conciliação/baixa; G somente projeções permitidas de cobrança, sem navegação indiscriminada de origem financeira | I/B por confirmação validada; A/S baixa externa com comprovante/motivo por B | B concilia e registra efeitos; correção por origem/devolução, não reescrita arbitrária do recebido | NC; repetição de webhook não cria dinheiro novo |
| `evento_gateway` / condomínio | B processa no tenant resolvido; perfis humanos não recebem payload bruto pelo poder de gerir cobranças | B após autenticação/correlação confiável | B registra processamento/erro sanitizado e deduplica | NC operacional; retenção P-09 |
| `evento_gateway_quarentena` / global | Somente B e Admin da plataforma, conteúdo mínimo restrito; nunca tenants/S | B recebe evento sem correlação válida | B correlaciona para tenant confiável ou processa estado previsto; poderes de correlacionar/descartar manualmente pelo Admin não especificados: NC | Retenção curta pendente P-09; ler não concede apagar |
| `devolucao` / condomínio | Pagador: seu comprovante/estado; A/S no fluxo autorizado | B por cancelamento com direito ou decisão de duplicidade A/S; I executa devolução financeira | I/B confirma estado real, sem fingir devolução antes do retorno; valor não supera recebido | Preservar; NC |
| `tratamento_duplicidade` / condomínio | A/S decide; pagador recebe resultado da própria transação | A/S escolhe devolução ou crédito por B, auditado | B efetiva destino sem dupla destinação; alteração livre posterior NC | NC |
| `credito_unidade`, `aplicacao_credito` / condomínio | A/S e titular do fluxo financeiro autorizado; não expor crédito de outra unidade | B deriva crédito da duplicidade e aplica na cobrança elegível | B controla saldo, unidade e origem sem nova receita; troca de responsável pendente P-11 | Preservar; NC |
| `conciliacao_pagamentos`, `divergencia_pagamento` / condomínio | B concilia; A/S recebe alertas/ações autorizadas, não payload/segredo irrestrito | R/B por conta/dia e divergências reais | B atualiza andamento; detalhamento de ações humanas de resolução não especificadas: NC | Preservar; retenção P-09 |

No Asaas, autenticação do webhook por token em `asaas-access-token`, não assinatura do corpo. O nome lógico `assinatura_verificada` e motivo de quarentena continuam em P-16; este documento não renomeia o MER. Não armazenar número completo de cartão/CVV. B nunca usa condomínio arbitrário do payload para escolher contexto.

### 5.11 Finanças gerenciais — 7 entidades

Fonte: [MER §4.11](01-mer-e-der.md#411-finanças-gerenciais-do-condomínio); RN-FI-21 a RN-FI-32; RF-FI-17 a RF-FI-24; SEG-18.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `mes_financeiro` / condomínio | A/S, G e conselho na projeção financeira | B organiza competência | R fecha no prazo ou A/S fecha após último dia; não reabrir | NC |
| `categoria_financeira` / global | Leitores autorizados das finanças e B; catálogo fixo RN-FI-32 | Manutenção técnica/global não especificada: NC | Não autoriza plano de contas livre por administradora; NC | NC |
| `recorrencia_financeira` / condomínio | A/S para operar; demais somente informações contidas na projeção financeira autorizada | A/S por B, valor fixo/dia | A/S encerra para o futuro; B gera lançamento por competência. Alterar meses anteriores: não | Apagar histórico NC |
| `lancamento_financeiro` / condomínio | A/S, G e conselho; receitas automáticas agregadas, folha só total; sem unidade/responsável. M/P/funcionários não veem finanças | A/S lança avulsos; R/B gera recorrência; B gera automáticos de pagamento/devolução | A/S edita avulso em mês aberto; automático corrige na origem. Fechado: estorno integral autorizado, original só muda estado para Estornado; motivo obrigatório | A/S exclui avulso só em mês aberto, com auditoria; automático/fechado/estorno não se exclui |
| `origem_lancamento` / condomínio restrito | B e A/S somente na finalidade autorizada de conciliação; G/conselho na projeção fiscal sem ligação individual; G executor da autogestão somente na finalidade administrativa autorizada de conciliação | B junto do fato financeiro | Efeitos idempotentes/reconstruíveis; sem edição humana livre de componentes/origem | NC |
| `comentario_financeiro` / condomínio | Leitores autorizados das finanças, sem abrir dados protegidos de outra origem | G/conselho comenta lançamento ou mês por B, inclusive fechado; A/S recebe aviso | Imutável; não altera valores nem aprova contas | Exclusão não prevista: NC; sem apagar para simular edição |
| `exportacao_financeira` / condomínio | Solicitante autorizado; arquivo com mesmo filtro/projeção financeira de A/S, G ou conselho | A/S, G ou conselho solicita por B | B registra geração/estado/arquivo; solicitante não troca escopo após gerar | NC operacional; prazo de arquivo/expurgo P-09 |

Não há vínculo individual exposto nas receitas de cobrança/reserva. CSV/PDF gerencial não é CSV individual de cobranças. Fontes individuais restritas com projeções diárias por categoria foram aprovadas por Pedro em 12/11/2026 (MER P-08); ADR-010 ajustado nesse ponto sem aceitação integral. O armazenamento físico ainda exige validação.

### 5.12 Arquivos, notificações, auditoria e sincronização — 12 entidades

Fonte: [MER §4.12](01-mer-e-der.md#412-arquivos-notificações-auditoria-e-sincronização), §6.2; SEG-08/09/11/13; RF-NO-01; RN-OF-01 a RN-OF-06; RN §14; arq. §3.7 a §3.9 e §4.5 a §4.8.

| Entidade / escopo | Ler/consultar | Criar | Atualizar | Apagar |
| --- | --- | --- | --- | --- |
| `arquivo`, `anexo_dominio` / condomínio ou global explicitamente classificado | Mesma barreira do dado de origem/documento/titular, não só uploader. Exportação pessoal global só titular; sem URL pública/listagem de bucket | Usuário autorizado anexa no fluxo permitido; B autoriza upload/valida escopo e associação | B confirma envio/estado/classificação. Trocar alvo/tenant para abrir arquivo: não; reclassificação manual não especificada: NC | Sem DELETE genérico do uploader; anonimização/expurgo conforme domínio e §7 |
| `dispositivo` / global | B roteia sessão/push; titular no vínculo do próprio dispositivo; token protegido não é dado público | B associa instalação ao usuário autenticado no fluxo de uso | B atualiza token/atividade e revoga associação no logout; aparelho compartilhado não prova autoria de operação anterior | NC operacional; retenção pendente |
| `operacao_sync` / condomínio | Autor/dispositivo recebe recibo da própria fila e B processa carga restrita; sem catálogo humano de cargas alheias | Portaria/limpeza envia ação offline permitida; B registra recibo único | B processa resultado e valida hash/autor/tenant; reapresentação com carga diferente recusa, não edita recibo para trocar autoria | NC operacional; janela de idempotência/retenção a detalhar |
| `divergencia_sync` / condomínio | Porteiro no fluxo de confirmação; não notificar/abrir lista ao síndico | B por divergência da entrada offline | Porteiro confirma contato por interfone; B encerra só após confirmação | NC |
| `preferencia_notificacao` / condomínio | Titular no próprio vínculo e B | Titular configura por B | Titular muda preferências opcionais; decisão de reclamação/divergência obrigatórias não desabilitam; cobrança atrasada obrigatória ainda pendente | Exclusão genérica NC; encerramento de vínculo segue §7 |
| `notificacao` / condomínio | Destinatário; conteúdo seguro e referência não conferem acesso ao destino | B/R pelos eventos definidos, com mínimo de dados | Destinatário marca própria como lida por B; B agrupa conforme regra, sem editar fato de origem | NC operacional; retenção P-09 |
| `entrega_notificacao` / condomínio | B entrega/diagnostica, sem consulta humana irrestrita de tokens/cargas | B por canal/tentativa autorizada | I/B registra recibo/erro sanitizado; falha push não apaga notificação interna | NC operacional; retenção P-09 |
| `auditoria` / condomínio | Barreira do domínio de origem; acesso humano a tela/exportação de auditoria não especificado: NC. Acesso à tela de finanças não abre payload de reclamação | B junto de ato auditável, com ator/papel e dados sanitizados; não por formulário de usuário | Não reescrever evento; anonimização controlada quando aplicável, sem eliminar evidência obrigatória sem decisão | Sem apagar operacionalmente; retenção/finalidade P-09 |
| `auditoria_plataforma` / global | Caminho restrito à finalidade de auditoria de plataforma; consulta humana geral não especificada: NC | B pelos atos globais | Sem reescrita humana; nunca copiar conteúdo operacional para esta tabela | NC operacional; retenção pendente |
| `execucao_rotina` / condomínio | R/B observa tentativas no tenant; painéis operacionais humanos não especificados: NC | R/B por rotina/janela | R/B registra andamento/erro; não repetir efeito já aplicado | NC operacional; retenção pendente |
| `evento_saida` / condomínio | B/consumidor necessário ao evento; sem acesso humano geral ao outbox | B na transação do fato de domínio, carga mínima restrita | Consumidor B registra publicação/tentativa idempotente; não muda fato/tenant para reenviar a outro público | NC operacional; expurgo após processamento depende política própria |

## 6. Proteções complementares e canais

### 6.1 Colunas, projeções e agregados

As projeções autorizadas são parte da política, não mera escolha visual. API, consultas internas, downloads e respostas de erro devem minimizar campos e impedir navegação por identificadores restritos. Esconder campo na interface sem removê-lo do DTO não cumpre SEG-07/17/18.

- A consulta do alvo não junta `reclamacao_identidade`; conversa, recurso, movimento de score, anexo e notificação também não revelam autoria protegida.
- Score público do síndico não expõe todos os scores/históricos da pessoa. Funcionário e profissional usam perfil funcional daquele condomínio; moradia usa episódio/unidade.
- Finanças para G/conselho não incluem `origem_lancamento`, responsável financeiro, unidade, salário individual ou detalhamento que recupere a origem protegida. A/S não recebe esses dados fora da finalidade de cobrança/conciliação.
- Pesquisa do funcionário não identifica avaliador. Atendimento do funcionário não contém FKs de chamado/conclusão nem metadados de autor/local; aplicar limiar e granularidade de mês. Limiares de dois e três têm finalidades distintas.
- Voto individual não é devolvido em “meus dados”, log, auditoria, exportação ou resultado parcial. Participação própria pode ser confirmada sem revelar opção; consulta de participação alheia permanece pendente.
- Calendário de ocupação não identifica unidade/morador de terceiros. Reserva do dia na portaria não inclui valores, meios ou score.

### 6.2 Arquivos, exportações, auditoria e erros

**Proposta técnica:** B só emite URL assinado curto após autorizar recurso, ação e projeção. Prefixo de tenant no objeto é defesa adicional, não autorização suficiente. Nunca expor listagem pública, chave bruta ou URL pública permanente. Documento global não pode receber arquivo operacional para escapar da RLS (MER §4.1/§4.12; arq. §4.5).

Exportações são novas cópias sujeitas à mesma autorização e retenção. Quem gera CSV/PDF gerencial não ganha CSV individual. Arquivo LGPD de vários condomínios exige autorização por origem e exclusão dos dados protegidos de terceiros; somente titular acessa a entrega pessoal.

Auditoria contém ator humano ou sistema identificável, função efetiva, ação e antes/depois sanitizados. Registrar evento não significa copiar toda a entidade, identidade do reclamante, opção de voto, salário ou segredo de integração. Não usar tabela global de auditoria como espelho dos tenants. Acesso de S é auditado sem coletar conteúdo proibido.

ADR-007 propõe resposta 404 para recurso de outro condomínio em vez de erro que confirme existência; mensagens de login continuam uniformes. Contagens, busca, paginação, erro de FK e nomes de arquivos não devem revelar registros inacessíveis. Essa é uma exigência de revisão documental dos canais, não implementação de respostas neste arquivo.

### 6.3 Tempo real, jobs e integrações

**Proposta técnica — arq. §4 e backend §5/§6:**

- WebSocket inscreve usuário em sala autorizada pelo servidor, por condomínio/portaria/blocos; cliente não escolhe sala livremente. Troca de contexto retira salas anteriores e revalida vínculo. Evento mínimo não substitui autorização da leitura detalhada.
- Jobs enumeram contextos autorizados e processam um condomínio por execução; job sem tenant exige finalidade global explicitamente inventariada. O papel técnico não vira G ou A/S universal.
- As 21 rotinas da RN §14 usam chave de efeito, execução registrada e idempotência; leitor de `execucao_rotina` não recebe poder de editar saldos ou repetir cobrança.
- Webhook autentica o provedor, resolve tenant por correlação confiável e deduplica. Quarentena não concede ao Admin acesso ao evento operacional correlacionado. Confirmação, recusa, expiração e devolução são fatos distintos.
- Consumidores de outbox/push/e-mail recebem carga mínima necessária; link ou referência de notificação não autoriza abrir um domínio proibido. Credenciais ficam no servidor, por ambiente, nunca no aplicativo.
- Armazenamento, canal e fila não são novos perfis de produto. Privilégios exatos das credenciais e exceções revisadas ficam para o desenho físico/segurança.

### 6.4 Offline e autorização corrente

**Regra:** cópia do dia cifrada e separada por usuário/condomínio; portaria só blocos atendidos; fila de entrada/saída e conclusão de limpeza; vistoria/reserva não ganha offline. Logout/fim do dia apaga somente o cache de consulta conforme SEG-09 e RN-OF-06. Fila pendente é separada e protegida até sincronização/tratamento explícito; retenção e acesso após logout ainda dependem de desenho.

**Proposta técnica:** B valida autoria, vínculo, contexto e ação ao sincronizar, com tratamento dos fatos/divergências previstos nas RN; existência de recibo não garante que qualquer comando seja aceito. Não substituir a hora do celular pela chegada ao servidor na conclusão concorrente. Preservar ambas as horas, operações e avaliação superada, sem transferir nota; nova conclusão efetiva abre sua janela e não reinicia as 48h de reabertura.

Não inventar decisão para operação de vínculo já encerrado que chega atrasada fora dos casos especificados: registrar lacuna de protocolo e não conceder comando irrestrito por um contexto antigo. P-07 continua aberto para fila/arquivos não enviados em logout/fim do dia; P-04 para desempate/relógio. Servidor não promete apagar imediatamente aparelho desconectado. Cache cliente e salas não podem misturar usuários/tenants na troca de contexto.

### Complementação de acesso de 12/11/2026

Aplicar as [decisões de Pedro de 12/11/2026](../01-produto/05-decisoes-de-complementacao.md). Cancelar reserva pelo condomínio exige síndico/sub em substituição ou A/S vigente, com motivo/auditoria. Eleição regular abre/encerra somente por A/S vigente; síndico/sub não recebem essa permissão. Destinatário de denúncia revisa somente projeção protegida e decide sem ação ou ocultação com motivo/histórico, sem score automático; suporte continua excluído de reclamações e scores. Pessoa do episódio original conserva defesa/recurso próprios após mudança, sem acessar a unidade atual; mecanismo/projeção depende de revisão de privacidade. Não conceder função de operador LGPD até definição explícita. Acompanhamento e arquivo de exportação revalidam escopo atual; fila pendente não é cache apagável, e acesso após logout segue sem definição.

## 7. Exclusão, anonimização e retenção

Fonte: MER §2.2, §5, §6.2 e §10; RN-CD-07/08/18/21/25, RN-VI-08/16 e §8.4, RN-FI-22/27/28/31; RF-LG-01/02; SEG-09/10/11.

| Situação | Ação e autoridade previstas | Preservação e limite |
| --- | --- | --- |
| Cancelar reserva, visitante ou entrega | Solicitante autorizado pede; B registra estado e efeitos | Não DELETE da ocorrência/fato financeiro; visitante que já entrou permanece registrado |
| Desfazer entrada/saída | Portaria registra ação autorizada por B | Novo evento referencia o anterior; não elimina autoria passada |
| Saída/mudança de morador e fim de locação | A/S encerra vínculo ou R aplica fim nas condições da regra; B executa efeitos | Mantém histórico; encerra recorrentes, cancela reservas futuras com reembolso aplicável e apaga modelos salvos do criador. Não exclui identidade global com outros vínculos legítimos |
| Desligamento/fim de mandato | A/S encerra vigência; B retira autorização e redistribui tarefas conforme regra | Preserva notas/conclusões/decisões. Poder antigo não continua por haver histórico; não alterar autor passado |
| Novo episódio de moradia | A/S/B registra novo episódio | Score começa em 100 naquele vínculo; histórico anterior preservado e scores de outros imóveis não mudam |
| Visitante após retenção | R/B anonimiza nome/documento e arquivos identificáveis | Padrão seis meses configurável nos limites legais. Modelos e recorrentes precisam política coerente; remover identificadores, não apenas esconder na tela |
| Avulso financeiro em mês aberto | A/S exclui por B com auditoria | Não é direito sobre automático ou mês fechado. A forma física de preservar evidência/auditoria deve ser definida, sem impor soft delete universal |
| Mês fechado/automático financeiro | A/S solicita estorno autorizado ou corrige na origem; B/I registra efeitos | Sem reabrir mês, apagar automático, estornar estorno ou reescrever valor histórico. Original avulso fechado só muda estado no estorno autorizado |
| Comentário financeiro/avaliação atendimento | Criação definitiva nas condições da regra | Sem edição; avaliação não se apaga operacionalmente; comentário não ganha exclusão por não haver botão de editar. LGPD continua procedimento separado |
| Cópia dos próprios dados | Titular pede; B prepara entrega em até 15 dias | Não inclui identidade do reclamante alheio nem voto individual. Projeto precisa assegurar recuperação segura das próprias respostas de pesquisa, P-12 |
| Exclusão global da conta | Titular solicita; B executa procedimento LGPD a validar, revoga sessões e avisa substituição de responsáveis | Anonimiza identidade e cópias relacionáveis, mantendo votos/reclamações sem identificação. Não apagar fatos de outras pessoas nem tratar pedido como DELETE cascata |
| Arquivos, auditorias, notificações, exportações, pesquisa e finanças | Procedimento por finalidade, domínio e acesso autorizado | Prazos não definidos em P-09; não adotar prazo universal, retenção eterna ou exclusão de evidência obrigatória sem validação |
| Quarentena do gateway | B conserva mínimo necessário e aplica expurgo quando definido | Retenção curta exigida, duração pendente P-09; permissão de leitura do Admin não é permissão de apagar |
| Banco local, fila e arquivo pendente | Cliente apaga cópia conforme regra | Não igualar cache apagável a fila ainda não enviada; P-07 precisa resolver compatibilidade e risco de perda |
| Backup restaurado | Procedimento de segurança/infra reaplica exclusões/anonimizações antes de liberar | Política operacional ainda não escrita; restauração não pode ressuscitar acesso/dados apagados |

Não prever `ON DELETE CASCADE` indiscriminado sobre voto, reclamação ou dinheiro. Hash de e-mail/documento, HMAC e substituição de nome não garantem anonimização irreversível: relações, texto livre, anexos, horários, logs e cópias externas também precisam revisão. Um prazo de exibição (por exemplo, lista de entregas por 30 dias) não cria prazo de exclusão física do banco.

## 8. Pendências e acessos não concedidos

### 8.1 Pendências herdadas do MER e do produto

| Referência existente | Efeito na política; sem resolução implícita |
| --- | --- |
| P-03 / ADR-009 | Substituir voto específico preservando sigilo: bloqueia implementação do submodelo. Não criar FK oculta nem autorizar apagar votos por conveniência |
| P-04 / ADR-014 | Empate exato e relógio incorreto na conclusão offline; critério menor hora do celular e correção tardia já definidos não são reabertos |
| P-05 / ADR-012 | Fuso para datas/prazos/fechamento afeta janelas de autorização; não escolher silenciosamente fuso ou tolerância |
| P-06 / ADR-002 | KYC, chargeback, confirmação/devolução e estados específicos do Asaas dependem PoC/piloto; não liberar efeitos financeiros fictícios |
| P-07 / ADR-003 | Fila offline e arquivos não enviados em logout/fim do dia; não prometer retenção indefinida ou descarte sem perda |
| P-08 / ADR-010 — direção aprovada em 12/11/2026 | Fontes individuais restritas com agregação diária por categoria nas projeções autorizadas; sem acesso individual por derivação do agregado |
| P-09 | Retenção/anonimização de auditoria, arquivos, notificações, pesquisa, finanças e quarentena; sem prazos novos neste documento |
| P-10 | Blocos opcionais, uma administradora vigente, uma lista ativa por reserva, reentradas e escopo da procuração: não impor restrição física ou permissão nova |
| P-11 — parcialmente resolvida em 12/11/2026 | Episódio original, reversão efetiva e reatribuição vigente definidos; projeção de defesa/recurso após saída depende de revisão; crédito após troca de responsável segue pendente |
| P-12 / ADR-010 | Identificador da pesquisa, rotação da chave e direitos do titular; não afirmar anonimato absoluto nem expor autor no banco para contornar a lacuna |
| P-16 | Nome `assinatura_verificada`/motivo de quarentena versus autenticação por token Asaas; sem renomear fontes |
| MER §6.1, voto | Consulta de participações de outras unidades depende autorização específica ainda a detalhar; confirmar própria participação não concede lista geral |
| User Flows §17 / MER §9 | Parecer jurídico, prazo de resposta do alvo, orçamento, transparência financeira a moradores, fundos/obras, plano de contas e atraso como notificação obrigatória continuam pendentes |

P-01/P-02/P-13/P-14/P-15 resolvidos no MER são respeitados: score por episódio, uso/vistoria de reserva paga, quarentena global, contrato como fonte do inquilino/datas e obrigatoriedade das versões/opções. Este documento não reabre essas decisões nem aprova automaticamente suas estruturas físicas.

### 8.2 Lacunas de autorização identificadas na consolidação

Estas lacunas não criam novos IDs de requisito ou decisões de produto. Enquanto não especificadas, a operação fica **NC**; a funcionalidade prevista nas fontes não é substituída por permissão ampla.

- Quem provisiona a primeira atribuição de Admin, a organização administradora e seus usuários/contratos, e quais campos podem alterar na identidade global compartilhada.
- Quem publica documentos globais e mantém catálogos técnicos, incluindo definições de parâmetros, categorias de reclamação e categorias financeiras; ler catálogo não significa editar sua definição.
- Consulta humana e processamento administrativo não detalhados de faturas/contratos da plataforma, auditorias, logs técnicos, fila/outbox e sessões. O admin gerenciar planos/acessos não basta para conceder todos esses dados.
- Quem opera pedidos LGPD além do procedimento técnico e alertas de substituição; escopos de consulta administrativa precisam ser definidos sem abrir dados de outros titulares.
- Poderes humanos de correlacionar/descartar/apagar quarentena e de resolver divergências de conciliação, além das ações financeiras já previstas nas RN.
- Exclusão física de cadastros históricos, moderação/remoção de conteúdo e edições não descritas nas fontes. “Manter cadastro” não significa apagar fatos, trocar tenant ou editar qualquer coluna.
- Tratamento de comandos offline atrasados após fim de vínculo/função fora dos casos definidos; não aceitar comando por autorização antiga nem inventar descarte do fato ocorrido.

A eventual decisão que altere comportamento de produto exige autorização de Pedro e atualização da cadeia RN → PRD → história → fluxo → Design System → protótipo. Nesta entrega, nenhum desses documentos é alterado. A validação desta política não equivale à aceitação de ADRs; ADR-001/007/009/010 e demais não aceitos mantêm seus estados. Asaas, Supabase + Render para construção do MVP e Resend têm somente as aceitações com ressalvas registradas nos ADRs 002/004/005.

## 9. Cenários concretos de verificação documental

Não são testes implementados nem evidência de banco seguro. São roteiros para revisar desenho, contratos e futuros testes, usando dois condomínios, duas unidades por condomínio e vínculos distintos. A implementação só poderá alegar cobertura após verificação real.

| Cenário | Resultado a exigir na revisão | Fonte |
| --- | --- | --- |
| Usuário do condomínio A envia UUID de B em detalhe, busca, anexo, exportação ou atualização | Não lê/confirma existência nem grava em B; conferir também FK, contagem e erro. Contexto não definido não retorna linhas | SEG-05; ADR-001; MER §2.1/§6.1 |
| Usuário pode ler sua unidade e tenta trocar tenant/unidade/autor de registro | Linha resultante rejeitada; conferir USING, WITH CHECK conceituais e campos autorizados | MER §5; arq. §4.3 |
| Conexão do pool usada por A é reutilizada por B | Contexto anterior não persiste; job/consulta sem contexto não herda tenant de usuário | ADR-001 |
| Proprietário não residente tenta abrir visitantes, chamado, reserva e score do inquilino | Negado; vê só acompanhamento permitido. Hóspede de temporada só se unidade desocupada e opção permitida | RN-CD-19/24; RN-VI-10 |
| Dependente ou responsável ordinário tenta ler dívida extraordinária emitida a outro | Não ganha dívida alheia por M ou mesma unidade; P pode ver situação conforme RN-CD-19/FI-10 | RN-FI-03/10; SEG-17 |
| Portaria de um bloco consulta lista de outro e entrega esperada de data indevida | Não recebe visitante fora do recorte; entrega candidata só nas condições da vinculação; sala WebSocket respeita blocos | RN-OF-01; RN-EN-10/11/13 |
| Portaria tenta iniciar reserva paga pendente ou fazer vistoria offline | Negado; reservas do dia sem valor/meio/score. Limpeza não recebe ação Em andamento | RN-RE-13 |
| Reserva paga termina sem uso | Não comparecimento preservado, sem penalidade ou reembolso automático; Cumprida antecipada não libera intervalo | RN-RE-09/10/13 |
| Subsíndico fora da substituição tenta alterar manutenção ou ver inadimplência | Negado, mas mantém acompanhamento, julgamento atribuído e registro presencial previsto. Em substituição, reavaliar G sem dar poder de ativar/desativar substituição | RN-CD-27/28 |
| S tenta identidade da reclamação, histórico do score, anexo ou payload correlacionado | Negado mesmo por rotas de A; acesso auditado no plano permitido. Ao mudar plano/perder autorização, contexto deixa de abrir | RN-CD-16; RN-PL-06; SEG-07/13 |
| Admin abre quarentena e segue referência ao evento operacional | Conteúdo mínimo de quarentena disponível; referência não abre tenant nem ação manual de descartar/correlacionar | MER P-13 e §6.1 |
| Síndico é alvo/reclamante ou termina mandato com caso pendente | Aplicar conflitos e atribuição; nunca julgar próprio recurso. Reatribuir pela tabela vigente preservando histórico e retirando acesso do ex-julgador | RN-RC-03/11/14; MER P-11 |
| Alvo pede exportação LGPD ou baixa fotos/conversa/histórico de pontos | Não revela reclamante por campo, texto, nome, metadado ou junção. P recebe projeção de validada sem conversa | RN-RC-01/16; RN-SC-12 |
| Funcionário com duas avaliações de atendimento pede detalhe dos comentários | Média/comentários ocultos; não recebe FK de conclusão, unidade, autor, data exata ou local. Pesquisa mensal tem outro limiar de publicação de setor | RN-CH-20; RN-PE-08/09 |
| Conclusão de limpeza com hora anterior chega depois da avaliação | Preserva ambas; efetiva passa a menor hora; nota anterior só histórico/fora de agregados, sem transferência; nova janela na efetiva, sem reiniciar 48h | RN-CH-04/15/17 |
| Conselheiro abre finanças e tenta navegar de agregado para recebimento individual | Sem unidade/responsável/ligação da origem; CSV/PDF conserva filtros/projeção; comentário não muda valor | SEG-18; RN-FI-29/30/31 |
| A/S tenta excluir automático, editar mês fechado ou estornar estorno | Negado; avulso aberto admite edição/exclusão auditada; fechado corrige por estorno elegível sem reabrir mês | RN-FI-22/27/28 |
| Mesmo webhook ou operação offline é reenviado; carga do mesmo op_id muda | Não duplica fato, dinheiro, pontos ou ciclo; carga divergente recusada. Evento sem correlação fica na quarentena, sem escolher tenant pelo corpo | MER §5/§4.10/§4.12 |
| Usuário tenta voto duplo, resultado parcial ou participação de outra unidade | Unicidade/elegibilidade; sem parcial/opção individual. Participação alheia NC; substituição do inquilino declarada bloqueada por P-03 | RN-VO-01/03/18; SEG-06 |
| Saída do morador ou logout ocorre com fila ainda não enviada | Histórico e efeitos previstos preservados; não supor que P-07 foi resolvido nem prometer limpeza remota imediata | RN-CD-07; RN-OF-06; MER P-07 |
| Conta excluída é restaurada de backup ou exportação antiga continua disponível | Plano contempla reaplicar anonimizações e proteger cópias/arquivos; sem definir prazo universal ou ressuscitar sessão/vínculo | RF-LG-02; MER §6.2 |

## 10. Critérios para validar esta proposta

1. Conferir as 130 entidades do dicionário atual do MER contra as 12 matrizes e revisar todas as células NC antes de implementar operações ainda indefinidas.
2. Conferir os 11 perfis, as condições de habilitação/responsabilidade/procuração/julgamento e o papel efetivo na data da ação. Identidade global e função acumulada não somam direitos proibidos em outra projeção.
3. Confirmar que cada criação/atualização tem solicitante e processo executor distinguíveis, campos/ação delimitados e autoria histórica preservada; não traduzir matriz em CRUD irrestrito.
4. Validar conjuntamente RLS, privilégios, serviço, DTO, arquivo, exportação, WebSocket, fila, cache, erro e log. Catálogo de RLS e testes propostos no ADR-001/arq. §4.11 devem cobrir leitura e escrita, ausência/vazamento de contexto e exceções.
5. Resolver pendências bloqueantes por módulo, com parecer jurídico e segurança quando necessário. Não declarar sigilo de voto substituível ou anonimização/expurgo completos antes das decisões correspondentes.
6. Validar mecanismos técnicos sem aceitar implicitamente ADRs. Este documento não cria banco, testes, papéis ou permissões executáveis e permanece proposta até a validação de Pedro.


## Atualização de autogestão e eleições — 13/11/2026

Regra aprovada por Pedro: **Essencial admite autogestão**, sem administradora e sem contratar Gestão + Suporte (RN-PL-08); não é terceiro plano nem novo perfil. Gestão e administração ficam no condomínio, concentradas nos órgãos locais aprovados por Pedro. **Distribuição conservadora proposta, a validar:** síndico executa, subsíndico em substituição assume, conselho fiscal mantém fiscalização e as atribuições específicas das RN. A exceção financeira de RN-FI-29 permite ao executor da autogestão operar finanças; não concede ao conselho edição financeira irrestrita. Leitura fiscal continua agregada e fontes individuais permanecem restritas à finalidade autorizada. Suporte não recebe acesso ao Essencial, nem a reclamações e scores em qualquer plano.

**Condução eleitoral em qualquer plano:** síndico em exercício; na ausência ou vacância, subsíndico; sem ambos, conselho fiscal; sem todos, proprietário designado com permissão temporária restrita à eleição. Administradora vinculada e suporte legitimamente autorizado também podem conduzir, sem serem pré-requisito. Autorização é contextual por condomínio, mandato, ausência/vacância e concessão; revalidar em cada leitura e ação. Proprietário designado recebe somente o escopo daquela eleição, sem gestão, finanças, reclamações ou autoconcessão. Auditoria registra ações, nunca voto individual; resultado só após encerramento. A restrição eleitoral anterior de 12/11/2026 fica substituída por RN-VO-13/RN-CD-13 atualizadas.

**Proposta técnica a revisar:** separar modalidade de gestão do plano comercial e manter histórico de vigência; políticas de autorização por ação (Strategy), reutilizando serviços de domínio (Information Expert, baixo acoplamento) nas interfaces de síndico, conselho e comum. Não atribuir o papel Administradora ao síndico para reutilizar DTOs. Persistir concessão eleitoral com condomínio, eleição, proprietário, início/fim, origem da designação e revogação, sem prazo arbitrário. Modelo físico, operação de concessão e campos ainda dependem de validação. Não há banco, migrações ou backend implementados.

**Pendências antes do MVP:** comprovar primeiro responsável sem autoridade prévia; registrar ausência/vacância sem autodeclaração privilegiada; definir qual conselheiro atua; designar/revogar proprietário e tratar perda de vínculo ou retorno do titular durante eleição; validar mandatos e mudança de modalidade; revisar a matriz completa de cadastros, cobrança, conciliação, pagamentos e finanças da autogestão. A interface comum contrata condução eleitoral; as 82 operações propostas de `/v1/sindico/gestao/` cobrem cadastros/configurações, cobrança, conciliação e finanças com DTOs específicos referenciados, sem login de administradora. Caminhos, distribuição e DTOs exigem revisão antes de implementar; mandatos/substituições e concessão inicial permanecem lacunas bloqueadoras. Critérios: titular/sub fora condição e conselho sem condição devem ser recusados; proprietário temporário não alcança finanças; suporte é recusado no Essencial; não há resultado parcial. Ver [decisões e questões detalhadas](../01-produto/06-autogestao-e-conducao-eleitoral.md). Esta atualização não aceita ADRs ou contratos inteiros.
