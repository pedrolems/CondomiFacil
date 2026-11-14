# Segurança — CondomiFacil

**Data:** 14/11/2026. **Estado:** proposta para revisão de Pedro Lemos.

O projeto está na fase de Design: ainda não há backend, aplicativo, banco ou controles de produção implementados. Este documento consolida os requisitos existentes e propõe sua aplicação na autenticação, autorização, isolamento entre condomínios, criptografia, gestão de segredos, limitação de requisições e resposta a incidentes. Não comprova conformidade, não aceita ADRs nem altera permissões de produto.

## 1. Escopo, fontes e estado das decisões

As regras de produto prevalecem sobre exemplos antigos de arquitetura e contratos. As atualizações de autogestão e condução eleitoral de 13/11/2026 e de relatórios de 14/11/2026 fazem parte desta base.

| Fonte | Uso neste documento |
| --- | --- |
| [PRD](../01-produto/02-prd.md), seções 3, 4, 7, 8 e 10 | Perfis, requisitos funcionais, RNF, SEG-01 a SEG-18 e stack |
| [Regras de negócio](../01-produto/03-regras-de-negocio.md) | Cadastro, vínculos, sigilo, offline, finanças, eleições e RN-RL-01 a RN-RL-08 |
| [Autogestão e condução eleitoral](../01-produto/06-autogestao-e-conducao-eleitoral.md) | Limites aprovados e atribuições ainda pendentes |
| [Arquitetura](../03-arquitetura/01-arquitetura.md), seções 3, 4, 6 e 7, e [índice de ADRs](../03-arquitetura/adr/README.md) | Desenho técnico, ambientes, isolamento e ressalvas das decisões |
| [MER/DER](../04-banco-de-dados/01-mer-e-der.md) e [política de acesso a dados](../04-banco-de-dados/02-politica-de-acesso-a-dados.md), seções 3, 6, 7 e atualizações finais | Identidades, contexto, projeções, retenção e processos técnicos |
| [Backend](../05-backend/01-backend.md), seções 4 a 7 | Guards, domínio, persistência, jobs e integrações |
| [Guia da API](../05-backend/api/01-guia-da-api.md), seções 2, 3, 8, 10 e 11, e [integrações externas](../05-backend/api/03-integracoes-externas.md) | Sessões, erros, limites de taxa, arquivos e credenciais de provedores |
| [Frontend](../06-frontend/frontend.md), seções 4 a 7, e [painel web](../06-frontend/painel-web.md), seções 3 a 5 | Cache, fila offline, tokens, notificações e exportações privadas |

**Requisito vigente** significa obrigação já presente nas fontes de produto. **Proposta técnica** significa mecanismo a validar antes da implementação. **Pendência** significa decisão ainda não tomada; sua presença não autoriza acesso nem permite assumir que o controle esteja atendido. Salvo indicação de requisito vigente, os procedimentos técnicos e operacionais abaixo são propostas.

Asaas (ADR-002), Supabase PostgreSQL/Storage com Render para construção do MVP em dev e staging (ADR-004) e Resend (ADR-005) foram aceitos com ressalvas em 10/11/2026. A infraestrutura para piloto com dados reais exige revisão obrigatória do ADR-004. Supabase é usado como PostgreSQL e Storage; a autenticação prevista é da API NestJS, sem introduzir Supabase Auth por consequência deste documento. Os demais ADRs continuam Propostos.

## 2. Dados protegidos e fronteiras de confiança

O condomínio é o tenant. A mesma pessoa pode ter vínculos em vários condomínios e unidades; uma identidade autenticada não concede acesso a todos eles. Dentro de cada condomínio, unidade, titularidade, função vigente, atribuição, estado e prazo também delimitam o acesso.

| Conjunto | Proteção exigida pelas fontes |
| --- | --- |
| Identidade, credenciais, sessões e dispositivos | Acesso limitado por titular/finalidade; hashes, códigos, tokens e segredos fora das projeções comuns |
| Visitantes e documentos | Portaria nos blocos/períodos autorizados e projeções do solicitante; sem documento em notificação; anonimização conforme retenção |
| Reclamações, score, pesquisa e atendimento | Identidade e conteúdo separados quando previsto; projeção específica por destinatário; sem correlação indevida em anexos, horários e comentários |
| Votos | Participação separada do conteúdo; opção individual fora de API, logs, exportações e cópia dos próprios dados |
| Cobranças, inadimplência e dados bancários | Acesso por unidade e finalidade conforme SEG-17; sem exposição a outros moradores |
| Finanças do condomínio | Acesso de gestão/fiscalização conforme SEG-18 e exceções expressas; receitas automáticas agregadas, sem unidade/responsável; folha só pelo total |
| Relatórios, arquivos e auditoria | Mesma autorização do domínio de origem; cópias não ampliam direitos; evidências e arquivos privados |

Fronteiras a verificar: cliente → API; API → banco; API/worker → Storage e provedores; servidor → WebSocket/push/e-mail; aplicativo → armazenamento local; geração → download de exportações; operação técnica → dados de produção. Dados recebidos do cliente, inclusive IDs, filtros, cabeçalhos e papéis declarados, não são prova de autorização.

## 3. Autenticação e sessões

### 3.1 Regras vigentes de acesso e recuperação

Ninguém se cadastra sozinho. RN-CD-01 prevê pré-cadastro pela administradora, equipe autorizada no Gestão + Suporte ou responsável administrativo local no Essencial com autogestão; o procedimento para habilitar a primeira gestão ainda depende de definição. Não conceder autoatribuição de função para preencher essa lacuna.

| Controle | Regra vigente |
| --- | --- |
| Código de primeiro acesso e recuperação | 6 dígitos; validade de 15 minutos; até 5 tentativas |
| Reenvio | Após 60 segundos; código novo invalida o anterior |
| Resposta ao solicitar código | Mesma mensagem para e-mail cadastrado ou não cadastrado |
| Senha | Mínimo de 8 caracteres; armazenamento por hash Argon2 ou bcrypt, conforme SEG-04 |
| Falhas de senha | Pausa de login por 15 minutos após 5 senhas erradas seguidas |
| Aceites | Termos, política e regimento com versão e data por usuário; condomínio quando aplicável |

Proposta de implementação: consumir o código uma única vez, validar finalidade e expiração no servidor, não armazená-lo em texto aberto e não registrá-lo em logs. O mecanismo de proteção do código e seus parâmetros precisam de revisão própria; não reutilizar hash de identificador público como proteção. Argon2id é a direção proposta pela arquitetura/ADR-007; algoritmo final e parâmetros de custo devem ser validados, sem transformar a alternativa permitida pelo PRD em decisão já aceita.

### 3.2 Sessão proposta no ADR-007 e no contrato

| Item | Direção documentada e limite |
| --- | --- |
| Token de acesso | JWT assinado, com validade de 15 minutos, `sub` e `sid`; sem funções nem condomínios como fonte de permissão |
| Validação | Verificar assinatura, validade e sessão; algoritmos admitidos, emissor e destinatário esperados precisam ser fechados na revisão técnica |
| Renovação | Refresh token opaco, aleatório, persistido como hash e rotativo; replay indevido revoga a sessão |
| Rede instável | A direção aprovada admite tolerância controlada ao retry legítimo; janela e mecanismo permanecem pendentes, sem reutilização irrestrita |
| Revogação | Logout, troca de senha e exclusão da conta revogam sessões conforme o desenho de sessão |
| Mobile | Tokens no armazenamento seguro previsto, `expo-secure-store`; nunca em cache de consulta, logs ou carga da fila offline |
| Web | Refresh em cookie `httpOnly`, `Secure`, `SameSite=Lax`; token de acesso apenas em memória; proteção CSRF no fluxo que usa cookie |
| Expiração | `401` com `SESSAO_EXPIRADA`, conforme guia; reautenticação sem executar ação sensível automaticamente |
| Rotação de assinatura | Identificador `kid` e transição controlada entre chaves; calendário e procedimento a validar |

Validar sessões e autorização também nas conexões de tempo real. Mudança de vínculo ou revogação não pode manter acesso porque o socket está aberto ou porque uma tela possui dados em cache. Não prometer revogação remota imediata de dados num aparelho desconectado: o ciclo local da seção 5.3 é parte da proteção.

MFA e reautenticação adicional para operações privilegiadas não foram definidos nas fontes. Sua avaliação está pendente; este documento não cria uma nova etapa de produto nem afirma que ela já exista.

## 4. Autorização e proteção contra vazamentos entre condomínios

### 4.1 Autorização por ação e contexto

A sequência proposta segue o guia da API: autenticar sessão; validar condomínio/unidade declarados; resolver função e mandato vigentes; verificar titularidade e condições da ação; validar entrada; abrir `TenantContext` para persistência sujeita a RLS. `X-Condominio-Id` e `X-Unidade-Id` solicitam contexto, mas não o autorizam. Identificador conhecido, pasta da interface, botão escondido ou UUID imprevisível também não autorizam.

| Situação | Aplicação dos limites vigentes |
| --- | --- |
| Morador com várias unidades | Exigir unidade ativa nas ações dependentes dela; score pertence ao vínculo/episódio de moradia, sem somar imóveis |
| Subsíndico | Poderes próprios fora da substituição; função ampliada somente durante substituição formal, sem poder ativar/desativar a própria substituição |
| Administradora | Usuário da organização e vínculo contratual vigentes por condomínio; sem acesso geral por pertencer à carteira |
| Suporte | Só Gestão + Suporte, com acesso registrado; sem reclamações/scores; troca para Essencial retira o acesso |
| Admin da plataforma | Operações de plataforma documentadas; não é superusuário operacional dos condomínios. Quarentena do gateway é exceção delimitada |
| Proprietário não residente | Projeções próprias da unidade; sem rotina nem score do inquilino |
| Autogestão | Não atribuir perfil Administradora à gestão local; distribuição fina de cadastros, cobrança e finanças continua pendente no registro 06 |
| Condução eleitoral | RN-VO-13: síndico; ausente/vago, sub; sem ambos, conselho; sem todos, proprietário designado, limitado àquela eleição. Administradora/suporte legitimamente autorizados também podem conduzir |

Revalidar concessões temporárias e condições eleitorais em cada leitura/ação; nenhuma pessoa se autoconcede acesso. A condução não dá gestão geral, reclamações ou finanças. Resultados só após encerramento. Designação, representação do conselho, ausência/vacância e revogação permanecem dependências antes do código.

### 4.2 Banco e Row Level Security

**Requisitos vigentes:** RNF-11 e SEG-05 exigem isolamento com RLS no PostgreSQL; SEG-06/07/17/18 exigem sigilo adicional dentro do mesmo tenant. O desenho físico abaixo consolida propostas da arquitetura e da política de acesso:

1. Toda entidade de condomínio carrega `condominio_id` obrigatório. Referências entre entidades de tenant incluem o condomínio em chaves estrangeiras compostas, impedindo associação a unidade/recurso de outro tenant.
2. `TenantContext` encapsula o acesso ao banco na API, nos jobs e na sincronização. Define contexto validado de usuário, condomínio, unidade quando aplicável e função efetiva apenas durante a transação, por `set_config(..., true)`/`SET LOCAL`. Não manter contexto na sessão reutilizada pelo pool.
3. Papel de aplicação sem superusuário ou `BYPASSRLS`, não dono de tabelas; RLS habilitada e forçada nas tabelas de tenant. Migrações usam papel separado, fora do caminho operacional.
4. Ausência de contexto necessário nega acesso. Sem unidade legítima, não inventar unidade para funcionário, síndico profissional ou job; a política precisa admitir apenas as ações cabíveis a esse sujeito.
5. `USING` delimita linhas alcançáveis; `WITH CHECK` controla inserção/resultado de atualização. Combinar fronteira de tenant com ação, vínculo e demais condições; políticas permissivas não podem produzir “mesmo condomínio OU mesmo papel”. Excluir exige permissão própria.
6. RLS não substitui privilégios por operação/coluna, DTOs, validação de transição, integridade e minimização. Tabelas globais, como identidade/sessão, não são públicas e não podem servir de caminho alternativo aos tenants.

**Erros propostos:** recurso de outro condomínio responde `404`, sem confirmar existência. O contrato usa `403` para recusa de contexto/função e `401` para autenticação. Buscas, totais, cursores, erros de referência e mensagens devem preservar a mesma ausência de informação indevida.

### 4.3 Outros canais e cópias

| Canal | Controle proposto, conforme as fontes |
| --- | --- |
| WebSocket | Salas autorizadas pelo servidor por condomínio/portaria/blocos; revalidar conexão e retirar inscrições anteriores na troca de contexto; eventos mínimos |
| Cache | Chaves incluem contexto de usuário, condomínio e unidade quando aplicável; troca de contexto invalida dados acessíveis anteriores; não usar resposta de um tenant para outro |
| Jobs/outbox | Finalidade explícita, carga mínima e execução contextual por condomínio; job não herda perfil administrativo universal; efeitos idempotentes |
| Webhook Asaas | Validar token `asaas-access-token`; não há assinatura HMAC do corpo no contrato existente. Resolver tenant por conta/transação correlacionada no servidor; deduplicar; conciliar diariamente; quarentena não abre dados operacionais ao admin |
| Storage | Bucket privado; prefixo `c/{condominio_id}/{modulo}/{uuid}` como defesa adicional; emitir autorização temporária só após validar ação/recurso; não permitir listagem pública ou URL permanente |
| Notificações e deep links | Texto genérico na tela bloqueada; sem documento, dívida, reclamante ou voto; abrir destino sempre revalida acesso atual |
| Logs, Sentry e auditoria | Sanitização na origem, sem corpos sensíveis, segredos ou conteúdo de voto/reclamação; acesso restrito e trilha de consulta operacional a dimensionar |

Nos novos relatórios do MVP, RN-RL-01 a 08 limitam o catálogo à administradora vinculada e ao condomínio selecionado, sem relatório consolidado da carteira. Solicitante, função e vínculo são revalidados no processamento, na listagem, na consulta e no download; conhecer job/arquivo ou operar o endpoint comum de arquivos não autoriza acesso. Outros operadores da administradora não herdam o job do solicitante. As exportações financeiras anteriores RF-FI-15/22 mantêm suas permissões próprias.

Campos proibidos não podem aparecer em CSV/XLSX, abas ocultas, metadados, PDF nem dados embutidos de gráficos. PNG/SVG são somente agregados previstos. Tratar texto livre como dado em células, impedindo fórmulas injetadas; SVG usa conteúdo controlado. Arquivo pronto permanece privado; cópia já baixada fica sob guarda do usuário e não pode ser apagada remotamente por logout. Retenção, validade do link, limites e privacidade de pequenos grupos continuam pendentes.

## 5. Criptografia e ciclo de vida de dados

### 5.1 Trânsito, repouso e campos

| Camada | Requisito e proposta |
| --- | --- |
| Comunicação | SEG-01 exige HTTPS em toda comunicação. Arquitetura propõe TLS para API, WebSocket, objetos e banco, validação de certificados e HSTS na web |
| Banco, objetos e backups | Criptografia em repouso prevista na arquitetura; confirmar cobertura efetiva do provedor/plano e acesso às cópias na revisão de infraestrutura |
| Campos de alto risco | Arquitetura propõe criptografia de coluna com chave fora do banco, por exemplo documento do visitante e dados bancários. Inventário final de campos, algoritmo, biblioteca, busca e migração de chaves ainda dependem de desenho |
| Senhas, códigos e refresh | Senha por hash; refresh por hash no desenho proposto; código com proteção própria a validar. Não tratar criptografia reversível como substituto do hash de senha |
| Pesquisa | HMAC com chave do servidor e versão é proposta do ADR-010; custódia, rotação e recuperação das próprias respostas exigem revisão |

A criptografia não amplia leitura: DTOs e papéis continuam restritos mesmo quando o processo técnico consegue decifrar um campo. Chaves de dados não devem ficar junto do material cifrado sem proteção independente. Separação, distribuição e recuperação de chaves precisam ser comprovadas no desenho físico, inclusive após restauração.

### 5.2 Sigilo, minimização e retenção

Voto tem registro de participação separado do conteúdo (SEG-06). O ADR-009 reconhece limites de correlação por quem acesse banco/horários; a proposta não prova sigilo criptográfico contra administrador do banco. A revisão jurídica/técnica continua necessária. Não copiar opção individual para auditoria, exportação ou “meus dados”.

Score segue RN-SC-02 e exceções específicas, sem julgamento público; identidade do reclamante nunca é enviada ao alvo. Suporte não acessa reclamações/scores. Hash, HMAC ou troca de nome não comprovam anonimização irreversível: revisar relações, texto livre, anexos e metadados conforme a política de acesso.

SEG-10 fixa anonimização de visitantes após seis meses, com parametrização prevista nas RN e seus limites legais a validar. SEG-11 prevê pedidos de acesso/exclusão pelo app: aplicar procedimento por finalidade e preservar dados protegidos de terceiros. Retenção de arquivos, logs, auditoria, exportações e quarentena não tem prazo universal definido. Não adotar guarda eterna nem eliminar evidência indiscriminadamente; registrar decisão jurídica e operacional antes de produção.

### 5.3 Aparelhos e operação offline

SEG-09/RN-OF-06 exigem cache de consulta criptografado e apagado no fim do dia/logout, separado da fila pendente. O frontend/ADR-003 propõem `expo-sqlite` com SQLCipher, chave no armazenamento seguro e partição por usuário/condomínio. WatermelonDB continua alternativa; a decisão depende de PoC e aprovação.

Validar em build nativa que a criptografia está efetivamente disponível antes de persistir dados; abrir SQLite com uma chave configurada não basta como evidência. A proteção dos anexos e arquivos temporários também precisa ser comprovada. Portaria guarda somente recorte do dia/blocos atendidos; limpeza, seus chamados admitidos. Vistoria e demais ações online não ganham suporte offline por estarem no mesmo aplicativo.

O cache verifica validade localmente, sem depender de ordem enviada pelo servidor à meia-noite. Trocar de condomínio retira a cópia anterior do contexto acessível. **Fila e anexos pendentes são preservados protegidos até sincronização ou tratamento explícito:** não apagá-los silenciosamente na limpeza do cache, logout, expiração ou atualização. Não enviá-los como se fossem do próximo funcionário num aparelho compartilhado.

Após logout/revogação, bloquear acesso pela nova sessão e suspender envio sem autorização do contexto de origem. Retenção, custódia da chave, acesso e recuperação da fila após logout permanecem pendentes em P-07/ADR-003. Não escolher neste documento prazo arbitrário, retenção ilimitada ou operador com poder implícito. O recebimento no servidor revalida autoria/contexto e trata divergências; `op_id` e recibos não contornam autorização.

## 6. Gestão de segredos

**Requisito vigente SEG-02:** segredos apenas no servidor, em variáveis de ambiente; nunca no aplicativo. A arquitetura propõe injeção por cofre de segredos, conjuntos independentes por ambiente e rotação planejada. Este documento e a pasta de segurança são versionados; não recebem valores reais, dumps ou evidências pessoais de incidentes.

| Material | Guarda e acesso propostos |
| --- | --- |
| Credenciais PostgreSQL e Storage | Cofre do ambiente; privilégio mínimo do processo; papel de migração separado do papel de runtime |
| Asaas | Chave principal, chaves de subcontas e token de webhook no servidor; autorização por operação e conta; sem devolver chave ao cliente |
| Resend, push e tokens de integração | Somente processo que necessita enviar; não embutir credencial administrativa no bundle |
| Assinatura JWT, criptografia de campos e HMAC | Chaves separadas por finalidade/ambiente, com versão/referência e acesso restrito; política de rotação/recuperação pendente |
| CI, deploy e Sentry auth | Segredos do pipeline/serviço, com acesso restrito; distinguir identificador público de credencial com poder administrativo |
| Token de sessão do usuário | Armazenamento da seção 3.2; não é uma chave de integração nem variável pública |

Proposta operacional:

1. Inventariar referência, finalidade, ambiente, consumidor, responsável, privilégios, versão e data da rotação; nunca o valor no inventário versionado.
2. Provisionar fora do Git e conceder acesso mínimo. Variáveis `EXPO_PUBLIC_*` são públicas e só recebem URLs/identificadores apropriados.
3. Manter local/dev/staging com dados fictícios e sandbox; impedir mistura com produção conforme ADR-002/004. O uso de Supabase/Render gratuitos não autoriza dados reais no piloto.
4. Implantar varredura de segredos no CI e verificar bundle, logs e artefatos. `.env.example` pode conter nomes e valores fictícios; arquivos locais de credenciais, certificados privados e exportações sensíveis ficam fora do Git. Nenhuma alteração de `.gitignore` é feita por este documento.
5. Planejar rotação com teste de consumidores, transição entre versões e retirada da anterior. Cadência, exceções e responsáveis ainda precisam ser definidos; suspeita de exposição dispara o plano de incidentes.
6. Se um segredo vazar, revogar/substituir na origem e avaliar uso indevido. Remover o valor do arquivo ou do histórico não substitui a revogação. Preservar evidência mínima em repositório de incidentes restrito.

Para o token de webhook do Asaas, as fontes propõem comparação em tempo constante e proibição de registrar `asaas-access-token`. A escolha de token único ou por subconta continua pendente. Rotação de assinatura pode manter versões válidas numa transição controlada; comprometimento exige avaliar revogação das sessões e das chaves, sem prometer continuidade indiscriminada.

## 7. Limitação de requisições e prevenção de abuso

Os controles numéricos de código/login da seção 3.1 já são regras. **Volumes e janelas adicionais de rate limiting não foram definidos** na arquitetura nem nos contratos; não confundir cinco tentativas de senha/código com uma cota geral de API.

| Superfície | Direção proposta | A dimensionar |
| --- | --- | --- |
| Código, ativação, login e recuperação | Combinar IP e identificador de e-mail protegido; resposta sem enumeração; reenvio e pausa conforme regra | Cotas/janelas, normalização, retenção dos contadores e efeito em redes compartilhadas |
| API autenticada | Limites por usuário, com contexto/operação quando necessário; impedir que um tenant consuma toda a capacidade | Cotas, rajadas e isolamento de capacidade |
| Sync da portaria/limpeza | Lotes limitados, recuo com variação e idempotência; não descartar fila por `429` | Tamanho/frequência e recuperação de filas acumuladas, incluindo portarias simultâneas |
| Upload/download | Validar permissão, tipo e tamanho antes de autorizar; consumo por contexto | Quotas adicionais e duração de links; preservar limites existentes, como comprovante financeiro até 10 MB |
| Relatórios | Catálogo/formato fechado e jobs vinculados ao solicitante; concorrência controlada | Período, volume, frequência, concorrência e expiração conforme RN-RL-08 |
| WebSocket | Autenticar conexões e inscrições; controlar reconexão e carga | Conexões, frequência e tamanho por usuário/portaria |
| Webhooks e integrações | Autenticação própria, deduplicação, tempo limite e processamento durável | Capacidade, tamanho de carga e proteção contra abuso sem perder eventos legítimos |

O contrato propõe `429`, cabeçalho `Retry-After` e `codigo` `LIMITE_DE_TAXA_EXCEDIDO`. Clientes respeitam a espera e usam recuo; não reenviam mutação como ação nova. `op_id`/chave de idempotência permanecem estáveis. Uma confirmação financeira não pode ser fabricada para contornar indisponibilidade.

O ponto de aplicação e o armazenamento dos contadores ainda exigem decisão: apenas memória por instância pode perder estado em reinício e divergir ao escalar. Definir também comportamento quando o mecanismo falhar, sem assumir acesso ilimitado. Não escolher Redis ou fornecedor novo só por este documento. Medir limites com RNF-01/05/10/17 e cenários de rede compartilhada, retry legítimo e retorno do offline.

Complementar com validação estrita de entrada, limites de corpo, CORS restrito, proteção CSRF, cabeçalhos web e verificação de dependências já propostos na arquitetura. Rate limiting não substitui autorização/RLS, nem constitui sozinho proteção de infraestrutura contra indisponibilidade.

## 8. Auditoria, detecção e evidências

SEG-08 exige auditoria de julgamentos, recursos, score, regras, mandatos, substituições, conta bancária, lançamentos e fechamentos. RN-RL-06/07 acrescentam solicitação e acesso a relatórios; SEG-13 exige registro de acesso do suporte.

A arquitetura propõe trilha append-only gravada com o efeito de negócio, com mecanismos contra alteração. Registrar ator humano/sistema, função efetiva, contexto, ação, recurso, instante e correlação; antes/depois somente dos campos permitidos. Não copiar senha, token, voto, identidade protegida, salário individual ou conteúdo completo do relatório. Identificadores de correlação também recebem acesso e retenção restritos.

| Sinal a acompanhar — proposta | Encaminhamento |
| --- | --- |
| Falhas repetidas de login/renovação ou uso indevido de refresh | Investigar comprometimento sem expor conta a terceiros |
| Falha de isolamento, contexto ausente aceito ou acesso cruzado confirmado | Acionar incidente crítico e conter a superfície afetada |
| Download/exportação anormal ou bucket público | Suspender acesso indevido e delimitar objetos/solicitantes |
| Falha/atraso de webhook e divergência de conciliação | Investigar integridade, preservar eventos e reprocessar idempotentemente |
| Rotina de anonimização/cache/backup sem evidência de execução | Abrir falha operacional e avaliar exposição/perda |
| Credencial em Git, log, bundle ou artefato | Acionar rotação e investigação de uso |

Fontes de detecção: logs sanitizados, Sentry, métricas de API/filas/rotinas e relatos de usuários/provedores. Alertas, responsáveis, cobertura fora do horário, canal de recebimento e retenção ainda precisam ser definidos. O Render gratuito pode dormir, parando API/worker e rotinas; não prometer monitoramento contínuo ou reação garantida nesse desenho de construção do MVP.

## 9. Plano de resposta a incidentes

### 9.1 Preparação, responsabilidades e severidade

Este é um **plano proposto**, a exercitar antes do piloto. A equipe e os contatos reais ainda não foram definidos; não registrar contatos pessoais ou segredos neste arquivo. Designar titular e substituto para cada responsabilidade e manter os meios de acionamento em ambiente restrito.

| Responsabilidade proposta | Atribuição |
| --- | --- |
| Coordenador do incidente | Abrir registro, reunir responsáveis, classificar, acompanhar decisões e autorizar encerramento operacional |
| Responsável técnico | Investigar API/banco/app/infra, conter, corrigir, recuperar e produzir evidências técnicas |
| Responsável de privacidade e jurídico | Avaliar dados/titulares/controladores atingidos, obrigações de comunicação e preservação; articular encarregado quando definido |
| Responsável de comunicação | Preparar comunicações factuais para condomínios afetados, usuários e provedores, conforme orientação jurídica |
| Pedro Lemos | Validar prioridades e decisões de produto/infra sob sua responsabilidade; sua condição de dono não preenche automaticamente funções jurídicas pendentes |

O contrato previsto por SEG-14 trata condomínio como controlador e plataforma como operadora. Papéis, contatos, obrigações e coordenação entre controladores precisam de validação contratual/jurídica; não delegar automaticamente a qualquer perfil do aplicativo a leitura de evidências.

| Severidade proposta | Critério inicial e prioridade |
| --- | --- |
| Crítica | Vazamento confirmado entre condomínios; comprometimento amplo de credenciais; exposição de voto/identidade protegida; alteração indevida de pagamentos ou indisponibilidade ampla sem contenção. Acionamento imediato dos responsáveis |
| Alta | Acesso indevido ou perda de integridade restritos a um contexto, ainda sem escopo inteiramente conhecido. Conter e investigar com prioridade |
| Moderada | Tentativa bloqueada ou vulnerabilidade sem exploração identificada. Corrigir e monitorar; reclassificar se surgirem evidências |

Severidade técnica não determina sozinha a obrigação legal de comunicação. Não esperar investigação completa para iniciar contenção nem para avaliar prazos aplicáveis. SLAs de resposta, escalonamento e cobertura de atendimento ainda dependem de definição, sem assumir operação 24 horas.

### 9.2 Procedimento operacional proposto

| Etapa | Ações e evidência de saída |
| --- | --- |
| 1. Detectar e registrar | Abrir identificador de incidente; guardar instantes de detecção e ciência, fonte, sintomas, ambientes e recursos potencialmente afetados. Registrar fatos e hipóteses separadamente |
| 2. Triar e delimitar | Confirmar autenticidade do alerta; classificar; identificar tenants, unidades, usuários, objetos, credenciais e período; avaliar confidencialidade, integridade, disponibilidade e continuidade da portaria |
| 3. Conter | Aplicar menor bloqueio eficaz: revogar sessão/chave, retirar URL/acesso, suspender exportação/rota/job ou isolar serviço. Preservar logs/evidências antes de ações que os destruam, quando isso não prolongar a exposição. Registrar ação, responsável e efeito |
| 4. Investigar e erradicar | Encontrar causa inicial e caminho de acesso, corrigir política/configuração/código, retirar persistência indevida e trocar credenciais expostas; testar o controle que falhou e caminhos equivalentes |
| 5. Comunicar | Acionar controlador(es) e assessoria jurídica pelo procedimento acordado; avaliar e executar comunicações exigíveis e avisos operacionais. Guardar conteúdo, destinatários, decisão e horário; não expor tenants não afetados |
| 6. Recuperar | Restaurar ou reimplantar em ambiente controlado, verificar isolamento/integridade, conciliar pagamentos e reaplicar exclusões; liberar por etapas com monitoramento e responsáveis identificados |
| 7. Encerrar e aprender | Confirmar contenção, correção e validações; registrar escopo conhecido, limites da investigação e comunicações. Produzir análise da causa e ações com responsáveis, prioridade e evidência de conclusão |

Evidências ficam em área restrita, com acesso registrado, origem, responsável pela coleta, horário, integridade verificável e histórico de transferências. Coletar apenas o necessário; não colar dumps, tokens, dados pessoais ou payloads completos em issues públicas, chat de suporte, Git ou Sentry. Retenção, preservação excepcional e descarte são definidos com jurídico, sem prazo arbitrário neste documento.

### 9.3 Tratamento por cenário

| Cenário | Contenção e recuperação propostas |
| --- | --- |
| Vazamento entre condomínios | Bloquear superfície afetada, incluindo arquivos/jobs/caches/salas; preservar requisições correlacionadas; corrigir contexto/RLS/projeção; provar negação cruzada e acesso legítimo antes de liberar |
| Segredo exposto | Revogar na origem, emitir substituto, avaliar chamadas e alcance; reimplantar consumidores; retirar exposição dos artefatos. Chave de criptografia exposta exige avaliar confidencialidade dos dados já cifrados |
| Conta ou sessão comprometida | Revogar sessões afetadas, bloquear renovação indevida e orientar recuperação segura; revisar ações do período sem divulgar conta a terceiros |
| Relatório/documento exposto | Revogar novas autorizações, retirar objeto da entrega, identificar acesso e escopo; considerar que cópias já baixadas não são recuperáveis remotamente |
| Pagamento/webhook indevido | Suspender processamento afetado, preservar eventos, verificar token/correlação e conta recebedora; conciliar com gateway e reprocessar idempotentemente; não editar histórico financeiro fechado |
| Aparelho perdido ou compartilhado | Revogar sessão/dispositivo quando cabível, impedir novas sincronizações não autorizadas; avaliar cópia local e fila. Não prometer apagar remotamente aparelho offline nem destruir operações pendentes sem tratamento |
| Perda de dados ou indisponibilidade | Delimitar origem antes de restaurar; recuperar banco/arquivos/chaves de forma compatível, revalidar isolamento, operações offline e efeitos financeiros antes de retomar |

### 9.4 Comunicação e validação jurídica

Preparar comunicação com descrição factual, dados/categorias e titulares potencialmente afetados, período conhecido, medidas tomadas, riscos ainda em avaliação, orientações úteis e canal de acompanhamento. Não divulgar detalhes de exploração ou identidades protegidas a quem não precisa conhecê-los. Atualizar o comunicado quando o escopo mudar.

Os critérios, destinatários, conteúdo obrigatório, marco inicial e prazos de eventual comunicação à ANPD, titulares e controladores **não estão definidos pelas fontes internas** e exigem validação jurídica da regulamentação vigente antes do piloto. Este documento não fixa prazo legal nem dispensa comunicação. SEG-16 permanece portão de lançamento; o parecer de score/reclamações/eleições não substitui a preparação jurídica da resposta a incidentes.

### 9.5 Backup e retorno seguro

RNF-13 exige backup diário, retenção de sete dias e teste mensal de restauração. RNF-09 estabelece disponibilidade de 99,5% ao mês. RPO e RTO continuam pendentes no ADR-013; não assumir que a infraestrutura gratuita de desenvolvimento atende recuperação para dados reais.

O procedimento proposto restaura banco, objetos e material de chaves necessário em ambiente isolado e restrito; valida integridade, autorização e correspondência entre arquivos e registros; reaplica exclusões/anonimizações desde a cópia; trata revogações e credenciais comprometidas antes de liberar. Restaurar backup não deve ressuscitar sessões, permissões ou dados cuja retirada já foi determinada. Evitar duplicar cobranças, votos e lançamentos ao retomar jobs/eventos; conciliar com provedores e preservar filas offline para tratamento autorizado.

## 10. Critérios de verificação da implementação futura

Estes cenários orientam a futura estratégia de qualidade; nenhum teste de aplicação foi executado, pois ela ainda não existe. Validar controle positivo e negativo, com dados fictícios e perfis distintos, sem usar a credencial de migração como prova de RLS operacional.

| Cenário | Resultado esperado |
| --- | --- |
| Código expirado, esgotado, substituído ou já usado; e-mail inexistente | Recusa coerente com os limites e resposta sem enumeração |
| Cinco erros de senha, renovação concorrente e replay indevido | Pausa prevista; retry legítimo tratado somente pela janela aprovada; sessão comprometida revogada |
| Usuário altera condomínio/unidade/ID por URL, cabeçalho ou corpo | Sem leitura, escrita ou confirmação de recurso de outro escopo |
| Conexão de pool passa do tenant A para B; contexto ausente | Nenhum resíduo de A; ausência de contexto falha fechada |
| Criação/atualização tenta referenciar unidade de outro tenant | Recusa por aplicação e integridade/política do banco |
| Consulta com mesmo tenant, função errada ou mandato encerrado | Sem dados nem capacidade antiga; suporte sem reclamação/score e sem acesso no Essencial |
| Substituição/concessão eleitoral muda durante sessão/job | Revalidação vigente; proprietário temporário sem gestão geral e sem resultado parcial |
| Exportação fica pronta e vínculo é revogado; outro solicitante conhece job | Sem acesso a metadados/arquivo; endpoint comum não contorna a restrição |
| Revisão de arquivos gerados e notificações | Ausência de campos ocultos/proibidos e autoria protegida; fórmulas/texto/SVG tratados com segurança |
| Logout/fim do dia offline e próximo funcionário usa o aparelho | Cache indisponível; fila protegida preservada e não acessada/enviada pela nova sessão |
| Webhook repetido, fora de ordem, sem token ou sem correlação | Sem efeito financeiro duplicado/cruzado; rejeição ou quarentena conforme contrato e autenticação |
| Rate limit em rede compartilhada/retorno do offline e várias instâncias | `429`/espera consistentes, sem perda da fila e sem burlar pausa por trocar instância |
| Restauração e exercício de incidente | Evidência de isolamento/integridade, reaplicação de exclusões/revogações, conciliação e acionamento de responsáveis |

## 11. Pendências para revisão

| Pendência | Decisão/evidência necessária e responsável a envolver |
| --- | --- |
| Autorização e primeira gestão | Pedro/produto: distribuição fina da autogestão, validação de mandato, implantação inicial, designação/revogação eleitoral e exceções LGPD; sem concessão implícita |
| Sessões e acesso privilegiado | Engenharia/segurança e Pedro: ADR-007, duração total de refresh, tolerância a retry, parâmetros criptográficos, invalidação e avaliação de MFA/reautenticação |
| Criptografia de servidor | Engenharia/segurança: inventário de campos, algoritmo/biblioteca, custódia, recuperação e rotação; verificar proteção de banco/Storage/backups na infraestrutura escolhida |
| Fila e dispositivo offline | Engenharia/segurança/Pedro: P-07/ADR-003, acesso após logout, retenção, recuperação/custódia de chave e anexos; PoC sem perda de operações |
| Sigilo e pequenos grupos | Jurídico/segurança/produto: ADR-009/010, riscos de correlação, rotação HMAC e políticas de agregação dos relatórios; não afirmar anonimização sem análise |
| Segredos e operação | Engenharia/Pedro: ferramenta de cofre, distribuição de privilégios, token por webhook/subconta, inventário, responsáveis e cadência de rotação |
| Rate limiting e exportações | Engenharia/produto: cotas/janelas, armazenamento compartilhado, falhas do limitador, limites de carga/arquivos/concorrência, expiração e retenção de links/jobs |
| Incidentes | Pedro/operação/jurídico: nomear responsáveis e substitutos, contatos restritos, canais, SLAs e cobertura; validar obrigações de comunicação e preservação; exercitar o plano antes do piloto |
| Privacidade e retenção | Jurídico/produto: bases legais, encarregado, subprocessadores/transferências, contrato controlador-operadora, termos e prazos por finalidade, inclusive evidências e auditoria |
| Infraestrutura e continuidade | Pedro/engenharia: revisão obrigatória ADR-004 antes do piloto, ADR-013, RPO/RTO, backup/objetos/chaves, alertas e evidência mensal de restauração |

Pendências bloqueiam a parte correspondente do desenho/implementação; não significam aceitação tácita. Resolvê-las pode exigir atualizar outras fontes com autorização de Pedro e rastreabilidade. Esta criação não altera RN, PRD, histórias, contratos, frontend, protótipo ou ADRs.

## 12. Rastreabilidade

| Requisito | Cobertura neste documento | Fonte de detalhamento/pendência |
| --- | --- | --- |
| SEG-01 | Seções 5 e 9.5: trânsito, repouso, campos e recuperação | Arquitetura 7; inventário/chaves e provedor a validar |
| SEG-02 | Seção 6: servidor, ambientes, cofre, rotação e exposição | Arquitetura 6.5; integrações 1/2.4 |
| SEG-03 | Seção 3.1: aceite versionado por usuário/contexto | PRD 8; MER de identidade/aceites |
| SEG-04 | Seções 3 e 7: hashes, códigos, pausas e antiabuso | RN-CD-02; guia 2/10; ADR-007 proposto |
| SEG-05 | Seção 4.2: RLS e contexto transacional | Arquitetura 4; política de acesso 3; ADR-001 proposto |
| SEG-06 | Seções 2, 4.1 e 5.2: voto separado e sigilo | RN-VO-13; ADR-009 proposto; parecer pendente |
| SEG-07 | Seções 2, 4 e 5.2: score, reclamante e projeções | RN-SC-02; política de acesso 6.1; ADR-010 proposto |
| SEG-08 | Seção 8: trilha de efeitos e acesso restrito | Arquitetura 3.9.1; retenção pendente |
| SEG-09 | Seções 3.2 e 5.3: cópia local, fila e tokens | RN-OF-06; frontend 5.2; P-07/ADR-003 pendentes |
| SEG-10 | Seção 5.2: anonimização de visitantes | RN de visitantes; MER/política de retenção |
| SEG-11 | Seções 5.2 e 9.5: direitos, terceiros e restauração | RF-LG-01/02; política de acesso 7; operador excepcional pendente |
| SEG-12 | Seções 2 e 6: dados de cartão fora da API/banco/logs, integração pelo gateway | PRD 8; ADR-002 e integrações; fluxo hospedado/tokenizado a validar |
| SEG-13 | Seções 4.1 e 8: plano, escopo e registro do suporte | RN-PL-06/08; política de acesso; sem reclamações/scores |
| SEG-14 | Seções 9.1/9.4 e 11: controlador, operadora e coordenação | Contrato e validação jurídica pendentes |
| SEG-15 | Seções 6 e 11: conta recebedora e termos | PRD 8; termo versionado de responsabilidade de pessoa física e KYC dependem de revisão jurídica e gateway |
| SEG-16 | Seções 5.2, 9.4 e 11: parecer e limites do documento | Portão de lançamento do PRD; não substituído por esta proposta |
| SEG-17 | Seções 2, 4.2/4.3 e 9.3: unidade, webhook e conciliação | PRD 8; Asaas por token conforme ADR-002, não assinatura de corpo |
| SEG-18 | Seções 2, 4 e 8: agregação, finalidade e auditoria | RN financeiras; mês fechado imutável, correções por estorno; autogestão com pendências |
| RNF-06/07/08/16 | Seções 5.3, 7 e 10: offline, sincronização e critérios | RN-OF-*; frontend 5; ADR-003/014 propostos |
| RNF-11 | Seções 2, 4 e 10: isolamento em todos os canais | Arquitetura 4 e política de acesso |
| RNF-09/13 | Seções 8 e 9.5: continuidade e restauração | ADR-004/013; RPO/RTO sem compromisso aprovado |
| RNF-01/05/10/17/18 | Seções 7, 8 e 11: dimensionamento, observabilidade e limites da infraestrutura | Testes de carga e revisão de custo/infra antes do piloto |
| RN-RL-01 a 08 / RF-RL-01 a 11 | Seções 4.3, 7, 8 e 10: relatórios privados e acesso revalidado | Painel web 3/5; contrato ainda proposto; limites e retenção pendentes |

Para pagamentos, aplica-se SEG-12 integralmente: gateway certificado e nenhuma guarda de dados de cartão pelo app, API, banco ou logs. Para conta recebedora de pessoa física, SEG-15 exige termo jurídico de responsabilidade aceito pelo titular com versão/data; a arquitetura propõe bloquear ativação sem esse aceite. Isso não resolve a pendência de KYC nem autoriza ativar conta sem validação.

**Registro desta proposta:** criada em 14/11/2026 para consolidar segurança a partir da documentação existente. Sem alteração de regras de negócio, sem controles implementados e sem aceite automático de decisões técnicas.
