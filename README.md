# CondomiFacil

O CondomiFacil é um projeto de aplicativo de gestão de condomínios para o Brasil. Reúne moradores, síndico, portaria e administração em tarefas como controle de visitantes, encomendas, reservas de áreas comuns, chamados, comunicados, assembleias, cobranças e acompanhamento financeiro.

**Estado atual: Design fechado e fase 1 (base executável) em andamento.** Este repositório contém a documentação do produto, um protótipo navegável em HTML, CSS e JavaScript e a base técnica: API NestJS com só a rota de saúde (`GET /v1/saude`), app Expo com a tela que consulta essa rota, biblioteca de componentes com Storybook e CI de PR. Nenhuma funcionalidade de negócio foi implementada, e ainda não há banco de dados nem deploy.

Autor e responsável pelo produto: [Pedro Lemos](https://github.com/pedrolems).

## Organização técnica

A estrutura preparatória usa um workspace pnpm na raiz, mantendo [backend](backend/README.md) e [frontend](frontend/README.md). [Contratos compartilhados](packages/shared-types/README.md) e [presets de ferramentas](packages/config/README.md) têm uma única localização em `packages/`. Os tipos e esquemas de validação são gerados do OpenAPI/AsyncAPI (openapi-typescript, Ajv e @asyncapi/parser, escolhidos na prova P1). O Turborepo orquestra lint, tipos, build e testes. Decisão de Pedro em 14/11/2026: [ADR-015](docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md).

Node 26.13.1 e pnpm 12.21.0 estão fixados (`.node-version`, `packageManager` e `engines` no `package.json` da raiz) e há um único `pnpm-lock.yaml` na raiz. O protótipo continua independente dessa preparação.

## Como instalar

Testado no Windows 11 com PowerShell. O Node do sistema pode ser outro; o fnm isola a versão do projeto.

```powershell
winget install Schniz.fnm
# abra um novo terminal para o fnm entrar no PATH
fnm install 26.13.1
fnm exec --using 26.13.1 -- cmd /c "npm install -g pnpm@12.21.0"
fnm exec --using 26.13.1 -- cmd /c "pnpm install --frozen-lockfile"
```

Observações:

- O `fnm exec` não executa arquivos `.cmd` diretamente (`npm`, `pnpm`); por isso o `cmd /c`.
- O npm do Node 26 avisa que o `postinstall` do pnpm não foi executado (`allowScripts`); o `pnpm -v` retorna `12.21.0` mesmo assim.
- O Corepack não existe no Node 26; o pnpm é instalado pelo npm.
- Conferir: `fnm exec --using 26.13.1 -- node -v` (v26.13.1) e `fnm exec --using 26.13.1 -- cmd /c "pnpm -v"` (12.21.0).
- Verificação do projeto: `fnm exec --using 26.13.1 -- cmd /c "pnpm check"` (lint pelo Turborepo). A telemetria do Turborepo está desligada no projeto: o script `check` define `TURBO_TELEMETRY_DISABLED=1` e o `shellEmulator` do pnpm (`pnpm-workspace.yaml`) faz isso funcionar no Windows e no Linux.

### `node` e `pnpm` no PATH

Os comandos `pnpm ...` dos READMEs (por exemplo `pnpm check`, `pnpm dev:api` e `pnpm dev:app`) supõem o Node 26.13.1 e o pnpm 12.21.0 no PATH. Para isso, adicione ao perfil do PowerShell (`notepad $PROFILE`) a linha abaixo e abra um novo terminal. O fnm passa a ler o `.node-version` ao entrar na pasta do projeto.

```powershell
fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression
```

Na pasta do projeto, `node -v` deve mostrar `v26.13.1` e `pnpm -v`, `12.21.0`.

- **"pnpm não é reconhecido":** o perfil não foi carregado ou o pnpm foi instalado em outro Node. O `npm install -g` instala o pnpm só no Node ativo naquele momento; repita o comando de instalação do pnpm acima.
- **Sem alterar o perfil** (ou se o PowerShell recusar carregá-lo): rode cada comando pelo fnm, por exemplo `fnm exec --using 26.13.1 -- cmd /c "pnpm dev:api"`.

## Navegação

- [Como rodar localmente](#como-rodar-localmente)
- [Manual breve do síndico](#manual-breve-do-síndico)
- [Guia rápido do porteiro](#guia-rápido-do-porteiro)
- [FAQ do morador](#faq-do-morador)
- [Documentação e mais informações](#documentação-e-mais-informações)

## Como rodar localmente

Para explorar o protótipo, baixe este repositório e abra [prototipo/index.html](prototipo/index.html) no navegador. Não é necessário instalar dependências nem executar um build.

Se preferir servir os arquivos por HTTP, com Python 3 instalado, execute a partir da raiz do projeto:

```sh
cd prototipo
python -m http.server 8765
```

Depois, abra [http://localhost:8765](http://localhost:8765). Para encerrar o servidor, use `Ctrl+C` no terminal.

No painel lateral, escolha um perfil, navegue pelas telas e experimente os cenários, como tema escuro, ausência de internet e substituição do síndico. No primeiro acesso simulado, o código é `123456`.

Os dados são fictícios, ficam em memória e as alterações desaparecem ao recarregar a página. Pagamentos, notificações, sincronização e exportações são simulações, sem integração com serviços reais. A fonte Inter e os ícones Lucide dependem de internet para carregar pela CDN.

Veja todas as telas e simulações no [guia do protótipo](prototipo/README.md).

## Manuais de uso

Os guias abaixo resumem as funcionalidades previstas e ajudam a explorar o protótipo. As operações descritas ainda não estão disponíveis em um aplicativo de produção.

### Manual breve do síndico

Selecione **Síndico** no painel lateral. A aba **Gestão** concentra as tarefas administrativas; **Reservas**, **Visitantes** e **Menu** dão acesso às demais funções do perfil.

| Tarefa | Como usar |
| --- | --- |
| Acompanhar a rotina | Consulte os chamados de limpeza e manutenção, prioridades, andamento e avaliações do atendimento. Na manutenção, indique a empresa responsável e registre a conclusão. |
| Tratar reclamações | Abra os casos atribuídos ao seu papel, consulte o histórico e converse com o alvo sem revelar quem reclamou. Decida após a resposta ou o prazo previsto e registre o motivo quando negar. Casos contra o próprio síndico seguem para outro julgador autorizado. |
| Enviar comunicados | Publique para moradores, funcionários ou todos; acompanhe a leitura. Use comunicados individuais para conversas e revise as sugestões enviadas pelo subsíndico. |
| Conduzir reuniões e eleições | Convoque reuniões, defina pautas e votações, registre votos presenciais e anexe ata e lista de presença. Conduza a eleição de síndico e subsíndico; o voto é secreto e o resultado só aparece após o encerramento. |
| Acompanhar reservas | Consulte a ocupação das áreas e, quando necessário, cancele pelo condomínio com motivo. O tratamento do pagamento segue as regras de cancelamento. |
| Solicitar cadastros | Com administradora ou Gestão + Suporte, envie pedidos de inclusão, alteração ou remoção de moradores e funcionários e acompanhe a resposta. |
| Acompanhar cobranças e finanças | Consulte inadimplência, solicite cobranças extras e acompanhe receitas, despesas e saldo. Em **Gestão > Finanças**, filtre lançamentos, comente e solicite exportações financeiras em CSV/PDF. Com administradora ou Gestão + Suporte, a edição financeira cabe à administração. |
| Tratar encomendas vencidas | Consulte encomendas cujo prazo de guarda terminou e registre a devolução. |
| Organizar a substituição | Ative a substituição quando necessário. O subsíndico assume as funções previstas durante esse período. |

No **Essencial com autogestão**, a administração fica com a gestão local. A distribuição aprovada põe síndico ou subsíndico em substituição na execução e conselho na fiscalização, com aprovação específica independente para troca da conta recebedora. Os procedimentos de implantação e lote 3 estão no [registro de autogestão](docs/01-produto/06-autogestao-e-conducao-eleitoral.md), seção 2.1. Desenvolvimento somente com dados fictícios; operador nomeado antes do primeiro condomínio oficial, sem atribuir essa função a Pedro. Os novos relatórios gerenciais da administradora não são liberados ao síndico por essa modalidade.

### Guia rápido do porteiro

Selecione **Portaria**. As abas principais são **Visitantes**, **Encomendas**, **Áreas** e **Menu**.

1. **Receber visitantes:** em **Visitantes**, busque por nome, unidade ou bloco e confira os alertas. Registre a entrada e, depois, a saída. A entrada é rápida, sem diálogo de confirmação; use **Desfazer** se tocar por engano. Nas listas de eventos, registre cada pessoa individualmente.
2. **Receber alguém não cadastrado:** confirme a autorização com o morador por interfone e registre como **Autorizado por interfone**. Observe também os alertas de bloqueio.
3. **Trabalhar sem internet:** consulte a lista do dia salva no aparelho e a hora da última sincronização. Entradas e saídas ficam pendentes de envio até a conexão voltar. Se aparecer uma divergência, confirme por interfone com o morador que cadastrou o visitante e trate o aviso.
4. **Receber encomendas:** em **Encomendas**, confira **Esperadas hoje**, registre a unidade, o remetente e, se necessário, a foto da etiqueta. Quando houver correspondência, vincule à entrega esperada. Na retirada, registre quem retirou. O aviso de entrega esperada não é uma autorização de entrada.
5. **Acompanhar áreas comuns:** em **Áreas**, consulte as reservas do dia. Ao constatar o uso a partir do início do horário, marque **Em andamento**; após o uso, registre a vistoria e **Cumprida**. Se não houve uso, registre **Não comparecimento** após o fim do horário. Essas ações exigem internet, inclusive em reserva paga não utilizada; a falta paga não gera penalidade nem reembolso automático.
6. **Informar problemas e treinar:** abra chamados de limpeza ou manutenção quando necessário. Use o modo de treinamento para praticar com visitantes e encomendas fictícios.

O funcionamento sem internet previsto para a portaria cobre consulta de visitantes e registro de entradas e saídas; ele não se estende automaticamente às demais tarefas.

### FAQ do morador

**Como faço o primeiro acesso?**

No produto previsto, a administração pré-cadastra seu e-mail. Você recebe um código, cria a senha e aceita os termos, a política de privacidade, o regimento e a página **Como funciona**. No protótipo, escolha **Morador** no painel lateral; o código simulado é `123456`.

**Tenho mais de uma unidade. Como escolho qual usar?**

Use o seletor de unidade no topo da tela inicial. Reservas, visitantes, cobranças e score devem ser consultados no contexto da unidade ativa.

**Como reservo uma área comum?**

Em **Reservas**, escolha a área e um horário disponível. Reservas gratuitas são confirmadas conforme as regras do condomínio; nas pagas, conclua o pagamento por Pix ou cartão dentro do prazo. Consulte o detalhe para cancelar: no padrão atual, cancelamentos com pelo menos 12 horas de antecedência dão direito a reembolso; depois desse prazo, não há reembolso. Confira sempre o prazo exibido, pois ele é configurável.

**Como autorizo visitas ou uma lista para um evento?**

Em **Visitantes**, cadastre uma visita avulsa, recorrente ou monte uma lista com várias pessoas. Você pode editar ou cancelar autorizações e aproveitar uma reserva para montar a lista do evento. A portaria registra as chegadas e você recebe os avisos previstos.

**Onde vejo minhas encomendas e aviso uma entrega?**

Abra **Menu > Encomendas** para consultar o recebimento e a retirada. Em **Avisar entrega**, informe a data esperada e, se souber, a faixa de horário e a origem. É possível editar, cancelar ou reagendar o aviso. Avisos de entregador de comida servem apenas para informar a portaria, sem registro de encomenda.

**Como peço limpeza ou manutenção?**

Em **Chamados**, descreva o problema, indique a urgência e adicione uma foto. Acompanhe o andamento e, após a conclusão, avalie o atendimento. Se o problema continuar, é possível reabrir em até 48 horas.

**Como registro uma reclamação ou consulto meu score?**

No **Menu**, acesse as reclamações para registrar e acompanhar uma ocorrência, responder quando for o alvo ou recorrer uma vez de uma decisão que retirou pontos, em até 7 dias da decisão. O julgador autorizado vê a identidade de quem reclamou; ela não é revelada ao alvo. Em **Meu score**, consulte o saldo e o histórico do seu vínculo com a unidade ativa. Cada novo vínculo começa em 100 e não herda pontos do ocupante anterior.

**Como acompanho comunicados e participo de assembleias?**

Leia os comunicados e responda às mensagens individuais. Consulte reuniões e votações no menu. O voto pela unidade é do proprietário ou de seu procurador. O inquilino também pode votar nas pautas sem despesa extraordinária, desde que o proprietário não vote até o encerramento; se ele votar, seu voto substitui o do inquilino. Nas eleições, vota o proprietário ou seu procurador.

**Como pago a taxa condominial?**

Quando o módulo de cobrança estiver ativo, o responsável financeiro consulta as cobranças, escolhe uma das formas habilitadas — boleto com QR Code Pix, Pix ou cartão — e acompanha pagamentos e comprovantes. Na unidade alugada, o padrão é o inquilino pagar despesas ordinárias e o proprietário, extraordinárias. No protótipo, nenhum pagamento real é feito.

**Posso avaliar os funcionários?**

Sim. A pesquisa mensal é opcional e permite avaliar quem você conhece. Ela é diferente da avaliação do atendimento de um chamado concluído. A tela **Transparência** mostra os indicadores públicos previstos para os setores e o síndico.

**Onde ajusto avisos ou faço pedidos sobre meus dados?**

No **Menu**, consulte as preferências de notificação, incluindo o lembrete opcional de reserva. Em **Privacidade e dados**, estão os pedidos de cópia dos próprios dados e exclusão da conta; o tratamento segue as regras de retenção aplicáveis. No protótipo, esses pedidos são apenas simulados.

## Documentação e mais informações

| Material | O que consultar |
| --- | --- |
| [Visão do produto](docs/01-produto/01-visao-de-produto.md) | Objetivo, públicos e proposta de valor |
| [PRD](docs/01-produto/02-prd.md) | Funcionalidades, perfis, permissões e escopo do MVP |
| [Regras de negócio](docs/01-produto/03-regras-de-negocio.md) | Regras detalhadas de cada módulo |
| [Histórias de usuário](docs/01-produto/04-historias-de-usuario.md) | Critérios de aceite |
| [Design System](docs/02-design/01-design-system.md) e [fluxos de uso](docs/02-design/02-user-flows.md) | Padrões de interface e jornadas por perfil |
| [Arquitetura](docs/03-arquitetura/01-arquitetura.md) e [ADRs](docs/03-arquitetura/adr/README.md) | Propostas técnicas e estado das decisões |
| [Contrato da API](docs/05-backend/api/README.md) | Contratos propostos antes da implementação |
| [Guia do protótipo](prototipo/README.md) | Telas disponíveis e como testar as simulações |

Para dúvidas, sugestões ou mais informações sobre o projeto, abra uma [issue no repositório](https://github.com/pedrolems/CondomiFacil/issues).
