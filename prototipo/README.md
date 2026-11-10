# Protótipo navegável — CondomiFacil

Protótipo em HTML, CSS e JavaScript puro, feito a partir de `docs/02-design/01-design-system.md` (tokens, componentes, padrões de tela) e `docs/02-design/02-user-flows.md` (fluxos e mensagens de erro).

## Como abrir

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
