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
| Realizada | `neutral` |
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

### 10.9 Linha de lista

- Altura mínima de 64 (72 com duas linhas de apoio), padding horizontal 16.
- Ícone ou avatar à esquerda (40 dp), título e até duas linhas de apoio no meio, selo ou ação à direita.
- Divisória `color.border.divider` entre linhas, começando depois do ícone.

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

Usada na pesquisa mensal (RF-PE-01).

- Cinco estrelas de 32 dp, cada uma com área de toque de 48. Vazia: contorno `color.border.control`. Preenchida: `coral.500` com contorno `coral.700` no claro; `coral.500` no escuro.
- Texto ao lado diz a nota em palavras: 1 "Muito ruim", 2 "Ruim", 3 "Regular", 4 "Boa", 5 "Excelente".
- Botão de texto "Não conheço" ao lado, para pular (RN-PE-03).
- Para leitores de tela, o componente é um ajustável (`accessibilityRole="adjustable"`): "Avaliação de João, 4 de 5 estrelas, boa".

### 10.18 Score

Usado em "Meu score" (RF-RS-11) e na "Transparência" (RF-RS-12).

- Número em `type.display` com "de 100" ao lado em `type.body` e `color.text.secondary`.
- Barra horizontal de 0 a 100 abaixo: trilho `color.border.divider`, preenchimento `color.link`, e uma marca vertical no limite das reservas gratuitas (60) com o rótulo "Limite para reservas gratuitas".
- Com o score acima do limite, o tom é neutro (azul). Com o score no limite ou abaixo, o preenchimento passa para `color.warning.fg` e aparece a frase de bloqueio. O score nunca usa vermelho nem verde: ele é uma referência, não um julgamento da pessoa.
- Abaixo: "Próxima recuperação: +5 em 10/03/2027" e o histórico (linhas de lista com data, motivo e pontos). No histórico, ganhos usam `color.success.fg` e perdas `color.danger.fg`, sempre com o sinal escrito (`+5`, `−10`); a regra de não usar vermelho nem verde vale para o número e a barra do score.
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

## 11. Padrões de tela

### 11.1 Portaria

Objetivo: registrar a entrada em até 2 toques (US-VI-03), também sem internet (US-VI-04).

- **Tela inicial = lista "Esperados hoje"**, já aberta, com a busca fixa no topo (nome, unidade ou bloco) e chips de bloco quando a portaria atende mais de um.
- Cada linha mostra nome em `type.body.lg`, unidade, selo de estado e um **botão grande "Entrada"** (ou "Saída", para quem já entrou) à direita.
- **Toque 1:** "Entrada". **Toque 2 (opcional):** "Desfazer", na mensagem rápida. Não há diálogo de confirmação: o desfazer de 10 s substitui a confirmação e mantém os 2 toques.
- **Visitante sem cadastro:** botão flutuante "Entrada sem cadastro" → nome, unidade e marcação "Autorizado por interfone".
- **Lista de bloqueio (RN-VI-05):** ao buscar ou tocar em "Entrada" para alguém da lista, abre um diálogo bloqueante em tom `danger` com ícone `ban`, o motivo do bloqueio e duas ações: "Não liberar" (primário) e "Liberar mesmo assim" (secundário, pede o motivo). A decisão fica registrada.
- **Divergência ao sincronizar (RN-OF-04):** diálogo bloqueante em tom `warning`: "Carlos Souza entrou às 14h10, mas a visita tinha sido cancelada pelo morador. Ligue para Bloco A · Apto 101 pelo interfone." Ação única: "Confirmei com o morador". O diálogo não tem botão de fechar.
- Faixa "Sem internet" e indicador de sincronização sempre visíveis quando se aplicam (10.10 e 10.23).
- Texto principal de 18 dp, botões de 56 dp e contraste alto, pensando em turnos longos, pouca familiaridade com tecnologia e telas com reflexo.

### 11.2 Limpeza

- **Tela inicial = fila de chamados do setor** em cartões, ordenados por prazo, com o prazo restante ("vence em 3h") e selo `danger` "Fora do prazo" quando vencido.
- Botão "Concluir" visível no cartão, sem abrir o chamado (PRD, seção 9). Concluir abre uma folha curta com foto opcional e o botão "Concluir chamado".
- No detalhe do chamado, o botão secundário "Iniciar atendimento" passa o chamado para "Em atendimento". Ele é opcional: "Concluir" no cartão leva de "Aberto" direto para "Concluído".
- Mesmo comportamento offline da portaria.

### 11.3 Início do morador

- Barra superior com o seletor de unidade e o sino de notificações.
- **Ações rápidas** em grade de 3: "Cadastrar visitante", "Reservar", "Abrir chamado" (todas em até 3 toques, RNF-15).
- Depois, cartões "Para você" na ordem: cobrança em aberto (só para o responsável financeiro), "Para julgar" (só para quem tem reclamação ou recurso a julgar, como síndico, subsíndico e conselho fiscal), encomendas aguardando retirada, votação aberta, reservas próximas, últimos comunicados.
- Cartão "Pesquisa do mês" quando a pesquisa estiver aberta e a pessoa ainda não tiver respondido.

### 11.4 Reservas

1. Lista de áreas em cartões (foto, nome, selo "Paga · R$ 150,00" ou "Gratuita").
2. Calendário e horários da área (10.19 e 4.6).
3. Resumo com regras de cancelamento em destaque ("Cancelamento com reembolso até 12h antes do início") e o botão "Reservar" ou "Reservar e pagar".
4. Para a paga: escolha de Pix (primeira opção, RF-PG-01) ou cartão. O Pix mostra QR Code, botão "Copiar código Pix" e o tempo restante para pagar ("Pague até 14h30 de amanhã ou o horário é liberado").

Ao cancelar depois do prazo de reembolso, o diálogo avisa antes de confirmar (RN-CA-03).

### 11.5 Reclamações

- **Registro:** formulário em etapas curtas: alvo (só um, só do condomínio), categoria (com a gravidade padrão mostrada), descrição, data e foto opcional. Antes de enviar, um aviso `info`: "Quem você indicou não vai saber que foi você. Reclamações falsas podem custar pontos a quem reclama." com link para "Como funciona".
- **Painel do julgador:** lista com filtros por estado e ordenação por data ou score (RF-RS-03). O detalhe mostra o reclamante e o alvo com seus scores, a conversa vinculada e os botões "Validar" e "Negar", desabilitados com explicação até a conversa ser registrada (US-RS-02).
- **Negar:** opções de motivo com os pontos escritos ("Falsa ou de má-fé · −15 pontos para quem reclamou"); motivos com penalidade abrem o campo de justificativa obrigatório.
- **Visão do alvo:** nunca mostra quem reclamou, em nenhuma tela, notificação ou histórico (SEG-07). Mostra a decisão, os pontos e, quando cabe, o botão "Recorrer" com o prazo ("Você pode recorrer até 17/03").

### 11.6 Transparência

Cartões com o score do síndico (componente 10.18 em versão compacta) e a nota de cada setor (média com uma casa decimal e cinco estrelas de leitura). Setor com menos de 2 funcionários avaliados mostra "Nota não publicada este mês" (RN-PE-08). Nenhum outro score individual aparece.

### 11.7 Votações

- Cartão da pauta com pergunta, opções em botões de opção grandes, quórum e prazo ("Votação até o fim da reunião, 20/11 às 21h").
- Confirmação em diálogo com a opção escolhida, porque o voto não pode ser mudado.
- Depois de votar: selo `success` "Seu voto foi registrado". Resultado só aparece após o encerramento (RF-VO-07).
- Unidade em atraso: em vez das opções, uma faixa `warning` visível só ao morador habilitado explica o motivo e mostra o botão "Ver cobranças" (RN-FI-11).

### 11.8 Cobranças

- Lista de cobranças da unidade (só para o responsável financeiro), com valor em `type.title.sm`, vencimento e selo de estado.
- O detalhe mostra o valor atualizado (com multa e juros discriminados quando em atraso) e as formas ativas: Pix, boleto (código de barras com botão "Copiar código") e cartão.
- Depois do pagamento, mensagem `success` e botão "Baixar comprovante".
- O painel de inadimplência (síndico e administradora) fica dentro de "Gestão" e nunca é acessível a outros perfis (SEG-17).

### 11.9 Painel web

Para administradora, suporte e síndico (RF-AC-06), na faixa expandida.

- Navegação lateral com: Visão geral, Unidades e moradores, Funcionários, Áreas e regras, Reclamações, Cobrança, Comunicados, Reuniões, Solicitações, Configurações.
- Telas de lista usam tabela (10.22); telas de cadastro usam formulário de uma coluna com largura máxima de 640.
- Configurações mostram, em cada parâmetro, o padrão da plataforma, o valor do condomínio, a faixa permitida e de onde vem o valor ("Herdado do condomínio").
- No plano Gestão + Suporte, o síndico vê o contador de solicitações antes de enviar ("7 de 10 solicitações usadas este mês. As próximas custam R$ 15,00 cada.") (RN-PL-05).
- Importação por planilha mostra prévia com as linhas com erro destacadas antes de confirmar.

## 12. Navegação por perfil

As abas foram escolhidas para que as tarefas mais frequentes de cada perfil fiquem a um toque.

| Perfil | Abas da navegação inferior |
| --- | --- |
| Morador e subsíndico | Início · Reservas · Visitantes · Chamados · Menu |
| Síndico morador e subsíndico em substituição | Início · Gestão · Reservas · Visitantes · Menu |
| Síndico profissional | Início · Gestão · Comunicados · Chamados · Menu |
| Portaria | Visitantes · Encomendas · Áreas · Menu |
| Limpeza | Chamados · Áreas · Menu |
| Administradora, suporte e admin da plataforma | Web, navegação lateral (11.9) |
| Conselho fiscal | As abas do morador. Reclamações e recursos para julgar aparecem num cartão "Para julgar" no Início e em Menu > Reclamações |
| Proprietário não residente | Sem navegação inferior: entra direto em Cobranças; Menu com Cobranças, Como funciona, Como usar o app, Aparência, Notificações, Privacidade e dados, Sair |

- **Gestão** reúne o que é do síndico: reclamações para julgar, chamados de manutenção, comunicados, reuniões, solicitações de cadastro, inadimplência e substituição.
- **Áreas** (portaria e limpeza) reúne vistorias e registro de não comparecimento (RF-RE-08, RF-RE-09).
- **Menu** reúne, para quem tem: Meu score, Reclamações, Cobranças, Encomendas, Reuniões e votações, Pesquisa do mês, Transparência, Como funciona, Como usar o app, Aparência, Notificações, Privacidade e dados, Sair. Na portaria, o Menu também tem "Abrir chamado" e "Modo treinamento".
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
| Unidade | Apartamento (quando puder ser casa ou sala) |
| Chamado | Ticket, ordem de serviço, pedido |
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
| Situação financeira da unidade | Responsável financeiro (inclusive o proprietário não residente, quando for o responsável financeiro), administradora, síndico (ou subsíndico em substituição) | Votações (o motivo do bloqueio só aparece ao morador habilitado), listas de unidades vistas por moradores, notificações na tela bloqueada |
| Quem reservou | Ninguém no calendário (só "Ocupado") | Calendário e lista de horários |
| Notas individuais da pesquisa | O próprio funcionário, sem saber quem avaliou | Transparência e qualquer tela de morador |
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

| Data | Mudança | Motivo |
| --- | --- | --- |
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
| 04/11/2026 | Diagramas perdidos na conversão para Markdown refeitos: roadmap em Mermaid na Visão de Produto; fluxo e estados da reclamação e estados da reserva em tabelas nas Regras de Negócio e em Mermaid no User Flows — CondomiFacil | Pendência resolvida; saiu da lista de pendências |

**Pendência fora deste documento:** o logotipo definitivo depende de um trabalho de identidade visual.

## 19. Rastreabilidade

| Seção deste documento | Requisitos e regras |
| --- | --- |
| 2. Princípios | Princípios da Visão de Produto, RNF-15 |
| 4. Cores | PRD seção 9, RNF-12, RF-AC-05 |
| 4.5 Estados | RN 5.5, 7.4, 8.3, 9.1, 9.2, 12.2 |
| 4.6 Calendário | RF-RE-01, RF-RE-06, RN-RE-05, RN-RE-06, RN-RE-08, RN-SC-09, RN-SC-10, RN-FI-12, US-RE-01, US-RE-05 |
| 5. Tipografia | RNF-02, RNF-04, RNF-12, RNF-14 |
| 6.2 Áreas de toque | RNF-12 |
| 9. Movimento | PRD seção 9 (poucas animações), RNF-02 |
| 10.4 Código de verificação | RF-AC-01, RF-AC-03, RN-CD-02, US-AC-01 |
| 10.10 Faixa de aviso | RF-VI-05, RF-VI-12, RN-CD-03, RNF-06, US-VI-04, US-VI-06 |
| 10.16 Seletor de unidade | RF-AC-04, RN-CD-05, US-AC-05 |
| 10.17 Estrelas | RF-PE-01, RN-PE-03, RN-PE-04, US-PE-01 |
| 10.18 Score | RF-RS-10 a RF-RS-12, RN-SC-01, RN-SC-08, RN-SC-09, US-RS-06 |
| 10.22 Tabela | RF-AC-06, US-AC-06 |
| 10.23 Sincronização | RNF-06 a RNF-08, RN-OF-02, RN-OF-03 |
| 10.24 Onboarding | RF-AC-08, US-AC-03 |
| 11.1 Portaria | RF-VI-04 a RF-VI-12, RN-VI-04, RN-VI-05, RN-OF-01 a RN-OF-04, US-VI-03 a US-VI-06 |
| 11.2 Limpeza | RF-CH-02, RF-CH-03, RN-CH-04, RN-CH-06, US-CH-02 |
| 11.4 Reservas | RF-RE-01 a RF-RE-05, RF-PG-01, RN-RE-03, RN-CA-02, RN-CA-03, US-RE-02 a US-RE-04 |
| 11.5 Reclamações | RF-RS-01 a RF-RS-09, RN-RC-01 a RN-RC-07, SEG-07, US-RS-01 a US-RS-05 |
| 11.6 Transparência | RF-RS-12, RF-PE-04, RN-PE-08, US-RS-07 |
| 11.7 Votações | RF-VO-02, RF-VO-07, RN-VO-03, RN-VO-16, RN-FI-11 |
| 11.8 Cobranças | RF-FI-07 a RF-FI-13, RN-FI-08, RN-FI-10, SEG-17, US-FI-03, US-FI-05 |
| 11.9 Painel web | RF-AC-06, RF-AD-01, RF-AD-16, RN-PL-05, Regras de Negócio seção 13 |
| 12. Navegação | RF-AC-05, RF-AC-07, RF-RE-08, RF-RE-09, RNF-15, RN-CD-19 |
| 13. Escrita | RNF-14, glossário das Regras de Negócio |
| 14. Acessibilidade | RNF-12 |
| 15. Privacidade | RN-SC-02, RN-RC-01, RN-RE-05, RN-PE-09, RN-FI-10, RN-FI-11, RN-CD-19, SEG-07, SEG-17 |
| 16. Desempenho | RNF-02, RNF-04 |
