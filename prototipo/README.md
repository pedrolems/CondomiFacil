# Protótipo navegável — CondomiFacil

Protótipo em HTML, CSS e JavaScript puro, feito a partir de `docs/02-design/01-design-system.md` (tokens, componentes, padrões de tela) e `docs/02-design/02-user-flows.md` (fluxos e mensagens de erro).

## Como abrir

### Revisão de 13/11/2026: autogestão e eleições

No painel lateral, ative **Essencial · Autogestão**. No perfil Síndico, abra Gestão → Administração do condomínio (`#/sindico/autogestao`): registros administrativos fictícios, execução local proposta para revisão, sem criar backend nem formulários completos. Subsíndico executa na substituição; morador com "Sou do conselho fiscal" acompanha `#/morador/autogestao` sem edição nem descrições administrativas pessoais. Finanças oferece novo lançamento simulado ao executor local; a matriz detalhada e demais operações administrativas continuam para revisão. Administradora fica indisponível nesta modalidade.

Em **Conduzir eleição** (`#/sindico/eleicoes`, também disponível para subsíndico, morador/conselho e proprietário), os controles laterais simulam disponibilidade de síndico, sub e conselho. A precedência é síndico → sub → conselho → proprietário designado, válida em qualquer plano. O controle de designação refere-se ao usuário do perfil atual, proprietário morador ou não residente; é uma concessão já validada simulada, sem definir quem pode concedê-la na aplicação real. Encerrar definitivamente revoga a permissão; segundo turno a conserva. Alterar cenário revalida callbacks e o acesso direto; não há resultado parcial nem vínculo eleitor–voto. Simule empate, ausência de elegível e resultado conclusivo. Suporte autorizado não tem perfil próprio neste protótipo e sua condução não é simulada. Operações novas de administração, finanças e eleição exigem internet.

Registro de decisões e revisões: [Autogestão e condução eleitoral](../docs/01-produto/06-autogestao-e-conducao-eleitoral.md). A distribuição operacional entre síndico/sub/conselho é proposta de desenho a revisar; autogestão e precedência eleitoral são decisões do Pedro. Os dados e a auditoria são locais e desaparecem ao recarregar.

Abra `index.html` no navegador (duplo clique funciona). Se preferir um servidor local:

```bash
cd prototipo
python -m http.server 8765
# http://localhost:8765
```

Precisa de internet só para a fonte Inter e os ícones Lucide (CDN).

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `css/tokens.css` | Tokens do Design System (seções 4 a 9), temas claro e escuro |
| `css/components.css` | Componentes da seção 10 (botão, campo, selo, cartão, faixa, folha, diálogo, calendário, score…) |
| `css/app.css` | Moldura do protótipo: hub, painel lateral, aparelho e painel web |
| `js/core.js` | Rotas (`#/perfil/tela/arg`), layout, componentes e camadas |
| `js/data.js` | Dados fictícios em memória |
| `js/telas/acesso.js` | Fluxos 3.1 a 3.3: primeiro acesso, login, recuperação, termos, onboarding |
| `js/telas/morador.js` | Morador (e telas que o síndico reaproveita) e proprietário não residente |
| `js/telas/sindico.js` | Aba Gestão do síndico e do subsíndico (permissões por estado da substituição) |
| `js/telas/funcionarios.js` | Portaria, limpeza e manutenção |
| `js/telas/admin.js` | Painel web da administradora |
| `js/telas/financas.js` | Finanças do condomínio: painel web da administradora (edita) e leitura do síndico e do conselho fiscal |

## Perfis

**Conclusão offline por horário do celular (RN-CH-04):** na Limpeza, ligue "Sem internet" e conclua "Lixeira do Bloco B". A folha permite simular Rita com horário anterior ou Sandra com horário anterior enviado depois. Ao voltar a conexão, vale o menor horário do celular e o aviso explica a correção. Operações têm identificador estável; reenvio não duplica o efeito. Se uma conclusão avaliada for superada, a nota fica somente no histórico do atendente original e sai das médias; a conclusão efetiva pode receber nova avaliação na mesma janela configurada, contada da disponibilização da correção, sem reiniciar as 48h para reabrir.

- **Acesso e conta:** primeiro acesso (código: `123456`), login (senha `errada` ou `desativada` simula erros), novo aceite.
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
- **Manutenção:** *proposta*; o PRD não tem esse perfil (hoje o síndico acompanha empresas cadastradas).
- **Proprietário não residente:** Unidade · Cobranças · Assembleias · Menu. Acompanha o contrato de locação e as ocorrências, paga as despesas extraordinárias e vota.
- **Locação no painel da administradora:** Unidades e moradores > "Alugadas" ou "Desocupadas" abre o detalhe da unidade (cadastrar, renovar e encerrar contrato, responsáveis financeiros por tipo).

O painel à esquerda lista todas as telas do perfil, troca o tema e simula situações (score baixo, unidade em atraso, termos novos, sem internet). No morador, "Morador é inquilino" mostra o voto do inquilino e as cobranças só ordinárias; no proprietário, há "Unidade desocupada", "Temporada permitida" e "Contrato vence em 20 dias".

## Decisões de 12/11/2026 no protótipo

As [19 escolhas aprovadas](../docs/01-produto/05-decisoes-de-complementacao.md) foram refletidas nas regras, documentos e simulações abaixo. Tudo continua em memória, sem backend, gateway ou armazenamento seguro real.

| Onde testar | Comportamento | Escolhas |
| --- | --- | --- |
| Morador > Reserva paga > Cancelar | 12h exatas estão no reembolso; menos de12h avisa ausência de devolução | 1A |
| Síndico > Gestão > Cancelar pelo condomínio; Administradora > Cancelar pelo condomínio; Áreas > Bloquear para manutenção | Motivo obrigatório, autoria/auditoria em memória; Aguardando pagamento cancela sem devolução; paga registra reembolso solicitado, sem fingir devolução concluída. Sub fora da substituição é recusado também pela rota direta | 2A/3A |
| Administradora > Recebimentos em análise | Simula dinheiro em reserva expirada/cancelada e cobrança cancelada sem reativar; registra encaminhamento assistido. Outra opção paga Emitida após vencimento antes da rotina e mostra Paga com atraso. Confirmação pelas telas Pix/cartão também preserva dinheiro de entidade cancelada/expirada | 4A/5A/6A |
| Morador > Chamado concluído de manutenção > Reabrir; Síndico > Gestão > Manutenção > detalhe | Mantém Reaberto até triagem explícita para Orçamento/Agendado; sub fora da substituição não tria | 7A |
| Administradora > Vigência e histórico (lista lateral de telas); Morador > Defesa e recurso do vínculo anterior (lista lateral) | Recorte de caso contra síndico: perda da função do sub transfere atribuição à administradora sem ex-acesso; troca de habilitado preserva episódio. Penalidade nominal10 aplicada sobre3 restitui só3; simular novo habilitado nega leitura do caso | 8A/9A/10A |
| Comunicado > Mais ações > Denunciar; Síndico/Subsíndico > Gestão > Denúncias recebidas | Projeção sem identidade protegida, encerrar sem ação ou ocultar com motivo/histórico, sem score automático. Ocultar substitui texto normal por aviso e preserva evidência em memória; atribuição considera substituição vigente | 11A |
| Conduzir eleição; Síndico > Reuniões; Morador/Proprietário > Eleição | Precedência local em qualquer plano conforme decisão de 13/11; substitui restrição de 12A. Primeiro empate segue a segundo turno; segundo empate ou ausência de elegível fica inconclusivo para o condomínio, sem vencedor automático | RN-VO-13; 13A |
| Privacidade e dados; Portaria/Limpeza > indicador de sincronização | Explica análise autorizada para exceções LGPD e separação fila/cache; não concede operador nem simula prazo de retenção/logout/segurança já resolvido | 14A/15A |
| Finanças > lançamentos; Exportar CSV/PDF > Acompanhar exportações | Receitas por dia/categoria, sem unidade. Pedido assíncrono não oferece arquivo antes da conclusão; pode simular falha; fechar a folha não a reabre ao concluir, e pedido pode ser retomado pelo acompanhamento | 17A/18A |
| Administradora > Assinatura da plataforma | Consulta cobrança assistida/manual separada do dinheiro condominial; cliente pode anotar contato comercial, sem emitir/baixar cobrança nem agir como equipe da plataforma | 19A |

A tolerância controlada de refresh (16A), operador LGPD, privacidade do acesso histórico/moderação, retenção/logout da fila, sigilo/substituição do voto e integrações Asaas continuam condições de desenho/validação externa. O protótipo não demonstra essas garantias técnicas. As simulações não substituem testes de implementação ou validação visual com usuários.

## Relatórios do MVP — revisão de 14/11/2026

Administradora > Relatórios (`#/admin/relatorios`) mostra catálogo de nove tipos, filtros, tabela e gráfico agregado quando permitido. PDF/CSV/XLSX representam tabela; PNG/SVG só gráficos agregados. “Solicitar exportação” cria pedido local em Exportações (`#/admin/exportacoes-relatorios`); simule conclusão, falha, expiração e revogação de acesso. O pedido mantém seu condomínio original ao trocar contexto.

Tudo é simulação em memória: nenhum PDF/XLSX/PNG/SVG real é gerado; “Simular download” mostra confirmação explícita, sem baixar arquivo falso. Relatórios novos só da administradora; não ampliam suporte/autogestão ou exportações financeiras legadas. Rastreabilidade: RN-RL-01 a 08 → RF-RL-01 a 11 → US-RL-01 a 03 → UF18 → DS11.18 → `js/telas/relatorios.js`.
