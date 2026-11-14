# LGPD — CondomiFacil

**Data:** 14/11/2026. **Estado:** proposta para revisão de Pedro Lemos e assessoria jurídica.

O CondomiFacil está na fase de Design, sem backend, aplicativo ou banco implementados. Este documento descreve o tratamento **planejado**, consolida regras existentes e apresenta inventário, RIPD preliminar, minutas de política de privacidade e termos, atendimento aos titulares e estrutura contratual. Não é política publicada, contrato assinado, parecer jurídico ou comprovação de conformidade.

## 1. Fontes, limites e governança

| Fonte interna | Aplicação |
| --- | --- |
| [PRD](../01-produto/02-prd.md), seções 3, 4, 7 e 8 | Perfis; RF-LG-01/02; SEG-01 a 18; backups |
| [Regras de negócio](../01-produto/03-regras-de-negocio.md), capítulos de cadastro, visitantes, offline, score, pesquisa, finanças e relatórios | Finalidade, vínculo, acesso, anonimização e efeitos de desligamento |
| [Histórias de usuário](../01-produto/04-historias-de-usuario.md), US-LG-01, e [User Flows](../02-design/02-user-flows.md), seção 14 | Cópia de dados e exclusão; exceções ainda sem operador definido |
| [MER/DER](../04-banco-de-dados/01-mer-e-der.md), seções 4, 6 e 9, e [política de acesso](../04-banco-de-dados/02-politica-de-acesso-a-dados.md), seções 6 a 8 | Inventário lógico; cópias; P-07, P-09 e P-12; projeções protegidas |
| [Arquitetura](../03-arquitetura/01-arquitetura.md), seções 4, 6 e 7, e [ADRs](../03-arquitetura/adr/README.md) | Infraestrutura, integrações, região, isolamento e sigilo |
| [Integrações externas](../05-backend/api/03-integracoes-externas.md), [frontend](../06-frontend/frontend.md) e [painel web](../06-frontend/painel-web.md) | Provedores, dados locais e exportações |
| [Segurança](seguranca.md) | Autenticação, RLS, criptografia, segredos, prevenção e resposta a incidentes |

O grafo foi consultado como índice de relações; as fontes acima prevalecem e incluem as atualizações de autogestão/eleições de 13/11/2026 e relatórios de 14/11/2026. Apenas os ADRs 002, 004 e 005 foram aceitos com ressalvas. A aprovação deste texto não é aceitação dos demais ADRs.

**Regra vigente** é requisito já documentado. **Hipótese jurídica** é enquadramento a confirmar por finalidade e agente. **Proposta operacional** é procedimento ainda a implementar. **Pendência** não autoriza acesso, guarda indefinida ou coleta adicional. O jurídico deve revisar as referências oficiais da seção 10 antes do piloto e quando houver mudança normativa.

## 2. Agentes de tratamento e responsabilidades

SEG-14 prevê o condomínio como controlador e a plataforma como operadora das operações condominiais. O enquadramento deve refletir quem decide finalidade e meios essenciais em cada operação, não somente o nome do contrato. A orientação da ANPD admite cadeias com suboperadores e diferencia atuação subordinada de empregados da posição de agente de tratamento. [Guia de agentes da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_agentes_de_tratamento_e_encarregado___defeso_eleitoral.pdf).

| Participante | Papel previsto e pontos a confirmar no contrato |
| --- | --- |
| Condomínio | Controlador das rotinas condominiais; aprova finalidades, necessidade, instruções, retenção e atendimento de direitos |
| Plataforma CondomiFacil | Operadora quando executa instruções do condomínio. Eventual controle próprio sobre contratação, obrigações próprias ou segurança precisa de finalidade/base/inventário separado, sem reutilizar dados condominiais livremente |
| Administradora | Atua conforme mandato e contrato do condomínio; definir se operadora, controladora independente ou conjunta em cada finalidade. Seu perfil no app não resolve essa classificação |
| Gestão local na autogestão | Representa o condomínio dentro dos poderes definidos; não se torna controladora pessoal de toda a base. Distribuição fina de poderes continua pendente no registro de autogestão |
| Equipe no Gestão + Suporte | Atua nos limites do plano, condomínio e função; sem reclamações/scores. Não confundir atendimento administrativo com atendimento jurídico de direitos |
| Asaas | Avaliar papel por cobrança, KYC, prevenção à fraude e deveres próprios; não presumir que todas as operações são de suboperador |
| Supabase, Render, Resend, Expo/FCM e demais fornecedores | Mapear serviço, dados, instruções, subcontratados e países; confirmar papel e contrato por serviço. Referências técnicas não substituem diligência jurídica |

A função técnica de operador para exceções de pedidos LGPD ainda não foi definida no produto. O termo **operador da LGPD**, como agente contratual, não cria esse perfil no aplicativo. Não conceder automaticamente acesso ao suporte ou ao Admin da plataforma. Encarregado/canal de privacidade e substitutos precisam ser designados ou ter eventual dispensa juridicamente fundamentada; não presumir enquadramento como pequeno porte.

## 3. Inventário de dados pessoais e bases legais

### 3.1 Critérios de leitura

As linhas abaixo são um registro preliminar de operações, não autorização para criar campos. Dados opcionais só são coletados quando necessários à função prevista. O modelo lógico é proposta: campos finais, fontes efetivas, compartilhamento e retenção precisam ser confirmados no modelo físico.

**Legenda das hipóteses:** B2 = art. 7º, II; B5 = art. 7º, V; B6 = art. 7º, VI; B9 = art. 7º, IX, sujeito a balanceamento. Nenhuma hipótese está aprovada por este documento. B2 exige identificar obrigação concreta; B5 exige contrato/procedimento do qual o titular seja parte; B6 exige conexão com exercício de direitos; B9 exige finalidade legítima, necessidade e salvaguardas. O contrato condomínio–plataforma não torna B5 aplicável automaticamente a moradores, visitantes ou funcionários. Referência: [LGPD, arts. 7º e 10](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html).

Para B9, documentar finalidade, necessidade, expectativas, impactos, alternativas e balanceamento. A ANPD esclarece que legítimo interesse não se aplica a dados sensíveis. Aceitar termos/receber aviso de privacidade não equivale a consentir em todas as operações. [Orientação da ANPD sobre legítimo interesse](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse).

### 3.2 Operações previstas

| Operação e titulares | O que trata e de onde vem | Por que trata / destinatários limitados | Hipótese jurídica a validar | Retenção e destino |
| --- | --- | --- | --- | --- |
| Identidade e acesso — usuários de todos os perfis | Nome, e-mail, hash de senha, desafios, sessão, identificador de dispositivo quando previsto; pré-cadastro e interação do titular | Habilitar acesso, recuperar conta, prevenir uso indevido; API e titular; cadastro autorizado recebe projeção mínima | B5 quando cabível; B9 para segurança; B2 apenas se obrigação identificada | Desafio válido 15 min; expiração não define prazo de expurgo. Sessões/contadores e identidade após fim do vínculo: P-09, sem guarda eterna |
| Vínculos, moradia e locação — proprietários, inquilinos e dependentes | Unidade, tipo de vínculo, episódio, responsável, vigências e condições de locação previstas; administração/titular | Resolver habilitação, representação, cobrança e efeitos do fim de contrato; acessos por unidade/função | B2 com dever condominial identificado; B5/B9 conforme relação concreta | Encerrar acesso não elimina identidade global nem história de outros condomínios; prazo histórico a definir por finalidade |
| Trabalho, gestão e mandatos — funcionários e gestores | Setor, blocos atendidos, função, mandato, substituição e concessão eleitoral; gestão autorizada | Distribuir tarefas e autorizar ações vigentes; sem autoconcessão de acesso | B5 quando relação contratual do titular; B2/B9 conforme finalidade | Desligar/encerrar mandato retira poder, preserva fatos atribuídos; duração identificável pendente |
| Aceites e documentos — usuários e representantes | Versão de termos, privacidade, regimento e termo de conta PF; usuário, data, versão/contexto | Transparência e prova de aceite; titular e operação autorizada | B5/B6; B2 quando obrigação identificada | Versão publicada imutável; prazo probatório a validar. Não adicionar IP por padrão: MER não o exige |
| Visitantes, hóspedes e prestadores | Nome, documento quando cabível, unidade, período, entradas/saídas e autoria do registro; morador/portaria | Autorizar e registrar acesso; unidade e portaria nos blocos autorizados | B9 com teste específico de necessidade, inclusive documento; B6 para fato litigioso delimitado | SEG-10: anonimizar após seis meses; parametrização RN 8.4 sujeita a limites legais. Aplicar a anexos e identificadores relacionados |
| Modelos, recorrentes e bloqueio de entrada | Listas salvas, nomes/documentos, recorrência, motivo e decisão de bloqueio; solicitante/gestão/portaria | Reutilizar autorização e tratar restrição com análise de homônimos; sem cadastro global de visitantes | B9 com balanceamento reforçado; B6 em caso concreto | Modelos apagados na saída/troca de unidade; recorrentes encerradas. Retenção identificável de bloqueios/modelos e compatibilidade com seis meses exigem revisão |
| Reservas e vistorias — responsáveis e agentes | Área, data, unidade, uso, checklist, fotos, danos, faltas e pagamentos associados; titular/portaria/limpeza/gateway | Operar área, verificar uso e efeitos de cobrança; calendário público sem identidade alheia | B5 se cabível; B9; B6 para evidência necessária | Período operacional não é expurgo; retenção de fotos/faltas/pagamento a definir por finalidade |
| Encomendas e entregas esperadas | Remetente, unidade, descrição, foto de etiqueta opcional, retirante, funcionários e horários; titular/portaria | Receber, localizar e comprovar entrega/devolução; unidade e funções autorizadas | B9; B6 em disputa delimitada | Prazo de exibição não é retenção física. Etiquetas podem conter dados de terceiros; minimizar foto e definir expurgo |
| Chamados, conclusões e atendimento | Autor, local, descrição/fotos, atendente/empresa, horários, avaliação e comentário; usuário/funcionário | Executar serviço e avaliar ciclo efetivo; agregados do funcionário sem autor/local recuperáveis | B5 quando cabível; B9/B6 segundo finalidade | Avaliação superada preservada no histórico, fora das médias; duração identificável e anexos pendentes |
| Reclamações, recursos e score | Identidade separada do reclamante, alvo, descrição, anexos, defesa, julgador, decisões e movimentos por episódio/unidade; envolvidos/gestão | Apurar conflito, permitir defesa e aplicar regras; suporte sem acesso; alvo sem identidade do reclamante | B9/B6 são hipóteses sujeitas ao parecer SEG-16; sensíveis incidentais exigem art. 11 | Exclusão preserva fatos sem identificação, conforme produto; duração e técnica de anonimização precisam validar defesa, prova e sigilo |
| Pesquisa mensal de funcionários | Respostas, notas e identificador HMAC proposto; avaliador/servidor | Medir atendimento sem expor avaliador; limites de agregação conforme RN | B9 e teste de balanceamento; não enquadrar como pesquisa acadêmica | Histórico previsto, prazo não definido. HMAC/rotação e acesso às próprias respostas são P-12; pseudônimo não prova anonimização |
| Comunicação e reuniões | Mensagens, sugestões, comentários, convocação, candidaturas, presença e arquivos de ata anexados; participantes/gestão | Informar e conduzir deliberações; acesso por destinatário e contexto | B2 quando dever identificado; B9/B6; B5 quando cabível | Definir retenção por mensagem/documento; conteúdo pode identificar terceiros mesmo após troca de nome |
| Votação | Participação da unidade e conteúdo do voto em registros separados; titular/condutor autorizado | Controlar elegibilidade e apuração sigilosa; resultado apenas ao encerrar | B2/B9/B6 conforme dever e exercício de direitos a validar | Voto continua sem identificação na exclusão; não há cópia individual da opção em exportação. Prazo e correlação residual: ADR-009/P-03 |
| Cobrança e pagamento — responsáveis financeiros | Unidade, responsabilidade, valores, vencimento, situação, referências de transação e conta recebedora; cadastro/gateway | Cobrar, conciliar, devolver e provar pagamento; acesso SEG-17 | B2 se dever definido; B5 quando cabível; B6; KYC do gateway exige análise própria | Não guardar cartão na plataforma. Campos enviados ao Asaas e retenção financeira/bancária pendentes; não aplicar seis meses de visitantes |
| Finanças e fornecedores | Autoria, lançamentos, comprovantes, comentários e contato pessoal de fornecedor quando existente; executor/gateway | Gerir receitas/despesas e fiscalizar; receitas automáticas agregadas, folha só total | B2/B6 com fundamento concreto; B9; B5 quando cabível | Mês fechado imutável e estornos não equivalem a retenção eterna; prazo por evidência e finalidade ainda pendente |
| Notificações, preferências e dispositivos | Token push, destinatário, preferências e estado de entrega; titular/app/servidor | Entregar avisos previstos; provedores recebem mínimo, texto genérico em tela bloqueada | Herda finalidade do aviso; B9 para entrega/segurança a justificar | Revogar token/contexto quando necessário; validade de aviso não fixa retenção dos recibos |
| Relatórios e exportações | Filtros, solicitante, referência de cálculo, arquivo privado e eventos de acesso; administradora/worker | Nove relatórios MVP, sem ampliar domínio; agregados não dispensam análise de reidentificação | Herda base de cada finalidade; avaliar necessidade da nova cópia | RN-RL-08: prazo do arquivo/link/job e pequenos grupos pendentes; revogação bloqueia novos downloads, sem apagar cópia já baixada |
| Operação, auditoria e pedidos LGPD | Ator, contexto, ação, correlação, erros sanitizados, protocolo, decisão e evidência mínima; serviços/titular | Segurança, prova de atuação, atendimento e incidentes; acesso técnico delimitado | B2/B6/B9 conforme cada registro | P-09 para logs/auditoria/pedidos; registro de incidente tem regra específica da seção 8. Payload completo não é evidência obrigatória por padrão |

CPF, e-mail, dados financeiros e score exigem proteção, mas não são automaticamente dados sensíveis na classificação legal. Textos, fotos e anexos podem revelar saúde, religião, origem racial ou outros dados do art. 11; nesses casos não aplicar B9 como atalho: identificar hipótese adequada, necessidade, acesso e minimização antes de tratar. Não há escopo aprovado de biometria, reconhecimento facial, geolocalização contínua, publicidade comportamental ou venda de dados.

Dependentes e visitantes podem ser crianças/adolescentes. Avaliar melhor interesse, representação e transparência adequada, sem criar coleta de certidão/documento por conveniência. O Enunciado ANPD nº 1/2023 admite análise das hipóteses dos arts. 7º/11, sempre com prevalência do melhor interesse; não impor consentimento parental como fundamento automático de toda operação. [Enunciado oficial](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/tratamento_de_dados_de_criancas_e_adolescentes.pdf).

### 3.3 Cópias, fornecedores e transferências

| Destino previsto | Dados/finalidade a registrar e validar |
| --- | --- |
| PostgreSQL/Storage e API/worker | Identidade e dados operacionais sob isolamento; Supabase São Paulo planejado; Render não garante residência integral no Brasil. Revisar acesso remoto, logs e subprocessadores |
| Asaas | Dados mínimos do pagador/recebedor e transação; inventário exato de criação de cliente/KYC continua pendente nas integrações; cartão inserido no ambiente do gateway |
| Resend | Endereço, conteúdo mínimo e eventos de e-mail; código/comprovante/link LGPD. ADR-005 registra transferência para fora do Brasil; não enviar arquivo completo como anexo |
| Expo/FCM e serviço de entrega iOS | Token e carga mínima de push; identificar cadeia, países e retenção contratual |
| Sentry | Erros sanitizados; sem nome, e-mail, documento, conteúdo de reclamação/avaliação/voto; validar coleta automática e metadados antes de ligar |
| Aparelho e exportação baixada | Recorte offline/filas ou cópia pessoal autorizada; aplicar proteção e guarda do destinatário, sem prometer apagamento remoto |

Região do banco não comprova residência de toda a cadeia. Registrar exportador/importador, países, finalidades, dados, acesso de suporte, retenção e instrumento válido. Hipótese do tratamento e mecanismo de transferência são verificações distintas; consentir nos termos não resolve ambas. Cláusulas-padrão, quando escolhidas, devem observar o texto e requisitos da ANPD, sem reescrita livre. [Resolução ANPD nº 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024).

### 3.4 Retenção, desligamento e anonimização

Regras já existentes: visitante com padrão de seis meses; cache de consulta cifrado apagado no logout/fim do dia; fila pendente separada e protegida, sem descarte silencioso; backup diário com sete dias e restauração mensal. Prazos para fila, auditoria, finanças, anexos, pesquisa e exportações continuam pendentes. O fim do vínculo retira acesso; exclusão global da conta é procedimento distinto.

Proposta: cada item do inventário terá evento inicial, duração, fundamento, destino, execução verificável e exceção de preservação com motivo/revisão. Anonimizar exige tratar identificadores, relações, horários, texto livre, fotos e cópias; hash/HMAC não basta. Ao restaurar backup, reaplicar exclusões e revogações antes da liberação. Exceções legais devem ser documentadas por conjunto, com acesso restrito; não transformar “histórico” ou “auditoria” em justificativa universal de conservação.

## 4. RIPD preliminar do MVP

### 4.1 Identificação e método

**Objeto:** operações condominiais do inventário, incluindo portaria offline, conflitos/score, pesquisas, votação, cobrança e exportações. **Responsável pela análise:** controlador de cada condomínio, com auxílio técnico da plataforma e assessoria jurídica; identidades, consulta ao encarregado e aprovação nominal ainda pendentes. **Titulares:** moradores, proprietários não residentes, dependentes, visitantes, funcionários, gestores, representantes e terceiros identificáveis em conteúdo.

O dimensionamento de referência do PRD é 100 condomínios/15.000 usuários, incluindo cenário de 5.000 unidades e dez portarias; não é volume real já tratado. Número de visitantes, menores, arquivos e frequência efetiva precisam ser estimados por piloto. O fluxo previsto é coleta → validação/API → persistência isolada → uso por perfil → cópias mínimas/integrações → retenção/anonimização, com filas locais e restauração incluídas.

A ANPD recomenda avaliação antes do tratamento, com descrição, necessidade/proporcionalidade, riscos e salvaguardas. A responsabilidade é do controlador; operações diferentes podem exigir RIPDs específicos e a plataforma compartilhada não elimina a análise de cada condomínio. Não há envio automático obrigatório de todo RIPD à ANPD. Esta versão prepara essa análise, sem declarar aprovação. [Orientações oficiais sobre RIPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd).

**Método proposto:** estimar probabilidade (baixa/média/alta) e impacto nos titulares; impacto alto inclui discriminação, retaliação, restrição indevida de serviço, fraude ou risco físico. A classificação abaixo é conservadora, qualitativa e sem medição em sistema implementado. Não reduzimos risco só porque um controle está escrito. Registrar risco residual e aceitante depois de testar as medidas; nenhum residual está aceito aqui.

### 4.2 Necessidade e proporcionalidade

| Tratamento | Justificativa e alternativa a avaliar |
| --- | --- |
| Identificação/controle de acesso | Nome/unidade/período atendem autorização; justificar documento e sua exibição por caso. Não ampliar para biometria ou histórico global |
| Conflitos e score | Parecer SEG-16 deve demonstrar necessidade, salvaguardas de defesa e proporcionalidade dos bloqueios; avaliar redução de conteúdo identificável e projeções por papel |
| Votos e pesquisa | Separar autoria/conteúdo conforme finalidade; evitar relacionamentos de reidentificação e granularidade desnecessária; resolver recuperação pessoal sem abrir autoria alheia |
| Cobrança/finanças | Identificação individual apenas onde cobrança exige; fiscalização e receitas agregadas; conta bancária e comprovante restritos |
| Offline e relatórios | Recorte do dia/blocos em vez de base inteira; formato e job privado não ampliam permissão; limitar cópias, período e pequenos grupos com validação |

### 4.3 Matriz inicial de riscos aos titulares

| Risco / dano | Probabilidade e impacto inerentes estimados | Salvaguarda prevista e evidência necessária | Residual e encaminhamento |
| --- | --- | --- | --- |
| Acesso cruzado entre condomínios → exposição de rotina, dívida e identidade | Média / alto | RLS, contexto transacional, DTOs e testes entre tenants também em arquivos/sockets/jobs | Não demonstrado; engenharia comprova negação e acesso legítimo antes do piloto |
| Identificar reclamante/avaliador/voto por relações ou horários → retaliação | Alta / alto | Separação de identidade, mínimos de agregação, sanitização; revisão ADR-009/010 e ataques de correlação | Não demonstrado; jurídico/controlador decidem viabilidade após PoC |
| Score ou bloqueio incorreto → restrição/discriminação | Média / alto | Episódio correto, julgador vigente, defesa/recurso, regras de locação e revisão de automatismos | Não demonstrado; parecer SEG-16 e validação dos critérios são dependências |
| Relatório/etiqueta/anexo expõe terceiros → fraude e constrangimento | Média / alto | Projeção mínima, metadados limpos, URLs privadas, revalidação, análise de pequenos grupos | Não demonstrado; testes de arquivo e política de guarda do usuário |
| Aparelho perdido/compartilhado ou fila de usuário anterior → exposição/ato indevido | Média / alto | Criptografia efetiva, partição por usuário/tenant, cache apagável e fila protegida | Não demonstrado; P-07 e prova offline sem perda de registros |
| Coleta excessiva ou sensíveis/menores em texto/foto → vigilância e dano duradouro | Média / alto | Minimização por campo, instruções de conteúdo, análise art. 11/melhor interesse e tratamento de exceções | Não demonstrado; jurídico/controlador validam inventário e bases |
| Transferência/subcontratação não avaliada → perda de controle e direitos | Média / alto | Diligência, contrato/instrumento internacional, dados mínimos e cadeia de fornecedores | Não demonstrado; revisão ADR-004/005 antes de dados reais |
| Exclusão incompleta/backup restaura identidade ou acesso → reexposição | Média / alto | Plano por cópia, registro de execução, reaplicação pós-restauro e validação de anonimização | Não demonstrado; ensaio de exclusão/restauração |
| Pedido de titular fraudulento ou entregue ao destinatário errado → vazamento | Média / alto | Verificação proporcional, representação, exportação filtrada e entrega privada | Não demonstrado; testar titular sem conta, múltiplos tenants e conta comprometida |
| Falha de disponibilidade ou incidente tardio → perda de acesso/prova e dano financeiro | Média / alto | Backup/restauro, conciliação, plano de incidentes, alertas e responsabilidades | Não demonstrado; infraestrutura gratuita não comprova produção; RPO/RTO pendentes |

### 4.4 Conclusão preliminar e revisão

A proposta contém tratamentos capazes de afetar direitos; não há evidência para declarar o risco aceitável. Antes do piloto: identificar os controladores e responsáveis; concluir bases/retensões; obter parecer; resolver sigilo, fila e infraestrutura; testar controles; consultar envolvidos/encarregado e registrar divergências; obter decisão fundamentada de prosseguir, modificar ou suspender cada tratamento. Aprovação de Pedro sobre produto não substitui análise do controlador ou parecer jurídico.

Revisar diante de nova finalidade/campo, mudança de fornecedor/país, automação, perfil, exportação ou incidente. A versão detalhada pode conter informações operacionais restritas em repositório próprio; este arquivo versionado usa apenas dados fictícios e descrição de projeto.

## 5. Política de privacidade — minuta para revisão

**Não publicar ainda.** Preencher identidade jurídica/CNPJ/endereço da plataforma e do controlador aplicável, contatos, encarregado/canal, data de vigência, países, fornecedores efetivos, bases e retenções validadas. Os parágrafos abaixo são texto-base para a futura política; descrevem o serviço planejado, sem afirmar implantação dos controles.

**Quem trata seus dados.** O CondomiFacil oferece ferramentas de gestão de condomínios. Nas atividades do seu condomínio, o controlador previsto é o condomínio identificado no seu contexto, e a plataforma atua conforme suas instruções. Administradora e fornecedores podem participar conforme finalidade e contrato. Informaremos separadamente eventuais tratamentos sob decisão própria da plataforma e os canais de cada responsável.

**O que usamos e para quê.** Tratamos os dados necessários ao cadastro e acesso, vínculo com unidade/função, visitas, reservas, encomendas, chamados, comunicação, reuniões, conflitos, pesquisas, cobranças e finanças, conforme os recursos utilizados. Recebemos dados de você, de responsáveis autorizados, de outros envolvidos no registro e dos serviços de pagamento. O inventário da seção 3 orienta a descrição final por finalidade, inclusive dados derivados, fotos/anexos e metadados. Não solicitamos dados de cartão na plataforma; a inserção ocorre no ambiente do gateway.

**Quem pode ver.** Cada função recebe apenas a projeção permitida para condomínio, unidade e finalidade. Outros moradores não recebem sua dívida. Identidade do reclamante e opção individual de voto têm proteção específica; não prometemos anonimato absoluto diante de todos os riscos técnicos. O suporte não acessa reclamações nem scores. Relatórios respeitam o catálogo e os destinatários autorizados; não abrem acesso geral aos cadastros.

**Compartilhamento e transferências.** Serviços de infraestrutura, e-mail, push, pagamentos e monitoramento recebem somente o necessário à operação contratada. A versão publicada identificará os destinatários relevantes, países e mecanismos aplicáveis. Compartilhamento com autoridade ou para exercício de direitos exige fundamento e registro. A localização de um banco no Brasil não significa que todos os serviços processem dados somente aqui.

**Guarda e proteção.** Os prazos dependem da finalidade: visitas seguem a retenção definida; cópias locais, filas, pagamentos, registros e arquivos têm tratamentos distintos. A política publicada deve informar critérios e prazos efetivamente aprovados, inclusive exceções legais. Aplicaremos os controles validados de segurança e os procedimentos de descarte; nenhum sistema oferece risco zero. Não declaramos controles como implementados nesta fase de Design.

**Seus direitos e escolhas.** Você poderá usar “Cópia dos meus dados” e “Excluir conta” nas Configurações. Visitantes, antigos usuários, representantes e pessoas sem acesso precisarão do canal externo de privacidade a ser divulgado antes do piloto. Outros direitos e pedidos seguem o processo da seção 7. A entrega protege terceiros, voto e identidades restritas. Preferências de notificações opcionais podem ser alteradas; avisos obrigatórios têm motivo informado.

**Crianças, adolescentes e mudanças.** O tratamento de dependentes/visitantes menores exige análise específica de melhor interesse e representação. A versão pública explicará esse tratamento de forma acessível. Mudanças de política terão versão/data e comunicação compatível com sua relevância; finalidade nova exige nova análise jurídica, não autorização genérica pela atualização do texto.

**Publicação:** manter política acessível antes do aceite e pelo menu; registrar ciência/versionamento conforme SEG-03. Se houver operação baseada em consentimento, apresentar escolha específica e revogável separada do aceite contratual. Cookies/SDKs e armazenamento web devem ser inventariados antes de habilitação; não há autorização implícita para rastreamento de marketing.

## 6. Termos de uso — minuta para revisão

**Não publicar nem colher aceite ainda.** Identificação das partes, condições comerciais, vigência, canais, responsabilidades, hipóteses de suspensão, solução de conflitos e efeitos de término exigem redação jurídica final. Não inserir cláusula de renúncia a direitos, imunidade por falhas ou eleição de foro sem análise.

| Cláusula proposta | Conteúdo-base |
| --- | --- |
| Objeto e limites | Ferramenta de gestão condominial nos módulos contratados. Relatórios são gerenciais; não substituem contabilidade oficial, parecer, ata, assessoria jurídica ou deliberação válida |
| Acesso e credenciais | Cadastro por responsável autorizado; uso pessoal da conta, guarda de credenciais, dados corretos e comunicação de comprometimento. Poder depende de vínculo/função vigente; não compartilhar sessão nem tentar acessar outra unidade/condomínio |
| Regras do condomínio | Regimento e regras têm versão e âmbito próprio; aceitar termos não valida regra ilegal. O documento “Como funciona” descreve score, reclamações e recursos e depende do parecer SEG-16 |
| Conduta e conteúdo | Usar o serviço para finalidades previstas; não inserir dados excessivos de terceiros, conteúdo ilícito ou credenciais. Procedimento de denúncia/moderação preserva contraditório, motivo e histórico nos limites já definidos, sem penalidade nova |
| Responsabilidades por função | Titulares, gestores e administradora atuam dentro de permissões; condição de síndico/suporte não autoriza consulta universal. Condução eleitoral temporária não concede administração geral |
| Reservas e pagamentos | Exibir preço, meio, estado, cancelamento e devolução conforme RN vigentes. Não prometer confirmação instantânea ou reembolso fora das regras/validações do gateway |
| Privacidade e exportações | Remeter à política e limitar uso de dados obtidos pela função. Quem baixa relatório mantém dever de guarda/finalidade e evita repasse indevido; logout não apaga cópia já baixada |
| Continuidade e offline | Identificar recursos offline e seus limites. Fila pendente não equivale a operação confirmada pelo servidor; não garantir funcionamento offline de vistoria/financeiro nem disponibilidade de produção no ambiente gratuito de construção |
| Término e direitos | Distinguir encerramento de vínculo, contrato e exclusão de conta; informar efeitos sobre acesso, substituição de responsável e preservação fundamentada. Pedido LGPD não fica condicionado a pagamento ou quitação |
| Versões e atendimento | Versionar texto, data e aceite individual/contextual; definir comunicação de mudança relevante e canal de reclamação. Alteração contratual não autoriza finalidade incompatível de dados |

O termo de responsabilidade da conta bancária de pessoa física (SEG-15) é documento próprio, revisado por advogado e aceito pelo titular; não escondê-lo nos termos gerais. Valores e planos permanecem na fonte de produto/contrato comercial vigente.

## 7. Processo de atendimento aos titulares

### 7.1 Direitos, canais e prazos

O produto já prevê cópia de dados por e-mail em até 15 dias (RF-LG-01) e exclusão da conta (RF-LG-02). A entrega proposta é link expirável, não anexo aberto. O art. 19 distingue confirmação/acesso simplificado imediato e declaração completa em até 15 dias; esse prazo não é prazo universal para todos os direitos. Correção, bloqueio, eliminação, portabilidade, informações, consentimento, oposição e revisão de decisões automatizadas precisam de atendimento conforme o caso e regulamentação. Referência: [LGPD, arts. 18 a 20](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html) e [orientações da ANPD ao titular](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados).

Proposta de canais: app para usuário autenticado; canal externo acessível para visitante, ex-usuário, conta bloqueada e representante. Endereço, responsável, cobertura e procedimento de identidade ainda devem ser definidos antes do piloto. Não exigir criação de conta ou envio indiscriminado de documento completo. Não fixar SLA novo aqui, nem assumir que triagem suspende prazo legal.

### 7.2 Fluxo operacional proposto

| Etapa | Procedimento e registro mínimo |
| --- | --- |
| Receber | Gerar protocolo; registrar tipo, data de recebimento, contato seguro e escopo indicado; não pedir justificativa desnecessária |
| Verificar identidade/representação | Usar sessão/reautenticação no app quando aplicável; fora dele, evidência proporcional ao risco, relação e representação. Registrar resultado, evitando conservar cópia documental além do necessário |
| Identificar responsável e dados | Mapear controlador(es), origens, cópias e fornecedores. Pedido global pode envolver vários condomínios; tratar cada origem sem dar visão cruzada a um gestor |
| Classificar direito e prazo | Definir responsável autorizado, obrigação aplicável e prazo; distinguir pedido de acesso, correção, exclusão e impugnação de decisão. Exceção assistida aguarda operador com função definida, sem liberar suporte/admin por conveniência |
| Decidir | Confirmar existência, localizar dados e avaliar restrições de terceiros, dever de conservação e impossibilidades. Não negar em bloco por haver reclamação, dívida ou voto; separar o que pode ser atendido |
| Executar | Aplicar procedimento definido automatizado; bloquear/anonimizar/apagar/corrigir segundo decisão, propagar às cópias e destinatários pertinentes e obter evidência mínima |
| Entregar resposta | Usar canal verificado e conteúdo claro: atendimento integral/parcial, dados/origem/finalidade quando cabível, fundamento de restrição e forma de acompanhamento/contestação |
| Encerrar e controlar | Registrar conclusão, medidas, pendências e comunicações. Retenção do protocolo/evidências precisa de finalidade/prazo próprio; não reter pacote integral de dados por comodidade |

### 7.3 Limites por tipo de pedido

| Pedido | Aplicação ao CondomiFacil |
| --- | --- |
| Confirmação e acesso | Cópia somente dos dados do titular com projeção por origem, sem senha/hash/token, identidade de reclamante alheio ou opção individual de voto. Não reconstruir ligação que destruiria sigilo; explicar limites e resolver P-12 de pesquisa antes de implementar |
| Correção | Corrigir cadastro na origem autorizada e propagar. Fatos históricos exigem retificação rastreável; mês fechado segue estorno, sem sobrescrever prova ou autoria. Falta de botão de editar não elimina direito de requerer análise |
| Anonimização, bloqueio ou eliminação | Avaliar finalidade e obrigação de conservar por conjunto; executar em texto/anexo/cache/exportação quando aplicável. Explicar o que permanece, por quê e por quanto tempo/critério |
| Exclusão da conta | Confirmar com senha no fluxo vigente; revogar sessões, anonimizar identidade e dados relacionáveis, preservando votos/reclamações sem identificação conforme regra. Não usar DELETE cascata nem apagar fatos de terceiros |
| Substituição de responsável | RN-CD-18 prevê aviso para definir substituto; aplicar responsável administrativo conforme modalidade. Sem habilitado, unidade não reserva/cadastra visita; sem proprietário com acesso, não vota. Não condicionar toda exclusão à anuência da administradora |
| Portabilidade e compartilhamentos | Informar destinatários e avaliar pedido conforme regulamentação/limites; RF-LG-01 não é portabilidade automática nem autorização para exportar toda a base |
| Consentimento e oposição | Identificar finalidade/base efetiva; revogar consentimento onde usado e explicar consequências, sem cessar operações que tenham fundamento independente legítimo. Oposição requer análise e resposta fundamentada |
| Decisão automatizada | Mapear bloqueios/inelegibilidade e critérios; receber solicitação de revisão quando aplicável, sem confundir com recurso de reclamação nem conceder acesso a dados de terceiros |

O arquivo de acesso deve ser privado, vinculado ao titular, com autorização revalidada, prazo de entrega RF-LG-01 e expiração de arquivo/link ainda a definir. E-mail avisa e aponta para entrega segura; confirmar destino e tratamento de conta comprometida. Arquivo multitenant pessoal não abre acesso ao condomínio atual de antigos moradores. Provar que integrações receberam retificações/eliminação quando cabível; não prometer apagar cópia que esteja sob guarda independente sem acionamento do responsável.

## 8. Contrato com o condomínio e anexo de tratamento

**Estrutura proposta para assessoria jurídica:** contrato comercial + anexo de proteção de dados + inventário/instruções + lista de fornecedores/transferências + medidas de segurança. Preencher partes e representantes, CNPJ/endereço, poderes de assinatura, vigência, plano, contatos, regras de transição e condições comerciais. Administradora que assina em representação precisa ter poderes demonstrados; autogestão não elimina o condomínio controlador.

| Cláusula do anexo | Conteúdo a concretizar antes da assinatura |
| --- | --- |
| Objeto, duração e instruções | Operações da seção 3, categorias de titulares, dados, finalidade, bases validadas, ambientes e instruções documentadas; vedação de finalidade própria incompatível |
| Papéis por operação | Condomínio controlador/plataforma operadora no escopo SEG-14; mapear administradora, gateway e eventuais operações de controle próprio; não transferir responsabilidade legal apenas por rótulo |
| Obrigações do condomínio | Legitimidade das instruções, transparência, cadastro/representação, definição de acesso e retenção, cooperação em direitos/RIPD/incidentes e comunicação de mudanças |
| Obrigações da plataforma | Tratar sob instrução lícita, minimizar dados, limitar pessoas autorizadas, confidencialidade, segurança e prestação de evidências; sinalizar instrução incompatível e procedimento de resolução |
| Subcontratação e transferência | Relação de fornecedores, operações, países, mecanismo aplicável e fluxo de aviso/autorização/mudança contratualmente definido; obrigações equivalentes e cadeia verificável |
| Direitos e RIPD | Recebimento/encaminhamento, cooperação e evidências por origem; responsabilidades, contatos e tempos internos compatíveis com obrigações legais; sem acesso universal de suporte |
| Incidentes | Canal restrito, acionamento sem demora indevida, conteúdo mínimo, preservação e assistência à avaliação/comunicação pelo controlador; prazo interno a pactuar sem consumir o prazo externo |
| Retenção e término | Destino por categoria, entrega/devolução segura, eliminação/anonimização comprovável, exceções fundamentadas, backups, fila e transição para outra administração; desligamento não autoriza download integral |
| Fiscalização e responsabilidade | Evidências e auditoria proporcional sem expor outros tenants; responsabilidades/ressarcimento conforme lei e contrato, sem isenção geral nem restrição indevida de direitos |

**Referência normativa para incidentes:** a Resolução ANPD nº 15/2024 exige avaliação de risco/dano relevante; quando comunicável, a regra geral é comunicação pelo controlador à ANPD e aos titulares em três dias úteis da ciência de que dados pessoais foram afetados. Informações à ANPD podem ser complementadas fundamentadamente em vinte dias úteis, contados da comunicação preliminar. O registro de incidentes, inclusive não comunicados, tem retenção mínima de cinco anos da data do registro, ressalvadas obrigações adicionais. Eventuais regras especiais/de pequeno porte exigem enquadramento confirmado, sem extensão automática. O contrato deve operacionalizar esse dever junto ao plano de segurança. [RCIS, arts. 5º, 6º, 9º e 10](https://bibliotecadigital.mj.gov.br/bitstream/1/12879/2/RES_ANPD_2024_15.html).

## 9. Pendências, critérios de aceite e rastreabilidade

| Pendência | Evidência necessária / envolvidos |
| --- | --- |
| Identidade dos agentes e canais | Pedro/jurídico/controladores: partes, representantes, encarregado/canal e função operacional LGPD; processo para titulares sem conta |
| Bases legais | Jurídico/controlador: hipótese por finalidade, obrigação concreta, teste B9 e análise de sensíveis/menores; não aprovar tabela em bloco |
| Retenções | Jurídico/engenharia/controlador: resolver P-09, modelos/bloqueios, anexos, provas financeiras e pesquisa; preservar regra de visitantes e registro específico de incidentes |
| Sigilo e offline | PoCs ADR-003/009/010; P-03/P-07/P-12; prova de entrega pessoal, anonimização, fila e correlação residual |
| Fornecedores e países | Diligência e instrumentos válidos; campos Asaas/KYC; transferências Resend e cadeia de push/monitoramento; revisão obrigatória ADR-004 antes de piloto |
| Textos e contratos | Parecer SEG-16, minutas finais preenchidas, versionamento e coleta de aceites; termo próprio de conta PF SEG-15 |
| RIPD e exercícios | Controlador/jurídico/engenharia: completar análise e decisão; ensaiar acesso, correção, exclusão, restauração e incidente com dados fictícios |

Critérios propostos: inventário reconciliado com campos/SDKs e integrações reais; nenhum prazo sem fonte/fundamento; acesso pessoal sem dados proibidos de terceiros; exclusão em todas as cópias demonstrada; restauração sem ressuscitar acesso; canal sem conta funcionando; contrato e política coerentes com infraestrutura efetiva. Guardar evidências restritas, sem segredos ou dados reais neste Git. Nenhum desses critérios foi executado nesta fase documental.

| Referência | Cobertura |
| --- | --- |
| SEG-03, SEG-11; RF-LG-01/02; US-LG-01; UF 14 | Seções 5 a 7: transparência, aceite e direitos |
| SEG-05/06/07/09/10/17/18; RNF-11 | Seções 3 e 4; controles detalhados em seguranca.md |
| SEG-14/15/16 | Seções 2, 6 e 8: agentes, contrato, termo PF e parecer |
| RN-CD-07/08/18; RN-VI-08/16; RN-OF-06 | Seções 3.4 e 7: vínculo, listas, cache e fila |
| RN-RL-01 a 08; RF-RL-01 a 11 | Inventário, RIPD, política e contratos: cópias privadas sem ampliar acesso |
| RNF-13; MER P-03/07/09/12; ADR-004/005/009/010/013 | Retenção, restauração, sigilo, direitos e pendências |

## 10. Referências oficiais consultadas

Consulta em **14/11/2026**. Lei e atos normativos prevalecem sobre guias; orientações e avaliação concreta complementam a redação jurídica. As hipóteses e medidas específicas deste projeto são propostas próprias apoiadas nas fontes internas, não conclusões da ANPD sobre o CondomiFacil.

- [LGPD — texto atualizado da Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html): bases, direitos e deveres.
- [ANPD — definições de agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_agentes_de_tratamento_e_encarregado___defeso_eleitoral.pdf): papéis e cadeias de contratação.
- [ANPD — legítimo interesse](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse): teste de balanceamento e limites.
- [ANPD — orientações sobre RIPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd): conteúdo, responsabilidade e avaliação de riscos.
- [ANPD — titular de dados](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados): direitos e petição.
- [ANPD — Enunciado nº 1/2023](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/tratamento_de_dados_de_criancas_e_adolescentes.pdf): melhor interesse de crianças/adolescentes.
- [ANPD — Resolução nº 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024): transferências internacionais.
- [Resolução ANPD nº 15/2024 — acervo oficial do MJ](https://bibliotecadigital.mj.gov.br/bitstream/1/12879/2/RES_ANPD_2024_15.html): comunicação e registro de incidentes.

**Registro:** criação documental de 14/11/2026. Não altera fontes de produto, permissões, contratos de API, protótipo ou ADRs. Validações e ajustes nessas fontes exigem decisão de Pedro e rastreabilidade no escopo autorizado.
