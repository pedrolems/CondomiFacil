# User Flows — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

## 1. Objetivo e como ler

Este documento mapeia, passo a passo, cada ação principal de cada perfil do CondomiFacil, com o caminho feliz e todos os caminhos de erro, para orientar o design das telas, o desenvolvimento e os testes.

**Fontes.** Os fluxos seguem o [Visão de Produto](../01-produto/01-visao-de-produto.md), o [PRD](../01-produto/02-prd.md), as [Regras de Negócio](../01-produto/03-regras-de-negocio.md), as [Histórias de Usuário](../01-produto/04-historias-de-usuario.md) e o [Design System](01-design-system.md). As Regras de Negócio são a fonte oficial do comportamento, e o Design System é a fonte oficial da interface (componentes, nomes de estado e textos padrão). Se um fluxo daqui divergir deles, valem eles, e este documento deve ser corrigido.

**O que este documento define.** A ordem dos passos, as decisões e o que acontece em cada erro. Como cada tela fica (componentes, cores, tamanhos) está no Design System, seções 10 e 11.

**Valores padrão.** Prazos e limites aparecem com o valor padrão (ex.: 12h para cancelar com reembolso). Em condomínios com outra configuração, vale o valor configurado (Regras de Negócio, seção 13).

**Legenda dos diagramas**

| Forma ou cor | Significado |
| --- | --- |
| `([ ])` cápsula | Início ou fim do fluxo |
| `[ ]` retângulo | Tela ou ação do usuário |
| `{ }` losango | Decisão ou verificação do sistema |
| Verde | Fim com sucesso |
| Vermelho | Erro, bloqueio ou fim sem sucesso |
| Azul tracejado | Ação automática do sistema (rotina, notificação, webhook) |

**Tabelas de erro.** Cada fluxo tem uma tabela com a situação, o que o usuário vê, como ele sai do erro e a regra que define o comportamento. Os textos seguem o tom e os termos do Design System (seção 13): direto, sem culpa e sempre com o próximo passo. Os nomes de estado entre aspas são os textos exatos dos selos (Design System, 4.5).

**Princípios aplicados a todos os fluxos**

1. **Até 3 toques** a partir da tela inicial para reservar, cadastrar visitante, abrir chamado e registrar entrada; na portaria, até 2 (RNF-15). Contagem conforme o Design System, seção 2.
2. **Nenhum erro sem saída.** Toda mensagem diz o que aconteceu e o que fazer em seguida.
3. **A portaria nunca para.** Falha de internet ou do app nunca impede uma entrada; o interfone continua valendo (RN-VI-04).
4. **Privacidade por padrão.** Nenhuma mensagem de erro revela dado de outra pessoa: quem reservou, quem reclamou, quem está em atraso ou se um e-mail está cadastrado.

## 2. Mapa dos fluxos

| # | Fluxo | Perfil principal | Gatilho | Histórias |
| --- | --- | --- | --- | --- |
| 3.1 | Primeiro acesso | Todos | Convite por e-mail | US-AC-01 a US-AC-03 |
| 3.2 | Login e recuperação de senha | Todos | Abrir o app sem sessão | US-AC-04 |
| 3.3 | Novo aceite e troca de unidade | Todos | Nova versão de termos; ter várias unidades | US-AC-02, US-AC-05 |
| 4.1 | Implantação e pré-cadastro | Administradora, Suporte | Novo condomínio | US-AD-01, US-AD-04, US-AD-05, US-AD-08 |
| 4.2 | Solicitação do síndico | Síndico | Mudança em cadastro | US-AD-02 |
| 4.3 | Mudança de morador e desligamento | Administradora, Suporte | Saída de alguém | US-AD-03, US-AD-09 |
| 4.4 | Mandatos e substituição | Administradora, Síndico | Eleição, ausência ou renúncia | US-AD-06, US-AD-07 |
| 4.5 | Locação e unidade desocupada | Administradora, Proprietário não residente | Contrato de locação | US-AD-10, US-AD-11 |
| 5.1 | Fazer reserva | Morador | Querer usar uma área | US-RE-01 a US-RE-03, US-RE-05 |
| 5.2 | Cancelar reserva | Morador, Condomínio | Desistência ou manutenção | US-RE-04 |
| 5.3 | Vistoria e não comparecimento | Portaria, Limpeza | Fim da reserva | US-RE-06 |
| 6.1 | Cadastrar visitante | Morador | Visita prevista | US-VI-01, US-VI-02 |
| 6.2 | Registrar entrada e saída | Portaria | Visitante na portaria | US-VI-03, US-VI-05 |
| 6.3 | Portaria sem internet e sincronização | Portaria | Queda de conexão | US-VI-04 |
| 6.4 | Modo de treinamento | Portaria | Novo porteiro | US-VI-06 |
| 6.5 | Montar lista de visitantes | Morador, Portaria | Festa ou evento com vários convidados | US-VI-07, US-VI-08 |
| 7.1 | Encomendas | Portaria, Morador | Entrega na portaria | US-EN-01, US-EN-02 |
| 7.2 | Entregas esperadas | Morador, Portaria | Pacote a caminho | US-EN-03, US-EN-04 |
| 8.1 | Abrir chamado (com urgência) | Morador, Síndico, Portaria | Problema no condomínio | US-CH-01 |
| 8.2 | Atender chamado de limpeza | Limpeza | Chamado na fila | US-CH-02 |
| 8.3 | Acompanhar manutenção | Síndico, Subsíndico | Chamado de manutenção | US-CH-03, US-AD-12 |
| 8.4 | Avaliar o atendimento do chamado | Morador, Síndico morador, Subsíndico | Chamado concluído | US-CH-04 |
| 8.5 | Acompanhar as avaliações de atendimento | Síndico, Administradora, Funcionário | Avaliações recebidas | US-CH-05 |
| 9.1 | Registrar reclamação | Morador | Problema de convivência | US-RS-01, US-RS-04, US-RS-08 |
| 9.2 | Julgar reclamação | Julgador | Reclamação aberta | US-RS-02, US-RS-03, US-RS-08 |
| 9.3 | Recorrer | Quem perdeu pontos | Decisão com perda de pontos | US-RS-05 |
| 9.4 | Acompanhar score e transparência | Todos | Consulta | US-RS-06, US-RS-07 |
| 10.1 | Comunicados | Síndico, Subsíndico | Aviso ao condomínio | US-CO-01 a US-CO-03 |
| 11.1 | Convocar reunião e votar | Síndico, Proprietário, Inquilino | Assembleia | US-VO-01, US-VO-02 |
| 11.2 | Eleição de síndico e subsíndico | Síndico, Administradora, Morador | Fim de mandato | US-VO-03 |
| 12.1 | Pesquisa mensal | Morador | Mês aberto | US-PE-01, US-PE-02 |
| 13.1 | Pagar a taxa condominial | Responsável financeiro | Cobrança emitida | US-FI-02, US-FI-03 |
| 13.2 | Configurar cobrança, extras e inadimplência | Administradora, Síndico | Implantação ou atraso | US-FI-01, US-FI-04, US-FI-05 |
| 13.3 | Controlar receitas e despesas | Administradora, Suporte | Pagamento recebido ou conta a lançar | US-FI-07 a US-FI-09 |
| 13.4 | Acompanhar as finanças do condomínio | Síndico, Subsíndico, Conselho fiscal | Conferência do mês | US-FI-07, US-FI-10 |
| 14.1 | Notificações e direitos do titular (LGPD) | Todos | Preferência ou pedido | US-NO-01, US-LG-01 |

## 3. Acesso e conta

### 3.1 Primeiro acesso

Ninguém cria conta sozinho: a pessoa já foi pré-cadastrada e só ativa o acesso com um código enviado ao e-mail (RN-CD-01, RN-CD-02).

- **Perfil:** todos.
- **Pré-condição:** pré-cadastro feito pela administradora ou pelo suporte.
- **Resultado:** conta ativa, termos aceitos e tela inicial do perfil.

```mermaid
flowchart TD
    A(["Abre o convite ou o app"]) --> B["Informa o e-mail"]
    B --> C["Mensagem única: se o e-mail estiver cadastrado, um código foi enviado"]
    C --> D{"E-mail pré-cadastrado e ativo?"}
    D -->|"Não"| E1(["Nenhum código chega; a tela orienta procurar a administradora ou o síndico"])
    D -->|"Sim"| F["Recebe código de 6 dígitos, válido por 15 min"]
    F --> G["Digita o código"]
    G --> H{"Código correto e no prazo?"}
    H -->|"Errado, menos de 5 tentativas"| E2["Código incorreto; mostra tentativas restantes"]
    E2 --> G
    H -->|"5 erros ou vencido"| E3["Código invalidado; botão Pedir novo código liberado após 60 s"]
    E3 --> B
    H -->|"Sim"| I["Cria a senha"]
    I --> J{"Senha com 8 ou mais caracteres e confirmação igual?"}
    J -->|"Não"| E4["Mostra o requisito que falta"]
    E4 --> I
    J -->|"Sim"| K["Lê e aceita termos, privacidade, regimento e Como funciona"]
    K --> L{"Aceitou todos?"}
    L -->|"Não"| E5(["Não entra no app; pode voltar depois e aceitar"])
    L -->|"Sim"| M["Onboarding de 3 a 5 telas do perfil"]
    M --> N{"Pulou?"}
    N -->|"Sim ou concluiu"| O(["Tela inicial do perfil"])
    S1["Sistema grava versão e data de cada aceite"]
    K -.-> S1
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class O ok
    class E1,E2,E3,E4,E5 erro
    class S1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| E-mail não cadastrado ou desativado | A mesma mensagem de e-mail cadastrado; o código não chega. Abaixo: "Não recebeu? Confira o e-mail digitado ou procure a administradora ou o síndico." | Corrige o e-mail ou pede o pré-cadastro | RN-CD-01, RN-CD-02 |
| Código errado | "Código incorreto. Você tem mais N tentativas." | Digita de novo | RN-CD-02 |
| 5 erros ou código vencido | "Este código não vale mais. Peça um novo." | Pede novo código (após 60 s); o anterior é invalidado | RN-CD-02 |
| Senha fraca | Lista do requisito com o item pendente destacado | Ajusta a senha | RF-AC-01 |
| Não aceita os termos | "Para usar o CondomiFacil, é preciso aceitar os documentos do seu condomínio." | Aceita depois; a conta fica ativa, mas sem acesso | RN-CD-03 |
| Sem internet | "Não foi possível conectar. Verifique a internet e tente de novo." | Tenta de novo | DS 13.4 |

O proprietário não residente vê o onboarding de proprietário (unidade, cobranças e assembleias) e entra na aba Unidade (RN-CD-19).

### 3.2 Login e recuperação de senha

O login usa e-mail e senha; a recuperação repete o fluxo do código do primeiro acesso.

```mermaid
flowchart TD
    A(["Abre o app sem sessão"]) --> B["Informa e-mail e senha"]
    B --> C{"Conta bloqueada temporariamente?"}
    C -->|"Sim"| E1["Aguarde 15 min ou redefina a senha"]
    C -->|"Não"| D{"E-mail e senha conferem?"}
    D -->|"Não"| E2["E-mail ou senha incorretos"]
    E2 --> F{"5 erros seguidos?"}
    F -->|"Não"| B
    F -->|"Sim"| E1
    D -->|"Sim"| G{"Conta ativa?"}
    G -->|"Não, desativada por mudança ou desligamento"| E3(["Acesso desativado; procure a administradora"])
    G -->|"Sim"| H{"Há nova versão de termos?"}
    H -->|"Sim"| I["Fluxo 3.3: novo aceite"]
    H -->|"Não"| J(["Tela inicial na última unidade ativa"])
    I --> J
    E1 --> R["Esqueci minha senha"]
    B --> R
    R --> R1["Informa o e-mail e recebe código, mesmas regras de 3.1"]
    R1 --> R2["Cria nova senha"]
    R2 --> R3["Sistema encerra as outras sessões"]
    R3 --> J
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class J ok
    class E1,E2,E3 erro
    class R3 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| E-mail ou senha errados | "E-mail ou senha incorretos." (sem dizer qual dos dois) | Tenta de novo ou redefine a senha | SEG-04 |
| 5 senhas erradas seguidas | "Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora." | Espera ou redefine | SEG-04 |
| Conta desativada | "Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora." | Contato com a administradora | RN-CD-07 |
| Vínculo com outro condomínio ainda ativo | Entra normalmente, só com as unidades ativas | — | RN-CD-05 |

### 3.3 Novo aceite e troca de unidade

- **Novo aceite.** Ao abrir o app depois que termos, política, regimento ou "Como funciona" mudaram, o usuário vê só o que mudou e aceita antes de continuar (RN-CD-03). Quem tem vínculo com dois condomínios aceita o regimento de cada um ao entrar nele. Recusar mantém a sessão, mas bloqueia o uso até o aceite.
- **Troca de unidade.** Quem tem duas ou mais unidades vê o seletor no topo da tela inicial (RF-AC-04). Ao trocar, reservas, visitantes, reuniões, cobranças e métricas recarregam só para a unidade escolhida. Se a unidade foi desvinculada enquanto o app estava aberto, ela some do seletor e o app abre a próxima unidade ativa, com o aviso "Você não tem mais acesso à unidade X."

## 4. Administração do condomínio

Nesta seção, "administradora" inclui a equipe de suporte da plataforma nos condomínios do plano Gestão + Suporte, conforme a regra de leitura das Regras de Negócio (seção 1).

### 4.1 Implantação e pré-cadastro

A implantação segue uma ordem fixa, porque cada etapa depende da anterior: estrutura, conta bancária, pessoas e, por fim, regras.

```mermaid
flowchart TD
    A(["Admin da plataforma cadastra o condomínio e o plano"]) --> B["Administradora cadastra blocos, portarias e unidades"]
    B --> C["Cadastra a conta bancária do condomínio"]
    C --> C1{"Titular é o CNPJ do condomínio?"}
    C1 -->|"Não, pessoa física"| C2{"Titular aceitou o termo de responsabilidade?"}
    C2 -->|"Não"| E1["Conta não é salva; sem ela não há áreas pagas nem cobrança"]
    C2 -->|"Sim"| D
    C1 -->|"Sim"| D["Importa a planilha de moradores e funcionários"]
    E1 --> D
    D --> F["Prévia: linhas válidas e erros por linha"]
    F --> G{"Há erros?"}
    G -->|"Sim"| E2["Corrige na planilha ou na prévia e reimporta"]
    E2 --> F
    G -->|"Não"| H{"Toda unidade ocupada tem morador habilitado?"}
    H -->|"Não"| E3["Destaca as unidades sem habilitado e exige a escolha ou a marcação como desocupada"]
    E3 --> H
    H -->|"Sim"| I["Confirma a importação"]
    I --> S1["Sistema envia o convite de primeiro acesso a cada pessoa"]
    S1 --> J["Registra mandatos, conselho fiscal e áreas comuns"]
    J --> K{"Valores dentro da faixa permitida?"}
    K -->|"Não"| E4["Recusa e mostra a faixa permitida"]
    E4 --> J
    K -->|"Sim"| L(["Condomínio pronto, com regras padrão"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class L ok
    class E1,E2,E3,E4 erro
    class S1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Planilha fora do modelo | "O arquivo não segue o modelo. Baixe o modelo e preencha de novo." | Baixa o modelo | RF-AD-01 |
| Linha com e-mail repetido, unidade inexistente ou campo obrigatório vazio | Linha em vermelho com o motivo | Corrige e reimporta; linhas válidas não são perdidas | RF-AD-01 |
| Unidade sem morador habilitado | "Escolha o morador habilitado da unidade X ou marque-a como desocupada." | Escolhe ou marca | RN-CD-04, RN-CD-24 |
| Unidade alugada na planilha | Colunas do inquilino com início e fim do contrato; o proprietário entra como não residente | Preenche | RN-CD-20 |
| Síndico e subsíndico da mesma unidade | "Síndico e subsíndico precisam ser de unidades diferentes." | Escolhe outra pessoa | RN-CD-10 |
| Condomínio sem subsíndico nem conselho fiscal | Alerta pendente no painel até cadastrar um membro do conselho | Cadastra o conselho | RN-VO-09 |
| Área paga sem conta bancária | "Cadastre a conta bancária do condomínio antes de criar áreas pagas." | Cadastra a conta | RN-PG-03 |
| Parâmetro fora da faixa | "Informe um valor entre [mínimo] e [máximo]." | Ajusta | RN 13, DS 13.4 |
| Importação inicial no plano Gestão + Suporte | — (não conta na franquia) | — | RN-PL-03 |

### 4.2 Solicitação do síndico

O síndico nunca cadastra diretamente; ele envia uma solicitação, que a administradora atende ou recusa com motivo (RN-CD-06).

```mermaid
flowchart TD
    A(["Síndico abre Gestão > Solicitações"]) --> B["Escolhe incluir, alterar ou remover e preenche"]
    B --> C{"Plano Gestão + Suporte?"}
    C -->|"Sim"| D["Mostra solicitações restantes na franquia do mês"]
    D --> D1{"Franquia esgotada?"}
    D1 -->|"Sim"| D2["Avisa: esta custará R$ 15 na próxima fatura"]
    D2 --> D3{"Confirma?"}
    D3 -->|"Não"| E1(["Solicitação não enviada"])
    D3 -->|"Sim"| F
    D1 -->|"Não"| F
    C -->|"Não"| F["Solicitação pendente"]
    F --> G{"Administradora atende?"}
    G -->|"Atende"| H(["Concluída; síndico notificado"])
    G -->|"Recusa com motivo"| E2(["Recusada; síndico notificado com o motivo; não conta na franquia"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    class H ok
    class E1,E2 erro
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Franquia esgotada | "Você já usou as N solicitações do mês. Esta custará R$ 15 na próxima fatura." | Confirma ou espera o próximo mês | RN-PL-05 |
| Solicitação recusada | Notificação com o motivo | Corrige e envia de novo | RN-CD-06 |
| Dados incompletos | Campo obrigatório destacado | Preenche | RF-AD-02 |

### 4.3 Mudança de morador e desligamento de funcionário

```mermaid
flowchart TD
    A(["Administradora registra mudança de morador"]) --> B{"É o morador habilitado?"}
    B -->|"Sim"| C["Exige escolher o novo morador habilitado da unidade"]
    B -->|"Não"| D
    C --> D["Confirma a mudança"]
    D --> S1["Acesso desativado na hora; histórico mantido"]
    S1 --> S2["Reservas futuras canceladas com reembolso integral"]
    S2 --> S3["Visitas recorrentes encerradas"]
    S3 --> Z(["Mudança registrada"])
    F(["Administradora desliga funcionário"]) --> F1["Sistema devolve os chamados abertos à fila do setor"]
    F1 --> F2(["Acesso desativado; notas da pesquisa ficam no histórico"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z,F2 ok
    class S1,S2,S3,F1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Unidade ficaria sem morador habilitado | "Escolha quem passa a responder pela unidade ou marque-a como desocupada." | Escolhe ou marca | RN-CD-04, RN-CD-24 |
| Quem sai é o inquilino | A mudança encerra o contrato de locação na data informada | Fluxo 4.5 | RN-CD-21 |
| Morador era responsável financeiro | "Defina o novo responsável pelas despesas [ordinárias/extraordinárias]." (padrão: novo morador habilitado; na unidade desocupada, o proprietário) | Confirma ou escolhe | RN-FI-03 |
| Morador era síndico ou subsíndico | "Esta pessoa tem mandato ativo. Encerre o mandato antes." | Fluxo 4.4 | RN-CD-13 |

### 4.4 Mandatos e substituição do síndico

```mermaid
flowchart TD
    A(["Ausência, renúncia ou destituição do síndico"]) --> B{"Fim do mandato ou ausência temporária?"}
    B -->|"Ausência temporária"| C["Síndico ou administradora ativa a substituição"]
    C --> C1{"Há subsíndico?"}
    C1 -->|"Não"| E1["Substituição indisponível"]
    C1 -->|"Sim"| C2["Subsíndico ganha as funções de síndico, exceto desativar a substituição; sugestões pendentes voltam para ele"]
    C2 --> C3["Síndico ou administradora desativa quando quiser"]
    C3 --> Z1(["Funções voltam ao síndico na hora; tudo registrado"])
    B -->|"Fim antecipado"| D["Administradora encerra o mandato"]
    D --> D1{"Há subsíndico?"}
    D1 -->|"Sim"| D2["Subsíndico assume até a nova eleição"]
    D1 -->|"Não"| D3["Administradora recebe alerta e abre a nova eleição; funções de síndico ficam sem titular até a posse"]
    D2 --> Z2(["Fluxo 11.2: eleição"])
    D3 --> Z2
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    class Z1,Z2 ok
    class E1,D3 erro
```

Fora da substituição, o subsíndico tem as mesmas abas do síndico, com a Gestão enxuta (RN-CD-27): reclamações contra o síndico, chamados de manutenção só para acompanhar, comunicados e sugestões, reuniões para registrar votos presenciais, encomendas com prazo vencido e o estado da substituição. Ao abrir uma função que é só do síndico, vê "Esta função é do síndico. Você passa a ter acesso quando a substituição pelo subsíndico estiver ativa."

### 4.5 Locação: inquilino, fim do contrato e unidade desocupada

O inquilino responde pela unidade no dia a dia; o proprietário continua votando e acompanha a unidade sem ver a rotina do inquilino (RN-CD-19 a RN-CD-26).

```mermaid
flowchart TD
    A(["Proprietário pede o cadastro do inquilino, ou a administradora o inicia"]) --> B["Administradora informa o inquilino, os dependentes e as datas de início e fim do contrato"]
    B --> C{"Datas válidas?"}
    C -->|"Não"| E1["Recusa e pede datas válidas"]
    E1 --> B
    C -->|"Sim"| D["Inquilino vira morador habilitado; proprietário passa a não residente"]
    D --> D1["Responsáveis financeiros sugeridos: inquilino nas ordinárias, proprietário nas extraordinárias"]
    D1 --> S1["Convite de primeiro acesso ao inquilino e aos dependentes"]
    S1 --> F(["Alugada"])
    F --> S2["30 dias antes do fim: aviso à administradora, ao proprietário e ao inquilino"]
    S2 --> G{"Renova?"}
    G -->|"Sim, com nova data de fim"| F
    G -->|"Encerra ou não responde"| S3["7 dias após o fim: inquilino e dependentes desativados, como numa mudança (fluxo 4.3)"]
    S3 --> H(["Desocupada"])
    H --> I{"O que acontece depois?"}
    I -->|"Novo inquilino"| B
    I -->|"Proprietário volta a morar"| J(["Ocupada pelo proprietário"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class F,H,J ok
    class E1 erro
    class S1,S2,S3 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Data de fim antes do início | "A data de fim precisa ser depois do início do contrato." | Corrige | RN-CD-20 |
| Inquilino escolhe uma data de reserva depois do fim do contrato | A data aparece indisponível: "Seu contrato vai até [data]." | Escolhe outra data ou pede a renovação ao proprietário | RN-CD-22 |
| Visita recorrente além do fim do contrato | O término vem preenchido com o fim do contrato e não pode passar dele | Ajusta | RN-CD-22 |
| Proprietário pede cadastro, renovação ou encerramento | O pedido entra na fila de solicitações da administradora | Acompanha em Unidade | RN-CD-23 |
| Pedido do proprietário recusado | Notificação com o motivo | Corrige e envia de novo | RN-CD-23 |
| Inquilino sai com cobranças em aberto | As cobranças emitidas continuam no nome dele; as novas ordinárias vão ao proprietário enquanto a unidade estiver desocupada | A administradora acompanha na inadimplência | RN-FI-03 |
| Ação de morador numa unidade desocupada | Reservas, visitantes e chamados não aparecem para a unidade | — | RN-CD-24 |
| Hóspede de temporada com a temporada desligada (padrão) | A opção não aparece para o proprietário | — | RN-VI-10 |
| Proprietário volta a morar | A administradora muda o vínculo; ele ganha as abas de morador e score 100 | — | RN-CD-25 |

## 5. Reservas

### 5.1 Fazer reserva

A reserva gratuita é confirmada na hora; a paga segura o horário enquanto espera o pagamento (RN-RE-02, RN-RE-03).

- **Perfil:** morador, síndico morador e subsíndico.
- **Toques:** Reservas → Reservar (2), mais a escolha da área, do dia e do horário.

```mermaid
flowchart TD
    A(["Toca em Reservas e escolhe a área"]) --> B["Calendário: livre, ocupado e indisponível"]
    B --> C{"Área gratuita e meu score nesta unidade igual ou menor que 60?"}
    C -->|"Sim"| E1["Horários indisponíveis, com o motivo e link para o score"]
    C -->|"Não"| D{"Unidade em atraso com bloqueio ligado?"}
    D -->|"Sim"| E2["Novas reservas bloqueadas até quitar"]
    D -->|"Não"| G{"Horário dentro da antecedência: 24h a 60 dias?"}
    G -->|"Não"| E3["Calendário marca o horário como Indisponível"]
    G -->|"Sim"| H{"Unidade já fez 2 reservas na área este mês?"}
    H -->|"Sim"| E4["Calendário marca os horários do mês como Indisponível: limite atingido"]
    H -->|"Não"| F["Escolhe um horário livre"]
    F --> I["Toca em Reservar"]
    I --> J{"Horário ainda livre no servidor?"}
    J -->|"Não, outro pedido chegou antes"| E5["Horário acabou de ser reservado; mostra próximos livres"]
    E5 --> B
    J -->|"Sim"| K{"Área paga?"}
    K -->|"Não"| Z1(["Confirmada"])
    K -->|"Sim"| L["Aguardando pagamento; horário bloqueado"]
    L --> M["Paga por Pix ou cartão"]
    M --> N{"Pagamento aprovado?"}
    N -->|"Sim"| Z2(["Confirmada; comprovante por e-mail"])
    N -->|"Recusado"| E6["Pagamento recusado; tente de novo ou use outro meio"]
    E6 --> O{"Prazo de pagamento venceu? 24h ou início da reserva"}
    O -->|"Não"| M
    O -->|"Sim"| S1["Rotina expira a reserva e libera o horário"]
    S1 --> E7(["Expirada"])
    Z1 --> V{"Data depois de hoje, sem lista vinculada e não dispensada com Agora não?"}
    Z2 --> V
    V -->|"Sim"| V1["Faixa: Vai receber convidados? Montar lista ou Agora não"]
    V -->|"Não"| V2(["Sem sugestão"])
    V1 -->|"Montar lista"| V3["Fluxo 6.5, com data, horário e local da reserva"]
    Z1 --> R{"Reserva confirmada antes do horário de envio do lembrete e lembrete ligado?"}
    Z2 --> R
    R -->|"Sim"| R1["24h antes do início, a rotina envia o push de lembrete; se esse horário cair entre 00:00 e 08:59, o push sai às 21:00 da noite anterior"]
    R1 --> R2["Toque abre o detalhe, com atalho para cancelar (fluxo 5.2)"]
    R -->|"Não"| R3(["Sem lembrete"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2 ok
    class E1,E2,E3,E4,E5,E6,E7 erro
    class S1,V1,V3,R1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Score igual ou menor que 60 em área gratuita | Aviso fixo no topo do calendário: "Seu score está em 58. Reservas gratuitas voltam quando ele passar de 60. Áreas pagas continuam liberadas." Horários com o estado "Indisponível" e ícone de cadeado (DS 4.6) | Reserva área paga ou espera recuperar; outros moradores da unidade reservam normalmente | RN-SC-09, RN-SC-10 |
| Unidade em atraso, com bloqueio ligado | "Novas reservas estão bloqueadas enquanto houver cobrança em atraso." (só para quem pode ver a situação financeira da unidade; os demais moradores veem "Reservas indisponíveis para esta unidade no momento") | Paga a cobrança | RN-RE-11, RN-FI-10 |
| Fora da antecedência | Horário "Indisponível" (DS 4.6); ao tocar: "Reservas desta área: de 24h a 60 dias antes." | Escolhe outra data | RN-RE-06 |
| Limite mensal atingido | "Sua unidade já usou as 2 reservas deste mês nesta área." | Escolhe outro mês ou cancela outra reserva | RN-RE-07 |
| Corrida pelo mesmo horário | "Este horário acabou de ser reservado." + sugestões | Escolhe outro horário | RN-RE-04 |
| Pagamento recusado | "O pagamento não foi aprovado. Seu horário fica guardado até [hora]." | Tenta de novo ou troca o meio | RN-RE-03 |
| Prazo de pagamento vencido | Push: "Sua reserva expirou porque o pagamento não foi concluído." | Faz nova reserva, se o horário seguir livre | RN-RE-03 |
| Gateway fora do ar | "O pagamento está indisponível agora. Seu horário fica guardado até [hora]." | Tenta de novo depois | RN-RE-03 |
| Reserva confirmada com data futura e sem lista | Faixa `info` na confirmação e no detalhe: "Vai receber convidados? Monte a lista de visitantes." | "Montar lista" abre o fluxo 6.5 com data, horário e local da reserva; "Agora não" esconde para esta reserva | RN-RE-12, RN-VI-14 |
| Reserva com lista vinculada | No detalhe, linha "Lista: N pessoas", com o nome da lista e "M chegaram" | Abre o detalhe da lista | RN-RE-12 |
| Reserva aguardando pagamento, expirada, cancelada, em andamento, cumprida ou com data de hoje | Nenhuma sugestão | — | RN-RE-12 |
| Reserva cancelada com lista vinculada | Lista cancelada junto, com mensagem rápida: "Reserva cancelada. A lista vinculada também foi cancelada." | Monta outra lista, se quiser | RN-VI-14 |
| Reserva confirmada, 24h antes do início (lembrete ligado) | Push: "Reserva amanhã" / "Salão de festas, amanhã, das 19h às 23h. Toque para ver ou cancelar." Se o horário de 24h antes cair entre 00:00 e 08:59, o push sai às 21:00 da noite anterior a ele (por exemplo, reserva às 02:00 de sábado: push na quinta às 21:00) e o texto usa o dia e o horário reais: "Reserva no sábado" / "Salão de festas, sábado, das 02h às 06h. Toque para ver ou cancelar." (D-39) | O toque abre o detalhe da reserva, com "Cancelar reserva" (fluxo 5.2); ignorar não altera a reserva | RN-RE-14 |
| Reserva aguardando pagamento, expirada, cancelada ou confirmada depois do horário de envio do lembrete (inclusive depois das 21:00 antecipadas; decidido em 09/11/2026) | Nenhum push de lembrete | — | RN-RE-14 |
| Lembrete desligado nas preferências | Nenhum push de lembrete; a reserva segue normal | Liga em Configurações > Notificações (fluxo 14.1) | RN-RE-14, RF-NO-01 |

### 5.2 Cancelar reserva

```mermaid
flowchart TD
    A(["Abre a reserva e toca em Cancelar"]) --> B{"A reserva já começou?"}
    B -->|"Sim"| E1(["Opção Cancelar não aparece"])
    B -->|"Não"| C{"Tipo e situação"}
    C -->|"Gratuita ou paga ainda não paga"| D["Confirma o cancelamento"]
    C -->|"Paga, faltam mais de 12h"| F["Aviso: reembolso integral"]
    C -->|"Paga, faltam 12h ou menos"| G["Aviso: não haverá reembolso"]
    G --> G1{"Confirma mesmo assim?"}
    G1 -->|"Não"| Z0(["Reserva mantida"])
    G1 -->|"Sim"| D
    F --> D
    D --> S1["Horário liberado na hora"]
    S1 --> H{"Qual cancelamento?"}
    H -->|"Gratuita ou paga ainda não paga"| Z1(["Cancelada"])
    H -->|"Paga, faltavam mais de 12h"| S2["Pix em até 2 dias úteis ou estorno no cartão; comprovante"]
    S2 --> Z2(["Cancelada com reembolso"])
    H -->|"Paga, faltavam 12h ou menos"| Z3(["Cancelada sem reembolso"])
    X(["Condomínio cancela: manutenção ou mudança de morador"]) --> X1["Reembolso integral em qualquer prazo"]
    X1 --> X2["Morador avisado com o motivo"]
    X2 --> S1
    H -->|"Pelo condomínio"| Z4(["Cancelada pelo condomínio; reembolso integral se houve pagamento"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z0,Z1,Z2,Z3,Z4 ok
    class E1 erro
    class S1,S2,X1,X2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Cancelar depois do prazo de reembolso | "Faltam menos de 12h. Se cancelar, o valor não será devolvido." | Confirma ou mantém | RN-CA-03 |
| Reembolso falhou no gateway | Push: "Seu reembolso está atrasado. Já estamos resolvendo." A administradora recebe alerta | Acompanha no histórico | RN-CA-04, SEG-17 |
| Reserva já começou | Sem botão de cancelar | — | RN-CA-01 |
| Chegou pelo atalho do push de lembrete | Detalhe da reserva com "Cancelar reserva"; vale o mesmo aviso de reembolso (integral até 12h antes, depois sem reembolso). Cancelar não tira pontos | Confirma ou mantém | RN-RE-14, RN-CA-02, RN-CA-03 |

### 5.3 Reservas do dia, vistoria e não comparecimento

```mermaid
flowchart TD
    A(["Portaria abre Áreas: Reservas de hoje"]) --> H["Vê área, horário, unidade e estado, sem dados financeiros"]
    H --> I{"Confirmada e início já chegou?"}
    I -->|"Sim, uso constatado"| J["Pode marcar Em andamento; guarda autor e momento"]
    I -->|"Ainda não"| K["Consulta sem marcar uso"]
    J --> V["Ao fim do uso: portaria ou limpeza abre a vistoria"]
    H --> V
    V --> B{"O morador usou a área?"}
    B -->|"Não: Confirmada e horário já terminou"| C["Registra Não comparecimento, paga ou gratuita"]
    C --> P{"Reserva gratuita?"}
    P -->|"Sim"| S1["Rotina diária: a cada 2 faltas no trimestre pelo mesmo vínculo de moradia, menos 5 pontos a quem reservou"]
    P -->|"Não"| Z3(["Não comparecimento, sem perda de pontos nem reembolso automático"])
    B -->|"Sim"| D["Preenche o checklist e tira fotos"]
    D --> E{"Encontrou dano?"}
    E -->|"Não"| Z1(["Cumprida"])
    E -->|"Sim"| F["Sistema abre reclamação contra a unidade em nome do condomínio, com as fotos"]
    F --> Z2(["Cumprida; fluxo 9.2: julgamento normal"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2,Z3 ok
    class S1,F sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Checklist incompleto | Itens obrigatórios destacados | Completa | RF-RE-08 |
| Sem internet | "Reservas e vistorias precisam de internet. Seu preenchimento foi mantido."; envio desabilitado | Reconecta e envia; sem fila offline de reservas | RN-RE-13; UF 15 |
| Aguardando pagamento, Expirada ou Cancelada | Estado visível; sem ações de uso | Apenas consulta | RN-RE-13 |
| Antes do início ou do término | Antes do início, sem marcar Em andamento; antes do fim previsto, sem Não comparecimento. Uso já encerrado permite Cumprida, mantendo intervalo reservado | Aguarda ou faz vistoria após uso | RN-RE-13 |
| Reserva Confirmada já terminou sem marcação de início | Vistoria disponível normalmente | Marca Cumprida ou Não comparecimento | RN-RE-09, RN-RE-13 |
| Reclamação de vistoria negada | Nenhuma penalidade a ninguém, porque não há reclamante pessoa | — | RN-RC-12 |

**Estados de uso:** "Confirmada" pode passar a "Em andamento"; ao fim do uso, "Confirmada" ou "Em andamento" passa a "Cumprida" na vistoria. "Não comparecimento" só parte de "Confirmada" após o fim do horário, sem uso constatado. "Cumprida" substitui o nome anterior "Realizada". As transições de pagamento e cancelamento continuam nas Regras de Negócio, 7.4. Não é necessário registrar o início antes da conclusão; conclusão antecipada não libera o intervalo original antes do fim. A limpeza mantém a vistoria; marcar início é função da portaria.

## 6. Visitantes e portaria

### 6.1 Cadastrar visitante

- **Perfil:** morador, síndico morador e subsíndico.
- **Toques:** Visitantes → Novo → Salvar (3) (digitar o nome não conta).

```mermaid
flowchart TD
    A(["Toca em Visitantes e Novo"]) --> B["Informa o nome; documento opcional"]
    B --> C{"Avulso ou recorrente?"}
    C -->|"Avulso"| D["Data da visita: hoje por padrão"]
    C -->|"Recorrente"| F["Dias da semana; faixa de horário e data de término opcionais"]
    D --> G{"Nome preenchido?"}
    F --> G
    G -->|"Não"| E1["Nome é obrigatório"]
    E1 --> B
    G -->|"Sim"| H{"Sem internet?"}
    H -->|"Sim"| E2["Não salva; orienta avisar a portaria pelo interfone"]
    H -->|"Não"| S1["Aparece na lista da portaria em até 5 s"]
    S1 --> Z(["Esperado"])
    Z --> K{"Editar ou cancelar depois?"}
    K -->|"Sim"| S2["Lista da portaria atualizada na hora"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z ok
    class E1,E2 erro
    class S1,S2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Nome em branco | "Informe o nome do visitante." | Preenche | RN-VI-02 |
| Data no passado | Datas anteriores a hoje desabilitadas | Escolhe outra data | RN-VI-02 |
| Morador sem internet | "Sem internet. Seu visitante ainda pode entrar: a portaria vai confirmar com você pelo interfone." | Tenta de novo ou autoriza pelo interfone | RN-VI-04 |
| Visitante avulso não veio | Às 23h59 do dia previsto, a visita fica "Não compareceu" | Cadastra de novo se a visita mudar de data | RN-VI-09 |
| Morador mudou de unidade | Visitas recorrentes dele são encerradas | — | RN-VI-08 |

### 6.2 Registrar entrada e saída

A portaria encontra o visitante e registra a entrada em até 2 toques; o cadastro agiliza, mas o interfone continua valendo (RN-VI-04).

```mermaid
flowchart TD
    A(["Visitante chega à portaria"]) --> B["Porteiro busca por nome, unidade ou bloco"]
    B --> C{"Na lista de bloqueio?"}
    C -->|"Sim"| D["Alerta com o motivo"]
    D --> D1{"Porteiro decide liberar?"}
    D1 -->|"Não"| E1(["Entrada negada e registrada"])
    D1 -->|"Sim"| G
    C -->|"Não"| F{"Está na lista de esperados hoje?"}
    F -->|"Sim"| G["Registrar entrada: 1 toque"]
    F -->|"Não"| H["Interfona para o morador"]
    H --> H1{"Morador autoriza?"}
    H1 -->|"Não ou não atende"| E2(["Entrada não autorizada"])
    H1 -->|"Sim"| H2["Registra como autorizado por interfone"]
    H2 --> S1
    G --> S1["Morador recebe push da entrada"]
    S1 --> I["Visitante dentro"]
    I --> J{"Saída registrada?"}
    J -->|"Sim"| Z1(["Saiu"])
    J -->|"Não em 24h"| S2["Rotina encerra como saída não registrada"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1 ok
    class E1,E2 erro
    class S1,S2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Pessoa na lista de bloqueio | Diálogo bloqueante com o motivo; botões "Não liberar" (principal) e "Liberar mesmo assim", que pede o motivo | Porteiro decide; a decisão fica registrada | RN-VI-05, DS 11.1 |
| Não encontrado na lista | Botão flutuante "Entrada sem cadastro": nome, unidade e marcação "Autorizado por interfone" | Interfona e registra | RN-VI-04, DS 11.1 |
| Entrada registrada por engano | Mensagem rápida com "Desfazer" por 10 s, no lugar de um diálogo de confirmação | Toca em "Desfazer" | DS 11.1 |
| Visitante de outro bloco, fora desta portaria | Sem resultado, com o aviso "Esta portaria atende os blocos X e Y." | Orienta o visitante ou interfona | RN-CD-17 |
| Visitante recorrente fora do dia ou do horário | Alerta "Fora do horário cadastrado" | Interfona | RN-VI-03 |
| Sem internet | Fluxo 6.3 | — | RN-OF-02 |

### 6.3 Portaria sem internet e sincronização

```mermaid
flowchart TD
    A(["Conexão cai"]) --> B["Faixa: sem internet, lista de [hora da última sincronização]"]
    B --> C["Porteiro consulta a cópia do dia dos blocos que atende"]
    C --> D["Registra entradas e saídas"]
    D --> E["Itens vão para a fila, com contador de pendências"]
    E --> F{"Conexão voltou?"}
    F -->|"Não"| C
    F -->|"Sim"| S1["Sincronização automática"]
    S1 --> G{"Algum registro diverge do cadastro?"}
    G -->|"Não"| Z1(["Fila zerada; faixa some"])
    G -->|"Sim, ex.: visitante cancelado pelo morador"| H["Aviso de divergência fixo na tela"]
    H --> I["Porteiro interfona ao morador que cadastrou"]
    I --> J["Registra a confirmação"]
    J --> Z2(["Aviso fechado"])
    K(["Meia-noite ou saída da conta"]) --> S2["Cópia local criptografada é apagada"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2 ok
    class H erro
    class S1,S2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Sem internet | Faixa "Sem internet" fixa, com a hora da última sincronização e o indicador de pendências (DS 10.10 e 10.23) | Segue trabalhando sem internet | RN-OF-02 |
| Divergência ao sincronizar | Diálogo sem botão de fechar: "Carlos Souza entrou às 14h10, mas a visita tinha sido cancelada pelo morador. Ligue para Bloco A · Apto 101 pelo interfone." | Interfona e toca em "Confirmei com o morador" | RN-OF-04, DS 11.1 |
| Falha ao enviar um item da fila | O item continua pendente, e o app tenta de novo sozinho | Automático | RNF-08 |
| Saída da conta com itens pendentes | "Há N registros ainda não enviados. Conecte-se antes de sair." | Espera a sincronização | RN-OF-06 |
| Registrar encomenda offline | Botão desabilitado: "Encomendas precisam de internet. Anote e registre quando a conexão voltar." | Registra depois | RNF-06 |

### 6.4 Modo de treinamento

O porteiro liga o modo pelo menu. Com o modo ativo, a faixa "MODO TREINAMENTO · Nada aqui é real" fica sempre visível (DS 10.10), a lista mostra visitantes e encomendas fictícios, e nada é gravado nos dados reais nem notifica moradores (RF-VI-12). Ao sair, a lista real volta. Se um visitante real chegar durante o treinamento, o botão "Sair do treinamento" fica fixo na faixa, a um toque.

### 6.5 Montar lista de visitantes

Para festas e eventos com muita gente. O morador monta a lista numa tela só, e a portaria recebe as pessoas agrupadas (RF-VI-14, RF-VI-15).

- **Perfil:** morador, síndico morador e subsíndico (monta); portaria (recebe).
- **Toques:** Visitantes → Novo → Montar lista de visitantes → Enviar lista (4), mais um toque em "Adicionar pessoa" por linha criada à mão. Colar nomes e tocar em recentes ou em uma lista salva adiciona várias pessoas de uma vez. Digitar não conta.
- **Origem opcional:** a tela também abre a partir de outro fluxo (ex.: sugestão depois de uma reserva), com data, horário e local da reserva já preenchidos e travados (RN-VI-14). Entrada de código: `abrirListaVisitantes(perfil, reservaId)`.

```mermaid
flowchart TD
    A(["Toca em Visitantes, Novo e Montar lista de visitantes"]) --> O{"Veio de uma reserva?"}
    O -->|"Sim"| O1["Data, horário e local da reserva; campos travados"]
    O -->|"Não"| O2["Data de hoje por padrão; horário e local opcionais"]
    O1 --> B
    O2 --> B["Dá nome à lista"]
    B --> C["Adiciona pessoas"]
    C --> C1["Adicionar pessoa: nova linha com foco"]
    C --> C2["Colar vários nomes, um por linha"]
    C --> C3["Recentes, frequentes ou lista salva: 1 toque"]
    C --> C4["Remover linha, com Desfazer"]
    C1 --> D{"Enviar lista"}
    C2 --> D
    C3 --> D
    C4 --> D
    D --> E{"Nome da lista, data e pelo menos 1 pessoa?"}
    E -->|"Não"| E1["Mensagem ao lado do campo"]
    E1 --> C
    E -->|"Sim"| F{"Mais pessoas que o limite?"}
    F -->|"Sim"| E2["Recusa e diz quantas sobram"]
    E2 --> C
    F -->|"Não"| G{"Sem internet?"}
    G -->|"Sim"| E3["Não envia; orienta avisar a portaria pelo interfone"]
    G -->|"Não"| S1["Cada pessoa vira visitante avulso esperado"]
    S1 --> S2["Portaria vê a lista agrupada no dia"]
    S2 --> H["Porteiro abre a lista e dá entrada pessoa a pessoa"]
    H --> S3["Contador N pessoas, M chegaram; morador recebe aviso da primeira chegada e resumos agrupados"]
    S3 --> Z(["Esperado"])
    Z --> K{"Morador edita ou cancela até o fim do dia?"}
    K -->|"Sim"| S4["Portaria atualizada na hora"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z ok
    class E1,E2,E3 erro
    class S1,S2,S3,S4 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Lista sem nome ou sem pessoa | "Dê um nome à lista, como “Aniversário do Theo”." ou "Adicione pelo menos uma pessoa." | Preenche | RN-VI-11 |
| Documento sem nome | "Informe o nome." na linha | Preenche o nome | RN-VI-02 |
| Nome repetido | Aviso na linha, sem bloquear | Confere e envia | RN-VI-12 |
| Mais pessoas que o limite | "A lista aceita até 100 pessoas e esta tem 112. Remova 12 ou crie outra lista." | Remove ou cria outra lista | RN-VI-12 |
| Passou da capacidade da área (lista de reserva) | Faixa `warning`: "Você listou 85 pessoas e salão de festas comporta até 80. Pode enviar, mas confira se todos vão estar lá ao mesmo tempo." | Envia ou ajusta | RN-VI-14 |
| Data no passado | Datas anteriores a hoje desabilitadas | Escolhe outra data | RN-VI-13 |
| Linha removida sem querer | Mensagem rápida "Maria removida", com "Desfazer" por 10 s | Toca em "Desfazer" | RN-VI-15 |
| Morador sem internet | "Sem internet, a lista não é enviada. Seus visitantes ainda podem entrar: a portaria confirma com você pelo interfone." | Tenta de novo ou autoriza pelo interfone | RN-VI-04 |
| Lista com data futura | Faixa `info`: "A portaria passa a ver a lista no dia 22/11." | — | RN-VI-13 |
| Reserva cancelada | A lista vinculada é cancelada e o morador é avisado | Monta outra lista, se quiser | RN-VI-14 |
| Pessoa da lista na lista de bloqueio | Mesmo diálogo bloqueante do fluxo 6.2 | Porteiro decide | RN-VI-05 |
| Quase todos chegaram | Selo `success` no contador quando todos chegam; `info` enquanto faltam | — | RN-VI-17 |

## 7. Encomendas

### 7.1 Registrar e retirar encomenda

```mermaid
flowchart TD
    A(["Entrega chega à portaria"]) --> B{"Comida por aplicativo?"}
    B -->|"Sim"| E1(["Não se registra"])
    B -->|"Não"| C["Porteiro informa unidade e remetente; foto da etiqueta opcional"]
    C --> D{"Internet disponível?"}
    D -->|"Não"| E2["Anota e registra quando a conexão voltar"]
    D -->|"Sim"| S1["Push imediato ao morador"]
    S1 --> F["Encomenda recebida"]
    F --> G{"Retirada?"}
    G -->|"Sim"| H["Porteiro registra quem retirou"]
    H --> Z1(["Retirada"])
    G -->|"Não"| S2["Lembretes em 3 e 7 dias"]
    S2 --> I{"30 dias sem retirada?"}
    I -->|"Não"| G
    I -->|"Sim"| S3["Prazo vencido; síndico avisado"]
    S3 --> J{"Retirada ou devolvida?"}
    J -->|"Retirada"| Z1
    J -->|"Devolvida"| Z2(["Devolvida; enviada de volta ao remetente"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2 ok
    class E1,E2 erro
    class S1,S2,S3 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Unidade errada no registro | Porteiro corrige antes da retirada; a unidade antiga recebe "O aviso de encomenda foi enviado por engano." | Corrige | RN-EN-06 |
| Quem retira não mora na unidade | A lista de quem pode retirar mostra só os moradores da unidade | Morador autoriza pelo interfone, e a portaria registra o nome de quem retirou | RN-EN-02 |
| Prazo de guarda vencido | Síndico recebe alerta | Combina retirada ou devolução | RN-EN-04 |
| Unidade com entrega esperada | A tela de registro sugere a entrega esperada (fluxo 7.2) | Confirma o vínculo ou escolhe "Não vincular" | RN-EN-11 |

### 7.2 Entregas esperadas

- **Perfil:** morador, síndico morador e subsíndico (avisam); portaria (vê e vincula).
- **Gatilho:** o morador sabe que um pacote chega, por exemplo "hoje, entre 12h e 19h".
- **Onde:** Menu > Encomendas, seção "Entregas esperadas" e botão "Avisar entrega"; na portaria, aba Encomendas, seção "Esperadas hoje".

```mermaid
flowchart TD
    A(["Morador avisa a entrega: data, e opcionais descrição, faixa e origem"]) --> B{"Unidade com 10 ativas?"}
    B -->|"Sim"| E1(["Limite: cancele uma para avisar outra"])
    B -->|"Não"| C["Esperada"]
    C --> D{"Origem iFood/entregador?"}
    D -->|"Sim"| P1["Portaria vê com o selo Só aviso, sem registro"]
    P1 --> Z3(["Encerrada, passada a data"])
    D -->|"Não"| P2["No dia: aparece em Esperadas hoje, por faixa"]
    P2 --> F{"Encomenda chegou e a portaria vinculou?"}
    F -->|"Sim"| S1["Push normal da encomenda ao morador"]
    S1 --> Z1(["Chegou"])
    F -->|"Não"| G{"Data passou?"}
    G -->|"Não"| P2
    G -->|"Sim"| Z2["Não chegou; some de Esperadas hoje"]
    Z2 --> H{"Morador reagenda?"}
    H -->|"Sim"| C
    H -->|"Não"| I{"Chegou em até 3 dias e a portaria vinculou?"}
    I -->|"Sim"| S1
    C --> X["Morador edita ou cancela"]
    X --> Z4(["Cancelada"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1 ok
    class E1 erro
    class S1,Z2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Limite de 10 entregas esperadas ativas | Erro no botão "Avisar entrega": "A unidade já tem 10 entregas esperadas. Cancele uma para avisar outra." | Cancela uma | RN-EN-08 |
| Faixa com o fim antes do início | Erro no campo: "O horário final precisa ser depois do inicial." | Corrige | RN-EN-07 |
| Data passada | Campo de data com mínimo em hoje; erro "A data não pode ser anterior a hoje." | Escolhe outra data | RN-EN-07 |
| Data passou sem chegada | Selo `warning` "Não chegou" e o botão "Reagendar", sem push | Reagenda, edita ou cancela | RN-EN-13 |
| Edição ou cancelamento | A portaria vê a mudança na hora; sem push | — | RN-EN-09 |
| Origem iFood/entregador | Faixa `info`: "A portaria recebe só um aviso. Comida por aplicativo não é registrada como encomenda." | Salva o aviso | RN-EN-12 |
| Encomenda chega fora da faixa ou sem entrega esperada | Nada muda para a portaria: registra normalmente | — | RN-EN-10 |
| Vínculo sugerido está errado | Na tela de registro, "Não vincular" ou outra entrega da lista | Escolhe | RN-EN-11 |
| Unidade da encomenda corrigida | O vínculo se desfaz e a entrega volta a "Esperada" ou "Não chegou" | — | RN-EN-06, RN-EN-11 |

## 8. Chamados

**Ordem nas listas (RN-CH-13).** Morador, síndico, limpeza e manutenção veem os chamados abertos antes dos concluídos. Dentro de cada grupo, a ordem é da urgência alta para a leve; se a urgência empatar, o mais antigo vem primeiro. A ordem vale para todas as listas de chamados e não muda o chamado nem os prazos.

### 8.1 Abrir chamado

- **Perfil:** morador, síndico, subsíndico e portaria.
- **Toques:** Chamados → Novo → Enviar (3) (escolher o tipo, a categoria e a urgência e digitar não contam).

```mermaid
flowchart TD
    A(["Toca em Chamados e Novo"]) --> B["Escolhe limpeza ou manutenção e a categoria"]
    B --> U["Escolhe a urgência: alta, média ou leve (com exemplos)"]
    U --> C["Descreve; foto opcional"]
    C --> D{"Urgência e descrição preenchidas?"}
    D -->|"Não"| E1["Urgência e descrição são obrigatórias"]
    E1 --> C
    D -->|"Sim"| F{"Tipo"}
    F -->|"Limpeza"| G(["Vai para a fila da limpeza com a urgência; prazo 24h"])
    F -->|"Manutenção"| H(["Vai para o síndico com a urgência; primeira atualização em 48h"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    class G,H ok
    class E1 erro
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Urgência não escolhida | "Escolha a urgência do chamado." no campo; o chamado não é enviado | Escolhe um nível e envia | RN-CH-09 |
| Síndico ajusta a urgência no detalhe | Folha com os três níveis e os exemplos; depois, linha "Urgência alterada de média para alta por [nome]" no detalhe; quem abriu é avisado | Pode ajustar de novo; cada ajuste fica registrado | RN-CH-11 |
| Foto grande demais ou formato inválido | "Não foi possível anexar a foto. Tente outra." (fotos são comprimidas no aparelho) | Troca a foto ou envia sem | RN-CH-03 |
| Sem internet (morador ou portaria) | "Sem internet. Seu chamado não foi enviado." O texto fica salvo como rascunho | Envia quando voltar | RNF-07 |

### 8.2 Atender chamado de limpeza

```mermaid
flowchart TD
    A(["Funcionário abre a fila do setor"]) --> B["Cartões com prazo e botão Concluir visível"]
    B -->|"Opcional, pelo detalhe"| B1["Iniciar atendimento: estado Em atendimento"]
    B1 --> C
    B --> C["Toca em Concluir; fotos do serviço opcionais"]
    C --> D{"Online?"}
    D -->|"Não"| E["Conclusão vai para a fila de sincronização"]
    E --> F{"Outra pessoa concluiu o mesmo chamado offline?"}
    F -->|"Sim, menor horário do celular"| E1(["Vale a de menor horário, mesmo enviada depois; aviso aos envolvidos"])
    F -->|"Não"| Z1
    D -->|"Sim"| Z1(["Concluído; quem abriu é avisado e convidado a avaliar"])
    Z1 --> G{"Quem abriu reabre em até 48h?"}
    G -->|"Sim"| H["Chamado reaberto volta à fila"]
    H --> B
    S1["Fora do prazo: destaque no painel do síndico"]
    B -.-> S1
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1 ok
    class E1 erro
    class S1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Conclusão de mesmo ciclo com horário posterior | "Vale a conclusão de [colega], registrada antes pelo horário do celular." | Confirma leitura; operação preservada sem efeito | RN-CH-04 |
| Conclusão com horário anterior enviada depois | "A conclusão de [colega] passa a valer: foi registrada antes pelo horário do celular." Os envolvidos são avisados; não cria outro ciclo | Confirma leitura; histórico preservado | RN-CH-04 |
| Reenvio da mesma operação | Mantém o resultado já processado, sem duplicar conclusão nem aviso | Nenhuma ação | RN-CH-04 |
| Correção tardia com avaliação já enviada | "Uma conclusão anterior passou a valer. Sua avaliação anterior ficou no histórico; você pode avaliar este atendimento." A nota antiga não entra nos agregados nem é transferida ao outro funcionário; janela configurada (padrão 7 dias) a partir da disponibilização, lembrete único às 09:00 locais do dia seguinte ao fim das 24h | Abre a avaliação da conclusão efetiva; reabertura continua sujeita às 48h da conclusão efetiva | RN-CH-15, RN-CH-17 |
| Reabrir depois de 48h | Botão "Reabrir" some; aparece "Abrir novo chamado" | Abre um chamado novo | RN-CH-07 |
| Conclusão sem foto | Conclui normalmente; a folha diz "Fotos do serviço (opcional)" | Nenhuma ação | RN-CH-14 |
| Fotos com a conclusão sem internet | "Será enviado quando a conexão voltar." As fotos seguem a conclusão na fila | Nenhuma ação | RN-CH-14, RN-CH-04 |

### 8.3 Acompanhar manutenção

O síndico (ou o subsíndico em substituição) também pode ajustar a urgência do chamado, com registro (RN-CH-11); funcionários e portaria só veem a urgência. Ele escolhe a empresa cadastrada e avança o status: aberto → orçamento → agendado → concluído (RN-CH-05). Sem primeira atualização em 48h, o chamado fica em destaque no painel. Se a empresa não estiver cadastrada, o síndico a cadastra ali mesmo, com nome, serviço e telefone (RF-AD-14). Quem abriu é avisado na conclusão e pode reabrir em até 48h. Fora da substituição, o subsíndico vê a mesma tela sem a escolha de empresa nem o botão de avançar, com a faixa "Você acompanha o andamento. Quem define a empresa e avança o status é o síndico." (RN-CH-05).

Ao concluir, o síndico (ou o subsíndico em substituição) pode anexar fotos do serviço, sem obrigação (RN-CH-14). Concluir exige uma empresa registrada, porque a avaliação do atendimento vale para ela (RN-CH-15).

### 8.4 Avaliar o atendimento do chamado

- **Perfil:** quem abriu o chamado: morador, síndico morador e subsíndico. Síndico profissional, portaria e funcionários não veem a ação (RN-CH-15).
- **Toques:** Chamados → chamado concluído → Avaliar o serviço → Enviar (3; estrelas, base e comentário não contam).

```mermaid
flowchart TD
    A(["Chamado concluído; quem abriu recebe o aviso"]) --> B["Abre o detalhe: fotos do serviço, se houver, e Avaliar o serviço"]
    B --> J{"Dentro de 7 dias da conclusão?"}
    J -->|"Não"| E0(["Ação some; fica só o histórico"])
    J -->|"Sim"| C{"O chamado tem fotos?"}
    C -->|"Sim"| D["Vê as fotos e escolhe a base: Vi as fotos do serviço ou Conferi pessoalmente"]
    C -->|"Não"| D2["Marca Conferi pessoalmente (única base)"]
    D --> F["Dá de 1 a 5 estrelas; comentário opcional"]
    D2 --> F
    F --> G{"Base marcada e estrelas escolhidas?"}
    G -->|"Não"| E1["Enviar desabilitado, com o motivo escrito"]
    E1 --> F
    G -->|"Sim"| H["Envia a avaliação (definitiva)"]
    H --> I{"1 ou 2 estrelas?"}
    I -->|"Não"| Z1(["Avaliado; agradecimento"])
    I -->|"Sim"| K{"Dentro de 48h da conclusão?"}
    K -->|"Sim"| L["Oferece Reabrir chamado; o morador decide"]
    K -->|"Não"| M["Oferece Abrir novo chamado"]
    L --> Z2(["Avaliado; síndico avisado da avaliação baixa"])
    M --> Z2
    S1["24h sem avaliar: um lembrete às 09:00 do dia seguinte; 7 dias: janela encerrada"]
    A -.-> S1
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2 ok
    class E1,E0 erro
    class S1 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Chamado sem fotos | Só a opção "Conferi pessoalmente", desmarcada; "Enviar avaliação" desabilitado até marcá-la | Marca a base e envia | RN-CH-16 |
| Estrelas não escolhidas | Botão desabilitado com "Escolha de 1 a 5 estrelas." | Escolhe a nota | RN-CH-16 |
| Já avaliado | A avaliação enviada, sem edição: "Sua avaliação" com a data | Nenhuma ação | RN-CH-17 |
| Janela encerrada (7 dias) | Sem botão; "O prazo para avaliar terminou." | Se o problema continua, abre um novo chamado | RN-CH-17 |
| Avaliação baixa dentro de 48h | Diálogo "Quer reabrir o chamado?" com "Reabrir chamado" e "Agora não" | Reabre ou segue sem reabrir | RN-CH-18 |
| Avaliação baixa depois de 48h | Diálogo com "Abrir novo chamado" e "Agora não" | Abre um novo chamado ou segue | RN-CH-07, RN-CH-18 |
| Reabre sem avaliar | O chamado volta à fila; a avaliação daquela conclusão deixa de ser possível | A nova conclusão abre nova avaliação | RN-CH-17 |
| Sem internet | "Sem internet. Sua avaliação não foi enviada." O comentário fica como rascunho | Envia quando voltar | RNF-07 |

### 8.5 Acompanhar as avaliações de atendimento

- **Síndico (e subsíndico em substituição):** Gestão → Avaliações do atendimento. Lista cada funcionário de limpeza e cada empresa de manutenção com média, número de avaliações e distribuição por estrelas. Um selo `warning` "Avaliações baixas" marca quem tem avaliação de 1 ou 2 estrelas nos últimos 30 dias. A avaliação de um chamado, com comentário e base, está no detalhe do chamado (RN-CH-19). O subsíndico fora da substituição não vê a lista: "Esta função é do síndico. Você passa a ter acesso quando a substituição pelo subsíndico estiver ativa."
- **Administradora (web):** Funcionários → coluna "Atendimento" com média e número de avaliações; sem comentários, sem chamados e sem identificar quem avaliou (RN-CH-19).
- **Funcionário de limpeza:** Menu → Minhas avaliações. Com 3 ou mais avaliações: média, distribuição e comentários, só com o mês. Com menos: "Poucas avaliações para mostrar a média." (RN-CH-20).
- **Sem efeito no score:** a avaliação do atendimento não muda o score de ninguém (RN-CH-21).

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Funcionário com menos de 3 avaliações | "Poucas avaliações para mostrar a média." | Aguarda mais avaliações | RN-CH-20 |
| Funcionário desligado | Some da lista por funcionário; segue no agregado do setor | — | RN-CH-20 |
| Subsíndico fora da substituição | Item "Avaliações do atendimento" não aparece; por link, estado vazio com cadeado | Aguarda a substituição | RN-CH-19 |
| Avaliação baixa | Aviso ao síndico: "Avaliação baixa no chamado [categoria · local]"; nada vai ao funcionário | Síndico abre o chamado | RN-CH-18 |

## 9. Reclamações e score

### 9.1 Registrar reclamação

Toda reclamação tem um único alvo do mesmo condomínio: um funcionário, uma unidade, o síndico ou o subsíndico (RN-RC-02). O alvo nunca sabe quem reclamou.

```mermaid
flowchart TD
    A(["Morador toca em Reclamações e Nova"]) --> B["Escolhe o alvo: funcionário, unidade, síndico ou subsíndico"]
    B --> C["Categoria, descrição, data e foto opcional"]
    C --> D{"Texto passa no filtro de palavras ofensivas?"}
    D -->|"Não"| E1["Destaca o trecho e pede para reescrever"]
    E1 --> C
    D -->|"Sim"| F["Sistema define a gravidade pela categoria"]
    F --> G{"Quem julga? Tabela 5.1 das Regras"}
    G -->|"Julgador disponível"| H["Vai para o painel do julgador"]
    G -->|"Nenhum julgador possível"| I["Fica pendente até haver julgador"]
    H --> S1["Alvo notificado sem a identidade do reclamante"]
    I --> S1
    S1 --> Z(["Aberta ou Pendente; fluxo 9.2"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z ok
    class E1,I erro
    class F,S1 sis
```

**Quem julga (resumo da tabela 5.1 das Regras de Negócio)**

| Alvo | Julgador |
| --- | --- |
| Funcionário ou unidade comum | Síndico; em substituição, subsíndico |
| Síndico ou a unidade dele | Subsíndico; sem ele, administradora; sem ela, conselho fiscal |
| Subsíndico ou a unidade dele | Síndico; com a substituição ativa, administradora; sem ela, pendente até o fim da substituição |
| Reclamação feita pelo próprio julgador | Quem julgaria uma reclamação contra ele (RN-RC-11) |

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Tentar dois alvos | O seletor aceita um só; aviso: "Para reclamar de outra pessoa, abra outra reclamação." | Abre outra | RN-RC-02 |
| Alvo de outro condomínio | Não aparece na busca | — | RN-RC-02 |
| Texto ofensivo | "Reescreva o trecho destacado. Reclamações com ofensas não são enviadas." | Reescreve | RN-RC-13 |
| Reclamação pendente sem julgador | "Sua reclamação aguarda um julgador disponível." Sem semáforo de prazo | Automático quando houver julgador; o prazo passa a contar | Tabela 5.1, RN-RC-19 |
| Acompanhar a reclamação que abri | Em "Minhas reclamações" e no detalhe, selo de prazo ao lado do estado enquanto aguarda decisão: verde "No prazo · 12 dias", amarelo "Vence amanhã" ou vermelho "Prazo esgotado há 3 dias" | Recebe a decisão por notificação; decidida, o semáforo some | RN-RC-17 a RN-RC-19 |

### 9.2 Julgar reclamação

O julgador só decide depois de ouvir o alvo; se o alvo não responder em 5 dias, a decisão é liberada com o registro "alvo não respondeu" (RN-RC-04).

```mermaid
flowchart TD
    A(["Julgador abre a reclamação"]) --> B["Vê identidade e score do reclamante e do alvo"]
    B --> C["Envia comunicado individual vinculado ao alvo: estado Em conversa com o alvo"]
    C --> D{"Alvo respondeu?"}
    D -->|"Sim"| F["Resposta aparece na reclamação"]
    D -->|"Não em 5 dias"| G["Registro: alvo não respondeu"]
    D -->|"Ainda no prazo"| E1["Botões Validar e Negar bloqueados"]
    F --> H{"Decisão"}
    G --> H
    H -->|"Validar"| I["Confirma ou ajusta a gravidade, com justificativa se mudar"]
    I --> S1["Alvo perde 5, 10 ou 20 pontos; se for unidade, o morador habilitado (na desocupada, ninguém)"]
    H -->|"Negar"| J["Escolhe o motivo"]
    J --> K{"Motivo"}
    K -->|"Boa-fé ou duplicada"| L(["Encerrada; negada sem penalidade"])
    K -->|"Desproporcional ou falsa"| M{"Justificativa escrita?"}
    M -->|"Não"| E2["Justificativa é obrigatória"]
    E2 --> M
    M -->|"Sim"| S2["Reclamante perde 5 ou 15 pontos"]
    S1 --> N["Partes notificadas; alvo sem a identidade do reclamante"]
    S2 --> N
    N --> Z(["Validada ou Negada; abre o prazo de recurso de 7 dias"])
    S3["Lembrete ao julgador em 15 dias e a cada 5 dias depois; semáforo verde, amarelo e vermelho até a decisão"]
    A -.-> S3
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z,L ok
    class E1,E2 erro
    class S1,S2,S3 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Tentar decidir antes de ouvir o alvo | Botões bloqueados: "Converse com o alvo antes de decidir. Liberado em [data] se não houver resposta." | Envia a conversa ou espera o prazo | RN-RC-04 |
| Negar com penalidade sem justificativa | "Explique por que esta reclamação foi considerada [desproporcional/falsa]." | Escreve | RN-RC-05 |
| Mudar a gravidade sem justificativa | "Explique por que a gravidade mudou." | Escreve | RN-RC-09 |
| Prazo de decisão se esgotando | Selo amarelo no painel e no detalhe: "Prazo se esgotando · 3 dias", "Vence amanhã" ou "Vence hoje" (últimos 25% do prazo, mínimo 1 dia) | Decide | RN-RC-17, RN-RC-18 |
| Prazo de decisão vencido | Lembrete ao julgador; selo vermelho "Prazo esgotado há 2 dias" no painel e no detalhe. Os botões seguem regidos só pela conversa com o alvo | Decide | RN-RC-06, RN-RC-17, RN-RC-19 |
| Reclamação decidida, em recurso ou encerrada | Sem semáforo; só o selo de estado | — | RN-RC-19 |
| Reclamação de vistoria negada | Sem penalidade, porque o reclamante é o condomínio | — | RN-RC-12 |
| Reclamação contra uma unidade cujo morador habilitado mudou | Os pontos vão para o habilitado na data da decisão | — | RN-SC-04 |
| Alvo é uma unidade desocupada | A conversa é com o proprietário; validada, ninguém perde pontos | — | RN-RC-04, RN-CD-24 |
| Reclamação validada contra unidade alugada ou desocupada | O proprietário recebe a categoria, a data, a decisão e a multa, sem a conversa e sem quem reclamou | — | RN-RC-16 |

### 9.3 Recorrer

```mermaid
flowchart TD
    A(["Quem perdeu pontos abre a decisão"]) --> B{"Decisão da administradora ou do conselho fiscal?"}
    B -->|"Sim"| E1(["Sem recurso no app"])
    B -->|"Não"| C{"Dentro de 7 dias e sem recurso anterior?"}
    C -->|"Não"| E2(["Prazo encerrado ou recurso já usado"])
    C -->|"Sim"| D["Escreve o recurso"]
    D --> F{"Quem julga? Tabela 5.3 e RN-RC-14"}
    F --> G["Julgador do recurso decide"]
    G --> H{"Aceito?"}
    H -->|"Sim"| S1["Pontos devolvidos; a perda deixa de contar para a regularidade"]
    S1 --> Z1(["Recurso aceito"])
    H -->|"Não"| Z2(["Encerrada; decisão mantida"])
    S2["Sem recurso em 7 dias: rotina encerra a reclamação"]
    C -.-> S2
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2 ok
    class E1,E2 erro
    class S1,S2 sis
```

**Quem julga o recurso**

| Decisão tomada por | Recurso julgado por |
| --- | --- |
| Síndico | Subsíndico; sem ele, administradora; sem ela, conselho fiscal |
| Subsíndico | Síndico; se o síndico for parte da reclamação ou estiver em substituição, administradora; sem ela, conselho fiscal |
| Administradora ou conselho fiscal | Sem recurso no app |

Quem é parte da reclamação (reclamante ou alvo) nunca julga o recurso; sem nenhum julgador possível, o recurso fica pendente e a administradora recebe alerta para cadastrar o conselho fiscal (RN-RC-14).

### 9.4 Acompanhar score e transparência

- **Meu score:** para moradores, identifica a unidade ativa e mostra número, histórico e próxima recuperação apenas daquele vínculo. Trocar a unidade troca esses três dados; penalidade e bloqueio não acompanham a pessoa para seus outros imóveis. Novo vínculo começa em 100 e conserva o histórico encerrado sem herdar score anterior. Funcionário e síndico profissional sem unidade consultam o score funcional por condomínio (RN-SC-13, RN-SC-14). Nenhum item mostra quem reclamou (RN-SC-12). Com score igual ou menor que 60, o aviso explica a suspensão de gratuitas só pela unidade afetada.
- **Transparência:** score do síndico morador da unidade vinculada ao mandato (com essa referência identificada), ou score funcional do profissional sem unidade; outros imóveis ficam separados (RN-SC-02). Mostra também a nota de cada setor com 2 ou mais funcionários avaliados. Setor com menos avaliados mostra "Nota não publicada este mês: poucas avaliações." (RN-PE-08).
- **Denunciar conteúdo:** em qualquer texto, o menu "Denunciar" envia a denúncia ao síndico; se o conteúdo for do síndico, vai a quem julgaria uma reclamação contra ele (RN-RC-13).

## 10. Comunicação

### 10.1 Comunicados

```mermaid
flowchart TD
    A0(["Subsíndico fora da substituição toca em Comunicados e Sugerir"]) --> A1["Escreve e envia a sugestão ao síndico"]
    A1 --> A2["Sugestão aguardando o síndico"]
    A2 --> A3{"Síndico revisa"}
    A3 -->|"Descarta"| A4(["Descartada; subsíndico avisado"])
    A3 -->|"Edita e envia"| B
    A(["Síndico toca em Comunicados e Novo"]) --> B{"Geral ou individual?"}
    B -->|"Geral"| C["Escolhe o público: moradores, funcionários ou todos"]
    B -->|"Individual"| D["Escolhe o destinatário"]
    C --> E["Escreve e envia"]
    D --> E
    E --> F{"Passa no filtro de ofensas?"}
    F -->|"Não"| E1["Destaca o trecho"]
    E1 --> E
    F -->|"Sim"| S1["Push ao público; confirmação de leitura"]
    S1 --> Z(["Enviado"])
    Z --> G{"Individual com resposta?"}
    G -->|"Sim"| S2["Síndico notificado; conversa no histórico dos dois"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z ok
    class E1 erro
    class S1,S2 sis
```

Só o síndico, ou o subsíndico em substituição, envia comunicados (RN-CO-01). Fora da substituição, o subsíndico sugere, e a sugestão sai em nome do síndico quando ele a envia (RN-CO-05). A única exceção é a conversa com o alvo de uma reclamação, que qualquer julgador inicia de dentro da reclamação (RN-CO-04).

## 11. Reuniões, votações e eleições

### 11.1 Convocar reunião e votar

```mermaid
flowchart TD
    A(["Síndico convoca: data, local e pautas"]) --> B["Cada pauta é informativa ou com votação, com opções, quórum e se envolve despesa extraordinária"]
    B --> S1["Proprietários e moradores notificados; votação online aberta"]
    S1 --> C(["Usuário abre a pauta"])
    C --> D{"Quem é na unidade?"}
    D -->|"Outro morador"| E1["Vê a pauta sem botão de votar, com o motivo"]
    D -->|"Inquilino"| D1{"Pauta envolve despesa extraordinária?"}
    D1 -->|"Sim"| E1
    D1 -->|"Não"| D2["Aviso: se o proprietário votar até o encerramento, o voto dele vale no lugar do seu"]
    D2 --> F
    D -->|"Proprietário ou procurador"| F{"Unidade em atraso?"}
    F -->|"Sim"| E2["Voto bloqueado; motivo visível só para quem vota e para os responsáveis financeiros"]
    F -->|"Não"| G{"Já votou nesta pauta?"}
    G -->|"Sim"| E3["Mostra: sua unidade já votou"]
    G -->|"Não"| H{"Vota ou indica procurador?"}
    H -->|"Procurador"| I{"Procurador já representa outra unidade?"}
    I -->|"Sim"| E4["Indicação recusada"]
    I -->|"Não"| J["Procurador vota pela unidade"]
    H -->|"Vota"| K["Escolhe a opção e confirma"]
    J --> L(["Voto secreto registrado"])
    K --> L
    L -.-> S2["Se o proprietário votar depois do inquilino, o voto dele substitui o do inquilino, que é avisado"]
    L --> M["Reunião: síndico registra votos presenciais"]
    M --> N{"Unidade já votou online?"}
    N -->|"Sim"| E5["Voto presencial recusado"]
    N -->|"Não"| O["Síndico encerra a reunião"]
    O --> P{"Quórum atingido?"}
    P -->|"Não"| E6(["Resultado: sem quórum, com a contagem"])
    P -->|"Sim"| Q(["Resultado publicado com a contagem por opção"])
    Q --> R["Síndico anexa ata e lista de presença em PDF"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class L,Q ok
    class E1,E2,E3,E4,E5,E6 erro
    class S1,S2 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Não vota pela unidade | "Quem vota pela unidade é o proprietário, [nome]." | — | RN-VO-01 |
| Inquilino em pauta com despesa extraordinária | "Só o proprietário vota nesta pauta, porque ela envolve despesa extraordinária. Ele pode indicar você como procurador." | Pede a procuração ao proprietário | RN-VO-18 |
| Inquilino em pauta sem despesa extraordinária | Faixa `info`: "Você pode votar nesta pauta. Se o proprietário votar até o encerramento, o voto dele vale no lugar do seu." | Vota | RN-VO-18 |
| Proprietário votou depois do inquilino | Notificação ao inquilino: "O proprietário votou na pauta [nome], e o voto dele substituiu o seu." | — | RN-VO-18 |
| Proprietário vota presencialmente depois do voto online do inquilino | O voto presencial substitui o do inquilino | — | RN-VO-11, RN-VO-18 |
| Unidade em atraso | Só para quem vota e para os responsáveis financeiros: "Sua unidade tem cobrança em atraso e não pode votar (Código Civil, art. 1.335, III). Pague para votar nas próximas pautas." | Paga | RN-VO-16 |
| Procurador já representa outra unidade | "[Nome] já representa outra unidade. Escolha outra pessoa." | Escolhe outra | RN-VO-08 |
| Voto presencial de quem votou online | "Esta unidade já votou pelo app." | — | RN-VO-11 |
| Subsíndico fora da substituição na reunião | Registra votos presenciais; no lugar de "Encerrar reunião", vê "Quem encerra a reunião e publica o resultado é o síndico." | — | RN-CD-27, RN-VO-11 |
| Ver o resultado antes do fim | "O resultado aparece quando a reunião for encerrada." | Espera | RN-VO-03 |
| Quórum não atingido ou empate em pauta | Resultado com a contagem e o rótulo "sem quórum" ou "empate" | Decisão segue a convenção, fora do app | RN-VO-17 |

### 11.2 Eleição de síndico e subsíndico

```mermaid
flowchart TD
    A(["Síndico ou administradora abre a eleição com prazo de candidaturas"]) --> B["Morador se candidata a síndico ou subsíndico"]
    B --> C{"Elegível?"}
    C -->|"Não: reeleição desligada ou mesma unidade do outro cargo"| E1["Candidatura bloqueada, com o motivo"]
    C -->|"Sim"| D["Candidatura aceita"]
    D --> F["Prazo encerra; votação como em 11.1"]
    F --> G{"Empate?"}
    G -->|"Sim"| H["Segundo turno entre os empatados em até 7 dias"]
    H --> F
    G -->|"Não"| I{"Síndico e subsíndico eleitos da mesma unidade?"}
    I -->|"Sim"| J["Assume o próximo mais votado para subsíndico"]
    I -->|"Não"| K
    J --> K["Administradora registra início e fim dos mandatos"]
    K --> Z(["Novos mandatos ativos"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    class Z ok
    class E1 erro
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Candidatura fora do prazo | Botão "Candidatar-se" desabilitado: "Candidaturas encerradas em [data]." | — | RN-VO-13 |
| Reeleição desligada | "O regimento deste condomínio não permite reeleição." | — | RN-VO-05 |
| Nenhum candidato | A administradora recebe alerta e pode reabrir o prazo | Reabre | RN-VO-13 |

## 12. Pesquisa mensal

### 12.1 Avaliar funcionários

```mermaid
flowchart TD
    A(["Dia 1: pesquisa abre"]) --> B{"Perfil pode avaliar?"}
    B -->|"Síndico profissional ou funcionário"| E1(["Pesquisa não aparece"])
    B -->|"Morador, síndico morador ou subsíndico"| C["Funcionários ativos por setor"]
    C --> D["Dá de 1 a 5 estrelas ou pula; comentário opcional"]
    D --> F{"Já avaliou este funcionário no mês?"}
    F -->|"Sim"| G["Edita a nota anterior"]
    F -->|"Não"| H["Salva a nota"]
    G --> I
    H --> I(["Avaliação salva; pode mudar até o fechamento"])
    I --> S1["Último dia, 23h59: médias, ajuste de score e nota dos setores"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class I ok
    class E1 erro
    class S1 sis
```

No fechamento: média abaixo de 3 tira 5 pontos; de 3 até menos de 4,5 mantém; 4,5 ou mais dá 5 pontos. Funcionário sem avaliação não muda. A nota do setor só é publicada com 2 ou mais funcionários avaliados (RN-PE-05 a RN-PE-08).

## 13. Cobrança condominial

### 13.1 Pagar a taxa condominial

- **Perfil:** responsável financeiro. Cada unidade tem um responsável pelas despesas ordinárias e outro pelas extraordinárias; por padrão, os dois são o morador habilitado, e na unidade alugada são o inquilino e o proprietário (RN-FI-03). Cada um paga as cobranças emitidas para ele, e o proprietário vê a situação de todas (RN-FI-10).
- **Pré-condição:** módulo de cobrança ativo no condomínio.

```mermaid
flowchart TD
    S0["15 dias antes do vencimento: cobrança gerada"] --> A(["Responsável abre Cobranças"])
    A --> B{"Cobrança vencida?"}
    B -->|"Sim"| C["Segunda via com multa de 2% e juros de 1% ao mês, proporcionais aos dias de atraso"]
    B -->|"Não"| D["Valor original, com desconto se houver"]
    C --> F["Escolhe boleto, Pix ou cartão, entre as formas ativas"]
    D --> F
    F --> G{"Pagamento aprovado?"}
    G -->|"Cartão recusado"| E1["Recusa; tente outro cartão ou outra forma"]
    E1 --> F
    G -->|"Boleto ou Pix gerado"| H["Aguardando confirmação do gateway"]
    H --> S1["Webhook confirma; baixa automática"]
    G -->|"Cartão aprovado"| S1
    S1 --> I{"Pago em duplicidade?"}
    I -->|"Sim"| S2["Alerta à administradora: devolve ou vira crédito"]
    I -->|"Não"| Z(["Paga ou Paga com atraso; comprovante disponível"])
    S2 --> Z
    S3["Lembretes: 5 dias antes, no dia, 1 e 7 dias depois"]
    S0 -.-> S3
    S4["Dia seguinte ao vencimento sem pagamento: em atraso"]
    S0 -.-> S4
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z ok
    class E1 erro
    class S0,S1,S2,S3,S4 sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Cartão recusado | "O cartão não foi aprovado. Tente outro cartão, Pix ou boleto." | Troca a forma | RN-FI-02 |
| Boleto vencido | O app gera a segunda via sozinho: "Valor atualizado com multa e juros até hoje." | Paga a segunda via | RN-FI-08 |
| Pagamento ainda não confirmado | "Pagamento em processamento. Boleto pode levar até 3 dias úteis." | Espera; a baixa é automática | RN-FI-13 |
| Pagamento em duplicidade | "Identificamos dois pagamentos desta cobrança. A administradora vai devolver um deles ou abatê-lo na próxima." | Automático | RN-FI-19 |
| Pagou fora do app | A administradora registra com comprovante; a cobrança fica paga | Envia o comprovante à administradora | RN-FI-13 |
| Proprietário vê cobrança emitida ao inquilino | A cobrança aparece com o selo de estado e "Paga pelo inquilino", sem botão de pagar | — | RN-FI-10 |
| Gateway fora do ar, cobrança no prazo | "Pagamento indisponível agora. Tente de novo mais tarde; o vencimento continua em [data]." | Tenta depois | RN-FI-04 |
| Gateway fora do ar, cobrança vencida | "Pagamento indisponível agora. Quando você pagar, o valor será atualizado com multa e juros até o dia do pagamento." | Tenta depois | RN-FI-06, RN-FI-08 |

### 13.2 Configurar cobrança, cobranças extras e inadimplência

```mermaid
flowchart TD
    A(["Administradora ativa o módulo"]) --> B{"Conta bancária cadastrada?"}
    B -->|"Não"| E1["Módulo não ativa; leva ao cadastro da conta"]
    B -->|"Sim"| C["Escolhe formas de pagamento, valores e vencimento"]
    C --> D{"Ao menos uma forma ativa e multa até 2%?"}
    D -->|"Não"| E2["Recusa e mostra o limite"]
    E2 --> C
    D -->|"Sim"| Z1(["Cobrança ativa"])
    X(["Síndico solicita cobrança extra"]) --> X1["Administradora lança: descrição, tipo (ordinária ou extraordinária), valor, unidades e vencimento"]
    X1 --> X2["Cada unidade recebe a cobrança no nome do responsável daquele tipo"]
    X2 --> Z2(["Emitida; cobrança extra"])
    P(["Painel de inadimplência"]) --> P1["Unidades em atraso, valor e dias"]
    P1 --> P2["Exporta CSV para a contabilidade"]
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    class Z1,Z2 ok
    class E1,E2 erro
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Multa acima de 2% | "A multa por atraso não pode passar de 2% (Código Civil, art. 1.336, §1º)." | Ajusta | RN-FI-06 |
| Nenhuma forma de pagamento | "Escolha pelo menos uma forma de pagamento." | Escolhe | RN-FI-02 |
| Síndico tenta lançar cobrança | Só vê "Solicitar cobrança extra" | Envia a solicitação | RN-FI-14 |
| Cancelar cobrança | Exige o motivo; fica na auditoria | Informa o motivo | RN-FI-15 |
| Cobrança extra sem tipo | "Escolha se a cobrança é ordinária ou extraordinária." (fundo de reserva e obras vêm como extraordinárias) | Escolhe | RN-FI-20 |
| Multa por infração em unidade alugada | Vai ao inquilino; o proprietário é avisado. Vencida, a administradora pode reemiti-la ao proprietário | Reemite ou aguarda | RN-FI-20 |
| Morador comum procura a situação de outra unidade | Nenhuma tela mostra esse dado | — | RN-FI-10 |

### 13.3 Controlar receitas e despesas

- **Perfil:** administradora (e suporte, no plano Gestão + Suporte). A tela é Finanças, no painel web (Design System, 11.15).
- **Pré-condição:** nenhuma; sem o módulo de cobrança, só não há receitas automáticas de cobrança (RN-FI-24).

```mermaid
flowchart TD
    S0["Cobrança ou reserva paga: receita lançada sozinha, na data do pagamento"] --> A
    A(["Administradora abre Finanças"]) --> B["Escolhe o período e vê resumo, categorias, evolução e lançamentos"]
    B --> C["Novo lançamento: despesa ou receita avulsa"]
    C --> D{"Dados válidos? Valor maior que zero, data até hoje e em mês aberto, fornecedor na despesa"}
    D -->|"Não"| E1["Mostra o erro ao lado do campo"]
    E1 --> C
    D -->|"Sim"| F{"Recorrente?"}
    F -->|"Sim"| S1["Sistema cria o lançamento todo mês, no dia escolhido"]
    F -->|"Não"| G["Lançado"]
    S1 --> G
    G --> H{"Mês aberto?"}
    H -->|"Sim"| I["Edita ou exclui o lançamento avulso; fica na auditoria"]
    H -->|"Não"| J["Estornar: informa o motivo"]
    J --> K["Novo lançamento de valor oposto, com a data de hoje; o original fica Estornado"]
    L["Dia 10 do mês seguinte: mês fechado sozinho"] -.-> M
    N["Administradora fecha o mês antes, depois do último dia"] --> M(["Mês fechado"])
    I --> N
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class M,K ok
    class E1 erro
    class S0,S1,L sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Valor zero ou vazio | "Informe um valor maior que zero." | Corrige | RN-FI-24 |
| Despesa sem fornecedor | "Informe o fornecedor." | Preenche | RN-FI-25 |
| Data futura | "A data não pode ser futura." | Corrige | RN-FI-25 |
| Data em mês fechado | "Este mês está fechado. Use a data de um mês aberto ou estorne um lançamento." | Muda a data ou estorna | RN-FI-25, RN-FI-28 |
| Receita avulsa de taxa ou multa | A categoria não aparece; faixa: "Taxas, multas, fundo de reserva e aluguel de áreas entram sozinhos das cobranças e reservas pagas." (com cobrança desligada, "Taxa condominial" e "Fundo de reserva" aparecem) | Escolhe "Outras receitas" | RN-FI-22, RN-FI-24 |
| Despesa sem comprovante | Lançamento aceito, com "Não anexado" na lista e aviso ao fechar o mês | Anexa depois, enquanto o mês está aberto | RN-FI-24 |
| Folha de funcionários | Faixa: "Informe só o total da folha do mês, sem nomes nem salários." | Lança o total | RN-FI-24 |
| Editar ou excluir lançamento automático | As ações não existem; a faixa aponta para a cobrança ou reserva de origem | Corrige na origem | RN-FI-22 |
| Editar ou excluir em mês fechado | Só "Estornar" | Estorna | RN-FI-28 |
| Estorno sem motivo | "Informe o motivo do estorno." | Preenche | RN-FI-28 |
| Estornar lançamento já estornado ou um estorno | A ação não existe | Lança o valor correto como novo | RN-FI-28 |
| Fechar o mês com despesas sem comprovante | Diálogo: "N despesas estão sem comprovante. Depois de fechar, o mês só aceita estorno. Fechar mesmo assim?" | Fecha ou volta para anexar | RN-FI-28 |
| Fechar antes de o mês acabar | O botão "Fechar mês" não aparece | Espera o último dia | RN-FI-28 |
| Pagamento confirmado depois do fechamento | Entra no mês do pagamento; o mês fechado não muda | Automático | RN-FI-28 |
| Comentário do síndico ou do conselho | Selo "Novo comentário" no lançamento e no mês | Lê; responde fora do app ou comentando | RN-FI-31 |

### 13.4 Acompanhar as finanças do condomínio

- **Perfil:** síndico, subsíndico em substituição e membro do conselho fiscal. O síndico acessa por Gestão > Finanças; o conselho fiscal, por Menu > Finanças do condomínio. Só leitura, comentário e exportação.

```mermaid
flowchart TD
    A(["Abre Finanças"]) --> B{"Tem permissão?"}
    B -->|"Subsíndico fora da substituição"| E1["Mostra que a função é do síndico"]
    B -->|"Sim"| C["Resumo do mês, categorias e evolução"]
    C --> D["Filtra por período, categoria, tipo e texto"]
    D --> E["Abre um lançamento: dados, comprovante e comentários"]
    E --> F["Comenta o lançamento ou o mês"]
    F --> G["Administradora recebe aviso"]
    D --> H["Exporta CSV ou PDF do filtro"]
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class E1 erro
    class G sis
```

| Situação | O que o usuário vê | Como sai | Regra |
| --- | --- | --- | --- |
| Subsíndico fora da substituição | "Esta função é do síndico. Você passa a ter acesso quando a substituição estiver ativa." | Espera | RN-FI-29 |
| Morador, proprietário ou funcionário | Nenhuma tela mostra as finanças | — | RN-FI-29 |
| Receita de cobrança | Linha agregada: "Taxa condominial · 117 cobranças pagas", sem unidade | — | RN-FI-30 |
| Filtro sem resultado | "Nenhum lançamento neste filtro." com a ação "Limpar filtros" | Limpa | RN-FI-21 |
| Período de vários meses | A comparação com o mês anterior some; fica a evolução | — | RN-FI-21 |
| Exportar | "financeiro-2026-10.csv baixado." ou "financeiro-2026-10.pdf baixado."; o arquivo respeita o filtro | — | RN-FI-30 |
| Mês fechado | Faixa "Mês fechado em 10/11. Alterações só por estorno."; os comentários continuam liberados | Comenta | RN-FI-28, RN-FI-31 |

## 14. Notificações e LGPD

### 14.1 Preferências e direitos do titular

```mermaid
flowchart TD
    A(["Usuário abre Configurações"]) --> B{"O que deseja?"}
    B -->|"Notificações"| C["Liga ou desliga cada tipo"]
    C --> D{"Tipo obrigatório?"}
    D -->|"Sim"| E1["Interruptor travado, com o motivo"]
    D -->|"Não"| Z1(["Preferência salva"])
    B -->|"Cópia dos meus dados"| F["Confirma o pedido"]
    F --> Z2(["Arquivo por e-mail em até 15 dias"])
    B -->|"Excluir conta"| G["Aviso: histórico anonimizado; votos e reclamações continuam sem identificação"]
    G --> H{"É morador habilitado, proprietário ou responsável financeiro?"}
    H -->|"Sim"| S1["Administradora avisada para definir substituto; sem habilitado a unidade não reserva, sem proprietário não vota"]
    H -->|"Não"| I
    S1 --> I["Confirma com a senha"]
    I --> Z3(["Acesso encerrado; dados anonimizados"])
    classDef ok fill:#E8F5E9,stroke:#2E7D32,color:#0B1A44
    classDef erro fill:#FDECEC,stroke:#C62828,color:#0B1A44
    classDef sis fill:#F3F6FC,stroke:#0E359D,stroke-dasharray:5 5,color:#0B1A44
    class Z1,Z2,Z3 ok
    class E1 erro
    class S1 sis
```

Notificações obrigatórias: decisão de reclamação contra a pessoa e divergência de sincronização para o porteiro (US-NO-01).

Dentro de Reserva, o interruptor opcional "Lembrete de reserva" (ligado por padrão) controla o push enviado 24h antes do início de reserva confirmada, ou às 21:00 da noite anterior quando esse horário cair entre 00:00 e 08:59 (fluxo 5.1, RN-RE-14).

## 15. Mensagens de erro transversais

Estas situações podem acontecer em qualquer fluxo e têm um tratamento único. Os textos são os padrões do Design System (13.4).

| Situação | O que o usuário vê | Comportamento |
| --- | --- | --- |
| Sem internet (fora da portaria e da limpeza) | Faixa "Sem internet" no topo; ao tentar enviar: "Não foi possível conectar. Verifique a internet e tente de novo." | Ações de envio ficam desabilitadas; textos digitados viram rascunho |
| Sessão expirada | "Por segurança, entre de novo na sua conta." | Volta para o login e, depois, para a tela onde estava |
| Sem permissão para a ação | A ação não aparece na tela; se a permissão mudar com o app aberto: "Esta área é só para [perfil]." | Volta à tela inicial |
| Erro do servidor | "Algo deu errado do nosso lado. Tente de novo em alguns minutos." | Botão "Tentar de novo"; erro enviado ao monitoramento |
| Dado alterado por outra pessoa | "Estas informações mudaram. Atualizamos a tela." | Recarrega sem perder o que foi digitado |
| Nova versão obrigatória do app | "Atualize o app para continuar." | Link para a loja |

## 16. Decisões desta revisão

Ao mapear os fluxos, surgiram contradições e lacunas entre os documentos de produto. Cada uma foi resolvida como abaixo, e os documentos de produto foram atualizados para refletir a decisão.

| # | Problema encontrado | Decisão | Onde foi ajustado |
| --- | --- | --- | --- |
| D-01 | O alvo de uma reclamação era "funcionário ou unidade", mas a tabela de julgadores trata o síndico e o subsíndico como alvos, e o síndico profissional não tem unidade | O alvo pode ser um funcionário, uma unidade, o síndico ou o subsíndico | RN glossário, RN-RC-02, RF-RS-01, US-RS-01 |
| D-02 | O suporte "tem as permissões da administradora", o que o faria julgar reclamações e ver scores, contradizendo "sem administradora, conselho fiscal" | O suporte age como administradora em cadastros, configurações e cobrança, mas não julga nem consulta reclamações e scores | RN 1, PRD perfis e notas da matriz |
| D-03 | O recurso de uma decisão do subsíndico ia ao síndico mesmo quando o síndico era o alvo | Quem é parte da reclamação nunca julga o recurso (nova RN-RC-14) | RN 5.3, US-RS-05 |
| D-04 | A decisão só era liberada depois da conversa, mas nada dizia o que fazer se o alvo não respondesse; a administradora e o conselho fiscal não podiam enviar comunicados | Decisão liberada com a resposta do alvo ou após 5 dias sem resposta (novo parâmetro); qualquer julgador inicia a conversa | RN-RC-04, RN-CO-04, RN 13, RF-RS-05, US-RS-02 |
| D-05 | Reclamação de vistoria negada como falsa não tinha a quem penalizar | Sem penalidade, porque o reclamante é o condomínio | RN-RC-12 |
| D-06 | O visitante avulso não tinha data, então não havia como montar "esperados hoje" nem encerrá-lo | Data da visita (padrão: hoje); sem entrada até o fim do dia, "não compareceu" (nova RN-VI-09) | RN-VI-02, RN 8.3, RN 14, RF-VI-01, US-VI-01 |
| D-07 | Não estava definido o que acontece com pagamento de reserva recusado | Pode tentar de novo dentro do prazo de pagamento | RN-RE-03 |
| D-08 | A conta bancária era "de reservas" no PRD, mas recebe também a taxa condominial; o módulo de cobrança não exigia conta | Conta única para reservas e taxa; o módulo só ativa com a conta cadastrada | RN-PG-01, RN-FI-01, RF-AD-08, US-AD-05 |
| D-09 | A história do primeiro acesso mandava "procurar a administradora" para e-mail não cadastrado, o que revela se o e-mail existe; faltavam regras de senha, reenvio e login | Mensagem igual para os dois casos; reenvio após 60 s invalida o anterior; senha com 8 ou mais caracteres; 5 senhas erradas pausam o login por 15 min | RN-CD-02, RF-AC-01, SEG-04, US-AC-01 |
| D-10 | "Todo usuário tem score" incluía administradora, suporte e admin da plataforma | Têm score moradores, síndicos (inclusive profissional), subsíndico e funcionários | RN 4, RN-SC-01 |
| D-11 | Faltas em reservas: a história dizia "perde 5 pontos quando é registrada", e as rotinas diziam "rotina diária"; a terceira falta não tinha regra | −5 a cada 2 faltas no trimestre, aplicado pela rotina diária | RN-RE-10, US-RE-06 |
| D-12 | Encomenda registrada na unidade errada não tinha correção | A portaria corrige antes da retirada (nova RN-EN-06) | RN 9.1 |
| D-13 | Votação sem quórum e empate em pauta não tinham resultado definido; a regra do empate parecia valer para pautas; o procurador era indicado "antes da votação", que já está aberta desde a convocação | Nova RN-VO-17 para quórum e empate; RN-VO-07 só para eleições; procurador indicado antes de a unidade votar | RN 10.2, RN 10.3, RF-VO-03 |
| D-14 | Pagamento em duplicidade da taxa não tinha tratamento | Alerta à administradora, que devolve ou abate na próxima cobrança (nova RN-FI-19) | RN 12.1 |
| D-15 | O responsável financeiro podia ser o proprietário não residente, mas não havia perfil para ele entrar no app | Novo perfil "Proprietário não residente", só com as cobranças da unidade (nova RN-CD-19); o PRD passa a ter 11 perfis | PRD 3, RN glossário, RN-SC-01 |
| D-16 | A exclusão de conta do morador habilitado deixaria a unidade sem habilitado, o que RN-CD-04 proíbe | A administradora é avisada para definir o substituto; até lá, a unidade não vota (nova RN-CD-18) | RN 3 |
| D-17 | Fim antecipado do mandato do síndico sem subsíndico não tinha regra | A administradora recebe alerta e abre a eleição; as funções de síndico ficam sem titular até a posse | RN-CD-13 |
| D-18 | A denúncia de conteúdo ia sempre ao síndico, mesmo se o conteúdo fosse dele | Vai a quem julgaria uma reclamação contra o síndico | RN-RC-13 |
| D-19 | Não estava claro se solicitação recusada contava na franquia | Não conta | RN-PL-03 |
| D-20 | Os diagramas de estados e o fluxo da reclamação estavam como conteúdo incorporado quebrado | Estados viraram tabelas nas Regras, com os mesmos nomes do Design System (4.5), que ganhou "Cancelada" (reserva) e "Não compareceu" (visita); o PRD aponta para este documento | RN 5.5, RN 7.4, PRD 6, DS 4.5 e 18 |
| D-21 | Pequenas divergências de texto | "Autorizado por interfone" com a mesma grafia em todos os documentos; RN-CD-03 inclui "Como funciona"; aviso sobre IDs não reaproveitados; parâmetros de cobrança formatados como código; reclamação decidida sem recurso encerrada pela rotina (nova RN-RC-15); painel de reclamações aberto a todo julgador (RF-RS-03). O escopo do MVP sem acordos de parcelamento e a métrica de cobrança no PRD foram corrigidos junto com o Design System | PRD 1, 2 e 4, RN 1, RN-CD-03, RN-VI-04, RN 13, RN 14 |
| D-22 | O estado "Em atendimento" da limpeza não tinha gatilho | Botão opcional "Iniciar atendimento" no detalhe; "Concluir" no cartão vai de "Aberto" direto para "Concluído" | DS 11.2 |
| D-23 | Finais de diagrama com texto diferente dos selos, e o cancelamento de reserva terminando sempre em "Cancelada" | Finais começam pelo texto exato do selo; o fluxo 5.2 termina em quatro estados, conforme a RN 7.4 | Fluxos 5.1, 5.2, 5.3, 6.1, 7.1, 9.1, 9.2, 9.3, 13.1 e 13.2 |
| D-24 | O inquilino podia ser o morador habilitado e, por isso, votar, mas o voto é do proprietário (Código Civil, art. 1.335, III); o inquilino só vota nas decisões sem despesa extraordinária, se o proprietário não comparecer (Lei 8.245/1991, art. 24, §4º) | Vota o proprietário; o inquilino vota como procurador ou nas pautas sem despesa extraordinária, e o voto do proprietário prevalece | RN-VO-01, RN-VO-08, RN-VO-11, RN-VO-18, RF-VO-02, RF-VO-03, RF-VO-10, RF-VO-11, US-VO-01, US-VO-02 |
| D-25 | Um único responsável financeiro não seguia a divisão de despesas da locação (Lei 8.245/1991, arts. 22 e 23) | Um responsável para as despesas ordinárias e outro para as extraordinárias; cada cobrança tem um tipo | RN-FI-03, RN-FI-10, RN-FI-11, RN-FI-14, RN-FI-20, RF-FI-04, RF-FI-16, US-FI-01, US-FI-04, US-FI-05 |
| D-26 | O inquilino não tinha datas de contrato e continuaria com acesso depois de sair | Inquilino cadastrado com início e fim do contrato; aviso 30 dias antes e desativação 7 dias após o fim | RN-CD-20 a RN-CD-23, RN 13, RN 14, RF-AD-18 a RF-AD-20, US-AD-10 |
| D-27 | O proprietário não residente só tinha login quando era responsável financeiro e não acompanhava a unidade | Login para todo proprietário não residente, com assembleias, comunicados, contrato e ocorrências, sem a rotina do inquilino | RN-CD-19, RN-RC-16, RN-SC-13, RF-RS-15, RF-AD-19, US-AD-11, DS 12 e 15 |
| D-29 | Fora da substituição, o subsíndico tinha as abas do morador e só julgava reclamações contra o síndico | Mesmas abas do síndico, com a Gestão enxuta: acompanha a manutenção, sugere comunicados, registra votos presenciais e vê encomendas com prazo vencido | RN-CD-27, RN-CD-28, RN-CH-05, RN-EN-04, RN-VO-11, RF-CH-04, RF-EN-05, RF-VO-04, US-AD-12, DS 11.11 e 12 |
| D-30 | O subsíndico não tinha como contribuir com comunicados sem a substituição | Sugestão de comunicado, que o síndico revisa e envia ou descarta | RN-CO-01, RN-CO-05, RF-CO-04, US-CO-03 |
| D-31 | O prazo de decisão de 15 dias existia só como lembrete ao julgador; quem reclamou e o julgador não viam o quanto faltava | Semáforo do prazo de decisão (verde, amarelo, vermelho), com limiar de 25% do prazo (mín. 1 dia); sem semáforo em reclamação pendente ou decidida e para o alvo (novas RN-RC-17 a RN-RC-19) | RN 5.2, RF-RS-16, US-RS-08, DS 4.5, 10.8.2 e 11.5, fluxos 9.1 e 9.2 |
| D-32 | O chamado concluído terminava ali: sem forma de o morador dizer se o serviço ficou bom, sem fotos do que foi feito e sem como o síndico cobrar a qualidade de cada funcionário e empresa | Fotos opcionais na conclusão; avaliação de 1 a 5 estrelas por quem abriu, com base explícita ("Vi as fotos" ou "Conferi pessoalmente"), janela de 7 dias e uma por conclusão; avaliação baixa oferece reabrir (decisão do morador) e avisa o síndico; síndico e administradora veem o agregado, o funcionário vê média e comentários anônimos com 3 ou mais avaliações; sem efeito no score, para não duplicar a pesquisa mensal nem criar pressão sobre o funcionário | RN-CH-14 a RN-CH-21, RN 13 e 14, RF-CH-02, RF-CH-04, RF-CH-05, RF-CH-08 a RF-CH-11, US-CH-02 a US-CH-05, DS 10.8.1, 10.17, 10.20, 11.2, 11.12 e 15, fluxos 8.2 a 8.5 |
| D-33 | Cadastrar visitante era um por um, o que não serve para festas: o morador repetia data e local dezenas de vezes e a portaria buscava cada convidado entre os demais visitantes | "Lista de visitantes": linhas que se adicionam e removem na mesma tela (com Desfazer), colar vários nomes, recentes, frequentes e listas salvas, dados comuns preenchidos uma vez; cada pessoa vira visitante avulso, com as regras que já existiam; portaria vê a lista agrupada, com contador, e dá entrada pessoa a pessoa; limite configurável de 100 pessoas; capacidade da área só avisa, não bloqueia; origem opcional (reserva) pré-preenche data, horário e local; aviso ao morador agrupado, para não gerar dezenas de notificações | RN-VI-11 a RN-VI-17, RN 13, RF-VI-14, RF-VI-15, US-VI-07, US-VI-08, DS 10.25 e 11.13, fluxo 6.5 |
| D-28 | Unidade entre dois contratos ficaria sem morador habilitado, o que RN-CD-04 proíbe | Novo estado "Desocupada"; aluguel por temporada entra como hóspede, desligado por padrão | RN-CD-04, RN-CD-18, RN-CD-24, RN-CD-25, RN-VI-10, RF-AD-21, RF-VI-13 |
| D-34 | Depois de reservar, nada levava o morador para a lista de visitantes, e não estava definido quando a sugestão aparece: reserva ainda não paga, área sem convidados, reserva já passada | Sugestão só para reserva confirmada, com data depois de hoje e sem lista; "Agora não" esconde para aquela reserva. A lista não é oferecida com origem antes da aprovação, porque a reserva pode expirar (RN-RE-03) e levaria a lista junto (a lista ainda pode ser montada sem origem, em Visitantes). As regras não separam áreas, então a sugestão vale para todas | RN-RE-12, RN-VI-14, RF-RE-02, US-RE-02, fluxo 5.1, DS 11.4 e 18 |
| D-35 | A portaria só sabia de um pacote quando ele já estava na mão; o morador não tinha como avisar que uma entrega estava a caminho | "Entrega esperada": data obrigatória e descrição, faixa de horário e origem opcionais; limite de 10 ativas por unidade; "Esperadas hoje" na portaria por faixa; vínculo sugerido ao registrar a encomenda, com o push normal e sem aviso duplicado; passada a data vira "Não chegou" (some da portaria, vinculável por 3 dias, reagendável pelo morador). O aviso é só informativo: não autoriza nem é exigido (RN-EN-01 segue), e iFood/entregador é só aviso, sem registro (RN-EN-05 segue), terminando "Encerrada". Parâmetros e rotina novos | RN-EN-07 a RN-EN-13, RN 13 e 14, RF-EN-06 a RF-EN-08, US-EN-03, US-EN-04, DS 4.5, 11.14 e 18, fluxo 7.2 |
| D-36 | O PRD tinha só a cobrança por unidade: a administradora não tinha onde controlar despesas, o síndico e o conselho fiscal não viam para onde ia o dinheiro, e o balancete estava fora de escopo, sem distinguir contabilidade de controle | Controle **gerencial** de receitas e despesas: receitas de cobrança e reservas pagas entram sozinhas (regime de caixa), despesas por categoria lançadas pela administradora, fechamento do mês com correção só por estorno, leitura e comentário para síndico e conselho fiscal; sem orçamento previsto e sem visão para moradores, que o PRD não prevê (ver pendências) | RN-FI-21 a RN-FI-32, RN 12.3 e 12.4, RN 13 e 14, RF-FI-17 a RF-FI-24, US-FI-07 a US-FI-10, SEG-08, SEG-18, DS 4.7, 10.22, 11.9, 11.15, 12, 15 |
| D-37 | O lembrete de reserva (RN-RE-14) não dizia o que fazer com reserva confirmada com menos antecedência que o parâmetro, inclusive paga aprovada depois desse ponto | Decidido por Pedro em 09/11/2026: não recebe lembrete. O lembrete é opcional, ligado por padrão, só por push, e a rotina roda a cada 5 min | RN-RE-14, RF-RE-10, US-RE-04, fluxo 5.1 |
| D-38 | As rotinas diárias, exceto 3, 6, 9 e 13, não tinham horário, e as que enviam lembrete poderiam disparar push de madrugada | Decidido por Pedro em 09/11/2026: rotinas diárias sem horário rodam na faixa de 00:00 a 06:00 no fuso do condomínio, em sequência; as diárias de lembrete ou aviso a pessoas (encomenda, prazos de reclamação e chamado, avaliação de chamado, cobrança, fim de contrato de locação) rodam às 09:00 locais. Também decidido em 09/11/2026: (a) as rotinas 10 e 20 têm duas etapas na mesma rotina, efeito de regra na madrugada e aviso às 09:00; (b) o push gerado por rotina da madrugada fica na fila e sai às 09:00 locais, e o push de evento disparado por pessoa não muda; (c) o lembrete de avaliação de chamado sai às 09:00 locais do dia seguinte ao fim das 24h após a conclusão | RN 14, RN-CH-17, RF-CH-08, US-CH-02, US-CH-04, DS 11.12, arq. 3.5 e 3.7, ADR-012, ADR-014, backend 5.2 e 6.4 |
| D-39 | O lembrete de reserva (RN-RE-14) enviado 24h antes do início cairia de madrugada quando a reserva começa entre 00:00 e 09:00 | Decidido por Pedro em 09/11/2026: se o horário calculado (início menos `reserva.lembrete_antecedencia_horas`) cair entre 00:00 e 08:59 no fuso do condomínio, o push é antecipado para as 21:00 da noite anterior ao dia desse horário, nunca adiado (reserva às 02:00 de sábado, 24h: push na quinta às 21:00); entre 09:00 e 23:59 não muda. Por coerência com RN-RE-14, reserva confirmada depois do horário de envio (inclusive depois das 21:00 antecipadas) não recebe lembrete (confirmado por Pedro em 09/11/2026). A rotina segue a cada 5 min, fora da fila das 09:00 da D-38. Como o push pode sair mais de 24h antes, o texto usa o dia e o horário reais em vez de "amanhã" | RN-RE-14, RN 14, RF-RE-10, US-RE-04, fluxo 5.1, DS 13.5, arq. 3.5, D12 (4.8), ADR-012, backend 5.2 e 5.5 |

## 17. Pendências

Estes pontos não puderam ser resolvidos só com os documentos e dependem de uma decisão do negócio ou de terceiros.

**Resolvido por Pedro em 10/11/2026:** gateway de pagamento Asaas (ADR-002, aceito com ressalvas). Seguem pendentes, na tabela abaixo, os prazos reais de confirmação de boleto e Pix, o KYC da subconta e o chargeback.

**Resolvido por Pedro em 08/11/2026:** reserva paga não utilizada recebe Não comparecimento na vistoria. A portaria vê reservas do dia e marca Em andamento/Cumprida/Não comparecimento nas condições de RN-RE-13; a limpeza mantém vistoria. A decisão está em RN-RE-09/10/13, RF-RE-08/09, US-RE-06, fluxo 5.3 e Design System 18. Não se acrescentam penalidade ou reembolso automático por falta paga.

| Pendência | Por que importa | Quem decide |
| --- | --- | --- |
| Parecer jurídico (SEG-16) | Pode mudar os fluxos 9.1 a 9.4, os prazos e os textos das mensagens de reclamação | Advogado |
| Prazos reais de confirmação de boleto e Pix, KYC da subconta e chargeback no Asaas (gateway escolhido por Pedro em 10/11/2026, ADR-002) | Definem os prazos e os erros possíveis nos fluxos 5.1 e 13.1; a prova de conceito no sandbox e o piloto os medem | Produto e engenharia (verificação do ADR-002) |
| Prazo de 5 dias para resposta do alvo | Valor novo, sem dado de uso; validar no piloto | Produto, após o piloto |
| Revisão jurídica das regras de locação | O voto do inquilino e a divisão de despesas seguem a Lei 8.245/1991, mas a convenção ou o contrato podem prever outra divisão | Advogado |
| Orçamento anual previsto | O PRD não tem orçamento; sem ele, o painel só compara com o mês anterior, e não com o previsto | Produto |
| Finanças para moradores (transparência financeira) | O PRD só prevê transparência de score e notas; um resumo público de receitas e despesas pode vir com a prestação de contas | Produto, com parecer jurídico |
| Saldo separado do fundo de reserva e da conta de obras | Hoje as cobranças extraordinárias aparecem discriminadas na receita, mas não há saldo próprio do fundo | Produto e contabilidade |
| Plano de contas e categorias da contabilidade | As 9 categorias de despesa podem não casar com o plano da contabilidade de cada administradora | Administradoras parceiras |
| Cobrança em atraso como notificação obrigatória | Proposta da revisão de fluxos; não está nas RN nem no US-NO-01 | Produto |
