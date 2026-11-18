// Gerado por scripts/gerar.mjs a partir dos contratos. Não editar.
export interface paths {
    "/v1/acesso/codigo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pede um código de acesso por e-mail
         * @description Envia um código de 6 dígitos, válido por 15 minutos, ao e-mail pré-cadastrado (RN-CD-02). A resposta é a mesma para e-mail cadastrado ou não, para não revelar quem tem conta; o código só sai quando o e-mail está pré-cadastrado e ativo. Um novo código só pode ser pedido após 60 segundos e invalida o anterior. O mesmo caminho serve ao primeiro acesso e à recuperação de senha (`finalidade`). Sem `Authorization` nem cabeçalhos de contexto.
         */
        post: operations["comumPedirCodigo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/ativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ativa a conta com o código e cria a senha
         * @description Valida o código recebido por e-mail e grava a senha (mínimo de 8 caracteres) na mesma chamada; devolve a sessão (RF-AC-01, RN-CD-02). Código errado conta uma das 5 tentativas; na quinta o código é invalidado e é preciso pedir outro. As respostas de erro são as mesmas para e-mail não cadastrado, inclusive a contagem de tentativas restantes, que o servidor simula (Proposta). Antes de usar o app, o usuário ainda precisa aceitar os documentos (`aceites_pendentes`, RN-CD-03). Sem `Authorization` nem cabeçalhos de contexto.
         */
        post: operations["comumAtivar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/entrar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Entra com e-mail e senha
         * @description **Proposta:** caminho não definido nos docs (a arquitetura 3.3.1 só cita código, ativação, aceites e renovação). Abre a sessão com e-mail e senha. A mensagem de erro não diz qual dos dois está errado; após 5 senhas erradas seguidas o acesso fica pausado por 15 minutos (SEG-04). Conta desativada por mudança ou desligamento recebe `403` (RN-CD-07). **Proposta, para não revelar quem tem conta (SEG-04, RN-CD-02):** o `403 ACESSO_ENCERRADO` só sai depois de e-mail e senha corretos; e a pausa de 15 minutos por e-mail (`429 ACESSO_PAUSADO`) vale igual para e-mail não cadastrado, contando as falhas pela chave de tentativa. Sem `Authorization` nem cabeçalhos de contexto.
         */
        post: operations["comumEntrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/redefinir-senha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Redefine a senha com o código recebido
         * @description **Proposta:** caminho não definido nos docs. Segue o mesmo fluxo do primeiro acesso: o código vem de `POST /v1/acesso/codigo` com `finalidade` `recuperacao_senha` (RF-AC-03, RN-CD-02). A senha antiga deixa de funcionar e as outras sessões são encerradas (US-AC-04); a sessão devolvida é a única ativa. Sem `Authorization` nem cabeçalhos de contexto.
         */
        post: operations["comumRedefinirSenha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/renovar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renova o token de acesso
         * @description **Proposta:** origem no ADR-007 e na arquitetura 3.3.1, sem ID de produto. Troca o refresh token por um novo token de acesso (15 minutos) e um novo refresh token: o refresh é rotativo, cada uso gera outro, e replay indevido revoga a sessão. Direção aprovada em 12/11/2026: tolerância controlada ao retry legítimo após resposta perdida; duração/mecanismo e proteção contra replay continuam pendentes da revisão de segurança, bloqueando a implementação dessa exceção (ADR-007, Proposta). No app, o refresh vai no corpo; na web, vem do cookie `httpOnly` e exige proteção CSRF. Sem `Authorization` nem cabeçalhos de contexto, porque o token de acesso pode já ter expirado.
         */
        post: operations["comumRenovar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/sair": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sai da conta neste aparelho
         * @description **Proposta:** caminho não definido nos docs; origem no ADR-007 e na arquitetura 3.7, sem ID de produto. Revoga a sessão atual (ADR-007) e, se `dispositivo_id` vier, remove o token de push do aparelho (arquitetura 3.7). O app apaga a cópia offline ao sair da conta (SEG-09). Exige `Authorization`, sem cabeçalhos de contexto.
         */
        post: operations["comumSair"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/acesso/aceites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista os documentos que faltam aceitar
         * @description Devolve as versões vigentes de termos de uso, política de privacidade, regimento do condomínio e "Como funciona" que o usuário ainda não aceitou. Nova versão de qualquer um exige novo aceite antes de continuar; quem tem vínculo com mais de um condomínio aceita o regimento de cada um (RN-CD-03). Exige `Authorization`, sem cabeçalhos de contexto (o `condominio_id` vem em cada item).
         */
        get: operations["comumListarAceitesPendentes"];
        put?: never;
        /**
         * Registra o aceite de documentos
         * @description Grava o aceite de uma ou mais versões, com a data. Só vale a versão vigente; o aceite é único por usuário e versão e o regimento é aceito separadamente em cada condomínio (RN-CD-03, SEG-03). Exige `Authorization`, sem cabeçalhos de contexto.
         */
        post: operations["comumRegistrarAceites"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtém o perfil do próprio usuário
         * @description Devolve nome, e-mail e a preferência de tema do usuário autenticado. Não traz condomínios, unidades nem papéis: para isso, `GET /v1/eu/contextos`. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        get: operations["comumObterPerfil"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Atualiza a preferência de tema
         * @description Guarda a escolha de tema: "Igual ao aparelho" (padrão), "Claro" ou "Escuro" (RF-AC-05). A escolha fica salva e vale em qualquer aparelho. Só a preferência de tema é editável por aqui: cadastro de pessoas é da administradora ou da gestão local no Essencial autogestão (RN-CD-01, RN-PL-08), em operação administrativa específica. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        patch: operations["comumAtualizarPerfil"];
        trace?: never;
    };
    "/v1/eu/contextos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista os contextos disponíveis do usuário
         * @description Devolve, por condomínio, os papéis efetivos hoje (mandatos e substituição vigentes são dado, RN-CD-12 e RN-CD-28) e as unidades vinculadas, para o cliente montar o seletor de condomínio e de unidade e saber quais cabeçalhos `X-Condominio-Id` e `X-Unidade-Id` enviar. Quem tem uma única unidade não vê seletor (RN-CD-05). A lista é informativa: a autorização é validada a cada requisição pelos guards e pela RLS, nunca por esta resposta. Exige `Authorization`, sem cabeçalhos de contexto. O contexto do suporte e do admin da plataforma abre pelas rotas de `plataforma`.
         */
        get: operations["comumListarContextos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/sessoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista as sessões do usuário
         * @description **Proposta:** origem no ADR-007, sem ID de produto; listagem não prevista em RF, extensão do modelo de sessão do ADR-007 (tabela `sessao`). Lista as sessões não revogadas, com o aparelho de cada uma, para o usuário encerrar as que não reconhece. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        get: operations["comumListarSessoes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/sessoes/{sessao_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Encerra uma sessão
         * @description **Proposta:** origem no ADR-007, sem ID de produto. Revoga a sessão informada (o refresh token dela deixa de valer); o token de acesso já emitido vale até expirar, no máximo 15 minutos. Só sessões do próprio usuário; de outro usuário responde `404`. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        delete: operations["comumEncerrarSessao"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/dispositivos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registra o aparelho e o token de push
         * @description Registra ou atualiza, pelo `identificador_instalacao`, o aparelho do usuário e o token do Expo Push (arquitetura 3.7). Push e credencial de sessão são coisas diferentes: este registro não abre sessão. Tokens inválidos devolvidos pelo Expo (`DeviceNotRegistered`) são removidos pelo servidor. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        post: operations["comumRegistrarDispositivo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/dispositivos/{dispositivo_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove o token de push de um aparelho
         * @description Revoga a associação e o token de push do aparelho, que deixa de receber notificações (arquitetura 3.7). A sessão não é encerrada: para isso, `POST /v1/acesso/sair`. Só aparelhos do próprio usuário; de outro usuário responde `404`. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        delete: operations["comumRemoverDispositivo"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/preferencias-notificacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista as preferências de notificação
         * @description Devolve cada tipo de notificação com a opção de ligar ou desligar, no vínculo do usuário com o condomínio informado (preferência é por vínculo). Os tipos obrigatórios vêm com `obrigatoria: true`, interruptor travado e o motivo: decisão de reclamação contra a pessoa e divergência de sincronização para o porteiro (RF-NO-01, US-NO-01). "Lembrete de reserva" é opcional e vem ligado por padrão (RN-RE-14). Exige `Authorization`, sem cabeçalhos de contexto (o condomínio vai em `condominio_id`).
         */
        get: operations["comumListarPreferenciasNotificacao"];
        /**
         * Atualiza as preferências de notificação
         * @description Liga ou desliga os tipos opcionais no vínculo com o condomínio. Tentar desligar um tipo obrigatório responde `422` e nada é gravado (US-NO-01). Tipos fora do corpo ficam como estão. Exige `Authorization`, sem cabeçalhos de contexto.
         */
        put: operations["comumAtualizarPreferenciasNotificacao"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/notificacoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista as notificações do usuário
         * @description Lista as notificações internas, da mais recente para a mais antiga. O texto é seguro: nunca expõe situação financeira nem quem reclamou (RN-RC-10, DS 15), e o detalhe só aparece dentro do app autenticado; a referência de navegação não concede autorização. Exige `Authorization`, sem cabeçalhos de contexto; filtra por condomínio com `condominio_id`.
         */
        get: operations["comumListarNotificacoes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eu/pedidos-lgpd": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista os pedidos de LGPD do usuário
         * @description **Proposta:** listagem sem RF dedicado (ver lacunas). Lista os pedidos de cópia e de exclusão do próprio usuário, com o estado, para acompanhamento (SEG-11). Exige `Authorization`, sem cabeçalhos de contexto.
         */
        get: operations["comumListarPedidosLgpd"];
        put?: never;
        /**
         * Pede cópia dos dados ou exclusão da conta
         * @description Cópia dos dados: o arquivo é enviado por e-mail em até 15 dias e não inclui a identidade de quem reclamou do titular (RF-LG-01, ADR-010). Exclusão da conta: exige a senha; o histórico é anonimizado e votos e reclamações continuam contando, sem identificação (RF-LG-02, SEG-11). Se a pessoa é morador habilitado, proprietário ou responsável financeiro, a administradora é avisada para definir o substituto (RN-CD-18). O pedido de exclusão revoga as sessões ao concluir (ADR-007). Exige `Authorization`, sem cabeçalhos de contexto.
         */
        post: operations["comumCriarPedidoLgpd"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/arquivos/envios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pede o URL assinado de envio
         * @description O arquivo nunca passa pela API de negócio: a API autoriza a ação (por exemplo, anexar foto neste chamado), registra o arquivo pendente e devolve um URL assinado de envio (PUT, expira em minutos), em bucket privado com chave `c/{condominio_id}/{modulo}/{uuid}` (arquitetura 3.8). Limites já decididos: comprovante de lançamento financeiro, foto ou PDF, até 10 MB (RN-FI-24); até 5 fotos na conclusão de chamado (RN-CH-14). Alvo de outro condomínio ou inexistente responde `404`. Depois do PUT, o cliente chama a confirmação. Na fila offline, as fotos sobem antes de a conclusão ser aplicada (RN-OF-01 a RN-OF-06 e ADR-003, na interface `sync`).
         */
        post: operations["comumPedirEnvioArquivo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/arquivos/{arquivo_id}/confirmacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirma o envio do arquivo
         * @description Depois do PUT no URL assinado, a API confere que o objeto existe, valida o tipo pelo conteúdo (não só pela extensão), o tamanho e o hash, e registra o arquivo (condomínio, dono, módulo, tamanho, tipo, hash) com RLS (arquitetura 3.8). Só depois disso o `arquivo_id` pode ser usado por uma operação de domínio. Só quem pediu o envio confirma.
         */
        post: operations["comumConfirmarEnvioArquivo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/arquivos/{arquivo_id}/leituras": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pede o URL assinado de leitura
         * @description A API checa a permissão sobre o arquivo (ele herda a restrição do alvo, não só a do dono do envio) e devolve um URL assinado de leitura de curta duração; nunca há URL permanente (arquitetura 3.8). Documento do visitante só vai à portaria e ao morador que o cadastrou, nunca em notificação. Arquivo de outro condomínio responde `404`.
         */
        post: operations["comumPedirLeituraArquivo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/score": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtém um score, conforme a visibilidade do chamador
         * @description Endpoint único de score: nenhum outro endpoint devolve score (ADR-010, SEG-07). O servidor aplica a tabela de visibilidade e recusa o que o chamador não pode ver. `proprio`: o próprio score, do vínculo da unidade ativa para moradores (exige `X-Unidade-Id`) e funcional por condomínio para funcionário e síndico profissional sem unidade (RN-SC-13, RN-SC-14). `sindico`: o score público do síndico, aberto a todos ("ver score do síndico", matriz do PRD 3, RF-RS-12); do vínculo da unidade de referência do mandato quando morador, funcional quando profissional (RN-SC-02); nesse escopo `unidade` vem nula, porque RF-RS-11 só autoriza identificar a unidade no próprio score. `funcionario`: o score de um funcionário, só para a administradora ou, sem administradora, síndico e subsíndico (RN-SC-02). `funcionarios` (Proposta): a lista paginada dos scores funcionais dos funcionários do condomínio, com as mesmas permissões de `funcionario` (administradora ou, sem administradora, síndico e subsíndico; matriz do PRD 3, "Ver score dos funcionários", RN-SC-02); responde `403` ao suporte da plataforma (não vê scores, PRD 3 e ADR-010) e a qualquer outro perfil que a matriz não autoriza, inclusive síndico e subsíndico quando o condomínio tem administradora. A lista não traz nome, só `funcionario_id`, saldo e situação, e nenhum dado de quem reclamou ou avaliou (RN-SC-12, SEG-07); a forma do `200` é `oneOf` (objeto único nos demais escopos, lista nesse). `reclamacao`: o score do reclamante ou do alvo no contexto de uma reclamação, só para quem julga e a administradora (RN-SC-02, RN-RC-08); a resposta traz só o saldo, nunca a identidade do reclamante. `404` se `funcionario_id` ou `reclamacao_id` não existe ou é de outro condomínio. Sem score: visitantes, administradora, suporte, admin da plataforma, proprietário não residente e empresas de manutenção (RN-SC-01); o suporte não recebe score nem reclamação. O estado vai em texto, nunca por cor.
         */
        get: operations["comumObterScore"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/score/movimentos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista o histórico de ganhos e perdas do próprio score
         * @description Histórico do próprio score, cada ganho e perda com data, motivo e pontos, do vínculo da unidade ativa (moradores, `X-Unidade-Id`) ou funcional do condomínio; perdas e bloqueios não acompanham a pessoa para os outros imóveis (RN-SC-13, RN-SC-14). Nunca aparece quem reclamou (RN-SC-12, SEG-07). Só o dono vê; é parte da política única de visibilidade de `GET /v1/score`.
         */
        get: operations["comumListarMovimentosScore"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/recursos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recorre de uma decisão que tirou pontos
         * @description Quem perdeu pontos (morador, síndico, subsíndico, limpeza ou portaria) recorre uma vez, em até 7 dias da decisão (RN-RC-07). Decisão da administradora ou do conselho fiscal não tem recurso no app. Quem julga o recurso (tabela 5.3): decisão do síndico, o subsíndico; sem subsíndico, a administradora; sem administradora, o conselho fiscal. Decisão do subsíndico, o síndico; se o síndico for parte da reclamação ou estiver em substituição, a administradora; sem ela, o conselho fiscal. Quem é parte da reclamação nunca julga o recurso; nesse caso o recurso vai à administradora e, sem ela, ao conselho fiscal; sem nenhum dos dois, fica pendente (RN-RC-14). Sem recurso em 7 dias, a rotina encerra a reclamação (RN-RC-15). A resposta nunca traz quem reclamou (RN-RC-01).
         */
        post: operations["comumCriarRecurso"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/recursos/{recurso_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtém um recurso
         * @description Visível só a quem recorreu e a quem julga o recurso. Traz o resultado e a fundamentação depois de decidido; recurso aceito devolve os pontos e a perda deixa de contar para a regularidade (RN-RC-07, RN-SC-08). Nunca traz a identidade do reclamante (RN-RC-01, RN-RC-10). Recurso de outro condomínio ou de outra pessoa responde `404`.
         */
        get: operations["comumObterRecurso"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/recursos/{recurso_id}/decisoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Julga um recurso
         * @description Aceita ou nega o recurso. Aceito devolve os pontos; negado mantém a decisão e encerra a reclamação (RN-RC-07). Quem é parte da reclamação nunca julga o recurso (RN-RC-14). Quem julga (tabela 5.3): decisão do síndico, o subsíndico; sem subsíndico, a administradora; sem administradora, o conselho fiscal. Decisão do subsíndico, o síndico; se o síndico for parte da reclamação ou estiver em substituição, a administradora; sem ela, o conselho fiscal. Decisão da administradora ou do conselho fiscal não tem recurso no app. Quem não é o julgador da vez nessa ordem responde `403`; o papel por mandato é dado (RN-CD-12, RN-CD-28).
         */
        post: operations["comumDecidirRecurso"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/denuncias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Denuncia um conteúdo ofensivo
         * @description Qualquer usuário do condomínio pode denunciar um conteúdo a que tem acesso (RF-RS-14, RN-RC-13), pelo menu "Denunciar" de qualquer texto (UF 9.4). A denúncia vai ao síndico; se o conteúdo foi escrito pelo síndico, vai a quem julgaria uma reclamação contra ele (RN-RC-13, tabela 5.1). O destinatário é decidido pelo servidor e não aparece na resposta, nem quem escreveu o conteúdo. O conteúdo precisa ser de um tipo denunciável e estar acessível ao denunciante; de outro condomínio ou fora do alcance responde `404`. A resposta nunca devolve autor do conteúdo, destinatário nem estado. Decisão de 12/11/2026 — destinatário autorizado revisa projeção protegida e encerra sem ação ou oculta conteúdo com motivo/histórico, sem score automático; operações de consulta/decisão estão neste arquivo. A proteção de identidades na projeção ainda exige revisão.
         */
        post: operations["comumDenunciarConteudo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notas-dos-setores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consulta a nota de cada setor
         * @description Nota do setor = média das médias dos funcionários avaliados, publicada só com 2 ou mais avaliados no mês (RN-PE-07, RN-PE-08, RF-PE-04); abaixo disso a nota não é publicada e vem o rótulo. Aberta a todos os perfis do condomínio. Notas individuais ficam só com o próprio funcionário (RN-PE-09). Rota única para todos os perfis do condomínio. O score do síndico, também aberto a todos (matriz do PRD 3; RF-RS-12, RN-SC-02), não é daqui: vem de `GET /v1/score` com `escopo=sindico` (`comumObterScore`).
         */
        get: operations["comumConsultarNotasDosSetores"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/denuncias/recebidas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista denúncias atribuídas ao destinatário autorizado
         * @description RN-RC-13, decisão de 12/11/2026. Resolve destinatário pela tabela vigente e conflito. Devolve projeção mínima sem identidade de reclamante/avaliador, sem score nem acesso irrestrito à origem. Suporte não recebe reclamações/scores. Encaminhamento não concede leitura de conteúdo protegido. Caminho e códigos são proposta.
         */
        get: operations["comumListarDenunciasRecebidas"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/denuncias/{denuncia_id}/decisao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Decide denúncia atribuída
         * @description RN-RC-13, decisão de 12/11/2026. Revalida atribuição atual e acesso à projeção protegida. Encerra sem ação ou oculta conteúdo com motivo, autoria, momento e histórico, sem apagar prova restrita nem aplicar score. Não revela identidade de reclamante ou avaliador. Nunca autoriza suporte a reclamações/scores. Decisão concorrente incompatível recebe 409; replay idempotente recupera recibo.
         */
        post: operations["comumDecidirDenuncia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eleicoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista as eleições
         * @description Consulta no próprio condomínio pelo condutor legitimado de RN-VO-13, em qualquer plano; resultado somente após encerramento e sem votos individuais.
         */
        get: operations["comumListarEleicoes"];
        put?: never;
        /**
         * Abre a eleição de síndico e subsíndico com prazo de candidaturas
         * @description Decisão de 13/11/2026: qualquer plano admite síndico em exercício; na ausência ou vacância, subsíndico; sem ambos, conselho fiscal; sem todos, proprietário designado com permissão temporária restrita à eleição. Administradora vinculada também pode conduzir; suporte autorizado só no Gestão + Suporte (`403` no Essencial). Concessão inicial e prova de ausência pendentes, sem autoconcessão. Caminho e campos continuam proposta; RF-VO-05 e RN-VO-13.
         */
        post: operations["comumAbrirEleicao"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eleicoes/{eleicao_id}/encerramento": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Encerra e apura eleição regular
         * @description Decisão de 13/11/2026, RN-VO-07/13. Condutor legitimado pela sequência de RN-VO-13, em qualquer plano, ou administradora vinculada ou suporte autorizado (este só no Gestão + Suporte; `403` no Essencial). Revalidar vigência, ausência e concessão a cada ação; produto de concessão inicial/prova de ausência aprovado no registro 06, seção 2.1; desenho estrutural pendente, sem autoconcessão. Encerramento serializa com votos; resultado só publicado após fechar. Primeiro empate gera segundo turno em até sete dias; segundo empate ou ausência de elegível é inconclusivo, sem vencedor automático, encaminhado ao condutor autorizado vigente, sem exigir administradora ou suporte pago. Sigilo e substituição de voto continuam bloqueados até desenho de segurança validado; parecer jurídico pulado por inacessibilidade conforme roadmap de 17/11/2026.
         */
        post: operations["comumEncerrarEleicao"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/eleicoes/{eleicao_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detalha uma eleição
         * @description Consulta no próprio condomínio pelo condutor legitimado de RN-VO-13, em qualquer plano; resultado somente após encerramento e sem votos individuais.
         */
        get: operations["comumObterEleicao"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/saude": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consulta a saúde da API
         * @description **Proposta (BL-DV-03, 17/11/2026):** operação técnica, sem RF, para o app e o ambiente local confirmarem que a API responde (primeira entrega, IN-01 A, RM-13). Devolve só o estado e a versão da API; nunca dados de condomínio, de usuário, de dependências internas ou de configuração. Responder `200` não significa acesso, tenant ou segurança implementados. Sem `Authorization` nem cabeçalhos de contexto.
         */
        get: operations["comumConsultarSaude"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Estado mínimo da API (Proposta, BL-DV-03). Sem dados de tenant nem detalhes internos. */
        SaudeComum: {
            /**
             * @description Sempre `disponivel` no `200`; indisponibilidade responde `503`.
             * @enum {string}
             */
            estado: "disponivel";
            /**
             * @description Versão da API em execução (Proposta). Não inclui versão de dependências.
             * @example 0.1.0
             */
            versao: string;
        };
        /** @description Aparelho que abre a sessão; a sessão fica ligada a ele (ADR-007). */
        DispositivoInfoComum: {
            /**
             * @description Identificador da instalação do app no aparelho (Proposta).
             * @example inst-8f3a2c1d-aparelho-exemplo
             */
            identificador_instalacao: string;
            /**
             * @description Plataforma do cliente (Proposta; a web aparece em RF-AC-06).
             * @enum {string}
             */
            plataforma: "android" | "ios" | "web";
        };
        PedirCodigoComum: {
            /**
             * Format: email
             * @example ana.exemplo@example.com
             */
            email: string;
            /**
             * @description Finalidade do desafio de acesso (MER `desafio_acesso.finalidade`; valores Proposta).
             * @enum {string}
             */
            finalidade: "primeiro_acesso" | "recuperacao_senha";
        };
        RespostaCodigoComum: {
            /** @description Mensagem única, igual para e-mail cadastrado ou não (RN-CD-02). */
            mensagem: string;
            /** @description Instante em que um novo código pode ser pedido (60 s depois). Calculado igual para qualquer e-mail. */
            pode_pedir_novo_codigo_em: components["schemas"]["DataHora"];
        };
        AtivarComum: {
            /** Format: email */
            email: string;
            /**
             * @description Código de 6 dígitos (RN-CD-02).
             * @example 483920
             */
            codigo: string;
            /** @description Senha com no mínimo 8 caracteres (RF-AC-01). Nunca é devolvida. */
            nova_senha: string;
            dispositivo: components["schemas"]["DispositivoInfoComum"];
        };
        RedefinirSenhaComum: {
            /** Format: email */
            email: string;
            /** @example 102938 */
            codigo: string;
            nova_senha: string;
            dispositivo: components["schemas"]["DispositivoInfoComum"];
        };
        EntrarComum: {
            /** Format: email */
            email: string;
            senha: string;
            dispositivo: components["schemas"]["DispositivoInfoComum"];
        };
        RenovarComum: {
            /** @description Refresh token opaco. Obrigatório no app; na web vem do cookie `httpOnly` e o campo é omitido. */
            refresh_token?: string;
        };
        SairComum: {
            /** @description Aparelho cujo token de push deve ser removido junto com a sessão (opcional). */
            dispositivo_id?: components["schemas"]["Uuid"];
        };
        SessaoAbertaComum: {
            /** @description JWT de 15 minutos, só com `sub` e `sid`, sem papéis nem condomínios (ADR-007, Proposta). */
            token_acesso: string;
            token_acesso_expira_em: components["schemas"]["DataHora"];
            /** @description Opaco e rotativo. Nulo na web: nesse caso vai no cookie `httpOnly`. */
            refresh_token?: string | null;
            /** @description Verdadeiro se há documento a aceitar antes de usar o app (RN-CD-03); ver `GET /v1/acesso/aceites`. */
            aceites_pendentes: boolean;
        };
        DocumentoPendenteComum: {
            documento_versao_id: components["schemas"]["Uuid"];
            documento_id: components["schemas"]["Uuid"];
            /**
             * @description Tipo do documento: termos de uso, política de privacidade, regimento do condomínio e "Como funciona" (RN-CD-03). Os códigos exatos são Proposta.
             * @example termos_de_uso
             * @example politica_de_privacidade
             * @example regimento
             * @example como_funciona
             */
            tipo: string;
            titulo: string;
            /** @description Número da versão (MER `documento_versao.numero`). */
            numero: number;
            /**
             * Format: uuid
             * @description Nulo nos documentos globais; preenchido no regimento do condomínio.
             */
            condominio_id?: string | null;
            publicado_em?: components["schemas"]["DataHora"];
            vigente_desde: components["schemas"]["DataHora"];
            /** @description Texto da versão; exatamente um entre `conteudo_texto` e `arquivo_id` (MER). */
            conteudo_texto?: string | null;
            /**
             * Format: uuid
             * @description Arquivo da versão, lido por `POST /v1/arquivos/{arquivo_id}/leituras`.
             */
            arquivo_id?: string | null;
        };
        RegistrarAceitesComum: {
            /** @description Versões vigentes que o usuário aceita agora. */
            documento_versao_ids: components["schemas"]["Uuid"][];
        };
        AceitesRegistradosComum: {
            aceitos: {
                documento_versao_id: components["schemas"]["Uuid"];
                aceito_em: components["schemas"]["DataHora"];
            }[];
            pendentes_restantes: number;
        };
        /**
         * @description "Igual ao aparelho" (`aparelho`, padrão), "Claro" (`claro`) e "Escuro" (`escuro`) (RF-AC-05). Códigos Proposta.
         * @enum {string}
         */
        TemaComum: "aparelho" | "claro" | "escuro";
        PerfilComum: {
            id: components["schemas"]["Uuid"];
            nome: string;
            /** Format: email */
            email: string;
            tema_preferido: components["schemas"]["TemaComum"];
        };
        AtualizarPerfilComum: {
            tema_preferido: components["schemas"]["TemaComum"];
        };
        PapelEfetivoComum: {
            /**
             * @description Papel efetivo hoje naquele condomínio (Proposta de nomenclatura; perfis do PRD 3). Síndico morador e profissional se distinguem em `funcao_mandato`.
             * @enum {string}
             */
            papel: "morador" | "proprietario_nao_residente" | "sindico" | "subsindico" | "conselho_fiscal" | "portaria" | "limpeza" | "administradora" | "suporte" | "admin_plataforma";
            /**
             * @description Prefixo de caminho que o cliente usa para este papel (`/v1/<interface>/...`; guia, seção 4).
             * @enum {string}
             */
            interface: "morador" | "proprietario-nao-residente" | "sindico" | "conselho-fiscal" | "portaria" | "limpeza" | "administradora" | "plataforma";
            /** @description Função do mandato vigente, quando houver (MER `mandato.funcao`). */
            funcao_mandato?: string | null;
            /** @description Para o subsíndico: verdadeiro durante a substituição do síndico (RN-CD-12, RN-CD-28). */
            em_substituicao?: boolean | null;
        };
        UnidadeContextoComum: {
            unidade_id: components["schemas"]["Uuid"];
            identificacao: string;
            bloco_nome?: string | null;
            /**
             * @description MER `vinculo_unidade.tipo` (códigos Proposta).
             * @enum {string}
             */
            tipo_vinculo: "proprietario_representante" | "inquilino" | "dependente";
            /** @description Verdadeiro se é o morador habilitado da unidade (RN-CD-04). */
            morador_habilitado?: boolean;
        };
        /** @description Um condomínio onde o usuário tem vínculo vigente, com papéis e unidades. */
        ContextoComum: {
            condominio_id: components["schemas"]["Uuid"];
            condominio_nome: string;
            vinculo_condominio_id: components["schemas"]["Uuid"];
            papeis: components["schemas"]["PapelEfetivoComum"][];
            /** @description Vazia para quem não tem unidade (funcionário, síndico profissional, administradora). */
            unidades: components["schemas"]["UnidadeContextoComum"][];
        };
        SessaoComum: {
            id: components["schemas"]["Uuid"];
            dispositivo_identificador?: string | null;
            expira_em: components["schemas"]["DataHora"];
            /** @description Verdadeiro para a sessão que fez esta chamada. */
            atual: boolean;
        };
        RegistrarDispositivoComum: {
            identificador_instalacao: string;
            /**
             * @description Push só no app (Expo Push e FCM); a web não registra token (Proposta).
             * @enum {string}
             */
            plataforma: "android" | "ios";
            /** @description Token do Expo Push. Guardado protegido; nunca devolvido. */
            token_push: string;
        };
        DispositivoComum: {
            id: components["schemas"]["Uuid"];
            identificador_instalacao: string;
            /** @enum {string} */
            plataforma: "android" | "ios";
            ultima_atividade: components["schemas"]["DataHora"];
        };
        /**
         * @description Os sete tipos de RF-NO-01 (visitante, encomenda, reserva, chamado, comunicado, votação, reclamação), o lembrete de reserva (RN-RE-14, opcional) e os dois obrigatórios (`decisao_reclamacao` e `divergencia_sincronizacao`, US-NO-01). Códigos Proposta.
         * @enum {string}
         */
        TipoNotificacaoComum: "visitante" | "encomenda" | "reserva" | "lembrete_reserva" | "chamado" | "comunicado" | "votacao" | "reclamacao" | "decisao_reclamacao" | "divergencia_sincronizacao";
        PreferenciaNotificacaoComum: {
            tipo: components["schemas"]["TipoNotificacaoComum"];
            habilitada: boolean;
            /** @description Verdadeiro nos tipos que não podem ser desligados (US-NO-01). A lista é fixa em código no servidor. */
            obrigatoria: boolean;
            /** @description Texto do motivo exibido no interruptor travado (UF 14.1; texto Proposta). */
            motivo_obrigatoria?: string | null;
        };
        PreferenciasNotificacaoComum: {
            /** @description Lista completa e fixa de tipos; não é paginada. */
            preferencias: components["schemas"]["PreferenciaNotificacaoComum"][];
        };
        AtualizarPreferenciasNotificacaoComum: {
            condominio_id: components["schemas"]["Uuid"];
            preferencias: {
                tipo: components["schemas"]["TipoNotificacaoComum"];
                habilitada: boolean;
            }[];
        };
        NotificacaoComum: {
            id: components["schemas"]["Uuid"];
            condominio_id: components["schemas"]["Uuid"];
            tipo: components["schemas"]["TipoNotificacaoComum"];
            /** @description Texto sem dados sensíveis (arquitetura 3.7). Nunca traz situação financeira nem quem reclamou. */
            texto_seguro: string;
            criada_em: components["schemas"]["DataHora"];
            /** Format: date-time */
            lida_em?: string | null;
            /** @description Referência de navegação; não concede autorização (MER `referencia_restrita`). */
            referencia?: {
                entidade?: string;
                id?: components["schemas"]["Uuid"];
            } | null;
        };
        CriarPedidoLgpdComum: {
            /**
             * @description Valores Proposta (MER `pedido_lgpd.tipo`).
             * @enum {string}
             */
            tipo: "copia_dados" | "exclusao_conta";
            /** @description Obrigatória em `exclusao_conta`: confirmação com a senha (UF 14.1). */
            senha?: string;
        };
        PedidoLgpdComum: {
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            tipo: "copia_dados" | "exclusao_conta";
            /**
             * @description Estado do pedido (MER `pedido_lgpd.estado`). Os valores não estão definidos nos docs: lacuna.
             * @example solicitado
             */
            estado: string;
            solicitado_em: components["schemas"]["DataHora"];
            /** Format: date-time */
            concluido_em?: string | null;
            /**
             * Format: date-time
             * @description Na cópia: limite de 15 dias para o envio por e-mail (RF-LG-01).
             */
            prazo_envio_ate?: string | null;
            /** @description Na exclusão: verdadeiro se a pessoa era morador habilitado, proprietário ou responsável financeiro e a administradora foi avisada (RN-CD-18). */
            administradora_avisada?: boolean | null;
        };
        /**
         * @description Usos de arquivo da arquitetura 3.8 (etiqueta de encomenda, foto de chamado, fotos de conclusão, checklist de vistoria RF-RE-08, comprovante de lançamento RN-FI-24, ata e lista de presença RF-VO-09, comprovante de pagamento externo RF-FI-10, fotos de áreas) mais o documento do visitante. Códigos Proposta.
         * @enum {string}
         */
        ModuloArquivoComum: "etiqueta_encomenda" | "foto_chamado" | "foto_conclusao_chamado" | "checklist_vistoria" | "comprovante_lancamento" | "ata_reuniao" | "lista_presenca" | "comprovante_pagamento" | "foto_area" | "documento_visitante";
        PedirEnvioArquivoComum: {
            modulo: components["schemas"]["ModuloArquivoComum"];
            /**
             * @description Tipo de mídia declarado; a API valida pelo conteúdo na confirmação. A lista de tipos aceitos é lacuna.
             * @example application/pdf
             * @example image/jpeg
             */
            tipo_midia: string;
            tamanho_bytes: number;
            /** @description Hash do conteúdo, conferido na confirmação. Formato do hash: lacuna. */
            hash_conteudo?: string | null;
            /** @description Objeto ao qual o arquivo será anexado, para a API autorizar a ação (MER `anexo_dominio`). Os demais usos ligam o arquivo pela operação de domínio. */
            alvo?: {
                /** @enum {string} */
                tipo: "reserva" | "vistoria" | "reclamacao" | "chamado";
                id: components["schemas"]["Uuid"];
            } | null;
        };
        EnvioArquivoComum: {
            arquivo_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            metodo: "PUT";
            /**
             * Format: uri
             * @description URL assinado de envio. Expira em minutos (número: lacuna).
             */
            url_envio: string;
            /** @description Cabeçalhos que o cliente deve repetir no PUT. */
            cabecalhos?: {
                [key: string]: string;
            };
            expira_em: components["schemas"]["DataHora"];
        };
        ArquivoComum: {
            id: components["schemas"]["Uuid"];
            modulo: components["schemas"]["ModuloArquivoComum"];
            tipo_midia: string;
            tamanho_bytes: number;
            hash_conteudo?: string | null;
            criado_em: components["schemas"]["DataHora"];
        };
        LeituraArquivoComum: {
            arquivo_id: components["schemas"]["Uuid"];
            /**
             * Format: uri
             * @description URL assinado de curta duração; nunca permanente.
             */
            url_leitura: string;
            expira_em: components["schemas"]["DataHora"];
        };
        ScoreComum: {
            /** @enum {string} */
            escopo: "proprio" | "sindico" | "funcionario" | "reclamacao";
            /**
             * @description Score de moradia (por pessoa e vínculo de unidade) ou funcional (por pessoa e condomínio) (RN-SC-13, RN-SC-14).
             * @enum {string}
             */
            titular_tipo: "moradia" | "funcional";
            condominio_id: components["schemas"]["Uuid"];
            /** @description Unidade do score de moradia, identificada, só em `escopo=proprio` (RF-RS-11). Nula no score funcional e nos escopos `sindico`, `funcionario` e `reclamacao` (Proposta; ver lacunas). */
            unidade?: {
                unidade_id: components["schemas"]["Uuid"];
                identificacao: string;
                bloco_nome?: string | null;
            } | null;
            /** @description De 0 a 100 (RN-SC-01). Só o número: sem cor de verde ou vermelho; o score é referência, não julgamento público. */
            saldo: number;
            /**
             * Format: date
             * @description Data da próxima recuperação de +5 pontos (RN-SC-08). Só no escopo `proprio`.
             */
            proxima_recuperacao_em?: string | null;
            /** @description Só no score de moradia do próprio: falso com saldo igual ou menor que o limite configurável (padrão 60), só naquela unidade (RN-SC-09). */
            reservas_gratuitas_liberadas?: boolean | null;
            /** @description Explicação em texto da situação, sem depender de cor (WCAG 1.4.1). */
            situacao_texto?: string | null;
            /**
             * Format: uuid
             * @description Eco do pedido em `escopo=funcionario`.
             */
            funcionario_id?: string | null;
            /**
             * Format: uuid
             * @description Eco do pedido em `escopo=reclamacao`.
             */
            reclamacao_id?: string | null;
            /**
             * @description Eco do pedido em `escopo=reclamacao`. Não traz a identidade do reclamante.
             * @enum {string|null}
             */
            parte?: "reclamante" | "alvo" | null;
        };
        /** @description Página de scores funcionais, em `GET /v1/score` com `escopo=funcionarios` (Proposta). Cada item é um `ScoreComum` com `escopo=funcionario` e `funcionario_id`. Sem nome, sem autor de reclamação nem de avaliação. */
        ListaScoresFuncionariosComum: {
            dados: components["schemas"]["ScoreComum"][];
            paginacao: components["schemas"]["Paginacao"];
        };
        MovimentoScoreComum: {
            id: components["schemas"]["Uuid"];
            registrado_em: components["schemas"]["DataHora"];
            /**
             * @description Origem do movimento (MER `movimento_score.origem_tipo`: decisão, recurso, pesquisa, apuração de faltas, recuperação). Os códigos não estão definidos nos docs: lacuna.
             * @example reclamacao_validada
             * @example recuperacao
             */
            origem_tipo: string;
            /** @description Pontos que valeram depois do limite de 0 a 100. */
            pontos_efetivos: number;
            saldo_depois: number;
            /** @description Motivo exibido ao dono. Nunca revela quem reclamou (RN-SC-12). */
            motivo: string;
        };
        CriarDenunciaComum: {
            origem: {
                /**
                 * @description Tipo do conteúdo denunciado (MER `denuncia_conteudo`: exatamente uma origem acessível ao denunciante). Códigos Proposta; a lista acompanha novos tipos.
                 * @enum {string}
                 */
                tipo: "mensagem_comunicado" | "reclamacao" | "avaliacao_atendimento" | "resposta_pesquisa";
                id: components["schemas"]["Uuid"];
            };
            /** @description Motivo da denúncia (MER `motivo`). */
            motivo: string;
        };
        /** @description Não traz destinatário, estado nem autor do conteúdo (estado e ações do destinatário: lacuna). */
        DenunciaComum: {
            id: components["schemas"]["Uuid"];
            origem: {
                tipo: string;
                id: components["schemas"]["Uuid"];
            };
            motivo: string;
            criada_em: components["schemas"]["DataHora"];
        };
        NotasSetoresComum: {
            /** @description Mês no formato aaaa-mm. */
            competencia: string;
            setores: {
                setor: string;
                /** @description Falso com menos de 2 funcionários avaliados (RN-PE-08). */
                publicada: boolean;
                /** @description Média das médias dos funcionários avaliados (RN-PE-07). Nula se não publicada. Casas decimais e arredondamento: lacuna. */
                nota?: number | null;
                /** @description Texto exibido quando a nota não é publicada (UF 9.4). */
                rotulo?: string | null;
            }[];
        };
        CriarRecursoComum: {
            /** @description Reclamação decidida; o recurso liga-se à decisão dela (MER `recurso_reclamacao.decisao_id`, UQ por decisão). */
            reclamacao_id: components["schemas"]["Uuid"];
            justificativa: string;
        };
        /** @description Nunca traz a identidade do reclamante nem o corpo da reclamação (ADR-010). */
        RecursoComum: {
            id: components["schemas"]["Uuid"];
            reclamacao_id: components["schemas"]["Uuid"];
            solicitado_em: components["schemas"]["DataHora"];
            justificativa: string;
            /**
             * @description Papel de quem julga, pela tabela 5.3; nulo se o recurso está pendente por falta de julgador (RN-RC-14).
             * @enum {string|null}
             */
            julgador_papel?: "sindico" | "subsindico" | "administradora" | "conselho_fiscal" | null;
            /** @enum {string|null} */
            resultado?: "aceito" | "negado" | null;
            /** Format: date-time */
            decidido_em?: string | null;
            fundamentacao?: string | null;
            estado_reclamacao: components["schemas"]["EstadoReclamacao"];
        };
        DecidirRecursoComum: {
            /** @enum {string} */
            resultado: "aceito" | "negado";
            fundamentacao: string;
        };
        /**
         * Format: date-time
         * @description Data e hora em ISO 8601 com deslocamento de fuso (Proposta).
         * @example 2026-11-10T14:30:00-03:00
         */
        DataHora: string;
        /**
         * @description Formato único de erro (Proposta; `01-backend.md` 4.5). O texto de `mensagem` é o que o
         *     cliente pode mostrar ao usuário; os valores de `codigo` estão no guia, seção 8. O erro nunca
         *     devolve corpo de reclamação, avaliação ou voto (ADR-010).
         */
        Erro: {
            /**
             * @description Código estável em `SNAKE_MAIUSCULO`, definido em `shared-types`. O cliente decide por ele, não pela mensagem.
             * @example SESSAO_EXPIRADA
             */
            codigo: string;
            /** @description Texto em português do Brasil, pronto para exibição. */
            mensagem: string;
            /** @description Detalhes por campo ou por regra, quando houver (entrada inválida, faixa de parâmetro). */
            detalhes?: {
                /** @description Nome do campo do corpo ou do parâmetro, em `snake_case`. */
                campo?: string;
                mensagem: string;
                codigo?: string;
            }[];
            /**
             * @description Mesmo valor do cabeçalho `X-Request-Id` da resposta. Serve para suporte e para o Sentry.
             * @example req_01JD9ZQ3K8M2T7V5W0X4Y6A1BC
             */
            request_id: string;
        };
        /**
         * Format: uuid
         * @description Identificador UUID. Todo identificador da API é UUID (Proposta).
         * @example 3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10
         */
        Uuid: string;
        /**
         * @description Bloco de paginação por cursor opaco devolvido em toda lista (Proposta).
         * @example {
         *       "proximo_cursor": "eyJpZCI6IjNmNmMxYTUyIn0",
         *       "tem_mais": true
         *     }
         */
        Paginacao: {
            /**
             * @description Cursor opaco para pedir a próxima página em `?cursor=`. Nulo quando `tem_mais` é falso.
             * @example eyJpZCI6IjNmNmMxYTUyIn0
             */
            proximo_cursor: string | null;
            /** @description Indica se há mais itens depois desta página. */
            tem_mais: boolean;
        };
        /**
         * Format: date
         * @description Data em ISO 8601, sem hora (`aaaa-mm-dd`). Nos textos de interface vale dd/mm/aaaa.
         * @example 2026-11-10
         */
        Data: string;
        /**
         * @description Estado da reclamação (RN 5.5). Correspondência: `pendente` Pendente; `aberta` Aberta;
         *     `em_conversa_com_o_alvo` Em conversa com o alvo; `validada` Validada; `negada` Negada;
         *     `em_recurso` Em recurso; `recurso_aceito` Recurso aceito; `encerrada` Encerrada. O semáforo
         *     de prazo não é estado (RN-RC-19). Nenhum DTO de estado expõe a identidade do autor.
         * @example aberta
         * @enum {string}
         */
        EstadoReclamacao: "pendente" | "aberta" | "em_conversa_com_o_alvo" | "validada" | "negada" | "em_recurso" | "recurso_aceito" | "encerrada";
        CandidaturaSindico: {
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            cargo: "sindico" | "subsindico";
            candidato_nome: string;
            unidade_identificacao: string;
            /** @description Ciclo da candidatura não definido nos docs (lacuna); códigos como `aceita` são Proposta, sem fonte literal. */
            estado: string;
            motivo_inelegibilidade: string | null;
        };
        EleicaoSindico: {
            /** @description Somente após encerramento. Decisão de 12/11/2026: segundo empate ou ausência de elegível, sem vencedor automático; encaminhado ao condutor legitimado vigente de RN-VO-13, sem exigir administradora ou suporte pago (atualização de 13/11/2026). */
            resultado_inconclusivo?: {
                /**
                 * @description Códigos propostos; não enumera todo o ciclo eleitoral.
                 * @enum {string}
                 */
                motivo: "segundo_turno_empatado" | "sem_candidato_elegivel";
            } | null;
            id: components["schemas"]["Uuid"];
            candidaturas_inicio: components["schemas"]["DataHora"];
            candidaturas_fim: components["schemas"]["DataHora"];
            /** @description Ciclo da eleição não definido nos docs (lacuna); códigos como `candidaturas_abertas` são Proposta, sem fonte literal. */
            estado: string;
            candidaturas: components["schemas"]["CandidaturaSindico"][];
            /** @description Só depois do encerramento (RF-VO-07). */
            resultado: {
                /** @enum {string} */
                cargo: "sindico" | "subsindico";
                candidatura_id: components["schemas"]["Uuid"];
                classificacao: number;
                quantidade_votos: number;
            }[] | null;
        };
        AbrirEleicaoSindico: {
            candidaturas_inicio: components["schemas"]["DataHora"];
            candidaturas_fim: components["schemas"]["DataHora"];
        };
    };
    responses: {
        /** @description Entrada inválida (validação Zod). Corpo ou parâmetro fora do esquema. */
        Erro400: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Versão do app abaixo do mínimo (guard de versão, Proposta). O cliente mostra o link para a loja (UF 15). */
        Erro426: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Erro do servidor. Enviado ao Sentry com dados filtrados. */
        Erro500: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Serviço indisponível (manutenção, dependência fora do ar). */
        Erro503: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                "Retry-After": components["headers"]["RetryAfter"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Limite de taxa excedido. Traz `Retry-After`. Os valores dos limites são lacuna. */
        Erro429: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                "Retry-After": components["headers"]["RetryAfter"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Sessão expirada, inválida ou revogada. O cliente volta ao login e depois à tela onde estava (UF 15). */
        Erro401: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Sem vínculo com o condomínio ou a unidade, ou sem permissão para o papel efetivo (guards de contexto, papel e unidade). */
        Erro403: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /**
         * @description Recurso não encontrado. Recurso de outro condomínio também responde `404`, indistinguível de
         *     "não existe", nunca `403` que confirme a existência (arquitetura 4.11).
         */
        Erro404: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Conflito de estado ou de dado (horário já reservado, dado alterado por outra pessoa, voto repetido, transição de estado não permitida; guia, seção 8). */
        Erro409: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /**
         * @description Regra de negócio violada (por exemplo, reserva fora da antecedência). O código HTTP da regra
         *     de negócio é Proposta. Cada operação acrescenta um exemplo com o código da regra do caso.
         */
        Erro422: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
        /** @description Eleição fora da regra. */
        Erro422Eleicao: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Erro"];
            };
        };
    };
    parameters: {
        /**
         * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
         *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
         *     falta também (lacuna).
         */
        AppVersion: string;
        /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
        Limite: number;
        /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
        Cursor: string;
        /**
         * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
         *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
         *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
         */
        CondominioId: components["schemas"]["Uuid"];
        /**
         * @description **Proposta.** Forma **opcional** do cabeçalho de unidade ativa: use onde a unidade não é
         *     indispensável à operação. Onde a operação depende da unidade, use `UnidadeIdObrigatorio`.
         *     Só existe nos perfis com unidade (morador, proprietário não residente e, quando agem como
         *     morador, síndico, subsíndico e conselho fiscal). A API valida o vínculo do usuário com a unidade.
         */
        UnidadeId: components["schemas"]["Uuid"];
        /**
         * @description Chave de idempotência por requisição, opcional, nos POST que cobram ou reservam
         *     (**Proposta técnica, fora das RN**; `01-backend.md` 4.6). Repetir a mesma chave com o mesmo
         *     corpo devolve a resposta original sem repetir o efeito. O tempo de guarda é lacuna.
         */
        IdempotencyKey: string;
        /** @description Identificador da eleição. */
        EleicaoId: components["schemas"]["Uuid"];
    };
    requestBodies: never;
    headers: {
        /** @description Identificador da requisição, devolvido em toda resposta (Proposta). Igual a `request_id` do corpo de erro. */
        XRequestId: string;
        /** @description Segundos até a próxima tentativa, nas respostas `429` (e `503`, quando houver). Os valores de limite de taxa são lacuna. */
        RetryAfter: number;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    comumPedirCodigo: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PedirCodigoComum"];
            };
        };
        responses: {
            /** @description Pedido aceito. Corpo idêntico exista ou não conta com esse e-mail. */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "mensagem": "Se o e-mail estiver cadastrado, enviamos um código. Se não chegar, confira o e-mail digitado ou procure a administradora ou o síndico.",
                     *       "pode_pedir_novo_codigo_em": "2026-11-10T14:31:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["RespostaCodigoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            426: components["responses"]["Erro426"];
            /** @description Reenvio antes de 60 segundos ou limite de taxa por IP e por e-mail. A resposta vale igual para qualquer e-mail, cadastrado ou não, para não revelar quem tem conta. Traz `Retry-After`. */
            429: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    "Retry-After": components["headers"]["RetryAfter"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumAtivar: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "ana.exemplo@example.com",
                 *       "codigo": "483920",
                 *       "nova_senha": "senha-de-exemplo-123",
                 *       "dispositivo": {
                 *         "identificador_instalacao": "inst-8f3a2c1d-aparelho-exemplo",
                 *         "plataforma": "android"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["AtivarComum"];
            };
        };
        responses: {
            /** @description Conta ativa e sessão aberta. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    /** @description Só na web: refresh token em cookie `httpOnly`, `Secure`, `SameSite=Lax` (ADR-007, Proposta). Nesse caso `refresh_token` não vai no corpo. */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "token_acesso": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiIzZjZjMWE1Mi04YjFlLTRkM2EtOWEwZS01YzFkMmI3ZTlmMTAiLCJzaWQiOiJiMmU0ZjZhOC0xYzNkLTRlNWYtOGE3Yi05YzBkMWUyZjNhNGIifQ.assinatura-de-exemplo",
                     *       "token_acesso_expira_em": "2026-11-10T14:45:00-03:00",
                     *       "refresh_token": "rt_9Zk2Qm7xVb3LpA0sTn5Wc8Hd1Yf4Ju6E",
                     *       "aceites_pendentes": true
                     *     }
                     */
                    "application/json": components["schemas"]["SessaoAbertaComum"];
                };
            };
            400: components["responses"]["Erro400"];
            /** @description Código incorreto, vencido ou invalidado (RN-CD-02). Mesmas respostas para e-mail não cadastrado. */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumEntrar: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "ana.exemplo@example.com",
                 *       "senha": "senha-de-exemplo-123",
                 *       "dispositivo": {
                 *         "identificador_instalacao": "inst-8f3a2c1d-aparelho-exemplo",
                 *         "plataforma": "android"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["EntrarComum"];
            };
        };
        responses: {
            /** @description Sessão aberta. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    /** @description Só na web: refresh token em cookie `httpOnly`, `Secure`, `SameSite=Lax` (ADR-007, Proposta). */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "token_acesso": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiIzZjZjMWE1Mi04YjFlLTRkM2EtOWEwZS01YzFkMmI3ZTlmMTAiLCJzaWQiOiJiMmU0ZjZhOC0xYzNkLTRlNWYtOGE3Yi05YzBkMWUyZjNhNGIifQ.assinatura-de-exemplo",
                     *       "token_acesso_expira_em": "2026-11-10T14:45:00-03:00",
                     *       "refresh_token": "rt_Qm7xVb3LpA0sTn5Wc8Hd1Yf4Ju6E9Zk2",
                     *       "aceites_pendentes": false
                     *     }
                     */
                    "application/json": components["schemas"]["SessaoAbertaComum"];
                };
            };
            400: components["responses"]["Erro400"];
            /** @description E-mail ou senha incorretos, sem dizer qual dos dois. Mesma resposta para e-mail não cadastrado. */
            401: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            /** @description Conta desativada por mudança de morador ou desligamento (RN-CD-07). Só sai depois de credenciais corretas (Proposta). */
            403: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            /** @description Acesso pausado por 15 minutos após 5 senhas erradas seguidas (SEG-04), ou limite de taxa. Vale igual para e-mail não cadastrado (Proposta). Traz `Retry-After`. */
            429: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    "Retry-After": components["headers"]["RetryAfter"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumRedefinirSenha: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "email": "ana.exemplo@example.com",
                 *       "codigo": "102938",
                 *       "nova_senha": "outra-senha-de-exemplo-456",
                 *       "dispositivo": {
                 *         "identificador_instalacao": "inst-8f3a2c1d-aparelho-exemplo",
                 *         "plataforma": "android"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["RedefinirSenhaComum"];
            };
        };
        responses: {
            /** @description Senha trocada, outras sessões encerradas e nova sessão aberta. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    /** @description Só na web: refresh token em cookie `httpOnly`, `Secure`, `SameSite=Lax` (ADR-007, Proposta). */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "token_acesso": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiIzZjZjMWE1Mi04YjFlLTRkM2EtOWEwZS01YzFkMmI3ZTlmMTAiLCJzaWQiOiJiMmU0ZjZhOC0xYzNkLTRlNWYtOGE3Yi05YzBkMWUyZjNhNGIifQ.assinatura-de-exemplo",
                     *       "token_acesso_expira_em": "2026-11-10T14:45:00-03:00",
                     *       "refresh_token": "rt_Hd1Yf4Ju6E9Zk2Qm7xVb3LpA0sTn5Wc8",
                     *       "aceites_pendentes": false
                     *     }
                     */
                    "application/json": components["schemas"]["SessaoAbertaComum"];
                };
            };
            400: components["responses"]["Erro400"];
            /** @description Código incorreto, vencido ou invalidado (RN-CD-02). Mesmas respostas para e-mail não cadastrado. */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumRenovar: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "refresh_token": "rt_9Zk2Qm7xVb3LpA0sTn5Wc8Hd1Yf4Ju6E"
                 *     }
                 */
                "application/json": components["schemas"]["RenovarComum"];
            };
        };
        responses: {
            /** @description Novo par de tokens. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    /** @description Só na web: novo refresh token em cookie `httpOnly`, `Secure`, `SameSite=Lax` (ADR-007, Proposta). */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "token_acesso": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiIzZjZjMWE1Mi04YjFlLTRkM2EtOWEwZS01YzFkMmI3ZTlmMTAiLCJzaWQiOiJiMmU0ZjZhOC0xYzNkLTRlNWYtOGE3Yi05YzBkMWUyZjNhNGIifQ.assinatura-de-exemplo",
                     *       "token_acesso_expira_em": "2026-11-10T15:00:00-03:00",
                     *       "refresh_token": "rt_Wc8Hd1Yf4Ju6E9Zk2Qm7xVb3LpA0sTn5",
                     *       "aceites_pendentes": false
                     *     }
                     */
                    "application/json": components["schemas"]["SessaoAbertaComum"];
                };
            };
            400: components["responses"]["Erro400"];
            /** @description Refresh token inválido, expirado, revogado ou reutilizado. O cliente volta ao login e depois à tela onde estava (UF 15). */
            401: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumSair: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "dispositivo_id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
                 *     }
                 */
                "application/json": components["schemas"]["SairComum"];
            };
        };
        responses: {
            /** @description Sessão encerrada. */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarAceitesPendentes: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de documentos pendentes. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "documento_versao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *           "documento_id": "7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18",
                     *           "tipo": "termos_de_uso",
                     *           "titulo": "Termos de uso",
                     *           "numero": 3,
                     *           "condominio_id": null,
                     *           "publicado_em": "2026-11-01T09:00:00-03:00",
                     *           "vigente_desde": "2026-11-05T00:00:00-03:00",
                     *           "conteudo_texto": "Texto de exemplo dos termos de uso.",
                     *           "arquivo_id": null
                     *         },
                     *         {
                     *           "documento_versao_id": "b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b",
                     *           "documento_id": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
                     *           "tipo": "regimento",
                     *           "titulo": "Regimento interno",
                     *           "numero": 2,
                     *           "condominio_id": "e6f7a8b9-c0d1-4e2f-a3b4-c5d6e7f8a9b0",
                     *           "publicado_em": "2026-10-20T09:00:00-03:00",
                     *           "vigente_desde": "2026-11-01T00:00:00-03:00",
                     *           "conteudo_texto": null,
                     *           "arquivo_id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["DocumentoPendenteComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumRegistrarAceites: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "documento_versao_ids": [
                 *         "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                 *         "b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b"
                 *       ]
                 *     }
                 */
                "application/json": components["schemas"]["RegistrarAceitesComum"];
            };
        };
        responses: {
            /** @description Aceites registrados. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "aceitos": [
                     *         {
                     *           "documento_versao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *           "aceito_em": "2026-11-10T14:35:00-03:00"
                     *         },
                     *         {
                     *           "documento_versao_id": "b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b",
                     *           "aceito_em": "2026-11-10T14:35:00-03:00"
                     *         }
                     *       ],
                     *       "pendentes_restantes": 0
                     *     }
                     */
                    "application/json": components["schemas"]["AceitesRegistradosComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            /** @description A versão enviada não é mais a vigente (RN-CD-03). */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumObterPerfil: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Perfil do usuário. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *       "nome": "Ana Exemplo",
                     *       "email": "ana.exemplo@example.com",
                     *       "tema_preferido": "aparelho"
                     *     }
                     */
                    "application/json": components["schemas"]["PerfilComum"];
                };
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumAtualizarPerfil: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "tema_preferido": "escuro"
                 *     }
                 */
                "application/json": components["schemas"]["AtualizarPerfilComum"];
            };
        };
        responses: {
            /** @description Perfil atualizado. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *       "nome": "Ana Exemplo",
                     *       "email": "ana.exemplo@example.com",
                     *       "tema_preferido": "escuro"
                     *     }
                     */
                    "application/json": components["schemas"]["PerfilComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarContextos: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de contextos. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "condominio_id": "e6f7a8b9-c0d1-4e2f-a3b4-c5d6e7f8a9b0",
                     *           "condominio_nome": "Residencial Jardim das Acácias",
                     *           "vinculo_condominio_id": "7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18",
                     *           "papeis": [
                     *             {
                     *               "papel": "morador",
                     *               "interface": "morador",
                     *               "funcao_mandato": null,
                     *               "em_substituicao": null
                     *             },
                     *             {
                     *               "papel": "subsindico",
                     *               "interface": "sindico",
                     *               "funcao_mandato": "subsindico",
                     *               "em_substituicao": false
                     *             }
                     *           ],
                     *           "unidades": [
                     *             {
                     *               "unidade_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *               "identificacao": "302",
                     *               "bloco_nome": "Bloco B",
                     *               "tipo_vinculo": "proprietario_representante",
                     *               "morador_habilitado": true
                     *             }
                     *           ]
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["ContextoComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarSessoes: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de sessões. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "id": "b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b",
                     *           "dispositivo_identificador": "inst-8f3a2c1d-aparelho-exemplo",
                     *           "expira_em": "2026-12-10T14:30:00-03:00",
                     *           "atual": true
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["SessaoComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumEncerrarSessao: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador da sessão. */
                sessao_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sessão encerrada. */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumRegistrarDispositivo: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "identificador_instalacao": "inst-8f3a2c1d-aparelho-exemplo",
                 *       "plataforma": "android",
                 *       "token_push": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
                 *     }
                 */
                "application/json": components["schemas"]["RegistrarDispositivoComum"];
            };
        };
        responses: {
            /** @description Aparelho registrado ou atualizado. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                     *       "identificador_instalacao": "inst-8f3a2c1d-aparelho-exemplo",
                     *       "plataforma": "android",
                     *       "ultima_atividade": "2026-11-10T14:30:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["DispositivoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumRemoverDispositivo: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador do aparelho. */
                dispositivo_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Token removido. */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarPreferenciasNotificacao: {
        parameters: {
            query: {
                /** @description Condomínio cujas preferências se quer ver. */
                condominio_id: components["schemas"]["Uuid"];
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Preferências do vínculo (lista completa, sem paginação). */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "preferencias": [
                     *         {
                     *           "tipo": "visitante",
                     *           "habilitada": true,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "reserva",
                     *           "habilitada": true,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "lembrete_reserva",
                     *           "habilitada": true,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "decisao_reclamacao",
                     *           "habilitada": true,
                     *           "obrigatoria": true,
                     *           "motivo_obrigatoria": "Você precisa ser avisado das decisões de reclamações contra você."
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["PreferenciasNotificacaoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumAtualizarPreferenciasNotificacao: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "condominio_id": "e6f7a8b9-c0d1-4e2f-a3b4-c5d6e7f8a9b0",
                 *       "preferencias": [
                 *         {
                 *           "tipo": "visitante",
                 *           "habilitada": false
                 *         },
                 *         {
                 *           "tipo": "lembrete_reserva",
                 *           "habilitada": true
                 *         }
                 *       ]
                 *     }
                 */
                "application/json": components["schemas"]["AtualizarPreferenciasNotificacaoComum"];
            };
        };
        responses: {
            /** @description Preferências atualizadas (lista completa, sem paginação). */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "preferencias": [
                     *         {
                     *           "tipo": "visitante",
                     *           "habilitada": false,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "reserva",
                     *           "habilitada": true,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "lembrete_reserva",
                     *           "habilitada": true,
                     *           "obrigatoria": false,
                     *           "motivo_obrigatoria": null
                     *         },
                     *         {
                     *           "tipo": "decisao_reclamacao",
                     *           "habilitada": true,
                     *           "obrigatoria": true,
                     *           "motivo_obrigatoria": "Você precisa ser avisado das decisões de reclamações contra você."
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["PreferenciasNotificacaoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description Tipo obrigatório não pode ser desligado (RF-NO-01, US-NO-01). */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarNotificacoes: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
                /** @description Só as notificações deste condomínio. */
                condominio_id?: components["schemas"]["Uuid"];
                /** @description Um ou mais tipos, separados por vírgula. */
                tipo?: components["schemas"]["TipoNotificacaoComum"][];
                /** @description Se verdadeiro, só as ainda não lidas. A marcação como lida ainda não tem operação (lacuna). */
                nao_lidas?: boolean;
                /** @description Ordenação. Padrão `-criada_em`. */
                ordenar?: "criada_em" | "-criada_em";
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de notificações. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "id": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
                     *           "condominio_id": "e6f7a8b9-c0d1-4e2f-a3b4-c5d6e7f8a9b0",
                     *           "tipo": "visitante",
                     *           "texto_seguro": "Você tem uma atualização.",
                     *           "criada_em": "2026-11-10T14:20:00-03:00",
                     *           "lida_em": null,
                     *           "referencia": {
                     *             "entidade": "visita",
                     *             "id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10"
                     *           }
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["NotificacaoComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarPedidosLgpd: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
            };
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de pedidos. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "id": "7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18",
                     *           "tipo": "copia_dados",
                     *           "estado": "solicitado",
                     *           "solicitado_em": "2026-11-10T14:30:00-03:00",
                     *           "concluido_em": null,
                     *           "prazo_envio_ate": "2026-11-25T14:30:00-03:00",
                     *           "administradora_avisada": null
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["PedidoLgpdComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumCriarPedidoLgpd: {
        parameters: {
            query?: never;
            header?: {
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarPedidoLgpdComum"];
            };
        };
        responses: {
            /** @description Pedido recebido; o processamento é assíncrono. */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18",
                     *       "tipo": "copia_dados",
                     *       "estado": "solicitado",
                     *       "solicitado_em": "2026-11-10T14:30:00-03:00",
                     *       "concluido_em": null,
                     *       "prazo_envio_ate": "2026-11-25T14:30:00-03:00",
                     *       "administradora_avisada": null
                     *     }
                     */
                    "application/json": components["schemas"]["PedidoLgpdComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            /** @description Confirmação com a senha falhou (UF 14.1). */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumPedirEnvioArquivo: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "modulo": "comprovante_lancamento",
                 *       "tipo_midia": "application/pdf",
                 *       "tamanho_bytes": 482113,
                 *       "hash_conteudo": "sha256:9f2c1ab4d7e3",
                 *       "alvo": null
                 *     }
                 */
                "application/json": components["schemas"]["PedirEnvioArquivoComum"];
            };
        };
        responses: {
            /** @description URL assinado de envio. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "arquivo_id": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
                     *       "metodo": "PUT",
                     *       "url_envio": "https://armazenamento.exemplo.invalid/c/envio-assinado?assinatura=exemplo",
                     *       "cabecalhos": {
                     *         "Content-Type": "application/pdf"
                     *       },
                     *       "expira_em": "2026-11-10T14:40:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["EnvioArquivoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description Tipo ou tamanho fora do limite do módulo. */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumConfirmarEnvioArquivo: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador devolvido no pedido de envio. */
                arquivo_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Arquivo registrado. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
                     *       "modulo": "comprovante_lancamento",
                     *       "tipo_midia": "application/pdf",
                     *       "tamanho_bytes": 482113,
                     *       "hash_conteudo": "sha256:9f2c1ab4d7e3",
                     *       "criado_em": "2026-11-10T14:33:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["ArquivoComum"];
                };
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description O objeto não foi enviado ou o conteúdo não confere com o pedido. */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumPedirLeituraArquivo: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador do arquivo. */
                arquivo_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description URL assinado de leitura. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "arquivo_id": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
                     *       "url_leitura": "https://armazenamento.exemplo.invalid/c/leitura-assinada?assinatura=exemplo",
                     *       "expira_em": "2026-11-10T14:38:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["LeituraArquivoComum"];
                };
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumObterScore: {
        parameters: {
            query: {
                /** @description Qual score se quer ver. */
                escopo: "proprio" | "sindico" | "funcionario" | "funcionarios" | "reclamacao";
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
                /** @description Obrigatório em `escopo=funcionario`. */
                funcionario_id?: components["schemas"]["Uuid"];
                /** @description Obrigatório em `escopo=reclamacao`. */
                reclamacao_id?: components["schemas"]["Uuid"];
                /** @description Obrigatório em `escopo=reclamacao`: de quem é o score. */
                parte?: "reclamante" | "alvo";
            };
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description **Proposta.** Forma **opcional** do cabeçalho de unidade ativa: use onde a unidade não é
                 *     indispensável à operação. Onde a operação depende da unidade, use `UnidadeIdObrigatorio`.
                 *     Só existe nos perfis com unidade (morador, proprietário não residente e, quando agem como
                 *     morador, síndico, subsíndico e conselho fiscal). A API valida o vínculo do usuário com a unidade.
                 */
                "X-Unidade-Id"?: components["parameters"]["UnidadeId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Score do escopo pedido (objeto único) ou, em `escopo=funcionarios`, página de scores de funcionários. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScoreComum"] | components["schemas"]["ListaScoresFuncionariosComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description O perfil do chamador ou do titular não tem score (RN-SC-01). */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarMovimentosScore: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
                /** @description Data inicial, inclusive (aaaa-mm-dd). */
                de?: components["schemas"]["Data"];
                /** @description Data final, inclusive (aaaa-mm-dd). */
                ate?: components["schemas"]["Data"];
                /** @description Ordenação. Padrão `-registrado_em`. */
                ordenar?: "registrado_em" | "-registrado_em";
            };
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description **Proposta.** Forma **opcional** do cabeçalho de unidade ativa: use onde a unidade não é
                 *     indispensável à operação. Onde a operação depende da unidade, use `UnidadeIdObrigatorio`.
                 *     Só existe nos perfis com unidade (morador, proprietário não residente e, quando agem como
                 *     morador, síndico, subsíndico e conselho fiscal). A API valida o vínculo do usuário com a unidade.
                 */
                "X-Unidade-Id"?: components["parameters"]["UnidadeId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de movimentos. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "id": "7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18",
                     *           "registrado_em": "2026-11-02T00:10:00-03:00",
                     *           "origem_tipo": "reclamacao_validada",
                     *           "pontos_efetivos": -10,
                     *           "saldo_depois": 85,
                     *           "motivo": "Reclamação validada: barulho após o horário permitido."
                     *         },
                     *         {
                     *           "id": "b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b",
                     *           "registrado_em": "2026-09-14T00:10:00-03:00",
                     *           "origem_tipo": "recuperacao",
                     *           "pontos_efetivos": 5,
                     *           "saldo_depois": 95,
                     *           "motivo": "Dois meses de regularidade."
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["MovimentoScoreComum"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumCriarRecurso: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "reclamacao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                 *       "justificativa": "O ruído registrado foi de uma obra autorizada pelo condomínio."
                 *     }
                 */
                "application/json": components["schemas"]["CriarRecursoComum"];
            };
        };
        responses: {
            /** @description Recurso registrado. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                     *       "reclamacao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *       "solicitado_em": "2026-11-10T14:30:00-03:00",
                     *       "justificativa": "O ruído registrado foi de uma obra autorizada pelo condomínio.",
                     *       "julgador_papel": "subsindico",
                     *       "resultado": null,
                     *       "decidido_em": null,
                     *       "fundamentacao": null,
                     *       "estado_reclamacao": "em_recurso"
                     *     }
                     */
                    "application/json": components["schemas"]["RecursoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description Já existe recurso para esta decisão (RN-RC-07: uma vez). */
            409: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            /** @description Recurso fora do prazo ou não admitido (RN-RC-07, tabela 5.3). */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumObterRecurso: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador do recurso. */
                recurso_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Recurso. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                     *       "reclamacao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *       "solicitado_em": "2026-11-10T14:30:00-03:00",
                     *       "justificativa": "O ruído registrado foi de uma obra autorizada pelo condomínio.",
                     *       "julgador_papel": "subsindico",
                     *       "resultado": "aceito",
                     *       "decidido_em": "2026-11-12T10:00:00-03:00",
                     *       "fundamentacao": "A obra tinha autorização registrada.",
                     *       "estado_reclamacao": "recurso_aceito"
                     *     }
                     */
                    "application/json": components["schemas"]["RecursoComum"];
                };
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumDecidirRecurso: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador do recurso. */
                recurso_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "resultado": "negado",
                 *       "fundamentacao": "Decisão mantida: a autorização não cobria o horário."
                 *     }
                 */
                "application/json": components["schemas"]["DecidirRecursoComum"];
            };
        };
        responses: {
            /** @description Recurso decidido. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                     *       "reclamacao_id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10",
                     *       "solicitado_em": "2026-11-10T14:30:00-03:00",
                     *       "justificativa": "O ruído registrado foi de uma obra autorizada pelo condomínio.",
                     *       "julgador_papel": "subsindico",
                     *       "resultado": "negado",
                     *       "decidido_em": "2026-11-12T10:00:00-03:00",
                     *       "fundamentacao": "Decisão mantida: a autorização não cobria o horário.",
                     *       "estado_reclamacao": "encerrada"
                     *     }
                     */
                    "application/json": components["schemas"]["RecursoComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            /** @description Sem permissão para julgar este recurso, por papel ou por ser parte da reclamação (RN-RC-14). */
            403: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            404: components["responses"]["Erro404"];
            /** @description O recurso já foi decidido. */
            409: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumDenunciarConteudo: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "origem": {
                 *         "tipo": "mensagem_comunicado",
                 *         "id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10"
                 *       },
                 *       "motivo": "Texto ofensivo em resposta a comunicado."
                 *     }
                 */
                "application/json": components["schemas"]["CriarDenunciaComum"];
            };
        };
        responses: {
            /** @description Denúncia registrada. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "d1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                     *       "origem": {
                     *         "tipo": "mensagem_comunicado",
                     *         "id": "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10"
                     *       },
                     *       "motivo": "Texto ofensivo em resposta a comunicado.",
                     *       "criada_em": "2026-11-10T14:30:00-03:00"
                     *     }
                     */
                    "application/json": components["schemas"]["DenunciaComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            /** @description Conteúdo de tipo válido que não pode ser denunciado por este usuário ou neste estado. */
            422: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Erro"];
                };
            };
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumConsultarNotasDosSetores: {
        parameters: {
            query?: {
                /** @description **Proposta.** Mês no formato aaaa-mm; padrão: último mês fechado. Mês futuro ou ainda não fechado: comportamento é lacuna. */
                competencia?: string;
            };
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Notas dos setores. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "competencia": "2026-10",
                     *       "setores": [
                     *         {
                     *           "setor": "Limpeza",
                     *           "publicada": true,
                     *           "nota": 3.7,
                     *           "rotulo": null
                     *         },
                     *         {
                     *           "setor": "Portaria",
                     *           "publicada": false,
                     *           "nota": null,
                     *           "rotulo": "Nota não publicada este mês: poucas avaliações."
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["NotasSetoresComum"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarDenunciasRecebidas: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
            };
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página autorizada com projeções protegidas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: {
                            id: components["schemas"]["Uuid"];
                            /** @description Texto com identidades protegidas removidas; não é o objeto original. */
                            conteudo_projetado: string;
                            motivo: string;
                        }[];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            409: components["responses"]["Erro409"];
            422: components["responses"]["Erro422"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumDecidirDenuncia: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
                /**
                 * @description Chave de idempotência por requisição, opcional, nos POST que cobram ou reservam
                 *     (**Proposta técnica, fora das RN**; `01-backend.md` 4.6). Repetir a mesma chave com o mesmo
                 *     corpo devolve a resposta original sem repetir o efeito. O tempo de guarda é lacuna.
                 */
                "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
            };
            path: {
                /** @description Identificador do recurso no escopo autorizado. */
                denuncia_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description Códigos propostos para os resultados aprovados.
                     * @enum {string}
                     */
                    resultado: "sem_acao" | "ocultar";
                    motivo: string;
                };
            };
        };
        responses: {
            /** @description Ação registrada com autoria e auditoria, sem corpo. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            409: components["responses"]["Erro409"];
            422: components["responses"]["Erro422"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumListarEleicoes: {
        parameters: {
            query?: {
                /** @description Itens por página. Padrão 20, máximo 100 (Proposta). */
                limite?: components["parameters"]["Limite"];
                /** @description Cursor opaco devolvido em `paginacao.proximo_cursor`. Não interpretar nem montar. */
                cursor?: components["parameters"]["Cursor"];
                /** @description Ordenação. Padrão `-candidaturas_inicio`. */
                ordenar?: "candidaturas_inicio" | "-candidaturas_inicio";
            };
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de eleições. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "dados": [
                     *         {
                     *           "id": "000002bc-1111-4222-8333-0000000002bc",
                     *           "candidaturas_inicio": "2026-11-12T08:00:00-03:00",
                     *           "candidaturas_fim": "2026-11-19T18:00:00-03:00",
                     *           "estado": "candidaturas_abertas",
                     *           "candidaturas": [
                     *             {
                     *               "id": "000002c6-1111-4222-8333-0000000002c6",
                     *               "cargo": "sindico",
                     *               "candidato_nome": "Otávio Brandão",
                     *               "unidade_identificacao": "Bloco C, 502",
                     *               "estado": "aceita",
                     *               "motivo_inelegibilidade": null
                     *             }
                     *           ],
                     *           "resultado": null
                     *         }
                     *       ],
                     *       "paginacao": {
                     *         "proximo_cursor": null,
                     *         "tem_mais": false
                     *       }
                     *     }
                     */
                    "application/json": {
                        dados: components["schemas"]["EleicaoSindico"][];
                        paginacao: components["schemas"]["Paginacao"];
                    };
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumAbrirEleicao: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "candidaturas_inicio": "2026-11-12T08:00:00-03:00",
                 *       "candidaturas_fim": "2026-11-19T18:00:00-03:00"
                 *     }
                 */
                "application/json": components["schemas"]["AbrirEleicaoSindico"];
            };
        };
        responses: {
            /** @description Eleição aberta. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "000002bc-1111-4222-8333-0000000002bc",
                     *       "candidaturas_inicio": "2026-11-12T08:00:00-03:00",
                     *       "candidaturas_fim": "2026-11-19T18:00:00-03:00",
                     *       "estado": "candidaturas_abertas",
                     *       "candidaturas": [],
                     *       "resultado": null
                     *     }
                     */
                    "application/json": components["schemas"]["EleicaoSindico"];
                };
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            422: components["responses"]["Erro422Eleicao"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumEncerrarEleicao: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
                /**
                 * @description Chave de idempotência por requisição, opcional, nos POST que cobram ou reservam
                 *     (**Proposta técnica, fora das RN**; `01-backend.md` 4.6). Repetir a mesma chave com o mesmo
                 *     corpo devolve a resposta original sem repetir o efeito. O tempo de guarda é lacuna.
                 */
                "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
            };
            path: {
                /** @description Identificador do recurso no escopo autorizado. */
                eleicao_id: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ação registrada com autoria e auditoria, sem corpo. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Erro400"];
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            409: components["responses"]["Erro409"];
            422: components["responses"]["Erro422"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumObterEleicao: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description **Proposta.** Condomínio ativo da requisição. Obrigatório nas operações que o declaram;
                 *     não vale para `/v1/acesso/*` nem para `/v1/eu/*` (guia, seção 3). A API valida que o usuário tem vínculo válido com ele;
                 *     senão responde `403` (guard de contexto). Recurso de outro condomínio responde `404`.
                 */
                "X-Condominio-Id": components["parameters"]["CondominioId"];
                /**
                 * @description Versão do app que chama. Abaixo do mínimo, a API responde `426` (Proposta). A política de
                 *     versão mínima é lacuna: nenhum número está definido, e o comportamento quando o cabeçalho
                 *     falta também (lacuna).
                 */
                "X-App-Version"?: components["parameters"]["AppVersion"];
            };
            path: {
                /** @description Identificador da eleição. */
                eleicao_id: components["parameters"]["EleicaoId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Eleição. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "000002bc-1111-4222-8333-0000000002bc",
                     *       "candidaturas_inicio": "2026-11-12T08:00:00-03:00",
                     *       "candidaturas_fim": "2026-11-19T18:00:00-03:00",
                     *       "estado": "candidaturas_abertas",
                     *       "candidaturas": [
                     *         {
                     *           "id": "000002c6-1111-4222-8333-0000000002c6",
                     *           "cargo": "sindico",
                     *           "candidato_nome": "Otávio Brandão",
                     *           "unidade_identificacao": "Bloco C, 502",
                     *           "estado": "aceita",
                     *           "motivo_inelegibilidade": null
                     *         }
                     *       ],
                     *       "resultado": null
                     *     }
                     */
                    "application/json": components["schemas"]["EleicaoSindico"];
                };
            };
            401: components["responses"]["Erro401"];
            403: components["responses"]["Erro403"];
            404: components["responses"]["Erro404"];
            426: components["responses"]["Erro426"];
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
    comumConsultarSaude: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description API disponível. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "estado": "disponivel",
                     *       "versao": "0.1.0"
                     *     }
                     */
                    "application/json": components["schemas"]["SaudeComum"];
                };
            };
            429: components["responses"]["Erro429"];
            500: components["responses"]["Erro500"];
            503: components["responses"]["Erro503"];
        };
    };
}
