# Padrões e modelos de tela

Os esboços usam dados fictícios. Busque os componentes e mensagens no [Design System](../../../../../docs/02-design/01-design-system.md) e confira a sequência no [User Flows](../../../../../docs/02-design/02-user-flows.md).

## Composição

| Dimensão | Aplicação |
| --- | --- |
| Marca e hierarquia | Inter, Lucide, azul da marca e até um destaque coral por tela, além dos gráficos. No tema claro, use `color.accent.fg` para texto e ícone coral. Os preenchimentos coral seguem o contraste e o contorno da seção 4.3. Estados de erro e bloqueio usam a família `danger`. |
| Superfícies | Use a grade de 4 dp, margem de 16 no celular, 24 na faixa média e 40 na expandida. Cartões usam superfície sem sombra. Campos usam `radius.sm`, botões e cartões `radius.md`, folhas inferiores e diálogos `radius.lg`. |
| Responsividade | Até 599, use uma coluna e a navegação do perfil. Entre 600 e 1023, avalie lista e detalhe lado a lado, com navegação lateral recolhida quando aplicável. A partir de 1024, o painel usa barra lateral de 256, conteúdo de até 1280 e formulários de até 640. Na faixa compacta, as linhas da tabela viram cartões. |
| Controle e retorno | Alvos de pelo menos 48 × 48 dp, com 8 dp entre alvos. Na portaria, ações principais têm 56 dp de altura. Dê nome acessível a ícones acionáveis e combine texto e ícone nos estados. Use esqueletos estáticos no formato do conteúdo. Para erro recuperável, ofereça “Tentar de novo”. |
| Dados | Mostre condomínio e unidade onde mudam o significado dos dados. Aplique as regras de privacidade a listas, detalhes, notificações e exportações. Quando for preciso indicar uma restrição sem expor o motivo a terceiros, use “Indisponível”. |

## Início do morador

```text
Topo       [Bloco A · Apto 101 ▾]                    [Notificações]
Atalhos    [Cadastrar visitante] [Reservar] [Abrir chamado]
Para você  [Cobrança em aberto]                      se autorizado
           [Encomenda aguardando retirada] [Votação aberta]
           [Próxima reserva] [Comunicados]
Rodapé     Início · Reservas · Visitantes · Chamados · Menu
```

- Mantenha a grade de três ações da seção 11.3 e o acesso às tarefas em até três toques. Acima de encomendas, insira “Para julgar” para quem tem item a julgar. Inclua “Pesquisa do mês” quando estiver aberta e ainda sem resposta. A partir de 30 dias do fim do contrato, apresente ao inquilino “Contrato de locação” com prazo e orientação.
- A troca de unidade atualiza os cartões e preserva os dados por vínculo. Em largura compacta e com fonte ampliada, permita rótulos em mais linhas e mantenha os alvos de toque. Em larguras maiores, preserve a ordem de leitura e a prioridade dos atalhos.
- Na reserva, mostre áreas → calendário e horários → resumo com regras de cancelamento → “Reservar” ou “Reservar e pagar”. Use “Ocupado” no calendário para preservar a identidade de quem reservou. Na reserva paga por Pix, mostre QR Code, código copiável e prazo. Diferencie espera e confirmação.

Confira DS 11.3–11.4, 12 e 15, fluxo 5.1 e RNF-15.

## Portaria · Visitantes

```text
Topo       Visitantes                                 [Offline · 14h32]
Aviso      [ícone] Sem internet · lista de 14h32 · 3 pendentes
Busca      [Buscar por nome, unidade ou bloco] [Todos] [Bloco A]
Lista      Esperados hoje
           Ana Lima · Bloco A · Apto 101    [Esperado]          [Entrada]
           Listas de visitantes · 18 pessoas, 5 chegaram
Retorno    Entrada registrada no aparelho                      [Desfazer]
Rodapé     Visitantes · Encomendas · Áreas · Menu
```

- Abra em “Esperados hoje”, mantenha busca fixa e dê prioridade a nome, unidade, estado e “Entrada” ou “Saída”. Na entrada normal, registre ao tocar e ofereça “Desfazer” por 10 s. Mantenha o diálogo previsto para a lista de bloqueio. Em tela estreita, quebre metadados em linhas e preserve a visibilidade da ação e o alvo de 56 dp.
- Na faixa offline, informe hora da última sincronização. Mantenha as pendências até o envio e diferencie registro no aparelho de envio confirmado. Ao voltar a rede, o indicador pode mostrar “Enviando 3”. Em divergência após sincronizar, preserve o diálogo bloqueante com orientação para interfonar e a ação “Confirmei com o morador”.
- Em Áreas, “Reservas de hoje” mostra horário, área, unidade e estado. “Marcar em andamento” se aplica à reserva confirmada após o início do horário, com uso constatado. “Marcar cumprida” vem da vistoria após uso e dispensa marcação prévia de início. “Registrar não comparecimento” se aplica à reserva confirmada após o horário, sem uso, checklist ou fotos. As três ações exigem internet. Explique a indisponibilidade ao ficar offline. Aplique a matriz de conectividade ao registro de encomendas.

Confira DS 10.10–10.11, 10.23, 11.1 e 11.13, fluxos 5.3 e 6.2–6.3, US-VI-03, US-VI-04 e RN-OF-04. [Matriz offline](../../../../../docs/06-frontend/frontend.md)

## Painel web · Relatórios e Exportações

```text
Navegação lateral | Condomínio Jardim das Flores · Relatórios
Relatórios        | [Tipo de relatório] [Período] [Filtros] [Consultar]
Exportações       | Referência do cálculo · Total do conjunto filtrado
                  | [Exportar tabela] [Exportar relatório em PDF]
                  | Tabela · Cabeçalhos · Linhas · Paginação
                  | Gráfico agregado + alternativa tabular, quando permitido
```

- Na largura expandida, deixe título, filtros, referência de cálculo e total do conjunto acima da tabela. Indique separadamente a quantidade da página. Use cabeçalhos de coluna, números tabulares alinhados à direita, foco visível e paginação no rodapé. Na compacta, cada cartão mantém os rótulos dos campos e as ações autorizadas. Preserve os filtros disponíveis e o condomínio selecionado.
- Apresente os nove tipos do MVP à administradora autorizada. Mostre “Exportar gráfico” quando houver gráfico agregado elegível. Para tabela, use PDF/CSV/XLSX conforme o catálogo. PNG/SVG representam gráficos agregados com período e legenda. Revise condomínio, filtros e formato antes de solicitar.
- Em Exportações, mostre pedidos próprios do contexto, com ícone e texto para “Solicitada”, “Em processamento”, “Pronta”, “Falhou” e “Expirada”. “Pronta” permite baixar após revalidação do acesso. “Falhou” e arquivo expirado permitem nova geração. Renove o link quando arquivo e acesso continuarem válidos. Ao trocar de condomínio, limpe a consulta e preserve o vínculo original do pedido. Consulte as pendências de retenção e privacidade de pequenos grupos.

Confira DS 10.22, 11.9 e 11.18, fluxo 18, RN-RL-01 a 08, RF-RL-01 a 11 e US-RL-01 a 03. [Painel web](../../../../../docs/06-frontend/painel-web.md)

