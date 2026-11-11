# API do CondomiFacil: contrato

**Estado:** Proposta de 10/11/2026, não aceita pelo Pedro. É o contrato escrito antes do código (design-first); não existe backend. Tudo o que não vem de decisão do Pedro nem do PRD está marcado **Proposta**.

## Índice dos arquivos

| Arquivo | Conteúdo | Estado |
| --- | --- | --- |
| [`01-guia-da-api.md`](01-guia-da-api.md) | Convenções: autenticação, versão, cabeçalhos, paginação, filtros, erros, idempotência | Proposta de 10/11/2026 |
| [`02-eventos-e-webhooks.md`](02-eventos-e-webhooks.md) | Catálogo de eventos de domínio, WebSocket, push e webhooks recebidos | Proposta de 10/11/2026 |
| [`03-integracoes-externas.md`](03-integracoes-externas.md) | APIs externas escolhidas (Asaas, Resend, Supabase Storage, Expo Push e FCM, Sentry) e o que o backend chama em cada uma | Proposta de 10/11/2026 |
| [`redocly.yaml`](redocly.yaml) | Regras de validação | Proposta de 10/11/2026 |
| [`openapi/componentes/comum.yaml`](openapi/componentes/comum.yaml) | Esquemas, parâmetros, cabeçalhos, respostas de erro e segurança comuns | Proposta de 10/11/2026 |
| [`openapi/componentes/enums.yaml`](openapi/componentes/enums.yaml) | Estados dos ciclos de vida | Proposta de 10/11/2026 |
| [`openapi/comum.yaml`](openapi/comum.yaml) | Acesso, sessão, perfil próprio, notificações, dispositivos, arquivos, LGPD, score, recurso, denúncia, notas dos setores | Proposta de 10/11/2026 |
| [`openapi/morador.yaml`](openapi/morador.yaml), [`proprietario-nao-residente.yaml`](openapi/proprietario-nao-residente.yaml) | Interfaces do morador e do proprietário não residente | Proposta de 10/11/2026 |
| [`openapi/sindico.yaml`](openapi/sindico.yaml), [`conselho-fiscal.yaml`](openapi/conselho-fiscal.yaml) | Interfaces do síndico (e subsíndico) e do conselho fiscal | Proposta de 10/11/2026 |
| [`openapi/portaria.yaml`](openapi/portaria.yaml), [`limpeza.yaml`](openapi/limpeza.yaml), [`sync.yaml`](openapi/sync.yaml) | Interfaces da portaria, da limpeza e da sincronização offline | Proposta de 10/11/2026 |
| [`openapi/administradora.yaml`](openapi/administradora.yaml), [`plataforma.yaml`](openapi/plataforma.yaml) | Interfaces da administradora (e suporte) e da plataforma | Proposta de 10/11/2026 |
| [`openapi/webhooks.yaml`](openapi/webhooks.yaml) | Webhooks recebidos (Asaas, Resend) | Proposta de 10/11/2026 |
| [`asyncapi/tempo-real.yaml`](asyncapi/tempo-real.yaml) | Canais e mensagens do Socket.IO | Proposta de 10/11/2026 |

Nenhum arquivo foi aceito pelo Pedro. As escolhas de Asaas, Supabase + Render e Resend são decisões dele (10/11/2026, aceitas com ressalvas nos ADRs 002, 004 e 005); todo o resto é Proposta.

Cada arquivo de `openapi/` é um documento OpenAPI 3.1 válido sozinho e usa os componentes comuns por `$ref: './componentes/comum.yaml#/components/...'`.

## Como visualizar

Nada precisa ser instalado no repositório; as ferramentas rodam por `npx`, a partir da raiz.

| Objetivo | Comando |
| --- | --- |
| Validar um arquivo | `npx --yes @redocly/cli lint docs/05-backend/api/openapi/<arquivo>.yaml --config docs/05-backend/api/redocly.yaml` |
| Validar todos | `npx --yes @redocly/cli lint docs/05-backend/api/openapi/*.yaml --config docs/05-backend/api/redocly.yaml` |
| Ver no navegador (Redoc) | `npx --yes @redocly/cli preview-docs docs/05-backend/api/openapi/<arquivo>.yaml` |
| Ver no Swagger UI | Subir o YAML em um Swagger UI local (por exemplo, `docker run -p 8080:8080 -e SWAGGER_JSON=/api/<arquivo>.yaml -v <pasta>:/api swaggerapi/swagger-ui`) ou colar no editor online do Swagger. **Dados do projeto não devem ir a editores online**; prefira a execução local |
| Validar o AsyncAPI | `npx --yes @asyncapi/cli validate docs/05-backend/api/asyncapi/tempo-real.yaml` |

Os arquivos de perfil referenciam `./componentes/...` por caminho relativo; abra-os a partir da pasta `openapi/` para os `$ref` resolverem.

## Cobertura RF -> operação

Gerada em 10/11/2026 a partir do `x-rastreabilidade` de cada operação dos arquivos de `openapi/` (script temporário, fora do repositório), contra os RF da tabela do PRD seções 4 a 9. O PRD declara 139 RF e a contagem real é **139**: **131 têm ao menos uma operação** e **8 não têm**, cada um com o motivo na coluna Observação. Estado: Proposta.

| RF | Requisito (resumo) | Operação (`operationId`) | Arquivo | Observação |
| --- | --- | --- | --- | --- |
| RF-AC-01 | No primeiro acesso, enviar código ao e-mail pré-cadastrado; validad... | `comumAtivar`, `comumPedirCodigo`, `webhookResendReceberEvento` | `comum.yaml`, `webhooks.yaml` | |
| RF-AC-02 | Aceitar termos de uso, política de privacidade e regimento do condo... | `administradoraListarDocumentosDoCondominio`, `administradoraPublicarVersaoDeDocumento`, `comumListarAceitesPendentes`, `comumRegistrarAceites` | `administradora.yaml`, `comum.yaml` | |
| RF-AC-03 | Recuperar senha por e-mail | `comumPedirCodigo`, `comumRedefinirSenha` | `comum.yaml` | |
| RF-AC-04 | Escolher a unidade ativa; painéis e métricas separados por unidade | `comumListarContextos`, `moradorConsultarUnidadeAtiva` | `comum.yaml`, `morador.yaml` | |
| RF-AC-05 | Alternar tema claro e escuro | `comumAtualizarPerfil`, `comumObterPerfil` | `comum.yaml` | |
| RF-AC-06 | Acessar o app pelo navegador (versão web) | sem operação | n/a | Requisito de interface: a versão web usa o mesmo código do app (React Native Web) e a mesma API; `comum.yaml` só registra a plataforma do cliente. |
| RF-AC-07 | Exibir a página "Como funciona" com as regras de score, reclamações... | `comumListarAceitesPendentes`, `comumRegistrarAceites` | `comum.yaml` | |
| RF-AC-08 | Onboarding guiado no primeiro acesso, por perfil | sem operação | n/a | Requisito de interface: onboarding guiado é só de tela, sem dado no servidor. |
| RF-AD-01 | Pré-cadastrar moradores, funcionários, síndico e subsíndico | `administradoraListarVinculos`, `administradoraPreCadastrarEmLote`, `administradoraPreCadastrarPessoa` | `administradora.yaml` | |
| RF-AD-02 | Solicitar cadastro, alteração ou remoção de moradores e funcionários | `administradoraListarSolicitacoesDeCadastro`, `proprietarioNaoResidenteListarSolicitacoesDeLocacao`, `sindicoCriarSolicitacao`, `sindicoListarSolicitacoes` | `administradora.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-AD-03 | Atender ou recusar solicitação, com motivo | `administradoraAtenderSolicitacaoDeCadastro`, `administradoraListarSolicitacoesDeCadastro`, `administradoraRecusarSolicitacaoDeCadastro`, `sindicoListarSolicitacoes` | `administradora.yaml`, `sindico.yaml` | |
| RF-AD-04 | Definir o morador habilitado de cada unidade | `administradoraDefinirMoradorHabilitado`, `administradoraListarUnidades`, `administradoraObterUnidade` | `administradora.yaml` | |
| RF-AD-05 | Registrar mudança de morador | `administradoraRegistrarMudancaDeMorador` | `administradora.yaml` | |
| RF-AD-06 | Cadastrar e desligar funcionários, próprios ou terceirizados | `administradoraDesligarFuncionario`, `administradoraListarFuncionarios` | `administradora.yaml` | |
| RF-AD-07 | Cadastrar áreas comuns como pagas ou gratuitas, com regras | `administradoraAtualizarArea`, `administradoraCriarArea`, `administradoraDefinirParametro`, `administradoraDefinirParametroDaArea`, `administradoraListarAreas`, `administradoraListarHistoricoDoParametro`, `administradoraListarParametros`, `administradoraListarParametrosDaArea`, `administradoraObterArea` | `administradora.yaml` | |
| RF-AD-08 | Cadastrar a conta bancária que recebe pagamentos de reservas e da t... | `administradoraCadastrarContaRecebedora`, `administradoraObterContaRecebedora`, `administradoraObterTermoDoTitularPF` | `administradora.yaml` | |
| RF-AD-09 | Registrar mandatos de síndico e subsíndico | `administradoraListarMandatos`, `administradoraRegistrarMandato` | `administradora.yaml` | |
| RF-AD-10 | Configurar regras de reeleição do síndico morador | `administradoraDefinirRegraDeReeleicao`, `administradoraObterRegraDeReeleicao` | `administradora.yaml` | |
| RF-AD-11 | Registrar contratação, recontratação ou desligamento de síndico pro... | `administradoraEncerrarMandato`, `administradoraListarMandatos`, `administradoraRegistrarMandato` | `administradora.yaml` | |
| RF-AD-12 | Encerrar mandato antes do prazo (renúncia ou destituição) | `administradoraEncerrarMandato` | `administradora.yaml` | |
| RF-AD-13 | Ativar e desativar a substituição do síndico pelo subsíndico | `administradoraAtivarSubstituicao`, `administradoraDesativarSubstituicao`, `administradoraObterSubstituicao`, `sindicoAtivarSubstituicao`, `sindicoDesativarSubstituicao`, `sindicoObterSubstituicao` | `administradora.yaml`, `sindico.yaml` | |
| RF-AD-14 | Cadastrar empresas de manutenção | `administradoraAtualizarEmpresaDeManutencao`, `administradoraCadastrarEmpresaDeManutencao`, `administradoraListarEmpresasDeManutencao`, `sindicoCadastrarEmpresaManutencao`, `sindicoListarEmpresasManutencao` | `administradora.yaml`, `sindico.yaml` | |
| RF-AD-15 | Manter lista de pessoas com entrada bloqueada | `administradoraBloquearEntrada`, `administradoraEncerrarBloqueioDeEntrada`, `administradoraListarBloqueiosDeEntrada`, `portariaListarBloqueios`, `sindicoListarBloqueiosDeEntrada` | `administradora.yaml`, `portaria.yaml`, `sindico.yaml` | |
| RF-AD-16 | Contar solicitações de suporte por mês | `plataformaContarSolicitacoesDeSuporte`, `sindicoObterFranquiaSolicitacoes` | `plataforma.yaml`, `sindico.yaml` | |
| RF-AD-17 | Cadastrar blocos (torres ou quadras) e portarias | `administradoraAtualizarBloco`, `administradoraAtualizarPortaria`, `administradoraAtualizarUnidade`, `administradoraCriarBloco`, `administradoraCriarPortaria`, `administradoraCriarUnidade`, `administradoraListarBlocos`, `administradoraListarPortarias`, `administradoraListarUnidades`, `moradorConsultarCondominio`, `portariaListarPortariasEBlocos` | `administradora.yaml`, `morador.yaml`, `portaria.yaml` | |
| RF-AD-18 | Cadastrar o inquilino com as datas de início e fim do contrato de l... | `administradoraCadastrarContratoDeLocacao`, `administradoraListarContratosDeLocacao`, `administradoraRenovarContratoDeLocacao`, `proprietarioNaoResidenteConsultarContratoDeLocacao` | `administradora.yaml`, `proprietario-nao-residente.yaml` | |
| RF-AD-19 | Pedir o cadastro, a renovação ou o encerramento do inquilino | `administradoraListarSolicitacoesDeCadastro`, `proprietarioNaoResidenteConsultarUnidade`, `proprietarioNaoResidenteListarSolicitacoesDeLocacao`, `proprietarioNaoResidenteSolicitarCadastroRenovacaoOuEncerramento` | `administradora.yaml`, `proprietario-nao-residente.yaml` | |
| RF-AD-20 | Avisar o fim do contrato e desativar o inquilino sem renovação | `administradoraEncerrarContratoDeLocacao`, `administradoraListarContratosDeLocacao`, `proprietarioNaoResidenteConsultarContratoDeLocacao` | `administradora.yaml`, `proprietario-nao-residente.yaml` | |
| RF-AD-21 | Marcar a unidade como desocupada | `administradoraMarcarUnidadeDesocupada` | `administradora.yaml` | |
| RF-RE-01 | Ver disponibilidade das áreas em calendário | `moradorConsultarDisponibilidadeArea`, `moradorListarAreas` | `morador.yaml` | |
| RF-RE-02 | Fazer reserva gratuita | `moradorConsultarReserva`, `moradorCriarReserva`, `moradorListarReservas` | `morador.yaml` | |
| RF-RE-03 | Fazer reserva paga | `moradorCriarReserva`, `moradorListarAreas`, `moradorListarReservas` | `morador.yaml` | |
| RF-RE-04 | Cancelar com reembolso até 12h antes do início | `moradorCancelarReserva`, `moradorConsultarReserva` | `morador.yaml` | |
| RF-RE-05 | Cancelar sem reembolso depois do prazo | `moradorCancelarReserva`, `moradorListarReservas` | `morador.yaml` | |
| RF-RE-06 | Bloquear reservas gratuitas para a pessoa com score baixo naquela u... | `moradorConsultarDisponibilidadeArea`, `moradorCriarReserva` | `morador.yaml` | |
| RF-RE-07 | Configurar prazos, antecedência, limites e valores | `administradoraDefinirParametro`, `administradoraDefinirParametroDaArea`, `administradoraListarHistoricoDoParametro`, `administradoraListarParametros`, `administradoraListarParametrosDaArea` | `administradora.yaml` | |
| RF-RE-08 | Consultar reservas do dia e acompanhar o uso; registrar vistoria e... | `comumPedirEnvioArquivo`, `limpezaListarReservasParaVistoria`, `limpezaRegistrarVistoria`, `portariaListarReservasDoDia`, `portariaMarcarReservaEmAndamento`, `portariaRegistrarVistoria` | `comum.yaml`, `limpeza.yaml`, `portaria.yaml` | |
| RF-RE-09 | Registrar Não comparecimento em reserva paga ou gratuita na vistoria | `limpezaRegistrarVistoria`, `portariaRegistrarVistoria` | `limpeza.yaml`, `portaria.yaml` | |
| RF-RE-10 | Enviar lembrete de reserva por push, com atalho para ver e cancelar | sem operação | n/a | Rotina sem endpoint: o lembrete sai do outbox (evento `reserva.lembrete_devido`, `02-eventos-e-webhooks.md`); o desligamento é por preferência de notificação (RF-NO-01). |
| RF-PG-01 | Pagar reserva por Pix ou cartão no app | `moradorPagarReserva` | `morador.yaml` | |
| RF-PG-02 | Repassar o valor à conta bancária do condomínio | `moradorPagarReserva` | `morador.yaml` | |
| RF-PG-03 | Reembolsar automaticamente cancelamentos dentro do prazo | `administradoraListarDevolucoes` | `administradora.yaml` | |
| RF-PG-04 | Emitir comprovante de pagamento e de reembolso | `administradoraListarDevolucoes`, `moradorConsultarReserva`, `moradorListarReservas`, `webhookAsaasReceberEvento`, `webhookResendReceberEvento` | `administradora.yaml`, `morador.yaml`, `webhooks.yaml` | |
| RF-VI-01 | Cadastrar visitante avulso a qualquer momento antes da chegada | `moradorCadastrarVisitante`, `moradorConsultarVisitante`, `moradorListarVisitantes` | `morador.yaml` | |
| RF-VI-02 | Cadastrar visitante recorrente com dias da semana | `moradorCadastrarVisitante`, `moradorListarVisitantes` | `morador.yaml` | |
| RF-VI-03 | Editar ou cancelar visitantes | `moradorCancelarVisitante`, `moradorConsultarVisitante`, `moradorEditarVisitante`, `moradorListarVisitantes` | `morador.yaml` | |
| RF-VI-04 | Ver a lista de visitantes em tempo real | `portariaListarPortariasEBlocos`, `portariaListarVisitas`, `syncLerAlteracoes` | `portaria.yaml`, `sync.yaml` | |
| RF-VI-05 | Consultar a lista do dia sem internet, com a hora da última sincron... | `syncEnviarOperacoes`, `syncLerAlteracoes` | `sync.yaml` | |
| RF-VI-06 | Registrar entrada e saída, também sem internet | `portariaDesfazerRegistroVisita`, `portariaRegistrarEntrada`, `portariaRegistrarSaida`, `syncEnviarOperacoes` | `portaria.yaml`, `sync.yaml` | |
| RF-VI-07 | Registrar entrada de visitante não cadastrado, autorizado pelo mora... | `portariaBuscarUnidades`, `portariaRegistrarEntradaPorInterfone` | `portaria.yaml` | |
| RF-VI-08 | Encerrar a visita com status "saída não registrada" 24h após a entrada | `portariaRegistrarSaida` | `portaria.yaml` | |
| RF-VI-09 | Alertar a portaria quando o visitante estiver na lista de bloqueio | `portariaRegistrarEntrada`, `portariaRegistrarEntradaNegada` | `portaria.yaml` | |
| RF-VI-10 | Notificar o morador da entrada do visitante | `moradorListarVisitantes`, `portariaRegistrarEntrada` | `morador.yaml`, `portaria.yaml` | |
| RF-VI-11 | Avisar o porteiro de divergência ao sincronizar e exigir confirmaçã... | `portariaConfirmarDivergencia`, `portariaListarDivergencias`, `syncEnviarOperacoes` | `portaria.yaml`, `sync.yaml` | |
| RF-VI-12 | Modo de treinamento da portaria, com visitantes e encomendas fictícios | sem operação | n/a | Lacuna registrada em `x-lacunas` de `portaria.yaml`: como o cliente aciona o modo de treinamento na API não está definido. |
| RF-VI-13 | Cadastrar hóspede de temporada em unidade desocupada | `proprietarioNaoResidenteCadastrarHospedeDeTemporada`, `proprietarioNaoResidenteListarHospedesDeTemporada` | `proprietario-nao-residente.yaml` | |
| RF-VI-14 | Montar lista de visitantes | `moradorAdicionarPessoasNaLista`, `moradorCancelarListaDeVisitantes`, `moradorConsultarListaDeVisitantes`, `moradorCriarListaDeVisitantes`, `moradorListarListasDeVisitantes`, `moradorListarModelosDeLista`, `moradorListarSugestoesDeVisitantes`, `moradorRemoverPessoaDaLista`, `moradorSalvarModeloDeLista` | `morador.yaml` | |
| RF-VI-15 | Ver as pessoas de uma lista agrupadas e dar entrada individual | `portariaListarListasVisitantes`, `portariaListarVisitas` | `portaria.yaml` | |
| RF-EN-01 | Registrar encomenda recebida | `portariaBuscarUnidades`, `portariaCorrigirUnidadeEncomenda`, `portariaRegistrarEncomenda` | `portaria.yaml` | |
| RF-EN-02 | Notificar o morador | `moradorListarEncomendas`, `portariaRegistrarEncomenda` | `morador.yaml`, `portaria.yaml` | |
| RF-EN-03 | Registrar retirada e quem retirou | `portariaListarEncomendas`, `portariaListarRetirantes`, `portariaRegistrarRetirada` | `portaria.yaml` | |
| RF-EN-04 | Lembrar o morador de retirar | `moradorListarEncomendas` | `morador.yaml` | |
| RF-EN-05 | Listar encomendas com prazo de guarda vencido e marcar a devolução | `sindicoListarEncomendasVencidas`, `sindicoMarcarEncomendaDevolvida` | `sindico.yaml` | |
| RF-EN-06 | Avisar uma entrega esperada | `moradorAvisarEntregaEsperada`, `moradorConsultarEntregaEsperada`, `moradorListarEntregasEsperadas` | `morador.yaml` | |
| RF-EN-07 | Ver as entregas esperadas do dia e vinculá-las ao registrar a encom... | `portariaListarEntregasEsperadas`, `portariaRegistrarEncomenda` | `portaria.yaml` | |
| RF-EN-08 | Editar, cancelar e reagendar entregas esperadas; marcar "Não chegou" | `moradorCancelarEntregaEsperada`, `moradorEditarEntregaEsperada`, `moradorListarEntregasEsperadas` | `morador.yaml` | |
| RF-CH-01 | Abrir chamado de limpeza ou manutenção, com foto | `moradorAbrirChamado`, `portariaAbrirChamado`, `sindicoAbrirChamado` | `morador.yaml`, `portaria.yaml`, `sindico.yaml` | |
| RF-CH-02 | Ver e concluir chamados de limpeza | `limpezaConcluirChamado`, `limpezaIniciarAtendimento`, `limpezaListarChamados`, `limpezaObterChamado` | `limpeza.yaml` | |
| RF-CH-03 | Consultar e concluir chamados de limpeza sem internet | `limpezaConcluirChamado`, `limpezaListarChamados`, `syncEnviarOperacoes`, `syncLerAlteracoes` | `limpeza.yaml`, `sync.yaml` | |
| RF-CH-04 | Acompanhar chamados de manutenção, indicar a empresa e concluir | `sindicoAvancarEstadoChamado`, `sindicoConcluirChamado`, `sindicoIndicarEmpresaChamado`, `sindicoListarChamados`, `sindicoObterChamado` | `sindico.yaml` | |
| RF-CH-05 | Acompanhar o status, ver as fotos do serviço concluído e reabrir em... | `moradorConsultarChamado`, `moradorListarChamados`, `moradorReabrirChamado` | `morador.yaml` | |
| RF-CH-06 | Classificar a urgência ao abrir o chamado (alta, média ou leve), ve... | `limpezaListarChamados`, `moradorAbrirChamado`, `moradorListarChamados`, `portariaAbrirChamado`, `sindicoListarChamados` | `limpeza.yaml`, `morador.yaml`, `portaria.yaml`, `sindico.yaml` | |
| RF-CH-07 | Ajustar a urgência de um chamado já aberto | `moradorConsultarChamado`, `sindicoAjustarUrgenciaChamado` | `morador.yaml`, `sindico.yaml` | |
| RF-CH-08 | Avaliar o atendimento de um chamado concluído, com 1 a 5 estrelas e... | `moradorAvaliarAtendimento` | `morador.yaml` | |
| RF-CH-09 | Oferecer reabrir o chamado após avaliação baixa (1 ou 2 estrelas) e... | `moradorAvaliarAtendimento`, `moradorReabrirChamado`, `sindicoListarAvaliacoesBaixas` | `morador.yaml`, `sindico.yaml` | |
| RF-CH-10 | Consultar as avaliações do atendimento, agregadas por funcionário d... | `administradoraListarAvaliacoesEmpresas`, `administradoraListarAvaliacoesFuncionarios`, `sindicoListarAvaliacoesEmpresas`, `sindicoListarAvaliacoesFuncionarios`, `sindicoObterChamado` | `administradora.yaml`, `sindico.yaml` | A administradora vê só o agregado (matriz do PRD 3). |
| RF-CH-11 | Ver as próprias avaliações recebidas, com média, distribuição e com... | `limpezaConsultarMinhasAvaliacoes`, `limpezaListarComentariosAvaliacao` | `limpeza.yaml` | |
| RF-RS-01 | Registrar reclamação identificada contra um funcionário, uma unidad... | `moradorAbrirReclamacao`, `moradorBuscarAlvosDeReclamacao`, `moradorConsultarReclamacao`, `moradorListarCategoriasDeReclamacao` | `morador.yaml` | |
| RF-RS-02 | Classificar por categoria com gravidade padrão | `moradorAbrirReclamacao`, `moradorListarCategoriasDeReclamacao` | `morador.yaml` | |
| RF-RS-03 | Painel de reclamações com o score do reclamante e do alvo | `administradoraListarReclamacoes`, `administradoraObterReclamacao`, `comumObterScore`, `conselhoFiscalListarReclamacoes`, `conselhoFiscalObterReclamacao`, `sindicoListarReclamacoes`, `sindicoObterReclamacao` | `administradora.yaml`, `comum.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-RS-04 | Encaminhar reclamações contra o síndico ao subsíndico, e contra o s... | `conselhoFiscalListarReclamacoes`, `moradorAbrirReclamacao`, `sindicoListarReclamacoes` | `conselho-fiscal.yaml`, `morador.yaml`, `sindico.yaml` | |
| RF-RS-05 | Conversar com o alvo antes da decisão | `administradoraIniciarConversaComAlvo`, `conselhoFiscalIniciarConversaReclamacao`, `conselhoFiscalObterReclamacao`, `moradorConsultarReclamacaoRecebida`, `moradorListarReclamacoesRecebidas`, `moradorResponderReclamacaoRecebida`, `sindicoIniciarConversaReclamacao`, `sindicoObterReclamacao` | `administradora.yaml`, `conselho-fiscal.yaml`, `morador.yaml`, `sindico.yaml` | |
| RF-RS-06 | Validar ou negar; ao negar, informar o motivo | `administradoraDecidirReclamacao`, `conselhoFiscalDecidirReclamacao`, `sindicoDecidirReclamacao` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-RS-07 | Notificar o alvo sem revelar quem reclamou | `conselhoFiscalDecidirReclamacao`, `conselhoFiscalIniciarConversaReclamacao`, `moradorAbrirReclamacao`, `moradorConsultarReclamacaoRecebida`, `moradorListarReclamacoesRecebidas`, `sindicoDecidirReclamacao`, `sindicoIniciarConversaReclamacao` | `conselho-fiscal.yaml`, `morador.yaml`, `sindico.yaml` | |
| RF-RS-08 | Aplicar pontos ao alvo ou ao reclamante conforme a decisão | `administradoraDecidirReclamacao`, `conselhoFiscalDecidirReclamacao`, `sindicoDecidirReclamacao` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-RS-09 | Recorrer uma vez, em até 7 dias, de decisão que tirou pontos | `comumCriarRecurso`, `comumDecidirRecurso`, `comumObterRecurso` | `comum.yaml` | |
| RF-RS-10 | Recuperar +5 pontos a cada 2 meses de regularidade, até 100 | `comumListarMovimentosScore` | `comum.yaml` | |
| RF-RS-11 | Ver o próprio score e o histórico de ganhos e perdas | `comumListarMovimentosScore`, `comumObterScore` | `comum.yaml` | |
| RF-RS-12 | Ver o score do síndico e a nota de cada setor | `comumConsultarNotasDosSetores`, `comumObterScore` | `comum.yaml` | |
| RF-RS-13 | Consultar todas as reclamações, com identidade e score do reclamant... | `administradoraListarReclamacoes`, `administradoraObterReclamacao`, `comumObterScore` | `administradora.yaml`, `comum.yaml` | |
| RF-RS-14 | Filtrar palavras ofensivas e denunciar conteúdo | `comumDenunciarConteudo` | `comum.yaml` | |
| RF-RS-15 | Avisar o proprietário não residente de reclamação validada contra a... | `proprietarioNaoResidenteListarReclamacoesValidadasDaUnidade` | `proprietario-nao-residente.yaml` | |
| RF-RS-16 | Mostrar o semáforo do prazo de decisão nas reclamações aguardando d... | `conselhoFiscalListarReclamacoes`, `conselhoFiscalObterReclamacao`, `moradorConsultarReclamacao`, `moradorListarReclamacoes`, `sindicoListarReclamacoes`, `sindicoObterReclamacao` | `conselho-fiscal.yaml`, `morador.yaml`, `sindico.yaml` | |
| RF-CO-01 | Enviar comunicado geral por público (moradores, funcionários, todos) | `limpezaListarComunicados`, `moradorConfirmarLeituraComunicado`, `moradorListarComunicados`, `portariaListarComunicados`, `proprietarioNaoResidenteConfirmarLeituraComunicadoGeral`, `proprietarioNaoResidenteConsultarComunicadoGeral`, `proprietarioNaoResidenteListarComunicadosGerais`, `sindicoEnviarComunicado`, `sindicoEnviarSugestaoComunicado`, `sindicoListarComunicados`, `sindicoListarLeiturasComunicado` | `limpeza.yaml`, `morador.yaml`, `portaria.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-CO-02 | Enviar comunicado individual com resposta | `moradorConsultarComunicado`, `moradorListarComunicados`, `sindicoEnviarComunicado`, `sindicoListarComunicados` | `morador.yaml`, `sindico.yaml` | |
| RF-CO-03 | Responder comunicado individual | `limpezaListarComunicados`, `limpezaResponderComunicado`, `moradorConsultarComunicado`, `moradorResponderComunicado`, `moradorResponderReclamacaoRecebida`, `portariaListarComunicados`, `portariaResponderComunicado` | `limpeza.yaml`, `morador.yaml`, `portaria.yaml` | |
| RF-CO-04 | Sugerir comunicado ao síndico | `sindicoDescartarSugestaoComunicado`, `sindicoEnviarSugestaoComunicado`, `sindicoListarSugestoesComunicado`, `sindicoSugerirComunicado` | `sindico.yaml` | |
| RF-VO-01 | Convocar reunião com data, local e pautas | `moradorConsultarReuniao`, `moradorListarReunioes`, `proprietarioNaoResidenteConsultarReuniao`, `proprietarioNaoResidenteListarReunioes`, `sindicoConvocarReuniao`, `sindicoListarReunioes`, `sindicoObterReuniao` | `morador.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-VO-02 | Votar em cada pauta, um voto por unidade | `moradorConsultarReuniao`, `moradorVotar`, `proprietarioNaoResidenteConsultarReuniao`, `proprietarioNaoResidenteVotar` | `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-VO-03 | Indicar procurador para uma votação | `moradorBuscarPossiveisProcuradores`, `moradorListarProcuracoes`, `moradorNomearProcurador`, `moradorVotar`, `proprietarioNaoResidenteBuscarPossiveisProcuradores`, `proprietarioNaoResidenteListarProcuracoes`, `proprietarioNaoResidenteNomearProcurador`, `proprietarioNaoResidenteVotar` | `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-VO-04 | Registrar votos presenciais por unidade | `sindicoListarReunioes`, `sindicoRegistrarVotosPresenciais` | `sindico.yaml` | |
| RF-VO-05 | Abrir eleição de síndico e subsíndico com candidaturas | `moradorCandidatar`, `moradorConsultarEleicao`, `moradorListarEleicoes`, `sindicoAbrirEleicao`, `sindicoListarEleicoes` | `morador.yaml`, `sindico.yaml` | |
| RF-VO-06 | Bloquear candidaturas inelegíveis | `administradoraDefinirRegraDeReeleicao`, `moradorCandidatar`, `moradorConsultarEleicao`, `sindicoAbrirEleicao`, `sindicoObterEleicao` | `administradora.yaml`, `morador.yaml`, `sindico.yaml` | |
| RF-VO-07 | Exibir resultado só após o encerramento | `moradorConsultarEleicao`, `moradorConsultarReuniao`, `proprietarioNaoResidenteConsultarReuniao`, `sindicoEncerrarReuniao`, `sindicoListarEleicoes`, `sindicoObterEleicao`, `sindicoObterResultadosReuniao` | `morador.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-VO-08 | Abrir segundo turno em caso de empate | `moradorConsultarEleicao` | `morador.yaml` | |
| RF-VO-09 | Anexar ata e lista de presença | `comumPedirEnvioArquivo`, `moradorListarReunioes`, `proprietarioNaoResidenteListarReunioes`, `sindicoAnexarAtaReuniao` | `comum.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-VO-10 | Marcar cada pauta com votação como "envolve despesa extraordinária"... | `moradorConsultarReuniao`, `proprietarioNaoResidenteConsultarReuniao`, `sindicoConvocarReuniao`, `sindicoObterReuniao` | `morador.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-VO-11 | Votar pela unidade alugada nas pautas sem despesa extraordinária | `moradorConsultarReuniao`, `moradorVotar`, `proprietarioNaoResidenteConsultarReuniao`, `proprietarioNaoResidenteVotar` | `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-PE-01 | Avaliar cada funcionário ativo no mês com 1 a 5 estrelas | `moradorAvaliarFuncionario`, `moradorConsultarPesquisaMensal` | `morador.yaml` | |
| RF-PE-02 | Ajustar o score do funcionário pela média mensal | sem operação | n/a | Rotina sem endpoint: ajuste do score do funcionário pela média mensal (RN-PE-05). |
| RF-PE-03 | Calcular a nota do setor como média das notas dos funcionários | `comumConsultarNotasDosSetores` | `comum.yaml` | |
| RF-PE-04 | Exibir a nota do setor a todos quando ele tiver 2 ou mais funcionár... | `comumConsultarNotasDosSetores` | `comum.yaml` | |
| RF-NO-01 | Push para visitante, encomenda, reserva, chamado, comunicado, votaç... | `comumAtualizarPreferenciasNotificacao`, `comumListarNotificacoes`, `comumListarPreferenciasNotificacao`, `comumRegistrarDispositivo`, `comumRemoverDispositivo` | `comum.yaml` | |
| RF-LG-01 | Pedir cópia dos próprios dados | `comumCriarPedidoLgpd`, `webhookResendReceberEvento` | `comum.yaml`, `webhooks.yaml` | |
| RF-LG-02 | Pedir exclusão da conta | `comumCriarPedidoLgpd` | `comum.yaml` | |
| RF-FI-01 | Ativar ou desativar o módulo de cobrança no condomínio | `administradoraDefinirConfiguracaoDeCobranca`, `administradoraObterConfiguracaoDeCobranca`, `moradorConsultarCondominio`, `proprietarioNaoResidenteConsultarCondominio` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-FI-02 | Escolher as formas de pagamento aceitas: boleto (com QR Code Pix),... | `administradoraDefinirConfiguracaoDeCobranca`, `administradoraObterConfiguracaoDeCobranca`, `moradorConsultarCondominio`, `proprietarioNaoResidenteConsultarCondominio` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-FI-03 | Definir o valor da taxa de cada unidade e o dia de vencimento | `administradoraDefinirConfiguracaoDeCobranca`, `administradoraDefinirValorDaTaxaDaUnidade`, `administradoraObterConfiguracaoDeCobranca` | `administradora.yaml` | |
| RF-FI-04 | Definir o responsável financeiro de cada unidade, um para as despes... | `administradoraDefinirResponsaveisFinanceiros`, `administradoraObterResponsaveisFinanceiros` | `administradora.yaml` | |
| RF-FI-05 | Gerar as cobranças mensais automaticamente | `administradoraListarCobrancas`, `moradorListarCobrancas`, `proprietarioNaoResidenteListarCobrancas` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-FI-06 | Lançar cobranças extras (rateio, fundo de reserva, multa por infração) | `administradoraCancelarCobranca`, `administradoraLancarCobrancaExtra`, `sindicoSolicitarCobrancaExtra` | `administradora.yaml`, `sindico.yaml` | |
| RF-FI-07 | Emitir boleto registrado com QR Code Pix, Pix e pagamento por cartão | `administradoraListarCobrancas`, `administradoraObterCobranca`, `moradorConsultarCobranca`, `moradorListarCobrancas`, `moradorPagarCobranca`, `proprietarioNaoResidenteConsultarCobranca`, `proprietarioNaoResidenteListarCobrancas`, `proprietarioNaoResidentePagarCobranca` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-FI-08 | Ver as cobranças da unidade, pagar no app e baixar comprovantes | `moradorConsultarCobranca`, `moradorListarCobrancas`, `moradorPagarCobranca`, `proprietarioNaoResidenteConsultarCobranca`, `proprietarioNaoResidenteListarCobrancas`, `proprietarioNaoResidentePagarCobranca` | `morador.yaml`, `proprietario-nao-residente.yaml` | |
| RF-FI-09 | Dar baixa automática quando o pagamento é confirmado | `administradoraListarDivergenciasDePagamento`, `administradoraResolverDivergenciaDePagamento`, `moradorPagarCobranca`, `proprietarioNaoResidentePagarCobranca`, `webhookAsaasReceberEvento` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml`, `webhooks.yaml` | |
| RF-FI-10 | Registrar pagamento feito fora do app | `administradoraRegistrarBaixaManual`, `comumPedirEnvioArquivo` | `administradora.yaml`, `comum.yaml` | |
| RF-FI-11 | Lembrar o responsável antes e depois do vencimento | sem operação | n/a | Rotina sem endpoint: lembretes de cobrança (rotina 17); o canal não está definido no RF (`02-eventos-e-webhooks.md`). |
| RF-FI-12 | Calcular multa e juros por atraso | sem operação | n/a | Cálculo no servidor, sem endpoint próprio: multa e juros entram no valor da cobrança e da segunda via. |
| RF-FI-13 | Painel de inadimplência | `administradoraListarInadimplencia`, `sindicoListarInadimplencia` | `administradora.yaml`, `sindico.yaml` | |
| RF-FI-14 | Negociar débitos em parcelas (acordo) | sem operação | n/a | Fora do MVP: acordos de parcelamento são da versão 2. |
| RF-FI-15 | Exportar cobranças e pagamentos | `administradoraExportarCobrancas` | `administradora.yaml` | |
| RF-FI-16 | Classificar cada cobrança como ordinária ou extraordinária | `administradoraLancarCobrancaExtra`, `administradoraListarCobrancas`, `moradorListarCobrancas`, `proprietarioNaoResidenteListarCobrancas`, `sindicoSolicitarCobrancaExtra` | `administradora.yaml`, `morador.yaml`, `proprietario-nao-residente.yaml`, `sindico.yaml` | |
| RF-FI-17 | Painel financeiro do condomínio: resumo do mês (receitas, despesas,... | `administradoraObterPainelFinanceiro`, `conselhoFiscalListarLancamentosFinanceiros`, `conselhoFiscalObterLancamentoFinanceiro`, `conselhoFiscalObterResumoFinanceiro`, `sindicoListarLancamentosFinanceiros`, `sindicoObterLancamentoFinanceiro`, `sindicoObterResumoFinanceiro` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-FI-18 | Lançar como receita, sozinho, o que o condomínio recebe pelo app: c... | `administradoraObterPainelFinanceiro` | `administradora.yaml` | |
| RF-FI-19 | Registrar despesa ou receita avulsa com data, categoria, valor, for... | `administradoraAtualizarLancamento`, `administradoraCriarLancamento`, `administradoraExcluirLancamento`, `administradoraListarCategoriasFinanceiras` | `administradora.yaml` | |
| RF-FI-20 | Repetir todo mês um lançamento marcado como recorrente | `administradoraCriarRecorrencia`, `administradoraEncerrarRecorrencia`, `administradoraListarRecorrencias` | `administradora.yaml` | |
| RF-FI-21 | Filtrar os lançamentos por período, categoria, tipo e texto | `administradoraListarLancamentos`, `administradoraObterLancamento`, `conselhoFiscalListarLancamentosFinanceiros`, `conselhoFiscalObterTotaisLancamentosFinanceiros`, `sindicoListarLancamentosFinanceiros`, `sindicoObterTotaisLancamentosFinanceiros` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-FI-22 | Exportar o resumo e os lançamentos filtrados em CSV e PDF | `administradoraObterExportacaoFinanceira`, `administradoraSolicitarExportacaoFinanceira`, `conselhoFiscalObterExportacaoFinancas`, `conselhoFiscalPedirExportacaoFinancas`, `sindicoObterExportacaoFinancas`, `sindicoPedirExportacaoFinancas` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-FI-23 | Fechar o mês e estornar lançamentos de mês fechado | `administradoraEstornarLancamento`, `administradoraFecharMesFinanceiro`, `administradoraListarMesesFinanceiros`, `conselhoFiscalListarMesesFinanceiros`, `sindicoListarMesesFinanceiros` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |
| RF-FI-24 | Comentar um lançamento ou o mês, inclusive depois do fechamento | `administradoraListarComentariosFinanceiros`, `conselhoFiscalComentarFinancas`, `conselhoFiscalListarComentariosFinanceiros`, `sindicoComentarFinancas`, `sindicoListarComentariosFinanceiros` | `administradora.yaml`, `conselho-fiscal.yaml`, `sindico.yaml` | |

### Operações por arquivo

| Arquivo | Operações (`operationId`) |
| --- | --- |
| `administradora.yaml` | 93 |
| `comum.yaml` | 30 |
| `conselho-fiscal.yaml` | 13 |
| `limpeza.yaml` | 10 |
| `morador.yaml` | 61 |
| `plataforma.yaml` | 20 |
| `portaria.yaml` | 24 |
| `proprietario-nao-residente.yaml` | 20 |
| `sindico.yaml` | 53 |
| `sync.yaml` | 2 |
| `webhooks.yaml` | 2 |
| **Total** | **328** |

As rotas de tempo real não são operações OpenAPI: estão em `asyncapi/tempo-real.yaml`. `webhooks.yaml` tem 2 operações (Asaas e Resend).

## Pendências para o Pedro decidir

Colhidas dos `x-lacunas` dos arquivos YAML e agrupadas por tema (30 itens; os de produto primeiro; os itens 26 a 30 foram acrescentados na correção final). Nenhuma foi resolvida no contrato; cada arquivo tem o texto completo e o contexto em seu `x-lacunas`.

**Produto e regra de negócio**

| # | Pendência | Onde está |
| --- | --- | --- |
| 1 | Cobrança em atraso como notificação obrigatória (proposta fora das RN e do US-NO-01) | `comum.yaml` (11), User Flows 17 |
| 2 | Denúncia de conteúdo: o que o destinatário vê, como a anonimidade de avaliador e reclamante é preservada, estados e ações do síndico sobre a denúncia | `comum.yaml` (0, 2), `sindico.yaml` (5) |
| 3 | Autorização para abrir eleição (a matriz do PRD 3 não tem linha) e papel do síndico profissional nas substituições | `sindico.yaml` (16, 24) |
| 4 | Quem cancela reserva pelo condomínio (RN-CA-05); quem cadastra administradoras; lista de condomínios da administradora (só a arquitetura 4.4) | `administradora.yaml` (0, 10), `plataforma.yaml` (1) |
| 5 | Ações sem RF ou RN: revogação de procuração, retirada por quem não mora na unidade, portaria acompanhar chamados que abriu, confirmação de leitura de comunicado por funcionários, editar e desativar empresa de manutenção | `morador.yaml` (14), `portaria.yaml` (3, 6, 7), `limpeza.yaml` (4), `sindico.yaml` (25) |
| 6 | Voto presencial de unidade em atraso (RN-VO-16); formato de `quorum_regra`; ciclos de vida de reunião, eleição e candidatura | `sindico.yaml` (13, 14, 15) |
| 7 | Débito oferecido pela fatura do Asaas frente a RN-PG-06 (só crédito); quais dados do morador seguem ao Asaas (LGPD) | `03-integracoes-externas.md` |
| 8 | Catálogos sem definição: categorias de chamado, itens e obrigatoriedade do checklist de vistoria, limite de fotos, motivos de negativa de reclamação, finalidades de cobrança extra, setores da pesquisa | `morador.yaml`, `portaria.yaml`, `limpeza.yaml`, `administradora.yaml` (7, 9), `comum.yaml` (1) |
| 9 | Valor da cobrança extra (por unidade ou total a ratear); a categoria avulsa de fundo de reserva está no item 28 | `administradora.yaml` (6) |
| 10 | Aviso de 30 dias do novo preço (RN-PL-07): canal e texto | `plataforma.yaml` (8) |

**Gateway, integrações e nuvem**

| # | Pendência | Dono |
| --- | --- | --- |
| 11 | Prazos reais de confirmação de boleto e Pix, estados da tentativa de pagamento, validade do QR Pix (prova de conceito no sandbox e piloto) | Produto e engenharia (ADR-002) |
| 12 | KYC da subconta no Asaas, motivo de recusa e como o titular pessoa física aceita o termo (SEG-15); conta principal em CNPJ | Pedro e engenharia (ADR-002) |
| 13 | Chargeback; token do webhook único ou por subconta; formato dos eventos `ACCOUNT_STATUS_*` e campos exatos de `payment`; reenvio do Asaas (a documentação não informa) | Engenharia (ADR-002, `webhooks.yaml`) |
| 14 | Nuvem, região, backup e PITR do piloto com dados reais; RPO e RTO não são atendidos no plano gratuito (revisão obrigatória do ADR-004 antes do piloto) | Pedro (ADR-004, ADR-013) |
| 15 | Saída de dados de e-mail do Brasil pelo Resend (LGPD); webhook do Resend sem requisito de origem | Pedro (ADR-005) |

**Sincronização offline e portaria**

| # | Pendência | Onde está |
| --- | --- | --- |
| 16 | Desempate de horários iguais e relógio incorreto na conclusão offline (ADR-014); tamanho do lote, validade do cursor e retenção de operações não enviadas (MER P-07) | `sync.yaml` (0 a 3) |
| 17 | Operações offline sem tipo definido nas RN-OF: entrada por interfone, entrada negada, desfazer, iniciar atendimento, confirmação de divergência; janela do Desfazer na API | `sync.yaml` (4), `portaria.yaml` (0, 12) |
| 18 | Modo de treinamento da portaria (RF-VI-12): como o cliente o aciona; reentradas do mesmo visitante no mesmo dia (MER P-10) | `portaria.yaml` (8, 11) |

**Transversais técnicos (guia da API)**

| # | Pendência | Onde está |
| --- | --- | --- |
| 19 | Limites de taxa (`429`), tempo de guarda da `Idempotency-Key` e política de versão mínima do app (`426`, `X-App-Version` ausente) | `comum.yaml` (3, 12), `01-guia-da-api.md` |
| 20 | Retenções: quarentena de webhooks (MER P-09), logs, auditoria da plataforma e do suporte, arquivos | `webhooks.yaml` (6), `plataforma.yaml` (7), `comum.yaml` (5) |
| 21 | Arquivos: tempo de expiração dos URLs assinados, tipos de mídia, hash e verificação de vírus | `comum.yaml` (4, 5) |
| 22 | Tolerância da rotação do refresh em rede instável (ADR-007) e rotas sem ID de produto (sessões, renovar, sair, lista de notificações, pedidos de LGPD) | `comum.yaml` (7, 8, 9, 14) |
| 23 | Formato e duração das exportações CSV e PDF de finanças (arquitetura 3.11) | `sindico.yaml` (18), `conselho-fiscal.yaml` (0) |
| 24 | Estados sem lista no MER/DER (devolução, divergência de conciliação, exportação, `pedido_lgpd`, `lista_visitantes`, `contrato_locacao`, condomínio, fatura da plataforma) e códigos propostos de erro e de motivo | vários `x-lacunas` |
| 25 | Planilha de pré-cadastro (formato e limite de linhas); campos exatos dos dados bancários; preço e franquia acima de 600 unidades (sob consulta) | `administradora.yaml` (2, 3), `plataforma.yaml` (5) |

**Acrescentadas na correção final**

| # | Pendência | Onde está |
| --- | --- | --- |
| 26 | Granularidade dos horários reserváveis (hora cheia, blocos fixos ou intervalo livre) e horário de funcionamento da área | `morador.yaml` (0) |
| 27 | Consulta da quarentena de eventos do gateway: o MER/DER 4.10 diz que o Admin da plataforma a lê, mas não há ID de produto nem operação | `plataforma.yaml` (2) |
| 28 | "Fundo de reserva" avulsa com a cobrança desligada: a RN-FI-24 a cita e a lista de categorias da RN-FI-32 não tem essa categoria, então não há código para ela (pergunta ao Pedro); "Taxa condominial" avulsa já tem o código `taxa_condominial` | `administradora.yaml` (8) |
| 29 | Módulo `visitantes` ausente para o proprietário não residente em `01-backend.md` 3.3, embora RF-VI-13 e RN-VI-10 deem a ele o cadastro de hóspede de temporada | `proprietario-nao-residente.yaml` (5) |
| 30 | A administradora pode denunciar conteúdo? A RN-RC-13 diz "qualquer usuário"; a matriz do PRD 3 dá "—" a ela em "Denunciar conteúdo ofensivo" | `comum.yaml` (0), PRD 3 |
