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

## 2. Escopo e planos comerciais

O MVP inclui todos os módulos abaixo, exceto relatórios; o produto é vendido em dois planos, conforme o condomínio tenha ou não administradora.

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
| Acordos de parcelamento de débitos | Versão 2 |

**Fora de escopo:** contabilidade e prestação de contas do condomínio (balancete), integração com catracas e interfones, entregas de comida por aplicativo.

**Planos**

| Plano | Para quem | Inclui | Preço |
| --- | --- | --- | --- |
| Essencial | Condomínios com administradora | App completo; a administradora faz cadastros e configurações | R$ 99 até 30 unidades; R$ 179 de 31 a 80; R$ 299 de 81 a 150; R$ 499 de 151 a 300; R$ 799 de 301 a 600; acima de 600, sob consulta |
| Gestão + Suporte | Condomínios sem administradora | App completo + a equipe da plataforma faz o papel de administradora (cadastros, mudanças de moradores, novas áreas, regras) | Essencial + R$ 150/mês. Solicitações incluídas por mês: 10 até 150 unidades, 25 de 151 a 300, 50 de 301 a 600, sob consulta acima de 600; R$ 15 por solicitação extra |

**Unidade** é cada imóvel privativo do condomínio: apartamento, casa ou sala comercial. Áreas comuns, vagas de garagem e depósitos não contam como unidades.

## 3. Perfis de usuário e permissões

O CondomiFacil tem 10 perfis; síndico e subsíndico são papéis atribuídos por mandato, e cada usuário vê apenas as informações das unidades a que está vinculado.

| Perfil | Quem é |
| --- | --- |
| Morador | Proprietário, inquilino ou dependente vinculado a uma unidade (apartamento, casa ou sala). Cada unidade tem um único morador habilitado, que vota e responde pela unidade |
| Síndico (morador) | Morador eleito; mantém todas as funções de morador |
| Síndico profissional | Contratado, sem unidade e sem funções de morador; contratação e desligamento registrados pela administradora |
| Subsíndico | Morador eleito, de unidade diferente da do síndico. Julga reclamações contra o síndico e assume as funções de síndico quando a substituição é ativada |
| Funcionário de limpeza | Recebe e conclui chamados de limpeza |
| Funcionário de portaria | Controla entradas e saídas, registra encomendas e abre chamados |
| Administradora | Empresa que administra o condomínio; pode atender vários condomínios |
| Suporte da plataforma | Equipe da plataforma; no plano Gestão + Suporte, tem as permissões da administradora naquele condomínio |
| Admin da plataforma | Cadastra condomínios, planos e acessos de suporte |
| Conselho fiscal | Um ou mais membros, cadastrados pela administradora ou pelo suporte; obrigatório em condomínio sem subsíndico. Julgam reclamações e recursos contra o síndico quando o condomínio não tem subsíndico nem administradora |

**Visão por unidade.** O app exibe reservas, visitantes, reuniões, votações e métricas da unidade ativa. Quem tem mais de uma unidade vê um painel separado para cada uma.

**Substituição do síndico.** A administradora ou o próprio síndico ativa a substituição; o subsíndico passa a ter as funções de síndico até a desativação, que pode ser feita a qualquer momento por quem tem esse poder.

**O que a administradora faz**

- Pré-cadastra moradores, funcionários, síndico e subsíndico, e atende as solicitações de cadastro do síndico.
- Mantém unidades e define o morador habilitado de cada uma.
- Registra mudanças de moradores e desligamentos de funcionários.
- Cadastra áreas comuns, regras de reserva, cancelamento e reembolso.
- Cadastra a conta bancária que recebe os pagamentos de reservas e da taxa condominial. Configura a cobrança (valores, vencimento, formas de pagamento), lança cobranças extras e acompanha a inadimplência.
- Registra mandatos de síndico e subsíndico, e contratação ou desligamento de síndico profissional.
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
| Registrar vistoria de área após o uso | — | — | — | — | Sim | Sim | — |
| Abrir chamados de limpeza e manutenção | Sim | Sim | Sim | Sim | — | Sim | — |
| Atender e concluir chamados de limpeza (também offline) | — | — | — | — | Sim | — | — |
| Acompanhar e concluir chamados de manutenção | — | Sim | Sim | Em substituição | — | — | — |
| Registrar reclamação contra funcionário ou unidade | Sim | Sim | — | Sim | — | — | — |
| Julgar reclamações | — | Sim, exceto contra si | Sim, exceto contra si | Contra o síndico; todas em substituição, exceto contra si | — | — | Nos casos de RN-RC-03 e RN-RC-07 |
| Ver score do reclamante e do alvo | — | Sim | Sim | Nas reclamações que julga | — | — | Sim |
| Consultar todas as reclamações | — | Sim, exceto contra si | Sim, exceto contra si | Em substituição, exceto contra si | — | — | Sim |
| Recorrer de decisão que tirou seus pontos | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Ver o próprio score e histórico | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Ver score do síndico e nota dos setores | Sim | Sim | Sim | Sim | Sim | Sim | Sim |
| Avaliar funcionários na pesquisa mensal | Sim | Sim | — | Sim | — | — | — |
| Enviar comunicados gerais e individuais | — | Sim | Sim | Em substituição | — | — | — |
| Responder comunicado individual | Sim | — | — | Sim | Sim | Sim | — |
| Denunciar conteúdo ofensivo | Sim | Sim | Sim | Sim | Sim | Sim | — |
| Convocar reuniões, criar pautas e registrar votos presenciais | — | Sim | Sim | Em substituição | — | — | — |
| Votar ou indicar procurador (morador habilitado) | Sim | Sim | — | Sim | — | — | — |
| Ativar substituição do síndico | — | Sim | Sim | — | — | — | Sim |
| Solicitar cadastro, alteração ou remoção | — | Sim | Sim | Em substituição | — | — | — |
| Fazer cadastros e configurações | — | — | — | — | — | — | Sim |
| Ver lista de entrada bloqueada | — | Sim | Sim | Sim | — | Sim | Sim |
| Ver score dos funcionários | — | Sem administradora | Sem administradora | Sem administradora | — | — | Sim |
| Configurar cobrança e formas de pagamento | — | — | — | — | — | — | Sim |
| Ver e pagar cobranças da própria unidade | Responsável financeiro | Responsável financeiro | — | Responsável financeiro | — | — | — |
| Ver painel de inadimplência | — | Sim | Sim | Em substituição | — | — | Sim |
| Solicitar cobrança extra | — | Sim | Sim | Em substituição | — | — | — |

## 4. Requisitos funcionais

São 107 requisitos em 13 módulos, cada um com ID para histórias de usuário, tarefas e testes.

### 4.1 Acesso e conta

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-AC-01 | No primeiro acesso, enviar código ao e-mail pré-cadastrado; validado, o usuário cria a senha | Todos | Código de 6 dígitos, válido por 15 min, até 5 tentativas |
| RF-AC-02 | Aceitar termos de uso, política de privacidade e regimento do condomínio | Todos | Versão e data do aceite guardadas; novo aceite quando mudarem |
| RF-AC-03 | Recuperar senha por e-mail | Todos | Mesmo fluxo do código de primeiro acesso |
| RF-AC-04 | Escolher a unidade ativa; painéis e métricas separados por unidade | Quem tem mais de uma unidade | Seletor no topo da tela inicial |
| RF-AC-05 | Alternar tema claro e escuro | Todos | Segue o tema do celular por padrão |
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
| RF-AD-08 | Cadastrar a conta bancária que recebe pagamentos de reservas | Administradora | CNPJ do condomínio recomendado; conta de pessoa física exige aceite de termos específicos |
| RF-AD-09 | Registrar mandatos de síndico e subsíndico | Administradora | Bloqueia síndico e subsíndico da mesma unidade |
| RF-AD-10 | Configurar regras de reeleição do síndico morador | Administradora | Padrão: reeleição permitida, como na lei |
| RF-AD-11 | Registrar contratação, recontratação ou desligamento de síndico profissional | Administradora | Sem regra de reeleição |
| RF-AD-12 | Encerrar mandato antes do prazo (renúncia ou destituição) | Administradora | O subsíndico assume até a nova eleição |
| RF-AD-13 | Ativar e desativar a substituição do síndico pelo subsíndico | Administradora, Síndico | Desativação a qualquer momento; registrada no histórico |
| RF-AD-14 | Cadastrar empresas de manutenção | Administradora, Síndico | Nome, serviço e telefone; sem login |
| RF-AD-15 | Manter lista de pessoas com entrada bloqueada | Administradora | Nome, documento e motivo |
| RF-AD-16 | Contar solicitações de suporte por mês | Sistema | Plano Gestão + Suporte: franquia mensal de 10 (até 150 unidades), 25 (151 a 300) ou 50 (301 a 600), sob consulta acima de 600; excedente cobrado a R$ 15 por solicitação |
| RF-AD-17 | Cadastrar blocos (torres ou quadras) e portarias | Administradora, Suporte | Cada portaria atende todos os blocos ou só os escolhidos; unidades vinculadas a um bloco |

### 4.3 Reservas

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-RE-01 | Ver disponibilidade das áreas em calendário | Morador | Horário reservado aparece como "ocupado", sem nome ou unidade |
| RF-RE-02 | Fazer reserva gratuita | Morador | Confirmação imediata se as regras forem cumpridas |
| RF-RE-03 | Fazer reserva paga | Morador | Horário bloqueado até o fim do prazo de pagamento |
| RF-RE-04 | Cancelar com reembolso até 12h antes do início | Morador | Prazo configurável por condomínio e área |
| RF-RE-05 | Cancelar sem reembolso depois do prazo | Morador | Libera a área para outros moradores |
| RF-RE-06 | Bloquear reservas gratuitas para a pessoa com score baixo | Sistema | Áreas gratuitas aparecem indisponíveis para ela, com aviso do motivo |
| RF-RE-07 | Configurar prazos, antecedência, limites e valores | Administradora | Por condomínio e por área |
| RF-RE-08 | Registrar vistoria da área após o uso | Limpeza, Portaria | Checklist com fotos; dano encontrado vira reclamação contra a unidade |
| RF-RE-09 | Registrar não comparecimento em reserva gratuita | Limpeza, Portaria | Usado na regra de faltas (RN-RE-10) |

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
| RF-VI-01 | Cadastrar visitante avulso a qualquer momento antes da chegada | Morador | Nome obrigatório, documento opcional; aparece na portaria em tempo real |
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

### 4.6 Encomendas

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-EN-01 | Registrar encomenda recebida | Portaria | Unidade, remetente e foto opcional da etiqueta |
| RF-EN-02 | Notificar o morador | Sistema | Push imediato |
| RF-EN-03 | Registrar retirada e quem retirou | Portaria | — |
| RF-EN-04 | Lembrar o morador de retirar | Sistema | Lembretes em 3 e 7 dias; prazo final de guarda de 30 dias (configurável) |

### 4.7 Chamados

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-CH-01 | Abrir chamado de limpeza ou manutenção, com foto | Morador, Síndico, Portaria | Categorias por tipo (ex.: piscina, jardim, ar-condicionado) |
| RF-CH-02 | Ver e concluir chamados de limpeza | Limpeza | Foto opcional do serviço feito |
| RF-CH-03 | Consultar e concluir chamados de limpeza sem internet | Limpeza | Conclusões sincronizam ao voltar a conexão |
| RF-CH-04 | Acompanhar chamados de manutenção, indicar a empresa e concluir | Síndico | Status: aberto, orçamento, agendado, concluído |
| RF-CH-05 | Acompanhar o status e reabrir em até 48h | Quem abriu | Notificação na conclusão |

### 4.8 Reclamações e score

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-RS-01 | Registrar reclamação identificada contra um funcionário ou uma unidade | Morador | Um alvo por reclamação, do mesmo condomínio; categoria, descrição, data e foto opcional |
| RF-RS-02 | Classificar por categoria com gravidade padrão | Sistema | Categorias e gravidade nas Regras de Negócio, 5.4 |
| RF-RS-03 | Painel de reclamações com o score do reclamante e do alvo | Síndico, Subsíndico | Ordenar por data e por score |
| RF-RS-04 | Encaminhar reclamações contra o síndico ao subsíndico, e contra o subsíndico ao síndico | Sistema | Automático |
| RF-RS-05 | Conversar com o alvo antes da decisão | Julgador | Comunicado individual vinculado à reclamação |
| RF-RS-06 | Validar ou negar; ao negar, informar o motivo | Julgador | Lista de motivos + texto livre |
| RF-RS-07 | Notificar o alvo sem revelar quem reclamou | Sistema | Na abertura e na decisão |
| RF-RS-08 | Aplicar pontos ao alvo ou ao reclamante conforme a decisão | Sistema | Ver Regras de Negócio, 4.1 |
| RF-RS-09 | Recorrer uma vez, em até 7 dias, de decisão que tirou pontos | Quem perdeu pontos | Ver RN-RC-07 |
| RF-RS-10 | Recuperar +5 pontos a cada 2 meses de regularidade, até 100 | Sistema | Rotina diária; reclamação validada ou penalidade por reclamação falsa reinicia o período |
| RF-RS-11 | Ver o próprio score e o histórico de ganhos e perdas | Todos | Motivo e data de cada alteração |
| RF-RS-12 | Ver o score do síndico e a nota de cada setor | Todos | Tela "Transparência" |
| RF-RS-13 | Consultar todas as reclamações, com identidade e score do reclamante e do alvo | Administradora | Inclusive contra síndico e subsíndico |
| RF-RS-14 | Filtrar palavras ofensivas e denunciar conteúdo | Todos | Denúncia vai ao síndico |

### 4.9 Comunicação

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-CO-01 | Enviar comunicado geral por público (moradores, funcionários, todos) | Síndico | Confirmação de leitura |
| RF-CO-02 | Enviar comunicado individual com resposta | Síndico | Conversa registrada no histórico |
| RF-CO-03 | Responder comunicado individual | Destinatário | Síndico notificado da resposta |

### 4.10 Reuniões, votações e eleições

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-VO-01 | Convocar reunião com data, local e pautas | Síndico | Cada pauta é informativa ou com votação; opções e quórum definidos pelo síndico |
| RF-VO-02 | Votar em cada pauta, um voto por unidade | Morador habilitado | O voto vale pela unidade inteira; votação aberta da convocação até o encerramento da reunião |
| RF-VO-03 | Indicar procurador para uma votação | Morador habilitado | Cada pessoa representa no máximo 1 unidade além da sua |
| RF-VO-04 | Registrar votos presenciais por unidade | Síndico | Junto com a ata |
| RF-VO-05 | Abrir eleição de síndico e subsíndico com candidaturas | Síndico, Administradora | Inscrição no app, com prazo |
| RF-VO-06 | Bloquear candidaturas inelegíveis | Sistema | Mesma unidade do outro cargo; reeleição conforme a configuração do condomínio |
| RF-VO-07 | Exibir resultado só após o encerramento | Todos | Voto secreto; contagem por opção |
| RF-VO-08 | Abrir segundo turno em caso de empate | Sistema | Entre os empatados, em até 7 dias |
| RF-VO-09 | Anexar ata e lista de presença | Síndico | PDF anexado à reunião |

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

### 4.13 Cobrança condominial

| ID | Requisito | Perfil | Detalhe |
| --- | --- | --- | --- |
| RF-FI-01 | Ativar ou desativar o módulo de cobrança no condomínio | Administradora, Suporte | Opcional: quem usa o sistema da própria administradora pode deixar desligado |
| RF-FI-02 | Escolher as formas de pagamento aceitas: boleto (com QR Code Pix), Pix e cartão de crédito | Administradora, Suporte | Ao menos uma forma ativa |
| RF-FI-03 | Definir o valor da taxa de cada unidade e o dia de vencimento | Administradora, Suporte | Valor fixo ou por fração ideal; vencimento padrão no dia 10 |
| RF-FI-04 | Definir o responsável financeiro de cada unidade | Administradora, Suporte | Padrão: morador habilitado; pode ser o proprietário que não mora na unidade |
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

## 5. Regras de negócio

As regras completas, com IDs, valores padrão e parâmetros configuráveis, estão nas Regras de Negócio — CondomiFacil, que são a fonte oficial; os critérios de aceite estão nas Histórias de Usuário e Critérios de Aceite — CondomiFacil. Este resumo mostra as principais.

| Tema | Regras principais | Seção nas Regras de Negócio |
| --- | --- | --- |
| Score | Começa em 100; reclamação validada tira 5, 10 ou 20 pontos do alvo; reclamação desproporcional tira 5 e falsa tira 15 de quem reclamou; +5 a cada 2 meses de regularidade; score menor ou igual a 60 tira o acesso a reservas gratuitas | 4 |
| Reclamações | Identificadas, mas o alvo não vê quem reclamou; um alvo do mesmo condomínio; julgador definido pelo alvo; conversa obrigatória antes de decidir; um recurso em até 7 dias | 5 |
| Pesquisa mensal | 1 a 5 estrelas por funcionário; média abaixo de 3 tira 5 pontos, 4,5 ou mais dá 5; nota do setor publicada com 2 ou mais funcionários avaliados | 6 |
| Reservas e pagamentos | Pagas ou gratuitas; confirmação automática; pagamento em até 24h; cancelamento com reembolso até 12h antes e sem reembolso depois; dinheiro direto na conta do condomínio | 7 |
| Visitantes e portaria | Cadastro a qualquer momento antes da chegada; visitas recorrentes; autorização por interfone continua valendo; consulta e registro offline; "saída não registrada" após 24h | 8 |
| Encomendas e chamados | Lembretes em 3 e 7 dias e guarda de 30 dias; limpeza em 24h; manutenção com primeira atualização em 48h | 9 |
| Votações e mandatos | Um voto por unidade, do morador habilitado; voto secreto; reeleição configurável, permitida por padrão; conselho fiscal obrigatório sem subsíndico | 10 |
| Planos | Preço por faixa de unidades; franquia de 10, 25 ou 50 solicitações no Gestão + Suporte; R$ 15 por solicitação extra | 11 |
| Cobrança condominial | Módulo opcional; formas de pagamento escolhidas pela administradora; vencimento padrão dia 10; multa de até 2% e juros de 1% ao mês; inadimplência visível só a quem administra; unidade em atraso não vota | 12 |

## 6. Fluxo da reclamação

&#91;embedded content: fluxo da reclamação · 3 decisões\]

O julgador (síndico, ou subsíndico quando a reclamação é contra o síndico) só decide depois de conversar com o alvo; a negativa por motivo punitivo é o único caminho em que o reclamante perde pontos.

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
| RNF-12 | Acessibilidade | Contraste WCAG AA nos dois temas; área de toque mínima de 44 px |
| RNF-13 | Backup | Diário, retenção de 7 dias, teste de restauração mensal |
| RNF-14 | Idioma | Português do Brasil |
| RNF-15 | Simplicidade | Tarefas comuns (reservar, cadastrar visitante, abrir chamado, registrar entrada) em até 3 toques a partir da tela inicial |
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
| SEG-04 | Senhas e códigos | Hash Argon2 ou bcrypt; código de e-mail com validade de 15 min e limite de tentativas |
| SEG-05 | Isolamento entre condomínios | Row Level Security no PostgreSQL |
| SEG-06 | Sigilo do voto | Registro de que a unidade votou separado do conteúdo do voto |
| SEG-07 | Sigilo do score e do reclamante | A API devolve o score só ao dono, exceto nos casos de RN-SC-02; a identidade do reclamante nunca é enviada ao alvo |
| SEG-08 | Auditoria | Registro de julgamentos, recursos, alterações de score, regras, mandatos, substituições e conta bancária |
| SEG-09 | Dados offline no aparelho | Cópia criptografada, apagada ao fim do dia e ao sair da conta |
| SEG-10 | Retenção de dados de visitantes | Anonimização após 6 meses |
| SEG-11 | Direitos do titular | Pedidos de acesso e exclusão pelo app (RF-LG-01 e RF-LG-02) |
| SEG-12 | Pagamentos | Gateway certificado; o app nunca guarda dados de cartão |
| SEG-13 | Acesso do suporte da plataforma | Só em condomínios do plano Gestão + Suporte, com registro de cada acesso |
| SEG-14 | Contrato com o condomínio | Contrato padrão definindo condomínio como controlador e plataforma como operadora |
| SEG-15 | Termos para conta bancária de pessoa física | Termo de responsabilidade pelo valor recebido, com texto revisado por advogado, aceito pelo titular no cadastro da conta |
| SEG-16 | Parecer jurídico antes do lançamento | Advogado avalia score, reclamações, penalidades, eleições e termos; o lançamento só acontece com o parecer aprovado |
| SEG-17 | Dados financeiros e inadimplência | Situação financeira de uma unidade visível só ao responsável financeiro, à administradora e ao síndico; nunca exposta a outros moradores. Webhooks do gateway validados por assinatura e conciliação diária entre cobranças e pagamentos |

## 9. Design e identidade visual

Interface moderna nas cores da marca: azul (#0E359D), branco (#FFFFFF) e coral (#FF606A), em tema claro e escuro; os demais tons (fundo escuro, textos) derivam do azul.

| Uso | Tema claro | Tema escuro |
| --- | --- | --- |
| Fundo | #FFFFFF | #081B52 |
| Superfície (cards) | #F3F6FC | #0E2766 |
| Barra superior e áreas de marca | #0E359D | #0E359D |
| Botão primário | Fundo #0E359D, texto #FFFFFF | Fundo #FF606A, texto #081B52 |
| Destaques (ícones, selos, gráficos, botão flutuante) | #FF606A | #FF606A |
| Links | #0E359D | #8FA8F0 |
| Texto principal | #0B1A44 | #FFFFFF |
| Texto secundário | #5A6785 | #B8C4E6 |
| Sucesso / alerta / erro | #2E7D32 / #B26A00 / #C62828 | #66BB6A / #FFB74D / #EF5350 |

**Contraste (RNF-12).** Azul sobre branco tem 10,4:1 e passa no WCAG AA. Coral sobre branco tem 2,9:1 e não passa para texto: no tema claro, o coral só é usado em ícones, selos, gráficos e elementos grandes. No tema escuro, coral sobre #081B52 tem 5,5:1 e pode ser usado em texto. O vermelho de erro é diferente do coral e sempre vem com ícone e texto.

| Tela | Diretriz |
| --- | --- |
| Portaria | Botões grandes, busca por unidade, no máximo 2 toques para registrar entrada; faixa de "sem internet" com a hora da última sincronização |
| Limpeza | Chamados em cartões, com botão "concluir" visível sem abrir o chamado |
| Reservas | Calendário com cores para livre, ocupado e indisponível pelo score |
| Score | Número grande, histórico de ganhos e perdas e data da próxima recuperação |
| Transparência | Score do síndico e nota de cada setor em cartões |
| Seletor de unidade | Topo da tela inicial, para quem tem mais de uma unidade |
| Versão web (administradora) | Layout de tabela para telas grandes |

Imagens comprimidas e poucas animações, para rodar bem em celulares fracos.

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
| Rotinas agendadas | Jobs no backend: recuperação de score, saída não registrada, prazos de pagamento, fechamento da pesquisa, lembretes de encomenda |
| Arquivos (fotos, atas) | Armazenamento de objetos (S3 ou equivalente), com fotos comprimidas no aparelho |
| E-mail transacional | Resend ou Amazon SES |
| Monitoramento | Sentry + logs |
