# Design System — CondomiFacil

Nov 4, 2026 · @Pedro Lemos

Este documento define os padrões visuais e de interação do CondomiFacil: cores, tipografia, espaçamento, ícones, componentes, padrões de tela, escrita e acessibilidade. Ele vale para o app (Android e iOS) e para a versão web, que saem do mesmo código em React Native.

## 1. Como usar este documento

- **Fonte oficial.** Este documento é a fonte oficial de design. A seção 9 do PRD — CondomiFacil traz só um resumo e aponta para cá. Se os dois divergirem, vale este documento.
- **Tokens.** Todo valor visual (cor, tamanho, espaço, raio, sombra, duração) tem um nome de token, como `color.text.primary` ou `space.4`. O código usa sempre o token, nunca o valor solto. A seção 17 mostra como os tokens ficam no código.
- **Rastreabilidade.** As regras citam os IDs do PRD (RF, RNF, SEG), das Regras de Negócio (RN) e das Histórias de Usuário (US). A seção 19 resume essa ligação.
- **Unidade de medida.** Os tamanhos estão em dp (pontos independentes de densidade), que é a unidade do React Native. Na web, 1 dp = 1 px CSS.
- **Mudanças.** Toda alteração de token ou componente entra na seção 18, com data e motivo.

## 2. Princípios de design

Os cinco princípios do produto (Visão de Produto — CondomiFacil) viram regras concretas de interface.

| Princípio do produto | O que significa na interface |
| --- | --- |
| Mais fácil que o WhatsApp | Tarefas comuns em até 3 toques a partir da tela inicial (RNF-15); registro de entrada na portaria em até 2 toques. Uma ação principal por tela. Nada de menus escondidos para tarefas frequentes |
| A portaria nunca para | Telas da portaria funcionam sem internet, mostram sempre o estado da conexão e da sincronização, e usam botões grandes. Nenhum erro bloqueia a tela inteira: o porteiro sempre tem um caminho alternativo ("autorizado por interfone") |
| Justiça antes de punição | Toda perda de pontos aparece com motivo, data e caminho de recurso. Botões de decisão só são liberados quando o processo foi cumprido, com o motivo do bloqueio escrito na tela |
| Privacidade por padrão | A interface mostra o mínimo necessário. Score individual, identidade de reclamante e situação financeira nunca aparecem fora dos casos permitidos (seção 15) |
| Configurável sem complicar | Telas de configuração mostram o valor padrão, a faixa permitida e o efeito da mudança. O app funciona no primeiro dia sem nenhuma configuração |

**Como contar toques (RNF-15).** Contam os toques em abas, botões de ação e botões de confirmação ("Novo", "Reservar", "Salvar", "Entrada"). Não contam escolher itens ou valores dentro do fluxo (área, dia, horário, opção de uma lista) nem digitar. Exemplos: reservar = Reservas → Reservar (2 toques mais as escolhas); cadastrar visitante = Visitantes → Novo → Salvar (3); registrar entrada na portaria = Entrada (1), com Desfazer opcional.

Mais três princípios só de design:

- **Clareza antes de estética.** O visual é moderno, limpo e com bastante respiro, mas nenhum enfeite pode atrapalhar a leitura ou o desempenho em celulares de entrada (RNF-02).
- **Estado sempre visível.** Todo item com ciclo de vida (reserva, visita, chamado, reclamação, cobrança, encomenda) mostra seu estado com texto e cor padronizados (seção 4.5).
- **Cor nunca sozinha.** Toda informação dada por cor também aparece em texto ou ícone.

## 3. Marca

### 3.1 Nome

O nome do produto é **CondomiFacil**: uma palavra, sem acento, com C e F maiúsculos. Nunca "Condomifacil", "Condomi Fácil" ou "CondomíFácil".

### 3.2 Cores da marca

| Cor | Hex | Papel |
| --- | --- | --- |
| Azul CondomiFacil | #0E359D | Cor principal: barra superior, áreas de marca, botão primário no tema claro, links |
| Branco | #FFFFFF | Fundo do tema claro e conteúdo sobre o azul |
| Coral | #FF606A | Cor de destaque: botão flutuante, selos de novidade, ícones de destaque, gráficos e botão primário no tema escuro |

Os demais tons (fundos escuros, textos, bordas) derivam do azul.

### 3.3 Assinatura visual

Enquanto não houver um logotipo desenhado por um designer, vale a assinatura provisória:

- **Logotipo (wordmark):** "CondomiFacil" em Inter Bold, numa cor só: branco sobre o azul ou azul (#0E359D) sobre o branco. Não aplicar coral no texto do logotipo, porque coral não tem contraste suficiente sobre o branco.
- **Ícone do app:** fundo azul #0E359D, letra "C" branca em Inter Bold, com um ponto coral #FF606A no canto superior direito. Cantos seguem a máscara de cada loja (Android adaptativo e iOS).
- **Área de proteção:** espaço livre em volta do logotipo igual à altura da letra "C".
- **Tamanho mínimo:** 24 dp de altura no app e 96 px de largura em documentos.

Quando o logotipo definitivo existir, ele substitui esta seção, e os tokens de cor continuam valendo.

## 4. Cores

### 4.1 Paleta base

A paleta base tem os valores brutos. As telas nunca usam a paleta base direto: usam os tokens semânticos (4.2).

| Grupo | Tons |
| --- | --- |
| Azul | `blue.950` #0B1A44 · `blue.925` #081B52 · `blue.900` #0E2766 · `blue.850` #0A2878 · `blue.800` #16307A · `blue.750` #133080 · `blue.700` #0E359D · `blue.300` #8FA8F0 · `blue.100` #E7ECFA |
| Neutros azulados | `gray.700` #5A6785 · `gray.500` #74809E · `gray.450` #7D8BB5 · `gray.400` #8A94AD · `gray.300` #B8C4E6 · `gray.200` #DCE2F0 · `gray.150` #E3E8F3 · `gray.100` #E9EDF5 · `gray.50` #F3F6FC · `white` #FFFFFF |
| Coral | `coral.700` #C8323F · `coral.500` #FF606A · `coral.400` #FF7A82 · `coral.100` #FFE9EB · `coral.950` #3A1530 |
| Verde | `green.800` #1F6B28 · `green.700` #2E7D32 · `green.400` #66BB6A · `green.100` #E8F5E9 · `green.950` #12391F |
| Âmbar | `amber.800` #8F5600 · `amber.300` #FFB74D · `amber.100` #FFF4E0 · `amber.950` #3A2A0B |
| Vermelho | `red.700` #C62828 · `red.300` #FF8A8A · `red.100` #FDECEC · `red.950` #3D1420 |
| Azul escuro auxiliar | `navy.600` #6F84BD · `navy.700` #1C3A8A · `navy.750` #1F3A85 |

### 4.2 Tokens semânticos

Cada token tem um valor no tema claro e outro no tema escuro. O contraste foi calculado pela fórmula do WCAG 2.2 contra o fundo onde o token é usado.

**Fundos e superfícies**

| Token | Uso | Claro | Escuro |
| --- | --- | --- | --- |
| `color.bg` | Fundo das telas | #FFFFFF | #081B52 |
| `color.surface` | Cartões, linhas de lista, campos | #F3F6FC | #0E2766 |
| `color.surface.raised` | Diálogos, folhas inferiores, menus | #FFFFFF com sombra | #133080 |
| `color.brand` | Barra superior e áreas de marca | #0E359D | #0E359D |
| `color.scrim` | Fundo escurecido atrás de diálogos | #081B52 a 50% | #000000 a 60% |

**Texto e ícones**

| Token | Uso | Claro | Contraste | Escuro | Contraste |
| --- | --- | --- | --- | --- | --- |
| `color.text.primary` | Texto principal e ícones principais | #0B1A44 | 16,9:1 | #FFFFFF | 16,3:1 |
| `color.text.secondary` | Texto de apoio, legendas, metadados | #5A6785 | 5,7:1 (5,2:1 na superfície) | #B8C4E6 | 9,4:1 (8,1:1 na superfície) |
| `color.text.disabled` | Texto de item desabilitado | #8A94AD | Isento (WCAG 1.4.3) | #7D8BB5 | Isento |
| `color.text.onBrand` | Texto e ícones sobre a barra azul | #FFFFFF | 10,4:1 | #FFFFFF | 10,4:1 |
| `color.link` | Links e ações de texto | #0E359D | 10,4:1 | #8FA8F0 | 7,0:1 |
| `color.accent.fg` | Texto e ícones de destaque em coral | #C8323F | 5,3:1 | #FF606A | 5,5:1 (4,8:1 na superfície) |

**Ações**

| Token | Uso | Claro | Escuro |
| --- | --- | --- | --- |
| `color.action.primary` | Fundo do botão primário | #0E359D | #FF606A |
| `color.action.primary.pressed` | Botão primário pressionado | #0A2878 | #FF7A82 |
| `color.action.onPrimary` | Texto do botão primário | #FFFFFF (10,4:1) | #081B52 (5,5:1) |
| `color.action.secondary` | Contorno e texto do botão secundário | #0E359D | #8FA8F0 |
| `color.action.danger` | Fundo do botão destrutivo | #C62828 | #FF8A8A |
| `color.action.onDanger` | Texto do botão destrutivo | #FFFFFF (5,6:1) | #081B52 (7,2:1) |
| `color.action.disabled` | Fundo de botão desabilitado | #E3E8F3 | #1C3A8A |
| `color.fab` | Botão flutuante | #FF606A | #FF606A |
| `color.onFab` | Ícone do botão flutuante | #081B52 (5,5:1) | #081B52 (5,5:1) |

**Bordas e foco**

| Token | Uso | Claro | Escuro |
| --- | --- | --- | --- |
| `color.border.control` | Contorno de campos, caixas de seleção e botão secundário | #74809E (3,9:1) | #6F84BD (4,4:1; 3,8:1 na superfície) |
| `color.border.divider` | Divisórias e contornos decorativos | #DCE2F0 | #1F3A85 |
| `color.focus` | Anel de foco (teclado e leitor de tela) | #0E359D (10,4:1) | #8FA8F0 (7,0:1) |

**Por que o botão primário muda de cor no tema escuro.** O azul da marca sobre o fundo escuro tem só 1,6:1 de contraste, então o botão desapareceria. No tema escuro, o coral assume o papel de cor de ação, com texto azul-escuro.

### 4.3 Regras do coral

O coral é a cor de destaque, e não uma cor de status. Ele tem regras próprias porque, sobre o branco, tem só 2,9:1 de contraste: abaixo do mínimo de 4,5:1 para texto e de 3:1 para ícones e componentes (WCAG 1.4.3 e 1.4.11).

1. **Tema claro, texto e ícones:** use `color.accent.fg` (#C8323F, 5,3:1), nunca o #FF606A.
2. **Tema claro, preenchimentos:** o #FF606A pode ser usado como fundo (botão flutuante, selo, barra de gráfico) quando o conteúdo por cima for azul-escuro #081B52 (5,5:1), ou quando o elemento tiver contorno #C8323F de 1,5 dp.
3. **Tema escuro:** o #FF606A pode ser usado em texto, ícones e preenchimentos.
4. **Nunca para erro, perigo ou atraso.** Esses estados usam o vermelho de erro (`color.danger.fg`), sempre com ícone e texto. Coral e vermelho nunca aparecem lado a lado com significados diferentes.
5. **Pouco coral por tela.** No máximo um elemento coral de destaque por tela, além dos gráficos. Se tudo é destaque, nada é destaque.

### 4.4 Cores de status

Seis tons cobrem todos os estados do produto. Cada tom tem três tokens, no formato `color.<tom>.fg` (texto e ícones sobre o fundo da tela), `color.<tom>.container` (fundo do selo ou da faixa) e `color.<tom>.onContainer` (texto sobre esse fundo). Exemplo: `color.warning.container`.

| Tom | Quando usar | `fg` claro / escuro | `container` claro / escuro | `onContainer` claro / escuro |
| --- | --- | --- | --- | --- |
| `neutral` | Estados finais sem julgamento (encerrado, cancelado, saiu) | #5A6785 / #B8C4E6 | #E9EDF5 / #1C3A8A | #5A6785 (4,8:1) / #B8C4E6 (6,0:1) |
| `info` | Em andamento, aguardando terceiros, informação | #0E359D / #8FA8F0 | #E7ECFA / #16307A | #0E359D (8,8:1) / #FFFFFF (12,1:1) |
| `success` | Concluído, confirmado, pago | #2E7D32 / #66BB6A | #E8F5E9 / #12391F | #1F6B28 (5,9:1) / #66BB6A (5,5:1) |
| `warning` | Exige atenção ou ação em breve; sem internet; prazo próximo | #8F5600 / #FFB74D | #FFF4E0 / #3A2A0B | #8F5600 (5,5:1) / #FFB74D (8,0:1) |
| `danger` | Erro, bloqueio, atraso, perda de pontos | #C62828 / #FF8A8A | #FDECEC / #3D1420 | #C62828 (4,9:1) / #FF8A8A (7,0:1) |
| `accent` | Novidade, destaque positivo (não é status) | #C8323F / #FF606A | #FFE9EB / #3A1530 | #0B1A44 (14,5:1) / #FF606A (5,4:1) |

Cada tom tem um ícone padrão, que acompanha a cor sempre que o estado precisa chamar atenção:

| Tom | Ícone (Lucide) |
| --- | --- |
| `info` | `info` ou `clock` (aguardando) |
| `success` | `circle-check` |
| `warning` | `triangle-alert` |
| `danger` | `circle-x` ou `ban` (bloqueio) |
| `neutral` | sem ícone ou `circle-minus` |

### 4.5 Estados de cada módulo

Todo estado aparece num selo (componente 10.8) com o texto exato da tabela e o tom indicado. Os nomes dos estados vêm das Regras de Negócio.

**Visitas (RN 8.3)**

| Estado | Tom |
| --- | --- |
| Esperado | `info` |
| Autorizado por interfone | `success` |
| Entrou | `success` |
| Saiu | `neutral` |
| Saída não registrada | `warning` |
| Cancelado | `neutral` |
| Não compareceu | `neutral` |
| Na lista de bloqueio (alerta, não estado) | `danger` |
| Fora do horário cadastrado (alerta, não estado) | `warning` |

**Encomendas (RN 9.1)**

| Estado | Tom |
| --- | --- |
| Recebida | `info` |
| Prazo vencido | `warning` |
| Retirada | `success` |
| Devolvida | `neutral` |

**Entregas esperadas (RN 9.1)**

| Estado | Tom |
| --- | --- |
| Esperada | `info` |
| Chegou | `success` |
| Não chegou | `warning` |
| Cancelada | `neutral` |
| Encerrada | `neutral` |
| Só aviso (marcação de origem iFood/entregador, não estado) | `neutral`, ícone `info` |

**Chamados (RN 9.2)**

| Estado | Tom |
| --- | --- |
| Aberto | `info` |
| Em atendimento | `info` |
| Orçamento | `info` |
| Agendado | `info` |
| Concluído | `success` |
| Reaberto | `warning` |
| Fora do prazo (marcação extra, para o síndico) | `danger` |
| Avaliação pendente (marcação extra, em chamado concluído, para quem abriu) | `warning`, ícone `triangle-alert` |
| Avaliado (marcação extra, em chamado concluído) | `neutral` |

Avaliação pendente e Avaliado não são estados do chamado (RN 9.2): são marcações extras de um chamado concluído, empilhadas sob o selo "Concluído".

**Urgência do chamado (RN-CH-09 a RN-CH-11)**

Não é estado do chamado: é um selo à parte (10.8.1), que vem junto do selo de estado. Usa os tons já existentes, sem token novo: alta em `danger` (vermelho), média em `warning` (amarelo) e leve em `success` (verde). O texto é sempre "Urgência alta", "Urgência média" ou "Urgência leve", e cada nível tem ícone próprio para não depender só da cor.

| Urgência | Tom | Ícone (Lucide) |
| --- | --- | --- |
| Alta | `danger` | `chevrons-up` |
| Média | `warning` | `equal` |
| Leve | `success` | `chevron-down` |

**Prazo da reclamação (RN-RC-17 a RN-RC-19)**

Não é estado da reclamação: é um selo à parte (10.8.2), junto do selo de estado. Usa os tons existentes, sem token novo, e cada nível tem ícone e texto próprios para não depender só da cor.

| Situação do prazo | Tom | Ícone (Lucide) | Texto |
| --- | --- | --- | --- |
| No prazo | `success` | `circle-check` | "No prazo · 9 dias" |
| Se esgotando (limiar ou menos, até o vencimento) | `warning` | `clock` | "Prazo se esgotando · 3 dias", "Vence amanhã" ou "Vence hoje" |
| Esgotado | `danger` | `circle-x` | "Prazo esgotado há 2 dias" |

**Cobranças (RN 12.2)**

| Estado | Tom |
| --- | --- |
| Emitida | `info` |
| Em atraso | `danger` |
| Paga | `success` |
| Paga com atraso | `success` |
| Em acordo (versão 2) | `warning` |
| Cancelada | `neutral` |

**Reservas (RN 7.4)**

| Estado | Tom |
| --- | --- |
| Aguardando pagamento | `warning` |
| Confirmada | `success` |
| Expirada | `neutral` |
| Cancelada | `neutral` |
| Cancelada com reembolso | `neutral` |
| Cancelada sem reembolso | `neutral` |
| Cancelada pelo condomínio | `info` |
| Em andamento | `info` |
| Cumprida | `neutral` |
| Não comparecimento | `warning` |

**Reclamações (RN 5.5)**

| Estado | Tom |
| --- | --- |
| Aberta | `info` |
| Em conversa com o alvo | `info` |
| Pendente | `warning` |
| Validada | `danger` para o alvo; `success` para o reclamante; `neutral` para o julgador |
| Negada | `danger` para o reclamante; `success` para o alvo; `neutral` para o julgador |
| Em recurso | `info` |
| Recurso aceito | `success` para quem recorreu; `neutral` para os demais |
| Encerrada | `neutral` |

Negada sem penalidade aparece como "Encerrada" (RN 5.5).

**Unidade e contrato de locação (RN-CD-20 a RN-CD-24)**

| Estado | Tom |
| --- | --- |
| Ocupada pelo proprietário | `neutral` |
| Alugada | `info` |
| Contrato vence em N dias | `warning` (a partir de 30 dias do fim) |
| Contrato vencido | `danger` (durante os 7 dias de carência) |
| Desocupada | `neutral` |

**Finanças do condomínio (RN 12.4)**

| Estado | Tom |
| --- | --- |
| Mês aberto | `info` |
| Fecha em N dias (mês terminado, a partir de 3 dias do fechamento automático) | `warning` |
| Mês fechado | `neutral`, com ícone `lock` |
| Estornado | `warning`, com ícone `undo-2` |
| Estorno | `neutral` |
| Automático, Recorrente (marcações, não estados) | `neutral`, com ícones `zap` e `repeat` |

O tipo da cobrança ("Ordinária" ou "Extraordinária") não é um estado: aparece como texto `type.label.sm` em `color.text.secondary` ao lado do vencimento, nunca como selo.

Os estados de reserva (RN 7.4) e de reclamação (RN 5.5) estão nas Regras de Negócio, com os mesmos nomes desta seção; os fluxos entre eles estão no User Flows — CondomiFacil (`02-user-flows.md`). Para qualquer estado novo, vale a regra geral: em andamento → `info`; exige ação → `warning`; erro, bloqueio ou perda → `danger`; concluído com sucesso → `success`; finalizado sem julgamento → `neutral`.

### 4.6 Calendário de reservas

O calendário (RF-RE-01, RF-RE-06, RN-RE-05, RN-RE-08) tem quatro estados de horário. Cada um usa cor, texto e, quando indisponível, ícone, para nunca depender só da cor.

| Estado | Fundo claro / escuro | Texto | Ícone | Toque |
| --- | --- | --- | --- | --- |
| Livre | #E8F5E9 / #12391F | "Livre" em `success.onContainer` | — | Abre a reserva |
| Ocupado | #E9EDF5 / #1C3A8A | "Ocupado" em `color.neutral.onContainer`, sem nome nem unidade | — | Desabilitado |
| Indisponível | Transparente, com hachura diagonal em `color.border.divider` | "Indisponível" em `color.text.secondary` | `calendar-x` | Mostra o motivo: antecedência ou limite mensal. Unidade em atraso: o motivo só aparece para quem pode ver a situação financeira (RN-FI-10); os demais veem "Reservas indisponíveis para esta unidade no momento" |
| Bloqueado pelo score | Transparente, com hachura | "Indisponível" em `color.text.secondary` | `lock` | Mostra o aviso fixo do topo |

Quando o score bloqueia as áreas gratuitas, um aviso `warning` fixo no topo do calendário explica o motivo e quando o acesso volta: "Seu score está em 58. Reservas gratuitas voltam quando ele passar de 60. Áreas pagas continuam liberadas." O aviso só aparece para a própria pessoa (RN-SC-10).

### 4.7 Gráficos

- **Série principal:** azul (#0E359D no claro, #8FA8F0 no escuro). **Série de comparação:** coral (#FF606A, com contorno #C8323F no claro).
- No máximo duas séries coloridas por gráfico. Outras séries usam `gray.400` e `gray.700`.
- Todo gráfico tem título, legenda em texto e os valores principais escritos. Para leitores de tela, o gráfico tem um resumo em texto (ex.: "Nota do setor de limpeza: 3,7 de 5").
- Notas de 1 a 5 estrelas e score usam os componentes próprios (10.17 e 10.18), não gráficos.
- **Finanças (11.15):** barras horizontais de categorias usam só a série principal, da maior para a menor; a evolução mensal usa barras agrupadas, receitas na série principal e despesas na de comparação. Toda variação sobre o período anterior vem em texto com ícone (`trending-up`, `trending-down`, `minus`), sem verde nem vermelho, porque receita ou despesa maior não é boa nem ruim em si. Todo gráfico de finanças tem o resumo em texto e o botão "Ver como tabela" com os mesmos valores.

## 5. Tipografia

### 5.1 Fonte

A fonte do produto é a **Inter**, nos pesos Regular (400), Medium (500), SemiBold (600) e Bold (700), carregada com `expo-font` em arquivos estáticos (sem fonte variável). A Inter tem ótima leitura em telas pequenas, suporta todos os acentos do português e tem algarismos tabulares. Os quatro pesos somam cerca de 1 MB, dentro do limite de 30 MB do app (RNF-04).

Se a fonte não carregar, o app usa a fonte do sistema (Roboto no Android, San Francisco no iOS), sem bloquear a tela.

### 5.2 Escala

| Token | Tamanho / altura da linha | Peso | Uso |
| --- | --- | --- | --- |
| `type.display` | 48 / 56 | Bold | Número do score |
| `type.title.lg` | 28 / 36 | Bold | Título de tela grande (início, onboarding) |
| `type.title.md` | 22 / 28 | SemiBold | Título de tela e de diálogo |
| `type.title.sm` | 18 / 24 | SemiBold | Título de seção e de cartão |
| `type.body.lg` | 18 / 26 | Regular | Texto principal na portaria |
| `type.body` | 16 / 24 | Regular | Texto principal padrão |
| `type.body.sm` | 14 / 20 | Regular | Texto de apoio, linhas de tabela na web |
| `type.label` | 16 / 24 | SemiBold | Botões e abas |
| `type.label.sm` | 14 / 20 | SemiBold | Selos, rótulos de campo, botões pequenos |
| `type.caption` | 12 / 16 | Medium | Metadados (hora, autor). Nunca para informação essencial |

### 5.3 Regras

- **Tamanho mínimo:** 12 dp, só em metadados. Texto que a pessoa precisa ler para agir tem pelo menos 14 dp. Na portaria, o texto principal tem 18 dp.
- **Fonte ampliada:** o app respeita o tamanho de fonte do sistema até 200% (WCAG 1.4.4). Os layouts quebram linha em vez de cortar texto. Só rótulos da barra de navegação inferior podem limitar a ampliação a 150% (`maxFontSizeMultiplier={1.5}`), porque o espaço é fixo.
- **Algarismos tabulares** (`fontVariant: ['tabular-nums']`) em valores, horários, contagens, tabelas e no score, para os números não "dançarem".
- **Capitalização:** só a primeira letra maiúscula em títulos, botões e rótulos ("Registrar entrada", não "Registrar Entrada"). Nada em caixa-alta, exceto a faixa "MODO TREINAMENTO".
- **Comprimento da linha:** até cerca de 70 caracteres em textos longos ("Como funciona", termos). Na web, blocos de texto têm largura máxima de 640 px.
- **Alinhamento:** à esquerda. Centralizado só em estados vazios, onboarding e no número do score.

## 6. Espaçamento, grade e layout

### 6.1 Espaçamento

A grade base é de 4 dp. Todo espaço usa um token da escala.

| Token | Valor | Uso típico |
| --- | --- | --- |
| `space.0` | 0 | — |
| `space.1` | 4 | Entre ícone e texto pequeno |
| `space.2` | 8 | Entre ícone e texto; entre selos |
| `space.3` | 12 | Padding interno de selos e campos compactos |
| `space.4` | 16 | Margem lateral da tela no celular; padding de cartões; espaço entre itens |
| `space.5` | 20 | Espaço entre grupos de campos |
| `space.6` | 24 | Espaço entre seções; margem lateral no tablet |
| `space.8` | 32 | Espaço antes de títulos de seção |
| `space.10` | 40 | Margens da web |
| `space.12` | 48 | Respiro em estados vazios |
| `space.16` | 64 | Topo de telas de onboarding |

### 6.2 Áreas de toque

- **Mínimo:** 48 × 48 dp para todo elemento tocável (atende o mínimo de 44 pt do iOS, os 48 dp do Android e o WCAG 2.5.8). Se o desenho for menor, use `hitSlop` para completar a área.
- **Portaria:** 56 dp de altura para botões de ação (entrada, saída, registrar encomenda).
- **Espaço entre alvos:** pelo menos 8 dp entre dois elementos tocáveis.

### 6.3 Pontos de quebra (versão web e tablets)

| Faixa | Largura | Layout |
| --- | --- | --- |
| Compacta | até 599 | Layout do celular: uma coluna, navegação inferior, margem de 16 |
| Média | 600 a 1023 | Duas colunas (lista + detalhe) quando fizer sentido, navegação lateral recolhida, margem de 24 |
| Expandida | 1024 ou mais | Navegação lateral fixa de 256, conteúdo em tabelas (RF-AC-06), margem de 40, largura máxima do conteúdo de 1280 |

### 6.4 Regras de layout

- Respeitar as áreas seguras do aparelho (entalhe, barra de gestos) com `SafeAreaView`.
- A ação principal da tela fica no rodapé fixo (botão de largura total) ou no botão flutuante, ao alcance do polegar.
- Listas longas usam `FlatList` com carregamento por página, nunca `ScrollView` com tudo.
- Formulários na web têm largura máxima de 640 e ficam alinhados à esquerda do conteúdo.

## 7. Forma e elevação

### 7.1 Raios

| Token | Valor | Uso |
| --- | --- | --- |
| `radius.sm` | 8 | Campos, células do calendário, chips |
| `radius.md` | 12 | Botões, cartões, faixas de aviso |
| `radius.lg` | 20 | Folhas inferiores (cantos de cima), diálogos |
| `radius.fab` | 16 | Botão flutuante |
| `radius.full` | 999 | Selos, avatares, interruptores |

### 7.2 Elevação

No tema claro, a elevação usa sombra. No tema escuro, sombras quase não aparecem, então a elevação usa superfícies mais claras.

| Nível | Uso | Claro | Escuro |
| --- | --- | --- | --- |
| 0 | Conteúdo da tela | Sem sombra | `color.bg` |
| 1 | Cartões | Sem sombra, fundo `color.surface` | `color.surface` |
| 2 | Barras fixas (rodapé com ação, barra de busca) | Sombra 0 2 8 #0B1A44 a 8% | `color.surface` com divisória superior |
| 3 | Botão flutuante, folhas inferiores, diálogos, menus | Sombra 0 8 24 #0B1A44 a 16% | `color.surface.raised` |

Cartões não usam sombra, só a cor de superfície. Isso deixa o visual mais limpo e mais leve em celulares fracos.

## 8. Iconografia

### 8.1 Biblioteca

O produto usa os ícones **Lucide** (`lucide-react-native`), de código aberto, com traço uniforme e boa cobertura. Não misturar com outras bibliotecas. Exceção: o logotipo do Pix segue o manual de marca do Banco Central, e as bandeiras de cartão seguem os manuais de cada bandeira.

### 8.2 Regras

- **Traço:** 2 dp. **Tamanhos:** 16 (dentro de selos e textos pequenos), 20 (dentro de botões e campos), 24 (padrão: navegação, listas, barras), 32 (estados vazios e portaria).
- **Cor:** a mesma do texto ao lado. Ícone sozinho, sem texto, só nas barras e em ações universais (voltar, fechar, buscar, menu), sempre com `accessibilityLabel`.
- **Ícone tocável:** área de toque de 48 × 48 dp, mesmo que o ícone tenha 24.
- **Um conceito, um ícone.** A tabela abaixo é o mapa oficial. Ícones novos entram nela antes de serem usados.

### 8.3 Mapa de ícones

| Conceito | Ícone Lucide |
| --- | --- |
| Início | `house` |
| Reservas e calendário | `calendar-days` |
| Horário indisponível | `calendar-x` |
| Visitantes | `users` |
| Registrar entrada / saída | `log-in` / `log-out` |
| Autorizado por interfone | `phone` |
| Lista de bloqueio | `ban` |
| Fora do horário cadastrado | `clock` |
| Encomendas | `package` |
| Chamado de limpeza | `spray-can` |
| Chamado de manutenção | `wrench` |
| Vistoria de área | `clipboard-check` |
| Reclamações | `message-square-warning` |
| Julgamento | `scale` |
| Recurso | `undo-2` |
| Score | `gauge` |
| Transparência | `eye` |
| Pesquisa mensal | `star` |
| Comunicados | `megaphone` |
| Conversa / resposta | `message-circle` |
| Reuniões e votações | `vote` |
| Ata e documentos | `file-text` |
| Cobranças | `receipt` |
| Boleto | `barcode` |
| Cartão de crédito | `credit-card` |
| Comprovante | `file-check` |
| Finanças do condomínio | `wallet` |
| Lançamento recorrente | `repeat` |
| Receita automática | `zap` |
| Estorno | `undo-2` |
| Exportar | `download` |
| Notificações | `bell` |
| Menu | `menu` |
| Perfil | `circle-user` |
| Configurações | `settings` |
| Gestão (síndico) | `layout-dashboard` |
| Sem internet | `wifi-off` |
| Sincronizando | `refresh-cw` |
| Pendente de envio | `cloud-upload` |
| Modo treinamento | `graduation-cap` |
| Foto | `camera` |
| Bloqueado / requer condição | `lock` |
| Como funciona / ajuda | `circle-help` |
| Adicionar | `plus` |
| Buscar | `search` |
| Filtrar | `sliders-horizontal` |
| Trocar unidade | `chevrons-up-down` |
| Novidade ou dica | `sparkles` |
| Ações universais | `arrow-left` (voltar), `x` (fechar), `check` (marcado), `ellipsis` (mais ações), `clock` (aguardando), `circle-minus` (neutro), `circle-check`, `triangle-alert`, `circle-x`, `info` (tons de status) |

## 9. Movimento

O PRD pede poucas animações, para rodar bem em celulares fracos. O movimento serve só para dar retorno e mostrar de onde as coisas vêm.

| Token | Duração | Uso |
| --- | --- | --- |
| `motion.fast` | 100 ms | Retorno de toque (pressionado), troca de interruptor |
| `motion.base` | 200 ms | Aparecer e sumir de selos, avisos e mensagens rápidas |
| `motion.slow` | 300 ms | Folhas inferiores, diálogos, transição entre telas |

- **Curva:** `cubic-bezier(0.2, 0, 0, 1)` para entradas e `cubic-bezier(0.3, 0, 1, 1)` para saídas.
- **Só `opacity` e `transform`**, com o driver nativo (`useNativeDriver: true`). Nada de animar altura, largura ou cor de fundo.
- **Movimento reduzido:** quando o sistema pede menos movimento (`AccessibilityInfo.isReduceMotionEnabled`), as transições viram troca direta ou esmaecimento de 100 ms.
- **Sem animação em repetição**, exceto o indicador de carregamento e o ícone de sincronização enquanto sincroniza.
- **Retorno tátil (vibração leve)** ao registrar entrada, saída e encomenda na portaria, e ao confirmar pagamento. Nunca em erros repetidos.

## 10. Componentes

Cada componente lista: para que serve, variantes, estados e regras de acessibilidade. Todos usam só tokens. Todo componente tocável tem os estados padrão: normal, pressionado, foco (anel `color.focus` de 2 dp com afastamento de 2 dp), desabilitado e, quando fizer sentido, carregando.

### 10.1 Botão

| Variante | Visual | Quando usar |
| --- | --- | --- |
| Primário | Fundo `color.action.primary`, texto `color.action.onPrimary` | A ação principal da tela. **No máximo um por tela** |
| Secundário | Contorno de 1,5 dp e texto em `color.action.secondary`, fundo transparente | Ações alternativas ("Cancelar reserva", "Pular") |
| Texto | Só texto em `color.link`, sem contorno | Ações de baixa ênfase ("Ver histórico", "Reenviar código") |
| Destrutivo | Fundo `color.action.danger`, texto `color.action.onDanger` | Ações que apagam ou punem: cancelar cobrança, validar reclamação, negar com penalidade. Sempre pede confirmação |

| Tamanho | Altura | Texto | Uso |
| --- | --- | --- | --- |
| Grande | 56 | `type.label` | Portaria e botão de rodapé de largura total |
| Médio | 48 | `type.label` | Padrão |
| Pequeno | 40 (área de toque 48 com `hitSlop`) | `type.label.sm` | Dentro de cartões e linhas de tabela na web |

**Regras**

- Raio `radius.md`, padding horizontal de 20, ícone opcional à esquerda (20 dp) com 8 de espaço.
- O texto é um verbo no infinitivo que diz o que acontece: "Reservar", "Registrar entrada", "Pagar com Pix". Nunca "OK", "Sim" ou "Enviar" sem complemento.
- **Carregando:** o texto continua visível, um indicador aparece no lugar do ícone e o botão não aceita novo toque (evita pagamento ou registro em dobro).
- **Desabilitado:** fundo `color.action.disabled` e texto `color.text.disabled`. Um botão desabilitado sempre vem com uma frase logo acima ou abaixo explicando por quê e o que fazer. Exemplo da reclamação (US-RS-02): "Registre a conversa com o morador antes de decidir."
- Pressionado: fundo `color.action.primary.pressed` no primário; fundo `color.surface` nos demais.

### 10.2 Botão flutuante

- Círculo de 56 dp com raio `radius.fab`, fundo `color.fab`, ícone de 24 dp em `color.onFab` e elevação 3.
- Um por tela, para a criação mais comum da tela: "Novo visitante", "Nova reserva", "Abrir chamado".
- Pode ter rótulo ao lado (versão estendida) na primeira visita à tela, recolhendo ao rolar.
- Fica 16 dp acima da navegação inferior e 16 dp da borda direita. Não cobre a última linha da lista: a lista ganha 88 dp de espaço no fim.
- `accessibilityLabel` com a ação completa ("Cadastrar novo visitante").

### 10.3 Campo de texto

- Altura de 56, fundo `color.surface`, contorno de 1 dp em `color.border.control` e raio `radius.sm`.
- Rótulo sempre visível acima do campo (`type.label.sm`), nunca só como texto de exemplo dentro do campo. Campos opcionais terminam com "(opcional)". Campos obrigatórios não levam asterisco: o padrão é ser obrigatório.
- Texto de ajuda abaixo, em `color.text.secondary`. Em configurações, a ajuda mostra o padrão e a faixa: "Padrão: 12 horas. Permitido: de 0 a 168."
- **Foco:** contorno de 2 dp em `color.focus`.
- **Erro:** contorno de 2 dp em `color.danger.fg`, ícone `circle-x` e mensagem abaixo dizendo o que fazer ("Informe um valor entre 0% e 2%. A lei não permite multa maior que 2%."). A mensagem é anunciada ao leitor de tela.
- A validação acontece ao sair do campo e ao enviar, nunca a cada letra.
- Teclado adequado ao tipo: numérico para valores e códigos, e-mail para e-mail. Campos de dinheiro formatam em "R$ 1.234,56" enquanto se digita.

### 10.4 Código de verificação

Usado no primeiro acesso e na recuperação de senha (RF-AC-01, RF-AC-03).

- Seis caixas de 48 × 56, algarismos tabulares em `type.title.md`.
- Por trás é um único campo, com preenchimento automático do código recebido (`textContentType="oneTimeCode"` e `autoComplete="sms-otp"` quando disponível) e colar funcionando.
- Mostra a validade ("Código válido por 15 minutos") e as tentativas restantes depois de um erro ("Código incorreto. Restam 3 tentativas.").

### 10.5 Seleção (lista, opção única e múltipla)

- **Lista suspensa:** abre uma folha inferior (10.12) com busca quando houver mais de 8 opções. Nunca o seletor nativo pequeno.
- **Opção única:** botões de opção com área de toque de 48 dp na linha inteira.
- **Múltipla:** caixas de seleção com contorno `color.border.control`. Marcada: fundo `color.action.primary` e ícone `check` em `color.action.onPrimary`.
- **Chips de filtro:** altura 40 (área 48), raio `radius.full`. Selecionado: fundo `color.info.container`, texto `color.info.onContainer` e ícone `check`.
- **Dias da semana** (visita recorrente, RF-VI-02): sete chips com a abreviação ("Seg", "Ter"...), leitores de tela ouvem o nome completo.

### 10.6 Interruptor

- Para ligar ou desligar algo com efeito imediato (notificações, módulo de cobrança, bloqueio de reserva por atraso). Para escolhas que só valem ao salvar, use caixa de seleção.
- O rótulo descreve o efeito quando ligado ("Bloquear reservas de unidades em atraso"). Linha inteira tocável.

### 10.7 Cartão

- Fundo `color.surface`, raio `radius.md`, padding `space.4`, sem sombra.
- Estrutura: título (`type.title.sm`), selo de estado no canto superior direito, informações em `type.body.sm`, ações no rodapé do cartão.
- Cartão inteiro tocável abre o detalhe. Ações dentro do cartão (ex.: "Concluir" da limpeza) têm área própria de 48 dp e não abrem o detalhe.
- Para leitor de tela, o cartão é lido como um item só: "Chamado de limpeza, piscina, aberto há 3 horas, botão concluir".

### 10.8 Selo de estado

- Altura 24 (não tocável), raio `radius.full`, padding horizontal 8, texto `type.label.sm`, ícone de 16 opcional.
- Fundo `container` e texto `onContainer` do tom (4.4). O texto é sempre o nome exato do estado (4.5).
- Para leitores de tela: "Estado: aguardando pagamento".

### 10.8.1 Selo de urgência

- Mesma anatomia do selo de estado (10.8), nos tons da tabela de urgência em 4.5. O texto é "Urgência alta", "Urgência média" ou "Urgência leve", com o ícone do nível.
- Aparece em todo cartão, linha de lista e detalhe de chamado, empilhado sob o selo de estado e antes do selo "Fora do prazo", para morador, síndico, subsíndico e funcionários.
- No formulário de abertura, os três níveis são uma seleção de opção única (10.5), sem valor pré-selecionado; cada opção mostra o selo e um texto de ajuda com exemplo:
  - Alta: "Risco para pessoas ou dano que cresce rápido. Ex.: líquido no chão do hall (risco de queda), vazamento, portão que não fecha."
  - Média: "Atrapalha o uso, mas sem risco imediato. Ex.: lâmpada queimada, torneira pingando, lixo acumulado."
  - Leve: "Pode esperar alguns dias. Ex.: folhas na piscina, parafuso frouxo, pintura desgastada."
  - Texto de apoio acima das opções: "Quão grave é o problema? Isso ajuda a equipe a decidir o que atender primeiro. Se tiver dúvida, escolha a mais alta."
  - Erro: "Escolha a urgência do chamado."
- Ajuste pelo síndico: no detalhe, a linha "Urgência: [nível]" abre uma folha (10.12) com os três níveis; a mudança aparece como "Urgência alterada de média para alta por [nome] · [quando]" (RN-CH-11). Para os demais perfis, o selo não é tocável.
- Para leitores de tela: "Urgência: alta".

### 10.8.2 Selo de prazo

- Mesma anatomia do selo de estado (10.8), nos tons da tabela "Prazo da reclamação" em 4.5. O texto traz o tempo: "No prazo · 9 dias", "Prazo se esgotando · 3 dias", "Vence amanhã", "Vence hoje" ou "Prazo esgotado há 2 dias" (singular com 1 dia).
- Calculado pelo prazo de decisão (RN-RC-06) e pelo limiar de 25% do prazo, arredondado para cima, mínimo de 1 dia (RN-RC-18). O dia do vencimento é amarelo ("Vence hoje"); vermelho só no dia seguinte.
- Aparece em linha de lista e no detalhe das reclamações aguardando decisão (Aberta e Em conversa com o alvo), empilhado sob o selo de estado, para quem reclamou (em "Minhas reclamações"), síndico, subsíndico, administradora e conselho fiscal (painel do julgador). Não aparece em reclamação pendente nem decidida, nem para o alvo (RN-RC-19).
- No detalhe, uma linha de apoio dá a data: "Prazo de decisão até 20/11 · 15 dias desde a abertura".
- Não é tocável. Para leitores de tela: "Prazo de decisão: vence amanhã".
- Ordenação das listas de reclamação: sem mudança; o semáforo não reordena.

### 10.9 Linha de lista

- Altura mínima de 64 (72 com duas linhas de apoio), padding horizontal 16.
- Ícone ou avatar à esquerda (40 dp), título e até duas linhas de apoio no meio, selo ou ação à direita.
- Divisória `color.border.divider` entre linhas, começando depois do ícone.
- **Ordem em listas de chamados (RN-CH-13):** abertos antes dos concluídos; dentro de cada grupo, urgência alta, média e leve; empate na urgência, o chamado mais antigo primeiro. Vale para cartões e linhas de morador, síndico, limpeza e manutenção. É ordem de exibição: o dado não muda. Chips de "Na fila" e "Concluídos" continuam separando os grupos onde existirem.

### 10.10 Faixa de aviso

Faixa de largura total, abaixo da barra superior, para avisos que valem para a tela inteira.

| Uso | Tom | Ícone | Texto padrão | Pode fechar? |
| --- | --- | --- | --- | --- |
| Sem internet (portaria e limpeza) | `warning` | `wifi-off` | "Sem internet. Lista salva às 14h32. 3 registros aguardando envio." | Não; some quando a conexão volta |
| Sincronizando | `info` | `refresh-cw` | "Enviando 3 registros…" | Não |
| Modo treinamento (RF-VI-12) | `info` com borda tracejada de 2 dp | `graduation-cap` | "MODO TREINAMENTO · Nada aqui é real" | Não; sai pelo botão "Sair do treinamento" |
| Termos atualizados (RN-CD-03) | `info` | `file-text` | "Os termos mudaram. Leia e aceite para continuar." | Não |
| Score bloqueando reservas | `warning` | `lock` | Ver 4.6 | Não |
| Novidade ou dica | `accent` | `sparkles` | Livre | Sim |

Regras: no máximo uma faixa por tela; se houver mais de uma condição, vale a de maior prioridade (sem internet > treinamento > termos > score > novidade). A faixa é anunciada ao leitor de tela quando aparece (`accessibilityLiveRegion="polite"`).

### 10.11 Mensagem rápida (snackbar)

- Aparece no rodapé, acima da navegação, por 5 segundos (10 s quando tem ação). Fundo `color.text.primary`, texto `color.bg`.
- Para confirmações de ações que deram certo e para **desfazer**. Ex.: "Entrada de Carlos Souza registrada · Desfazer".
- Nunca para erros que exigem ação; esses usam faixa, diálogo ou mensagem no campo.
- Uma por vez. Anunciada ao leitor de tela.

### 10.12 Folha inferior

- Sobe do rodapé, com raio `radius.lg` nos cantos de cima, puxador de 32 × 4 e fundo `color.surface.raised`.
- Para escolhas e formulários curtos (escolher unidade, filtrar, escolher forma de pagamento).
- Fecha arrastando para baixo, tocando no fundo escurecido ou no botão "Fechar" (que existe sempre, para quem não consegue arrastar).

### 10.13 Diálogo

- Centralizado, largura máxima de 400, raio `radius.lg`, fundo `color.surface.raised`, fundo escurecido `color.scrim`.
- Só para confirmar ações irreversíveis ou que custam dinheiro ou pontos. Título é uma pergunta ("Cancelar a reserva sem reembolso?"), o texto explica a consequência e os botões dizem as ações ("Cancelar sem reembolso" / "Manter reserva").
- O botão que confirma fica à direita (ou embaixo, no celular, em coluna). Em ação destrutiva, ele usa a variante destrutiva.
- **Diálogo bloqueante** (só fecha depois de uma ação): usado em dois casos, divergência de sincronização (RN-OF-04) e visitante da lista de bloqueio (RN-VI-05). Ver 11.1.
- O foco vai para o título ao abrir e volta para o elemento de origem ao fechar.

### 10.14 Barra superior

- Altura de 56 + área segura, fundo `color.brand` nos dois temas, título e ícones em `color.text.onBrand`.
- Esquerda: voltar (`arrow-left`) nas telas internas. Centro-esquerda: título da tela. Direita: até duas ações (ex.: `search`, `bell`).
- Na tela inicial, o título dá lugar ao **seletor de unidade** (10.16) e ao nome do condomínio.

### 10.15 Navegação

**Celular: navegação inferior** com 3 a 5 abas, ícone de 24 e rótulo sempre visível (`type.label.sm`), altura de 64 + área segura. Aba ativa: ícone e rótulo em `color.link` e indicador em pílula `color.info.container` atrás do ícone. A seção 12 define as abas de cada perfil.

**Web expandida: navegação lateral** de 256, fundo `color.surface`, itens de 48 com ícone e rótulo, item ativo com fundo `color.info.container`. Na faixa média, recolhe para 72 só com ícones e dica de texto.

### 10.16 Seletor de unidade

Para quem tem mais de uma unidade (RF-AC-04, RN-CD-05).

- Fica na barra superior da tela inicial: nome curto da unidade ("Bloco A · Apto 101") em `type.title.sm` e ícone `chevrons-up-down`.
- Toque abre uma folha inferior com as unidades, agrupadas por condomínio, com a ativa marcada.
- Ao trocar, a tela recarrega com os dados da nova unidade e uma mensagem rápida confirma: "Mostrando Bloco B · Apto 302".
- Quem tem uma unidade só vê o nome, sem ícone e sem toque.

### 10.17 Avaliação por estrelas

Usada na pesquisa mensal (RF-PE-01) e na avaliação do atendimento do chamado (RF-CH-08).

- Cinco estrelas de 32 dp, cada uma com área de toque de 48. Vazia: contorno `color.border.control`. Preenchida: `coral.500` com contorno `coral.700` no claro; `coral.500` no escuro.
- Texto ao lado diz a nota em palavras: 1 "Muito ruim", 2 "Ruim", 3 "Regular", 4 "Boa", 5 "Excelente".
- Botão de texto "Não conheço" ao lado, para pular (RN-PE-03); na avaliação do atendimento não há "Não conheço": quem não quer avaliar simplesmente não toca em "Avaliar o serviço".
- Leitura (média e avaliação já enviada): cinco estrelas só de exibição, com a média escrita ao lado ("4,3 de 5") e `aria-label` com o mesmo texto; a nota nunca depende só do preenchimento da estrela.
- Para leitores de tela, o componente é um ajustável (`accessibilityRole="adjustable"`): "Avaliação de João, 4 de 5 estrelas, boa".

### 10.18 Score

Usado em "Meu score" (RF-RS-11) e na "Transparência" (RF-RS-12).

- **Contexto visível:** morador vê "Seu score nesta unidade" com o nome da unidade ativa; saldo, histórico e recuperação pertencem ao vínculo pessoa/unidade. Trocar unidade não mistura históricos nem bloqueios. Novo vínculo começa em 100 (RN-SC-13). Funcionário e síndico profissional sem unidade veem "Seu score neste condomínio" (RN-SC-14).
- **Score público do síndico:** morador usa o vínculo da unidade de referência do mandato, identificado no cartão; profissional sem unidade usa o funcional do condomínio. As demais pontuações da mesma pessoa não são publicadas (RN-SC-02).

- Número em `type.display` com "de 100" ao lado em `type.body` e `color.text.secondary`.
- Barra horizontal de 0 a 100 abaixo: trilho `color.border.divider`, preenchimento `color.link`, e uma marca vertical no limite das reservas gratuitas (60) com o rótulo "Limite para reservas gratuitas".
- Com o score acima do limite, o tom é neutro (azul). Com o score no limite ou abaixo, o preenchimento passa para `color.warning.fg` e aparece a frase de bloqueio. O score nunca usa vermelho nem verde: ele é uma referência, não um julgamento da pessoa.
- Abaixo: "Próxima recuperação: +5 em 10/03/2027" e o histórico (linhas de lista com data, motivo e pontos). No histórico, ganhos usam `color.success.fg` e perdas `color.danger.fg`, sempre com o sinal escrito (`+5`, `−10`) e ícone de tendência; a regra de não usar vermelho nem verde vale para o número e a barra do score. Movimento de 0 pontos (início de novo vínculo em 100) usa tom neutro com sinal escrito (`0`) e ícone de início.
- Link fixo "Como o score funciona", para a página "Como funciona" (RF-AC-07).

### 10.19 Calendário

- Visão de mês para escolher o dia (dias com horário livre têm um ponto abaixo do número) e lista de horários do dia escolhido com os estados de 4.6.
- Células de dia com 48 × 48 no mínimo. Hoje tem contorno `color.focus`. Dia escolhido tem fundo `color.action.primary` e texto `color.action.onPrimary`.
- Navegação entre meses com botões "Mês anterior" e "Próximo mês", além do gesto de deslizar.

### 10.20 Envio de foto

Usado em chamados, vistorias, encomendas e reclamações.

- Botão secundário com ícone `camera` ("Adicionar foto") que oferece câmera ou galeria.
- A foto é comprimida no aparelho antes do envio (lado maior de 1600 px, JPEG com qualidade 0,7), conforme a seção 10 do PRD.
- Miniaturas de 72 × 72 com botão "Remover" de 48 dp. Envio sem internet fica na fila, com o ícone `cloud-upload`.
- **Fotos do serviço (conclusão de chamado, RN-CH-14):** o rótulo é "Fotos do serviço (opcional)", até 5 fotos, e a ausência de foto nunca desabilita "Concluir chamado". No detalhe do chamado concluído, as miniaturas ficam sob o título "Fotos do serviço"; tocar numa abre a foto em tela cheia com "Fechar" e contador ("2 de 3"). Sem fotos, o detalhe não mostra a seção.

### 10.21 Estados vazios, carregando e erro

- **Carregando:** blocos de esqueleto estáticos na cor `color.surface`, no formato do conteúdo, sem brilho animado. Indicador circular só em ações curtas.
- **Vazio:** ícone de 32 em `color.text.secondary`, uma frase do que aparece ali e, se houver, a ação para começar. Ex.: "Nenhum visitante esperado hoje." + "Cadastrar visitante".
- **Erro ao carregar:** ícone `circle-x`, frase do que houve em linguagem simples e botão "Tentar de novo". Nunca códigos técnicos na tela; o código vai para o Sentry.

### 10.22 Tabela (web)

Usada nos painéis da administradora, do suporte e do síndico (RF-AC-06), na faixa expandida.

- Linhas de 52, cabeçalho fixo em `type.label.sm` e `color.text.secondary`, divisórias `color.border.divider`, linha em foco ou sob o mouse com fundo `color.surface`.
- Números e valores alinhados à direita, com algarismos tabulares.
- Busca, filtros em chips e ordenação por coluna no topo. Paginação de 25, 50 ou 100 linhas no rodapé.
- Ações da linha num menu `ellipsis` de 48 dp no fim da linha; ações em massa aparecem numa barra quando há linhas marcadas.
- Na faixa compacta, cada linha vira um cartão.
- Linha anulada (ex.: lançamento "Estornado") mantém o valor riscado e ganha o selo de estado; a informação nunca depende só do risco. Totais ficam numa linha de rodapé em `type.label.md`.

### 10.23 Indicador de sincronização

Fica na barra superior das telas da portaria e da limpeza, sempre visível (RNF-06, RNF-08).

| Situação | Ícone | Texto (tocável, abre detalhes) |
| --- | --- | --- |
| Online e em dia | `refresh-cw` estático | "Atualizado agora" |
| Enviando | `refresh-cw` girando | "Enviando 3" |
| Sem internet | `wifi-off` | "Offline · 14h32" |
| Com pendências | `cloud-upload` com contador | "3 pendentes" |

### 10.24 Onboarding

Usado no primeiro acesso (RF-AC-08, US-AC-03).

- De 3 a 5 telas por perfil, cada uma com ilustração simples (ou ícone de 32 dentro de círculo `color.info.container`), título `type.title.lg` e uma frase.
- Indicador de etapa ("2 de 4") em texto, botões "Continuar" (primário) e "Pular" (texto), sempre visíveis.
- Pode ser revisto em Menu > Como usar o app.

### 10.25 Lista editável de pessoas

Usada na lista de visitantes (11.13). Cada pessoa ocupa um cartão (10.7) de linha única, dentro de um grupo com `role="list"`.

- **Linha:** campo de nome (10.3) com rótulo acessível "Nome da pessoa N" e botão de ícone "Remover [nome]" (`trash-2`, 48 dp) à direita. O documento fica atrás de "Adicionar documento" (botão de texto), para a linha não crescer.
- **Adicionar:** botão secundário de largura total "Adicionar pessoa", com ícone `plus`, abaixo da última linha. Ao tocar, a nova linha surge com o foco no nome; Enter no nome também cria a próxima linha.
- **Remover:** um toque, sem diálogo. A mensagem rápida (10.11) diz "[nome] removida" e traz "Desfazer" por 10 s, que devolve a linha na mesma posição.
- **Contador:** "N de 100 pessoas", acima das linhas, com `aria-live="polite"`.
- **Aviso por linha:** nome repetido em `type.caption`, cor `color.warning.fg` e ícone `copy` (texto sempre junto da cor, WCAG 1.4.1). Erro de linha em `color.danger.fg` com `circle-x`.
- **Atalhos:** botões de texto "Colar vários nomes" (folha com campo de várias linhas, um nome por linha) e "Usar lista salva" (folha com linhas de lista 10.9). Recentes e frequentes aparecem como chips de seleção (10.5), com o grupo nomeado em texto, e o chip ligado mostra `check`; tocar de novo remove a pessoa.
- Rolagem: o foco rola a nova linha para a vista; o botão "Enviar lista" fica fixo no rodapé com o número de pessoas no texto.

## 11. Padrões de tela

### 11.1 Portaria

Objetivo: registrar a entrada em até 2 toques (US-VI-03), também sem internet (US-VI-04).

- **Tela inicial = lista "Esperados hoje"**, já aberta, com a busca fixa no topo (nome, unidade ou bloco) e chips de bloco quando a portaria atende mais de um.
- Cada linha mostra nome em `type.body.lg`, unidade, selo de estado e um **botão grande "Entrada"** (ou "Saída", para quem já entrou) à direita.
- **Toque 1:** "Entrada". **Toque 2 (opcional):** "Desfazer", na mensagem rápida. Não há diálogo de confirmação: o desfazer de 10 s substitui a confirmação e mantém os 2 toques.
- **Lista de visitantes (RN-VI-17):** as pessoas de uma lista aparecem agrupadas sob "Listas de visitantes", com o contador "N pessoas, M chegaram"; a entrada continua pessoa a pessoa (11.13).
- **Visitante sem cadastro:** botão flutuante "Entrada sem cadastro" → nome, unidade e marcação "Autorizado por interfone".
- **Lista de bloqueio (RN-VI-05):** ao buscar ou tocar em "Entrada" para alguém da lista, abre um diálogo bloqueante em tom `danger` com ícone `ban`, o motivo do bloqueio e duas ações: "Não liberar" (primário) e "Liberar mesmo assim" (secundário, pede o motivo). A decisão fica registrada.
- **Divergência ao sincronizar (RN-OF-04):** diálogo bloqueante em tom `warning`: "Carlos Souza entrou às 14h10, mas a visita tinha sido cancelada pelo morador. Ligue para Bloco A · Apto 101 pelo interfone." Ação única: "Confirmei com o morador". O diálogo não tem botão de fechar.
- Faixa "Sem internet" e indicador de sincronização sempre visíveis quando se aplicam (10.10 e 10.23).
- Texto principal de 18 dp, botões de 56 dp e contraste alto, pensando em turnos longos, pouca familiaridade com tecnologia e telas com reflexo.
- **Áreas > Reservas de hoje:** lista por horário com área, intervalo, unidade e estado, sem valores, meios de pagamento ou score. Reserva Confirmada a partir do início oferece "Marcar em andamento" (`clock`); após o uso, "Fazer vistoria" permite "Marcar cumprida" (`circle-check`). "Registrar não comparecimento" (`user-x`) só aparece para Confirmada depois do fim previsto, paga ou gratuita, sem uso constatado. Checklist/fotos só quando houve uso; dano segue reclamação. Não exige marcar o início antes de concluir, nem libera antecipadamente o intervalo reservado. Sem internet, ações de envio desabilitadas com explicação, sem adicionar vistoria à fila offline (RN-RE-09, RN-RE-13, RF-RE-08, RF-RE-09).

### 11.2 Limpeza

- **Conclusões concorrentes sem internet (RN-CH-04):** vale o menor horário registrado pelo celular, mesmo recebido depois. Mostrar "Vale a conclusão de [colega], registrada antes pelo horário do celular." a quem teve seu registro superado e avisar quem teve sua conclusão reconhecida. Preservar as duas operações no histórico; reenvio não abre outro ciclo nem repete avisos. Não apresentar a ordem de chegada como ordem de execução do serviço. Empate exato e relógio incorreto permanecem no ADR-014 como detalhes técnicos propostos.
- **Correção após avaliação (RN-CH-15, RN-CH-17):** avisar também quem abriu o chamado. Avaliação da conclusão superada fica só no histórico autorizado, sai das médias e não é transferida ao colega. Oferecer "Avaliar o serviço" para a conclusão efetiva pela janela configurada (padrão 7 dias), contada da disponibilização da correção, com lembrete único às 09:00 locais do dia seguinte ao fim das 24h após a disponibilização; não reiniciar as 48h de reabertura. Nunca mostrar o comentário antigo ao funcionário que passou a ter a conclusão efetiva.

- **Tela inicial = fila de chamados do setor** em cartões, ordenados por urgência e, empatando, pelo mais antigo (10.9, RN-CH-13), com o selo de urgência (10.8.1) e o prazo restante ("vence em 3h") e selo `danger` "Fora do prazo" quando vencido.
- Botão "Concluir" visível no cartão, sem abrir o chamado (PRD, seção 9). Concluir abre uma folha curta com foto opcional e o botão "Concluir chamado".
- No detalhe do chamado, o botão secundário "Iniciar atendimento" passa o chamado para "Em atendimento". Ele é opcional: "Concluir" no cartão leva de "Aberto" direto para "Concluído".
- Mesmo comportamento offline da portaria.
- Concluir: o rótulo é "Fotos do serviço (opcional)" (10.20), e as fotos seguem a conclusão na fila sem internet (RN-CH-14).
- Menu > "Minhas avaliações" (11.12): média e comentários do atendimento, sem identificar o morador (RN-CH-20).

### 11.3 Início do morador

- Barra superior com o seletor de unidade e o sino de notificações.
- **Ações rápidas** em grade de 3: "Cadastrar visitante", "Reservar", "Abrir chamado" (todas em até 3 toques, RNF-15).
- Depois, cartões "Para você" na ordem: cobrança em aberto (só para o responsável financeiro), "Para julgar" (só para quem tem reclamação ou recurso a julgar, como síndico, subsíndico e conselho fiscal), encomendas aguardando retirada, votação aberta, reservas próximas, últimos comunicados.
- Cartão "Pesquisa do mês" quando a pesquisa estiver aberta e a pessoa ainda não tiver respondido.
- Para o inquilino, cartão "Contrato de locação" a partir de 30 dias do fim ("Seu contrato vai até 31/01/2027. Fale com o proprietário sobre a renovação."), com o selo "Contrato vence em N dias".

### 11.4 Reservas

1. Lista de áreas em cartões (foto, nome, selo "Paga · R$ 150,00" ou "Gratuita").
2. Calendário e horários da área (10.19 e 4.6).
3. Resumo com regras de cancelamento em destaque ("Cancelamento com reembolso até 12h antes do início") e o botão "Reservar" ou "Reservar e pagar".
4. Para a paga: escolha de Pix (primeira opção, RF-PG-01) ou cartão. O Pix mostra QR Code, botão "Copiar código Pix" e o tempo restante para pagar ("Pague até 14h30 de amanhã ou o horário é liberado").

Ao cancelar depois do prazo de reembolso, o diálogo avisa antes de confirmar (RN-CA-03).

**Lembrete de reserva (RN-RE-14).** O push de lembrete (13.5) abre o detalhe da reserva confirmada, que mostra o botão "Cancelar reserva" com as mesmas regras e avisos de reembolso acima.

**Sugestão de lista de visitantes (RN-RE-12).** Na confirmação e no detalhe de uma reserva confirmada, com data depois de hoje e sem lista vinculada, aparece uma faixa `info` (10.10) com ícone `list-checks`: "Vai receber convidados? Monte a lista de visitantes.", o botão secundário "Montar lista" (abre a 11.13 com data, horário e local da reserva) e o botão de texto "Agora não" (esconde a sugestão para aquela reserva). Não aparece em reserva aguardando pagamento, expirada, cancelada, em andamento, cumprida ou com data de hoje. Com lista vinculada, o detalhe mostra uma linha (10.9) "Lista: N pessoas", com o nome da lista e "M chegaram", que abre o detalhe da lista. Na confirmação, a faixa fica abaixo do status; no detalhe, abaixo do cartão da reserva.

### 11.5 Reclamações

- **Registro:** formulário em etapas curtas: alvo (só um, só do condomínio), categoria (com a gravidade padrão mostrada), descrição, data e foto opcional. Antes de enviar, um aviso `info`: "Quem você indicou não vai saber que foi você. Reclamações falsas podem custar pontos a quem reclama." com link para "Como funciona".
- **Painel do julgador:** lista com filtros por estado e ordenação por data ou score (RF-RS-03). O detalhe mostra o reclamante e o alvo com seus scores, a conversa vinculada e os botões "Validar" e "Negar", desabilitados com explicação até a conversa ser registrada (US-RS-02). Cada linha e o detalhe mostram o selo de prazo (10.8.2) quando a reclamação aguarda decisão; o prazo esgotado não libera nem bloqueia os botões.
- **Acompanhamento do morador:** em "Minhas reclamações", as feitas por ele aguardando decisão mostram o selo de prazo (10.8.2) sob o selo de estado, na lista e no detalhe. As que são contra ele não mostram semáforo.
- **Negar:** opções de motivo com os pontos escritos ("Falsa ou de má-fé · −15 pontos para quem reclamou"); motivos com penalidade abrem o campo de justificativa obrigatório.
- **Visão do alvo:** nunca mostra quem reclamou, em nenhuma tela, notificação ou histórico (SEG-07). Mostra a decisão, os pontos e, quando cabe, o botão "Recorrer" com o prazo ("Você pode recorrer até 17/03").

### 11.6 Transparência

Cartões com o score do síndico (componente 10.18 em versão compacta) e a nota de cada setor (média com uma casa decimal e cinco estrelas de leitura). Setor com menos de 2 funcionários avaliados mostra "Nota não publicada este mês" (RN-PE-08). Nenhum outro score individual aparece.

### 11.7 Votações

- **Condução eleitoral (13/11/2026):** em qualquer plano, síndico; se ausente ou cargo vago, subsíndico; sem ambos, conselho fiscal; sem todos, proprietário designado pelo condomínio, inclusive não residente, com permissão temporária restrita à eleição. Administradora presente e suporte autorizado no Gestão + Suporte também podem conduzir. Mostrar responsável e motivo de indisponibilidade; nunca resultados parciais nem relação eleitor–voto. Encerramento definitivo revoga a permissão temporária. Concessão e comprovação da designação ainda exigem revisão.
- Cartão da pauta com pergunta, opções em botões de opção grandes, quórum e prazo ("Votação até o fim da reunião, 20/11 às 21h").
- Confirmação em diálogo com a opção escolhida, porque o voto não pode ser mudado.
- Depois de votar: selo `success` "Seu voto foi registrado". Resultado só aparece após o encerramento (RF-VO-07).
- Unidade em atraso: em vez das opções, uma faixa `warning` visível só a quem vota pela unidade e aos responsáveis financeiros explica o motivo e mostra o botão "Ver cobranças" (RN-FI-11).
- Cada pauta com votação mostra o texto "Envolve despesa extraordinária" quando for o caso (RN-VO-18).
- Inquilino em pauta com despesa extraordinária: sem opções; faixa `info` "Só o proprietário vota nesta pauta. Ele pode indicar você como procurador."
- Inquilino em pauta sem despesa extraordinária: opções liberadas, com a faixa `info` "Se o proprietário votar até o encerramento, o voto dele vale no lugar do seu." Depois de votar, o selo fica "Seu voto foi registrado" e, se for substituído, `neutral` "Substituído pelo voto do proprietário".
- Morador que não vota pela unidade: sem opções e o texto "Quem vota pela unidade é o proprietário, [nome]."

### 11.8 Cobranças

- Lista de cobranças emitidas para a pessoa (cada responsável financeiro vê as suas), com valor em `type.title.sm`, vencimento, tipo ("Ordinária" ou "Extraordinária") e selo de estado.
- O proprietário não residente vê também as cobranças da unidade emitidas ao inquilino, com o selo de estado e o texto "Paga pelo inquilino", sem botão de pagar (RN-FI-10).
- O detalhe mostra o valor atualizado (com multa e juros discriminados quando em atraso) e as formas ativas: Pix, boleto (código de barras com botão "Copiar código") e cartão.
- Depois do pagamento, mensagem `success` e botão "Baixar comprovante".
- O painel de inadimplência (síndico e administradora) fica dentro de "Gestão" e nunca é acessível a outros perfis (SEG-17).

### 11.9 Painel web

Para administradora, suporte e síndico (RF-AC-06), na faixa expandida.

- Navegação lateral com: Visão geral, Unidades e moradores, Funcionários, Áreas e regras, Reclamações, Cobrança, Finanças, Comunicados, Reuniões, Solicitações, Configurações.
- Telas de lista usam tabela (10.22); telas de cadastro usam formulário de uma coluna com largura máxima de 640.
- Configurações mostram, em cada parâmetro, o padrão da plataforma, o valor do condomínio, a faixa permitida e de onde vem o valor ("Herdado do condomínio").
- No plano Gestão + Suporte, o síndico vê o contador de solicitações antes de enviar ("7 de 10 solicitações usadas este mês. As próximas custam R$ 15,00 cada.") (RN-PL-05).
- Importação por planilha mostra prévia com as linhas com erro destacadas antes de confirmar.
- O detalhe da unidade mostra o selo da unidade (4.5), o proprietário, o inquilino com as datas do contrato e os botões "Renovar contrato" e "Encerrar contrato", os responsáveis financeiros por tipo (ordinárias e extraordinárias) e a opção "Marcar como desocupada".

### 11.10 Unidade do proprietário não residente

Tela inicial do proprietário não residente (RN-CD-19).

- Cabeçalho com a unidade, o selo da unidade (4.5) e, se alugada, o nome do inquilino e as datas do contrato. Nada da rotina do inquilino aparece: visitantes, reservas, chamados, encomendas e score.
- Ações: "Pedir renovação", "Pedir encerramento" e, na unidade desocupada, "Pedir cadastro de inquilino"; cada pedido vira uma solicitação para a administradora, com selo de estado (RN-CD-23).
- Cartões "Para você": cobrança em aberto, votação aberta, contrato perto do fim.
- Seção "Ocorrências da unidade": reclamações validadas e multas, só com categoria, data, decisão e valor (RN-RC-16).
- Na unidade desocupada com temporada permitida, botão "Cadastrar hóspede" com data de entrada e de saída (RN-VI-10).

### 11.11 Gestão do subsíndico

O subsíndico usa as telas do síndico. O que muda depende da substituição (RN-CD-27, RN-CD-28).

| Item da Gestão | Fora da substituição | Na substituição |
| --- | --- | --- |
| Reclamações | "Reclamações contra o síndico": só as contra o síndico e os recursos de decisões dele | "Reclamações para julgar": todas, menos as contra ele |
| Chamados de manutenção | Só acompanha: empresa sem toque e sem botão "Avançar" | Como o síndico |
| Comunicados | "Comunicados e sugestões": botão flutuante "Sugerir" e seção "Suas sugestões" com selo `warning` "Aguardando o síndico", `success` "Enviado pelo síndico" ou `neutral` "Descartada" | Como o síndico |
| Reuniões e eleições | Registra votos presenciais; sem "Convocar", "Abrir eleição", "Encerrar reunião" e ata | Como o síndico |
| Encomendas com prazo vencido | Só vê a lista, sem "Marcar como devolvida" | Como o síndico |
| Substituição | Cartão com selo `neutral` "Inativa", sem interruptor | Cartão com selo `info` "Ativa", sem interruptor |
| Limpeza, Solicitações e Inadimplência | Não aparecem; por link direto, estado vazio com cadeado: "Esta função é do síndico. Você passa a ter acesso quando a substituição pelo subsíndico estiver ativa." | Como o síndico |

- No topo da Gestão, faixa `info`: fora da substituição, "Você vê as funções de gestão da subsíndica. As demais aparecem quando a substituição estiver ativa."; na substituição, "Substituição ativa: você tem as funções de síndico até o síndico ou a administradora desativar. Tudo o que fizer fica registrado."
- No Início, o cartão "Para julgar" diz "reclamações contra o síndico" fora da substituição; na substituição, aparece também o cartão "Substituição ativa".
- Para o síndico, Comunicados ganha a seção "Sugestões da subsíndica" acima dos enviados, e o item Comunicados da Gestão mostra um selo `accent` com o número de sugestões pendentes. Revisar abre o formulário de novo comunicado preenchido, com a faixa "Sugestão da subsíndica [nome], de [data]. Revise antes de enviar."

Eleição regular segue a precedência local de 11.7 em qualquer plano, independentemente de administradora ou suporte. A decisão de 13/11/2026 substitui a restrição de 12/11/2026 (RN-VO-13).

### 11.12 Avaliação do atendimento

Telas de RF-CH-08 a RF-CH-11. Tudo com texto junto da estrela ou da cor (WCAG 1.4.1).

**Morador (e síndico morador e subsíndico) no detalhe do chamado concluído**

- Seção "Fotos do serviço" com miniaturas (10.20), só se a conclusão teve fotos.
- Com avaliação aberta (até 7 dias da conclusão): faixa `info` "O serviço foi concluído. Conte como ficou." e botão "Avaliar o serviço". O chamado mostra o selo `warning` "Avaliação pendente" (4.5). O botão "Reabrir chamado" continua disponível até 48h (RN-CH-07).
- "Avaliar o serviço" abre uma folha (10.12) com, nesta ordem: avaliação por estrelas (10.17) com o texto da nota ("Muito ruim" a "Excelente"); seleção de opção única (10.5) "Em que você se baseia?", sem valor pré-selecionado, com "Vi as fotos do serviço" (só se há fotos) e "Conferi pessoalmente"; comentário opcional (10.3), até 500 caracteres; botão "Enviar avaliação".
- Enquanto faltar a nota ou a base, "Enviar avaliação" fica desabilitado e a razão aparece escrita abaixo (padrão do protótipo `disabled-reason`): "Escolha de 1 a 5 estrelas." ou "Diga se viu as fotos ou conferiu pessoalmente."
- Depois de enviar, com 1 ou 2 estrelas: dentro das 48h, diálogo (10.13) "Quer reabrir o chamado?" com "Reabrir chamado" e "Agora não"; depois das 48h, "Abrir novo chamado" e "Agora não". Com 3 ou mais: snackbar "Avaliação enviada. Obrigado!".
- Avaliado: selo `neutral` "Avaliado" e cartão "Sua avaliação" com estrelas de leitura, texto da nota, comentário e a base, sem botão de editar. Passados 7 dias sem avaliar, o botão some e o texto diz "O prazo para avaliar terminou."
- Portaria, síndico profissional e funcionários não veem a seção de avaliar.

**Síndico e subsíndico no detalhe do chamado**

- Cartão "Avaliação do atendimento" com estrelas de leitura, texto da nota, comentário e a base ("Viu as fotos" ou "Conferiu pessoalmente"); ou "Ainda não avaliado" com o prazo, quando for o caso.

**Síndico: Gestão > Avaliações do atendimento**

- Duas seções: "Limpeza" (um item por funcionário) e "Manutenção" (um item por empresa). Cada linha de lista (10.9) mostra o nome, as estrelas de leitura com a média escrita ("4,3 de 5"), o número de avaliações e, abaixo, a distribuição de 5 a 1 estrela em barras com o número escrito. Selo `warning` "Avaliações baixas" na linha de quem recebeu 1 ou 2 estrelas nos últimos 30 dias.
- Sem avaliações: estado vazio (10.21) "Ainda não há avaliações de atendimento."
- Subsíndico fora da substituição: item ausente; por link, estado vazio com cadeado, como em 11.11.

**Administradora (web)**

- Na tabela de Funcionários (10.22), coluna "Atendimento" com a média escrita e o número de avaliações ("4,3 · 12 avaliações"), sem comentários, sem chamados e sem identificar quem avaliou.

**Funcionário: Menu > Minhas avaliações**

- Com 3 ou mais avaliações: média e número em destaque, distribuição por estrelas e a lista de comentários, cada um com o mês ("outubro de 2026") e sem unidade, morador, chamado nem local.
- Com menos de 3: estado vazio com o texto "Poucas avaliações para mostrar a média." e a faixa `info` "A avaliação do atendimento não muda o seu score." (RN-CH-21).

### 11.13 Lista de visitantes

Telas de RF-VI-14 e RF-VI-15 (fluxo 6.5).

**Morador (e síndico morador e subsíndico)**

- Em Visitantes, o botão flutuante "Novo" abre uma folha (10.12) com duas linhas: "Um visitante" e "Montar lista de visitantes". A tela de novo visitante também traz uma faixa `info` com o botão "Montar lista".
- Seção "Listas" no topo da aba Esperados: uma linha de lista (10.9) por lista, com ícone `list-checks`, o nome, "N pessoas, M chegaram" e a data. Listas canceladas ficam no Histórico, com selo de estado.
- **Montar lista:** faixa de origem (`info`, ícone `calendar-days`) quando vem de uma reserva; seção "Sobre a lista" (nome, data, das/até opcionais, local ou motivo opcional); seção "Pessoas" com a lista editável (10.25), "Frequentes" e "Recentes", o interruptor (10.6) "Salvar esta lista para usar de novo" e o botão "Enviar lista (N pessoas)" no rodapé.
- Com origem de reserva, data e horário ficam desabilitados com a ajuda "Vem da reserva.". Passou da capacidade da área: faixa `warning` com ícone `triangle-alert`, sem bloquear o envio (RN-VI-14).
- **Detalhe da lista:** cartão (10.7) com nome, data, local e selo "M de N chegaram"; linhas de pessoas com selo de estado (4.5) e botão de ícone "Remover [nome] da lista" só para quem ainda não chegou; rodapé com "Adicionar pessoa" e "Cancelar lista" (diálogo 10.13 com o que acontece com quem já entrou).

**Portaria**

- Na lista "Esperados hoje" (11.1), as pessoas de uma lista não se misturam com os visitantes avulsos: aparecem sob o título "Listas de visitantes", um grupo por lista.
- Cabeçalho do grupo: ícone `list-checks`, "Lista: [nome]", unidade, local e horário, e o selo com o contador escrito "N pessoas, M chegaram" (`info` enquanto faltam pessoas, `success` quando todas chegaram). É uma linha tocável (`aria-expanded`) que abre e fecha o grupo; o chevron mostra o estado.
- Dentro do grupo, as pessoas ficam recuadas, com quem ainda não chegou primeiro. Cada uma tem o mesmo botão grande "Entrada" ou "Saída" da 11.1, 1 toque com "Desfazer"; o alerta de bloqueio e o resto do fluxo 6.2 valem para cada pessoa. Não há "dar entrada em todos".
- A busca encontra o nome da pessoa e o nome da lista, e abre o grupo que tiver resultado.
- Listas com data futura não aparecem na portaria até o dia.

### 11.14 Entregas esperadas

Telas de RF-EN-06 a RF-EN-08 (fluxo 7.2). Só linha de lista (10.9), selos (4.5), faixa (10.10), folha (10.12) e campos; sem componente nem token novo.

**Morador (e síndico morador e subsíndico)**

- Em Menu > Encomendas, a seção "Entregas esperadas" fica acima das encomendas, com o botão "Avisar entrega" ao lado do título. Cada entrega é uma linha (10.9) com ícone `package-open`, título "[origem ou 'Entrega'] · [data]" ("hoje", "08/11"), apoio com a faixa ("entre 12h e 19h") e a descrição, e o selo de estado (4.5). Ordem: "Esperada" por data, depois "Não chegou", depois o histórico.
- Tocar na linha abre uma folha (10.12) com os dados e as ações "Editar" e "Cancelar entrega"; em "Não chegou", a ação primária é "Reagendar" (abre a edição com a data em branco). Cancelar usa diálogo (10.13) curto, e "Chegou" não tem ações.
- **Formulário:** "Data esperada" (obrigatória, mínimo hoje, máximo 30 dias); "Descrição (opcional)", com contador de 60; "Das" e "Até" (opcionais, as duas juntas); "Origem (opcional)" em chips (Amazon, Correios, Mercado Livre, Shopee, iFood/entregador, Outra), e "Outra" abre um campo de texto de até 30 caracteres. Ajuda: "A portaria vê a descrição." Faixa `info` ao escolher iFood/entregador: "A portaria recebe só um aviso. Comida por aplicativo não é registrada como encomenda."
- Erros ao lado do campo, com texto e ícone: faixa invertida, data passada, limite de 10 por unidade.
- Sem entregas: estado vazio com "Nenhuma entrega esperada." e a ação "Avisar entrega".

**Portaria**

- Na aba Encomendas, a seção "Esperadas hoje" fica no topo, antes dos chips de "Aguardando retirada". Cada linha tem a unidade em `type.body.lg`, "origem · faixa" e a descrição no apoio; quem não tem faixa vem por último.
- Botão "Registrar" na linha abre o registro com a unidade, o remetente e o vínculo já preenchidos (1 toque a mais, nenhum diálogo). Entrega de iFood/entregador mostra só o selo "Só aviso" e o texto "Libere pelo interfone. Não é encomenda.", sem botão.
- **Vínculo no registro:** depois da unidade, aparece a seção "Entregas esperadas desta unidade" com opções de escolha (uma por entrega, a sugerida já marcada e com o selo "Sugerida") e a última opção "Não vincular". Sem entregas esperadas, a seção não aparece. Não há diálogo extra; o toque em "Registrar encomenda" confirma, e a mensagem rápida diz "Encomenda registrada e vinculada. O morador foi avisado."
- "Esperadas hoje" vazia: "Nenhuma entrega esperada hoje." Entregas "Não chegou" não aparecem na seção, só como opção no vínculo.

### 11.15 Finanças do condomínio

Telas de RF-FI-17 a RF-FI-24 (fluxos 13.3 e 13.4). Só cartão (10.7), tabela (10.22), chips, selo (10.8), faixa (10.10), folha (10.12), diálogo (10.13), campos e os gráficos de 4.7; sem token novo. A tela mostra valores do condomínio, nunca de uma unidade (15).

**Administradora e suporte (web)**

- "Finanças" fica na navegação lateral, logo depois de "Cobrança" (ícone `wallet`). A página é única e vai de cima para baixo: período, resumo, despesas por categoria, receitas por origem, evolução e lançamentos.
- **Cabeçalho:** título, apoio "Controle gerencial de receitas e despesas. Não substitui a contabilidade." e, à direita, "Exportar CSV" e "Exportar PDF" (secundários, ícone `download`) e "Novo lançamento" (primário, `plus`).
- **Período:** chips em linha rolável com os meses (mais recente primeiro) e "3 meses", "6 meses" e "12 meses". Ao lado, o selo do mês (4.5): "Aberto", "Fecha em N dias" ou "Fechado". Mês aberto e já terminado ganha a faixa `info` "Outubro terminou. Fecha sozinho em 10/11." com o botão "Fechar outubro agora"; mês fechado ganha a faixa neutra "Mês fechado em 10/11. Alterações só por estorno." com ícone `lock`.
- **Resumo:** três cartões (Receitas, Despesas e Saldo) com o valor em `type.title.lg`, algarismos tabulares. Abaixo do valor, a comparação com o mês anterior escrita ("3,2% a mais que setembro", "R$ 1.204,00 a menos que setembro") com ícone `trending-up`, `trending-down` ou `minus` em `color.text.secondary`: alta ou queda de receita ou despesa não é boa nem ruim em si, então não usa verde nem vermelho. Em período de vários meses, a comparação some. O saldo negativo ganha o ícone `triangle-alert` e a palavra "Déficit". Uma linha de apoio diz quanto da receita veio de cobranças extraordinárias ("Inclui R$ 20.700,00 de fundo de obras").
- **Despesas por categoria:** barras horizontais em `chart-1`, da maior para a menor, com o rótulo à esquerda e o valor e o percentual à direita; ao lado (ou abaixo, em tela estreita), a tabela com categoria, valor, percentual e variação sobre o mês anterior, e total no rodapé. Serviços terceirizados mostra o detalhe por serviço (portaria, limpeza, elevador, jardinagem) numa linha expansível. Resumo em texto para leitor de tela: "Maior despesa: Serviços terceirizados, R$ 26.050,00, 31% do total".
- **Receitas por origem:** tabela curta com categoria, valor, origem ("Automático" com `zap` ou "Avulso") e, nas automáticas, "N cobranças pagas" ou "N reservas pagas", sem unidade.
- **Evolução:** gráfico de barras agrupadas por mês (receitas em `chart-1`, despesas em `chart-2` com contorno `coral.700`), eixo em meses abreviados, valores em milhares escritos acima das barras na visão de 6 meses; chips "6 meses" e "12 meses"; legenda em texto e, logo abaixo, o botão de texto "Ver como tabela", que abre mês, receitas, despesas e saldo.
- **Lançamentos:** busca por descrição ou fornecedor, seletor de categoria e chips "Todos", "Receitas" e "Despesas", acima da tabela (10.22), que tem as colunas data, descrição (com ícone `arrow-down-to-line` para receita e `arrow-up-from-line` para despesa), categoria, fornecedor ou origem, comprovante ("Anexado" com `paperclip` ou "Não anexado"), situação e valor (com "+" ou "−"). Marcações em selos neutros: "Automático" (`zap`) e "Recorrente" (`repeat`); "Estornado" em `warning` com ícone `undo-2` e valor riscado; "Estorno" em `neutral` com o link "Ver original". Sem resultado: estado vazio "Nenhum lançamento neste filtro." com "Limpar filtros".
- **Menu da linha (`ellipsis`):** "Ver detalhe" e "Comentários" em todas; "Editar" e "Excluir" só em lançamento avulso de mês aberto; "Estornar" só em lançamento avulso de mês fechado ainda não estornado. Em lançamento automático, o detalhe mostra a faixa `info` "Vem de cobranças pagas. Para corrigir, altere a cobrança ou a reserva."
- **Novo lançamento (folha, 10.12):** "Tipo" em opção única (Despesa, Receita), "Data" (máximo hoje), "Categoria" (lista de RN-FI-32; para receita avulsa, só "Outras receitas", e com a cobrança desligada também "Taxa condominial" e "Fundo de reserva"), "Serviço" em chips só em Serviços terceirizados, "Valor", "Fornecedor" (despesa) ou "Origem" (receita), "Descrição (opcional)", "Comprovante (opcional)" com foto ou PDF (10.20) e o interruptor "Repetir todo mês", que abre "Dia do mês". Faixas: `info` "Taxas, multas, fundo de reserva e aluguel de áreas entram sozinhos das cobranças e reservas pagas." ao escolher receita; `info` "Informe só o total da folha do mês, sem nomes nem salários." em Folha de funcionários. Erros ao lado do campo, com texto e ícone: valor zerado, fornecedor vazio, data futura ou em mês fechado.
- **Detalhe do lançamento (folha):** dados, comprovante, origem, histórico de alterações (valor antigo e novo, autor e data) e comentários do síndico e do conselho.
- **Estorno (diálogo, 10.13, tom `warning`):** "Estornar este lançamento?", texto "Cria um lançamento de valor oposto com a data de hoje. O original continua visível, como Estornado.", campo "Motivo" obrigatório e botões "Estornar" e "Manter lançamento". Depois, mensagem rápida "Estorno lançado em 05/11."
- **Fechar o mês (diálogo, tom `warning`):** conta as despesas sem comprovante ("3 despesas estão sem comprovante. Depois de fechar, o mês só aceita estorno.") e tem os botões "Fechar mesmo assim" e "Voltar".
- **Comentários:** em cada lançamento e no mês, lista com nome, papel, data e texto; selo `accent` "Novo comentário" para a administradora até ela abrir.

**Síndico e conselho fiscal (app)**

- O síndico abre Gestão > "Finanças" (`wallet`); o membro do conselho fiscal, Menu > "Finanças do condomínio". O subsíndico fora da substituição vê o estado vazio "Esta função é do síndico..." (11.11). Mesma regra do painel de inadimplência: só leitura, sem botão de lançar, editar, fechar ou estornar.
- Uma coluna: chips de período rolável; cartões de Receitas, Despesas e Saldo com a comparação em texto; "Despesas por categoria" como linhas de lista (10.9) com a barra `chart-1` embaixo do valor; "Evolução" com o gráfico de 6 meses e "Ver como tabela"; "Lançamentos" em linhas de lista (descrição, categoria e data no apoio, valor à direita) com chips "Todos", "Receitas" e "Despesas" e busca. Tocar na linha abre a folha de detalhe, com comprovante e comentários, e o botão "Comentar".
- No fim da tela: "Comentar o mês", "Exportar CSV" e "Exportar PDF". O arquivo respeita o filtro.
- Na versão web (RF-AC-06), o síndico vê a mesma página da administradora, sem os botões de escrita.

### 11.16 Exceções e acompanhamento aprovados em 12/11/2026

- Reservas: mostrar reembolso com antecedência maior ou igual ao prazo (inclusive 12h exatas). A gestão autorizada usa Cancelar pelo condomínio com motivo obrigatório; Aguardando pagamento cancela sem reembolso se não houve recebimento. Recebimento tardio mostra “Recebimento em análise”, sem sugerir reserva reativada.
- Manutenção: Reaberto traz “Aguardando triagem” e ações Orçamento/Agendado somente para síndico/sub em substituição. Registrar autoria/momento e manter texto de estado.
- Reclamações: reatribuição retira ações do ex-julgador. Troca de habilitado não mostra caso do antigo ao novo; acesso próprio histórico fica restrito ao caso. Recurso mostra pontos efetivamente devolvidos, sem inflar penalidade truncada.
- Denúncias: destinatário vê projeção protegida, motivo, ação Encerrar sem ação ou Ocultar conteúdo, confirmação e histórico. Oculto aparece com texto e ícone, sem apagar evidência restrita nem penalizar score automaticamente. Não revelar autoria protegida na moderação.
- Eleições: a restrição original de 12/11 foi substituída pela precedência local de 11.7 em 13/11/2026. Inconclusiva traz motivo e encaminhamento ao condomínio, sem vencedor inventado; administradora e suporte autorizado podem participar quando presentes.
- Exportações: solicitação, processamento, falha e arquivo disponível são informações de acompanhamento; ícone/texto sempre acompanham o estado. Arquivo é privado e exige autorização atual. Não anunciar “baixado” ao solicitar.
- Portaria/limpeza: pendência de envio é separada da limpeza do cache; não mostrar “Tudo sincronizado” enquanto houver fila. Acesso após logout ainda requer desenho de segurança.
- LGPD: exceção informa necessidade de análise autorizada sem nomear operador não definido. Sessão não promete tolerância já implementada. Assinatura da plataforma aparece como cobrança assistida/manual separada da taxa condominial.

Sem tokens ou componentes novos. Detalhes normativos e validações pendentes estão no [registro das 19 escolhas](../01-produto/05-decisoes-de-complementacao.md).

### 11.17 Essencial com autogestão

Condomínio sem administradora e sem Gestão + Suporte utiliza a modalidade Autogestão do Essencial (RN-PL-08), mantendo funcionalidades e preços do Essencial. Gestão oferece "Administração do condomínio", sem solicitações à administradora nem franquia de suporte contratado. Cadastros, áreas/regras, cobrança, finanças e configuração devem ter executor local e auditoria. O desenho de distribuição proposto para revisão coloca o síndico na execução e o subsíndico na substituição, com conselho fiscal acompanhando e fiscalizando, sem edição financeira automática. Propostas de permissões finas não equivalem à aprovação de Pedro.

O protótipo demonstra a modalidade por controle lateral e registros fictícios de alterações administrativas. Não substitui formulários completos nem concede privilégios reais. Operações administrativas e eleitorais exigem internet e rechecagem de função ao confirmar; ausência de gestor não dá poderes administrativos ao proprietário designado para eleição. Na fiscalização, não expor descrições administrativas com dados pessoais. Pendências detalhadas no registro [Autogestão e condução eleitoral](../01-produto/06-autogestao-e-conducao-eleitoral.md).

## 12. Navegação por perfil

As abas foram escolhidas para que as tarefas mais frequentes de cada perfil fiquem a um toque.

| Perfil | Abas da navegação inferior |
| --- | --- |
| Morador | Início · Reservas · Visitantes · Chamados · Menu |
| Síndico morador e subsíndico | Início · Gestão · Reservas · Visitantes · Menu. A Gestão do subsíndico é enxuta fora da substituição (11.11) |
| Síndico profissional | Início · Gestão · Comunicados · Chamados · Menu |
| Portaria | Visitantes · Encomendas · Áreas · Menu |
| Limpeza | Chamados · Áreas · Menu |
| Administradora, suporte e admin da plataforma | Web, navegação lateral (11.9) |
| Conselho fiscal | As abas do morador. Reclamações e recursos para julgar aparecem num cartão "Para julgar" no Início e em Menu > Reclamações; Menu > Finanças do condomínio abre as finanças em modo leitura (11.15) |
| Proprietário não residente | Unidade · Cobranças · Assembleias · Menu. Menu com Comunicados, Solicitações, Como funciona, Como usar o app, Aparência, Notificações, Privacidade e dados, Sair |

- **Gestão** reúne o que é do síndico: reclamações para julgar, chamados de manutenção, avaliações do atendimento, comunicados, reuniões, solicitações de cadastro, inadimplência, finanças e substituição. Para o subsíndico fora da substituição, só os itens de 11.11.
- **Meus chamados** fica no Menu do síndico e do subsíndico, porque a aba Chamados dá lugar à Gestão.
- **Áreas**: na portaria, abre Reservas de hoje e permite acompanhar Em andamento, Cumprida e Não comparecimento; na limpeza, mantém vistorias e faltas. Pendências de vistoria de dias anteriores ficam separadas. Estados usam texto e ícone além da cor; a lista da portaria não exibe informações financeiras (RF-RE-08, RF-RE-09, RN-RE-13).
- **Menu** reúne, para quem tem: Meu score, Reclamações, Cobranças, Finanças do condomínio (só conselho fiscal), Encomendas, Reuniões e votações, Pesquisa do mês, Transparência, Como funciona, Como usar o app, Aparência, Notificações, Privacidade e dados, Sair. Na portaria, o Menu também tem "Abrir chamado" e "Modo treinamento".
- **Aparência** tem três opções: "Igual ao aparelho" (padrão), "Claro" e "Escuro". A escolha fica salva (RF-AC-05, US-AC-06).

## 13. Escrita na interface

### 13.1 Tom

- Simples, direto e respeitoso. Fala com a pessoa por "você".
- Frases curtas, na ordem: o que aconteceu, o que fazer.
- Sem culpa e sem ironia, principalmente em score, reclamações e cobranças. "Sua cobrança venceu em 10/11" em vez de "Você está inadimplente".
- Sem termos técnicos: "sem internet" em vez de "offline" no texto corrido (o indicador compacto pode usar "Offline"); "enviar" em vez de "sincronizar".

### 13.2 Formatos

| Item | Formato | Exemplo |
| --- | --- | --- |
| Data | dd/mm/aaaa; no ano corrente, dd/mm | 10/03/2027 · 10/03 |
| Data relativa | Até 7 dias | "hoje", "ontem", "há 3 dias" |
| Hora | 24 horas, com "h" | 14h30 · 9h · 23h59 |
| Dinheiro | R$, espaço, milhar com ponto, centavos com vírgula | R$ 1.234,56 |
| Percentual | Vírgula decimal, sem espaço | 2% · 1,5% |
| Pontos | Sempre com sinal | +5 · −10 |
| Nota | Uma casa decimal | 3,7 de 5 |
| Unidade | Bloco · tipo e número | Bloco A · Apto 101 · Casa 12 · Sala 304 |
| Nomes de pessoas | Nome e sobrenome | Carlos Souza |

### 13.3 Termos padronizados

Use sempre o mesmo termo para a mesma coisa, igual ao glossário das Regras de Negócio.

| Use | Não use |
| --- | --- |
| Morador habilitado | Titular, morador principal |
| Proprietário | Dono, locador, condômino (na tela) |
| Inquilino | Locatário |
| Despesa extraordinária | Despesa extra, taxa extra |
| Desocupada | Vazia, sem morador |
| Unidade | Apartamento (quando puder ser casa ou sala) |
| Chamado | Ticket, ordem de serviço, pedido |
| Avaliação do atendimento (estrelas do chamado) | Nota, feedback, review |
| Urgência (alta, média, leve) | Prioridade, gravidade, severidade |
| Reclamação | Denúncia, queixa, ocorrência |
| Denunciar (conteúdo ofensivo) | Reportar |
| Comunicado | Aviso, mensagem, post |
| Score | Pontuação, nota (nota é só da pesquisa) |
| Cobrança | Fatura, boleto (boleto é uma forma de pagamento) |
| Responsável financeiro | Pagador |
| Em atraso | Inadimplente (na tela do morador) |
| Portaria | Recepção, guarita |
| Sem internet | Offline (em frases) |

### 13.4 Mensagens padrão

| Situação | Texto |
| --- | --- |
| Erro de conexão | "Não foi possível conectar. Verifique a internet e tente de novo." |
| Erro inesperado | "Algo deu errado do nosso lado. Tente de novo em alguns minutos." |
| Sem permissão | "Esta área é só para [perfil]." |
| Valor fora da faixa | "Informe um valor entre [mínimo] e [máximo]." |
| Sessão encerrada | "Por segurança, entre de novo na sua conta." |
| Salvo | "[Item] salvo." |
| Cancelado | "[Item] cancelado." |

### 13.5 Notificações

- Título curto com o assunto e texto com o detalhe e a ação. Ex.: "Encomenda na portaria" / "Chegou um pacote da Amazon para Bloco A · Apto 101. Retire quando puder."
- O toque abre a tela do item, não a tela inicial.
- Lembrete de reserva (RN-RE-14): título "Reserva amanhã" / texto "Salão de festas, amanhã, das 19h às 23h. Toque para ver ou cancelar." O toque abre o detalhe da reserva, com o botão "Cancelar reserva". Não traz valor nem dados de outras pessoas. É opcional, ligado por padrão, com o interruptor "Lembrete de reserva" (10.6) nas preferências de notificação. Com outra antecedência configurada, ou quando o envio é antecipado para as 21:00 da noite anterior por o horário de 24h antes cair entre 00:00 e 08:59, o texto usa o dia e o horário reais em vez de "amanhã" (título "Reserva no sábado", por exemplo).
- Notificações de reclamação ao alvo nunca citam o reclamante. Notificações nunca mostram valores de cobrança na tela bloqueada: "Você tem uma cobrança vencendo em 5 dias."

## 14. Acessibilidade

A meta é o WCAG 2.2 nível AA nos dois temas, no app e na web (RNF-12). Toda história com tela só é entregue se passar nesta lista.

**Visão e cor**

- [ ] Contraste de texto de pelo menos 4,5:1 (3:1 para texto a partir de 24 dp, ou 19 dp em negrito), usando só os tokens da seção 4.
- [ ] Contraste de pelo menos 3:1 para ícones com significado, contornos de campos e estados de foco.
- [ ] Nenhuma informação só por cor: estados com texto, calendário com texto e ícone, gráficos com valores escritos.
- [ ] Coral segue as regras de 4.3.
- [ ] Tela funciona com fonte ampliada a 200%, sem cortar texto nem sobrepor elementos.

**Toque e movimento**

- [ ] Área de toque mínima de 48 × 48 dp (56 na portaria) e 8 dp entre alvos.
- [ ] Toda ação de gesto (deslizar, arrastar) tem alternativa com botão.
- [ ] Movimento reduzido respeitado (seção 9).

**Leitores de tela (TalkBack, VoiceOver e leitores na web)**

- [ ] Todo elemento tocável tem `accessibilityRole` e `accessibilityLabel` claro; ícones sozinhos sempre têm rótulo.
- [ ] Ordem de leitura igual à ordem visual; títulos de tela marcados como cabeçalho (`accessibilityRole="header"`).
- [ ] Estados lidos junto com o item ("Estado: confirmada"); desabilitado anunciado com o motivo.
- [ ] Mudanças que aparecem sozinhas (nova faixa, mensagem rápida, erro de campo, novo visitante na lista) anunciadas com região viva.
- [ ] Diálogos prendem o foco e devolvem o foco ao fechar.

**Formulários e tempo**

- [ ] Rótulos sempre visíveis; erros com texto que diz como corrigir; nada depende só do texto de exemplo.
- [ ] Preenchimento automático liberado para e-mail, senha e código.
- [ ] Prazos curtos (código de 15 min, pagamento em 24h) mostram o tempo restante e permitem pedir novo código.

**Web**

- [ ] Tudo funciona só com o teclado, na ordem lógica, com anel de foco visível.
- [ ] Link "Pular para o conteúdo" no topo.
- [ ] Tabelas com cabeçalhos de coluna marcados.

**Como testar:** a cada versão, um roteiro manual com TalkBack e VoiceOver nas tarefas principais (reservar, cadastrar visitante, registrar entrada, pagar, votar) e verificação automática na web (axe). Os contrastes desta página foram calculados pela fórmula de luminância relativa do WCAG 2.2.

## 15. Privacidade na interface

Estas regras traduzem RN-SC-02, SEG-07 e SEG-17 em decisões de tela. Valem em listas, detalhes, notificações, buscas e exportações.

| Dado | Quem pode ver na interface | Onde nunca aparece |
| --- | --- | --- |
| Score individual | A própria pessoa; o julgador e a administradora dentro da reclamação; administradora (e síndico e subsíndico sem administradora) para funcionários | Listas de moradores, perfis de outras pessoas, comunicados |
| Score do síndico | Todos | — |
| Quem reclamou | Julgador e administradora | Qualquer tela, notificação ou histórico do alvo |
| Situação financeira da unidade | Proprietário, administradora, síndico (ou subsíndico em substituição); cada responsável financeiro vê as cobranças emitidas para ele | Votações (o motivo do bloqueio só aparece a quem vota e aos responsáveis financeiros), listas de unidades vistas por moradores, notificações na tela bloqueada |
| Receitas, despesas e lançamentos do condomínio | Administradora, síndico (ou subsíndico em substituição) e conselho fiscal | Qualquer tela de morador, proprietário não residente ou funcionário |
| Receitas de cobrança nas finanças | Totais por categoria e quantidade de cobranças pagas | Unidade, responsável financeiro e situação de pagamento de cada unidade, em telas e exportações (RN-FI-30) |
| Folha de funcionários nas finanças | Só o total do mês | Nome e salário de cada funcionário |
| Rotina do inquilino (visitantes, reservas, chamados, encomendas, score) | O próprio inquilino e os perfis que já veem esses dados (portaria, síndico, julgador) | Qualquer tela do proprietário não residente |
| Reclamação contra unidade alugada ou desocupada | Proprietário: só categoria, data, decisão e multa, depois da validação | Conversa com o alvo e identidade do reclamante, para o proprietário |
| Quem reservou | Ninguém no calendário (só "Ocupado") | Calendário e lista de horários |
| Notas individuais da pesquisa | O próprio funcionário, sem saber quem avaliou | Transparência e qualquer tela de morador |
| Avaliação do atendimento de um chamado | Quem avaliou; síndico e subsíndico, no detalhe do chamado (nota, comentário e base); funcionário, só como média e comentários anônimos com 3 ou mais avaliações; administradora, só média e quantidade | Qualquer tela do funcionário com unidade, morador, chamado ou local; notificações ao funcionário; Transparência |
| Documento do visitante | Portaria e o morador que cadastrou | Notificações |

Regra geral: quando a interface precisa mostrar que existe uma restrição sem revelar o motivo a terceiros, ela mostra só "Indisponível".

## 16. Desempenho visual

Para cumprir RNF-02 (tela utilizável em até 3 s em aparelho de entrada) e RNF-04 (app abaixo de 30 MB):

- Fotos de áreas e ilustrações em WebP, com no máximo 200 KB cada, carregadas sob demanda e com cache (`expo-image`).
- Ilustrações simples em SVG, com no máximo 2 cores da paleta.
- Só os quatro pesos da Inter; nenhuma outra fonte.
- Esqueletos estáticos em vez de animações de carregamento (10.21).
- Ícones importados um a um da Lucide, nunca a biblioteca inteira.

## 17. Tokens no código

Os tokens ficam num único arquivo TypeScript, consumido por um `ThemeProvider` que escolhe o tema claro ou escuro (seguindo o aparelho por padrão). O trecho abaixo mostra o formato; o arquivo completo traz todos os tokens das seções 4 a 9.

```ts
// src/design/tokens.ts
export const palette = {
  white: '#FFFFFF',
  blue950: '#0B1A44', blue925: '#081B52', blue900: '#0E2766', blue850: '#0A2878',
  blue800: '#16307A', blue750: '#133080', blue700: '#0E359D', blue300: '#8FA8F0', blue100: '#E7ECFA',
  gray700: '#5A6785', gray500: '#74809E', gray450: '#7D8BB5', gray400: '#8A94AD', gray300: '#B8C4E6',
  gray200: '#DCE2F0', gray150: '#E3E8F3', gray100: '#E9EDF5', gray50: '#F3F6FC',
  coral700: '#C8323F', coral500: '#FF606A', coral400: '#FF7A82', coral100: '#FFE9EB',
  green800: '#1F6B28', green700: '#2E7D32', green100: '#E8F5E9',
  amber800: '#8F5600', amber100: '#FFF4E0',
  red700: '#C62828', red100: '#FDECEC',
  // ...demais tons da seção 4.1
} as const;

export const light = {
  bg: palette.white,
  surface: palette.gray50,
  brand: palette.blue700,
  text: { primary: palette.blue950, secondary: palette.gray700, disabled: palette.gray400, onBrand: palette.white },
  link: palette.blue700,
  accentFg: palette.coral700,
  action: { primary: palette.blue700, primaryPressed: palette.blue850, onPrimary: palette.white },
  border: { control: palette.gray500, divider: palette.gray200 },
  focus: palette.blue700,
  // tons de status (seção 4.4): color.<tom>.fg | container | onContainer
  success: { fg: palette.green700, container: palette.green100, onContainer: palette.green800 },
  warning: { fg: palette.amber800, container: palette.amber100, onContainer: palette.amber800 },
  danger:  { fg: palette.red700, container: palette.red100, onContainer: palette.red700 },
  // ...info, neutral, accent
};

export type Theme = typeof light;

export const dark: Theme = { /* valores da coluna "Escuro" da seção 4, também via palette */ };

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const radius = { sm: 8, md: 12, lg: 20, fab: 16, full: 999 } as const;
export const motion = { fast: 100, base: 200, slow: 300 } as const;
```

- **Componentes base** ficam em `src/design/components` (Button, Fab, TextField, CodeInput, Card, StatusBadge, Banner, Snackbar, BottomSheet, Dialog, TopBar, UnitSwitcher, StarRating, ScoreMeter, Calendar, PhotoPicker, EmptyState, DataTable, SyncIndicator).
- **Selo de estado** recebe o módulo, o estado e, em reclamações, a perspectiva (`<StatusBadge module="reclamacao" status="validada" perspectiva="alvo" />`), e busca o texto e o tom num mapa único que espelha a seção 4.5, para nenhuma tela escolher cor de estado por conta própria. `perspectiva` (alvo, reclamante ou julgador) só é obrigatória em reclamações; nos demais módulos o tom é único.
- **Regra de revisão:** cores em hex, tamanhos soltos ou ícones fora do mapa (8.3) dentro de telas são apontados na revisão de código.

## 18. Decisões e correções

Este documento corrigiu pontos da seção 9 do PRD, que foi atualizada para ficar igual.

Em 08/11/2026, Pedro definiu a primeira conclusão offline pelo menor horário registrado pelo celular, mesmo quando enviada depois (RN-CH-04). O critério está nas regras; desempate exato e tratamento de relógio incorreto continuam como propostas técnicas do ADR-014.

| Data | Mudança | Motivo |
| --- | --- | --- |
| 13/11/2026 | Condução eleitoral por precedência local em qualquer plano (11.7), designação restrita à eleição e Essencial com autogestão (11.17), incluindo simulação de administração local | Decisão de Pedro: funcionamento sem administradora ou suporte pago; distribuição detalhada de funções fica como proposta para revisão, preservando sigilo e fiscalização |
| 12/11/2026 | Exceções de reserva e pagamento, triagem de manutenção, episódio original e reversão efetiva, moderação protegida, autorização eleitoral, exportação assíncrona e fila separada do cache (11.16); assinatura assistida e LGPD com operador pendente | Decisões de Pedro, escolhas 1A–19A; alinhar RN, PRD, histórias, fluxos e protótipo sem ampliar acesso nem afirmar validações externas |
| 09/11/2026 | Texto do push "Lembrete de reserva" (13.5): quando o envio é antecipado para as 21:00 da noite anterior, o título e o texto usam o dia e o horário reais ("Reserva no sábado"), não "amanhã"; sem componente nem token novo | Decisão de Pedro: horário de 24h antes entre 00:00 e 08:59 antecipa o push para as 21:00 da noite anterior, então o aviso pode chegar com mais de 24h de antecedência (RN-RE-14, D-39 dos User Flows, fluxo 5.1) |
| 09/11/2026 | Texto do push "Lembrete de reserva" (13.5), interruptor "Lembrete de reserva" nas preferências de notificação e atalho "Cancelar reserva" no detalhe da reserva (11.4); sem componente nem token novo | Decisão de Pedro: avisar o morador 24h antes de reserva confirmada, de forma opcional, só por push e com atalho para cancelar nas regras de RN-CA-01 a RN-CA-03 (RN-RE-14, RF-RE-10, US-RE-04, US-NO-01, UF 5.1, 5.2 e 14.1) |
| 08/11/2026 | Conclusão de limpeza sem internet escolhida pelo menor horário do celular, mesmo enviada depois; aviso de correção, avaliação superada só no histórico e nova avaliação na janela configurada desde a disponibilização | Decisão de Pedro (RN-CH-04, RN-CH-15, RN-CH-17): preservar autoria do serviço e das avaliações, retirar notas superadas das médias e impedir efeitos duplicados; a correção não reinicia as 48h de reabertura |
| 08/11/2026 | Score do morador por pessoa e vínculo de unidade, com unidade identificada, saldo/histórico/recuperação próprios e início em 100; score funcional por condomínio para funcionários e síndico profissional sem unidade; score público do síndico morador usa unidade do mandato | Decisão de Pedro: não compartilhar pontuação entre moradores nem imóveis, não herdar score de antigo ocupante e manter referência inequívoca para gestão (RN-SC-02, RN-SC-13, RN-SC-14) |
| 08/11/2026 | Portaria com Reservas de hoje em Áreas e marcações Em andamento, Cumprida e Não comparecimento; Cumprida substitui Realizada; falta paga registrada na vistoria; limpeza mantém vistoria | Decisão de Pedro: acompanhar uso diário e encerrar também reserva paga não usada (RN-RE-09, RN-RE-10, RN-RE-13, RF-RE-08, RF-RE-09, US-RE-06, UF 5.3). Sem nova penalidade/reembolso de falta paga e sem ampliar offline |
| 04/11/2026 | Cor de alerta do tema claro de #B26A00 para #8F5600 | #B26A00 tem 4,2:1 sobre o branco e não passa no AA para texto; #8F5600 tem 6,0:1 |
| 04/11/2026 | Cor de erro do tema escuro de #EF5350 para #FF8A8A | #EF5350 tem 4,0:1 sobre a superfície escura; #FF8A8A tem 6,2:1 e fica mais distante do coral |
| 04/11/2026 | Novo tom `coral.700` (#C8323F) para texto e ícones coral no tema claro | O PRD liberava coral em ícones e selos no claro, mas 2,9:1 também não passa no mínimo de 3:1 para ícones e componentes (WCAG 1.4.11) |
| 04/11/2026 | Ícone do botão flutuante em azul-escuro #081B52 | Branco sobre coral tem 2,9:1; azul-escuro tem 5,5:1 |
| 04/11/2026 | Área de toque mínima de 44 para 48 dp (56 na portaria) | 44 é o mínimo do iOS, mas o Android pede 48. Usar 48 atende os dois; RNF-12 atualizado |
| 04/11/2026 | Calendário com quatro estados (livre, ocupado, indisponível, bloqueado pelo score), sempre com texto | O PRD citava só cores para três estados, o que fere o WCAG 1.4.1, e as histórias já tinham dois motivos de indisponibilidade (antecedência e score) |
| 04/11/2026 | Registro de entrada sem diálogo de confirmação, com "Desfazer" | Um diálogo de confirmação faria a tarefa passar de 2 toques |
| 04/11/2026 | Score sem vermelho ou verde | O score é referência para o julgador (RN-SC-11), não um julgamento público da pessoa |
| 04/11/2026 | Definidos fonte (Inter), ícones (Lucide), espaçamento, raios, elevação, movimento e componentes | Não estavam definidos nos documentos de produto |
| 04/11/2026 | Assinatura visual provisória (3.3) | Ainda não existe logotipo; a seção será substituída quando houver |
| 04/11/2026 | Calendário: motivo "unidade em atraso" só para quem pode ver a situação financeira; demais veem "Reservas indisponíveis para esta unidade no momento"; texto de "Ocupado" em `color.neutral.onContainer` | O texto anterior revelava a situação financeira a qualquer morador da unidade (RN-FI-10, seção 15); a cor de "Ocupado" não estava definida |
| 04/11/2026 | Perfil "Proprietário não residente" na navegação (12), na privacidade (15) e na rastreabilidade (19) | Perfil criado por RN-CD-19; o PRD passou a ter 11 perfis |
| 04/11/2026 | Conselho fiscal com as abas do morador e cartão "Para julgar" no Início (11.3) | Os membros do conselho são moradores e mantêm as permissões de morador (PRD, seção 3, "Perfis fora da matriz") |
| 04/11/2026 | Regra de contagem de toques na seção 2; RNF-15 do PRD aponta para ela | Nenhum documento dizia o que conta como toque, e o User Flows contava de forma diferente |
| 04/11/2026 | Tom dos selos de reclamação por perspectiva (alvo, reclamante, julgador) e `StatusBadge` com `perspectiva` | "Negada" só existe com penalidade (RN 5.5), e o selo não tinha como saber o tom certo só com módulo e estado |
| 04/11/2026 | Alerta "Fora do horário cadastrado" (`warning`, ícone `clock`) em Visitas | O User Flows (6.2) usa esse alerta (RN-VI-03), mas ele não estava no Design System |
| 04/11/2026 | Botão opcional "Iniciar atendimento" no detalhe do chamado de limpeza (11.2) | A RN 9.2 tem o estado "Em atendimento", que a tela não previa |
| 04/11/2026 | Nomes da paleta renumerados sem mudar hex: #0B1A44 `blue.950`, #081B52 `blue.925`, #0E2766 `blue.900`, #0A2878 `blue.850`, #16307A `blue.800`, #133080 `blue.750`, #7D8BB5 `gray.450` | Número maior deve indicar tom mais escuro, e alguns nomes invertiam essa ordem |
| 04/11/2026 | Exemplo de código da seção 17 sem hex soltos, só com referências a `palette` | A própria seção 17 manda apontar hex solto na revisão |
| 05/11/2026 | Proprietário não residente com as abas Unidade, Cobranças, Assembleias e Menu (12), tela da unidade (11.10) e novos itens de privacidade (15) | O proprietário passou a votar e acompanhar a unidade alugada (RN-CD-19, RN-VO-01) |
| 05/11/2026 | Estados da unidade e do contrato de locação (4.5); tipo da cobrança como texto, não selo | Novas regras de locação (RN-CD-20 a RN-CD-24, RN-FI-20) |
| 05/11/2026 | Votações com textos para o inquilino e para pautas com despesa extraordinária (11.7); cobranças do inquilino visíveis ao proprietário sem botão de pagar (11.8) | RN-VO-18, RN-FI-10 |
| 05/11/2026 | Termos "Proprietário", "Inquilino", "Despesa extraordinária" e "Desocupada" (13.3) | Evitar sinônimos jurídicos na tela, como locador e locatário |
| 05/11/2026 | Subsíndico com as abas do síndico e Gestão enxuta fora da substituição (11.11, 12); sugestões de comunicado | O subsíndico passou a ter funções de gestão no dia a dia (RN-CD-27, RN-CO-05) |
| 05/11/2026 | Lista de visitantes: componente 10.25 (lista editável de pessoas) e padrão de tela 11.13, com grupo recolhível na portaria e chips de recentes e frequentes; sem token novo | Montar festas e eventos sem cadastrar um visitante por vez (RF-VI-14, RF-VI-15, RN-VI-11 a RN-VI-17); contador escrito e texto junto da cor (WCAG 1.4.1); remover com um toque e desfazer em vez de diálogo, como na portaria; capacidade da área só avisa |
| 05/11/2026 | Sugestão de lista de visitantes depois da reserva: faixa `info` (10.10) na confirmação e no detalhe, linha "Lista: N pessoas" (10.9) quando há lista vinculada, em 11.4; sem token novo | Levar o morador à lista de festas logo após reservar, sem insistir (RN-RE-12, RN-VI-14); só para reserva confirmada com data futura, porque a reserva pode expirar e levar a lista junto; áreas não são separadas porque as regras não as separam |
| 05/11/2026 | Avaliação do atendimento do chamado: seção 11.12, marcações "Avaliação pendente" (`warning`) e "Avaliado" (`neutral`) em 4.5, estrelas de leitura com média escrita (10.17), fotos do serviço (10.20), linha de privacidade (15); sem token novo | Morador avalia o serviço concluído, com fotos opcionais e base explícita; síndico, administradora e funcionário veem a avaliação em níveis diferentes (RN-CH-14 a RN-CH-21); texto junto das estrelas e da cor (WCAG 1.4.1) |
| 05/11/2026 | Ordem das listas de chamados por urgência e, empatando, pelo mais antigo, com concluídos no fim (10.9, 11.2) | Ordem de atendimento; RN-CH-13 |
| 05/11/2026 | Selo de prazo da reclamação (10.8.2) em `success`, `warning` e `danger`, com texto e ícone; limiar de 25% do prazo; sem token novo | Semáforo de prazo para quem reclamou e para o julgador (RN-RC-17 a RN-RC-19); limiar proporcional porque o prazo é configurável de 3 a 60 dias; texto e ícone evitam depender só da cor (WCAG 1.4.1) |
| 05/11/2026 | Selo de urgência do chamado (10.8.1) em `danger`, `warning` e `success`, com texto e ícone; sem token novo | Urgência alta, média e leve em vermelho, amarelo e verde (RN-CH-09 a RN-CH-11); texto e ícone evitam depender só da cor (WCAG 1.4.1) |
| 05/11/2026 | Entregas esperadas: estados em 4.5 (Esperada, Chegou, Não chegou, Cancelada, Encerrada, marcação "Só aviso") e padrão de tela 11.14, com a seção "Esperadas hoje" na portaria e o vínculo no registro da encomenda; sem componente nem token novo | O morador avisa uma entrega a caminho e a portaria identifica pacote e unidade (RF-EN-06 a RF-EN-08, RN-EN-07 a RN-EN-13); "Não chegou" em `warning` com texto e ícone (WCAG 1.4.1); iFood/entregador é só aviso porque a RN-EN-05 não permite registrar comida por aplicativo; vínculo sugerido sem diálogo, para não passar de 2 toques o registro |
| 05/11/2026 | Finanças do condomínio: padrão de tela 11.15 (web da administradora, app do síndico e do conselho fiscal), estados do mês e do lançamento (4.5), regras de gráfico de finanças (4.7), linha anulada na tabela (10.22), item "Finanças" na navegação web e "Finanças do condomínio" no Menu do conselho fiscal (11.9, 12), ícones (8.3) e linhas de privacidade (15); sem componente nem token novo | Controle de receitas e despesas (RF-FI-17 a RF-FI-24, RN-FI-21 a RN-FI-32); variação em texto e ícone neutro porque receita ou despesa maior não é boa nem ruim, e valores só do condomínio por causa de SEG-17 e SEG-18 |
| 04/11/2026 | Diagramas perdidos na conversão para Markdown refeitos: roadmap em Mermaid na Visão de Produto; fluxo e estados da reclamação e estados da reserva em tabelas nas Regras de Negócio e em Mermaid no User Flows — CondomiFacil | Pendência resolvida; saiu da lista de pendências |

**Pendência fora deste documento:** o logotipo definitivo depende de um trabalho de identidade visual.

## 19. Rastreabilidade

| Seção deste documento | Requisitos e regras |
| --- | --- |
| 2. Princípios | Princípios da Visão de Produto, RNF-15 |
| 4. Cores | PRD seção 9, RNF-12, RF-AC-05 |
| 4.5 Estados | RN 5.5, 7.4, 8.3, 9.1 (inclui entregas esperadas), 9.2, 12.2, RN-CD-20 a RN-CD-24, RN-FI-20 |
| 4.6 Calendário | RF-RE-01, RF-RE-06, RN-RE-05, RN-RE-06, RN-RE-08, RN-SC-09, RN-SC-10, RN-FI-12, US-RE-01, US-RE-05 |
| 5. Tipografia | RNF-02, RNF-04, RNF-12, RNF-14 |
| 6.2 Áreas de toque | RNF-12 |
| 9. Movimento | PRD seção 9 (poucas animações), RNF-02 |
| 10.4 Código de verificação | RF-AC-01, RF-AC-03, RN-CD-02, US-AC-01 |
| 10.10 Faixa de aviso | RF-VI-05, RF-VI-12, RN-CD-03, RNF-06, US-VI-04, US-VI-06 |
| 10.16 Seletor de unidade | RF-AC-04, RN-CD-05, US-AC-05 |
| 10.17 Estrelas | RF-PE-01, RF-CH-08, RN-PE-03, RN-PE-04, RN-CH-16, US-PE-01, US-CH-04 |
| 10.20 Envio de foto (fotos do serviço) | RF-CH-02, RF-CH-04, RF-CH-05, RN-CH-14, US-CH-02, US-CH-03 |
| 10.18 Score | RF-RS-10 a RF-RS-12, RN-SC-01, RN-SC-08, RN-SC-09, US-RS-06 |
| 10.22 Tabela | RF-AC-06, RF-FI-23, US-AC-06 |
| 10.23 Sincronização | RNF-06 a RNF-08, RN-OF-02, RN-OF-03 |
| 10.24 Onboarding | RF-AC-08, US-AC-03 |
| 11.1 Portaria | RF-VI-04 a RF-VI-12, RN-VI-04, RN-VI-05, RN-OF-01 a RN-OF-04, US-VI-03 a US-VI-06 |
| 10.25 Lista editável de pessoas | RF-VI-14, RN-VI-11, RN-VI-12, RN-VI-16, US-VI-07 |
| 11.13 Lista de visitantes | RF-VI-14, RF-VI-15, RN-VI-11 a RN-VI-17, US-VI-07, US-VI-08 |
| 11.14 Entregas esperadas | RF-EN-06 a RF-EN-08, RF-EN-02, RN-EN-07 a RN-EN-13, US-EN-03, US-EN-04 |
| 10.8.1 Selo de urgência | RF-CH-06, RF-CH-07, RN-CH-09 a RN-CH-12, US-CH-01, US-CH-03 |
| 10.8.2 Selo de prazo | RF-RS-16, RN-RC-06, RN-RC-17 a RN-RC-19, US-RS-08 |
| 10.9 Linha de lista (ordem de chamados) | RF-CH-06, RN-CH-13, US-CH-02 |
| 11.2 Limpeza | RF-CH-02, RF-CH-03, RF-CH-06, RN-CH-04, RN-CH-06, RN-CH-10, RN-CH-14, US-CH-02 |
| 11.12 Avaliação do atendimento | RF-CH-05, RF-CH-08 a RF-CH-11, RN-CH-14 a RN-CH-21, US-CH-04, US-CH-05 |
| 11.4 Reservas | RF-RE-01 a RF-RE-05, RF-PG-01, RN-RE-03, RN-CA-02, RN-CA-03, RN-RE-12, RN-RE-14, RF-RE-10, RN-VI-14, US-RE-02 a US-RE-04 |
| 11.5 Reclamações | RF-RS-01 a RF-RS-09, RF-RS-16, RN-RC-01 a RN-RC-07, RN-RC-17 a RN-RC-19, SEG-07, US-RS-01 a US-RS-05, US-RS-08 |
| 11.6 Transparência | RF-RS-12, RF-PE-04, RN-PE-08, US-RS-07 |
| 11.7 Votações | RF-VO-02, RF-VO-07, RF-VO-11, RN-VO-01, RN-VO-03, RN-VO-16, RN-VO-18, RN-FI-11, US-VO-02 |
| 11.8 Cobranças | RF-FI-04, RF-FI-07 a RF-FI-13, RF-FI-16, RN-FI-03, RN-FI-08, RN-FI-10, RN-FI-20, SEG-17, US-FI-03, US-FI-05 |
| 11.9 Painel web | RF-AC-06, RF-AD-01, RF-AD-16, RF-AD-18, RF-AD-21, RN-PL-05, Regras de Negócio seção 13, US-AD-10 |
| 11.15 Finanças do condomínio | RF-FI-17 a RF-FI-24, RN-FI-21 a RN-FI-32, SEG-18, US-FI-07 a US-FI-10 |
| 11.10 Unidade do proprietário | RF-AD-19, RF-RS-15, RF-VI-13, RN-CD-19, RN-CD-23, RN-RC-16, RN-VI-10, US-AD-11 |
| 11.11 Gestão do subsíndico | RF-CH-04, RF-CO-04, RF-EN-05, RF-VO-04, RN-CD-27, RN-CD-28, RN-CO-05, RN-EN-04, RN-VO-11, US-AD-12, US-CO-03 |
| 12. Navegação | RF-AC-05, RF-AC-07, RF-RE-08, RF-RE-09, RNF-15, RN-CD-19, RN-VO-01 |
| 13. Escrita | RNF-14, glossário das Regras de Negócio, RN-RE-14 (13.5), RF-RE-10, US-NO-01 |
| 14. Acessibilidade | RNF-12 |
| 15. Privacidade | RN-SC-02, RN-RC-01, RN-RC-16, RN-RE-05, RN-PE-09, RN-FI-10, RN-FI-11, RN-FI-29, RN-FI-30, RN-CD-19, SEG-07, SEG-17, SEG-18 |
| 16. Desempenho | RNF-02, RNF-04 |
