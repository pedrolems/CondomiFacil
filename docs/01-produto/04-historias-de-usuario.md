# Histórias de Usuário e Critérios de Aceite — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

## Como ler

São 71 histórias em 13 épicos; cada uma é entregue quando todos os seus critérios de aceite passam nos testes.

- **Formato:** "Como \[perfil\], quero \[ação\], para \[objetivo\]".
- **IDs:** `US-<módulo>-<número>`. Cada história cita os requisitos (RF, RNF, SEG) do PRD — CondomiFacil e as regras (RN) das Regras de Negócio — CondomiFacil que ela implementa.
- **Critérios de aceite:** no formato Dado / Quando / Então, como lista de verificação para o QA marcar.
- **Valores padrão:** os critérios usam os padrões das regras (ex.: 12h para cancelar com reembolso); em condomínios com outra configuração, vale o valor configurado.

## Épico 1 — Acesso e conta

### US-AC-01 — Primeiro acesso

Como morador ou funcionário pré-cadastrado, quero ativar minha conta com um código no e-mail, para criar minha senha com segurança.

Requisitos: RF-AC-01 · RN-CD-01, RN-CD-02

- [ ] Dado um e-mail pré-cadastrado, quando peço acesso, então recebo um código de 6 dígitos válido por 15 minutos.
- [ ] Dado o código correto e dentro da validade, quando o informo, então crio minha senha e entro no app.
- [ ] Dado um código errado 5 vezes, quando tento de novo, então o código é invalidado e preciso pedir outro.
- [ ] Dado um e-mail não pré-cadastrado, quando peço acesso, então vejo a mesma mensagem exibida para e-mails cadastrados ("se o e-mail estiver cadastrado, enviamos um código"), com a orientação de procurar a administradora ou o síndico se o código não chegar.
- [ ] Dado que pedi um código, quando peço outro, então o botão só é liberado após 60 segundos e o código anterior deixa de valer.
- [ ] Dado a criação da senha, quando informo menos de 8 caracteres, então o app mostra o requisito e não avança.

### US-AC-02 — Aceitar termos e conhecer as regras

Como usuário, quero ler e aceitar os termos, o regimento e as regras de convivência do app, para saber como score e reclamações funcionam.

Requisitos: RF-AC-02, RF-AC-07 · RN-CD-03

- [ ] Dado o primeiro acesso, quando entro, então só uso o app após aceitar termos de uso, política de privacidade, regimento e a página "Como funciona".
- [ ] Dado que uma nova versão de qualquer documento foi publicada, quando abro o app, então preciso aceitá-la antes de continuar.
- [ ] Dado um aceite, quando ele é registrado, então ficam salvos a versão e a data.
- [ ] Dado qualquer momento, quando abro o menu, então encontro a página "Como funciona".

### US-AC-03 — Onboarding guiado

Como novo usuário, quero um tour rápido das tarefas do meu perfil, para começar a usar sem ajuda.

Requisitos: RF-AC-08

- [ ] Dado o primeiro acesso, quando concluo o aceite, então vejo de 3 a 5 telas com as tarefas principais do meu perfil.
- [ ] Dado o tour aberto, quando toco em "pular", então vou para a tela inicial.
- [ ] Dado que pulei o tour, quando abro o menu de ajuda, então posso revê-lo.

### US-AC-04 — Recuperar senha

Como usuário, quero redefinir minha senha pelo e-mail, para voltar a entrar se eu esquecer.

Requisitos: RF-AC-03 · RN-CD-02

- [ ] Dado um e-mail cadastrado, quando peço para redefinir, então recebo um código com as mesmas regras do primeiro acesso.
- [ ] Dado o código válido, quando crio uma nova senha, então a senha antiga deixa de funcionar e as outras sessões são encerradas.
- [ ] Dado 5 senhas erradas seguidas no login, quando tento de novo, então o acesso fica pausado por 15 minutos, com a opção de redefinir a senha (SEG-04).

### US-AC-05 — Trocar de unidade

Como morador com mais de uma unidade, quero escolher a unidade ativa, para ver reservas, visitantes e reuniões de cada uma separadamente.

Requisitos: RF-AC-04 · RN-CD-05

- [ ] Dado que tenho vínculo com duas ou mais unidades, quando abro o app, então vejo um seletor no topo da tela inicial.
- [ ] Dado que troco a unidade ativa, quando a tela recarrega, então reservas, visitantes, reuniões e métricas mostrados são só dessa unidade.
- [ ] Dado que tenho uma única unidade, quando abro o app, então o seletor não aparece.

### US-AC-06 — Usar no navegador e escolher o tema

Como administradora ou síndico, quero acessar o app pelo navegador, para fazer cadastros e consultas em tela grande; como usuário, quero escolher tema claro ou escuro.

Requisitos: RF-AC-05, RF-AC-06

- [ ] Dado um navegador atual (Chrome, Safari ou Edge), quando acesso o endereço do app, então entro com o mesmo login do celular.
- [ ] Dado o primeiro acesso, quando abro o app, então o tema segue o do aparelho.
- [ ] Dado a tela de aparência, quando a abro, então vejo as opções "Igual ao aparelho", "Claro" e "Escuro".
- [ ] Dado que escolho o tema manualmente, quando volto ao app, então a escolha é mantida.

## Épico 2 — Administração do condomínio

### US-AD-01 — Pré-cadastrar moradores

Como administradora, quero cadastrar moradores individualmente ou por planilha, para implantar o condomínio rápido.

Requisitos: RF-AD-01, RF-AD-04 · RN-CD-01, RN-CD-04

- [ ] Dado uma planilha no modelo do app, quando a importo, então vejo uma prévia com as linhas válidas e os erros por linha antes de confirmar.
- [ ] Dado uma unidade sem morador habilitado, quando tento salvar, então o sistema exige que eu escolha um, a não ser que eu a marque como desocupada.
- [ ] Dado uma unidade que já tem morador habilitado, quando escolho outro, então o anterior deixa de ser habilitado e a troca fica registrada com data.
- [ ] Dado o cadastro concluído, quando salvo, então cada pessoa recebe o convite de primeiro acesso por e-mail.

### US-AD-02 — Solicitar cadastro como síndico

Como síndico, quero pedir à administradora que cadastre, altere ou remova alguém, para manter os dados certos sem fazer o cadastro eu mesmo.

Requisitos: RF-AD-02, RF-AD-03 · RN-CD-06, RN-PL-03 a RN-PL-05

- [ ] Dado que sou síndico, quando abro a área de cadastros, então só vejo a opção de enviar solicitação, nunca de cadastrar.
- [ ] Dado uma solicitação enviada, quando a administradora a atende ou recusa, então sou notificado com o resultado e, se recusada, o motivo.
- [ ] Dado o plano Gestão + Suporte, quando vou enviar uma solicitação, então vejo quantas restam na franquia do mês e o custo de R$ 15 se ela for excedente.

### US-AD-03 — Registrar mudança de morador

Como administradora, quero registrar a saída de um morador, para que ele perca o acesso sem apagar o histórico.

Requisitos: RF-AD-05 · RN-CD-07, RN-VI-08

- [ ] Dado um morador que se mudou, quando registro a mudança, então o acesso dele é desativado na hora.
- [ ] Dado reservas futuras dele, quando a mudança é registrada, então elas são canceladas com reembolso integral.
- [ ] Dado visitas recorrentes dele, quando a mudança é registrada, então elas são encerradas.
- [ ] Dado o histórico dele (reservas, reclamações, votos), quando consulto depois, então os registros continuam disponíveis.

### US-AD-04 — Configurar áreas e regras

Como administradora, quero cadastrar as áreas comuns e ajustar as regras ao regimento, para que o app funcione como o condomínio decidiu.

Requisitos: RF-AD-07, RF-RE-07 · RN-GE-01 a RN-GE-03, RN-RE-01

- [ ] Dado uma área nova, quando a cadastro, então escolho se é paga ou gratuita e ela já funciona com os valores padrão.
- [ ] Dado um parâmetro do catálogo, quando informo valor fora da faixa permitida, então o sistema recusa e mostra a faixa.
- [ ] Dado uma alteração de regra, quando salvo, então ficam registrados autor, data, valor antigo e novo.
- [ ] Dado uma reserva já feita, quando a regra muda depois, então essa reserva segue a regra vigente quando foi criada.

### US-AD-05 — Cadastrar conta bancária

Como administradora, quero cadastrar a conta que recebe os pagamentos de reservas e da taxa condominial, para o dinheiro cair direto para o condomínio.

Requisitos: RF-AD-08 · RN-PG-01 a RN-PG-04, RN-FI-01

- [ ] Dado o cadastro da conta, quando escolho o titular, então o app recomenda o CNPJ do condomínio.
- [ ] Dado uma conta de pessoa física, quando salvo, então o titular precisa aceitar o termo de responsabilidade pelo valor recebido.
- [ ] Dado um condomínio sem conta cadastrada, quando tento criar uma área paga ou ativar o módulo de cobrança, então o sistema bloqueia e explica o motivo.

### US-AD-06 — Registrar mandatos

Como administradora, quero registrar síndico e subsíndico com início e fim de mandato, para que as permissões e as regras de elegibilidade funcionem.

Requisitos: RF-AD-09 a RF-AD-12 · RN-VO-04 a RN-VO-06, RN-VO-15, RN-CD-13

- [ ] Dado síndico e subsíndico da mesma unidade, quando tento salvar, então o sistema bloqueia.
- [ ] Dado o padrão do condomínio, quando registro um mandato, então a reeleição é permitida, a menos que a regra tenha sido desligada.
- [ ] Dado um síndico profissional, quando o registro, então ele não tem funções de morador e eu posso registrar recontratação ou desligamento sem regra de reeleição.
- [ ] Dado o fim antecipado do mandato do síndico, quando o registro, então o subsíndico assume até a nova eleição.

### US-AD-07 — Ativar a substituição do síndico

Como síndico ou administradora, quero ativar a substituição pelo subsíndico durante uma ausência, para que o condomínio não fique sem gestão.

Requisitos: RF-AD-13 · RN-CD-12

- [ ] Dado que ativo a substituição, quando o subsíndico abre o app, então ele tem as funções de síndico.
- [ ] Dado a substituição ativa, quando eu (síndico ou administradora) a desativo, então as funções voltam ao síndico na hora.
- [ ] Dado cada ativação ou desativação, quando ocorre, então fica registrada com autor e data.
- [ ] Dado a substituição ativa, quando o subsíndico abre a substituição, então vê que está ativa, mas não tem a opção de desativar.

### US-AD-12 — Apoiar a gestão como subsíndico

Como subsíndico, quero uma aba Gestão com as funções que exerço no dia a dia, para ajudar o síndico sem precisar da substituição.

Requisitos: RF-CH-04, RF-EN-05, RF-VO-04, RF-RS-03 · RN-CD-27, RN-CD-28, RN-CH-05, RN-EN-04, RN-VO-11

- [ ] Dado que sou subsíndico sem a substituição ativa, quando abro o app, então vejo as abas Início, Gestão, Reservas, Visitantes e Menu, e a Gestão mostra só reclamações contra o síndico, chamados de manutenção, comunicados e sugestões, reuniões, encomendas com prazo vencido e o estado da substituição.
- [ ] Dado um chamado de manutenção, quando o abro, então vejo a empresa e o andamento, sem poder indicar empresa nem avançar o status.
- [ ] Dado uma reunião convocada pelo síndico, quando a abro, então posso registrar votos presenciais, mas não convocar, criar pautas nem encerrar a votação.
- [ ] Dado encomendas com prazo vencido, quando abro a lista, então vejo as encomendas, sem marcar a devolução.
- [ ] Dado que tento abrir solicitações ou inadimplência, quando não há substituição ativa, então vejo que a função é do síndico e fica disponível na substituição.
- [ ] Dado que a substituição é ativada, quando abro a Gestão, então vejo todas as funções de síndico e um aviso de que tudo fica registrado.

### US-AD-08 — Cadastrar blocos e portarias

Como administradora de um condomínio grande, quero cadastrar blocos e portarias, para que cada portaria veja só o que atende.

Requisitos: RF-AD-17 · RN-CD-17

- [ ] Dado blocos cadastrados, quando cadastro uma unidade, então ela fica vinculada a um bloco.
- [ ] Dado uma portaria, quando defino os blocos que ela atende, então a lista de visitantes dessa portaria mostra só esses blocos.
- [ ] Dado uma portaria sem blocos definidos, quando ela abre a lista, então vê todos os blocos.

### US-AD-09 — Cadastrar funcionários, fornecedores e conselho fiscal

Como administradora, quero cadastrar funcionários, empresas de manutenção e membros do conselho fiscal, para que cada um tenha seu papel no app.

Requisitos: RF-AD-06, RF-AD-14 · RN-CD-08, RN-CD-09, RN-VO-09

- [ ] Dado um funcionário terceirizado, quando o cadastro, então informo o nome da empresa.
- [ ] Dado um funcionário desligado, quando registro o desligamento, então os chamados abertos dele voltam para a fila do setor.
- [ ] Dado uma empresa de manutenção, quando a cadastro, então ela não recebe login.
- [ ] Dado um condomínio sem subsíndico e sem conselho fiscal, quando abro o painel, então vejo um alerta pendente até cadastrar ao menos um membro do conselho.

### US-AD-10 — Cadastrar inquilino e contrato de locação

Como administradora, quero cadastrar o inquilino de uma unidade alugada com as datas do contrato, para que ele use o app como morador e saia na hora certa.

Requisitos: RF-AD-18, RF-AD-20, RF-AD-21, RF-FI-04 · RN-CD-04, RN-CD-20 a RN-CD-22, RN-CD-24, RN-FI-03

- [ ] Dado uma unidade, quando cadastro um inquilino com início e fim do contrato, então ele passa a ser o morador habilitado e o proprietário passa a não residente, sem perder o acesso.
- [ ] Dado o inquilino cadastrado, quando salvo, então os responsáveis financeiros vêm preenchidos com o inquilino nas despesas ordinárias e o proprietário nas extraordinárias, e posso trocá-los.
- [ ] Dado um contrato sem data de fim, quando salvo, então ele fica por prazo indeterminado e nenhum aviso de fim é enviado.
- [ ] Dado um contrato que termina em 30 dias, quando a rotina diária roda, então eu, o proprietário e o inquilino somos avisados.
- [ ] Dado um contrato vencido sem renovação, quando passam 7 dias do fim, então o inquilino e os dependentes perdem o acesso, as reservas futuras são canceladas com reembolso e a unidade fica desocupada.
- [ ] Dado que o inquilino tenta reservar uma data depois do fim do contrato, quando escolhe o dia, então a data aparece indisponível com o motivo.
- [ ] Dado uma unidade desocupada, quando a salvo, então ela fica sem morador habilitado e o proprietário responde pelas cobranças e pelo voto.

### US-AD-11 — Acompanhar a unidade alugada como proprietário

Como proprietário que não mora na unidade, quero acompanhar o contrato, as cobranças e as ocorrências da unidade, para cuidar do meu imóvel sem invadir a privacidade do inquilino.

Requisitos: RF-AD-19, RF-RS-15, RF-VI-13 · RN-CD-19, RN-CD-23, RN-CD-25, RN-CD-26, RN-RC-16, RN-VI-10, RN-SC-13

- [ ] Dado que sou proprietário não residente, quando entro no app, então vejo cobranças, assembleias, a minha unidade e o menu, e não vejo reservas, visitantes, chamados, encomendas nem o score do inquilino.
- [ ] Dado o contrato da unidade, quando peço a renovação, o encerramento ou o cadastro de um novo inquilino, então a administradora recebe o pedido e sou avisado do resultado.
- [ ] Dado uma reclamação validada contra a unidade, quando a decisão sai, então recebo a categoria, a data, a decisão e a multa, sem a conversa e sem quem reclamou, e não perco pontos.
- [ ] Dado uma unidade desocupada e a temporada permitida no condomínio, quando cadastro um hóspede com entrada e saída, então ele aparece na portaria como "hóspede de temporada"; com a temporada desligada (padrão), a opção não aparece.
- [ ] Dado que volto a morar na unidade, quando a administradora muda o meu vínculo, então passo a ser o morador habilitado e ganho score começando em 100.

## Épico 3 — Reservas e pagamentos

### US-RE-01 — Ver disponibilidade

Como morador, quero ver no calendário os horários livres de cada área, para escolher quando reservar.

Requisitos: RF-RE-01 · RN-RE-04, RN-RE-05

- [ ] Dado um horário reservado, quando abro o calendário, então ele aparece como "ocupado", sem nome nem unidade.
- [ ] Dado um horário fora da antecedência permitida (menos de 24h ou mais de 60 dias), quando abro o calendário, então ele aparece indisponível.
- [ ] Dado o calendário aberto, quando vejo os horários, então cada estado (livre, ocupado, indisponível, bloqueado pelo score) é identificado por texto ou ícone, e não só por cor.
- [ ] Dado dois moradores tentando o mesmo horário, quando o primeiro faz o pedido, então o segundo passa a ver "ocupado".

### US-RE-02 — Fazer reserva gratuita

Como morador, quero reservar uma área gratuita, para usar sem depender de ninguém aprovar.

Requisitos: RF-RE-02 · RN-RE-02, RN-RE-07, RN-RE-12, RN-VI-14

- [ ] Dado um horário livre e as regras cumpridas, quando confirmo, então a reserva fica "confirmada" na hora, sem aprovação do síndico.
- [ ] Dado que minha unidade já fez 2 reservas na área neste mês, quando tento a terceira, então o app bloqueia e mostra o limite.
- [ ] Dado uma reserva cancelada, quando conto o limite do mês, então ela não entra na conta.
- [ ] Dado uma reserva confirmada com data depois de hoje e sem lista, quando vejo a confirmação ou o detalhe, então aparece "Vai receber convidados? Monte a lista de visitantes." com "Montar lista" (abre a lista com data, horário e local da reserva) e "Agora não" (esconde a sugestão para aquela reserva).
- [ ] Dado uma reserva aguardando pagamento, expirada, cancelada, realizada ou com data de hoje, quando abro a confirmação ou o detalhe, então não aparece sugestão de lista.
- [ ] Dado uma reserva com lista vinculada, quando abro o detalhe, então vejo "Lista: N pessoas" e, ao tocar, abro o detalhe da lista; e, ao cancelar a reserva, a lista vinculada é cancelada junto e eu sou avisado.

### US-RE-03 — Fazer e pagar reserva paga

Como morador, quero reservar uma área paga e pagar por Pix ou cartão no app, para garantir o horário sem tratar dinheiro com ninguém.

Requisitos: RF-RE-03, RF-PG-01, RF-PG-02, RF-PG-04 · RN-RE-03, RN-PG-04 a RN-PG-07

- [ ] Dado uma área paga, quando faço o pedido, então a reserva fica "aguardando pagamento" e o horário é bloqueado.
- [ ] Dado o pagamento aprovado dentro do prazo (24h ou até o início, o que vier primeiro), quando ele é confirmado, então a reserva fica "confirmada" e recebo o comprovante por e-mail.
- [ ] Dado que o prazo venceu sem pagamento, quando a rotina roda, então a reserva fica "expirada" e o horário é liberado.
- [ ] Dado um pagamento aprovado, quando ele é processado, então o valor vai para a conta do condomínio, descontadas as taxas do gateway.

### US-RE-04 — Cancelar reserva

Como morador, quero cancelar uma reserva, para liberar a área quando eu não puder usar.

Requisitos: RF-RE-04, RF-RE-05, RF-PG-03 · RN-CA-01 a RN-CA-06

- [ ] Dado uma reserva paga com mais de 12h até o início, quando cancelo, então recebo reembolso integral (Pix em até 2 dias úteis; cartão estornado pela operadora).
- [ ] Dado uma reserva paga com menos de 12h até o início, quando tento cancelar, então o app avisa que não haverá reembolso e, se eu confirmar, cancela.
- [ ] Dado uma reserva que já começou, quando abro os detalhes, então a opção de cancelar não aparece.
- [ ] Dado um cancelamento feito pelo condomínio, quando ele ocorre, então recebo reembolso integral e o motivo, em qualquer prazo.
- [ ] Dado qualquer cancelamento, quando ele é confirmado, então o horário fica livre na hora.

### US-RE-05 — Bloqueio de reservas gratuitas por score

Como condomínio, quero que quem tem score baixo perca o acesso a reservas gratuitas, para dar consequência à má conduta.

Requisitos: RF-RE-06 · RN-SC-09, RN-SC-10, RN-RE-08

- [ ] Dado um morador com score menor ou igual a 60, quando abre o calendário de uma área gratuita, então os horários aparecem indisponíveis, com o motivo.
- [ ] Dado o mesmo morador, quando abre uma área paga, então reserva normalmente.
- [ ] Dado outro morador da mesma unidade com score acima de 60, quando abre uma área gratuita, então reserva normalmente.
- [ ] Dado que o score volta a passar de 60, quando o morador abre o calendário, então as áreas gratuitas voltam a ficar disponíveis.

### US-RE-06 — Vistoria e não comparecimento

Como porteiro ou funcionário de limpeza, quero registrar a vistoria da área e as faltas, para que danos e reservas não usadas tenham consequência.

Requisitos: RF-RE-08, RF-RE-09 · RN-RE-09, RN-RE-10, RN-RC-12

- [ ] Dado o fim de uma reserva, quando registro a vistoria, então preencho o checklist e anexo fotos.
- [ ] Dado um dano na vistoria, quando o registro, então é aberta uma reclamação contra a unidade em nome do condomínio, com as fotos como evidência.
- [ ] Dado uma reserva gratuita não usada, quando registro o não comparecimento, então a reserva fica com esse status.
- [ ] Dado a segunda falta do morador no mesmo trimestre, quando a rotina diária roda, então ele perde 5 pontos; a quarta falta no trimestre tira mais 5.

## Épico 4 — Visitantes e portaria

### US-VI-01 — Cadastrar visitante

Como morador, quero cadastrar um visitante a qualquer momento antes da chegada, para que ele entre sem a portaria me ligar.

Requisitos: RF-VI-01, RF-VI-03 · RN-VI-01, RN-VI-02, RN-VI-09

- [ ] Dado o nome do visitante, quando salvo, então ele aparece na lista da portaria em até 5 segundos.
- [ ] Dado um visitante avulso, quando o cadastro, então a data da visita vem preenchida com hoje e não aceita datas passadas.
- [ ] Dado um visitante avulso que não entrou até o fim do dia da visita, quando a rotina da meia-noite roda, então ele fica "não compareceu".
- [ ] Dado o cadastro, quando deixo o documento em branco, então o app aceita, porque só o nome é obrigatório.
- [ ] Dado um visitante cadastrado, quando o edito ou cancelo, então a lista da portaria é atualizada na hora.

### US-VI-02 — Cadastrar visita recorrente

Como morador, quero cadastrar uma visita que se repete (diarista, personal), para não cadastrar toda semana.

Requisitos: RF-VI-02 · RN-VI-03

- [ ] Dado os dias da semana escolhidos (ex.: sábado e domingo), quando salvo, então o visitante aparece como esperado só nesses dias.
- [ ] Dado uma faixa de horário e uma data de término opcionais, quando as informo, então a visita só vale dentro delas.
- [ ] Dado a data de término, quando ela passa, então a visita recorrente deixa de aparecer.

### US-VI-03 — Registrar entrada e saída

Como porteiro, quero encontrar o visitante e registrar a entrada em até 2 toques, para atender rápido.

Requisitos: RF-VI-04, RF-VI-06, RF-VI-08, RF-VI-10 · RN-VI-06, RN-VI-07

- [ ] Dado a lista de esperados hoje, quando busco por nome, unidade ou bloco, então encontro o visitante.
- [ ] Dado o visitante encontrado, quando registro a entrada, então o morador recebe uma notificação.
- [ ] Dado um visitante dentro, quando registro a saída, então a visita fica "saiu".
- [ ] Dado 24h após a entrada sem saída registrada, quando a rotina roda, então a visita fica "saída não registrada", sem horário de saída.

### US-VI-04 — Trabalhar sem internet

Como porteiro, quero consultar a lista e registrar entradas sem internet, para a portaria não parar.

Requisitos: RF-VI-05, RF-VI-06, RF-VI-11 · RN-OF-01 a RN-OF-06

- [ ] Dado a internet fora, quando abro a lista, então vejo a cópia do dia dos blocos que atendo e a hora da última sincronização.
- [ ] Dado a internet fora, quando registro entradas e saídas, então elas ficam na fila de sincronização, com indicação de pendência.
- [ ] Dado que a internet volta, quando o app sincroniza, então os registros pendentes são enviados sem eu fazer nada.
- [ ] Dado um registro offline que diverge do cadastro (ex.: visitante cancelado pelo morador), quando sincroniza, então recebo um aviso e só consigo fechá-lo após confirmar por interfone com o morador que cadastrou.
- [ ] Dado o fim do dia ou a saída da conta, quando ocorre, então a cópia salva no aparelho é apagada.

### US-VI-05 — Visitante sem cadastro e lista de bloqueio

Como porteiro, quero registrar visitantes autorizados por interfone e ser avisado sobre pessoas bloqueadas, para controlar a entrada mesmo sem cadastro prévio.

Requisitos: RF-VI-07, RF-VI-09, RF-AD-15 · RN-VI-04, RN-VI-05, RN-CD-15

- [ ] Dado um visitante não cadastrado autorizado pelo morador por interfone, quando registro a entrada, então ela fica com status "autorizado por interfone".
- [ ] Dado uma pessoa na lista de bloqueio, quando a busco ou registro a entrada, então vejo um alerta com o motivo.
- [ ] Dado o alerta, quando decido, então a decisão final é da portaria e fica registrada.

### US-VI-06 — Treinar na portaria

Como porteiro novo, quero praticar com dados fictícios, para aprender sem mexer em registros reais.

Requisitos: RF-VI-12 · RNF-15

- [ ] Dado o modo de treinamento ativo, quando registro entradas e encomendas, então nada é gravado nos dados reais nem notifica moradores.
- [ ] Dado o modo de treinamento, quando está ativo, então uma faixa visível indica "treinamento".
- [ ] Dado que saio do modo, quando volto à lista, então vejo só os dados reais.


### US-VI-07 — Montar lista de visitantes

Como morador, quero montar de uma vez a lista de pessoas de uma festa ou evento, para não cadastrar um visitante por vez.

Requisitos: RF-VI-14 · RN-VI-11 a RN-VI-16, RN-VI-02

- [ ] Dado a tela da lista, quando toco em "Adicionar pessoa", então surge uma nova linha com o cursor no nome, e quando removo uma linha, então ela some com um toque e posso desfazer.
- [ ] Dado vários nomes colados, um por linha, quando confirmo, então cada nome vira uma linha, sem repetir quem já está na lista.
- [ ] Dado o nome, a data e o local da lista, quando preencho uma vez, então valem para todas as pessoas; a data vem com hoje e não aceita datas passadas.
- [ ] Dado visitantes recentes e frequentes, quando toco em um nome, então ele entra na lista; e dado uma lista salva, quando a escolho, então os nomes dela entram.
- [ ] Dado o botão "Salvar esta lista para usar de novo" ligado, quando envio, então a lista fica salva para a minha unidade.
- [ ] Dado mais pessoas que o limite da lista, quando envio, então o app recusa e diz quantas sobram; dado nomes iguais, então vejo um aviso, sem bloqueio.
- [ ] Dado a lista enviada, quando a portaria abre os esperados do dia, então cada pessoa está como visitante esperado, com documento só se informei.
- [ ] Dado a lista criada a partir de uma reserva, quando abro a tela, então data, horário e local vêm da reserva e, se passo da capacidade da área, vejo um aviso sem bloqueio.
- [ ] Dado a lista com data futura, quando o dia chega, então a portaria passa a vê-la; dado a lista cancelada, então quem ainda não chegou sai da portaria.

### US-VI-08 — Receber convidados em lista na portaria

Como porteiro, quero ver as pessoas de uma lista agrupadas e dar entrada uma a uma, para atender uma festa sem procurar cada nome entre os demais visitantes.

Requisitos: RF-VI-15, RF-VI-06, RF-VI-09 · RN-VI-17, RN-VI-05, RN-VI-06

- [ ] Dado uma lista do dia, quando abro a portaria, então vejo "Lista: [nome]", a unidade e "N pessoas, M chegaram".
- [ ] Dado a lista, quando a abro, então vejo as pessoas e registro a entrada de cada uma com 1 toque e Desfazer.
- [ ] Dado a busca por um nome, quando a pessoa é de uma lista, então a encontro mesmo com a lista fechada.
- [ ] Dado uma pessoa da lista na lista de bloqueio, quando registro a entrada, então vejo o alerta com o motivo.
- [ ] Dado as chegadas, quando registro, então o morador recebe o aviso da primeira e, depois, um resumo agrupado a cada 15 minutos.
## Épico 5 — Encomendas

### US-EN-01 — Registrar encomenda

Como porteiro, quero registrar uma encomenda recebida, para que o morador saiba na hora.

Requisitos: RF-EN-01, RF-EN-02 · RN-EN-01, RN-EN-05

- [ ] Dado uma encomenda, quando registro unidade e remetente (foto da etiqueta opcional), então o morador recebe push na hora.
- [ ] Dado uma entrega de comida por aplicativo, quando ela chega, então não há opção de registrá-la como encomenda.

### US-EN-02 — Retirar encomenda

Como morador, quero ser lembrado e registrar a retirada, para não esquecer pacotes na portaria.

Requisitos: RF-EN-03, RF-EN-04 · RN-EN-02 a RN-EN-04

- [ ] Dado qualquer morador da unidade, quando retira a encomenda, então o porteiro registra quem retirou e a encomenda fica "retirada".
- [ ] Dado uma encomenda não retirada, quando completa 3 e 7 dias, então o morador recebe lembretes.
- [ ] Dado 30 dias sem retirada, quando o prazo vence, então a encomenda fica "prazo vencido" e o síndico é avisado.

### US-EN-03 — Avisar uma entrega esperada

Como morador, quero avisar a portaria de uma entrega que vai chegar, para ela identificar o pacote e a minha unidade quando ele chegar.

Requisitos: RF-EN-06, RF-EN-08 · RN-EN-07 a RN-EN-09, RN-EN-12, RN-EN-13

- [ ] Dado a tela de encomendas, quando aviso uma entrega com a data esperada, então ela entra na lista com o selo "Esperada"; descrição, faixa de horário e origem são opcionais.
- [ ] Dado uma faixa com o fim antes do início, quando salvo, então vejo o erro e nada é gravado.
- [ ] Dado 10 entregas esperadas ativas na unidade, quando tento avisar outra, então vejo o limite e a opção de cancelar uma existente.
- [ ] Dado uma entrega "Esperada" ou "Não chegou", quando edito ou cancelo, então a portaria vê a mudança na hora.
- [ ] Dado a data que passou sem chegada, quando a rotina da meia-noite roda, então a entrega fica "Não chegou" e posso reagendar, o que a devolve a "Esperada".
- [ ] Dado a origem iFood/entregador, quando salvo, então a portaria recebe só um aviso, sem registro de encomenda.

### US-EN-04 — Ver as esperadas do dia e vincular à encomenda

Como porteiro, quero ver as entregas esperadas do dia e vinculá-las ao registrar a encomenda, para identificar o pacote e a unidade sem ligar para o morador.

Requisitos: RF-EN-07, RF-EN-02 · RN-EN-10 a RN-EN-12

- [ ] Dado entregas esperadas para hoje, quando abro Encomendas, então vejo "Esperadas hoje" ordenadas pela faixa de horário, com as sem faixa por último; entregas de outras datas não aparecem.
- [ ] Dado uma encomenda de unidade com entrega esperada, quando registro, então a entrega é sugerida pela unidade e pela origem, e eu confirmo ou escolho "Não vincular".
- [ ] Dado a encomenda vinculada, quando registro, então a entrega fica "Chegou" e o morador recebe um único push da encomenda.
- [ ] Dado uma encomenda de unidade sem entrega esperada, quando registro, então o registro segue normal, sem bloqueio nem alerta.
- [ ] Dado uma entrega esperada de iFood/entregador, quando vejo "Esperadas hoje", então ela tem o selo "Só aviso" e não há ação de registrar encomenda.

## Épico 6 — Chamados

### US-CH-01 — Abrir chamado

Como morador, síndico ou porteiro, quero abrir um chamado de limpeza ou manutenção com foto, para o problema ser resolvido por quem cuida dele.

Requisitos: RF-CH-01, RF-CH-06 · RN-CH-01 a RN-CH-03, RN-CH-09, RN-CH-10

- [ ] Dado um problema, quando abro o chamado, então escolho limpeza ou manutenção, a categoria e posso anexar foto.
- [ ] Dado que sou porteiro, quando abro o app, então posso abrir chamados, mas não vejo fila para atender.
- [ ] Dado um chamado aberto, quando é criado, então vai para a fila da limpeza ou para o síndico, conforme o tipo.
- [ ] Dado o formulário, quando escolho a urgência, então vejo alta, média e leve, cada uma com um exemplo, e nenhuma vem pré-selecionada.
- [ ] Dado que não escolhi a urgência, quando toco em Enviar, então vejo "Escolha a urgência do chamado." e o chamado não é enviado.
- [ ] Dado um chamado criado, quando o vejo na lista ou no detalhe (morador, síndico, subsíndico ou funcionário), então vejo a urgência com texto e cor: alta em vermelho, média em amarelo, leve em verde.

### US-CH-02 — Atender chamado de limpeza

Como funcionário de limpeza, quero ver e concluir os chamados do meu setor, inclusive sem internet, para organizar meu trabalho.

Requisitos: RF-CH-02, RF-CH-03, RF-CH-06 · RN-CH-04, RN-CH-06, RN-CH-08, RN-CH-13, RN-CH-14

- [ ] Dado chamados de limpeza abertos, quando abro o app, então vejo a fila com o prazo de cada um (padrão 24h).
- [ ] Dado chamados de limpeza abertos e concluídos, quando abro a fila, então os abertos vêm primeiro, da urgência alta para a leve; com urgência igual, o mais antigo vem antes; os concluídos ficam no fim (RN-CH-13).
- [ ] Dado a internet fora, quando concluo um chamado, então a conclusão fica na fila e sincroniza ao voltar a conexão.
- [ ] Dado duas conclusões offline do mesmo chamado, quando sincronizam, então vale a primeira.
- [ ] Dado um chamado fora do prazo, quando o síndico abre o painel, então ele aparece em destaque.
- [ ] Dado que vou concluir um chamado, quando abro a conclusão, então posso anexar até 5 fotos do serviço, mas não preciso: sem foto, "Concluir chamado" funciona igual.
- [ ] Dado a internet fora, quando concluo um chamado com fotos, então as fotos ficam na fila e são enviadas com a conclusão.

### US-CH-03 — Acompanhar manutenção

Como síndico, quero registrar a empresa contratada e o andamento dos chamados de manutenção, para os moradores saberem o que está sendo feito.

Requisitos: RF-CH-04, RF-CH-05, RF-CH-07 · RN-CH-05 a RN-CH-07, RN-CH-11, RN-CH-12, RN-CH-14

- [ ] Dado um chamado de manutenção, quando o atualizo, então escolho a empresa cadastrada e o status (aberto, orçamento, agendado, concluído).
- [ ] Dado 48h sem primeira atualização, quando o prazo vence, então o chamado aparece em destaque no meu painel.
- [ ] Dado a conclusão, quando registro, então posso anexar fotos do serviço (opcional); quem abriu é avisado, pode ver as fotos, reabrir em até 48h e avaliar o atendimento.
- [ ] Dado que sou subsíndico sem a substituição ativa, quando abro um chamado de manutenção, então só acompanho o andamento.
- [ ] Dado um chamado aberto, quando mudo a urgência, então o detalhe registra quem mudou, quando e de qual nível para qual, e quem abriu é avisado.
- [ ] Dado que sou funcionário ou porteiro, quando abro um chamado, então vejo a urgência, mas não consigo alterá-la.

### US-CH-04 — Avaliar o atendimento do chamado

Como morador, quero avaliar o serviço de um chamado concluído, para dizer se foi bem feito e ajudar o síndico a cobrar a qualidade.

Requisitos: RF-CH-05, RF-CH-08, RF-CH-09 · RN-CH-14 a RN-CH-18, RN-CH-21

- [ ] Dado um chamado concluído que abri, quando abro o detalhe, então vejo as fotos do serviço, se houver, e o botão "Avaliar o serviço".
- [ ] Dado um chamado concluído com fotos, quando avalio, então escolho entre "Vi as fotos do serviço" e "Conferi pessoalmente" e dou de 1 a 5 estrelas, com comentário opcional.
- [ ] Dado um chamado concluído sem fotos, quando avalio, então só posso enviar depois de marcar "Conferi pessoalmente", e o botão explica o motivo enquanto está desabilitado.
- [ ] Dado que dei 1 ou 2 estrelas dentro das 48h da conclusão, quando envio, então o app oferece "Reabrir chamado"; o chamado só reabre se eu aceitar, e o síndico é avisado da avaliação baixa.
- [ ] Dado que dei 1 ou 2 estrelas depois das 48h, quando envio, então o app oferece "Abrir novo chamado" em vez de reabrir.
- [ ] Dado que já avaliei a conclusão, quando abro o chamado, então vejo minha avaliação sem poder editá-la.
- [ ] Dado que passaram 7 dias da conclusão sem avaliação, quando abro o chamado, então o botão de avaliar não aparece; 24h depois da conclusão, sem avaliação, recebo um único lembrete.
- [ ] Dado que reabri o chamado sem avaliar, quando ele é concluído de novo, então abre-se uma nova janela de avaliação.
- [ ] Dado que sou síndico profissional, porteiro ou funcionário, quando vejo um chamado concluído, então não aparece a ação de avaliar.

### US-CH-05 — Acompanhar as avaliações de atendimento

Como síndico, administradora ou funcionário, quero ver como o atendimento está sendo avaliado, para cobrar e reconhecer a qualidade do serviço sem expor quem avaliou.

Requisitos: RF-CH-10, RF-CH-11 · RN-CH-18 a RN-CH-21

- [ ] Dado avaliações de chamados, quando o síndico abre "Avaliações do atendimento", então vê média, número de avaliações e distribuição por estrela de cada funcionário de limpeza e de cada empresa de manutenção.
- [ ] Dado uma avaliação baixa, quando o síndico abre o chamado, então vê a nota, o comentário e a base ("vi as fotos" ou "conferi pessoalmente").
- [ ] Dado que sou subsíndico sem a substituição ativa, quando abro a Gestão, então não vejo as avaliações por funcionário; na substituição, vejo como o síndico.
- [ ] Dado que sou administradora, quando abro a lista de funcionários, então vejo a média e o número de avaliações de cada um, sem comentários, chamados nem moradores.
- [ ] Dado que sou funcionário de limpeza com 3 ou mais avaliações, quando abro "Minhas avaliações", então vejo média, distribuição e comentários, sem unidade, morador, chamado nem local, com o mês no lugar da data.
- [ ] Dado que sou funcionário com menos de 3 avaliações, quando abro "Minhas avaliações", então vejo "Poucas avaliações para mostrar a média.", sem média nem comentários.
- [ ] Dado uma avaliação de chamado, quando o fechamento da pesquisa mensal roda, então o score do funcionário não muda por causa dela.

## Épico 7 — Reclamações e score

### US-RS-01 — Registrar reclamação

Como morador, quero registrar uma reclamação contra um funcionário, uma unidade, o síndico ou o subsíndico do meu condomínio, para que o problema seja tratado com critério.

Requisitos: RF-RS-01, RF-RS-02, RF-RS-07 · RN-RC-01, RN-RC-02, RN-RC-09, RN-RC-10

- [ ] Dado o formulário, quando escolho o alvo, então só aparecem funcionários, unidades, síndico e subsíndico do meu condomínio, e só posso escolher um.
- [ ] Dado a categoria escolhida, quando salvo, então a gravidade padrão é definida pela categoria.
- [ ] Dado a reclamação registrada, quando o alvo é notificado, então ele não vê quem reclamou.
- [ ] Dado que quero reclamar do síndico e do subsíndico, quando tento, então preciso abrir duas reclamações separadas.

### US-RS-02 — Conversar com o alvo antes de decidir

Como julgador, quero ver a reclamação com o score do reclamante e do alvo e conversar com o alvo, para decidir com os dois lados.

Requisitos: RF-RS-03, RF-RS-05 · RN-RC-04, RN-RC-06, RN-CO-04, RN-SC-11

- [ ] Dado uma reclamação no meu painel, quando a abro, então vejo identidade e score do reclamante e do alvo.
- [ ] Dado que ainda não iniciei a conversa com o alvo, quando tento decidir, então os botões de validar e negar ficam bloqueados.
- [ ] Dado a conversa iniciada, quando o alvo responde ou passam 5 dias sem resposta, então os botões são liberados; sem resposta, a reclamação registra "alvo não respondeu".
- [ ] Dado que sou administradora ou conselho fiscal julgando, quando abro a reclamação, então também posso iniciar a conversa com o alvo.
- [ ] Dado a conversa feita por comunicado individual vinculado, quando o alvo responde, então a resposta aparece na reclamação.
- [ ] Dado 15 dias sem decisão, quando o prazo vence, então recebo lembrete e outro a cada 5 dias.

### US-RS-03 — Validar ou negar

Como julgador, quero validar a reclamação ou negá-la com motivo, para aplicar os pontos corretos a quem deve.

Requisitos: RF-RS-06, RF-RS-08 · RN-RC-05, RN-SC-03 a RN-SC-05

- [ ] Dado que valido, quando confirmo, então o alvo perde 5, 10 ou 20 pontos conforme a gravidade, que posso ajustar com justificativa.
- [ ] Dado reclamação contra uma unidade validada, quando confirmo, então só o morador habilitado da unidade perde pontos; na unidade desocupada, ninguém perde pontos e o proprietário é avisado.
- [ ] Dado que nego, quando confirmo, então preciso escolher um motivo: boa-fé (0), desproporcional (−5), falsa (−15) ou duplicada (0).
- [ ] Dado um motivo com penalidade, quando confirmo, então preciso escrever a justificativa, e o reclamante perde os pontos.

### US-RS-04 — Encaminhar ao julgador certo

Como condomínio, quero que cada reclamação vá automaticamente para quem pode julgá-la sem conflito de interesse.

Requisitos: RF-RS-04 · RN-RC-03, RN-RC-11

- [ ] Dado reclamação contra o síndico ou a unidade dele, quando é aberta, então vai para o subsíndico; sem subsíndico, para a administradora; sem ela, para o conselho fiscal.
- [ ] Dado reclamação contra o subsíndico, quando é aberta, então vai para o síndico.
- [ ] Dado reclamação contra o subsíndico com a substituição ativa, quando é aberta, então vai para a administradora; sem ela, fica "pendente" até o fim da substituição.
- [ ] Dado reclamação feita pelo próprio julgador, quando é aberta, então vai para quem julgaria uma reclamação contra ele.

### US-RS-05 — Recorrer de uma decisão

Como quem perdeu pontos, quero recorrer uma vez, para ter a decisão revista por outra pessoa.

Requisitos: RF-RS-09 · RN-RC-07, RN-RC-14, RN-RC-15

- [ ] Dado uma decisão que me tirou pontos, quando estou dentro de 7 dias, então posso recorrer uma vez.
- [ ] Dado decisão do síndico, quando recorro, então o recurso vai ao subsíndico (sem subsíndico, à administradora; sem ela, ao conselho fiscal); decisão do subsíndico vai ao síndico.
- [ ] Dado que o julgador do recurso seria parte da reclamação (ex.: subsíndico decidiu uma reclamação contra o síndico), quando recorro, então o recurso vai à administradora; sem ela, ao conselho fiscal.
- [ ] Dado 7 dias sem recurso, quando a rotina roda, então a reclamação fica "encerrada".
- [ ] Dado decisão da administradora ou do conselho fiscal, quando abro a reclamação, então não há opção de recurso.
- [ ] Dado recurso aceito, quando é decidido, então os pontos voltam e essa perda deixa de contar para a regularidade.

### US-RS-06 — Acompanhar meu score

Como usuário, quero ver meu score, o histórico e quando vou recuperar pontos, para entender minha situação.

Requisitos: RF-RS-10, RF-RS-11 · RN-SC-01, RN-SC-08, RN-SC-12

- [ ] Dado meu perfil, quando abro o score, então vejo o valor, cada ganho e perda com data e motivo, e a data da próxima recuperação.
- [ ] Dado 2 meses sem reclamação validada nem penalidade por reclamação, quando o período completa, então ganho 5 pontos, até 100.
- [ ] Dado uma reclamação validada contra mim ou uma penalidade por reclamação desproporcional ou falsa, quando ocorre, então o período de regularidade reinicia.
- [ ] Dado reclamações pendentes ou negadas sem penalidade, quando ocorrem, então o período continua contando.
- [ ] Dado meu histórico, quando há perdas por reclamação, então nunca aparece quem reclamou.

### US-RS-07 — Transparência e supervisão

Como morador, quero ver o score do síndico e a nota dos setores; como administradora, quero consultar todas as reclamações, para acompanhar a gestão.

Requisitos: RF-RS-12 a RF-RS-14 · RN-SC-02, RN-RC-08, RN-RC-13

- [ ] Dado a tela "Transparência", quando a abro, então vejo o score do síndico e a nota de cada setor, e nenhum score individual de outros moradores ou funcionários.
- [ ] Dado que sou administradora, quando abro as reclamações, então vejo todas, com identidade e score do reclamante e do alvo, inclusive contra síndico e subsíndico.
- [ ] Dado um texto ofensivo, quando é enviado, então o filtro o bloqueia; e quando alguém denuncia um conteúdo, a denúncia vai ao síndico.

### US-RS-08 — Acompanhar o prazo da reclamação

Como morador que reclamou ou como julgador, quero ver num relance se o prazo de decisão da reclamação está no prazo, se esgotando ou esgotado, para saber o que acompanhar ou decidir primeiro.

Requisitos: RF-RS-16 · RN-RC-06, RN-RC-17 a RN-RC-19

- [ ] Dado uma reclamação minha aguardando decisão, quando abro a lista ou o detalhe, então vejo um selo com texto e ícone: verde "No prazo · 9 dias", amarelo "Vence amanhã" ou "Vence hoje", ou vermelho "Prazo esgotado há 2 dias".
- [ ] Dado o prazo de 15 dias, quando restam 4 dias ou menos, então o selo fica amarelo; com 3 dias de prazo, fica amarelo no último dia.
- [ ] Dado o dia do vencimento, quando abro a reclamação, então o selo está amarelo ("Vence hoje") e só fica vermelho no dia seguinte.
- [ ] Dado que sou síndico, subsíndico, administradora ou conselho fiscal julgando, quando abro o painel, então vejo o selo em cada reclamação que aguarda minha decisão, inclusive as contra o síndico no caso do subsíndico.
- [ ] Dado uma reclamação pendente, validada, negada, em recurso, com recurso aceito ou encerrada, quando abro a lista, então não há semáforo, só o selo de estado.
- [ ] Dado um prazo esgotado, quando o julgador abre a reclamação, então os botões de validar e negar continuam regidos só pela conversa com o alvo (RN-RC-04).
- [ ] Dado que sou o alvo, quando abro a reclamação, então não vejo o semáforo.

## Épico 8 — Pesquisa mensal

### US-PE-01 — Avaliar funcionários

Como morador, quero dar de 1 a 5 estrelas a cada funcionário, para reconhecer quem trabalha bem e apontar problemas.

Requisitos: RF-PE-01 · RN-PE-01 a RN-PE-04

- [ ] Dado o mês aberto, quando abro a pesquisa, então vejo os funcionários ativos agrupados por setor.
- [ ] Dado um funcionário que não conheço, quando sigo adiante, então posso pulá-lo; a pesquisa toda é opcional.
- [ ] Dado que já avaliei alguém no mês, quando abro de novo, então posso mudar a nota até o fechamento, mas não avaliar duas vezes.
- [ ] Dado que sou síndico profissional ou funcionário, quando abro o app, então a pesquisa não aparece para mim.

### US-PE-02 — Fechar o mês e publicar a nota do setor

Como condomínio, quero que o fechamento ajuste o score dos funcionários e publique a nota de cada setor, para que a avaliação tenha efeito.

Requisitos: RF-PE-02 a RF-PE-04 · RN-PE-05 a RN-PE-09

- [ ] Dado o último dia do mês às 23h59, quando a rotina roda, então cada funcionário avaliado tem o score ajustado: média abaixo de 3 perde 5; de 3 até menos de 4,5 mantém; 4,5 ou mais ganha 5, até 100.
- [ ] Dado um funcionário sem avaliações no mês, quando a rotina roda, então o score dele não muda.
- [ ] Dado um setor com 2 ou mais funcionários avaliados, quando a rotina roda, então a nota do setor (média das médias) é publicada.
- [ ] Dado um setor com só 1 funcionário avaliado, quando a rotina roda, então a nota do setor não é publicada.
- [ ] Dado as notas e comentários individuais, quando o funcionário os abre, então vê os seus, sem saber quem avaliou; ninguém mais vê.

## Épico 9 — Comunicação

### US-CO-01 — Enviar comunicado geral

Como síndico, quero enviar comunicados para moradores, funcionários ou todos, para avisar o condomínio de uma vez.

Requisitos: RF-CO-01 · RN-CO-01, RN-CO-02

- [ ] Dado um comunicado, quando escolho o público, então só esse público recebe e é notificado.
- [ ] Dado um comunicado enviado, quando o abro depois, então vejo quem leu.
- [ ] Dado a substituição ativa, quando o subsíndico abre o app, então ele também pode enviar comunicados.

### US-CO-02 — Conversar individualmente

Como síndico, quero enviar comunicados individuais que aceitam resposta, para tratar assuntos com uma pessoa, inclusive o alvo de uma reclamação.

Requisitos: RF-CO-02, RF-CO-03 · RN-CO-03, RN-CO-04

- [ ] Dado um comunicado individual, quando o destinatário responde, então sou notificado e a conversa fica no histórico dos dois.
- [ ] Dado uma reclamação em análise, quando inicio a conversa com o alvo por ela, então o comunicado fica vinculado à reclamação.

### US-CO-03 — Sugerir comunicado como subsíndico

Como subsíndico, quero escrever comunicados para o síndico revisar e enviar, para ajudar na comunicação sem falar em nome do condomínio sozinho.

Requisitos: RF-CO-04 · RN-CO-01, RN-CO-05

- [ ] Dado que sou subsíndico sem a substituição ativa, quando escrevo um comunicado, então o botão é "Enviar sugestão ao síndico" e a sugestão fica "Aguardando o síndico".
- [ ] Dado uma sugestão pendente, quando o síndico abre Comunicados, então vê a seção "Sugestões da subsíndica" e pode revisar, editar e enviar, ou descartar.
- [ ] Dado que o síndico envia ou descarta, quando decide, então sou avisado e a sugestão muda para "Enviado pelo síndico" ou "Descartada".
- [ ] Dado uma sugestão com termo ofensivo, quando a envio, então o trecho é destacado como num comunicado comum.
- [ ] Dado que a substituição é ativada, quando tenho sugestões pendentes, então elas voltam para mim e posso enviá-las.

## Épico 10 — Reuniões, votações e eleições

### US-VO-01 — Convocar reunião

Como síndico, quero convocar uma reunião com pautas e, depois, anexar a ata, para registrar tudo no app.

Requisitos: RF-VO-01, RF-VO-09, RF-VO-10 · RN-VO-02, RN-VO-12, RN-VO-18

- [ ] Dado a convocação, quando a crio, então informo data, local e pautas, e marco cada pauta como informativa ou com votação.
- [ ] Dado uma pauta com votação, quando a configuro, então defino as opções de voto e o quórum.
- [ ] Dado uma pauta com votação, quando a configuro, então ela vem marcada como "envolve despesa extraordinária", e posso desmarcar.
- [ ] Dado a reunião encerrada, quando anexo ata e lista de presença em PDF, então ficam disponíveis para os moradores.

### US-VO-02 — Votar

Como proprietário, quero votar em cada pauta pelo app ou indicar um procurador, para participar mesmo sem ir à reunião.

Requisitos: RF-VO-02 a RF-VO-04, RF-VO-07, RF-VO-11 · RN-VO-01, RN-VO-03, RN-VO-08, RN-VO-10, RN-VO-11, RN-VO-18

- [ ] Dado que sou o proprietário, more ou não na unidade, quando a votação está aberta (da convocação ao encerramento da reunião), então voto uma vez por pauta pela unidade.
- [ ] Dado que sou morador mas não sou o proprietário nem o procurador dele, quando abro uma pauta que envolve despesa extraordinária, então vejo a votação sem a opção de votar e com o motivo.
- [ ] Dado que sou o inquilino, quando abro uma pauta sem despesa extraordinária, então posso votar, e o app avisa que o voto do proprietário substitui o meu se ele votar até o encerramento.
- [ ] Dado que o proprietário votou depois de mim numa pauta sem despesa extraordinária, quando a votação encerra, então só o voto dele conta e eu sou avisado.
- [ ] Dado que sou o proprietário, quando indico o inquilino como procurador, então ele vota em todas as pautas pela unidade.
- [ ] Dado que indico um procurador antes da votação, quando ele já representa outra unidade além da dele, então o sistema recusa.
- [ ] Dado votos presenciais registrados pelo síndico, quando a unidade já votou online, então o voto presencial dela é recusado.
- [ ] Dado a votação aberta, quando consulto o resultado, então ele só aparece após o encerramento, com a contagem por opção e sem identificar votos.

### US-VO-03 — Eleger síndico e subsíndico

Como morador, quero me candidatar e votar na eleição pelo app, para escolher a gestão com regras claras.

Requisitos: RF-VO-05, RF-VO-06, RF-VO-08 · RN-VO-04, RN-VO-05, RN-VO-07, RN-VO-13, RN-VO-14

- [ ] Dado o prazo de candidaturas aberto, quando me candidato, então o sistema verifica a elegibilidade e, se eu for inelegível, mostra o motivo.
- [ ] Dado a reeleição desligada pela administradora, quando o síndico morador atual tenta se candidatar, então é bloqueado; com a regra padrão, é aceito.
- [ ] Dado um empate, quando a eleição encerra, então um segundo turno entre os empatados é aberto em até 7 dias.
- [ ] Dado síndico e subsíndico eleitos da mesma unidade, quando o resultado sai, então assume como subsíndico o próximo mais votado.

## Épico 11 — Planos e suporte

### US-PL-01 — Cobrar pela faixa de unidades

Como admin da plataforma, quero que cada condomínio pague conforme a faixa de unidades e o plano, para que o preço acompanhe o porte.

Requisitos: RF-AD-16 · RN-PL-01, RN-PL-06, RN-PL-07

- [ ] Dado o número de unidades cadastradas, quando a fatura é gerada, então o valor segue a faixa e o plano (ex.: 120 unidades no Essencial = R$ 299).
- [ ] Dado que o condomínio muda de faixa, quando isso ocorre, então o novo valor vale a partir do ciclo seguinte.
- [ ] Dado que um condomínio do Gestão + Suporte contrata uma administradora, quando registrado, então passa ao Essencial no ciclo seguinte e o suporte perde o acesso.
- [ ] Dado a revisão anual de preços, quando um novo valor é definido, então o cliente é avisado com 30 dias de antecedência.

### US-PL-02 — Controlar a franquia de solicitações

Como equipe de suporte, quero atender solicitações dentro da franquia do condomínio e registrar o excedente, para o plano Gestão + Suporte ser sustentável.

Requisitos: RF-AD-16 · RN-PL-02 a RN-PL-05, RN-CD-16

- [ ] Dado a faixa do condomínio, quando o mês começa, então a franquia é de 10 (até 150 unidades), 25 (151 a 300) ou 50 (301 a 600); acima de 600, a definida em contrato.
- [ ] Dado solicitações não usadas, quando o mês termina, então elas não passam para o mês seguinte.
- [ ] Dado uma solicitação além da franquia, quando é atendida, então R$ 15 entram na fatura seguinte.
- [ ] Dado a importação inicial na implantação, quando é feita, então não conta na franquia.
- [ ] Dado um acesso do suporte, quando ocorre, então só é possível em condomínio do Gestão + Suporte e fica registrado.

## Épico 12 — Notificações e LGPD

### US-NO-01 — Escolher notificações

Como usuário, quero escolher quais notificações recebo, para não ser incomodado com o que não me interessa.

Requisitos: RF-NO-01

- [ ] Dado as configurações de notificação, quando as abro, então vejo cada tipo (visitante, encomenda, reserva, chamado, comunicado, votação, reclamação) com opção de ligar ou desligar.
- [ ] Dado um tipo obrigatório (ex.: decisão de reclamação contra mim, divergência de sincronização para o porteiro), quando tento desligá-lo, então o app não permite.

### US-LG-01 — Exercer meus direitos de titular

Como usuário, quero pedir cópia dos meus dados ou a exclusão da conta, para ter controle sobre minhas informações.

Requisitos: RF-LG-01, RF-LG-02 · SEG-11

- [ ] Dado um pedido de cópia, quando o envio, então recebo um arquivo com meus dados por e-mail em até 15 dias.
- [ ] Dado um pedido de exclusão, quando é concluído, então perco o acesso e meu histórico é anonimizado.
- [ ] Dado meus votos e reclamações, quando a conta é excluída, então eles continuam contando, sem me identificar.

## Épico 13 — Cobrança e finanças do condomínio

### US-FI-01 — Configurar a cobrança

Como administradora, quero definir valores, vencimento, responsável financeiro e formas de pagamento de cada condomínio, para cobrar a taxa pelo app.

Requisitos: RF-FI-01 a RF-FI-04 · RN-FI-01 a RN-FI-07

- [ ] Dado um condomínio, quando ativo o módulo de cobrança, então escolho entre boleto (com QR Code Pix), Pix e cartão, e o sistema exige pelo menos uma forma.
- [ ] Dado as unidades, quando defino os valores, então posso usar valor fixo ou por fração ideal.
- [ ] Dado a multa por atraso, quando tento configurar mais de 2%, então o sistema recusa e mostra o limite legal.
- [ ] Dado uma unidade, quando não escolho os responsáveis financeiros, então o morador habilitado responde pelas despesas ordinárias e pelas extraordinárias.
- [ ] Dado uma unidade alugada, quando abro os responsáveis financeiros, então posso definir um para as ordinárias e outro para as extraordinárias.

### US-FI-02 — Receber as cobranças do mês

Como responsável financeiro, quero receber a cobrança com antecedência e ser lembrado do vencimento, para pagar em dia.

Requisitos: RF-FI-05, RF-FI-07, RF-FI-11 · RN-FI-04, RN-FI-05, RN-FI-16

- [ ] Dado o vencimento no dia 10, quando faltam 15 dias, então a cobrança é gerada e aparece no app nas formas ativas.
- [ ] Dado um vencimento em dia não útil, quando a cobrança é gerada, então vence no próximo dia útil.
- [ ] Dado uma cobrança em aberto, quando faltam 5 dias, no dia e 1 e 7 dias depois do vencimento, então recebo lembretes.

### US-FI-03 — Pagar a taxa no app

Como responsável financeiro, quero pagar por boleto, Pix ou cartão e baixar o comprovante, para resolver tudo pelo celular.

Requisitos: RF-FI-07 a RF-FI-09, RF-FI-12 · RN-FI-06, RN-FI-08, RN-FI-13, RN-FI-17

- [ ] Dado uma cobrança em aberto, quando pago por uma das formas ativas, então a baixa é automática e a cobrança fica "paga".
- [ ] Dado uma cobrança vencida, quando gero a segunda via, então o valor inclui multa de 2% e juros de 1% ao mês proporcionais aos dias.
- [ ] Dado um pagamento confirmado, quando abro a cobrança, então baixo o comprovante.
- [ ] Dado um pagamento confirmado, quando é processado, então o valor vai para a conta do condomínio, descontadas as taxas do gateway.

### US-FI-04 — Lançar cobranças extras e pagamentos fora do app

Como administradora, quero lançar rateios e outras cobranças extras e registrar pagamentos feitos por fora, para manter a cobrança completa e correta.

Requisitos: RF-FI-06, RF-FI-10, RF-FI-16 · RN-FI-14, RN-FI-15, RN-FI-20

- [ ] Dado uma solicitação do síndico, quando lanço uma cobrança extra, então informo descrição, tipo (ordinária ou extraordinária), valor, unidades (uma, várias ou todas) e vencimento.
- [ ] Dado uma cobrança extraordinária para uma unidade alugada, quando a lanço, então ela é emitida ao proprietário; uma ordinária, ao inquilino.
- [ ] Dado uma multa por infração numa unidade alugada, quando a lanço, então ela vai ao inquilino e o proprietário é avisado.
- [ ] Dado um pagamento feito fora do app, quando o registro, então anexo o comprovante e o motivo, e a cobrança fica paga.
- [ ] Dado uma cobrança emitida por engano, quando a cancelo, então informo o motivo e o cancelamento fica na auditoria.
- [ ] Dado que sou síndico, quando abro a cobrança, então só consigo solicitar cobranças extras, não lançá-las.

### US-FI-05 — Acompanhar a inadimplência

Como administradora ou síndico, quero ver as unidades em atraso, para agir sem expor ninguém.

Requisitos: RF-FI-13, RF-FI-15 · RN-FI-09 a RN-FI-12, SEG-17

- [ ] Dado uma cobrança vencida sem pagamento, quando passa o dia do vencimento, então a unidade fica "em atraso" e entra no painel, com valor e dias de atraso.
- [ ] Dado que sou morador comum, quando uso o app, então não vejo em lugar nenhum a situação financeira de outras unidades.
- [ ] Dado uma unidade em atraso, quando quem vota por ela tenta votar, então o voto é bloqueado, e o motivo só aparece para quem vota e para os responsáveis financeiros da unidade.
- [ ] Dado o bloqueio de reservas por atraso desligado (padrão), quando a unidade em atraso reserva, então reserva normalmente; ligado, novas reservas ficam bloqueadas até quitar.
- [ ] Dado o painel, quando exporto, então recebo um CSV de cobranças e pagamentos para a contabilidade.

### US-FI-06 — Negociar débitos (versão 2)

Como administradora, quero parcelar o débito de uma unidade em acordo, para facilitar a regularização.

Requisitos: RF-FI-14 · RN-FI-18

- [ ] Dado uma unidade em atraso, quando registro um acordo, então defino o número e o vencimento das parcelas e as cobranças antigas ficam "em acordo".
- [ ] Dado uma parcela do acordo vencida sem pagamento, quando a rotina roda, então a cobrança volta a ficar "em atraso".

### US-FI-07 — Acompanhar as finanças do condomínio

Como administradora, síndico ou membro do conselho fiscal, quero ver receitas, despesas e saldo do condomínio por mês e por categoria, para saber para onde vai o dinheiro.

Requisitos: RF-FI-17, RF-FI-18, RF-FI-21, RF-FI-22 · RN-FI-21 a RN-FI-23, RN-FI-29, RN-FI-30, SEG-18

- [ ] Dado um mês, quando abro as finanças, então vejo receitas, despesas e saldo, com a comparação com o mês anterior em texto (aumento ou queda, em reais e em %).
- [ ] Dado receitas de cobranças extraordinárias no mês, quando vejo o resumo, então elas aparecem discriminadas, para o saldo não parecer sobra da rotina.
- [ ] Dado as despesas do mês, quando vejo as categorias, então há um gráfico de barras e a tabela com valor, percentual e variação sobre o mês anterior.
- [ ] Dado a evolução, quando escolho 6 ou 12 meses, então vejo receitas e despesas de cada mês no gráfico e na tabela equivalente.
- [ ] Dado uma cobrança ou reserva paga, quando o pagamento é confirmado, então ela entra como receita na data do pagamento, sem ninguém digitar, e não pode ser editada nem excluída nas finanças.
- [ ] Dado uma cobrança paga, quando vejo a receita, então ela aparece agregada ("117 cobranças pagas"), sem unidade nem responsável financeiro.
- [ ] Dado a taxa do gateway de um pagamento, quando ele é confirmado, então a taxa entra sozinha como despesa de Administração.
- [ ] Dado os filtros de período, categoria, tipo e texto, quando os aplico, então a lista e os totais mostram só o filtrado.
- [ ] Dado que exporto, quando escolho CSV ou PDF, então o arquivo respeita o filtro, traz o resumo, as categorias e os lançamentos, e não contém unidade nem responsável financeiro.
- [ ] Dado que sou síndico, subsíndico em substituição ou conselho fiscal, quando abro as finanças, então só leio, comento e exporto; não vejo botões de lançar, editar, fechar nem estornar.
- [ ] Dado que sou morador, proprietário não residente ou funcionário, quando uso o app, então não encontro as finanças do condomínio em lugar nenhum.

### US-FI-08 — Lançar despesas e receitas

Como administradora, quero registrar as despesas do condomínio e as receitas que não vêm de cobrança, para manter o controle completo.

Requisitos: RF-FI-19, RF-FI-20 · RN-FI-24 a RN-FI-26, RN-FI-32

- [ ] Dado uma despesa, quando a lanço, então informo data, categoria, valor, fornecedor e, se quiser, descrição e comprovante; em Serviços terceirizados, escolho também o serviço (portaria, limpeza, elevador, jardinagem ou outro).
- [ ] Dado um lançamento sem fornecedor, com valor zero ou com data futura, quando tento salvar, então o app recusa e mostra o motivo ao lado do campo.
- [ ] Dado uma data em mês fechado, quando tento salvar, então o app recusa e orienta a usar uma data de mês aberto ou estornar um lançamento.
- [ ] Dado uma despesa sem comprovante, quando vejo a lista, então ela aparece com "Não anexado", sem impedir o lançamento.
- [ ] Dado uma receita avulsa, quando a lanço, então só posso escolher "Outras receitas"; com o módulo de cobrança desligado, posso escolher também "Taxa condominial" e "Fundo de reserva".
- [ ] Dado a folha de funcionários, quando a lanço, então informo só o total do mês, sem nome nem salário individual.
- [ ] Dado um lançamento marcado como recorrente com o dia 31, quando o mês tem 30 dias, então o sistema o cria no dia 30.
- [ ] Dado um lançamento recorrente, quando encerro a recorrência, então os meses anteriores não mudam.

### US-FI-09 — Fechar o mês e estornar lançamentos

Como administradora, quero fechar o mês e corrigir lançamentos de meses fechados sem apagar o histórico, para o controle ser confiável para o síndico e o conselho fiscal.

Requisitos: RF-FI-23 · RN-FI-27, RN-FI-28

- [ ] Dado um mês aberto, quando edito ou excluo um lançamento avulso, então a alteração fica na auditoria com autor, data, valor antigo e valor novo.
- [ ] Dado um mês que acabou, quando o fecho, então o app avisa quantas despesas estão sem comprovante e pede confirmação de que depois só haverá estorno.
- [ ] Dado o dia 10 do mês seguinte e o mês ainda aberto, quando a rotina roda, então o mês é fechado.
- [ ] Dado um lançamento de mês fechado, quando tento editá-lo ou excluí-lo, então não há essas opções; só "Estornar".
- [ ] Dado um estorno, quando o faço, então informo o motivo, o sistema cria um lançamento de valor oposto na mesma categoria, com a data de hoje, e o original passa a "Estornado", com o link para o estorno.
- [ ] Dado um lançamento já estornado ou um estorno, quando abro as ações, então não há "Estornar".
- [ ] Dado um lançamento automático de cobrança ou reserva, quando abro as ações, então não há "Estornar"; a correção é feita na cobrança ou na reserva.
- [ ] Dado um pagamento confirmado depois do fechamento do mês, quando ele entra, então vai para o mês do pagamento e o mês fechado não muda.

### US-FI-10 — Comentar as finanças

Como síndico ou membro do conselho fiscal, quero comentar um lançamento ou o mês, para tirar dúvidas e registrar a conferência.

Requisitos: RF-FI-24 · RN-FI-29, RN-FI-31

- [ ] Dado um lançamento ou um mês, quando comento, então o comentário mostra meu nome e a data, não pode ser editado e a administradora recebe um aviso.
- [ ] Dado um mês fechado, quando comento, então o comentário é aceito e os valores não mudam.
- [ ] Dado um comentário, quando a administradora o lê, então ele não altera valores nem marca o mês como aprovado.

## Cobertura

As 71 histórias cobrem os 138 requisitos funcionais do PRD; requisitos não funcionais (RNF) e de segurança (SEG) são verificados nos testes de cada versão.

| Épico | Histórias | Requisitos funcionais cobertos |
| --- | --- | --- |
| 1. Acesso e conta | US-AC-01 a US-AC-06 | RF-AC-01 a RF-AC-08 |
| 2. Administração | US-AD-01 a US-AD-12 | RF-AD-01 a RF-AD-15, RF-AD-17 a RF-AD-21 |
| 3. Reservas e pagamentos | US-RE-01 a US-RE-06 | RF-RE-01 a RF-RE-09, RF-PG-01 a RF-PG-04 |
| 4. Visitantes e portaria | US-VI-01 a US-VI-08, US-AD-11 | RF-VI-01 a RF-VI-15 |
| 5. Encomendas | US-EN-01 a US-EN-04, US-AD-12 | RF-EN-01 a RF-EN-08 |
| 6. Chamados | US-CH-01 a US-CH-05 | RF-CH-01 a RF-CH-11 |
| 7. Reclamações e score | US-RS-01 a US-RS-08, US-AD-11 | RF-RS-01 a RF-RS-16 |
| 8. Pesquisa mensal | US-PE-01, US-PE-02 | RF-PE-01 a RF-PE-04 |
| 9. Comunicação | US-CO-01 a US-CO-03 | RF-CO-01 a RF-CO-04 |
| 10. Reuniões, votações e eleições | US-VO-01 a US-VO-03 | RF-VO-01 a RF-VO-11 |
| 11. Planos e suporte | US-PL-01, US-PL-02 | RF-AD-16 |
| 12. Notificações e LGPD | US-NO-01, US-LG-01 | RF-NO-01, RF-LG-01, RF-LG-02 |
| 13. Cobrança e finanças do condomínio | US-FI-01 a US-FI-10 | RF-FI-01 a RF-FI-24 |
