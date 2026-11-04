# Regras de Negócio — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

## 1. Objetivo e como ler

Este documento detalha todas as regras de negócio do CondomiFacil, a partir do PRD; cada regra tem um ID que deve ser citado no código, nos testes e nas tarefas.

**Como ler**

- Os IDs seguem o padrão `RN-<módulo>-<número>`, e este documento é a fonte oficial das regras: o PRD traz só um resumo, e o PRD e as histórias de usuário citam estes IDs.
- Uma regra marcada como **configurável** tem um parâmetro no catálogo da seção 13, com valor padrão, faixa permitida, nível e quem pode alterar.
- Regras sem essa marca são fixas: valem igual para todos os condomínios.

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
| Morador habilitado | Único morador de cada unidade que vota e responde pela unidade, inclusive perdendo pontos em reclamações contra ela |
| Unidade ativa | Unidade escolhida no seletor; o app mostra os dados dela |
| Julgador | Quem decide uma reclamação: síndico, subsíndico, administradora ou conselho fiscal, conforme RN-RC-03 |
| Alvo | Funcionário ou unidade contra quem a reclamação foi feita |
| Reclamante | Morador que registrou a reclamação |
| Período de regularidade | Contagem de 2 meses sem reclamação validada nem penalidade por reclamação; ao completar, o score recupera 5 pontos |
| Reserva paga | Reserva de área que exige pagamento |
| Reserva gratuita | Reserva de área sem pagamento |
| Substituição | Período em que o subsíndico exerce as funções de síndico |
| Síndico profissional | Síndico contratado, sem unidade no condomínio |
| Solicitação de suporte | Pedido de cadastro, alteração ou configuração atendido pela equipe da plataforma no plano Gestão + Suporte |
| Sincronização | Envio ao servidor do que a portaria ou a limpeza registrou sem internet |
| Taxa condominial | Valor mensal que cada unidade paga ao condomínio |
| Responsável financeiro | Quem recebe e paga as cobranças da unidade; por padrão, o morador habilitado |
| Em atraso | Unidade com cobrança vencida e não paga; aparece no painel de inadimplência |

## 3. Cadastros, unidades e papéis

Ninguém se cadastra sozinho: todo usuário é pré-cadastrado pela administradora ou pelo suporte, e cada unidade tem exatamente um morador habilitado.

| ID | Regra |
| --- | --- |
| RN-CD-01 | Todo usuário é pré-cadastrado pela administradora ou, no plano Gestão + Suporte, pela equipe da plataforma |
| RN-CD-02 | No primeiro acesso, o usuário recebe um código de 6 dígitos no e-mail cadastrado, válido por 15 minutos, com até 5 tentativas; depois disso, precisa pedir novo código |
| RN-CD-03 | O usuário só usa o app após aceitar termos de uso, política de privacidade e regimento do condomínio; nova versão de qualquer um exige novo aceite antes de continuar |
| RN-CD-04 | Cada unidade tem exatamente um morador habilitado; a unidade não pode ser salva sem ele, e cada troca é registrada com data |
| RN-CD-05 | Um usuário pode ter vínculo com várias unidades e condomínios; o app mostra só os dados da unidade ativa, e cada unidade tem painel e métricas separados |
| RN-CD-06 | O síndico não cadastra ninguém: ele envia uma solicitação de cadastro, alteração ou remoção, que a administradora ou o suporte atende ou recusa com motivo |
| RN-CD-07 | Na mudança de um morador, o acesso é desativado e o histórico mantido; reservas futuras são canceladas com reembolso integral, e visitas recorrentes são encerradas |
| RN-CD-08 | No desligamento de um funcionário, os chamados abertos dele voltam para a fila do setor; as notas da pesquisa ficam no histórico |
| RN-CD-09 | Funcionários terceirizados são cadastrados como funcionários, com o nome da empresa |
| RN-CD-10 | Síndico e subsíndico devem ser de unidades diferentes |
| RN-CD-11 | O síndico morador mantém todas as funções de morador; o síndico profissional não tem nenhuma |
| RN-CD-12 | A substituição do síndico pelo subsíndico é ativada pela administradora ou pelo síndico, e pode ser desativada por eles a qualquer momento; cada ativação e desativação é registrada |
| RN-CD-13 | Se o mandato do síndico terminar antes do prazo (renúncia ou destituição), o subsíndico assume até a nova eleição |
| RN-CD-14 | Condomínio sem subsíndico deve ter conselho fiscal com um ou mais membros (RN-VO-09) |
| RN-CD-15 | A lista de pessoas com entrada bloqueada é mantida pela administradora, com nome, documento e motivo |
| RN-CD-16 | O suporte da plataforma só acessa condomínios do plano Gestão + Suporte, e cada acesso é registrado |
| RN-CD-17 | O condomínio pode ter blocos (torres ou quadras) e várias portarias; cada unidade pertence a um bloco, e cada portaria atende todos os blocos ou só os definidos pela administradora |

## 4. Score

Todo usuário, exceto visitantes, tem um score de 0 a 100 que começa em 100, cai com reclamações e avaliações ruins e se recupera com regularidade.

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
| Duas faltas em reservas gratuitas no mesmo trimestre | Morador que reservou | −5 | Não |
| Período de regularidade completo (2 meses) | Qualquer usuário | +5 | Começa um novo período |

### 4.2 Regras gerais

| ID | Regra |
| --- | --- |
| RN-SC-01 | O score vai de 0 a 100; ganhos acima de 100 e perdas abaixo de 0 são descartados. Visitantes não têm score |
| RN-SC-02 | O score individual é visto só pelo próprio usuário. Exceções: todos veem o score do síndico; o julgador e a administradora veem identidade e score do reclamante e do alvo dentro da reclamação; a administradora vê o score dos funcionários; sem administradora, síndico e subsíndico veem o score dos funcionários |
| RN-SC-03 | Os pontos por gravidade e por motivo de negativa são configuráveis por condomínio |
| RN-SC-04 | Reclamação contra uma unidade tira pontos só do morador habilitado |
| RN-SC-05 | Penalidade só é aplicada após a decisão; reclamações pendentes não alteram o score |
| RN-SC-08 | Recuperação: +5 pontos a cada 2 meses de regularidade. Reclamação validada contra a pessoa, ou penalidade por reclamação desproporcional ou falsa feita por ela, reinicia o período. Reclamações pendentes ou negadas sem penalidade não interrompem a contagem |
| RN-SC-09 | Score menor ou igual a 60 (configurável) tira o direito a reservas gratuitas; reservas pagas continuam liberadas. O direito volta automaticamente quando o score passa de 60 |
| RN-SC-10 | O bloqueio vale só para a pessoa; os outros moradores da unidade continuam reservando |
| RN-SC-11 | O score não decide nada sozinho no julgamento; o julgador o usa como referência |
| RN-SC-12 | Cada alteração aparece no histórico do usuário com data, motivo e pontos; a identidade do reclamante nunca aparece no histórico do alvo |

### 4.3 Exemplo

1. Ana tem 100 pontos. Em 10/01, uma reclamação de gravidade média contra ela é validada: vai a 90 e o período de regularidade começa em 10/01.
2. Em 10/03, completa 2 meses sem novas ocorrências: vai a 95 e começa novo período.
3. Em 20/03, Ana faz uma reclamação negada como falsa: vai a 80 e o período reinicia em 20/03.
4. Em 25/03, uma reclamação contra ela é negada de boa-fé: nada muda e o período segue contando.
5. Em 20/05, completa 2 meses: vai a 85.

## 5. Reclamações

Toda reclamação é identificada, tem um único alvo do mesmo condomínio e só é decidida depois que o julgador conversa com o alvo.

### 5.1 Quem julga

| Alvo da reclamação | Situação | Julgador |
| --- | --- | --- |
| Funcionário ou unidade comum | Normal | Síndico |
| Funcionário ou unidade comum | Síndico em substituição | Subsíndico |
| Síndico ou a unidade dele | Há subsíndico | Subsíndico |
| Síndico ou a unidade dele | Sem subsíndico | Administradora; sem administradora, conselho fiscal |
| Subsíndico ou a unidade dele | Síndico presente | Síndico |
| Subsíndico ou a unidade dele | Síndico ausente (substituição ativa) | Administradora; sem administradora, fica pendente até o síndico avaliar |

### 5.2 Regras

| ID | Regra |
| --- | --- |
| RN-RC-01 | Reclamações são identificadas; o alvo nunca vê quem reclamou |
| RN-RC-02 | Cada reclamação tem um único alvo, do mesmo condomínio do reclamante: um funcionário ou uma unidade. Reclamar de síndico e subsíndico exige duas reclamações separadas |
| RN-RC-03 | O julgador é definido pela tabela 5.1 no momento da abertura |
| RN-RC-04 | O julgador registra a conversa com o alvo antes de decidir; a decisão só é liberada depois desse registro |
| RN-RC-05 | Negativa exige um motivo da lista; motivos com penalidade exigem também uma justificativa escrita |
| RN-RC-06 | Prazo para decisão: 15 dias (configurável), com lembrete ao julgador no prazo e a cada 5 dias depois dele |
| RN-RC-07 | Quem perdeu pontos pode recorrer uma vez, em até 7 dias da decisão (tabela 5.3) |
| RN-RC-08 | A administradora consulta todas as reclamações, com identidade e score do reclamante e do alvo |
| RN-RC-09 | A categoria define a gravidade padrão; o julgador pode mudá-la ao validar, com justificativa |
| RN-RC-10 | O alvo é notificado na abertura e na decisão, sem a identidade do reclamante |
| RN-RC-11 | Reclamação feita pelo próprio julgador (ex.: síndico reclamando de um funcionário) vai para quem julgaria uma reclamação contra ele |
| RN-RC-12 | Dano encontrado em vistoria gera reclamação contra a unidade em nome do condomínio, sem reclamante pessoa; segue o julgamento normal, com as fotos da vistoria como evidência |
| RN-RC-13 | Textos ofensivos são filtrados; qualquer usuário pode denunciar conteúdo, e a denúncia vai ao síndico |

### 5.3 Recursos

| Decisão tomada por | Recurso julgado por |
| --- | --- |
| Síndico | Subsíndico; sem subsíndico, administradora; sem administradora, conselho fiscal |
| Subsíndico | Síndico |
| Administradora ou conselho fiscal | Sem recurso no app |

Recurso aceito devolve os pontos; recurso negado mantém a decisão e encerra a reclamação.

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

&#91;embedded content: estados da reclamação · 8 estados\]

Só entra em recurso quem perdeu pontos; uma negativa sem penalidade vai direto para "encerrada".

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
| RN-RE-03 | A reserva paga fica aguardando pagamento por até 24h (configurável) ou até o início da reserva, o que vier primeiro; sem pagamento, expira e o horário é liberado |
| RN-RE-04 | O primeiro pedido bloqueia o horário; quem tentar depois vê "ocupado" |
| RN-RE-05 | O calendário mostra horários reservados como "ocupado", sem identificar unidade ou morador |
| RN-RE-06 | Antecedência: mínimo 24h e máximo 60 dias (configuráveis por área) |
| RN-RE-07 | Limite: 2 reservas por mês, por área, por unidade (configurável por área); reservas canceladas não contam |
| RN-RE-08 | Com score menor ou igual a 60, a pessoa não vê horários livres em áreas gratuitas, só em áreas pagas |
| RN-RE-09 | Após o uso, a portaria ou a limpeza registra a vistoria da área com checklist e fotos; dano gera reclamação (RN-RC-12) |
| RN-RE-10 | Se o morador não usar uma reserva gratuita, a portaria ou a limpeza registra o não comparecimento; duas faltas no mesmo trimestre tiram 5 pontos de quem reservou |
| RN-RE-11 | Se o condomínio ligar o bloqueio por atraso (RN-FI-12), a unidade em atraso não faz novas reservas até quitar; reservas já confirmadas são mantidas |

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
| RN-PG-01 | Cada condomínio cadastra uma conta bancária para receber reservas; o titular é escolhido pelo cliente |
| RN-PG-02 | A plataforma recomenda conta no CNPJ do condomínio; conta de pessoa física exige que o titular aceite o termo de responsabilidade pelo valor recebido |
| RN-PG-03 | Sem conta cadastrada, o condomínio não pode ter áreas pagas |
| RN-PG-04 | O valor vai direto para a conta do condomínio, por subconta ou split do gateway; a plataforma não retém o dinheiro |
| RN-PG-05 | Taxas do gateway são descontadas do valor recebido pelo condomínio |
| RN-PG-06 | Meios aceitos: Pix e cartão de crédito |
| RN-PG-07 | Todo pagamento e reembolso gera comprovante, enviado por e-mail e guardado no histórico |

### 7.4 Estados da reserva

&#91;embedded content: estados da reserva · 8 estados\]

A reserva gratuita já nasce confirmada; a paga passa por "aguardando pagamento" e expira se o prazo vencer.

## 8. Visitantes e portaria

O cadastro de visitantes agiliza a portaria, mas não é a única forma de autorizar uma entrada: o morador também pode autorizar por interfone.

### 8.1 Regras

| ID | Regra |
| --- | --- |
| RN-VI-01 | O morador cadastra visitantes a qualquer momento antes da chegada; o cadastro aparece na portaria em tempo real |
| RN-VI-02 | Nome é obrigatório; documento é opcional |
| RN-VI-03 | Visita recorrente vale nos dias da semana escolhidos, com faixa de horário e data de término opcionais |
| RN-VI-04 | Visitante não cadastrado entra se o morador autorizar por interfone; a portaria registra a entrada como "autorizada por interfone" |
| RN-VI-05 | Visitante na lista de bloqueio gera alerta na busca e no registro de entrada; a decisão final é da portaria |
| RN-VI-06 | O morador é notificado quando o visitante entra |
| RN-VI-07 | Sem saída registrada, a visita é encerrada 24h após a entrada com status "saída não registrada", sem horário de saída |
| RN-VI-08 | Quando o morador muda de unidade ou sai do condomínio, as visitas recorrentes dele são encerradas |

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
| Esperado | Cadastrado pelo morador, ainda não chegou | Entrou, Cancelado |
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
| RN-EN-04 | Prazo final de guarda: 30 dias (configurável); vencido o prazo, o síndico é avisado |
| RN-EN-05 | Entregas de comida por aplicativo não são registradas |

| Estado da encomenda | Próximos estados |
| --- | --- |
| Recebida | Retirada, Prazo vencido |
| Prazo vencido | Retirada, Devolvida |
| Retirada | — |
| Devolvida | — |

### 9.2 Chamados

| ID | Regra |
| --- | --- |
| RN-CH-01 | Chamados são de limpeza ou de manutenção |
| RN-CH-02 | Abrem chamados: moradores, síndico, subsíndico e portaria; a portaria não atende chamados |
| RN-CH-03 | Todo chamado tem categoria, descrição e foto opcional |
| RN-CH-04 | A equipe de limpeza atende os chamados do setor, também sem internet; se duas pessoas concluírem o mesmo chamado offline, vale a primeira conclusão |
| RN-CH-05 | Manutenção é feita por empresas terceirizadas; o síndico registra a empresa, atualiza o status e conclui |
| RN-CH-06 | Prazos: limpeza concluída em 24h; manutenção com primeira atualização em 48h (configuráveis). Chamados fora do prazo aparecem em destaque para o síndico |
| RN-CH-07 | Quem abriu é avisado da conclusão e pode reabrir em até 48h |
| RN-CH-08 | Chamados de um funcionário desligado voltam para a fila do setor |

| Estado do chamado | Limpeza | Manutenção |
| --- | --- | --- |
| Aberto | Sim | Sim |
| Em atendimento | Sim | — |
| Orçamento | — | Sim |
| Agendado | — | Sim |
| Concluído | Sim | Sim |
| Reaberto (até 48h após a conclusão) | Sim | Sim |

## 10. Comunicação, reuniões, votações e mandatos

Só o síndico fala em nome do condomínio, e cada unidade tem um voto, dado pelo morador habilitado.

### 10.1 Comunicação

| ID | Regra |
| --- | --- |
| RN-CO-01 | Comunicados são enviados pelo síndico, ou pelo subsíndico em substituição |
| RN-CO-02 | Comunicado geral tem público escolhido no envio: moradores, funcionários ou todos; o envio registra quem leu |
| RN-CO-03 | Comunicado individual aceita resposta do destinatário e fica no histórico dos dois |
| RN-CO-04 | A conversa com o alvo de uma reclamação é um comunicado individual vinculado à reclamação |

### 10.2 Reuniões e votações

| ID | Regra |
| --- | --- |
| RN-VO-01 | Um voto por unidade, dado pelo morador habilitado |
| RN-VO-02 | Na convocação, o síndico define data, local e pautas; cada pauta é informativa ou com votação, com opções e quórum definidos conforme a convenção |
| RN-VO-03 | Voto secreto; o resultado é publicado só após o encerramento, com a contagem por opção |
| RN-VO-08 | O morador habilitado pode indicar um procurador antes da votação; cada pessoa representa no máximo 1 unidade além da sua |
| RN-VO-10 | A votação online fica aberta da convocação até o encerramento da reunião |
| RN-VO-11 | O síndico registra os votos presenciais por unidade; unidade que já votou online não vota de novo |
| RN-VO-12 | Após a reunião, o síndico anexa a ata e a lista de presença |
| RN-VO-16 | Com o módulo de cobrança ativo, unidade em atraso não vota; o motivo aparece só para o morador habilitado (RN-FI-11) |

### 10.3 Eleições e mandatos

| ID | Regra |
| --- | --- |
| RN-VO-04 | Síndico e subsíndico devem ser de unidades diferentes |
| RN-VO-05 | Reeleição do síndico morador e do subsíndico: configurável pela administradora; o padrão segue a lei e permite reeleição |
| RN-VO-06 | Síndico profissional não passa por eleição no app nem segue regra de reeleição; a administradora registra contratação, recontratação ou desligamento |
| RN-VO-07 | Empate gera segundo turno entre os empatados em até 7 dias |
| RN-VO-09 | Condomínio sem subsíndico deve ter conselho fiscal com um ou mais membros; enquanto não tiver, a administradora ou o suporte recebe um alerta pendente |
| RN-VO-13 | Candidaturas são feitas no app, dentro do prazo definido na convocação; o sistema bloqueia candidatos inelegíveis e mostra o motivo |
| RN-VO-14 | Se o subsíndico eleito for da mesma unidade do síndico eleito, assume o próximo mais votado para subsíndico |
| RN-VO-15 | A administradora registra início e fim de cada mandato |

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
| RN-PL-03 | Cada pedido enviado pelo síndico conta como uma solicitação; a importação inicial na implantação não conta |
| RN-PL-04 | A franquia mensal de solicitações depende da faixa de unidades (tabela acima); as não usadas não acumulam |
| RN-PL-05 | Cada solicitação além da franquia custa R$ 15 e entra na fatura seguinte; o síndico vê o contador antes de enviar |
| RN-PL-06 | Se o condomínio contratar uma administradora, passa ao Essencial no ciclo seguinte e o suporte perde o acesso |
| RN-PL-07 | Os preços são revistos uma vez por ano; o novo valor é comunicado com 30 dias de antecedência e vale a partir do ciclo seguinte |

## 12. Cobrança condominial

Quando o módulo está ativo, cada unidade recebe a cobrança mensal da taxa condominial nas formas de pagamento escolhidas pela administradora, e o dinheiro vai direto para a conta do condomínio.

### 12.1 Regras

| ID | Regra |
| --- | --- |
| RN-FI-01 | O módulo de cobrança é opcional e ativado por condomínio pela administradora ou pelo suporte |
| RN-FI-02 | A administradora escolhe as formas aceitas entre boleto (com QR Code Pix), Pix e cartão de crédito; pelo menos uma fica ativa (configurável) |
| RN-FI-03 | A cobrança é emitida para o responsável financeiro da unidade; o padrão é o morador habilitado, mas pode ser o proprietário que não mora nela |
| RN-FI-04 | O vencimento padrão é no dia 10 (configurável); se cair em dia não útil, passa para o próximo dia útil |
| RN-FI-05 | As cobranças mensais são geradas 15 dias antes do vencimento (configurável) |
| RN-FI-06 | Atraso gera multa de 2% e juros de 1% ao mês, proporcionais aos dias (configuráveis); a multa nunca passa de 2%, limite do Código Civil (art. 1.336, §1º) |
| RN-FI-07 | Desconto por pagamento até o vencimento é opcional (padrão 0%) |
| RN-FI-08 | A segunda via sempre sai com o valor atualizado, com multa e juros do dia |
| RN-FI-09 | A unidade fica "em atraso" no dia seguinte ao vencimento sem pagamento e entra no painel de inadimplência |
| RN-FI-10 | A situação financeira de uma unidade é vista só pelo responsável financeiro, pela administradora e pelo síndico (ou subsíndico em substituição); nunca aparece para outros moradores |
| RN-FI-11 | Unidade em atraso não vota nas assembleias (Código Civil, art. 1.335, III); o motivo é mostrado só ao morador habilitado |
| RN-FI-12 | Bloquear reservas de unidade em atraso é configurável e vem desligado; só deve ser ligado se o regimento previr |
| RN-FI-13 | A baixa é automática quando o gateway confirma o pagamento; pagamento feito fora do app é registrado pela administradora, com comprovante e motivo |
| RN-FI-14 | Cobranças extras (rateio, fundo de reserva, multa por infração) são lançadas pela administradora, a pedido do síndico, com descrição, valor, unidades e vencimento |
| RN-FI-15 | Só a administradora cancela uma cobrança, com motivo registrado em auditoria |
| RN-FI-16 | Lembretes ao responsável: 5 dias antes, no dia, 1 e 7 dias depois do vencimento |
| RN-FI-17 | Os valores vão para a mesma conta bancária das reservas (RN-PG-01 a RN-PG-04); as taxas do gateway são descontadas do valor recebido |
| RN-FI-18 | Acordos de parcelamento de débitos entram na versão 2 |

### 12.2 Estados da cobrança

| Estado | Significado | Próximos estados |
| --- | --- | --- |
| Emitida | Gerada e enviada ao responsável, ainda no prazo | Paga, Em atraso, Cancelada |
| Em atraso | Vencida sem pagamento; multa e juros correndo | Paga com atraso, Em acordo (versão 2), Cancelada |
| Paga | Paga até o vencimento | — |
| Paga com atraso | Paga depois do vencimento, com multa e juros | — |
| Em acordo | Débito parcelado (versão 2) | Paga com atraso, Em atraso |
| Cancelada | Cancelada pela administradora, com motivo | — |

## 13. Catálogo de parâmetros configuráveis

São 26 parâmetros; todos são alterados pela administradora (ou pelo suporte, no plano Gestão + Suporte), e o padrão de plataforma pelo admin da plataforma.

| Parâmetro | Regra | Padrão | Faixa permitida | Nível mais específico |
| --- | --- | --- | --- | --- |
| `score.limite_bloqueio_gratuitas` | RN-SC-09 | 60 | 0 a 100 | Condomínio |
| `score.pontos_leve` | RN-SC-03 | 5 | 1 a 20 | Condomínio |
| `score.pontos_media` | RN-SC-03 | 10 | 5 a 30 | Condomínio |
| `score.pontos_grave` | RN-SC-03 | 20 | 10 a 50 | Condomínio |
| `score.penalidade_desproporcional` | RN-SC-03 | 5 | 0 a 20 | Condomínio |
| `score.penalidade_falsa` | RN-SC-03 | 15 | 0 a 30 | Condomínio |
| `reclamacao.prazo_decisao_dias` | RN-RC-06 | 15 | 3 a 60 | Condomínio |
| `reserva.tipo` | RN-RE-01 | Gratuita | Paga ou gratuita | Área |
| `reserva.valor` | RN-RE-01 | — | R$ 1 a R$ 10.000 | Área |
| `reserva.prazo_pagamento_horas` | RN-RE-03 | 24 | 1 a 72 | Área |
| `reserva.prazo_cancelamento_reembolso_horas` | RN-CA-02 | 12 | 0 a 168 | Área |
| `reserva.antecedencia_min_horas` | RN-RE-06 | 24 | 0 a 720 | Área |
| `reserva.antecedencia_max_dias` | RN-RE-06 | 60 | 1 a 365 | Área |
| `reserva.limite_mensal_por_unidade` | RN-RE-07 | 2 | 1 a 31 | Área |
| `chamado.prazo_limpeza_horas` | RN-CH-06 | 24 | 1 a 168 | Condomínio |
| `chamado.prazo_manutencao_resposta_horas` | RN-CH-06 | 48 | 4 a 168 | Condomínio |
| `encomenda.prazo_guarda_dias` | RN-EN-04 | 30 | 7 a 90 | Condomínio |
| `visitante.retencao_meses` | 8.4 | 6 | 1 a 12 | Condomínio |
| `mandato.reeleicao_permitida` | RN-VO-05 | Sim | Sim ou não | Condomínio |
| cobranca.formas\_pagamento | RN-FI-02 | Boleto, Pix e cartão | Ao menos uma das três | Condomínio |
| cobranca.dia\_vencimento | RN-FI-04 | 10 | 1 a 28 | Condomínio |
| cobranca.antecedencia\_emissao\_dias | RN-FI-05 | 15 | 5 a 30 | Condomínio |
| cobranca.multa\_atraso\_pct | RN-FI-06 | 2% | 0% a 2% | Condomínio |
| cobranca.juros\_mes\_pct | RN-FI-06 | 1% | 0% a 1% | Condomínio |
| cobranca.desconto\_pontualidade\_pct | RN-FI-07 | 0% | 0% a 10% | Condomínio |
| cobranca.bloqueia\_reserva\_em\_atraso | RN-FI-12 | Não | Sim ou não | Condomínio |

Valores fora da faixa são recusados no cadastro, com a faixa permitida na mensagem de erro.

## 14. Rotinas automáticas

O sistema executa 13 rotinas sem ação de ninguém; cada execução é registrada em log.

| Rotina | Frequência | O que faz | Regra |
| --- | --- | --- | --- |
| Expirar reservas não pagas | A cada 5 min | Libera o horário de reservas pagas cujo prazo de pagamento venceu | RN-RE-03 |
| Saída não registrada | A cada hora | Encerra visitas com mais de 24h desde a entrada | RN-VI-07 |
| Recuperação de score | Diária | Soma +5 a quem completou 2 meses de regularidade e inicia novo período | RN-SC-08 |
| Bloqueio de reservas gratuitas | A cada alteração de score | Bloqueia ou libera reservas gratuitas conforme o limite | RN-SC-09 |
| Fechamento da pesquisa | Último dia do mês, 23h59 | Calcula médias, ajusta scores dos funcionários e publica notas dos setores | RN-PE-05 a RN-PE-08 |
| Faltas em reservas | Diária | Aplica −5 a quem acumulou 2 faltas em reservas gratuitas no trimestre | RN-RE-10 |
| Lembretes de encomenda | Diária | Envia lembretes de 3 e 7 dias e avisa o síndico ao fim do prazo de guarda | RN-EN-03, RN-EN-04 |
| Prazos de reclamação e chamado | Diária | Lembra o julgador e destaca chamados fora do prazo | RN-RC-06, RN-CH-06 |
| Limpeza de dados offline | Diária, à meia-noite | Manda os aparelhos da portaria e da limpeza apagarem a cópia do dia | RN-OF-06 |
| Anonimização de visitantes | Diária | Anonimiza visitas mais antigas que o prazo de retenção | 8.4 |
| Gerar cobranças mensais | Diária | Gera a cobrança de cada unidade 15 dias antes do vencimento | RN-FI-05 |
| Marcar cobranças em atraso | Diária | Muda para "em atraso" as cobranças vencidas sem pagamento e atualiza multa e juros | RN-FI-06, RN-FI-09 |
| Lembretes de cobrança | Diária | Envia lembretes 5 dias antes, no dia, 1 e 7 dias depois do vencimento | RN-FI-16 |
