# Protótipo navegável — CondomiFacil

Protótipo em HTML, CSS e JavaScript puro, feito a partir de `docs/02-design/01-design-system.md` (tokens, componentes, padrões de tela) e `docs/02-design/02-user-flows.md` (fluxos e mensagens de erro).

## Como abrir

### Revisão de 13/11/2026: autogestão e eleições

No painel lateral, ative **Essencial · Autogestão**. No perfil Síndico, abra Gestão → Administração do condomínio (`#/sindico/autogestao`): registros administrativos fictícios, sem backend nem formulários completos. A distribuição local foi aprovada em 17/11/2026 (AG-01 A): síndico executa, subsíndico executa na substituição formal e conselho fiscaliza. Morador com "Sou do conselho fiscal" acompanha `#/morador/autogestao` sem edição nem descrições administrativas pessoais. Finanças oferece novo lançamento simulado ao executor local; procedimentos aprovados em 17/11/2026 são apresentados em Implantação e procedimentos, com dados fictícios. Administradora fica indisponível nesta modalidade.

Em **Conduzir eleição** (`#/sindico/eleicoes`, também disponível para subsíndico, morador/conselho e proprietário), os controles laterais simulam disponibilidade de síndico, sub e conselho. A precedência é síndico → sub → conselho → proprietário designado, válida em qualquer plano. O controle de designação refere-se ao usuário do perfil atual, proprietário morador ou não residente; é uma concessão já validada simulada, sem definir quem pode concedê-la na aplicação real. Encerrar definitivamente revoga a permissão; segundo turno a conserva dentro da validade. A designação tem 30 dias, prorrogação validada e revogação por encerramento conclusivo, cancelamento, vencimento ou substituição validada. Alterar cenário revalida callbacks e o acesso direto; não há resultado parcial nem vínculo eleitor–voto. Simule empate, ausência de elegível e resultado conclusivo. Suporte autorizado não tem perfil próprio neste protótipo e sua condução não é simulada. Operações novas de administração, finanças e eleição exigem internet.

Registro de decisões e revisões: [Autogestão e condução eleitoral](../docs/01-produto/06-autogestao-e-conducao-eleitoral.md). Além da autogestão e precedência eleitoral, Pedro aprovou em 17/11/2026 AG-01 A, AG-02 A e AG-07 C. Na implantação da autogestão sem autoridade habilitada, o Admin da plataforma verifica a primeira identidade e representação com capacidade restrita; mandatos se vinculam ao resultado/posse eleitoral, com validação independente nas exceções e conflitos. O detalhamento aprovado em 17/11/2026 está simulado em Implantação e procedimentos. Operador oficial não nomeado: desenvolvimento usa dados fictícios, com nomeação antes do primeiro condomínio oficial. A verificação não abre conteúdo de gestão, reclamações ou scores nem usa Suporte no Essencial; condução eleitoral não concede gestão geral. A revisão de 17/11/2026 acrescenta a tela de procedimentos e controles de validade eleitoral; não concede acesso real. Os dados e a auditoria são locais e desaparecem ao recarregar.

Abra `index.html` no navegador (duplo clique funciona). Se preferir um servidor local:

```bash
cd prototipo
python -m http.server 8765
# http://localhost:8765
```

Funciona sem internet: a fonte Inter e os ícones Lucide 0.460.0 ficam em `vendor/` (licenças OFL e ISC ao lado dos arquivos).

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `css/tokens.css` | Tokens do Design System (seções 4 a 9), temas claro e escuro |
| `css/components.css` | Componentes da seção 10 (botão, campo, selo, cartão, faixa, folha, diálogo, calendário, score…) |
| `css/app.css` | Moldura do protótipo: hub, painel lateral, aparelho e painel web |
| `js/core.js` | Rotas (`#/perfil/tela/arg`), layout, componentes e camadas |
| `js/data.js` | Dados fictícios em memória |
| `js/telas/acesso.js` | Fluxos 3.1 a 3.4: primeiro acesso, login, recuperação, trocar senha, termos, onboarding |
| `js/telas/morador.js` | Morador (e telas que o síndico reaproveita) e proprietário não residente |
| `js/telas/sindico.js` | Aba Gestão do síndico e do subsíndico (permissões por estado da substituição) |
| `js/telas/funcionarios.js` | Portaria e limpeza |
| `js/telas/admin.js` | Painel web da administradora |
| `js/telas/financas.js` | Finanças do condomínio: painel web da administradora (edita) e leitura do síndico e do conselho fiscal |

## Perfis

**Conclusão offline por horário do celular (RN-CH-04):** na Limpeza, ligue "Sem internet" e conclua "Lixeira do Bloco B". A folha permite simular Rita com horário anterior ou Sandra com horário anterior enviado depois. Ao voltar a conexão, vale o menor horário do celular e o aviso explica a correção. Operações têm identificador estável; reenvio não duplica o efeito. Se uma conclusão avaliada for superada, a nota fica somente no histórico do atendente original e sai das médias; a conclusão efetiva pode receber nova avaliação na mesma janela configurada, contada da disponibilização da correção, sem reiniciar as 48h para reabrir.

- **Acesso e conta:** primeiro acesso (código: `123456`), login (senha `errada` ou `desativada` simula erros), novo aceite, trocar senha (`#/perfil/trocar-senha`, Menu > Trocar senha em todos os perfis de celular; senha atual `errada` simula erro e, com 5 erros, a pausa de 15 minutos).
- **Morador:** Início · Reservas · Visitantes · Chamados · Menu.
- **Score por pessoa/unidade:** Menu > Meu score identifica a unidade ativa. Trocar pelo seletor muda saldo, histórico e recuperação: o exemplo da primeira unidade tem 80; a segunda começa em 100. “Score baixo nesta unidade” altera só a unidade ativa; ao trocar, a outra permanece independente. Funcionários consultam score funcional do condomínio. A Transparência identifica a unidade do mandato do síndico; não reúne as pontuações de seus outros imóveis (RN-SC-02, RN-SC-13, RN-SC-14).
- **Lembrete de reserva (RN-RE-14):** no Morador > Início > sino (Notificações), a notificação "Reserva amanhã" (Churrasqueira, com atalho que abre o detalhe da reserva e o botão "Cancelar reserva"). Em Menu > Notificações, o interruptor opcional "Lembrete de reserva" (ligado por padrão); desligado, a notificação some da lista. Na Administradora > Configurações, o parâmetro "Lembrete de reserva (antecedência do push)" (padrão 24h, faixa 1 a 72).
- **Síndico:** Início · Gestão · Reservas · Visitantes · Menu.
- **Subsíndico:** as mesmas abas do síndico. Fora da substituição, a Gestão é enxuta: reclamações contra o síndico, manutenção só para acompanhar, sugestões de comunicado, votos presenciais e encomendas vencidas. "Substituição ativa" no painel lateral libera todas as funções de síndico.
- **Administradora:** painel web com navegação lateral.
- **Portaria:** Visitantes · Encomendas · Áreas · Menu. Áreas mostra Reservas de hoje por horário, com área, unidade e estado, sem valores ou meios de pagamento; pode marcar Em andamento e fazer vistoria para Cumprida ou Não comparecimento, inclusive paga. O horário simulado é 05/11/2026 às 14h30: Churrasqueira permite iniciar uso e vistoriar após uso; Salão de festas permite testar falta paga após o horário; Quadra ainda não começou; Espaço gourmet aguarda pagamento. Pendências anteriores aparecem separadas. Marcações exigem internet e registram autor/momento; falta paga não gera perda de pontos nem reembolso automático. Visitantes continuam com modo offline, divergência e treinamento.
- **Limpeza:** Chamados · Áreas · Menu. Conclui chamados com fotos opcionais; Áreas mantém vistoria (checklist e fotos quando houve uso) e registro de faltas pagas/gratuitas, sem marcar início Em andamento. Vistoria exige internet. Menu > Minhas avaliações mostra a média e os comentários sem identificar o morador (com menos de 3 avaliações, só o aviso).
- **Avaliação do atendimento (fluxos 8.4 e 8.5):** no Morador > Chamados, o chamado concluído mostra as fotos do serviço (se houver) e "Avaliar o serviço" (exemplos: Salão de festas com fotos, Corredor do Bloco A sem fotos, Churrasqueira já avaliada, Portão já avaliado com nota baixa). O síndico vê Gestão > Avaliações do atendimento; a administradora vê a coluna Atendimento em Funcionários.
- **Lista de visitantes (fluxo 6.5):** no Morador > Visitantes, o botão "Novo" abre "Montar lista de visitantes" (rota `lista-visitantes-nova`; com origem de reserva, `lista-visitantes-nova/reserva:r2`; função `abrirListaVisitantes(perfil, reservaId)`). Adiciona e remove linhas, cola vários nomes, usa recentes, frequentes e lista salva, e envia. Exemplo pronto: "Aniversário do Theo" (18 pessoas, 5 chegaram), que a Portaria vê agrupada em Visitantes, com entrada pessoa a pessoa.
- **Entregas esperadas (fluxo 7.2):** no Morador > Menu > Encomendas, "Avisar entrega" (rota `entrega-nova`; editar e reagendar em `entrega-nova/x4`) e toque na linha para editar ou cancelar. Exemplos do morador (Apto 101): duas esperadas hoje (Amazon 12h às 19h; outra sem faixa nem origem), uma futura (08/11) e uma que não chegou (reagendável). Na Portaria > Encomendas, "Esperadas hoje" por faixa (inclui um aviso de iFood/entregador, sem registro) e, em "Registrar encomenda", o vínculo sugerido pela unidade e pela origem (ex.: Bloco A · Apto 101 + Amazon).
- **Finanças do condomínio (fluxos 13.3 e 13.4):** na Administradora, "Finanças" (resumo do mês com comparação, despesas por categoria em barras e tabela, receitas por origem, evolução de 6 ou 12 meses em SVG com tabela, lançamentos com filtros, novo lançamento com validações, editar e excluir em mês aberto, estornar em mês fechado, fechar o mês, exportação CSV e PDF simulada). Outubro está aberto (fecha em 10/11) e setembro fechado, com um estorno de exemplo. Receitas de cobrança e reservas são automáticas e agregadas, sem unidade. No Síndico, Gestão > Finanças (só leitura, com comentário e exportação); o subsíndico só vê na substituição; no Morador, "Sou do conselho fiscal" no painel lateral liga Menu > Finanças do condomínio. Comentário de exemplo do conselho na reforma da garagem (outubro). Dados em `S.fin` (`data.js`).
- **Manutenção:** empresas e chamados permanecem acompanhados pelo síndico; o perfil de acesso proposto foi retirado em 17/11/2026.
- **Proprietário não residente:** Unidade · Cobranças · Assembleias · Menu. Acompanha o contrato de locação e as ocorrências, paga as despesas extraordinárias e vota.
- **Locação no painel da administradora:** Unidades e moradores > "Alugadas" ou "Desocupadas" abre o detalhe da unidade (cadastrar, renovar e encerrar contrato, responsáveis financeiros por tipo).

O painel à esquerda lista todas as telas do perfil, troca o tema e simula situações (score baixo, unidade em atraso, termos novos, sem internet). No morador, "Morador é inquilino" mostra o voto do inquilino e as cobranças só ordinárias; no proprietário, há "Unidade desocupada", "Temporada permitida" e "Contrato vence em 20 dias".

## Decisões de 12/11/2026 no protótipo

As [19 escolhas aprovadas](../docs/01-produto/05-decisoes-de-complementacao.md) foram refletidas nas regras, documentos e simulações abaixo. Tudo continua em memória, sem backend, gateway ou armazenamento seguro real.

| Onde testar | Comportamento | Escolhas |
| --- | --- | --- |
| Morador > Reserva paga > Cancelar | 12h exatas estão no reembolso; menos de 12h avisa ausência de devolução | 1A |
| Síndico > Gestão > Cancelar pelo condomínio; Administradora > Cancelar pelo condomínio; Áreas > Bloquear para manutenção | Motivo obrigatório, autoria/auditoria em memória; Aguardando pagamento cancela sem devolução; paga registra reembolso solicitado, sem fingir devolução concluída. Sub fora da substituição é recusado também pela rota direta | 2A/3A |
| Administradora > Recebimentos em análise | Simula dinheiro em reserva expirada/cancelada e cobrança cancelada sem reativar; registra encaminhamento assistido. Outra opção paga Emitida após vencimento antes da rotina e mostra Paga com atraso. Confirmação pelas telas Pix/cartão também preserva dinheiro de entidade cancelada/expirada | 4A/5A/6A |
| Morador > Chamado concluído de manutenção > Reabrir; Síndico > Gestão > Manutenção > detalhe | Mantém Reaberto até triagem explícita para Orçamento/Agendado; sub fora da substituição não tria | 7A |
| Administradora > Vigência e histórico (lista lateral de telas); Morador > Defesa e recurso do vínculo anterior (lista lateral) | Recorte de caso contra síndico: perda da função do sub transfere atribuição à administradora sem ex-acesso; troca de habilitado preserva episódio. Penalidade nominal10 aplicada sobre3 restitui só3; simular novo habilitado nega leitura do caso | 8A/9A/10A |
| Comunicado > Mais ações > Denunciar; Síndico/Subsíndico > Gestão > Denúncias recebidas | Projeção sem identidade protegida, encerrar sem ação ou ocultar com motivo/histórico, sem score automático. Ocultar substitui texto normal por aviso e preserva evidência em memória; atribuição considera substituição vigente | 11A |
| Conduzir eleição; Síndico > Reuniões; Morador/Proprietário > Eleição | Precedência local em qualquer plano conforme decisão de 13/11; substitui restrição de 12A. Primeiro empate segue a segundo turno; segundo empate ou ausência de elegível fica inconclusivo para o condomínio, sem vencedor automático | RN-VO-13; 13A |
| Privacidade e dados; Portaria/Limpeza > indicador de sincronização | Explica análise autorizada para exceções LGPD e separação fila/cache; não concede operador nem simula prazo de retenção/logout/segurança já resolvido | 14A/15A |
| Finanças > lançamentos; Exportar CSV/PDF > Acompanhar exportações | Receitas por dia/categoria, sem unidade. Pedido assíncrono não oferece arquivo antes da conclusão; pode simular falha; fechar a folha não a reabre ao concluir, e pedido pode ser retomado pelo acompanhamento | 17A/18A |
| Administradora > Assinatura da plataforma | Consulta cobrança assistida/manual separada do dinheiro condominial; cliente pode anotar contato comercial, sem emitir/baixar cobrança nem agir como equipe da plataforma | 19A |

A tolerância de refresh (16A) foi definida em 20/11/2026 (30 s, ADR-007), mas o protótipo não a demonstra. Operador LGPD, privacidade do acesso histórico/moderação, retenção/logout da fila, sigilo/substituição do voto e integrações Asaas continuam condições de desenho/validação externa. O protótipo não demonstra essas garantias técnicas. As simulações não substituem testes de implementação ou validação visual com usuários.

## Relatórios do MVP — revisão de 14/11/2026

Administradora > Relatórios (`#/admin/relatorios`) mostra catálogo de nove tipos, filtros, tabela e gráfico agregado quando permitido. PDF/CSV/XLSX representam tabela; PNG/SVG só gráficos agregados. “Solicitar exportação” cria pedido local em Exportações (`#/admin/exportacoes-relatorios`); simule conclusão, falha, expiração e revogação de acesso. O pedido mantém seu condomínio original ao trocar contexto.

Tudo é simulação em memória: nenhum PDF/XLSX/PNG/SVG real é gerado; “Simular download” mostra confirmação explícita, sem baixar arquivo falso. Relatórios novos só da administradora; não ampliam suporte/autogestão ou exportações financeiras legadas. Rastreabilidade: RN-RL-01 a 08 → RF-RL-01 a 11 → US-RL-01 a 03 → UF18 → DS11.18 → `js/telas/relatorios.js`.

## Autogestão e implantação — decisões de 17/11/2026

Escolhas: 1C, 8B e demais A da rodada de 14 decisões. Nenhum operador oficial nomeado e nenhum canal real de atendimento criado.

- Ative **Essencial · Autogestão** no Síndico e abra **Implantação e procedimentos** na lista lateral ou em Administração do condomínio. Simule documentos insuficientes/suficientes, verificação independente e contestação. Não há upload real, concessão de poder, prazo prometido ou suspensão automática por alegação. A tela descreve provas por evento, ausência com início/fim, emergência com dois representantes independentes/fallback restrito e representante/substituto do conselho por eleição.
- Em troca de conta, o síndico solicita e o subsíndico fora da substituição ou morador com conselho fiscal aprova como segundo ator. Autoaprovação, falta de segundo, offline e perda da função impedem aprovação; a capacidade não libera lançamentos ao conselho. A conta vigente é preservada na simulação.
- Baixa, cancelamento e devolução manuais exigem motivo, comprovante fictício e reautenticação simulada; registram intenção/auditoria sem movimentação real. Regras de devolução obrigatória, estorno e mês fechado continuam vigentes.
- Simule ausência de julgador: estado Aguardando julgador elegível, sem decisão/punição automática. Transição mostra preparação assistida e transferência de pendências, arquivos/histórico/vigência/revogação; não efetiva mudança comercial ou acessos reais. Atendimento técnico/comercial por e-mail aguarda responsável/endereço antes da operação oficial.
- Para a designação eleitoral, deixe síndico/sub/conselho indisponíveis, selecione Proprietário e ative a designação. Na eleição, simule prorrogação validada, vencimento, cancelamento ou substituição; callbacks reavaliam autorização. Ative **Sem gestor habilitado** para bloquear a execução administrativa/financeira local; esse controle é separado da disponibilidade eleitoral.

Todo estado desaparece ao recarregar. As simulações não comprovam segurança, armazenamento de documentos, integração Asaas, RLS, revogação de sessões ou implantação oficial. Lote 4 respondido em 17/11/2026 (IN-01 A, IN-02 A); pacote técnico, G0 e liberação da base executável permanecem pendentes.

### Complemento da simulação de substituição

Gestão → Substituição registra uma ausência fictícia de 7 dias, exibindo início/fim (exemplo a partir de 17/11/2026). O período do exemplo não fixa limite de duração das ausências reais. O titular pode registrar retorno; ambos os perfis podem simular a chegada do término como controle de cenário. Renderização e ações reavaliam o relógio e retiram a capacidade ao vencer. O subsíndico não concede a própria substituição.

**Sem gestor habilitado** também bloqueia `plena()` e callbacks administrativos das telas de gestão, inclusive callbacks capturados antes da mudança de cenário. Navegação e conteúdo de consulta, funções de morador e condução eleitoral permanecem disponíveis. Alguns controles de filtro da própria tela administrativa também ficam inativos nesse cenário; não são execução de rotinas. O protótipo não executa rotinas reais nem revoga sessões de servidor.

## Melhorias de 17/11/2026 (sem mudança de regra)

Aprovadas por Pedro; nenhuma altera RN, RF ou US. Tudo em memória e some ao recarregar. Rastreabilidade: Design System, seção 18.

- **Offline e vendor:** a fonte Inter e os ícones Lucide 0.460.0 ficam em `vendor/` (licenças ao lado), sem CDN.
- **Painel lateral, novas simulações:**
  - **Notificações do aparelho: ativadas/desativadas** (Morador, Síndico, Subsíndico): desativadas, o detalhe da reserva e Menu > Notificações avisam que o lembrete (RN-RE-14, só push) não chegará.
  - **Relógio do celular diferente do servidor** (Limpeza): ligado, concluir um chamado sem internet e voltar a conexão mostra o aviso de horário divergente. É proposta do ADR-014, sem limite numérico; RN-CH-04 inalterada.
  - **Simular sem internet / Voltar internet** (perfis de funcionários), usado nos dois itens abaixo.
- **Papel ativo:** o seletor de unidade mostra "Atuando como: ..." para o morador que também é conselho fiscal (botão "Sou do conselho fiscal") e para o subsíndico, com "em substituição" quando ativa. Só indicação; sem novo perfil nem troca de papel.
- **Vistoria pendente (Portaria e Limpeza > Áreas):** sem internet, a marcação de uso ou vistoria não vai para a fila (RN-RE-13); aparece o selo "Aguardando internet", o preenchimento é mantido e o aviso diz que ainda não foi registrada. Ao voltar a internet, é preciso repetir a marcação.
- **Desfazer offline (Portaria):** sem internet, o aviso diz que a entrada está na fila e o Desfazer cancela só a operação pendente; depois de enviada, informa que não dá para desfazer pela fila (sem protocolo de compensação, pendência da API 16-18). O aviso com Desfazer fica enquanto houver hover ou foco.
- **Listas de visitantes:** o texto de retenção informa que os nomes são dados de outras pessoas e que o prazo de guarda depende da política de privacidade, ainda em definição (nenhum prazo).
- **Grupos pequenos nos relatórios:** valor oculto com "Grupo pequeno: valor ocultado para proteger a privacidade", sem barra no gráfico e sem dado individual na exportação simulada. O limite do protótipo (`GRUPO_PEQUENO_MAX` em `js/telas/relatorios.js`) é ilustrativo; o real está por definir.
- **Comentários anônimos de avaliação (RN-CH-20):** mínimo de 3 avaliações mantido por decisão de Pedro; o risco em condomínio pequeno só está documentado.

### Verificação de contraste

```bash
node prototipo/tools/verificar-contraste.mjs
```

Sem dependências e sem alterar arquivos. Lê `css/tokens.css` e confere o contraste WCAG 2.x dos pares de tokens nos temas claro e escuro (mínimo 4,5:1 para texto e 3:1 para ícones, bordas e componentes), além de a paleta da seção 4.1 do Design System estar declarada e de o bloco `prefers-color-scheme: dark` ser idêntico a `:root[data-theme="dark"]`. Sai com código 1 se algum par falhar. Última execução: 64 pares, 0 falhas; reporta 13 tons da paleta (`green`, `amber` e `red`) ausentes em `tokens.css`, decisão pendente de Pedro. Não verifica contraste sobre imagens, estados de foco nem a renderização real nas telas.
