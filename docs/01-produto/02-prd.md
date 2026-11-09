# PRD — CondomiFacil

Nov 3, 2026 · @Pedro Lemos

## 1. Visão geral

O CondomiFacil é um app em React Native (celular e web) que centraliza a rotina de condomínios de qualquer porte, do pequeno prédio ao grande complexo: cobrança da taxa condominial, reservas pagas e gratuitas, visitantes, encomendas, chamados de limpeza e manutenção, reclamações, comunicados, votações e um score de conduta.

**Problema.** Muitos condomínios ainda dependem de portaria por telefone, cadernos e grupos de WhatsApp. Isso gera informação perdida, conflitos de reserva, reclamações sem registro e pouca transparência sobre o trabalho do síndico e dos funcionários.

**Solução.** O CondomiFacil, um app multi-condomínio com perfis por função, regras configuráveis por cliente, pagamento de reservas direto na conta do condomínio, score de conduta com recuperação e avaliação dos setores pelos moradores.

**Objetivos**

- Reduzir ligações para a portaria sobre visitantes e encomendas
- Acabar com conflitos e dúvidas sobre disponibilidade de áreas comuns
- Dar ao síndico um painel de chamados, reclamações e comunicados
- Realizar votações de pautas e eleições com um voto por unidade, de forma auditável
- Incentivar boa convivência com o score e a avaliação dos setores

**Métricas de sucesso**

| Métrica | Meta sugerida |
| --- | --- |
| Moradores ativos por mês / moradores cadastrados | ≥ 60% |
| Visitantes registrados pelo app / total de visitantes | ≥ 70% após 3 meses |
| Tempo médio para concluir chamados de limpeza | ≤ 24h |
| Reservas com conflito de horário | 0 |
| Participação em votações (unidades que votaram / unidades habilitadas) | ≥ 40% |
| Condomínios que renovam após 12 meses | ≥ 85% |
| Recursos aceitos / reclamações decididas | Medir no piloto; alto demais indica julgamentos ruins |
| Cobranças pagas pelo app até o vencimento / cobranças emitidas | Medir no piloto e definir a meta |

## 2. Escopo e planos comerciais

O MVP inclui todos os módulos abaixo, exceto relatórios e acordos de parcelamento; o produto é vendido em dois planos, conforme o condomínio tenha ou não administradora.

| Módulo | Entrega |
| --- | --- |
| Cadastro, acesso e termos | MVP |
| Painel web da administradora e do suporte (React Native Web) | MVP |
| Solicitações de cadastro feitas pelo síndico | MVP |
| Reservas pagas e gratuitas, com regras configuráveis | MVP |
| Pagamento e reembolso de reservas | MVP |
| Vistoria de áreas após o uso | MVP |
| Visitantes avulsos e recorrentes, lista de bloqueio | MVP |
| Encomendas | MVP |
| Chamados de limpeza e manutenção | MVP |
| Reclamações, recursos e score | MVP |
| Comunicados gerais e individuais | MVP |
| Reuniões, pautas, votações e eleições | MVP |
| Pesquisa mensal de funcionários | MVP |
| Notificações push | MVP |
| Painel da plataforma (condomínios, planos, suporte) | MVP |
| Relatórios e exportações | Versão 2 |
| Cobrança condominial: boleto, Pix, cartão, vencimentos e inadimplência | MVP |
| Controle de receitas e despesas do condomínio: lançamentos, categorias, evolução mensal, fechamento do mês e exportação | MVP |
| Acordos de parcelamento de débitos | Versão 2 |

**Fora de escopo:** contabilidade formal e prestação de contas oficial do condomínio (balancete assinado, parecer do conselho fiscal, ata), integração com catracas e interfones, entregas de comida por aplicativo.

**Planos**

| Plano | Para quem | Inclui | Preço |
| --- | --- | --- | --- |
| Essencial | Condomínios com administradora | App completo; a administradora faz cadastros e configurações | R$ 99 até 30 unidades; R$ 179 de 31 a 80; R$ 299 de 81 a 150; R$ 499 de 151 a 300; R$ 799 de 301 a 600; acima de 600, sob consulta |
| Gestão + Suporte | Condomínios sem administradora | App completo + a equipe da plataforma faz o papel de administradora (cadastros, mudanças de moradores, novas áreas, regras) | Essencial + R$ 150/mês. Solicitações incluídas por mês: 10 até 150 unidades, 25 de 151 a 300, 50 de 301 a 600, sob consulta acima de 600; R$ 15 por solicitação extra |

**Unidade** é cada imóvel privativo do condomínio: apartamento, casa ou sala comercial. Áreas comuns, vagas de garagem e depósitos não contam como unidades.

## 3. Perfis de usuário e permissões

O CondomiFacil tem 11 perfis; síndico e subsíndico são papéis atribuídos por mandato, e cada usuário vê apenas as informações das unidades a que está vinculado.

| Perfil | Quem é |
| --- | --- |
| Morador | Proprietário, inquilino ou dependente vinculado a uma unidade (apartamento, casa ou sala). Cada unidade ocupada tem um único morador habilitado, que responde por ela no dia a dia: o proprietário, se mora nela, ou o inquilino, se ela está alugada. Quem vota pela unidade é sempre o proprietário (RN-VO-01) |
| Síndico (morador) | Morador eleito; mantém todas as funções de morador |
| Síndico profissional | Contratado, sem unidade e sem funções de morador; contratação e desligamento registrados pela administradora |
| Subsíndico | Morador eleito, de unidade diferente da do síndico. No dia a dia, tem uma gestão limitada: julga reclamações contra o síndico, acompanha a manutenção, sugere comunicados, registra votos presenciais e vê encomendas com prazo vencido (RN-CD-27). Assume todas as funções de síndico quando a substituição é ativada |
| Funcionário de limpeza | Recebe e conclui chamados de limpeza, e vê as avaliações que recebe sem saber de quem |
| Funcionário de portaria | Controla entradas e saídas, registra encomendas e abre chamados; consulta reservas do dia, marca uso Em andamento e registra na vistoria Cumprida ou Não comparecimento, inclusive em reservas pagas |
| Administradora | Empresa que administra o condomínio; pode atender vários condomínios |
| Suporte da plataforma | Equipe da plataforma; no plano Gestão + Suporte, tem as permissões da administradora naquele condomínio em cadastros, configurações e cobrança. Não julga reclamações nem recursos e não vê reclamações nem scores |
| Admin da plataforma | Cadastra condomínios, planos e acessos de suporte |
| Conselho fiscal | Um ou mais membros, cadastrados pela administradora ou pelo suporte; obrigatório em condomínio sem subsíndico. Julgam reclamações e recursos contra o síndico quando o condomínio não tem subsíndico nem administradora, e recursos nos casos de RN-RC-14. Acompanham as finanças do condomínio em modo leitura e podem comentar (RF-FI-17, RF-FI-24) |
| Proprietário não residente | Dono da unidade que não mora nela, com a unidade alugada ou desocupada. Vota nas assembleias, vê e paga as cobranças de que é responsável e acompanha a unidade: contrato de locação, multas e reclamações validadas contra ela (RN-CD-19) |

**Unidade alugada.** O inquilino é cadastrado com as datas do contrato e passa a ser o morador habilitado, com todas as funções de morador. O proprietário continua votando, responde pelas despesas extraordinárias e é avisado do que acontece com a unidade, sem ver a rotina do inquilino. No fim do contrato, a administradora renova ou encerra o vínculo; sem renovação, a unidade fica desocupada (RN-CD-20 a RN-CD-24).

**Visão por unidade.** O app exibe reservas, visitantes, reuniões, votações e métricas da unidade ativa. Quem tem mais de uma unidade vê um painel separado para cada uma.

**Substituição do síndico.** A administradora ou o próprio síndico ativa a substituição; o subsíndico passa a ter as funções de síndico até a desativação, que pode ser feita a qualquer momento por quem tem esse poder.

**O que a administradora faz**

- Pré-cadastra moradores, funcionários, síndico e subsíndico, e atende as solicitações de cadastro do síndico.
- Mantém unidades e define o morador habilitado de cada uma; cadastra inquilinos com as datas do contrato de locação e marca unidades desocupadas.
- Registra mudanças de moradores e desligamentos de funcionários.
- Cadastra áreas comuns, regras de reserva, cancelamento e reembolso.
- Cadastra a conta bancária que recebe os pagamentos de reservas e da taxa condominial. Configura a cobrança (valores, vencimento, formas de pagamento), lança cobranças extras e acompanha a inadimplência.
- Registra mandatos de síndico e subsíndico, e contratação ou desligamento de síndico profissional.
- Controla as receitas e despesas do condomínio: lança despesas e receitas avulsas por categoria, acompanha o resumo e a evolução mensal, fecha o mês, estorna lançamentos de meses fechados e exporta para a contabilidade. As receitas de cobrança e de reservas entram sozinhas.
- Configura as regras de reeleição do condomínio.
- Ativa ou desativa a substituição do síndico pelo subsíndico.
- Consulta todas as reclamações, inclusive contra síndico e subsíndico, com a identidade e o score do reclamante e do alvo, e julga os casos previstos em RN-RC-03 e RN-RC-07. Consulta também o score dos funcionários.
- Publica o regimento interno e os termos do condomínio.
- Mantém a lista de pessoas com entrada bloqueada.

**Matriz de permissões**

| Ação | Morador | Síndico (morador) | Síndico profissional | Subsíndico | Limpeza | Portaria | Administradora |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reservar e cancelar (pagas e gratuitas) | Sim | Sim | — | Sim | — | — | — |
| Cadastrar visitantes avulsos e recorrentes | Sim | Sim | — | Sim | — | — | — |
| Ver lista de visitantes e registrar entrada e saída (também offline) | — | — | — | — | — | Sim | — |
| Registrar encomendas e retiradas | — | — | — | — | — | Sim | — |
| Avisar, editar e cancelar entregas esperadas da unidade | Sim | Sim | — | Sim | — | — | — |
| Ver as entregas esperadas do dia e vinculá-las à encomenda | — | — | — | — | — | Sim | — |
| Consultar reservas do dia e marcar Em andamento | — | — | — | — | — | Sim | — |
| Registrar vistoria e marcar Cumprida ou Não comparecimento (paga ou gratuita) | — | — | — | — | Sim | Sim | — |
| Abrir chamados de limpeza e manutenção | Sim | Sim | Sim | Sim | — | Sim | — |
| Atender e concluir chamados de limpeza (também offline) | — | — | — | — | Sim | — | — |
| Acompanhar chamados de manutenção | — | Sim | Sim | Sim | — | — | — |
| Indicar empresa, mudar status e concluir chamados de manutenção | — | Sim | Sim | Em substituição | — | — | — |
| Avaliar o atendimento dos chamados que abriu | Sim | Sim | — | Sim | — | — | — |
| Consultar avaliações de atendimento por funcionário e empresa | — | Sim | Sim | Em substituição | — | — | Só o agregado |
| Ver as próprias avaliações de atendimento, sem identificar quem avaliou | — | — | — | — | Sim | — | — |
| Ver encomendas com prazo de guarda vencido | — | Sim | Sim | Sim | — | Sim | — |
| Registrar reclamação contra funcionário ou unidade | Sim | Sim | — | Sim | — | — | — |
| Julgar reclamações | — | Sim, exceto contra si | Sim, exceto contra si | Contra o síndico; todas em substituição, exceto contra si | — | — | Nos casos de RN-RC-03 e RN-RC-07 |
| Ver score do reclamante e do alvo | — | Sim | Sim | Nas reclamações que julga | — | — | Sim |
| Consultar todas as reclamações | — | Sim, exceto contra si | Sim, exceto contra si | Em substituição, exceto contra si | — | — | Sim |
| Recorrer de decisão que tirou seus pontos | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Ver o próprio score e histórico | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Ver score do síndico e nota dos setores | Sim | Sim | Sim | Sim | Sim | Sim | Sim |
| Avaliar funcionários na pesquisa mensal | Sim | Sim | — | Sim | — | — | — |
| Enviar comunicados gerais e individuais | — | Sim | Sim | Em substituição | — | — | — |
| Sugerir comunicado ao síndico | — | — | — | Sim, fora da substituição | — | — | — |
| Responder comunicado individual | Sim | — | — | Sim | Sim | Sim | — |
| Denunciar conteúdo ofensivo | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Convocar reuniões, criar pautas e encerrar votações | — | Sim | Sim | Em substituição | — | — | — |
| Registrar votos presenciais | — | Sim | Sim | Sim | — | — | — |
| Votar ou indicar procurador (proprietário; o inquilino vota como procurador ou nas pautas sem despesa extraordinária) | Sim | Sim | — | Sim | — | — | — |
| Ativar substituição do síndico | — | Sim | Sim | — | — | — | Sim |
| Solicitar cadastro, alteração ou remoção | — | Sim | Sim | Em substituição | — | — | — |
| Fazer cadastros e configurações | — | — | — | — | — | — | Sim |
| Ver lista de entrada bloqueada | — | Sim | Sim | Sim | — | Sim | Sim |
| Ver score dos funcionários | — | Sem administradora | Sem administradora | Sem administradora | — | — | Sim |
| Configurar cobrança e formas de pagamento | — | — | — | — | — | — | Sim |
| Ver e pagar cobranças da própria unidade | Responsável financeiro | Responsável financeiro | — | Responsável financeiro | — | — | — |
| Ver painel de inadimplência | — | Sim | Sim | Em substituição | — | — | Sim |
| Solicitar cobrança extra | — | Sim | Sim | Em substituição | — | — | — |
| Lançar receitas e despesas, fechar o mês e estornar lançamentos | — | — | — | — | — | — | Sim |
| Ver as finanças do condomínio (resumo, categorias, evolução e lançamentos) | — | Sim | Sim | Em substituição | — | — | Sim |
| Comentar lançamentos e meses das finanças | — | Sim | Sim | Em substituição | — | — | — |
| Exportar as finanças (CSV e PDF) | — | Sim | Sim | Em substituição | — | — | Sim |

**Perfis fora da matriz**

- **Suporte da plataforma:** no plano Gestão + Suporte, as mesmas permissões da coluna Administradora, exceto julgar reclamações, consultar reclamações e ver scores.
- **Conselho fiscal:** julga reclamações e recursos nos casos das tabelas 5.1 e 5.3 das Regras de Negócio e de RN-RC-14; nessas reclamações, vê identidade e score do reclamante e do alvo e conversa com o alvo. Os membros também são moradores e mantêm as permissões de morador. Em Menu > Finanças do condomínio, veem as finanças em modo leitura (sem valor de cada unidade), comentam e exportam, como o síndico (RF-FI-17, RF-FI-22, RF-FI-24).
- **Admin da plataforma:** atua só no painel da plataforma (condomínios, planos e acessos de suporte).
- **Proprietário não residente:** "Votar ou indicar procurador" e "Ver e pagar cobranças da própria unidade" (as de que é responsável financeiro). Também lê comunicados gerais, acompanha o contrato de locação e as multas e reclamações validadas contra a unidade e pede o cadastro, a renovação ou o encerramento do inquilino. Não reserva, não abre chamados, não reclama, não avalia funcionários e não vê a rotina do inquilino (RN-CD-19).
- **Julgador de reclamação:** quem julga, seja quem for, pode iniciar a conversa com o alvo (RN-CO-04), mesmo sem permissão para enviar comunicados.

## 4. Requisitos funcionais

São 138 requisitos em 13 módulos, cada um com ID para histórias de usuário, tarefas e testes.

### 4.1 Acesso e conta

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-AC-01 | No primeiro acesso, enviar código ao e-mail pré-cadastrado; validado, o usuário cria a senha | Todos | Código de 6 dígitos, válido por 15 min, até 5 tentativas; reenvio após 60 s; mesma mensagem para e-mail cadastrado ou não; senha com no mínimo 8 caracteres |
| RF-AC-02 | Aceitar termos de uso, política de privacidade e regimento do condomínio | Todos | Versão e data do aceite guardadas; novo aceite quando mudarem |
| RF-AC-03 | Recuperar senha por e-mail | Todos | Mesmo fluxo do código de primeiro acesso |
| RF-AC-04 | Escolher a unidade ativa; painéis e métricas separados por unidade | Quem tem mais de uma unidade | Seletor no topo da tela inicial |
| RF-AC-05 | Alternar tema claro e escuro | Todos | Opções "Igual ao aparelho" (padrão), "Claro" e "Escuro"; a escolha fica salva |
| RF-AC-06 | Acessar o app pelo navegador (versão web) | Administradora, Suporte, Síndico | Mesmo código do app, via React Native Web |
| RF-AC-07 | Exibir a página "Como funciona" com as regras de score, reclamações e recursos, aceita junto com o regimento | Todos | Texto revisado pelo parecer jurídico (SEG-16); sempre acessível no menu |
| RF-AC-08 | Onboarding guiado no primeiro acesso, por perfil | Todos | 3 a 5 telas mostrando as tarefas principais do perfil; pode ser pulado e revisto depois |

### 4.2 Administração do condomínio

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-AD-01 | Pré-cadastrar moradores, funcionários, síndico e subsíndico | Administradora, Suporte | Individual ou por planilha |
| RF-AD-02 | Solicitar cadastro, alteração ou remoção de moradores e funcionários | Síndico | Fila com status: pendente, concluída, recusada |
| RF-AD-03 | Atender ou recusar solicitação, com motivo | Administradora, Suporte | Síndico notificado do resultado |
| RF-AD-04 | Definir o morador habilitado de cada unidade | Administradora | Um por unidade; trocas registradas com data |
| RF-AD-05 | Registrar mudança de morador | Administradora | Acesso desativado, histórico mantido, reservas futuras e visitas recorrentes canceladas |
| RF-AD-06 | Cadastrar e desligar funcionários, próprios ou terceirizados | Administradora | Campo "empresa" para terceirizados; chamados abertos voltam à fila do setor |
| RF-AD-07 | Cadastrar áreas comuns como pagas ou gratuitas, com regras | Administradora | Herança de regras: padrão da plataforma → condomínio → área |
| RF-AD-08 | Cadastrar a conta bancária que recebe pagamentos de reservas e da taxa condominial | Administradora | CNPJ do condomínio recomendado; conta de pessoa física exige aceite de termos específicos |
| RF-AD-09 | Registrar mandatos de síndico e subsíndico | Administradora | Bloqueia síndico e subsíndico da mesma unidade |
| RF-AD-10 | Configurar regras de reeleição do síndico morador | Administradora | Padrão: reeleição permitida, como na lei |
| RF-AD-11 | Registrar contratação, recontratação ou desligamento de síndico profissional | Administradora | Sem regra de reeleição |
| RF-AD-12 | Encerrar mandato antes do prazo (renúncia ou destituição) | Administradora | O subsíndico assume até a nova eleição |
| RF-AD-13 | Ativar e desativar a substituição do síndico pelo subsíndico | Administradora, Síndico | Desativação a qualquer momento; registrada no histórico |
| RF-AD-14 | Cadastrar empresas de manutenção | Administradora, Síndico | Nome, serviço e telefone; sem login |
| RF-AD-15 | Manter lista de pessoas com entrada bloqueada | Administradora | Nome, documento e motivo |
| RF-AD-16 | Contar solicitações de suporte por mês | Sistema | Plano Gestão + Suporte: franquia mensal de 10 (até 150 unidades), 25 (151 a 300) ou 50 (301 a 600), sob consulta acima de 600; excedente cobrado a R$ 15 por solicitação |
| RF-AD-17 | Cadastrar blocos (torres ou quadras) e portarias | Administradora, Suporte | Cada portaria atende todos os blocos ou só os escolhidos; unidades vinculadas a um bloco |
| RF-AD-18 | Cadastrar o inquilino com as datas de início e fim do contrato de locação | Administradora, Suporte | O inquilino vira morador habilitado e o proprietário passa a não residente; sem data de fim, prazo indeterminado; dependentes vinculados ao inquilino (RN-CD-20) |
| RF-AD-19 | Pedir o cadastro, a renovação ou o encerramento do inquilino | Proprietário não residente | Mesma fila de RF-AD-02; conta como solicitação no Gestão + Suporte (RN-CD-23) |
| RF-AD-20 | Avisar o fim do contrato e desativar o inquilino sem renovação | Sistema | Aviso 30 dias antes; desativação 7 dias após o fim; a unidade fica desocupada (RN-CD-21) |
| RF-AD-21 | Marcar a unidade como desocupada | Administradora, Suporte | Sem morador habilitado; o proprietário vota e paga tudo; sem reservas, visitantes nem chamados (RN-CD-24) |

### 4.3 Reservas

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-RE-01 | Ver disponibilidade das áreas em calendário | Morador | Horário reservado aparece como "ocupado", sem nome ou unidade; cada estado identificado por texto, não só por cor |
| RF-RE-02 | Fazer reserva gratuita | Morador | Confirmação imediata se as regras forem cumpridas; na confirmação, sugere montar a lista de visitantes quando a reserva é futura e ainda não tem lista, inclusive na paga depois da aprovação do pagamento (RN-RE-12) |
| RF-RE-03 | Fazer reserva paga | Morador | Horário bloqueado até o fim do prazo de pagamento |
| RF-RE-04 | Cancelar com reembolso até 12h antes do início | Morador | Prazo configurável por condomínio e área |
| RF-RE-05 | Cancelar sem reembolso depois do prazo | Morador | Libera a área para outros moradores |
| RF-RE-06 | Bloquear reservas gratuitas para a pessoa com score baixo naquela unidade | Sistema | Áreas gratuitas aparecem indisponíveis para ela pela unidade ativa; outras pessoas e outros vínculos de unidade não são bloqueados (RN-SC-09, RN-SC-10) |
| RF-RE-07 | Configurar prazos, antecedência, limites e valores | Administradora | Por condomínio e por área |
| RF-RE-08 | Consultar reservas do dia e acompanhar o uso; registrar vistoria e conclusão | Portaria; Limpeza na vistoria | Portaria vê área, horário, unidade e estado, sem dados financeiros; marca Em andamento ao constatar uso a partir do início. Ao fim do uso, portaria ou limpeza registra checklist/fotos e Cumprida; dano vira reclamação contra unidade. Não exige marcação prévia Em andamento nem libera antes o intervalo reservado; ações exigem internet (RN-RE-09, RN-RE-13) |
| RF-RE-09 | Registrar Não comparecimento em reserva paga ou gratuita na vistoria | Limpeza, Portaria | Após o término do horário; só faltas gratuitas entram na contagem e penalidade de RN-RE-10. Paga não usada não gera penalidade nem reembolso automático |

### 4.4 Pagamentos

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-PG-01 | Pagar reserva por Pix ou cartão no app | Morador | Pix como opção principal |
| RF-PG-02 | Repassar o valor à conta bancária do condomínio | Sistema | Subconta ou split do gateway |
| RF-PG-03 | Reembolsar automaticamente cancelamentos dentro do prazo | Sistema | Pix em até 2 dias úteis; cartão estornado pela operadora |
| RF-PG-04 | Emitir comprovante de pagamento e de reembolso | Sistema | Por e-mail e no histórico |

### 4.5 Visitantes

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-VI-01 | Cadastrar visitante avulso a qualquer momento antes da chegada | Morador | Nome obrigatório, documento opcional, data da visita (padrão: hoje); aparece na portaria em tempo real; sem entrada até o fim do dia, fica "não compareceu" |
| RF-VI-02 | Cadastrar visitante recorrente com dias da semana | Morador | Faixa de horário e data de término opcionais |
| RF-VI-03 | Editar ou cancelar visitantes | Morador | Atualiza a portaria na hora |
| RF-VI-04 | Ver a lista de visitantes em tempo real | Portaria | Busca por nome, unidade e bloco; filtro "esperados hoje"; cada portaria vê os blocos que atende |
| RF-VI-05 | Consultar a lista do dia sem internet, com a hora da última sincronização | Portaria | Cópia salva no aparelho |
| RF-VI-06 | Registrar entrada e saída, também sem internet | Portaria | Registros offline sincronizam ao voltar a conexão |
| RF-VI-07 | Registrar entrada de visitante não cadastrado, autorizado pelo morador por interfone | Portaria | Status "autorizado por interfone" |
| RF-VI-08 | Encerrar a visita com status "saída não registrada" 24h após a entrada | Sistema | Sem horário de saída |
| RF-VI-09 | Alertar a portaria quando o visitante estiver na lista de bloqueio | Sistema | Alerta na busca e no registro de entrada |
| RF-VI-10 | Notificar o morador da entrada do visitante | Sistema | Push |
| RF-VI-11 | Avisar o porteiro de divergência ao sincronizar e exigir confirmação por interfone com o morador que cadastrou o visitante | Sistema, Portaria | Ex.: entrada registrada offline de visitante cancelado pelo morador; o aviso só fecha após a confirmação |
| RF-VI-12 | Modo de treinamento da portaria, com visitantes e encomendas fictícios | Portaria | Não afeta dados reais; usado no treinamento da implantação e de novos porteiros |
| RF-VI-13 | Cadastrar hóspede de temporada em unidade desocupada | Proprietário não residente | Só se o condomínio permitir (desligado por padrão); data de entrada e de saída; marcado na portaria como "hóspede de temporada" (RN-VI-10) |
| RF-VI-14 | Montar lista de visitantes | Morador | Pessoas adicionadas e removidas na mesma tela, com data, horário e local preenchidos uma vez; colar vários nomes; recentes e frequentes com um toque; salvar a lista para reutilizar; limite de pessoas por lista e aviso de capacidade da área; origem opcional (ex.: reserva, com data e local pré-preenchidos); cada pessoa vira visitante avulso (RN-VI-11 a RN-VI-16) |
| RF-VI-15 | Ver as pessoas de uma lista agrupadas e dar entrada individual | Portaria | Nome da lista, unidade e contador "N pessoas, M chegaram"; entrada e saída por pessoa; o morador recebe o aviso agrupado (RN-VI-17) |

### 4.6 Encomendas

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-EN-01 | Registrar encomenda recebida | Portaria | Unidade, remetente e foto opcional da etiqueta |
| RF-EN-02 | Notificar o morador | Sistema | Push imediato |
| RF-EN-03 | Registrar retirada e quem retirou | Portaria | — |
| RF-EN-04 | Lembrar o morador de retirar | Sistema | Lembretes em 3 e 7 dias; prazo final de guarda de 30 dias (configurável) |
| RF-EN-05 | Listar encomendas com prazo de guarda vencido e marcar a devolução | Síndico, Subsíndico | O subsíndico só vê, exceto na substituição (RN-EN-04) |
| RF-EN-06 | Avisar uma entrega esperada | Morador, Síndico morador, Subsíndico | Data esperada obrigatória; descrição, faixa de horário e origem opcionais; limite por unidade; iFood/entregador é só aviso à portaria, sem registro de encomenda (RN-EN-07, RN-EN-08, RN-EN-12) |
| RF-EN-07 | Ver as entregas esperadas do dia e vinculá-las ao registrar a encomenda | Portaria | "Esperadas hoje" por faixa de horário; sugestão automática do vínculo por unidade e origem; o morador recebe o push normal da encomenda; a entrega esperada não autoriza nem é exigida (RN-EN-10, RN-EN-11) |
| RF-EN-08 | Editar, cancelar e reagendar entregas esperadas; marcar "Não chegou" | Morador, Síndico morador, Subsíndico, Sistema | Rotina diária à meia-noite; reagendar volta a "Esperada" (RN-EN-09, RN-EN-13) |

### 4.7 Chamados

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-CH-01 | Abrir chamado de limpeza ou manutenção, com foto | Morador, Síndico, Portaria | Categorias por tipo (ex.: piscina, jardim, ar-condicionado) |
| RF-CH-02 | Ver e concluir chamados de limpeza | Limpeza | Fotos opcionais do serviço feito, até 5 (RN-CH-14) |
| RF-CH-03 | Consultar e concluir chamados de limpeza sem internet | Limpeza | Conclusões sincronizam ao voltar a conexão; no mesmo ciclo, vale o menor horário registrado pelo celular, mesmo se enviado depois, com histórico e aviso da correção (RN-CH-04) |
| RF-CH-04 | Acompanhar chamados de manutenção, indicar a empresa e concluir | Síndico; Subsíndico só acompanha, exceto na substituição | Status: aberto, orçamento, agendado, concluído; fotos opcionais do serviço na conclusão (RN-CH-14) |
| RF-CH-05 | Acompanhar o status, ver as fotos do serviço concluído e reabrir em até 48h | Quem abriu | Notificação na conclusão, que convida a avaliar o atendimento (RF-CH-08) |
| RF-CH-06 | Classificar a urgência ao abrir o chamado (alta, média ou leve), ver a urgência em cores nas listas e no detalhe, e ver as listas em ordem de urgência (abertos antes dos concluídos; empate, o mais antigo primeiro) | Quem abre; todos os que veem o chamado | Obrigatória; textos de ajuda com exemplos no formulário; alta em vermelho, média em amarelo e leve em verde, sempre com texto; ordem na exibição (RN-CH-13) |
| RF-CH-07 | Ajustar a urgência de um chamado já aberto | Síndico; Subsíndico só na substituição | Fica registrado (quem, quando, de/para) e quem abriu é avisado |
| RF-CH-08 | Avaliar o atendimento de um chamado concluído, com 1 a 5 estrelas e comentário opcional, informando se viu as fotos ou conferiu pessoalmente | Quem abriu (morador, síndico morador, subsíndico) | Até 7 dias após a conclusão, uma avaliação por conclusão, sem edição; lembrete único em 24h. Correção tardia offline preserva avaliação superada somente no histórico e permite avaliar a conclusão efetiva, sem transferir nota entre funcionários (RN-CH-15 a RN-CH-17) |
| RF-CH-09 | Oferecer reabrir o chamado após avaliação baixa (1 ou 2 estrelas) e avisar o síndico | Sistema | Não reabre sozinho; reabrir segue as 48h de RN-CH-07; o aviso nunca vai ao funcionário (RN-CH-18) |
| RF-CH-10 | Consultar as avaliações do atendimento, agregadas por funcionário de limpeza e por empresa de manutenção | Síndico (Subsíndico na substituição); Administradora só o agregado | Média, quantidade e distribuição por estrelas; comentário só no detalhe do chamado, para o síndico (RN-CH-19) |
| RF-CH-11 | Ver as próprias avaliações recebidas, com média, distribuição e comentários anônimos | Funcionário | Só com 3 ou mais avaliações; sem unidade, morador, chamado nem local; sem efeito no score (RN-CH-20, RN-CH-21) |

### 4.8 Reclamações e score

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-RS-01 | Registrar reclamação identificada contra um funcionário, uma unidade, o síndico ou o subsíndico | Morador | Um alvo por reclamação, do mesmo condomínio; categoria, descrição, data e foto opcional |
| RF-RS-02 | Classificar por categoria com gravidade padrão | Sistema | Categorias e gravidade nas Regras de Negócio, 5.4 |
| RF-RS-03 | Painel de reclamações com o score do reclamante e do alvo | Julgador (síndico, subsíndico, administradora ou conselho fiscal) | Ordenar por data e por score |
| RF-RS-04 | Encaminhar reclamações contra o síndico ao subsíndico, e contra o subsíndico ao síndico | Sistema | Automático |
| RF-RS-05 | Conversar com o alvo antes da decisão | Julgador | Comunicado individual vinculado à reclamação; decisão liberada com a resposta do alvo ou após 5 dias sem resposta (RN-RC-04) |
| RF-RS-06 | Validar ou negar; ao negar, informar o motivo | Julgador | Lista de motivos + texto livre |
| RF-RS-07 | Notificar o alvo sem revelar quem reclamou | Sistema | Na abertura e na decisão |
| RF-RS-08 | Aplicar pontos ao alvo ou ao reclamante conforme a decisão | Sistema | Ver Regras de Negócio, 4.1 |
| RF-RS-09 | Recorrer uma vez, em até 7 dias, de decisão que tirou pontos | Quem perdeu pontos | Ver RN-RC-07 |
| RF-RS-10 | Recuperar +5 pontos a cada 2 meses de regularidade, até 100 | Sistema | Rotina diária; reclamação validada ou penalidade por reclamação falsa reinicia o período |
| RF-RS-11 | Ver o próprio score e o histórico de ganhos e perdas | Quem tem score | Morador: saldo, histórico e recuperação do vínculo da unidade ativa, com identificação da unidade; cada novo vínculo começa em 100. Funcionário e síndico profissional sem unidade: score individual por condomínio (RN-SC-13, RN-SC-14) |
| RF-RS-12 | Ver o score do síndico e a nota de cada setor | Todos | Tela "Transparência"; síndico morador mostra o score da unidade vinculada ao mandato, sem juntar os outros imóveis; profissional sem unidade mostra o funcional do condomínio (RN-SC-02) |
| RF-RS-13 | Consultar todas as reclamações, com identidade e score do reclamante e do alvo | Administradora | Inclusive contra síndico e subsíndico |
| RF-RS-14 | Filtrar palavras ofensivas e denunciar conteúdo | Todos | Denúncia vai ao síndico |
| RF-RS-15 | Avisar o proprietário não residente de reclamação validada contra a unidade | Sistema | Categoria, data, decisão e multa; sem a conversa e sem quem reclamou (RN-RC-16) |
| RF-RS-16 | Mostrar o semáforo do prazo de decisão nas reclamações aguardando decisão | Quem reclamou; julgador | Verde (no prazo), amarelo (últimos 25% do prazo) e vermelho (esgotado), sempre com texto; na lista e no detalhe; sem semáforo em reclamação pendente ou já decidida (RN-RC-17 a RN-RC-19) |

### 4.9 Comunicação

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-CO-01 | Enviar comunicado geral por público (moradores, funcionários, todos) | Síndico | Confirmação de leitura |
| RF-CO-02 | Enviar comunicado individual com resposta | Síndico | Conversa registrada no histórico |
| RF-CO-03 | Responder comunicado individual | Destinatário | Síndico notificado da resposta |
| RF-CO-04 | Sugerir comunicado ao síndico | Subsíndico | O síndico revisa, edita e envia, ou descarta; o subsíndico é avisado (RN-CO-05) |

### 4.10 Reuniões, votações e eleições

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-VO-01 | Convocar reunião com data, local e pautas | Síndico | Cada pauta é informativa ou com votação; opções e quórum definidos pelo síndico |
| RF-VO-02 | Votar em cada pauta, um voto por unidade | Proprietário | O voto vale pela unidade inteira; votação aberta da convocação até o encerramento da reunião (RN-VO-01) |
| RF-VO-03 | Indicar procurador para uma votação | Proprietário | Antes de a unidade votar; procurador é usuário do mesmo condomínio (pode ser o inquilino) e representa no máximo 1 unidade além das suas |
| RF-VO-04 | Registrar votos presenciais por unidade | Síndico, Subsíndico | Junto com a ata; o subsíndico registra nas reuniões convocadas pelo síndico |
| RF-VO-05 | Abrir eleição de síndico e subsíndico com candidaturas | Síndico, Administradora | Inscrição no app, com prazo |
| RF-VO-06 | Bloquear candidaturas inelegíveis | Sistema | Mesma unidade do outro cargo; reeleição conforme a configuração do condomínio |
| RF-VO-07 | Exibir resultado só após o encerramento | Todos | Voto secreto; contagem por opção |
| RF-VO-08 | Abrir segundo turno em caso de empate | Sistema | Entre os empatados, em até 7 dias |
| RF-VO-09 | Anexar ata e lista de presença | Síndico | PDF anexado à reunião |
| RF-VO-10 | Marcar cada pauta com votação como "envolve despesa extraordinária" ou não | Síndico | Padrão: envolve (RN-VO-18) |
| RF-VO-11 | Votar pela unidade alugada nas pautas sem despesa extraordinária | Inquilino (morador habilitado) | Vale se o proprietário não votar até o encerramento; o voto do proprietário substitui o do inquilino, que é avisado (RN-VO-18) |

### 4.11 Pesquisa mensal

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-PE-01 | Avaliar cada funcionário ativo no mês com 1 a 5 estrelas | Morador | Opcional; pode pular quem não conhece; comentário opcional |
| RF-PE-02 | Ajustar o score do funcionário pela média mensal | Sistema | Ver RN-PE-05 |
| RF-PE-03 | Calcular a nota do setor como média das notas dos funcionários | Sistema | Fechamento no último dia do mês |
| RF-PE-04 | Exibir a nota do setor a todos quando ele tiver 2 ou mais funcionários avaliados | Sistema | Notas individuais visíveis só ao próprio funcionário |

### 4.12 Notificações e LGPD

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-NO-01 | Push para visitante, encomenda, reserva, chamado, comunicado, votação e reclamação | Todos | O usuário escolhe quais receber, exceto as obrigatórias |
| RF-LG-01 | Pedir cópia dos próprios dados | Todos | Envio por e-mail em até 15 dias |
| RF-LG-02 | Pedir exclusão da conta | Todos | Histórico anonimizado; votos e reclamações mantidos sem identificação |

### 4.13 Cobrança condominial e finanças do condomínio

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-FI-01 | Ativar ou desativar o módulo de cobrança no condomínio | Administradora, Suporte | Opcional: quem usa o sistema da própria administradora pode deixar desligado |
| RF-FI-02 | Escolher as formas de pagamento aceitas: boleto (com QR Code Pix), Pix e cartão de crédito | Administradora, Suporte | Ao menos uma forma ativa |
| RF-FI-03 | Definir o valor da taxa de cada unidade e o dia de vencimento | Administradora, Suporte | Valor fixo ou por fração ideal; vencimento padrão no dia 10 |
| RF-FI-04 | Definir o responsável financeiro de cada unidade, um para as despesas ordinárias e outro para as extraordinárias | Administradora, Suporte | Padrão: morador habilitado nas duas; na unidade alugada, inquilino nas ordinárias e proprietário nas extraordinárias; na desocupada, proprietário nas duas (RN-FI-03) |
| RF-FI-05 | Gerar as cobranças mensais automaticamente | Sistema | 15 dias antes do vencimento |
| RF-FI-06 | Lançar cobranças extras (rateio, fundo de reserva, multa por infração) | Administradora, Suporte | Para uma, várias ou todas as unidades; o síndico solicita |
| RF-FI-07 | Emitir boleto registrado com QR Code Pix, Pix e pagamento por cartão | Sistema | Pelo gateway; segunda via sempre com valor atualizado |
| RF-FI-08 | Ver as cobranças da unidade, pagar no app e baixar comprovantes | Responsável financeiro | Histórico completo da unidade |
| RF-FI-09 | Dar baixa automática quando o pagamento é confirmado | Sistema | Confirmação por webhook do gateway |
| RF-FI-10 | Registrar pagamento feito fora do app | Administradora, Suporte | Com comprovante anexado e motivo |
| RF-FI-11 | Lembrar o responsável antes e depois do vencimento | Sistema | 5 dias antes, no dia, 1 e 7 dias depois |
| RF-FI-12 | Calcular multa e juros por atraso | Sistema | Padrão: multa de 2% e juros de 1% ao mês, proporcionais aos dias |
| RF-FI-13 | Painel de inadimplência | Administradora, Síndico | Unidades em atraso, valor e dias de atraso |
| RF-FI-14 | Negociar débitos em parcelas (acordo) | Administradora, Suporte | Entrega na versão 2 |
| RF-FI-15 | Exportar cobranças e pagamentos | Administradora | CSV para a contabilidade |
| RF-FI-16 | Classificar cada cobrança como ordinária ou extraordinária | Administradora, Suporte, Sistema | Taxa mensal é ordinária; fundo de reserva e obras vêm como extraordinárias; multa por infração vai a quem paga as ordinárias, com aviso ao proprietário (RN-FI-20) |
| RF-FI-17 | Painel financeiro do condomínio: resumo do mês (receitas, despesas, saldo e comparação com o mês anterior), despesas por categoria e evolução de 6 ou 12 meses | Administradora, Suporte, Síndico, Conselho fiscal | Síndico, conselho fiscal e subsíndico em substituição só leem; gráficos sempre com tabela equivalente (RN-FI-21, RN-FI-29) |
| RF-FI-18 | Lançar como receita, sozinho, o que o condomínio recebe pelo app: cobranças pagas (taxa, fundo de reserva, extras, multas e juros) e reservas pagas | Sistema | Pela data do pagamento confirmado; nunca digitado de novo; taxas do gateway entram como despesa (RN-FI-22, RN-FI-23) |
| RF-FI-19 | Registrar despesa ou receita avulsa com data, categoria, valor, fornecedor ou origem, descrição e comprovante opcional | Administradora, Suporte | Categorias de despesa fixas; receita avulsa só como "Outras receitas"; valor maior que zero; data até hoje e em mês aberto (RN-FI-24, RN-FI-25) |
| RF-FI-20 | Repetir todo mês um lançamento marcado como recorrente | Sistema | Valor fixo (honorários, seguro, aluguel de antena); contas variáveis são digitadas todo mês (RN-FI-26) |
| RF-FI-21 | Filtrar os lançamentos por período, categoria, tipo e texto | Administradora, Suporte, Síndico, Conselho fiscal | Período: um mês, 3, 6 ou 12 meses; os totais acompanham o filtro |
| RF-FI-22 | Exportar o resumo e os lançamentos filtrados em CSV e PDF | Administradora, Suporte, Síndico, Conselho fiscal | CSV para a contabilidade; PDF com resumo, categorias e lançamentos; sem dados de unidade (RN-FI-30) |
| RF-FI-23 | Fechar o mês e estornar lançamentos de mês fechado | Administradora, Suporte, Sistema | Fechamento no dia configurado do mês seguinte ou antes, pela administradora; mês fechado não edita, só estorna, com motivo e registro (RN-FI-27, RN-FI-28) |
| RF-FI-24 | Comentar um lançamento ou o mês, inclusive depois do fechamento | Síndico, Subsíndico em substituição, Conselho fiscal | A administradora é avisada; o comentário não altera valores nem aprova o mês (RN-FI-31) |

## 5. Regras de negócio

As regras completas, com IDs, valores padrão e parâmetros configuráveis, estão nas Regras de Negócio — CondomiFacil, que são a fonte oficial; os critérios de aceite estão nas Histórias de Usuário e Critérios de Aceite — CondomiFacil. Este resumo mostra as principais.

| Tema | Regras principais | Seção nas Regras de Negócio |
| --- | --- | --- |
| Score | Morador: pessoal por vínculo de unidade, começando em 100 a cada novo vínculo, com saldo e regularidade independentes; funcionário e síndico profissional sem unidade: pessoal por condomínio. Reclamações aplicam os pontos apenas ao score do contexto; +5 a cada 2 meses de regularidade; score menor ou igual a 60 bloqueia reservas gratuitas só daquela pessoa/unidade | 4 |
| Reclamações | Identificadas, mas o alvo não vê quem reclamou; um alvo do mesmo condomínio; julgador definido pelo alvo; conversa obrigatória antes de decidir; um recurso em até 7 dias | 5 |
| Pesquisa mensal | 1 a 5 estrelas por funcionário; média abaixo de 3 tira 5 pontos, 4,5 ou mais dá 5; nota do setor publicada com 2 ou mais funcionários avaliados | 6 |
| Reservas e pagamentos | Pagas ou gratuitas; confirmação automática; pagamento em até 24h; cancelamento com reembolso até 12h antes e sem reembolso depois; dinheiro direto na conta do condomínio | 7 |
| Visitantes e portaria | Cadastro a qualquer momento antes da chegada; lista de visitantes para festas e eventos; visitas recorrentes; autorização por interfone continua valendo; consulta e registro offline; "saída não registrada" após 24h | 8 |
| Encomendas e chamados | Lembretes em 3 e 7 dias e guarda de 30 dias; limpeza em 24h; manutenção com primeira atualização em 48h | 9 |
| Votações e mandatos | Um voto por unidade, do proprietário; o inquilino vota como procurador ou nas pautas sem despesa extraordinária; voto secreto; reeleição configurável, permitida por padrão; conselho fiscal obrigatório sem subsíndico | 10 |
| Planos | Preço por faixa de unidades; franquia de 10, 25 ou 50 solicitações no Gestão + Suporte; R$ 15 por solicitação extra | 11 |
| Cobrança condominial | Módulo opcional; formas de pagamento escolhidas pela administradora; vencimento padrão dia 10; multa de até 2% e juros de 1% ao mês; inadimplência visível só a quem administra; unidade em atraso não vota; na unidade alugada, o inquilino paga as despesas ordinárias e o proprietário as extraordinárias | 12 |
| Finanças do condomínio | Receitas de cobrança e de reservas entram sozinhas, pela data do pagamento; despesas por categoria lançadas pela administradora; mês fechado só aceita estorno, com motivo e registro; síndico, subsíndico em substituição e conselho fiscal veem e comentam; moradores não veem | 12.3 |

## 6. Fluxo da reclamação

O fluxo completo, com diagramas e caminhos de erro, está no User Flows — CondomiFacil (`docs/02-design/02-user-flows.md`, seções 9.1 a 9.3). Em resumo, são três decisões:

1. **Quem julga.** Definido na abertura pela tabela 5.1 das Regras de Negócio: em regra o síndico; o subsíndico quando o alvo é o síndico; administradora ou conselho fiscal quando não há julgador sem conflito.
2. **Validar ou negar.** O julgador só decide depois de ouvir o alvo, ou após 5 dias sem resposta. A negativa por motivo punitivo (desproporcional ou falsa) é o único caminho em que o reclamante perde pontos.
3. **Recurso.** Quem perdeu pontos recorre uma vez, em até 7 dias, a um julgador que não seja parte da reclamação (RN-RC-14).

## 7. Requisitos não funcionais

O app funciona online, com duas exceções offline: a portaria (consulta e registro de visitantes) e a equipe de limpeza (chamados).

| ID | Requisito | Meta |
| --- | --- | --- |
| RNF-01 | Tempo de resposta da API | 95% das requisições em menos de 500 ms |
| RNF-02 | Abertura do app em celular de entrada | Tela utilizável em até 3 s no 4G, em aparelho com 3 GB de RAM |
| RNF-03 | Plataformas | Android 9+, iOS nas duas últimas versões principais e navegadores Chrome, Safari e Edge atuais |
| RNF-04 | Tamanho do app | Download abaixo de 30 MB |
| RNF-05 | Tempo real | Novo visitante aparece na portaria em até 5 s |
| RNF-06 | Offline da portaria | Lista do dia salva no aparelho; entradas e saídas registradas offline; hora da última sincronização sempre visível |
| RNF-07 | Offline da limpeza | Chamados abertos do setor salvos no aparelho; conclusões registradas offline |
| RNF-08 | Sincronização | Itens offline enviados automaticamente ao voltar a conexão, com indicação de pendências |
| RNF-09 | Disponibilidade | 99,5% ao mês |
| RNF-10 | Escalabilidade | 100 condomínios e 15.000 usuários no lançamento, sem mudança de arquitetura; um único condomínio com até 5.000 unidades e 10 portarias sem perda de desempenho |
| RNF-11 | Isolamento | Dados de um condomínio nunca visíveis a outro |
| RNF-12 | Acessibilidade | WCAG 2.2 AA nos dois temas: contraste de 4,5:1 para texto e 3:1 para ícones e componentes; área de toque mínima de 48 × 48 dp (56 dp nos botões da portaria); fonte ampliada até 200%; uso completo com TalkBack e VoiceOver (detalhes no Design System — CondomiFacil) |
| RNF-13 | Backup | Diário, retenção de 7 dias, teste de restauração mensal |
| RNF-14 | Idioma | Português do Brasil |
| RNF-15 | Simplicidade | Tarefas comuns (reservar, cadastrar visitante, abrir chamado, registrar entrada) em até 3 toques a partir da tela inicial; contagem conforme o Design System — CondomiFacil, seção 2 |
| RNF-16 | Testes do modo offline | Testes automatizados de queda de conexão, fila de sincronização e divergências, executados a cada versão |
| RNF-17 | Teste de carga | Antes do lançamento e a cada versão principal: condomínio simulado com 5.000 unidades e 10 portarias simultâneas, mantendo RNF-01 e RNF-05 |
| RNF-18 | Controle de custos | Limite de gasto e alertas em 80% e 100% do orçamento em todos os serviços pagos de infraestrutura |

## 8. Segurança, privacidade e LGPD

O app trata dados pessoais de moradores, funcionários e visitantes, além de votos, reclamações e scores; o condomínio é o controlador dos dados e a plataforma é a operadora.

| ID | Requisito | Implementação |
| --- | --- | --- |
| SEG-01 | Proteger os dados dos usuários | HTTPS em toda comunicação; dados sensíveis criptografados no banco |
| SEG-02 | Esconder chaves de API | Segredos só no servidor, em variáveis de ambiente; nunca dentro do app |
| SEG-03 | Aceite de termos e política de privacidade | Versionado, com data e versão por usuário |
| SEG-04 | Senhas e códigos | Hash Argon2 ou bcrypt; código de e-mail com validade de 15 min e limite de tentativas; login pausado por 15 min após 5 senhas erradas seguidas; mensagens de erro que não revelam se o e-mail está cadastrado |
| SEG-05 | Isolamento entre condomínios | Row Level Security no PostgreSQL |
| SEG-06 | Sigilo do voto | Registro de que a unidade votou separado do conteúdo do voto |
| SEG-07 | Sigilo do score e do reclamante | A API devolve o score só ao dono, exceto nos casos de RN-SC-02; a identidade do reclamante nunca é enviada ao alvo |
| SEG-08 | Auditoria | Registro de julgamentos, recursos, alterações de score, regras, mandatos, substituições, conta bancária, lançamentos financeiros (criação, edição, exclusão, estorno) e fechamentos de mês |
| SEG-09 | Dados offline no aparelho | Cópia criptografada, apagada ao fim do dia e ao sair da conta |
| SEG-10 | Retenção de dados de visitantes | Anonimização após 6 meses |
| SEG-11 | Direitos do titular | Pedidos de acesso e exclusão pelo app (RF-LG-01 e RF-LG-02) |
| SEG-12 | Pagamentos | Gateway certificado; o app nunca guarda dados de cartão |
| SEG-13 | Acesso do suporte da plataforma | Só em condomínios do plano Gestão + Suporte, com registro de cada acesso |
| SEG-14 | Contrato com o condomínio | Contrato padrão definindo condomínio como controlador e plataforma como operadora |
| SEG-15 | Termos para conta bancária de pessoa física | Termo de responsabilidade pelo valor recebido, com texto revisado por advogado, aceito pelo titular no cadastro da conta |
| SEG-16 | Parecer jurídico antes do lançamento | Advogado avalia score, reclamações, penalidades, eleições e termos; o lançamento só acontece com o parecer aprovado |
| SEG-17 | Dados financeiros e inadimplência | Situação financeira de uma unidade visível só ao responsável financeiro, à administradora e ao síndico; nunca exposta a outros moradores. Webhooks do gateway validados por assinatura e conciliação diária entre cobranças e pagamentos |
| SEG-18 | Finanças do condomínio | Receitas e despesas visíveis só à administradora, ao síndico (ou subsíndico em substituição) e ao conselho fiscal; receitas de cobrança sempre agregadas, sem unidade nem responsável; folha de pagamento só pelo total; mês fechado imutável, com estornos e comentários auditados |

## 9. Design e identidade visual

Interface moderna nas cores da marca: azul (#0E359D), branco (#FFFFFF) e coral (#FF606A), em tema claro e escuro; os demais tons (fundo escuro, textos) derivam do azul. Os padrões completos (tokens, tipografia, ícones, componentes, escrita e acessibilidade) estão no Design System — CondomiFacil, que é a fonte oficial de design; esta seção é um resumo.

| Uso | Tema claro | Tema escuro |
| --- | --- | --- |
| Fundo | #FFFFFF | #081B52 |
| Superfície (cards) | #F3F6FC | #0E2766 |
| Barra superior e áreas de marca | #0E359D | #0E359D |
| Botão primário | Fundo #0E359D, texto #FFFFFF | Fundo #FF606A, texto #081B52 |
| Destaques em preenchimento (selos, gráficos, botão flutuante) | #FF606A, com conteúdo #081B52 | #FF606A, com conteúdo #081B52 |
| Texto e ícones de destaque em coral | #C8323F | #FF606A |
| Links | #0E359D | #8FA8F0 |
| Texto principal | #0B1A44 | #FFFFFF |
| Texto secundário | #5A6785 | #B8C4E6 |
| Sucesso / alerta / erro | #2E7D32 / #8F5600 / #C62828 | #66BB6A / #FFB74D / #FF8A8A |

**Contraste (RNF-12).** Todos os pares de texto da tabela passam no WCAG 2.2 AA (4,5:1). Coral sobre branco tem 2,9:1 e não passa nem para texto (4,5:1) nem para ícones e componentes (3:1): no tema claro, o #FF606A só aparece como preenchimento com conteúdo azul-escuro, e texto ou ícone coral usa #C8323F (5,3:1). No tema escuro, coral sobre #081B52 tem 5,5:1 e pode ser usado em texto. O vermelho de erro é diferente do coral e sempre vem com ícone e texto. Nenhuma informação é dada só por cor.

| Tela | Diretriz |
| --- | --- |
| Portaria | Botões de 56 dp, texto de 18 dp, busca por nome, unidade e bloco, no máximo 2 toques para registrar entrada (com "desfazer" em vez de confirmação); faixa de "sem internet" com a hora da última sincronização |
| Limpeza | Chamados em cartões, com botão "concluir" visível sem abrir o chamado |
| Reservas | Calendário com quatro estados (livre, ocupado, indisponível e bloqueado pelo score), cada um com cor e texto |
| Score | Número grande, barra com o limite das reservas gratuitas, histórico de ganhos e perdas e data da próxima recuperação |
| Transparência | Score do síndico e nota de cada setor em cartões |
| Seletor de unidade | Topo da tela inicial, para quem tem mais de uma unidade |
| Versão web (administradora) | Navegação lateral e layout de tabela para telas grandes |

Imagens comprimidas e poucas animações, para rodar bem em celulares fracos. Os fluxos de cada tela, com os caminhos de erro e as mensagens propostas, estão no User Flows — CondomiFacil (`docs/02-design/02-user-flows.md`).

## 10. Stack técnica

App em React Native com TypeScript, publicado para Android, iOS e web (React Native Web) a partir do mesmo código; backend em Node.js com PostgreSQL.

| Camada | Tecnologia |
| --- | --- |
| App (Android e iOS) | React Native + TypeScript, com Expo |
| Versão web (painel da administradora, suporte e síndico) | React Native Web, pelo mesmo projeto Expo |
| Backend / API | Node.js + TypeScript (NestJS) |
| Banco de dados | PostgreSQL, com Row Level Security |
| Tempo real (lista da portaria) | WebSockets |
| Armazenamento offline | Banco local no aparelho (SQLite ou WatermelonDB) com fila de sincronização |
| Autenticação | E-mail + código + senha, com tokens JWT no armazenamento seguro do aparelho |
| Pagamentos | Gateway brasileiro com subconta ou split (ex.: Asaas, Mercado Pago, Pagar.me): boleto registrado com QR Code Pix, Pix e cartão, com confirmação por webhook |
| Notificações | Expo Push / Firebase Cloud Messaging |
| Rotinas agendadas | Jobs no backend: recuperação de score, saída não registrada, prazos de pagamento, fechamento da pesquisa, lembretes de encomenda, entregas esperadas que não chegaram, lançamentos recorrentes e fechamento do mês financeiro |
| Arquivos (fotos, atas) | Armazenamento de objetos (S3 ou equivalente), com fotos comprimidas no aparelho |
| E-mail transacional | Resend ou Amazon SES |
| Monitoramento | Sentry + logs |
