# Histórias de Usuário e Critérios de Aceite — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

## Como ler

São 56 histórias em 13 épicos; cada uma é entregue quando todos os seus critérios de aceite passam nos testes.

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
- [ ] Dado uma unidade sem morador habilitado, quando tento salvar, então o sistema exige que eu escolha um.
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

Requisitos: RF-RE-02 · RN-RE-02, RN-RE-07

- [ ] Dado um horário livre e as regras cumpridas, quando confirmo, então a reserva fica "confirmada" na hora, sem aprovação do síndico.
- [ ] Dado que minha unidade já fez 2 reservas na área neste mês, quando tento a terceira, então o app bloqueia e mostra o limite.
- [ ] Dado uma reserva cancelada, quando conto o limite do mês, então ela não entra na conta.

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

## Épico 6 — Chamados

### US-CH-01 — Abrir chamado

Como morador, síndico ou porteiro, quero abrir um chamado de limpeza ou manutenção com foto, para o problema ser resolvido por quem cuida dele.

Requisitos: RF-CH-01 · RN-CH-01 a RN-CH-03

- [ ] Dado um problema, quando abro o chamado, então escolho limpeza ou manutenção, a categoria e posso anexar foto.
- [ ] Dado que sou porteiro, quando abro o app, então posso abrir chamados, mas não vejo fila para atender.
- [ ] Dado um chamado aberto, quando é criado, então vai para a fila da limpeza ou para o síndico, conforme o tipo.

### US-CH-02 — Atender chamado de limpeza

Como funcionário de limpeza, quero ver e concluir os chamados do meu setor, inclusive sem internet, para organizar meu trabalho.

Requisitos: RF-CH-02, RF-CH-03 · RN-CH-04, RN-CH-06, RN-CH-08

- [ ] Dado chamados de limpeza abertos, quando abro o app, então vejo a fila com o prazo de cada um (padrão 24h).
- [ ] Dado a internet fora, quando concluo um chamado, então a conclusão fica na fila e sincroniza ao voltar a conexão.
- [ ] Dado duas conclusões offline do mesmo chamado, quando sincronizam, então vale a primeira.
- [ ] Dado um chamado fora do prazo, quando o síndico abre o painel, então ele aparece em destaque.

### US-CH-03 — Acompanhar manutenção

Como síndico, quero registrar a empresa contratada e o andamento dos chamados de manutenção, para os moradores saberem o que está sendo feito.

Requisitos: RF-CH-04, RF-CH-05 · RN-CH-05 a RN-CH-07

- [ ] Dado um chamado de manutenção, quando o atualizo, então escolho a empresa cadastrada e o status (aberto, orçamento, agendado, concluído).
- [ ] Dado 48h sem primeira atualização, quando o prazo vence, então o chamado aparece em destaque no meu painel.
- [ ] Dado a conclusão, quando registro, então quem abriu é avisado e pode reabrir em até 48h.

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
- [ ] Dado reclamação contra uma unidade validada, quando confirmo, então só o morador habilitado da unidade perde pontos.
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

## Épico 10 — Reuniões, votações e eleições

### US-VO-01 — Convocar reunião

Como síndico, quero convocar uma reunião com pautas e, depois, anexar a ata, para registrar tudo no app.

Requisitos: RF-VO-01, RF-VO-09 · RN-VO-02, RN-VO-12

- [ ] Dado a convocação, quando a crio, então informo data, local e pautas, e marco cada pauta como informativa ou com votação.
- [ ] Dado uma pauta com votação, quando a configuro, então defino as opções de voto e o quórum.
- [ ] Dado a reunião encerrada, quando anexo ata e lista de presença em PDF, então ficam disponíveis para os moradores.

### US-VO-02 — Votar

Como morador habilitado, quero votar em cada pauta pelo app ou indicar um procurador, para participar mesmo sem ir à reunião.

Requisitos: RF-VO-02 a RF-VO-04, RF-VO-07 · RN-VO-01, RN-VO-03, RN-VO-08, RN-VO-10, RN-VO-11

- [ ] Dado que sou o morador habilitado, quando a votação está aberta (da convocação ao encerramento da reunião), então voto uma vez por pauta pela unidade.
- [ ] Dado que não sou o morador habilitado, quando abro a pauta, então vejo a votação sem a opção de votar.
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

## Épico 13 — Cobrança condominial

### US-FI-01 — Configurar a cobrança

Como administradora, quero definir valores, vencimento, responsável financeiro e formas de pagamento de cada condomínio, para cobrar a taxa pelo app.

Requisitos: RF-FI-01 a RF-FI-04 · RN-FI-01 a RN-FI-07

- [ ] Dado um condomínio, quando ativo o módulo de cobrança, então escolho entre boleto (com QR Code Pix), Pix e cartão, e o sistema exige pelo menos uma forma.
- [ ] Dado as unidades, quando defino os valores, então posso usar valor fixo ou por fração ideal.
- [ ] Dado a multa por atraso, quando tento configurar mais de 2%, então o sistema recusa e mostra o limite legal.
- [ ] Dado uma unidade, quando não escolho o responsável financeiro, então ele é o morador habilitado.

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

Requisitos: RF-FI-06, RF-FI-10 · RN-FI-14, RN-FI-15

- [ ] Dado uma solicitação do síndico, quando lanço uma cobrança extra, então informo descrição, valor, unidades (uma, várias ou todas) e vencimento.
- [ ] Dado um pagamento feito fora do app, quando o registro, então anexo o comprovante e o motivo, e a cobrança fica paga.
- [ ] Dado uma cobrança emitida por engano, quando a cancelo, então informo o motivo e o cancelamento fica na auditoria.
- [ ] Dado que sou síndico, quando abro a cobrança, então só consigo solicitar cobranças extras, não lançá-las.

### US-FI-05 — Acompanhar a inadimplência

Como administradora ou síndico, quero ver as unidades em atraso, para agir sem expor ninguém.

Requisitos: RF-FI-13, RF-FI-15 · RN-FI-09 a RN-FI-12, SEG-17

- [ ] Dado uma cobrança vencida sem pagamento, quando passa o dia do vencimento, então a unidade fica "em atraso" e entra no painel, com valor e dias de atraso.
- [ ] Dado que sou morador comum, quando uso o app, então não vejo em lugar nenhum a situação financeira de outras unidades.
- [ ] Dado uma unidade em atraso, quando o morador habilitado tenta votar, então o voto é bloqueado e só ele vê o motivo.
- [ ] Dado o bloqueio de reservas por atraso desligado (padrão), quando a unidade em atraso reserva, então reserva normalmente; ligado, novas reservas ficam bloqueadas até quitar.
- [ ] Dado o painel, quando exporto, então recebo um CSV de cobranças e pagamentos para a contabilidade.

### US-FI-06 — Negociar débitos (versão 2)

Como administradora, quero parcelar o débito de uma unidade em acordo, para facilitar a regularização.

Requisitos: RF-FI-14 · RN-FI-18

- [ ] Dado uma unidade em atraso, quando registro um acordo, então defino o número e o vencimento das parcelas e as cobranças antigas ficam "em acordo".
- [ ] Dado uma parcela do acordo vencida sem pagamento, quando a rotina roda, então a cobrança volta a ficar "em atraso".

## Cobertura

As 56 histórias cobrem os 107 requisitos funcionais do PRD; requisitos não funcionais (RNF) e de segurança (SEG) são verificados nos testes de cada versão.

| Épico | Histórias | Requisitos funcionais cobertos |
| --- | --- | --- |
| 1. Acesso e conta | US-AC-01 a US-AC-06 | RF-AC-01 a RF-AC-08 |
| 2. Administração | US-AD-01 a US-AD-09 | RF-AD-01 a RF-AD-15, RF-AD-17 |
| 3. Reservas e pagamentos | US-RE-01 a US-RE-06 | RF-RE-01 a RF-RE-09, RF-PG-01 a RF-PG-04 |
| 4. Visitantes e portaria | US-VI-01 a US-VI-06 | RF-VI-01 a RF-VI-12 |
| 5. Encomendas | US-EN-01, US-EN-02 | RF-EN-01 a RF-EN-04 |
| 6. Chamados | US-CH-01 a US-CH-03 | RF-CH-01 a RF-CH-05 |
| 7. Reclamações e score | US-RS-01 a US-RS-07 | RF-RS-01 a RF-RS-14 |
| 8. Pesquisa mensal | US-PE-01, US-PE-02 | RF-PE-01 a RF-PE-04 |
| 9. Comunicação | US-CO-01, US-CO-02 | RF-CO-01 a RF-CO-03 |
| 10. Reuniões, votações e eleições | US-VO-01 a US-VO-03 | RF-VO-01 a RF-VO-09 |
| 11. Planos e suporte | US-PL-01, US-PL-02 | RF-AD-16 |
| 12. Notificações e LGPD | US-NO-01, US-LG-01 | RF-NO-01, RF-LG-01, RF-LG-02 |
| 13. Cobrança condominial | US-FI-01 a US-FI-06 | RF-FI-01 a RF-FI-15 |
