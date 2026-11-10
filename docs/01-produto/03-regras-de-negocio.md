# Regras de Negócio — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

## 1. Objetivo e como ler

Este documento detalha todas as regras de negócio do CondomiFacil, a partir do PRD; cada regra tem um ID que deve ser citado no código, nos testes e nas tarefas.

**Como ler**

- Os IDs seguem o padrão `RN-<módulo>-<número>`, e este documento é a fonte oficial das regras: o PRD traz só um resumo, e o PRD e as histórias de usuário citam estes IDs.
- Uma regra marcada como **configurável** tem um parâmetro no catálogo da seção 13, com valor padrão, faixa permitida, nível e quem pode alterar.
- Regras sem essa marca são fixas: valem igual para todos os condomínios.
- Onde este documento diz "administradora", leia "administradora ou, no plano Gestão + Suporte, a equipe de suporte da plataforma". A exceção são as seções 4 e 5 (score, reclamações e recursos): o suporte não julga, não consulta reclamações e não vê scores. Por isso, "sem administradora" significa sem administradora contratada, mesmo com o suporte atuando.
- IDs de regras removidas não são reaproveitados, então algumas sequências têm lacunas (ex.: não existem RN-SC-06 e RN-SC-07).
- Os fluxos de tela que aplicam estas regras, com os caminhos de erro, estão no User Flows — CondomiFacil (`docs/02-design/02-user-flows.md`).

**Níveis de configuração**

Um parâmetro é resolvido do nível mais geral para o mais específico; o nível mais específico preenchido vence.

| Nível | O que define | Quem altera |
| --- | --- | --- |
| Plataforma | Valor padrão para todos os condomínios | Admin da plataforma |
| Condomínio | Valor do condomínio, conforme convenção e regimento | Administradora ou suporte |
| Área comum | Valor de uma área específica (só regras de reserva) | Administradora ou suporte |

**Mudança de regra**

- RN-GE-01: toda alteração de parâmetro é registrada com autor, data, valor antigo e valor novo.
- RN-GE-02: uma alteração pode ter data de início futura; até lá vale o valor anterior.
- RN-GE-03: reservas, reclamações e votações em andamento seguem as regras vigentes quando foram criadas; o sistema guarda uma cópia das regras aplicadas em cada uma.

## 2. Glossário

| Termo | Significado |
| --- | --- |
| Unidade | Cada imóvel privativo do condomínio: apartamento, casa ou sala comercial. Áreas comuns, vagas de garagem e depósitos não contam como unidades |
| Morador habilitado | Único morador de cada unidade que responde por ela no dia a dia, inclusive perdendo pontos em reclamações contra ela. É o proprietário quando ele mora na unidade e o inquilino quando ela está alugada; quem vota é o proprietário (RN-VO-01) |
| Proprietário | Dono da unidade, ou condômino; é quem vota pela unidade. Quando a unidade tem mais de um dono, vale o proprietário representante (RN-CD-26) |
| Inquilino | Morador que aluga a unidade, cadastrado com as datas de início e fim do contrato de locação; é o morador habilitado enquanto o contrato vale |
| Unidade desocupada | Unidade sem ninguém morando, por exemplo entre dois contratos de locação; não tem morador habilitado (RN-CD-24) |
| Despesa ordinária | Despesa da rotina do condomínio, como a taxa mensal; na unidade alugada, paga pelo inquilino (Lei 8.245/1991, art. 23, XII) |
| Despesa extraordinária | Despesa que não é da rotina, como obras, benfeitorias e fundo de reserva; paga pelo proprietário (Lei 8.245/1991, art. 22, X) |
| Hóspede de temporada | Pessoa que se hospeda por poucos dias em unidade desocupada, cadastrada pelo proprietário como visita com período (RN-VI-10) |
| Unidade ativa | Unidade escolhida no seletor; o app mostra os dados dela |
| Julgador | Quem decide uma reclamação: síndico, subsíndico, administradora ou conselho fiscal, conforme RN-RC-03 |
| Alvo | Funcionário, unidade, síndico ou subsíndico contra quem a reclamação foi feita |
| Reclamante | Morador que registrou a reclamação; na reclamação gerada por vistoria, o próprio condomínio |
| Parte da reclamação | O reclamante e o alvo; quando o alvo é uma unidade, também o morador habilitado dela |
| Proprietário não residente | Proprietário que não mora na unidade, alugada ou desocupada; tem login próprio para cobranças, assembleias e o acompanhamento da unidade (RN-CD-19) |
| Período de regularidade | Contagem de 2 meses sem reclamação validada nem penalidade por reclamação; ao completar, o score recupera 5 pontos |
| Reserva paga | Reserva de área que exige pagamento |
| Reserva gratuita | Reserva de área sem pagamento |
| Lembrete de reserva | Push opcional enviado ao morador que fez a reserva confirmada, com antecedência configurável (padrão 24h) do início, com atalho para ver a reserva e cancelar (RN-RE-14) |
| Substituição | Período em que o subsíndico exerce as funções de síndico |
| Sugestão de comunicado | Comunicado escrito pelo subsíndico fora da substituição, que o síndico revisa, edita e envia, ou descarta (RN-CO-05) |
| Síndico profissional | Síndico contratado, sem unidade no condomínio |
| Solicitação de suporte | Pedido de cadastro, alteração ou configuração atendido pela equipe da plataforma no plano Gestão + Suporte |
| Avaliação do atendimento | Nota de 1 a 5 estrelas, com comentário opcional, que quem abriu o chamado dá ao serviço concluído; diferente da pesquisa mensal e sem efeito no score (RN-CH-15 a RN-CH-21) |
| Sincronização | Envio ao servidor do que a portaria ou a limpeza registrou sem internet |
| Taxa condominial | Valor mensal que cada unidade paga ao condomínio |
| Responsável financeiro | Quem recebe e paga as cobranças da unidade. Há um para as despesas ordinárias e outro para as extraordinárias (RN-FI-03); por padrão, os dois são o morador habilitado |
| Em atraso | Unidade com cobrança vencida e não paga; aparece no painel de inadimplência |
| Lançamento | Registro de uma receita ou despesa do condomínio, automático (vindo de cobrança ou reserva paga) ou avulso (lançado pela administradora) |
| Mês fechado | Mês financeiro que não aceita mais edição nem exclusão de lançamentos; a correção é feita por estorno (RN-FI-28) |
| Estorno | Lançamento de valor oposto, com motivo, que anula um lançamento de mês fechado sem apagá-lo |

## 3. Cadastros, unidades e papéis

Ninguém se cadastra sozinho: todo usuário é pré-cadastrado pela administradora ou pelo suporte, e cada unidade ocupada tem exatamente um morador habilitado.

| ID | Regra |
| --- | --- |
| RN-CD-01 | Todo usuário é pré-cadastrado pela administradora ou, no plano Gestão + Suporte, pela equipe da plataforma |
| RN-CD-02 | No primeiro acesso, o usuário recebe um código de 6 dígitos no e-mail cadastrado, válido por 15 minutos, com até 5 tentativas; depois disso, precisa pedir novo código. Um novo código pode ser pedido após 60 segundos e invalida o anterior. A tela mostra a mesma mensagem para e-mails cadastrados e não cadastrados, para não revelar quem tem conta. A mesma regra vale para a recuperação de senha |
| RN-CD-03 | O usuário só usa o app após aceitar termos de uso, política de privacidade, regimento do condomínio e a página "Como funciona" (RF-AC-07); nova versão de qualquer um exige novo aceite antes de continuar. Quem tem vínculo com mais de um condomínio aceita o regimento de cada um |
| RN-CD-04 | Cada unidade tem exatamente um morador habilitado; a unidade não pode ser salva sem ele, e cada troca é registrada com data. A única exceção é a unidade desocupada (RN-CD-24) |
| RN-CD-05 | Um usuário pode ter vínculo com várias unidades e condomínios; o app mostra só os dados da unidade ativa, e cada unidade tem painel e métricas separados |
| RN-CD-06 | O síndico não cadastra ninguém: ele envia uma solicitação de cadastro, alteração ou remoção, que a administradora ou o suporte atende ou recusa com motivo |
| RN-CD-07 | Na mudança de um morador, o acesso é desativado e o histórico mantido; reservas futuras são canceladas com reembolso integral, e visitas recorrentes são encerradas |
| RN-CD-08 | No desligamento de um funcionário, os chamados abertos dele voltam para a fila do setor; as notas da pesquisa ficam no histórico |
| RN-CD-09 | Funcionários terceirizados são cadastrados como funcionários, com o nome da empresa |
| RN-CD-10 | Síndico e subsíndico devem ser de unidades diferentes |
| RN-CD-11 | O síndico morador mantém todas as funções de morador; o síndico profissional não tem nenhuma |
| RN-CD-12 | A substituição do síndico pelo subsíndico é ativada pela administradora ou pelo síndico, e pode ser desativada por eles a qualquer momento; cada ativação e desativação é registrada |
| RN-CD-13 | Se o mandato do síndico terminar antes do prazo (renúncia ou destituição), o subsíndico assume até a nova eleição. Sem subsíndico, a administradora recebe um alerta e abre a nova eleição; até a posse, as funções exclusivas do síndico ficam sem titular, e reclamações seguem a tabela 5.1 como "sem subsíndico" |
| RN-CD-14 | Condomínio sem subsíndico deve ter conselho fiscal com um ou mais membros (RN-VO-09) |
| RN-CD-15 | A lista de pessoas com entrada bloqueada é mantida pela administradora, com nome, documento e motivo |
| RN-CD-16 | O suporte da plataforma só acessa condomínios do plano Gestão + Suporte, e cada acesso é registrado |
| RN-CD-17 | O condomínio pode ter blocos (torres ou quadras) e várias portarias; cada unidade pertence a um bloco, e cada portaria atende todos os blocos ou só os definidos pela administradora |
| RN-CD-18 | Se o morador habilitado, o proprietário ou um responsável financeiro pedir a exclusão da conta (RF-LG-02), a administradora é avisada para definir o substituto. Enquanto a unidade estiver sem morador habilitado, ninguém reserva nem cadastra visitantes por ela; enquanto estiver sem proprietário com acesso, ela não vota |
| RN-CD-19 | Todo proprietário não residente recebe login próprio, com a unidade alugada ou desocupada. Ele vê e paga as cobranças de que é responsável financeiro e vê a situação das demais cobranças da unidade; vota e indica procurador (RN-VO-01); recebe os comunicados gerais para moradores ou para todos; vê as reclamações validadas e as multas contra a unidade (RN-RC-16) e as datas do contrato de locação. Não reserva, não abre chamados, não registra reclamações, não avalia funcionários, não cadastra visitantes (exceto RN-VI-10) e não tem score. Nunca vê os visitantes, chamados, reservas, encomendas nem o score do inquilino |
| RN-CD-20 | O inquilino é cadastrado pela administradora com as datas de início e fim do contrato de locação; sem data de fim, o contrato é por prazo indeterminado. Ao ser cadastrado, ele passa a ser o morador habilitado, e o proprietário passa a não residente. Os dependentes do inquilino ficam vinculados a ele e saem junto |
| RN-CD-21 | 30 dias antes do fim do contrato (configurável), a administradora, o proprietário e o inquilino são avisados. A administradora renova o contrato, com nova data de fim, ou o encerra. Sem renovação, o acesso do inquilino e dos dependentes é desativado 7 dias após o fim (configurável), como numa mudança (RN-CD-07), e a unidade fica desocupada |
| RN-CD-22 | O inquilino não reserva áreas para depois do fim do contrato, e as visitas recorrentes dele terminam no máximo nessa data; numa renovação, os limites passam a seguir a nova data |
| RN-CD-23 | O proprietário pode pedir pelo app o cadastro, a renovação ou o encerramento do inquilino; a administradora atende ou recusa com motivo, como em RN-CD-06. No plano Gestão + Suporte, o pedido atendido conta como solicitação (RN-PL-03) |
| RN-CD-24 | A administradora marca como desocupada a unidade sem ninguém morando. Nela, não há morador habilitado; o proprietário vota e é o responsável financeiro de todas as cobranças; ninguém reserva, cadastra visitantes (exceto RN-VI-10) nem abre chamados pela unidade. Reclamação validada contra a unidade desocupada não tira pontos de ninguém, e o proprietário é avisado (RN-RC-16) |
| RN-CD-25 | Quando o proprietário volta a morar na unidade, a administradora muda o vínculo dele para morador: ele volta a ser o morador habilitado e inicia um novo score pessoal naquela unidade em 100. O histórico do vínculo anterior é preservado e os scores dele em outras unidades não mudam |
| RN-CD-26 | Quando a unidade tem mais de um proprietário, a administradora cadastra só o proprietário representante, que vota e recebe os avisos da unidade |
| RN-CD-27 | Fora da substituição, o subsíndico tem uma gestão limitada: julga o previsto em RN-RC-03 e RN-RC-07; acompanha os chamados de manutenção e o andamento, sem indicar empresa nem mudar o status; sugere comunicados ao síndico (RN-CO-05); registra votos presenciais nas reuniões convocadas pelo síndico (RN-VO-11); e vê as encomendas com prazo de guarda vencido, sem marcar a devolução. Não convoca reuniões, não cria pautas, não encerra votações, não faz solicitações à administradora e não vê a inadimplência |
| RN-CD-28 | Na substituição, o subsíndico tem todas as funções do síndico, exceto ativar e desativar a substituição (RN-CD-12) |

## 4. Score

Moradores têm um score pessoal de 0 a 100 em cada unidade em que residem. Cada novo vínculo de moradia começa em 100, cai com as ocorrências daquele vínculo e se recupera com regularidade própria. Funcionários e síndicos profissionais sem unidade têm score individual por condomínio, sem unidade fictícia. O score público do síndico morador usa o vínculo da unidade de referência do mandato, sem juntar os scores dos outros imóveis.

### 4.1 Eventos que alteram o score

| Evento | Quem é afetado | Pontos | Reinicia o período de regularidade |
| --- | --- | --- | --- |
| Reclamação validada, gravidade leve | Alvo | −5 | Sim |
| Reclamação validada, gravidade média | Alvo | −10 | Sim |
| Reclamação validada, gravidade grave | Alvo | −20 | Sim |
| Reclamação validada contra uma unidade | Morador habilitado da unidade | Conforme a gravidade | Sim |
| Negada: não procede, de boa-fé | — | 0 | Não |
| Negada: desproporcional | Reclamante | −5 | Sim |
| Negada: falsa ou de má-fé | Reclamante | −15 | Sim |
| Negada: duplicada | — | 0 | Não |
| Recurso aceito | Quem perdeu os pontos | Pontos devolvidos | A perda revertida deixa de contar |
| Pesquisa mensal: média abaixo de 3 estrelas | Funcionário | −5 | Não |
| Pesquisa mensal: média de 3 até menos de 4,5 | Funcionário | 0 | Não |
| Pesquisa mensal: média de 4,5 ou mais | Funcionário | +5 | Não |
| Duas faltas em reservas gratuitas no mesmo trimestre pelo mesmo vínculo de moradia | Morador que reservou | −5 | Não |
| Período de regularidade completo (2 meses) | Qualquer usuário | +5 | Começa um novo período |

### 4.2 Regras gerais

| ID | Regra |
| --- | --- |
| RN-SC-01 | O score vai de 0 a 100; ganhos acima de 100 e perdas abaixo de 0 são descartados. Visitantes, administradora, suporte, admin da plataforma, proprietário não residente e empresas de manutenção não têm score |
| RN-SC-02 | O score individual é visto só pelo próprio usuário. Exceções: todos veem o score do síndico — para síndico morador, o do vínculo da unidade de referência do mandato; para o profissional sem unidade, o funcional naquele condomínio. Reclamação contra síndico ou subsíndico usa o score do vínculo da unidade de referência do mandato, quando morador, sem somar nem alterar scores de outros imóveis. O julgador e a administradora veem identidade e score do reclamante e do alvo no contexto da reclamação; a administradora vê o score dos funcionários; sem administradora, síndico e subsíndico veem o score dos funcionários |
| RN-SC-03 | Os pontos por gravidade e por motivo de negativa são configuráveis por condomínio |
| RN-SC-04 | Reclamação contra uma unidade tira pontos só do morador habilitado |
| RN-SC-05 | Penalidade só é aplicada após a decisão; reclamações pendentes não alteram o score |
| RN-SC-08 | Recuperação: +5 pontos a cada 2 meses de regularidade, contados separadamente para cada score. Reclamação validada contra a pessoa, ou penalidade por reclamação desproporcional ou falsa feita por ela, reinicia apenas o período do score afetado. Reclamações pendentes ou negadas sem penalidade não interrompem a contagem |
| RN-SC-09 | Score menor ou igual a 60 (configurável) tira da pessoa o direito a reservas gratuitas pela unidade daquele score; reservas pagas continuam liberadas. O direito volta automaticamente quando esse score passa de 60 |
| RN-SC-10 | O bloqueio vale só para a pessoa naquela unidade; os outros moradores da mesma unidade continuam reservando e os vínculos dela em outras unidades não são afetados |
| RN-SC-11 | O score não decide nada sozinho no julgamento; o julgador o usa como referência |
| RN-SC-12 | Cada alteração aparece no histórico do usuário com data, motivo e pontos; a identidade do reclamante nunca aparece no histórico do alvo |
| RN-SC-13 | O score de moradia pertence à pessoa em cada vínculo com uma unidade: não é uma pontuação compartilhada pelos moradores nem uma pontuação única da pessoa em todos os imóveis. A mesma pessoa tem saldo, histórico e regularidade separados em cada unidade. Cada novo vínculo de moradia começa em 100, inclusive para novo inquilino ou retorno do proprietário; não herda pontos do ocupante anterior nem apaga o histórico encerrado. Reclamação contra unidade afeta só o score do morador habilitado naquela unidade; reclamação feita por morador usa o vínculo da unidade ativa. O proprietário não residente não tem score de moradia nem perde pontos por reclamações contra a unidade alugada |
| RN-SC-14 | Funcionário e síndico profissional sem unidade têm score individual separado por condomínio. Reclamações e, para funcionários, a pesquisa mensal alteram apenas esse score funcional no condomínio correspondente. Não se cria unidade fictícia nem se compartilha esse saldo com outro condomínio ou com score de moradia |

### 4.3 Exemplo

1. Ana tem 100 pontos. Em 10/01, uma reclamação de gravidade média contra ela é validada: vai a 90 e o período de regularidade começa em 10/01.
2. Em 10/03, completa 2 meses sem novas ocorrências: vai a 95 e começa novo período.
3. Em 20/03, Ana faz uma reclamação negada como falsa: vai a 80 e o período reinicia em 20/03.
4. Em 25/03, uma reclamação contra ela é negada de boa-fé: nada muda e o período segue contando.
5. Em 20/05, completa 2 meses: vai a 85.

## 5. Reclamações

Toda reclamação é identificada, tem um único alvo do mesmo condomínio e só é decidida depois que o julgador ouve o alvo ou o prazo de resposta dele vence.

### 5.1 Quem julga

| Alvo da reclamação | Situação | Julgador |
| --- | --- | --- |
| Funcionário ou unidade comum | Normal | Síndico |
| Funcionário ou unidade comum | Síndico em substituição | Subsíndico |
| Síndico ou a unidade dele | Há subsíndico | Subsíndico |
| Síndico ou a unidade dele | Sem subsíndico | Administradora; sem administradora, conselho fiscal |
| Subsíndico ou a unidade dele | Síndico presente | Síndico |
| Subsíndico ou a unidade dele | Síndico ausente (substituição ativa) | Administradora; sem administradora, fica pendente até o fim da substituição, quando o síndico julga |

### 5.2 Regras

| ID | Regra |
| --- | --- |
| RN-RC-01 | Reclamações são identificadas; o alvo nunca vê quem reclamou |
| RN-RC-02 | Cada reclamação tem um único alvo, do mesmo condomínio do reclamante: um funcionário, uma unidade, o síndico (morador ou profissional) ou o subsíndico. Reclamar de síndico e subsíndico exige duas reclamações separadas |
| RN-RC-03 | O julgador é definido pela tabela 5.1 no momento da abertura |
| RN-RC-04 | O julgador inicia a conversa com o alvo antes de decidir; quando o alvo é uma unidade, a conversa é com o morador habilitado e, na unidade desocupada, com o proprietário. A decisão é liberada quando o alvo responde ou quando vencem 5 dias (configurável) sem resposta, com o registro "alvo não respondeu" |
| RN-RC-05 | Negativa exige um motivo da lista; motivos com penalidade exigem também uma justificativa escrita |
| RN-RC-06 | Prazo para decisão: 15 dias (configurável), com lembrete ao julgador no prazo e a cada 5 dias depois dele |
| RN-RC-07 | Quem perdeu pontos pode recorrer uma vez, em até 7 dias da decisão (tabela 5.3) |
| RN-RC-08 | A administradora consulta todas as reclamações, com identidade e score do reclamante e do alvo |
| RN-RC-09 | A categoria define a gravidade padrão; o julgador pode mudá-la ao validar, com justificativa |
| RN-RC-10 | O alvo é notificado na abertura e na decisão, sem a identidade do reclamante |
| RN-RC-11 | Reclamação feita pelo próprio julgador (ex.: síndico reclamando de um funcionário) vai para quem julgaria uma reclamação contra ele |
| RN-RC-12 | Dano encontrado em vistoria gera reclamação contra a unidade em nome do condomínio, sem reclamante pessoa; segue o julgamento normal, com as fotos da vistoria como evidência. Se for negada, ninguém é penalizado |
| RN-RC-13 | Textos ofensivos são filtrados; qualquer usuário pode denunciar conteúdo, e a denúncia vai ao síndico. Denúncia de conteúdo escrito pelo síndico vai a quem julgaria uma reclamação contra ele (tabela 5.1) |
| RN-RC-14 | Quem é parte da reclamação nunca julga o recurso dela. Nesse caso, o recurso vai à administradora e, sem ela, ao conselho fiscal; sem nenhum dos dois, fica pendente, e a administradora ou o suporte recebe alerta para cadastrar o conselho fiscal |
| RN-RC-15 | Reclamação decidida sem recurso em 7 dias é encerrada automaticamente |
| RN-RC-16 | Quando uma reclamação contra unidade alugada ou desocupada é validada, o proprietário não residente é avisado com a categoria, a data, a decisão e a multa, se houver; ele não vê a conversa nem quem reclamou |
| RN-RC-17 | Toda reclamação aguardando decisão (estados Aberta e Em conversa com o alvo) mostra um semáforo do prazo de decisão de RN-RC-06, contado da abertura (ou de quando sai de Pendente, RN-RC-19) e vencendo no fim do dia do vencimento. **Verde, "no prazo":** resta mais que o limiar de RN-RC-18. **Amarelo, "prazo se esgotando":** restam o limiar ou menos, até o dia do vencimento inclusive. **Vermelho, "prazo esgotado":** o prazo passou. O semáforo aparece, com texto e ícone além da cor, na lista e no detalhe, para quem reclamou (nas reclamações dele) e para o julgador: síndico, subsíndico (nas reclamações contra o síndico e, na substituição, em todas), administradora e conselho fiscal |
| RN-RC-18 | O limiar do amarelo é 25% do prazo de decisão, arredondado para cima e com mínimo de 1 dia: com 15 dias, os últimos 4; com 3 dias, o último; com 60 dias, os últimos 15. Não é configurável: acompanha o prazo de `reclamacao.prazo_decisao_dias`. Um limiar proporcional avisa cedo nos prazos longos e não deixa os curtos amarelos desde o começo, o que um limite fixo de 24 horas faria |
| RN-RC-19 | O semáforo é só informação: não bloqueia a decisão, não muda o estado da reclamação e não altera os lembretes de RN-RC-06. Não aparece em reclamação Pendente (o prazo passa a contar quando há julgador) nem depois da decisão (Validada, Negada, Em recurso, Recurso aceito e Encerrada), quando só vale o prazo de recurso de RN-RC-07. O alvo não vê o semáforo, e nada nele revela quem reclamou |

### 5.3 Recursos

| Decisão tomada por | Recurso julgado por |
| --- | --- |
| Síndico | Subsíndico; sem subsíndico, administradora; sem administradora, conselho fiscal |
| Subsíndico | Síndico; se o síndico for parte da reclamação ou estiver em substituição, administradora; sem ela, conselho fiscal (RN-RC-14) |
| Administradora ou conselho fiscal | Sem recurso no app |

Recurso aceito devolve os pontos; recurso negado mantém a decisão e encerra a reclamação. Em qualquer linha, vale RN-RC-14: quem é parte nunca julga o recurso.

### 5.4 Categorias e gravidade padrão

| Categoria | Gravidade |
| --- | --- |
| Barulho | Leve |
| Animais | Leve |
| Vaga de garagem | Leve |
| Uso indevido de área comum | Média |
| Conduta com funcionários ou vizinhos | Média |
| Dano ao patrimônio | Grave |
| Ameaça ou agressão | Grave |

### 5.5 Estados da reclamação

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Pendente | Aberta, mas sem julgador possível no momento (tabela 5.1) | Aberta |
| Aberta | No painel do julgador, aguardando a conversa com o alvo | Em conversa com o alvo |
| Em conversa com o alvo | Conversa iniciada; decisão liberada após a resposta do alvo ou o prazo (RN-RC-04) | Validada, Negada |
| Validada | Alvo perdeu pontos; prazo de recurso de 7 dias correndo | Em recurso, Encerrada |
| Negada | Negada com penalidade ao reclamante; prazo de recurso correndo. Negada sem penalidade vai direto para "encerrada" | Em recurso, Encerrada |
| Em recurso | Recurso aberto por quem perdeu pontos | Recurso aceito, Encerrada |
| Recurso aceito | Pontos devolvidos | — |
| Encerrada | Decisão final, sem recurso possível | — |

Só entra em recurso quem perdeu pontos; uma negativa sem penalidade vai direto para "encerrada". O fluxo completo, com os caminhos de erro, está no User Flows, seções 9.1 a 9.3.

## 6. Pesquisa mensal de funcionários

Os moradores avaliam cada funcionário com 1 a 5 estrelas; a média do mês ajusta o score do funcionário, e a média dos funcionários vira a nota pública do setor.

| ID | Regra |
| --- | --- |
| RN-PE-01 | A pesquisa abre no primeiro dia e fecha no último dia de cada mês |
| RN-PE-02 | Avaliam moradores, síndico morador e subsíndico; síndico profissional e funcionários não avaliam |
| RN-PE-03 | Aparecem só funcionários ativos no mês, agrupados por setor; o morador pode pular quem não conhece; participação é opcional |
| RN-PE-04 | Cada pessoa avalia cada funcionário uma vez por mês, com 1 a 5 estrelas e comentário opcional; pode mudar a nota até o fechamento |
| RN-PE-05 | No fechamento, a média de cada funcionário ajusta o score dele: abaixo de 3 estrelas −5; de 3 até menos de 4,5 mantém; 4,5 ou mais +5 |
| RN-PE-06 | Funcionário sem nenhuma avaliação no mês não tem ajuste |
| RN-PE-07 | Nota do setor = média das médias dos funcionários avaliados; cada funcionário pesa igual, não importa quantas avaliações recebeu |
| RN-PE-08 | A nota do setor só é publicada quando 2 ou mais funcionários do setor foram avaliados no mês |
| RN-PE-09 | Notas e comentários individuais são vistos só pelo próprio funcionário, sem identificar quem avaliou |

**Exemplo.** No setor de limpeza, João teve média 4,6 (+5 pontos) e Maria teve média 2,8 (−5 pontos). A nota publicada do setor é 3,7.

## 7. Reservas, cancelamento, reembolso e pagamentos

Toda reserva é paga ou gratuita conforme a área, é confirmada automaticamente quando cumpre as regras e pode ser cancelada a qualquer momento antes do início, com reembolso só até 12h antes.

### 7.1 Reservas

| ID | Regra |
| --- | --- |
| RN-RE-01 | Cada área é cadastrada como paga ou gratuita; a reserva herda esse tipo |
| RN-RE-02 | O síndico não valida reservas: a gratuita é confirmada na hora; a paga, quando o pagamento é aprovado |
| RN-RE-03 | A reserva paga fica aguardando pagamento por até 24h (configurável) ou até o início da reserva, o que vier primeiro; sem pagamento, expira e o horário é liberado. Pagamento recusado pode ser tentado de novo, por qualquer meio aceito, enquanto o prazo não vencer |
| RN-RE-04 | O primeiro pedido bloqueia o horário; quem tentar depois vê "ocupado" |
| RN-RE-05 | O calendário mostra horários reservados como "ocupado", sem identificar unidade ou morador |
| RN-RE-06 | Antecedência: mínimo 24h e máximo 60 dias (configuráveis por área) |
| RN-RE-07 | Limite: 2 reservas por mês, por área, por unidade (configurável por área); reservas canceladas não contam |
| RN-RE-08 | Com score menor ou igual a 60, a pessoa não vê horários livres em áreas gratuitas, só em áreas pagas |
| RN-RE-09 | Ao verificar o encerramento da reserva, a portaria ou a limpeza registra a vistoria. Se houve uso, preenche checklist e fotos e marca a reserva como Cumprida; dano gera reclamação (RN-RC-12). Se a área não foi usada, registra Não comparecimento, inclusive em reserva paga, sem exigir checklist de uso nem foto de uma área não utilizada |
| RN-RE-10 | Se o morador não usar uma reserva gratuita, a portaria ou a limpeza registra o não comparecimento; a cada duas faltas no mesmo trimestre pelo mesmo vínculo de moradia, quem reservou perde 5 pontos no score daquela unidade, aplicados pela rotina diária. Faltas de outros imóveis ou vínculos não são somadas. Reserva paga não utilizada também fica Não comparecimento, mas não entra nessa contagem, não gera perda de pontos nem reembolso automático por falta |
| RN-RE-11 | Se o condomínio ligar o bloqueio por atraso (RN-FI-12), a unidade em atraso não faz novas reservas até quitar; reservas já confirmadas são mantidas |
| RN-RE-12 | Quando a reserva fica confirmada (na hora ou com a aprovação do pagamento), o app sugere montar a lista de visitantes vinculada a ela (RN-VI-14). A sugestão aparece na confirmação e no detalhe só se a reserva está **confirmada**, tem data depois de hoje e ainda não tem lista vinculada; "Agora não" a esconde para aquela reserva, sem voltar a insistir. Não aparece para reserva aguardando pagamento, expirada, cancelada, em andamento, cumprida ou com data de hoje, porque a lista seria cancelada junto se a reserva caísse. As regras não distinguem áreas, então a sugestão vale para todas; a capacidade da área só avisa (RN-VI-14). Com lista vinculada, o detalhe mostra "Lista: N pessoas", com link para a lista |
| RN-RE-13 | A portaria consulta, em Áreas > Reservas de hoje, as reservas do dia, com área, horário, unidade e estado, sem valores, meios de pagamento ou score. Para reserva Confirmada cujo início já chegou, pode marcar Em andamento quando constata o uso. Após o término do uso, portaria ou limpeza pode fazer a vistoria e marcar Cumprida; não é obrigatório registrar Em andamento antes. Se o uso termina antes do horário previsto, o intervalo original continua ocupado até o fim, sem liberação automática. Não comparecimento só é registrado em reserva Confirmada após o término do horário, se não houve uso; Em andamento segue para Cumprida. Aguardando pagamento, Expirada e Cancelada não admitem marcação de uso. Cada marcação guarda autor, data e hora, sem inventar horário real de entrada ou saída dos usuários da área. A limpeza mantém as permissões de vistoria de RN-RE-09, sem ganhar o controle de início de uso. Consulta atualizada e marcações de reserva/vistoria exigem internet; o escopo offline continua restrito a visitantes e chamados de limpeza |
| RN-RE-14 | **Lembrete de reserva.** Uma rotina envia um push, uma única vez, ao morador que fez a reserva, com 24h de antecedência do início (`reserva.lembrete_antecedencia_horas`, configurável por condomínio, de 1 a 72). Só vale para reserva **Confirmada**: reserva Aguardando pagamento não recebe lembrete (ela expira conforme RN-RE-03), e reserva Cancelada, Cancelada pelo condomínio ou Expirada não recebe nem mantém lembrete pendente. O canal é só push, sem e-mail. É opcional: o morador desliga em Preferências de notificação (RF-NO-01), e o padrão é ligado. O push abre o detalhe da reserva, com atalho para cancelar; o cancelamento segue RN-CA-01 a RN-CA-03 (na reserva paga, reembolso integral até 12h antes e, depois disso, sem reembolso, com aviso antes de confirmar) e não gera perda de pontos. Reserva confirmada com menos antecedência que o parâmetro (inclusive paga cuja aprovação do pagamento chega depois desse ponto) não recebe lembrete, porque o horário de envio já passou |

### 7.2 Cancelamento e reembolso

| ID | Regra |
| --- | --- |
| RN-CA-01 | O morador pode cancelar qualquer reserva até o horário de início |
| RN-CA-02 | Reserva paga cancelada até 12h antes do início (configurável) tem reembolso integral |
| RN-CA-03 | Depois desse prazo, o cancelamento continua permitido, mas sem reembolso; o app avisa antes de confirmar |
| RN-CA-04 | Reembolso por Pix em até 2 dias úteis; no cartão, estorno pela operadora |
| RN-CA-05 | Cancelamento feito pelo condomínio (manutenção, mudança de morador) tem reembolso integral em qualquer prazo, com aviso ao morador e o motivo |
| RN-CA-06 | Todo cancelamento libera o horário na hora |

### 7.3 Pagamentos

| ID | Regra |
| --- | --- |
| RN-PG-01 | Cada condomínio cadastra uma conta bancária para receber reservas e a taxa condominial; o titular é escolhido pelo cliente |
| RN-PG-02 | A plataforma recomenda conta no CNPJ do condomínio; conta de pessoa física exige que o titular aceite o termo de responsabilidade pelo valor recebido |
| RN-PG-03 | Sem conta cadastrada, o condomínio não pode ter áreas pagas |
| RN-PG-04 | O valor vai direto para a conta do condomínio, por subconta ou split do gateway; a plataforma não retém o dinheiro |
| RN-PG-05 | Taxas do gateway são descontadas do valor recebido pelo condomínio |
| RN-PG-06 | Meios aceitos: Pix e cartão de crédito |
| RN-PG-07 | Todo pagamento e reembolso gera comprovante, enviado por e-mail e guardado no histórico |

### 7.4 Estados da reserva

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Aguardando pagamento | Reserva paga com horário bloqueado, dentro do prazo de pagamento | Confirmada, Expirada, Cancelada |
| Confirmada | Gratuita na criação ou paga com pagamento aprovado | Cancelada, Cancelada com reembolso, Cancelada sem reembolso, Cancelada pelo condomínio, Em andamento, Cumprida, Não comparecimento |
| Em andamento | Uso constatado e marcado pela portaria a partir do início do horário reservado | Cumprida |
| Expirada | Prazo de pagamento vencido; horário liberado | — |
| Cancelada | Cancelada pelo morador sem valor pago: reserva gratuita ou paga ainda aguardando pagamento | — |
| Cancelada com reembolso | Paga, cancelada pelo morador dentro do prazo de reembolso | — |
| Cancelada sem reembolso | Paga, cancelada pelo morador depois do prazo de reembolso | — |
| Cancelada pelo condomínio | Manutenção ou mudança de morador; reembolso integral se houve pagamento | — |
| Cumprida | Usada; vistoria registrada pela portaria ou limpeza (antes chamada Realizada) | — |
| Não comparecimento | Reserva paga ou gratuita não usada, registrada na vistoria pela portaria ou limpeza | — |

A reserva gratuita já nasce confirmada; a paga passa por "aguardando pagamento" e expira se o prazo vencer. O fluxo completo está no User Flows, seções 5.1 a 5.3.

## 8. Visitantes e portaria

O cadastro de visitantes agiliza a portaria, mas não é a única forma de autorizar uma entrada: o morador também pode autorizar por interfone.

### 8.1 Regras

| ID | Regra |
| --- | --- |
| RN-VI-01 | O morador cadastra visitantes a qualquer momento antes da chegada; o cadastro aparece na portaria em tempo real |
| RN-VI-02 | Nome é obrigatório; documento é opcional. O visitante avulso tem data da visita, hoje por padrão, e não aceita datas passadas |
| RN-VI-03 | Visita recorrente vale nos dias da semana escolhidos, com faixa de horário e data de término opcionais |
| RN-VI-04 | Visitante não cadastrado entra se o morador autorizar por interfone; a portaria registra a entrada como "autorizado por interfone" |
| RN-VI-05 | Visitante na lista de bloqueio gera alerta na busca e no registro de entrada; a decisão final é da portaria |
| RN-VI-06 | O morador é notificado quando o visitante entra |
| RN-VI-07 | Sem saída registrada, a visita é encerrada 24h após a entrada com status "saída não registrada", sem horário de saída |
| RN-VI-08 | Quando o morador muda de unidade ou sai do condomínio, as visitas recorrentes dele são encerradas |
| RN-VI-09 | Visitante avulso sem entrada até o fim do dia da visita fica com status "não compareceu" |
| RN-VI-10 | Se o condomínio permitir aluguel por temporada (configurável, desligado por padrão; só deve ser ligado se o regimento permitir), o proprietário de unidade desocupada cadastra hóspedes de temporada como visitas com data de entrada e de saída. O hóspede não tem login nem score, e a portaria o vê marcado como "hóspede de temporada". Reclamações sobre a estadia são feitas contra a unidade (RN-CD-24) |
| RN-VI-11 | O morador pode montar uma **lista de visitantes**: várias pessoas autorizadas de uma vez, com nome da lista, data, faixa de horário (opcional) e local ou motivo (opcional) preenchidos uma só vez. Cada pessoa vira um visitante avulso e segue as regras de visitante avulso (RN-VI-01, RN-VI-02, RN-VI-05, RN-VI-06 e RN-VI-09): nome obrigatório, documento opcional, alerta de bloqueio na entrada, notificação ao morador e "não compareceu" no fim do dia. A lista não vale para visita recorrente (RN-VI-03) nem para hóspede de temporada (RN-VI-10). Quem pode cadastrar visitante pode montar lista |
| RN-VI-12 | A lista tem no máximo `visitante.lista_max_pessoas` pessoas (padrão 100). Acima disso, o envio é recusado com a mensagem do limite e de quantas pessoas sobram. Linhas em branco são ignoradas ao enviar. Nome repetido na mesma lista gera aviso, sem bloquear, porque pode ser outra pessoa com o mesmo nome |
| RN-VI-13 | A data da lista não pode ser anterior a hoje. A portaria só vê a lista no dia da data. Se houver faixa de horário, ela é só informativa: não gera o alerta "Fora do horário cadastrado" |
| RN-VI-14 | A lista pode ter uma **origem** opcional. Quando vem de uma reserva, data, horário e local vêm da reserva e não são editáveis, e a lista fica vinculada a ela. Se o número de pessoas passar da capacidade da área reservada, o app mostra um aviso, sem bloquear: a capacidade vale para quem está na área ao mesmo tempo, e o morador decide. Se a reserva for cancelada, a lista é cancelada junto e o morador é avisado. A sugestão de montar a lista logo após a reserva segue RN-RE-12 |
| RN-VI-15 | Até o fim do dia da lista, o morador adiciona pessoas, remove quem ainda não chegou (a visita dela fica "cancelada" e sai da portaria) ou cancela a lista inteira (quem já entrou continua registrado). Remover uma linha ao montar a lista pode ser desfeito na hora. Cada pessoa continua com o próprio estado (8.3) |
| RN-VI-16 | O app oferece, com um toque, os visitantes **recentes** (cadastrados nos últimos 90 dias) e **frequentes** (3 ou mais visitas) da unidade, dentro do prazo de retenção (8.4). O morador pode **salvar a lista** para usar de novo: o modelo guarda nome da lista, nomes e documentos, é visível só para a unidade e é apagado quando o morador muda de unidade ou sai (como em RN-VI-08) |
| RN-VI-17 | Na portaria, as pessoas da lista aparecem **agrupadas**, com o nome da lista, a unidade e o contador "N pessoas, M chegaram". A entrada e a saída são registradas pessoa a pessoa (1 toque, com Desfazer). O morador recebe o aviso da primeira chegada e, depois, um resumo agrupado a cada 15 minutos (ex.: "Aniversário do Theo: 12 de 18 chegaram"), para não receber dezenas de notificações |

### 8.2 Portaria sem internet

| ID | Regra |
| --- | --- |
| RN-OF-01 | A lista de visitantes do dia, dos blocos que a portaria atende, fica salva no aparelho da portaria e é atualizada a cada mudança enquanto há conexão |
| RN-OF-02 | Sem internet, a portaria vê a lista salva com a hora da última sincronização |
| RN-OF-03 | Entradas e saídas registradas offline ficam numa fila e são enviadas automaticamente ao voltar a conexão |
| RN-OF-04 | Se um registro offline divergir do cadastro (ex.: entrada de visitante que o morador cancelou), o porteiro é avisado ao sincronizar e deve confirmar por interfone com o morador que cadastrou; o aviso só fecha após a confirmação |
| RN-OF-05 | Divergências não são enviadas ao síndico |
| RN-OF-06 | A cópia salva é criptografada e apagada ao fim do dia e ao sair da conta |

### 8.3 Estados da visita

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Esperado | Cadastrado pelo morador, ainda não chegou | Entrou, Cancelado, Não compareceu |
| Não compareceu | Visitante avulso que não entrou até o fim do dia da visita (RN-VI-09) | — |
| Autorizado por interfone | Entrou sem cadastro, autorizado pelo morador | Saiu, Saída não registrada |
| Entrou | Entrada registrada pela portaria | Saiu, Saída não registrada |
| Saiu | Saída registrada | — |
| Saída não registrada | Encerrado automaticamente 24h após a entrada | — |
| Cancelado | Cancelado pelo morador antes da chegada | — |

### 8.4 Retenção

Dados de visitantes são anonimizados 6 meses após a visita (configurável dentro do limite legal).

## 9. Encomendas e chamados

A portaria registra encomendas e abre chamados, mas não os atende; chamados de limpeza são atendidos pela equipe do condomínio, e os de manutenção por empresas terceirizadas acompanhadas pelo síndico.

### 9.1 Encomendas

| ID | Regra |
| --- | --- |
| RN-EN-01 | A portaria registra a encomenda com unidade, remetente e foto opcional da etiqueta; o morador recebe push na hora |
| RN-EN-02 | Qualquer morador da unidade pode retirar; a portaria registra quem retirou |
| RN-EN-03 | Lembretes ao morador 3 e 7 dias após o recebimento |
| RN-EN-04 | Prazo final de guarda: 30 dias (configurável); vencido o prazo, o síndico é avisado. Síndico e subsíndico veem a lista de encomendas com prazo vencido; só o síndico (ou o subsíndico em substituição) marca a devolução |
| RN-EN-05 | Entregas de comida por aplicativo não são registradas |
| RN-EN-06 | A portaria pode corrigir a unidade de uma encomenda ainda não retirada; a unidade registrada por engano recebe aviso da correção |

| Estado da encomenda | Próximos estados |
| --- | --- |
| Recebida | Retirada, Prazo vencido |
| Prazo vencido | Retirada, Devolvida |
| Retirada | — |
| Devolvida | — |

**Entregas esperadas.** O morador avisa a portaria de uma entrega que vai chegar, para ela identificar o pacote e a unidade. O aviso é só informativo: não autoriza nada e não é exigido para receber.

| ID | Regra |
| --- | --- |
| RN-EN-07 | Qualquer morador da unidade, inclusive o síndico morador e o subsíndico, registra uma entrega esperada com **data esperada** (obrigatória, de hoje a 30 dias). São opcionais: **descrição** (até 60 caracteres), **faixa de horário** (de e até, sempre as duas, com o fim depois do início) e **origem** (Amazon, Correios, Mercado Livre, Shopee, iFood/entregador ou Outra, com texto livre de até 30 caracteres). Proprietário não residente não registra (RN-CD-19) |
| RN-EN-08 | Cada unidade tem no máximo 10 entregas esperadas ativas (parâmetro `entrega_esperada.limite_por_unidade`); "ativa" é a que está "Esperada". Qualquer morador da unidade vê, edita e cancela as da unidade |
| RN-EN-09 | Enquanto "Esperada" ou "Não chegou", a entrega pode ser editada (qualquer campo) ou cancelada. Editar a data de uma "Não chegou" para hoje ou depois é **reagendar**: ela volta a "Esperada" e conta no limite. Depois de "Chegou", não se edita nem se cancela. A portaria vê a edição na hora, sem push |
| RN-EN-10 | No dia da data esperada, a portaria vê a entrega em "Esperadas hoje", ordenada pelo início da faixa (sem faixa por último), com unidade, origem, faixa e descrição. Entregas de outras datas não aparecem. A entrega esperada **não autoriza**: a portaria recebe a encomenda de qualquer unidade sem aviso prévio (RN-EN-01), chegar fora da faixa não gera alerta, e o aviso não libera a entrada de entregador nem a retirada (visitantes seguem RN-VI) |
| RN-EN-11 | Ao registrar a encomenda, a portaria vê as entregas esperadas da unidade escolhida (de hoje, futuras e "Não chegou" dentro da tolerância) e pode vincular uma. A sugestão é automática: a única candidata ou, havendo várias, a de origem igual ao remetente; a portaria confirma ou escolhe "Não vincular". Uma encomenda vincula uma entrega. Vinculada, a entrega passa a "Chegou", o remetente vem da origem se estiver em branco, e o morador recebe o push normal da encomenda (RN-EN-01), sem aviso duplicado. Se a unidade da encomenda for corrigida (RN-EN-06), o vínculo se desfaz e a entrega volta a "Esperada" ou "Não chegou", conforme a data |
| RN-EN-12 | A origem iFood/entregador é só um aviso à portaria de que um entregador vai chegar; a RN-EN-05 continua valendo. Essa entrega aparece na portaria com o selo "Só aviso", sem ação de registro, nunca é vinculada a uma encomenda e, passada a data, fica "Encerrada" (não "Não chegou") |
| RN-EN-13 | À meia-noite, a entrega "Esperada" com data anterior a hoje passa a "Não chegou". O morador vê o selo e a ação "Reagendar", sem push. Ela some de "Esperadas hoje" nessa hora, mas continua vinculável pela portaria por 3 dias (`entrega_esperada.tolerancia_vinculo_dias`). Entregas "Chegou", "Não chegou", "Cancelada" e "Encerrada" ficam na lista do morador por 30 dias após a data |

| Estado da entrega esperada | Próximos estados |
| --- | --- |
| Esperada | Chegou, Não chegou, Cancelada, Encerrada (só iFood/entregador) |
| Não chegou | Esperada (reagendada), Chegou, Cancelada |
| Chegou | — |
| Cancelada | — |
| Encerrada | — |

### 9.2 Chamados

| ID | Regra |
| --- | --- |
| RN-CH-01 | Chamados são de limpeza ou de manutenção |
| RN-CH-02 | Abrem chamados: moradores, síndico, subsíndico e portaria; a portaria não atende chamados |
| RN-CH-03 | Todo chamado tem categoria, descrição e foto opcional |
| RN-CH-04 | A equipe de limpeza atende os chamados do setor, também sem internet; se duas pessoas concluírem o mesmo ciclo do chamado offline, vale a conclusão com o menor horário registrado pelo celular, mesmo que ela seja enviada depois. A ordem de chegada ao servidor não substitui esse critério. As operações, os horários do celular e os de recebimento são preservados; a conclusão que deixa de valer continua no histórico, com aviso aos funcionários envolvidos. Reenvio da mesma operação não cria nova conclusão nem novo ciclo. Empate exato e tratamento de relógio incorreto são detalhes técnicos ainda propostos no ADR-014 |
| RN-CH-05 | Manutenção é feita por empresas terceirizadas; o síndico registra a empresa, atualiza o status e conclui. O subsíndico acompanha os chamados sem alterá-los, exceto na substituição (RN-CD-27) |
| RN-CH-06 | Prazos: limpeza concluída em 24h; manutenção com primeira atualização em 48h (configuráveis). Chamados fora do prazo aparecem em destaque para o síndico |
| RN-CH-07 | Quem abriu é avisado da conclusão e pode reabrir em até 48h; o aviso também convida a avaliar o atendimento (RN-CH-15) |
| RN-CH-08 | Chamados de um funcionário desligado voltam para a fila do setor |
| RN-CH-09 | Quem abre o chamado classifica a urgência em um de três níveis, sem valor pré-selecionado: **alta** (risco para pessoas ou dano que cresce rápido; ex.: hall com líquido no chão, risco de queda), **média** (atrapalha o uso, sem risco imediato; ex.: lâmpada queimada) e **leve** (pode esperar alguns dias). O formulário mostra esses exemplos e orienta escolher o nível mais alto em caso de dúvida. Sem urgência, o chamado não é enviado |
| RN-CH-10 | A urgência aparece, com texto e cor, em toda lista e no detalhe do chamado, para quem abriu, síndico, subsíndico e funcionários: alta em vermelho, média em amarelo e leve em verde. O chamado guarda a urgência e a data e hora de abertura |
| RN-CH-11 | Só o síndico, ou o subsíndico na substituição (RN-CD-27), ajusta a urgência de um chamado aberto. Cada ajuste registra quem, quando e o valor anterior e o novo, aparece no detalhe e avisa quem abriu. Funcionários e portaria veem a urgência, mas não a alteram |
| RN-CH-12 | A urgência não altera os prazos de RN-CH-06 nem o estado do chamado |
| RN-CH-13 | As listas de chamados (morador, síndico, limpeza e manutenção) mostram primeiro os abertos e depois os concluídos. Dentro de cada grupo, a ordem é por urgência: alta, média e leve. Se a urgência empatar, o chamado mais antigo (data e hora de abertura, RN-CH-10) aparece primeiro. A ordem só muda a exibição: não altera os dados nem os prazos (RN-CH-06, RN-CH-12) |
| RN-CH-14 | Ao concluir um chamado, anexar fotos do serviço feito é opcional, até 5 fotos: a equipe de limpeza anexa na própria conclusão, e o síndico (ou o subsíndico na substituição) anexa ao concluir a manutenção. Sem foto, a conclusão segue igual. As fotos aparecem no detalhe do chamado para quem abriu, o síndico e o subsíndico; sem internet, ficam na fila de sincronização junto com a conclusão (RN-CH-04) |
| RN-CH-15 | Concluído o chamado, quem abriu pode avaliar o atendimento. Avaliam o morador, o síndico morador e o subsíndico que abriram o chamado; síndico profissional, portaria e funcionários não avaliam (igual à RN-PE-02). A avaliação vale para quem atendeu: o funcionário da conclusão efetiva, de menor horário do celular quando há concorrência offline (RN-CH-04), nos chamados de limpeza, e a empresa registrada (RN-CH-05) nos de manutenção. Se uma conclusão anterior chegar depois e passar a valer, a avaliação da conclusão superada fica somente no histórico, ligada ao atendente original, sem efeito nos agregados e sem ser transferida ao outro funcionário; quem abriu pode avaliar a conclusão que passou a valer |
| RN-CH-16 | A avaliação tem de 1 a 5 estrelas (obrigatória) e comentário opcional de até 500 caracteres. Antes de enviar, quem avalia diz em que se baseia, de forma explícita: "Vi as fotos do serviço" (só aparece se há fotos) ou "Conferi pessoalmente". Sem fotos, "Conferi pessoalmente" é a única base e precisa ser marcada, senão a avaliação não é enviada. A base fica registrada e aparece no detalhe do chamado para o síndico e o subsíndico; o morador pode não avaliar, e não avaliar não tem consequência |
| RN-CH-17 | A avaliação pode ser feita até 7 dias depois da conclusão (`chamado.janela_avaliacao_dias`, RN 13). Cada conclusão recebe uma única avaliação, definitiva: não se edita nem se apaga. Passada a janela, a ação some do chamado. Se o chamado ainda não foi avaliado ao fim de 24h da conclusão, quem abriu recebe um único lembrete, às 09:00 locais do dia seguinte ao fim dessas 24h (rotina de RN 14). Reabrir o chamado sem ter avaliado encerra a avaliação daquela conclusão; a nova conclusão abre nova janela, e a avaliação já feita continua valendo para a conclusão anterior. Na correção tardia de RN-CH-15, a conclusão efetiva fica disponível para nova avaliação pela mesma duração configurada em `chamado.janela_avaliacao_dias` (padrão 7 dias), contada da disponibilização da correção, com um único lembrete após 24h se não avaliada; a avaliação superada continua somente no histórico. Essa correção não reinicia o prazo de 48h para reabrir: ele segue a conclusão efetiva (RN-CH-07) |
| RN-CH-18 | Avaliação com 1 ou 2 estrelas é "avaliação baixa". Ela não reabre o chamado sozinha: logo depois de enviar, o app oferece "Reabrir chamado" se ainda estão dentro das 48h de RN-CH-07, ou "Abrir novo chamado" se passaram; a decisão é de quem avaliou. Toda avaliação baixa também avisa o síndico, com o comentário, e entra na lista de avaliações da Gestão. O aviso nunca vai ao funcionário nem à empresa |
| RN-CH-19 | O síndico (e o subsíndico na substituição) vê as avaliações agregadas por funcionário de limpeza e por empresa de manutenção: média, número de avaliações e distribuição por estrelas. Na avaliação de um chamado, o síndico e o subsíndico veem a nota, o comentário e a base no detalhe do chamado, onde já veem quem o abriu (RN-CH-10). A administradora vê só o agregado por funcionário e por empresa, sem comentários, sem chamados e sem identificar quem avaliou. Nenhum desses perfis vê a avaliação de um morador por outra tela |
| RN-CH-20 | O funcionário vê as avaliações que recebeu em "Minhas avaliações": média, número de avaliações, distribuição por estrelas e comentários, sem unidade, sem morador, sem chamado nem local, e com o mês no lugar da data. A média e os comentários só aparecem quando ele tem 3 ou mais avaliações; antes disso, o app mostra só "Poucas avaliações para mostrar a média." Ao ser desligado, as avaliações dele saem das listas por funcionário e continuam no agregado do setor |
| RN-CH-21 | A avaliação do atendimento não altera o score de ninguém, não abre reclamação e não entra na pesquisa mensal. O score do funcionário muda pela pesquisa mensal (RN-PE-05) e por reclamações; quem quiser reclamar de um atendimento usa a reclamação (RN 5) |

| Estado do chamado | Limpeza | Manutenção |
| --- | --- | --- |
| Aberto | Sim | Sim |
| Em atendimento | Sim | — |
| Orçamento | — | Sim |
| Agendado | — | Sim |
| Concluído | Sim | Sim |
| Reaberto (até 48h após a conclusão) | Sim | Sim |

A avaliação do atendimento (RN-CH-15 a RN-CH-17) não é um estado: um chamado concluído fica "Avaliação pendente" ou "Avaliado" como marcação extra, sem mudar o estado.

## 10. Comunicação, reuniões, votações e mandatos

Só o síndico fala em nome do condomínio, e cada unidade tem um voto, dado pelo proprietário.

### 10.1 Comunicação

| ID | Regra |
| --- | --- |
| RN-CO-01 | Comunicados são enviados pelo síndico, ou pelo subsíndico em substituição. Fora da substituição, o subsíndico só sugere (RN-CO-05) |
| RN-CO-02 | Comunicado geral tem público escolhido no envio: moradores, funcionários ou todos; o envio registra quem leu |
| RN-CO-03 | Comunicado individual aceita resposta do destinatário e fica no histórico dos dois |
| RN-CO-04 | A conversa com o alvo de uma reclamação é um comunicado individual vinculado à reclamação, iniciado pelo julgador, seja ele quem for; é a única exceção a RN-CO-01 |
| RN-CO-05 | Fora da substituição, o subsíndico pode sugerir um comunicado geral ou individual. A sugestão fica "Aguardando o síndico" até ele editar e enviar, quando sai em nome do síndico, ou descartar; o subsíndico é avisado do resultado. Ao ativar a substituição, as sugestões pendentes voltam para o subsíndico, que pode enviá-las |

### 10.2 Reuniões e votações

| ID | Regra |
| --- | --- |
| RN-VO-01 | Um voto por unidade, dado pelo proprietário (Código Civil, art. 1.335, III). Quando ele mora na unidade, é também o morador habilitado. Na unidade alugada, o inquilino vota só como procurador do proprietário (RN-VO-08) ou nas pautas de RN-VO-18 |
| RN-VO-02 | Na convocação, o síndico define data, local e pautas; cada pauta é informativa ou com votação, com opções e quórum definidos conforme a convenção |
| RN-VO-03 | Voto secreto; o resultado é publicado só após o encerramento, com a contagem por opção |
| RN-VO-08 | O proprietário pode indicar um procurador, usuário do mesmo condomínio (inclusive o inquilino da unidade), antes de a unidade votar; cada pessoa representa no máximo 1 unidade além das suas |
| RN-VO-10 | A votação online fica aberta da convocação até o encerramento da reunião |
| RN-VO-11 | O síndico, ou o subsíndico nas reuniões convocadas pelo síndico, registra os votos presenciais por unidade; quem registra fica no histórico; unidade que já votou online não vota de novo, exceto o proprietário que substitui o voto do inquilino (RN-VO-18) |
| RN-VO-12 | Após a reunião, o síndico anexa a ata e a lista de presença |
| RN-VO-16 | Com o módulo de cobrança ativo, unidade em atraso não vota; o motivo aparece só para quem vota pela unidade e para os responsáveis financeiros dela (RN-FI-11) |
| RN-VO-17 | Pauta que não atinge o quórum é publicada como "sem quórum"; empate em pauta é publicado como "empate". Nos dois casos, o resultado mostra a contagem, e a consequência segue a convenção, fora do app |
| RN-VO-18 | Na convocação, o síndico marca cada pauta com votação como "envolve despesa extraordinária" ou não; o padrão é "envolve". Nas pautas que não envolvem, o inquilino pode votar pela unidade, e o voto dele vale se o proprietário não votar até o encerramento. Se o proprietário votar, o voto dele substitui o do inquilino, que é avisado (Lei 8.245/1991, art. 24, §4º). Nas eleições, vale RN-VO-01: vota o proprietário ou o procurador dele |

### 10.3 Eleições e mandatos

| ID | Regra |
| --- | --- |
| RN-VO-04 | Síndico e subsíndico devem ser de unidades diferentes |
| RN-VO-05 | Reeleição do síndico morador e do subsíndico: configurável pela administradora; o padrão segue a lei e permite reeleição |
| RN-VO-06 | Síndico profissional não passa por eleição no app nem segue regra de reeleição; a administradora registra contratação, recontratação ou desligamento |
| RN-VO-07 | Empate na eleição gera segundo turno entre os empatados em até 7 dias; empate em pauta segue RN-VO-17 |
| RN-VO-09 | Condomínio sem subsíndico deve ter conselho fiscal com um ou mais membros; enquanto não tiver, a administradora ou o suporte recebe um alerta pendente |
| RN-VO-13 | Candidaturas são feitas no app, dentro do prazo definido na convocação; o sistema bloqueia candidatos inelegíveis e mostra o motivo |
| RN-VO-14 | Se o subsíndico eleito for da mesma unidade do síndico eleito, assume o próximo mais votado para subsíndico |
| RN-VO-15 | A administradora registra início e fim de cada mandato |
| RN-VO-19 | O inquilino pode se candidatar a síndico ou subsíndico, salvo se a convenção proibir (Código Civil, art. 1.347) |

## 11. Planos comerciais e solicitações de suporte

O preço depende do número de unidades (apartamentos, casas ou salas) e de o condomínio ter ou não administradora.

| Faixa de unidades | Essencial (com administradora) | Gestão + Suporte (sem administradora) | Solicitações incluídas por mês (Gestão + Suporte) |
| --- | --- | --- | --- |
| Até 30 | R$ 99/mês | R$ 249/mês | 10 |
| 31 a 80 | R$ 179/mês | R$ 329/mês | 10 |
| 81 a 150 | R$ 299/mês | R$ 449/mês | 10 |
| 151 a 300 | R$ 499/mês | R$ 649/mês | 25 |
| 301 a 600 | R$ 799/mês | R$ 949/mês | 50 |
| Acima de 600 | Sob consulta | Sob consulta | Sob consulta |

| ID | Regra |
| --- | --- |
| RN-PL-01 | A faixa é definida pelo número de unidades cadastradas; mudança de faixa vale a partir do ciclo seguinte |
| RN-PL-02 | No Gestão + Suporte, a equipe da plataforma faz o papel de administradora: cadastros, mudanças de moradores, novas áreas e regras |
| RN-PL-03 | Cada pedido enviado pelo síndico ou pelo proprietário (RN-CD-23) e atendido conta como uma solicitação; pedidos recusados e a importação inicial na implantação não contam |
| RN-PL-04 | A franquia mensal de solicitações depende da faixa de unidades (tabela acima); as não usadas não acumulam |
| RN-PL-05 | Cada solicitação além da franquia custa R$ 15 e entra na fatura seguinte; o síndico vê o contador antes de enviar |
| RN-PL-06 | Se o condomínio contratar uma administradora, passa ao Essencial no ciclo seguinte e o suporte perde o acesso |
| RN-PL-07 | Os preços são revistos uma vez por ano; o novo valor é comunicado com 30 dias de antecedência e vale a partir do ciclo seguinte |

## 12. Cobrança condominial

Quando o módulo está ativo, cada unidade recebe a cobrança mensal da taxa condominial nas formas de pagamento escolhidas pela administradora, e o dinheiro vai direto para a conta do condomínio.

### 12.1 Regras

| ID | Regra |
| --- | --- |
| RN-FI-01 | O módulo de cobrança é opcional e ativado por condomínio pela administradora ou pelo suporte; só pode ser ativado com a conta bancária do condomínio cadastrada (RN-PG-01) |
| RN-FI-02 | A administradora escolhe as formas aceitas entre boleto (com QR Code Pix), Pix e cartão de crédito; pelo menos uma fica ativa (configurável) |
| RN-FI-03 | Cada cobrança é ordinária ou extraordinária (RN-FI-20) e é emitida ao responsável financeiro daquele tipo. Por padrão, os dois são o morador habilitado. Na unidade alugada, o padrão é o inquilino nas ordinárias e o proprietário nas extraordinárias (Lei 8.245/1991, arts. 22, X, e 23, XII); a administradora pode mudar conforme o contrato de locação. Na unidade desocupada, o proprietário responde pelas duas |
| RN-FI-04 | O vencimento padrão é no dia 10 (configurável); se cair em dia não útil, passa para o próximo dia útil |
| RN-FI-05 | As cobranças mensais são geradas 15 dias antes do vencimento (configurável) |
| RN-FI-06 | Atraso gera multa de 2% e juros de 1% ao mês, proporcionais aos dias (configuráveis); a multa nunca passa de 2%, limite do Código Civil (art. 1.336, §1º) |
| RN-FI-07 | Desconto por pagamento até o vencimento é opcional (padrão 0%) |
| RN-FI-08 | A segunda via sempre sai com o valor atualizado, com multa e juros do dia |
| RN-FI-09 | A unidade fica "em atraso" no dia seguinte ao vencimento sem pagamento e entra no painel de inadimplência |
| RN-FI-10 | A situação financeira de uma unidade é vista só pela administradora, pelo síndico (ou subsíndico em substituição) e pelo proprietário; cada responsável financeiro vê as cobranças emitidas para ele. Nunca aparece para outros moradores |
| RN-FI-11 | Unidade em atraso não vota nas assembleias (Código Civil, art. 1.335, III), qualquer que seja o tipo da cobrança vencida; o motivo é mostrado só a quem vota pela unidade e aos responsáveis financeiros dela |
| RN-FI-12 | Bloquear reservas de unidade em atraso é configurável e vem desligado; só deve ser ligado se o regimento previr |
| RN-FI-13 | A baixa é automática quando o gateway confirma o pagamento; pagamento feito fora do app é registrado pela administradora, com comprovante e motivo |
| RN-FI-14 | Cobranças extras (rateio, fundo de reserva, multa por infração) são lançadas pela administradora, a pedido do síndico, com descrição, tipo (ordinária ou extraordinária), valor, unidades e vencimento |
| RN-FI-15 | Só a administradora cancela uma cobrança, com motivo registrado em auditoria |
| RN-FI-16 | Lembretes ao responsável: 5 dias antes, no dia, 1 e 7 dias depois do vencimento |
| RN-FI-17 | Os valores vão para a mesma conta bancária das reservas (RN-PG-01 a RN-PG-04); as taxas do gateway são descontadas do valor recebido |
| RN-FI-18 | Acordos de parcelamento de débitos entram na versão 2 |
| RN-FI-19 | Pagamento em duplicidade de uma cobrança gera alerta à administradora, que devolve o valor pelo gateway ou o abate na próxima cobrança da unidade; a escolha fica registrada em auditoria |
| RN-FI-20 | A taxa mensal é ordinária. Fundo de reserva, obras, benfeitorias e indenizações trabalhistas anteriores à locação são extraordinárias (Lei 8.245/1991, art. 22, parágrafo único) e vêm assim marcadas ao lançar a cobrança extra. A multa por infração é emitida a quem responde pelas ordinárias, e o proprietário é avisado; se ela vencer sem pagamento, a administradora pode reemiti-la ao proprietário, que responde perante o condomínio |

### 12.2 Estados da cobrança

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Emitida | Gerada e enviada ao responsável, ainda no prazo | Paga, Em atraso, Cancelada |
| Em atraso | Vencida sem pagamento; multa e juros correndo | Paga com atraso, Em acordo (versão 2), Cancelada |
| Paga | Paga até o vencimento | — |
| Paga com atraso | Paga depois do vencimento, com multa e juros | — |
| Em acordo | Débito parcelado (versão 2) | Paga com atraso, Em atraso |
| Cancelada | Cancelada pela administradora, com motivo | — |

### 12.3 Controle de receitas e despesas

O controle é **gerencial**: mostra à administradora, ao síndico e ao conselho fiscal para onde vai o dinheiro do condomínio, e serve de base para a contabilidade. Não substitui balancete, prestação de contas oficial nem a aprovação das contas em assembleia, que ficam fora do app. Vale em condomínios com ou sem o módulo de cobrança.

| ID | Regra |
| --- | --- |
| RN-FI-21 | O painel mostra, para um mês ou para 3, 6 ou 12 meses, as receitas, as despesas e o saldo (receitas menos despesas), pelo regime de caixa: vale a data do pagamento ou do recebimento, não a do vencimento. Para um mês, compara com o mês anterior; para vários meses, só mostra a evolução. As cobranças extraordinárias (fundo de reserva e obras) aparecem discriminadas para o saldo não parecer sobra da rotina. Todo gráfico tem tabela com os mesmos valores |
| RN-FI-22 | Com o módulo de cobrança ativo, toda cobrança paga (RN-FI-13) e toda reserva paga viram receita sozinhas, na data da confirmação do pagamento, nas categorias do item 12.4. O lançamento automático não se edita nem se exclui: a correção é feita na origem (cancelamento de cobrança, baixa manual, devolução) e o painel acompanha |
| RN-FI-23 | A receita entra pelo valor pago; a taxa do gateway (RN-FI-17) entra sozinha como despesa de "Administração". Devolução de pagamento em duplicidade (RN-FI-19) e reembolso de reserva (RN-CA-02) geram, sozinhos, um lançamento de estorno na mesma categoria da receita, com a data da devolução |
| RN-FI-24 | A administradora lança despesas e receitas avulsas com data, categoria, valor maior que zero e fornecedor (despesa) ou origem (receita); descrição e comprovante (foto ou PDF de até 10 MB) são opcionais, e o app destaca as despesas sem comprovante. Receita avulsa só na categoria "Outras receitas" (aluguel de antena, rendimento de aplicação, indenização de seguro etc.), porque as demais vêm das cobranças e reservas; com o módulo de cobrança desligado, valem também "Taxa condominial" e "Fundo de reserva" avulsas, já que o app não vê esses pagamentos. A folha de funcionários é lançada pelo total do mês, sem nome nem salário individual |
| RN-FI-25 | A data de um lançamento não pode ser futura nem cair em mês fechado. Despesa lançada sem fornecedor é recusada |
| RN-FI-26 | Um lançamento pode ser marcado como recorrente mensal, com valor fixo (honorários, seguro, aluguel de antena): o sistema cria o lançamento do mês no dia escolhido (nos meses curtos, no último dia). Contas variáveis, como energia e água, são digitadas todo mês. Cada lançamento criado é comum; encerrar a recorrência vale dali em diante e não muda meses anteriores |
| RN-FI-27 | Enquanto o mês está aberto, só a administradora edita ou exclui lançamentos avulsos, e cada alteração fica na auditoria, com autor, data, valor antigo e valor novo |
| RN-FI-28 | O mês fecha sozinho no dia 10 do mês seguinte (configurável), ou antes, quando a administradora o fecha depois do último dia do mês. Lançamento de mês fechado não se edita nem se exclui, e o mês não reabre: a correção é um **estorno**, que a administradora faz com motivo obrigatório. O estorno é um novo lançamento de valor oposto, na mesma categoria, ligado ao original e com a data do estorno (mês corrente); o original passa a "Estornado", e um estorno não se estorna (para refazer, lança-se o valor correto). Pagamentos confirmados depois do fechamento entram no mês do pagamento |
| RN-FI-29 | A administradora (ou o suporte, no plano Gestão + Suporte) lança, fecha e estorna. O síndico (ou o subsíndico em substituição) e o conselho fiscal veem tudo em modo leitura. Moradores, proprietários não residentes e funcionários não veem as finanças |
| RN-FI-30 | Telas e exportações mostram receitas de cobrança agregadas por categoria e quantidade de cobranças pagas, sem unidade nem responsável financeiro (SEG-17). O CSV de cobranças por unidade (RF-FI-15) continua só da administradora. A exportação em CSV e PDF respeita o filtro aplicado e não inclui dados pessoais além do nome do fornecedor |
| RN-FI-31 | Síndico, subsíndico em substituição e conselho fiscal podem comentar um lançamento ou o mês, inclusive depois do fechamento. O comentário mostra autor e data, não se edita, avisa a administradora e não altera valores nem equivale à aprovação das contas |
| RN-FI-32 | Categorias fixas de despesa: Energia, Água e esgoto, Gás, Serviços terceirizados (com o serviço: portaria, limpeza, elevador, jardinagem ou outro), Folha de funcionários, Manutenção e obras, Seguros, Administração (honorários e tarifas) e Outros. Receitas: Taxa condominial, Cobranças extras (fundo de reserva, obras e rateios), Multas e juros por atraso, Multas por infração, Aluguel de áreas (reservas pagas) e Outras receitas |

### 12.4 Estados do lançamento e origem das receitas

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Lançado | Lançamento válido; em mês aberto, o avulso ainda se edita ou se exclui | Estornado (só em mês fechado) |
| Estornado | Anulado por um estorno; continua visível, com o link para o estorno | — |
| Estorno | Lançamento de valor oposto que anula outro, com o motivo | — |

| Categoria de receita | Origem | Lançamento |
| --- | --- | --- |
| Taxa condominial | Cobranças ordinárias pagas (RN-FI-13) | Automático |
| Cobranças extras | Cobranças extraordinárias pagas: fundo de reserva, obras, rateios (RN-FI-20) | Automático |
| Multas e juros por atraso | Multa e juros de cobranças pagas com atraso (RN-FI-06) | Automático |
| Multas por infração | Cobranças de multa por infração pagas (RN-FI-14) | Automático |
| Aluguel de áreas | Reservas pagas (RN 7.3) | Automático |
| Outras receitas | Antena, rendimento de aplicação, indenização de seguro etc. | Avulso, pela administradora |

## 13. Catálogo de parâmetros configuráveis

São 36 parâmetros; todos são alterados pela administradora (ou pelo suporte, no plano Gestão + Suporte), e o padrão de plataforma pelo admin da plataforma.

| Parâmetro | Regra | Padrão | Faixa permitida | Nível mais específico |
| --- | --- | --- | --- | --- |
| `score.limite_bloqueio_gratuitas` | RN-SC-09 | 60 | 0 a 100 | Condomínio |
| `score.pontos_leve` | RN-SC-03 | 5 | 1 a 20 | Condomínio |
| `score.pontos_media` | RN-SC-03 | 10 | 5 a 30 | Condomínio |
| `score.pontos_grave` | RN-SC-03 | 20 | 10 a 50 | Condomínio |
| `score.penalidade_desproporcional` | RN-SC-03 | 5 | 0 a 20 | Condomínio |
| `score.penalidade_falsa` | RN-SC-03 | 15 | 0 a 30 | Condomínio |
| `reclamacao.prazo_decisao_dias` | RN-RC-06 | 15 | 3 a 60 | Condomínio |
| `reclamacao.prazo_resposta_alvo_dias` | RN-RC-04 | 5 | 2 a 15 | Condomínio |
| `reserva.tipo` | RN-RE-01 | Gratuita | Paga ou gratuita | Área |
| `reserva.valor` | RN-RE-01 | — | R$ 1 a R$ 10.000 | Área |
| `reserva.prazo_pagamento_horas` | RN-RE-03 | 24 | 1 a 72 | Área |
| `reserva.prazo_cancelamento_reembolso_horas` | RN-CA-02 | 12 | 0 a 168 | Área |
| `reserva.antecedencia_min_horas` | RN-RE-06 | 24 | 0 a 720 | Área |
| `reserva.antecedencia_max_dias` | RN-RE-06 | 60 | 1 a 365 | Área |
| `reserva.limite_mensal_por_unidade` | RN-RE-07 | 2 | 1 a 31 | Área |
| `reserva.lembrete_antecedencia_horas` | RN-RE-14 | 24 | 1 a 72 | Condomínio |
| `chamado.prazo_limpeza_horas` | RN-CH-06 | 24 | 1 a 168 | Condomínio |
| `chamado.prazo_manutencao_resposta_horas` | RN-CH-06 | 48 | 4 a 168 | Condomínio |
| `chamado.janela_avaliacao_dias` | RN-CH-17 | 7 | 1 a 30 | Condomínio |
| `encomenda.prazo_guarda_dias` | RN-EN-04 | 30 | 7 a 90 | Condomínio |
| `entrega_esperada.limite_por_unidade` | RN-EN-08 | 10 | 1 a 30 | Condomínio |
| `entrega_esperada.tolerancia_vinculo_dias` | RN-EN-13 | 3 | 0 a 7 | Condomínio |
| `visitante.retencao_meses` | 8.4 | 6 | 1 a 12 | Condomínio |
| `visitante.lista_max_pessoas` | RN-VI-12 | 100 | 10 a 300 | Condomínio |
| `mandato.reeleicao_permitida` | RN-VO-05 | Sim | Sim ou não | Condomínio |
| `cobranca.formas_pagamento` | RN-FI-02 | Boleto, Pix e cartão | Ao menos uma das três | Condomínio |
| `cobranca.dia_vencimento` | RN-FI-04 | 10 | 1 a 28 | Condomínio |
| `cobranca.antecedencia_emissao_dias` | RN-FI-05 | 15 | 5 a 30 | Condomínio |
| `cobranca.multa_atraso_pct` | RN-FI-06 | 2% | 0% a 2% | Condomínio |
| `cobranca.juros_mes_pct` | RN-FI-06 | 1% | 0% a 1% | Condomínio |
| `cobranca.desconto_pontualidade_pct` | RN-FI-07 | 0% | 0% a 10% | Condomínio |
| `cobranca.bloqueia_reserva_em_atraso` | RN-FI-12 | Não | Sim ou não | Condomínio |
| `financeiro.dia_fechamento_mes` | RN-FI-28 | 10 | 1 a 28 | Condomínio |
| `locacao.aviso_fim_contrato_dias` | RN-CD-21 | 30 | 7 a 90 | Condomínio |
| `locacao.carencia_fim_contrato_dias` | RN-CD-21 | 7 | 0 a 30 | Condomínio |
| `locacao.temporada_permitida` | RN-VI-10 | Não | Sim ou não | Condomínio |

Valores fora da faixa são recusados no cadastro, com a faixa permitida na mensagem de erro.

## 14. Rotinas automáticas

O sistema executa 21 rotinas sem ação de ninguém; cada execução é registrada em log.

**Horário das rotinas (fuso do condomínio).** Todas as rotinas usam o fuso do condomínio (padrão `America/Sao_Paulo`). Rotina diária sem horário próprio roda na **madrugada**, entre 00:00 e 06:00, uma depois da outra. Rotina diária que envia lembrete ou aviso a pessoas roda às **09:00**, para que ninguém receba notificação de madrugada. As rotinas "Prazos de reclamação e chamado" e "Fim de contrato de locação" têm duas etapas dentro da mesma rotina: o efeito de regra (liberar decisão, marcar chamados fora do prazo, desativar inquilino e dependentes, marcar a unidade como desocupada) roda na madrugada, e os avisos saem às 09:00. As rotinas com horário na tabela (00:00 e 23:59) e as que rodam a cada 5 min, a cada hora ou por evento mantêm o seu horário. Decisão de Pedro em 09/11/2026.

**Notificação gerada por rotina da madrugada.** A mudança acontece na madrugada, mas o push que ela gera (por exemplo, de score, cobrança, reclamação encerrada, chamado ou unidade) fica na fila e sai às 09:00 locais. A regra vale para o push gerado por rotina, ou por consequência direta dela (como a rotina de bloqueio de reservas gratuitas, disparada por alteração de score feita por rotina). Push de evento disparado por pessoa (por exemplo, visitante entrou, decisão de reclamação, divergência de sincronização) sai na hora, sem mudança. Decisão de Pedro em 09/11/2026.

| Faixa | Rotinas | Horário |
| --- | --- | --- |
| Meia-noite (já definida) | Visitantes que não vieram, entregas esperadas que não chegaram, limpeza de dados offline | 00:00 |
| Madrugada | Recuperação de score, faltas em reservas, encerrar reclamações sem recurso, anonimização de visitantes, gerar cobranças mensais, marcar cobranças em atraso, lançamentos recorrentes, fechar o mês financeiro, etapa de efeito de prazos de reclamação e chamado, etapa de efeito de fim de contrato de locação | Entre 00:00 e 06:00, em sequência |
| Lembrete ou aviso a pessoas | Lembretes de encomenda, lembrete de avaliação de chamado, lembretes de cobrança, etapa de aviso de prazos de reclamação e chamado, etapa de aviso de fim de contrato de locação | 09:00 |
| Sem faixa diária | Expirar reservas não pagas e lembrete de reserva (a cada 5 min), saída não registrada (a cada hora), bloqueio de reservas gratuitas (por evento), fechamento da pesquisa (23:59 do último dia do mês) | Como já definido |

| Rotina | Frequência | Horário local | O que faz | Regra |
| --- | --- | --- | --- | --- |
| Expirar reservas não pagas | A cada 5 min | Sem horário fixo | Libera o horário de reservas pagas cujo prazo de pagamento venceu | RN-RE-03 |
| Saída não registrada | A cada hora | Sem horário fixo | Encerra visitas com mais de 24h desde a entrada | RN-VI-07 |
| Visitantes que não vieram | Diária, à meia-noite | 00:00 | Marca como "não compareceu" os visitantes avulsos do dia sem entrada | RN-VI-09 |
| Recuperação de score | Diária | 00:00 a 06:00 | Soma +5 a quem completou 2 meses de regularidade e inicia novo período | RN-SC-08 |
| Bloqueio de reservas gratuitas | A cada alteração de score | Sem horário fixo | Bloqueia ou libera reservas gratuitas conforme o limite | RN-SC-09 |
| Fechamento da pesquisa | Último dia do mês, 23h59 | 23:59 do último dia | Calcula médias, ajusta scores dos funcionários e publica notas dos setores | RN-PE-05 a RN-PE-08 |
| Faltas em reservas | Diária | 00:00 a 06:00 | Conta as faltas em reservas gratuitas no trimestre por vínculo de moradia e aplica −5 a cada 2 faltas no score daquela unidade | RN-RE-10 |
| Lembrete de reserva | A cada 5 min | Sem horário fixo | Envia push, uma única vez, ao morador que fez a reserva Confirmada, 24h (`reserva.lembrete_antecedencia_horas`) antes do início, se ele não desligou o lembrete; ignora reservas aguardando pagamento, canceladas, expiradas ou criadas com menos antecedência que o parâmetro | RN-RE-14 |
| Lembretes de encomenda | Diária | 09:00 | Envia lembretes de 3 e 7 dias e avisa o síndico ao fim do prazo de guarda | RN-EN-03, RN-EN-04 |
| Entregas esperadas que não chegaram | Diária, à meia-noite | 00:00 | Passa a "Não chegou" a entrega esperada com data anterior (iFood/entregador vira "Encerrada") | RN-EN-12, RN-EN-13 |
| Prazos de reclamação e chamado | Diária, em duas etapas | Efeito: 00:00 a 06:00; aviso: 09:00 | Etapa de efeito: libera a decisão quando o alvo não responde em 5 dias e marca os chamados fora do prazo. Etapa de aviso: lembra o julgador e avisa os envolvidos | RN-RC-04, RN-RC-06, RN-CH-06 |
| Lembrete de avaliação de chamado | Diária | 09:00 | Envia um único lembrete a quem abriu o chamado concluído e ainda não avaliou, às 09:00 locais do dia seguinte ao fim das 24h após a conclusão; em correção tardia, as 24h contam da disponibilização da conclusão efetiva. Encerra a avaliação ao fim da janela configurada, sem considerar avaliações somente históricas nos agregados | RN-CH-17 |
| Encerrar reclamações sem recurso | Diária | 00:00 a 06:00 | Encerra reclamações decididas há mais de 7 dias sem recurso | RN-RC-15 |
| Limpeza de dados offline | Diária, à meia-noite | 00:00 | Manda os aparelhos da portaria e da limpeza apagarem a cópia do dia | RN-OF-06 |
| Anonimização de visitantes | Diária | 00:00 a 06:00 | Anonimiza visitas mais antigas que o prazo de retenção | 8.4 |
| Gerar cobranças mensais | Diária | 00:00 a 06:00 | Gera a cobrança de cada unidade 15 dias antes do vencimento | RN-FI-05 |
| Marcar cobranças em atraso | Diária | 00:00 a 06:00 | Muda para "em atraso" as cobranças vencidas sem pagamento e atualiza multa e juros | RN-FI-06, RN-FI-09 |
| Lembretes de cobrança | Diária | 09:00 | Envia lembretes 5 dias antes, no dia, 1 e 7 dias depois do vencimento | RN-FI-16 |
| Lançamentos recorrentes | Diária | 00:00 a 06:00 | Cria os lançamentos recorrentes do mês no dia escolhido (no último dia, nos meses curtos) | RN-FI-26 |
| Fechar o mês financeiro | Diária | 00:00 a 06:00 | No dia configurado do mês seguinte, fecha o mês financeiro anterior se a administradora ainda não o fechou | RN-FI-28 |
| Fim de contrato de locação | Diária, em duas etapas | Efeito: 00:00 a 06:00; aviso: 09:00 | Etapa de efeito: sem renovação, desativa o inquilino e os dependentes após a carência e marca a unidade como desocupada. Etapa de aviso: avisa 30 dias antes do fim do contrato | RN-CD-21 |
