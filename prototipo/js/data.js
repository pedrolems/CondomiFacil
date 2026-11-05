/* Dados fictícios do protótipo (em memória). */
'use strict';
let savedTheme = 'system';
try { savedTheme = localStorage.getItem('cf-theme') || 'system'; } catch (e) {}

const S = {
  theme: savedTheme, online: true, syncing: false, pending: [], lastSync: '14h32', training: false, termsPending: false,
  user: { nome: 'Ana Lima', email: 'ana.lima@email.com' },
  unit: 0,
  units: [{ cond: 'Residencial Jardim Azul', name: 'Bloco A · Apto 101' }, { cond: 'Residencial Jardim Azul', name: 'Bloco B · Apto 302' }],
  score: 78, atraso: false,
  // Locação (RN-CD-20 a RN-CD-26): o morador pode ser simulado como inquilino; a proprietária Helena acompanha o Bloco B · Apto 302
  inquilino: false, contratoFim: '05/12/2026', contratoDias: 30,
  prop: {
    nome: 'Helena Duarte', un: 'Bloco B · Apto 302', desocupada: false, temporada: false, venceLogo: false,
    inq: { nome: 'Marina Souza', ini: '01/02/2025', fim: '31/01/2027', dias: 87, dependentes: ['Theo Souza'] },
    resp: { ord: 'Marina Souza · inquilina', ext: 'Helena Duarte · proprietária' },
    ocorrencias: [
      { id: 'o1', cat: 'Barulho', data: '12/10', decisao: 'Validada · leve', multa: null },
      { id: 'o2', cat: 'Vaga de garagem', data: '02/09', decisao: 'Validada · leve · multa por infração', multa: 95 },
    ],
    pedidos: [{ id: 'q1', tipo: 'Renovação do contrato', det: 'Marina Souza · até 31/01/2028', estado: 'Concluída', data: '15/01' }],
    hospedes: [],
  },
  scoreHist: [
    { d: '01/11', t: 'Pesquisa mensal: boa convivência', p: +5 },
    { d: '12/10', t: 'Reclamação validada: barulho após as 22h', p: -10 },
    { d: '01/10', t: 'Recuperação trimestral', p: +5 },
    { d: '15/08', t: 'Reserva sem comparecimento (2 no trimestre)', p: -5 },
  ],
  areas: [
    { id: 'salao', nome: 'Salão de festas', paga: true, valor: 150, cap: 'Até 80 pessoas', ico: 'party-popper' },
    { id: 'churrasqueira', nome: 'Churrasqueira', paga: false, valor: 0, cap: 'Até 20 pessoas', ico: 'flame' },
    { id: 'quadra', nome: 'Quadra poliesportiva', paga: false, valor: 0, cap: 'Até 12 pessoas', ico: 'volleyball' },
    { id: 'gourmet', nome: 'Espaço gourmet', paga: true, valor: 90, cap: 'Até 30 pessoas', ico: 'chef-hat' },
  ],
  reservas: [
    { id: 'r1', area: 'churrasqueira', dia: '15/11', hora: '12h às 16h', estado: 'Confirmada', valor: 0 },
    { id: 'r2', area: 'salao', dia: '22/11', hora: '18h às 23h', estado: 'Aguardando pagamento', valor: 150, prazo: '14h30 de amanhã' },
    { id: 'r3', area: 'quadra', dia: '02/11', hora: '9h às 10h', estado: 'Realizada', valor: 0 },
    { id: 'r4', area: 'gourmet', dia: '18/10', hora: '19h às 23h', estado: 'Cancelada com reembolso', valor: 90 },
  ],
  visitantes: [
    { id: 'v1', nome: 'Carlos Souza', doc: '', tipo: 'avulso', quando: 'Hoje', estado: 'Esperado' },
    { id: 'v2', nome: 'Maria Oliveira', doc: 'RG 12.345.678-9', tipo: 'recorrente', quando: 'Seg, Qua e Sex · 8h às 12h', estado: 'Esperado', sub: 'Diarista' },
    { id: 'v3', nome: 'João Pereira', doc: '', tipo: 'avulso', quando: 'Ontem', estado: 'Saiu' },
    { id: 'v4', nome: 'Beatriz Santos', doc: '', tipo: 'avulso', quando: '01/11', estado: 'Não compareceu' },
  ],
  chamados: [
    { id: 'c1', tipo: 'limpeza', cat: 'Área comum suja', local: 'Piscina', desc: 'Folhas e copos na borda da piscina depois do fim de semana.', estado: 'Aberto', aberto: 'há 3 horas', prazo: 'vence em 21h', autor: 'Bloco A · Apto 101', fora: false, mine: true },
    { id: 'c2', tipo: 'manutencao', cat: 'Elétrica', local: 'Garagem, vaga 14', desc: 'Lâmpada queimada perto da vaga 14, a garagem fica escura à noite.', estado: 'Orçamento', aberto: 'há 2 dias', autor: 'Bloco A · Apto 101', empresa: 'Eletro Rápida', mine: true },
    { id: 'c3', tipo: 'limpeza', cat: 'Lixo acumulado', local: 'Lixeira do Bloco B', desc: 'Sacos de lixo fora do contêiner.', estado: 'Aberto', aberto: 'há 26 horas', prazo: 'venceu há 2h', autor: 'Portaria', fora: true },
    { id: 'c4', tipo: 'limpeza', cat: 'Derramamento', local: 'Hall do Bloco A', desc: 'Líquido derramado perto do elevador social.', estado: 'Em atendimento', aberto: 'há 1 hora', prazo: 'vence em 23h', autor: 'Bloco A · Apto 204', fora: false },
    { id: 'c5', tipo: 'manutencao', cat: 'Hidráulica', local: 'Bloco B, 3º andar', desc: 'Vazamento no teto do corredor.', estado: 'Aberto', aberto: 'há 3 dias', autor: 'Bloco B · Apto 302', fora: true },
    { id: 'c6', tipo: 'manutencao', cat: 'Portão', local: 'Portão da garagem', desc: 'Portão demora para fechar e faz barulho.', estado: 'Agendado', aberto: 'há 5 dias', autor: 'Portaria', empresa: 'Portões Silva', agenda: '06/11 às 9h' },
    { id: 'c7', tipo: 'limpeza', cat: 'Área comum suja', local: 'Salão de festas', desc: 'Limpeza depois do evento.', estado: 'Concluído', aberto: 'ontem', autor: 'Bloco A · Apto 101', mine: true, concluido: 'ontem às 16h' },
  ],
  empresas: [{ nome: 'Eletro Rápida', serv: 'Elétrica', tel: '(11) 4002-1010' }, { nome: 'Portões Silva', serv: 'Portões e automação', tel: '(11) 3333-2020' }, { nome: 'HidroFix', serv: 'Hidráulica', tel: '(11) 98888-3030' }],
  minhasRecl: [
    { id: 'm1', papel: 'reclamante', alvo: 'Bloco C · Apto 504', cat: 'Barulho', estado: 'Em conversa com o alvo', data: '02/11' },
    { id: 'm2', papel: 'alvo', cat: 'Barulho após as 22h', estado: 'Validada', data: '12/10', pontos: -10, recorrerAte: '19/10', recorrivel: false },
    { id: 'm3', papel: 'alvo', cat: 'Uso indevido de vaga', estado: 'Validada', data: '01/11', pontos: -5, recorrerAte: '08/11', recorrivel: true },
  ],
  julgar: [
    { id: 'j1', estado: 'Aberta', cat: 'Barulho', grav: 'Média · −10', desc: 'Música alta todas as sextas depois da meia-noite.', data: '02/11', reclamante: { nome: 'Ana Lima', un: 'Bloco A · Apto 101', score: 78 }, alvo: { nome: 'Rafael Costa', un: 'Bloco C · Apto 504', score: 85 }, conversa: false, resposta: null, liberaEm: '07/11' },
    { id: 'j2', estado: 'Em conversa com o alvo', cat: 'Animal sem coleira', grav: 'Leve · −5', desc: 'Cachorro solto no playground.', data: '28/10', reclamante: { nome: 'Pedro Alves', un: 'Bloco B · Apto 101', score: 92 }, alvo: { nome: 'Luiza Prado', un: 'Bloco A · Apto 303', score: 70 }, conversa: true, resposta: 'O portão do apartamento abriu sozinho, já consertei. Peço desculpas.', liberaEm: '02/11' },
    { id: 'j4', estado: 'Aberta', cat: 'Conduta do síndico', grav: 'Média · −10', desc: 'O síndico não respondeu os pedidos de conserto do interfone do Bloco C, feitos há três semanas.', data: '03/11', reclamante: { nome: 'Rafael Costa', un: 'Bloco C · Apto 504', score: 85 }, alvo: { nome: 'Pedro Alves', un: 'Síndico · Bloco B · Apto 101', score: 72 }, conversa: false, resposta: null, liberaEm: '08/11', contraSindico: true },
    { id: 'j3', estado: 'Em recurso', cat: 'Atendimento na portaria', grav: 'Média · −10', desc: 'Porteiro não registrou visita e deixou o visitante esperando 40 minutos.', data: '20/10', reclamante: { nome: 'Carla Mendes', un: 'Bloco B · Apto 202', score: 88 }, alvo: { nome: 'José Ribeiro', un: 'Portaria', score: 81 }, conversa: true, resposta: 'O sistema estava sem internet e o interfone com defeito.', liberaEm: '25/10' },
  ],
  cobrancas: [
    { id: 'b1', ref: 'Novembro de 2026', valor: 620, venc: '10/11', estado: 'Emitida', tipo: 'Ordinária' },
    { id: 'b2', ref: 'Outubro de 2026', valor: 620, venc: '10/10', estado: 'Paga', pago: '08/10', tipo: 'Ordinária' },
    { id: 'b3', ref: 'Fundo de obras (extra)', valor: 180, venc: '10/10', estado: 'Paga com atraso', pago: '16/10', tipo: 'Extraordinária' },
    { id: 'b4', ref: 'Setembro de 2026', valor: 620, venc: '10/09', estado: 'Paga', pago: '05/09', tipo: 'Ordinária' },
  ],
  // Cobranças do Bloco B · Apto 302 vistas pela proprietária: as extraordinárias são dela; as ordinárias, da inquilina (RN-FI-03, RN-FI-10)
  cobrancasProp: [
    { id: 'h1', ref: 'Fundo de obras · parcela 2 de 3', valor: 180, venc: '10/12', estado: 'Emitida', tipo: 'Extraordinária' },
    { id: 'h2', ref: 'Novembro de 2026', valor: 620, venc: '10/11', estado: 'Emitida', tipo: 'Ordinária', inq: true },
    { id: 'h3', ref: 'Multa por infração: vaga de garagem', valor: 95, venc: '10/10', estado: 'Paga', pago: '09/10', tipo: 'Ordinária', inq: true },
    { id: 'h4', ref: 'Fundo de obras · parcela 1 de 3', valor: 180, venc: '10/11', estado: 'Paga', pago: '03/11', tipo: 'Extraordinária' },
    { id: 'h5', ref: 'Outubro de 2026', valor: 620, venc: '10/10', estado: 'Paga', pago: '07/10', tipo: 'Ordinária', inq: true },
  ],
  encomendas: [
    { id: 'e1', un: 'Bloco A · Apto 101', rem: 'Amazon', data: 'Hoje, 10h12', estado: 'Recebida', foto: true },
    { id: 'e2', un: 'Bloco A · Apto 101', rem: 'Mercado Livre', data: '03/11', estado: 'Recebida' },
    { id: 'e3', un: 'Bloco B · Apto 302', rem: 'Correios', data: '02/10', estado: 'Prazo vencido' },
    { id: 'e4', un: 'Bloco A · Apto 204', rem: 'Shopee', data: '01/11', estado: 'Retirada', quem: 'Paulo Lima' },
    { id: 'e5', un: 'Bloco C · Apto 504', rem: 'Magalu', data: 'Hoje, 9h40', estado: 'Recebida' },
  ],
  comunicados: [
    { id: 'k1', titulo: 'Manutenção da piscina', txt: 'A piscina fica fechada de 10 a 12/11 para troca do filtro. Reservas da área nesse período foram canceladas com reembolso integral.', data: 'hoje', publico: 'Moradores', lidos: 46, total: 120, novo: true },
    { id: 'k2', titulo: 'Assembleia geral ordinária', txt: 'Convocação para 20/11 às 19h no salão de festas. Pautas: previsão orçamentária de 2027 e pintura da fachada.', data: 'há 3 dias', publico: 'Todos', lidos: 98, total: 134 },
    { id: 'k3', titulo: 'Sobre a vaga 14', txt: 'Olá, Ana. Recebemos uma reclamação sobre o uso da vaga 14. Pode nos contar o que aconteceu?', data: '01/11', publico: 'Individual', individual: true, resposta: null },
  ],
  reunioes: [
    { id: 'g1', titulo: 'Assembleia geral ordinária', data: '20/11 às 19h', local: 'Salão de festas', estado: 'Votação aberta', pautas: [
      { id: 'p1', q: 'Aprovar a previsão orçamentária de 2027?', tipo: 'votacao', opcoes: ['Aprovar', 'Reprovar', 'Abster-se'], quorum: 'Maioria simples dos presentes', voto: null, res: [62, 12, 6], extra: false },
      { id: 'p2', q: 'Aprovar a pintura da fachada com rateio de R$ 300 por unidade?', tipo: 'votacao', opcoes: ['Aprovar', 'Reprovar', 'Abster-se'], quorum: '2/3 das unidades', voto: null, res: [41, 30, 9], extra: true },
      { id: 'p3', q: 'Prestação de contas do 3º trimestre', tipo: 'informativa' },
    ] },
    { id: 'g2', titulo: 'Eleição de síndico e subsíndico 2027–2028', data: 'Candidaturas até 15/11', local: 'Online e no salão de festas', estado: 'Candidaturas abertas', eleicao: true, pautas: [] },
    { id: 'g3', titulo: 'Assembleia extraordinária: obras da garagem', data: '15/09 às 19h', local: 'Salão de festas', estado: 'Encerrada', pautas: [{ id: 'p9', q: 'Aprovar a reforma da garagem?', tipo: 'votacao', opcoes: ['Aprovar', 'Reprovar'], quorum: 'Maioria simples', voto: 'Aprovar', votoProp: 'Aprovar', res: [71, 18], encerrada: true, extra: true }] },
  ],
  pesquisa: { mes: 'Novembro', fecha: '30/11', setores: [
    { nome: 'Portaria', funcs: [{ id: 'f1', nome: 'José Ribeiro', turno: 'Diurno' }, { id: 'f2', nome: 'Antônio Melo', turno: 'Noturno' }] },
    { nome: 'Limpeza', funcs: [{ id: 'f3', nome: 'Sandra Rocha' }, { id: 'f4', nome: 'Rita Farias' }] },
    { nome: 'Manutenção', funcs: [{ id: 'f5', nome: 'Marcelo Dias' }] },
  ], notas: {}, respondida: false },
  transp: { sindico: 72, setores: [{ nome: 'Portaria', nota: 4.3 }, { nome: 'Limpeza', nota: 3.7 }, { nome: 'Manutenção', nota: null }] },
  notif: { reservas: true, visitantes: true, encomendas: true, chamados: true, comunicados: true, votacoes: true, cobrancas: true, pesquisa: false },
  // Portaria
  esperados: [
    { id: 'x1', nome: 'Carlos Souza', un: 'Bloco A · Apto 101', bloco: 'A', estado: 'Esperado', cancelado: true },
    { id: 'x2', nome: 'Maria Oliveira', un: 'Bloco A · Apto 101', bloco: 'A', estado: 'Esperado', rec: 'Seg, Qua e Sex · 8h às 12h' },
    { id: 'x3', nome: 'Fernando Lopes', un: 'Bloco B · Apto 302', bloco: 'B', estado: 'Entrou', hora: '9h05' },
    { id: 'x4', nome: 'Marcos Vieira', un: 'Bloco B · Apto 504', bloco: 'B', estado: 'Esperado', bloqueio: 'Ameaçou o porteiro em 12/09. Entrada bloqueada pela administradora.' },
    { id: 'x5', nome: 'Juliana Reis', un: 'Bloco B · Apto 101', bloco: 'B', estado: 'Esperado', fora: 'Cadastrada para terças, das 14h às 18h.' },
    { id: 'x6', nome: 'Técnico da Vivo', un: 'Bloco A · Apto 204', bloco: 'A', estado: 'Saiu', hora: '8h40' },
  ],
  vistorias: [
    { id: 'w1', area: 'Churrasqueira', un: 'Bloco A · Apto 204', fim: 'Hoje, 16h', estado: 'Pendente', paga: false },
    { id: 'w2', area: 'Salão de festas', un: 'Bloco C · Apto 504', fim: 'Ontem, 23h', estado: 'Pendente', paga: true },
    { id: 'w3', area: 'Quadra poliesportiva', un: 'Bloco B · Apto 302', fim: '03/11, 10h', estado: 'Realizada', paga: false },
  ],
  // Gestão
  solicitacoes: [
    { id: 's1', tipo: 'Incluir morador', det: 'Lucas Lima · Bloco A · Apto 101 · dependente', estado: 'Pendente', data: '04/11', por: 'Síndico' },
    { id: 's2', tipo: 'Alterar dados', det: 'Telefone de Rafael Costa · Bloco C · Apto 504', estado: 'Concluída', data: '30/10', por: 'Síndico' },
    { id: 's3', tipo: 'Remover funcionário', det: 'Pedro Gomes · Portaria', estado: 'Recusada', motivo: 'Desligamento já registrado em 20/10.', data: '21/10', por: 'Síndico' },
    { id: 's4', tipo: 'Cadastrar inquilino', det: 'Bloco C · Apto 102 · Diego Ramos · contrato de 01/12/2026 a 30/11/2027', estado: 'Pendente', data: '05/11', por: 'Proprietária Sílvia Nunes' },
  ],
  franquia: { usadas: 7, total: 10 },
  inad: [
    { un: 'Bloco C · Apto 504', resp: 'Rafael Costa', valor: 1284.4, dias: 26, cobr: 2 },
    { un: 'Bloco B · Apto 202', resp: 'Carla Mendes', valor: 632.4, dias: 26, cobr: 1 },
    { un: 'Bloco A · Apto 303', resp: 'Luiza Prado', valor: 627.0, dias: 9, cobr: 1 },
  ],
  substituicao: false,
  rascunhos: [   // sugestões de comunicado da subsíndica (RN-CO-05)
    { id: 'r1', titulo: 'Limpeza da caixa d’água', txt: 'No sábado, 14/11, das 8h às 12h, a água do Bloco B fica desligada para a limpeza semestral da caixa d’água. Deixe água separada.', publico: 'Moradores', estado: 'Aguardando o síndico', data: '04/11' },
    { id: 'r2', titulo: 'Horário da academia', txt: 'A academia passa a abrir às 6h a partir de dezembro.', publico: 'Moradores', estado: 'Enviado pelo síndico', data: '22/10' },
  ],
  // Administradora
  condo: 0,
  condos: [{ nome: 'Residencial Jardim Azul', unidades: 120, plano: 'Gestão + Suporte' }, { nome: 'Edifício Solar das Flores', unidades: 48, plano: 'Gestão' }, { nome: 'Condomínio Vila Verde', unidades: 86, plano: 'Gestão' }],
  moradores: [
    { nome: 'Ana Lima', un: 'Bloco A · Apto 101', papel: 'Morador habilitado · Responsável financeiro', email: 'ana.lima@email.com', ativo: true },
    { nome: 'Lucas Lima', un: 'Bloco A · Apto 101', papel: 'Dependente', email: 'lucas.lima@email.com', ativo: true },
    { nome: 'Pedro Alves', un: 'Bloco B · Apto 101', papel: 'Morador habilitado · Síndico', email: 'pedro.alves@email.com', ativo: true },
    { nome: 'Carla Mendes', un: 'Bloco B · Apto 202', papel: 'Morador habilitado · Subsíndica', email: 'carla.m@email.com', ativo: true },
    { nome: 'Rafael Costa', un: 'Bloco C · Apto 504', papel: 'Morador habilitado', email: 'rafa.costa@email.com', ativo: true },
    { nome: 'Marina Souza', un: 'Bloco B · Apto 302', papel: 'Inquilina · Morador habilitado · Responsável pelas ordinárias', email: 'marina.s@email.com', ativo: true },
    { nome: 'Helena Duarte', un: 'Bloco B · Apto 302', papel: 'Proprietária não residente · Responsável pelas extraordinárias', email: 'helena.d@email.com', ativo: true },
    { nome: 'Sílvia Nunes', un: 'Bloco C · Apto 102', papel: 'Proprietária não residente · Unidade desocupada', email: 'silvia.n@email.com', ativo: true },
    { nome: 'Luiza Prado', un: 'Bloco A · Apto 303', papel: 'Morador habilitado · Conselho fiscal', email: 'luiza.prado@email.com', ativo: true },
  ],
  funcionarios: [
    { nome: 'José Ribeiro', setor: 'Portaria', portaria: 'Portaria principal (Blocos A e B)', ativo: true, score: 81 },
    { nome: 'Antônio Melo', setor: 'Portaria', portaria: 'Portaria principal (Blocos A e B)', ativo: true, score: 90 },
    { nome: 'Sandra Rocha', setor: 'Limpeza', ativo: true, score: 74 },
    { nome: 'Rita Farias', setor: 'Limpeza', ativo: true, score: 88 },
    { nome: 'Marcelo Dias', setor: 'Manutenção', ativo: true, score: 79 },
  ],
  bloqueados: [{ nome: 'Marcos Vieira', doc: 'RG 22.111.333-4', motivo: 'Ameaçou o porteiro em 12/09.', desde: '12/09' }],
  cobrancaCfg: { ativo: true, pix: true, boleto: true, cartao: false, valor: 620, venc: 10, multa: 2, juros: 1, desconto: 0, bloqueioReserva: true },
  params: [
    { k: 'Cancelamento com reembolso', v: 12, un: 'horas antes', pad: 12, min: 0, max: 168, herd: false },
    { k: 'Antecedência mínima da reserva', v: 24, un: 'horas', pad: 24, min: 0, max: 720, herd: true },
    { k: 'Antecedência máxima da reserva', v: 60, un: 'dias', pad: 60, min: 1, max: 365, herd: true },
    { k: 'Reservas por unidade, por área, por mês', v: 2, un: 'reservas', pad: 2, min: 1, max: 10, herd: true },
    { k: 'Prazo para pagar reserva', v: 24, un: 'horas', pad: 24, min: 1, max: 72, herd: true },
    { k: 'Score mínimo para reservas gratuitas', v: 60, un: 'pontos', pad: 60, min: 0, max: 100, herd: true },
    { k: 'Prazo de resposta do alvo da reclamação', v: 5, un: 'dias', pad: 5, min: 1, max: 15, herd: true },
    { k: 'Prazo do chamado de limpeza', v: 24, un: 'horas', pad: 24, min: 1, max: 72, herd: true },
    { k: 'Guarda de encomendas', v: 30, un: 'dias', pad: 30, min: 7, max: 90, herd: true },
  ],
  mandatos: [
    { cargo: 'Síndico', nome: 'Pedro Alves', un: 'Bloco B · Apto 101', ini: '01/01/2025', fim: '31/12/2026' },
    { cargo: 'Subsíndica', nome: 'Carla Mendes', un: 'Bloco B · Apto 202', ini: '01/01/2025', fim: '31/12/2026' },
    { cargo: 'Conselho fiscal', nome: 'Luiza Prado', un: 'Bloco A · Apto 303', ini: '01/01/2025', fim: '31/12/2026' },
  ],
  importRows: [
    { l: 2, nome: 'Ana Lima', email: 'ana.lima@email.com', un: 'A-101', perfil: 'Morador', ok: true },
    { l: 3, nome: 'Lucas Lima', email: 'lucas.lima@email.com', un: 'A-101', perfil: 'Morador', ok: true },
    { l: 4, nome: 'Bruno Teixeira', email: 'ana.lima@email.com', un: 'A-102', perfil: 'Morador', ok: false, erro: 'E-mail repetido (linha 2)' },
    { l: 5, nome: 'Paula Nunes', email: 'paula.n@email.com', un: 'D-101', perfil: 'Morador', ok: false, erro: 'Unidade D-101 não existe' },
    { l: 6, nome: 'José Ribeiro', email: 'jose.r@email.com', un: '', perfil: 'Portaria', ok: true },
    { l: 7, nome: '', email: 'sem.nome@email.com', un: 'B-303', perfil: 'Morador', ok: false, erro: 'Nome é obrigatório' },
  ],
  implStep: 1,
};

const ADMIN_NAV = [
  ['visao-geral', 'Visão geral', 'layout-dashboard'], ['implantacao', 'Implantação', 'rocket'], ['unidades', 'Unidades e moradores', 'house'],
  ['funcionarios', 'Funcionários', 'id-card'], ['areas', 'Áreas e regras', 'calendar-days'], ['reclamacoes', 'Reclamações', 'message-square-warning'],
  ['cobranca', 'Cobrança', 'receipt'], ['comunicados', 'Comunicados', 'megaphone'], ['reunioes', 'Reuniões e mandatos', 'vote'],
  ['solicitacoes', 'Solicitações', 'inbox'], ['bloqueio', 'Lista de bloqueio', 'ban'], '-', ['configuracoes', 'Configurações', 'settings'],
];

const HUB = [
  { p: 'acesso', t: 'Acesso e conta', s: 'Todos os perfis · fluxos 3.1 a 3.3', f: ['Primeiro acesso com código de 6 dígitos', 'Login, conta pausada e recuperação de senha', 'Aceite de termos e onboarding', 'Novo aceite de termos'] },
  { p: 'morador', t: 'Morador', s: 'App · Início, Reservas, Visitantes, Chamados, Menu', f: ['Reserva gratuita e paga (Pix e cartão), cancelamento', 'Visitantes avulsos e recorrentes', 'Chamados, reclamações, recurso e score', 'Cobranças, votações, pesquisa mensal e transparência', 'Simulação de inquilino: voto em pauta sem despesa extraordinária', 'Comunicados, encomendas, aparência e LGPD'] },
  { p: 'sindico', t: 'Síndico', s: 'App · Início, Gestão, Reservas, Visitantes, Menu', f: ['Julgar reclamações (conversa antes de decidir)', 'Acompanhar manutenção e empresas', 'Comunicados gerais e individuais', 'Convocar reunião, votos presenciais e resultado', 'Solicitações de cadastro, inadimplência e substituição'] },
  { p: 'subsindico', t: 'Subsíndico', s: 'App · Início, Gestão, Reservas, Visitantes, Menu', f: ['Gestão enxuta no dia a dia', 'Julga reclamações contra o síndico', 'Acompanha a manutenção, sem avançar o status', 'Sugere comunicados que o síndico revisa e envia', 'Registra votos presenciais e vê encomendas vencidas', 'Na substituição, todas as funções de síndico'] },
  { p: 'admin', t: 'Administradora', s: 'Painel web · navegação lateral', f: ['Implantação: estrutura, conta bancária e planilha', 'Unidades, moradores, mudanças e funcionários', 'Áreas, regras e parâmetros com faixa permitida', 'Cobrança, cobranças extras e inadimplência', 'Reclamações, mandatos, solicitações e bloqueio'] },
  { p: 'portaria', t: 'Funcionário · Portaria', s: 'App · Visitantes, Encomendas, Áreas, Menu', f: ['Entrada em 1 toque com Desfazer', 'Lista de bloqueio e fora do horário', 'Sem internet, fila e divergência ao sincronizar', 'Encomendas, vistorias e modo treinamento'] },
  { p: 'limpeza', t: 'Funcionário · Limpeza', s: 'App · Chamados, Áreas, Menu', f: ['Fila do setor por prazo, com Concluir no cartão', 'Iniciar atendimento no detalhe', 'Conclusão sem internet', 'Vistoria e não comparecimento'] },
  { p: 'manutencao', t: 'Funcionário · Manutenção', s: 'Proposta · não previsto no PRD', f: ['Fila de chamados de manutenção atribuídos', 'Agenda de visitas', 'Atualizar andamento e concluir com foto', 'Hoje o PRD prevê só empresas cadastradas pelo síndico'] },
  { p: 'proprietario', t: 'Proprietário não residente', s: 'App · Unidade, Cobranças, Assembleias, Menu', f: ['Unidade alugada: contrato, inquilino e pedidos à administradora', 'Paga as extraordinárias; vê as ordinárias do inquilino', 'Vota nas assembleias e indica procurador', 'Ocorrências validadas contra a unidade, sem ver a rotina do inquilino', 'Unidade desocupada e hóspede de temporada'] },
];
