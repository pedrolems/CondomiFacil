/* Dados fictícios do protótipo (em memória). */
'use strict';
let savedTheme = 'system';
try { savedTheme = localStorage.getItem('cf-theme') || 'system'; } catch (e) {}

const S = {
  autogestao: { ativa: false, registros: [] },
  eleitoral: { sindico: true, sub: true, conselho: true, designado: false },
  complementacao: {
    auditoria: [], denuncias: [{ id: 'dn1', destinatario: 'sindico', conteudo: 'Texto ofensivo em mensagem de área comum (projeção sem identidades protegidas).', motivo: 'Linguagem ofensiva', resultado: null }, { id: 'dn2', destinatario: 'subsindico', conteudo: 'Conteúdo atribuído à gestão, encaminhado ao julgador alternativo (projeção protegida).', motivo: 'Ofensa pessoal', resultado: null }],
    recebimentos: [], exportacoes: [], eleicao: { estado: 'Não aberta', turno: 1, motivo: '', contagens: null },
    casoOriginal: { saldo: 0, perdaEfetiva: 3, revertido: false, habilitadoTrocado: false, julgadorVigente: true },
    assinatura: { ciclo: 'novembro de 2026', valor: 499, estado: 'Aguardando tratamento', motivo: '' }
  },
  theme: savedTheme, online: true, syncing: false, pending: [], lastSync: '14h32', training: false, termsPending: false,
  user: { nome: 'Ana Lima', email: 'ana.lima@email.com' }, conselho: false,
  unit: 0,
  units: [{ cond: 'Residencial Jardim Azul', name: 'Bloco A · Apto 101' }, { cond: 'Residencial Jardim Azul', name: 'Bloco B · Apto 302' }],
  atraso: false,
  scoresMoradia: [{ valor: 80, base: 80, recuperaEm: '12/12/2026', historico: [
    { d: '12/10', t: 'Recuperação após 2 meses de regularidade', p: +5 },
    { d: '12/08', t: 'Reclamação validada: uso indevido de área comum', p: -10 },
    { d: '01/07', t: 'Reclamação negada como falsa', p: -15 },
  ] }, { valor: 100, base: 100, recuperaEm: '05/01/2027', historico: [
    { d: '05/11', t: 'Novo vínculo de moradia nesta unidade: início em 100', p: 0 },
  ] }],
  scoresFuncionais: {
    portaria: { valor: 81, base: 81, recuperaEm: '01/01/2027', historico: [{ d: '01/11', t: 'Recuperação funcional neste condomínio', p: +5 }] },
    limpeza: { valor: 74, base: 74, recuperaEm: '01/01/2027', historico: [{ d: '31/10', t: 'Pesquisa mensal neste condomínio', p: -5 }] },
    manutencao: { valor: 79, base: 79, recuperaEm: '01/01/2027', historico: [] },
  },
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
  areas: [
    { id: 'salao', nome: 'Salão de festas', paga: true, valor: 150, cap: 'Até 80 pessoas', ico: 'party-popper' },
    { id: 'churrasqueira', nome: 'Churrasqueira', paga: false, valor: 0, cap: 'Até 20 pessoas', ico: 'flame' },
    { id: 'quadra', nome: 'Quadra poliesportiva', paga: false, valor: 0, cap: 'Até 12 pessoas', ico: 'volleyball' },
    { id: 'gourmet', nome: 'Espaço gourmet', paga: true, valor: 90, cap: 'Até 30 pessoas', ico: 'chef-hat' },
  ],
  reservas: [
    { id: 'r1', area: 'churrasqueira', dia: '15/11', hora: '12h às 16h', estado: 'Confirmada', valor: 0 },
    { id: 'r2', area: 'salao', dia: '22/11', hora: '18h às 23h', estado: 'Aguardando pagamento', valor: 150, prazo: '14h30 de amanhã' },
    { id: 'r3', area: 'quadra', dia: '02/11', hora: '9h às 10h', estado: 'Cumprida', valor: 0 },
    { id: 'r4', area: 'gourmet', dia: '18/10', hora: '19h às 23h', estado: 'Cancelada com reembolso', valor: 90 },
    { id: 'r5', area: 'churrasqueira', dia: '05/11', hora: '12h às 16h', estado: 'Confirmada', valor: 0 },
  ],
  visitantes: [
    { id: 'v1', nome: 'Carlos Souza', doc: '', tipo: 'avulso', quando: 'Hoje', estado: 'Esperado' },
    { id: 'v2', nome: 'Maria Oliveira', doc: 'RG 12.345.678-9', tipo: 'recorrente', quando: 'Seg, Qua e Sex · 8h às 12h', estado: 'Esperado', sub: 'Diarista' },
    { id: 'v3', nome: 'João Pereira', doc: '', tipo: 'avulso', quando: 'Ontem', estado: 'Saiu' },
    { id: 'v4', nome: 'Beatriz Santos', doc: '', tipo: 'avulso', quando: '01/11', estado: 'Não compareceu' },
  ],
  chamados: [
    { id: 'c1', urg: 'leve', abertoEm: '2026-11-05T11:20', tipo: 'limpeza', cat: 'Área comum suja', local: 'Piscina', desc: 'Folhas e copos na borda da piscina depois do fim de semana.', estado: 'Aberto', aberto: 'há 3 horas', prazo: 'vence em 21h', autor: 'Bloco A · Apto 101', fora: false, mine: true },
    { id: 'c2', urg: 'media', abertoEm: '2026-11-03T09:40', tipo: 'manutencao', cat: 'Elétrica', local: 'Garagem, vaga 14', desc: 'Lâmpada queimada perto da vaga 14, a garagem fica escura à noite.', estado: 'Orçamento', aberto: 'há 2 dias', autor: 'Bloco A · Apto 101', empresa: 'Eletro Rápida', mine: true },
    { id: 'c3', urg: 'media', abertoEm: '2026-11-04T12:10', tipo: 'limpeza', cat: 'Lixo acumulado', local: 'Lixeira do Bloco B', desc: 'Sacos de lixo fora do contêiner.', estado: 'Aberto', aberto: 'há 26 horas', prazo: 'venceu há 2h', autor: 'Portaria', fora: true },
    { id: 'c4', urg: 'alta', abertoEm: '2026-11-05T13:15', tipo: 'limpeza', cat: 'Derramamento', local: 'Hall do Bloco A', desc: 'Líquido derramado perto do elevador social.', estado: 'Em atendimento', aberto: 'há 1 hora', prazo: 'vence em 23h', autor: 'Bloco A · Apto 204', fora: false },
    { id: 'c5', urg: 'alta', abertoEm: '2026-11-02T08:30', tipo: 'manutencao', cat: 'Hidráulica', local: 'Bloco B, 3º andar', desc: 'Vazamento no teto do corredor.', estado: 'Aberto', aberto: 'há 3 dias', autor: 'Bloco B · Apto 302', fora: true },
    { id: 'c6', urg: 'leve', abertoEm: '2026-10-31T10:00', tipo: 'manutencao', cat: 'Portão', local: 'Portão da garagem', desc: 'Portão demora para fechar e faz barulho.', estado: 'Agendado', aberto: 'há 5 dias', autor: 'Portaria', empresa: 'Portões Silva', agenda: '06/11 às 9h' },
    { id: 'c7', urg: 'leve', abertoEm: '2026-11-04T14:00', tipo: 'limpeza', cat: 'Área comum suja', local: 'Salão de festas', desc: 'Limpeza depois do evento.', estado: 'Concluído', aberto: 'ontem', autor: 'Bloco A · Apto 101', mine: true, concluido: 'ontem às 16h', concluidoEm: '2026-11-04T16:00', concluidoPor: 'Sandra Rocha', fotos: 2 },
    { id: 'c8', urg: 'media', abertoEm: '2026-11-05T08:10', tipo: 'limpeza', cat: 'Lixo acumulado', local: 'Corredor do Bloco A, 2º andar', desc: 'Caixas de papelão deixadas ao lado do elevador.', estado: 'Concluído', aberto: 'hoje de manhã', autor: 'Bloco A · Apto 101', mine: true, concluido: 'hoje às 11h', concluidoEm: '2026-11-05T11:00', concluidoPor: 'Rita Farias', fotos: 0 },
    { id: 'c9', urg: 'leve', abertoEm: '2026-10-30T09:00', tipo: 'limpeza', cat: 'Área comum suja', local: 'Churrasqueira', desc: 'Gordura na bancada depois do uso.', estado: 'Concluído', aberto: 'há 6 dias', autor: 'Bloco A · Apto 101', mine: true, concluido: '01/11 às 10h', concluidoEm: '2026-11-01T10:00', concluidoPor: 'Sandra Rocha', fotos: 3, aval: { nota: 5, base: 'fotos', coment: 'Ficou impecável, obrigada!', em: '02/11/2026', dias: 3 } },
    { id: 'c10', urg: 'media', abertoEm: '2026-10-28T10:30', tipo: 'manutencao', cat: 'Portão', local: 'Portão do pedestre, Bloco A', desc: 'Fechadura do portão do pedestre travando.', estado: 'Concluído', aberto: 'há 8 dias', autor: 'Bloco A · Apto 101', mine: true, empresa: 'Portões Silva', concluido: '03/11 às 15h', concluidoEm: '2026-11-03T15:00', fotos: 1, aval: { nota: 2, base: 'pessoal', coment: 'A fechadura ainda trava de manhã.', em: '04/11/2026', dias: 1 } },
  ],
  /* Histórico anônimo de avaliações do atendimento (RN-CH-19, RN-CH-20): sem unidade, morador, chamado nem local. As dos chamados acima entram por avalTodas(). */
  avaliacoes: [
    { quem: 'Sandra Rocha', tipo: 'limpeza', nota: 5, coment: 'Rápida e educada.', mes: 'outubro de 2026', dias: 20 },
    { quem: 'Sandra Rocha', tipo: 'limpeza', nota: 4, coment: '', mes: 'outubro de 2026', dias: 18 },
    { quem: 'Sandra Rocha', tipo: 'limpeza', nota: 3, coment: 'Faltou limpar o canto perto da porta.', mes: 'outubro de 2026', dias: 12 },
    { quem: 'Sandra Rocha', tipo: 'limpeza', nota: 5, coment: '', mes: 'setembro de 2026', dias: 45 },
    { quem: 'Sandra Rocha', tipo: 'limpeza', nota: 4, coment: 'Bom trabalho.', mes: 'setembro de 2026', dias: 50 },
    { quem: 'Rita Farias', tipo: 'limpeza', nota: 4, coment: 'Tudo certo.', mes: 'outubro de 2026', dias: 9 },
    { quem: 'Eletro Rápida', tipo: 'manutencao', nota: 5, coment: '', mes: 'outubro de 2026', dias: 25 },
    { quem: 'Eletro Rápida', tipo: 'manutencao', nota: 4, coment: '', mes: 'outubro de 2026', dias: 15 },
    { quem: 'Portões Silva', tipo: 'manutencao', nota: 1, coment: 'Voltaram duas vezes e não resolveram.', mes: 'outubro de 2026', dias: 6 },
    { quem: 'Portões Silva', tipo: 'manutencao', nota: 3, coment: '', mes: 'setembro de 2026', dias: 40 },
    { quem: 'HidroFix', tipo: 'manutencao', nota: 5, coment: '', mes: 'outubro de 2026', dias: 11 },
  ],
  empresas: [{ nome: 'Eletro Rápida', serv: 'Elétrica', tel: '(11) 4002-1010' }, { nome: 'Portões Silva', serv: 'Portões e automação', tel: '(11) 3333-2020' }, { nome: 'HidroFix', serv: 'Hidráulica', tel: '(11) 98888-3030' }],
  minhasRecl: [
    { id: 'm1', papel: 'reclamante', alvo: 'Bloco C · Apto 504', cat: 'Barulho', estado: 'Em conversa com o alvo', data: '02/11', abertaEm: '2026-11-02' },
    { id: 'm4', papel: 'reclamante', alvo: 'Bloco A · Apto 303', cat: 'Animal sem coleira', estado: 'Aberta', data: '22/10', abertaEm: '2026-10-22' },
    { id: 'm5', papel: 'reclamante', alvo: 'Portaria', cat: 'Atendimento na portaria', estado: 'Em conversa com o alvo', data: '15/10', abertaEm: '2026-10-15' },
    { id: 'm2', papel: 'alvo', cat: 'Barulho após as 22h', estado: 'Validada', data: '12/10', pontos: -10, recorrerAte: '19/10', recorrivel: false },
    { id: 'm3', papel: 'alvo', cat: 'Uso indevido de vaga', estado: 'Validada', data: '01/11', pontos: -5, recorrerAte: '08/11', recorrivel: true },
  ],
  julgar: [
    { id: 'j1', estado: 'Aberta', cat: 'Barulho', grav: 'Média · −10', desc: 'Música alta todas as sextas depois da meia-noite.', data: '02/11', abertaEm: '2026-11-02', reclamante: { nome: 'Ana Lima', un: 'Bloco A · Apto 101', score: 78 }, alvo: { nome: 'Rafael Costa', un: 'Bloco C · Apto 504', score: 85 }, conversa: false, resposta: null, liberaEm: '07/11' },
    { id: 'j2', estado: 'Em conversa com o alvo', cat: 'Animal sem coleira', grav: 'Leve · −5', desc: 'Cachorro solto no playground.', data: '21/10', abertaEm: '2026-10-21', reclamante: { nome: 'Pedro Alves', un: 'Bloco B · Apto 101', score: 92 }, alvo: { nome: 'Luiza Prado', un: 'Bloco A · Apto 303', score: 70 }, conversa: true, resposta: 'O portão do apartamento abriu sozinho, já consertei. Peço desculpas.', liberaEm: '02/11' },
    { id: 'j4', estado: 'Aberta', cat: 'Conduta do síndico', grav: 'Média · −10', desc: 'O síndico não respondeu os pedidos de conserto do interfone do Bloco C, feitos há três semanas.', data: '19/10', abertaEm: '2026-10-19', reclamante: { nome: 'Rafael Costa', un: 'Bloco C · Apto 504', score: 85 }, alvo: { nome: 'Pedro Alves', un: 'Síndico · Bloco B · Apto 101', score: 72 }, conversa: false, resposta: null, liberaEm: '08/11', contraSindico: true },
    { id: 'j5', estado: 'Aberta', cat: 'Conduta do síndico', grav: 'Média · −10', desc: 'Aviso sobre a obra da fachada foi enviado sem antecedência.', data: '01/11', abertaEm: '2026-11-01', reclamante: { nome: 'Ana Lima', un: 'Bloco A · Apto 101', score: 78 }, alvo: { nome: 'Pedro Alves', un: 'Síndico · Bloco B · Apto 101', score: 72 }, conversa: false, resposta: null, liberaEm: '06/11', contraSindico: true },
    { id: 'j7', estado: 'Aberta', cat: 'Conduta do síndico', grav: 'Média · −10', desc: 'Reunião marcada em horário que impede quem trabalha à noite de participar.', data: '22/10', abertaEm: '2026-10-22', reclamante: { nome: 'Luiza Prado', un: 'Bloco A · Apto 303', score: 70 }, alvo: { nome: 'Pedro Alves', un: 'Síndico · Bloco B · Apto 101', score: 72 }, conversa: false, resposta: null, liberaEm: '06/11', contraSindico: true },
    { id: 'j6', estado: 'Aberta', cat: 'Vaga de garagem', grav: 'Leve · −5', desc: 'Carro estacionado na vaga 14 há duas semanas.', data: '14/10', abertaEm: '2026-10-14', reclamante: { nome: 'Carla Mendes', un: 'Bloco B · Apto 202', score: 88 }, alvo: { nome: 'Ana Lima', un: 'Bloco A · Apto 101', score: 78 }, conversa: false, resposta: null, liberaEm: '04/11' },
    { id: 'j3', estado: 'Em recurso', cat: 'Atendimento na portaria', grav: 'Média · −10', desc: 'Porteiro não registrou visita e deixou o visitante esperando 40 minutos.', data: '20/10', abertaEm: '2026-10-20', reclamante: { nome: 'Carla Mendes', un: 'Bloco B · Apto 202', score: 88 }, alvo: { nome: 'José Ribeiro', un: 'Portaria', score: 81 }, conversa: true, resposta: 'O sistema estava sem internet e o interfone com defeito.', liberaEm: '25/10' },
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
  /* Entregas esperadas (RN-EN-07 a RN-EN-13): data ISO; ini/fim e origem opcionais; encId = encomenda vinculada. "Hoje" do protótipo = HOJE_PROTO (2026-11-05) */
  limiteEntregas: 10,   // entrega_esperada.limite_por_unidade
  toleranciaVinculo: 3, // entrega_esperada.tolerancia_vinculo_dias
  entregas: [
    { id: 'x1', un: 'Bloco A · Apto 101', data: '2026-11-05', ini: '12:00', fim: '19:00', origem: 'Amazon', desc: 'Fone de ouvido', estado: 'Esperada' },
    { id: 'x2', un: 'Bloco A · Apto 101', data: '2026-11-05', ini: '', fim: '', origem: '', desc: 'Caixa grande, pode ser pesada', estado: 'Esperada' },
    { id: 'x3', un: 'Bloco A · Apto 101', data: '2026-11-08', ini: '', fim: '', origem: 'Mercado Livre', desc: '', estado: 'Esperada' },
    { id: 'x4', un: 'Bloco A · Apto 101', data: '2026-11-03', ini: '09:00', fim: '12:00', origem: 'Shopee', desc: 'Capa de celular', estado: 'Não chegou' },
    { id: 'x5', un: 'Bloco A · Apto 204', data: '2026-11-05', ini: '09:00', fim: '12:00', origem: 'Correios', desc: 'Sedex, precisa de assinatura', estado: 'Esperada' },
    { id: 'x6', un: 'Bloco B · Apto 302', data: '2026-11-05', ini: '18:00', fim: '20:00', origem: 'iFood/entregador', desc: 'Jantar', estado: 'Esperada' },
    { id: 'x7', un: 'Bloco A · Apto 101', data: '2026-11-04', ini: '', fim: '', origem: 'Correios', desc: 'Livro', estado: 'Chegou', encId: 'e2' },
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
  notif: { reservas: true, lembreteReserva: true, visitantes: true, encomendas: true, chamados: true, comunicados: true, votacoes: true, cobrancas: true, pesquisa: false },
  // Portaria
  esperados: [
    { id: 'x1', nome: 'Carlos Souza', un: 'Bloco A · Apto 101', bloco: 'A', estado: 'Esperado', cancelado: true },
    { id: 'x2', nome: 'Maria Oliveira', un: 'Bloco A · Apto 101', bloco: 'A', estado: 'Esperado', rec: 'Seg, Qua e Sex · 8h às 12h' },
    { id: 'x3', nome: 'Fernando Lopes', un: 'Bloco B · Apto 302', bloco: 'B', estado: 'Entrou', hora: '9h05' },
    { id: 'x4', nome: 'Marcos Vieira', un: 'Bloco B · Apto 504', bloco: 'B', estado: 'Esperado', bloqueio: 'Ameaçou o porteiro em 12/09. Entrada bloqueada pela administradora.' },
    { id: 'x5', nome: 'Juliana Reis', un: 'Bloco B · Apto 101', bloco: 'B', estado: 'Esperado', fora: 'Cadastrada para terças, das 14h às 18h.' },
    { id: 'x6', nome: 'Técnico da Vivo', un: 'Bloco A · Apto 204', bloco: 'A', estado: 'Saiu', hora: '8h40' },
  ],
  /* Listas de visitantes (RN-VI-11 a RN-VI-17): cada pessoa é um visitante avulso em S.esperados com o id da lista; a lista guarda só os dados comuns */
  limiteLista: 100,   // visitante.lista_max_pessoas (RN-VI-12)
  listas: [
    { id: 'l1', titulo: 'Aniversário do Theo', un: 'Bloco A · Apto 101', bloco: 'A', data: '2026-11-05', ini: '18:00', fim: '22:00', local: 'Apartamento 101', reserva: null, estado: 'Esperada' },
  ],
  modelos: [
    { id: 'm1', nome: 'Família', pessoas: [{ nome: 'Célia Lima', doc: '' }, { nome: 'Roberto Lima', doc: '' }, { nome: 'Patrícia Lima', doc: '' }, { nome: 'Davi Lima', doc: '' }] },
    { id: 'm2', nome: 'Turma do futebol', pessoas: [{ nome: 'Fernando Lopes', doc: '' }, { nome: 'Marcos Andrade', doc: '' }, { nome: 'Rafael Nunes', doc: '' }, { nome: 'Gustavo Pires', doc: '' }, { nome: 'Thiago Barros', doc: '' }] },
  ],
  /* Visitantes recentes e frequentes (RN-VI-16): quem foi cadastrado nos últimos 90 dias; "frequente" = 3 ou mais visitas */
  recentes: [
    { nome: 'Carlos Souza', vezes: 6 }, { nome: 'Fernando Lopes', vezes: 4 }, { nome: 'Beatriz Santos', vezes: 3 }, { nome: 'João Pereira', vezes: 2 }, { nome: 'Juliana Reis', vezes: 1 },
  ],
  vistorias: [
    { id: 'w1', reserva: 'r5', area: 'Churrasqueira', un: 'Bloco A · Apto 101', dia: '05/11', horario: '12h às 16h', inicioMin: 720, fimMin: 960, estado: 'Confirmada', paga: false, eventos: [] },
    { id: 'w2', area: 'Salão de festas', un: 'Bloco C · Apto 504', dia: '05/11', horario: '9h às 11h', inicioMin: 540, fimMin: 660, estado: 'Confirmada', paga: true, eventos: [] },
    { id: 'w3', area: 'Quadra poliesportiva', un: 'Bloco B · Apto 302', dia: '05/11', horario: '16h às 18h', inicioMin: 960, fimMin: 1080, estado: 'Confirmada', paga: false, eventos: [] },
    { id: 'w4', area: 'Espaço gourmet', un: 'Bloco A · Apto 204', dia: '05/11', horario: '18h às 23h', inicioMin: 1080, fimMin: 1380, estado: 'Aguardando pagamento', paga: true, eventos: [] },
    { id: 'w5', area: 'Salão de festas', un: 'Bloco B · Apto 203', dia: '04/11', horario: '18h às 23h', inicioMin: 1080, fimMin: 1380, estado: 'Confirmada', paga: true, eventos: [] },
    { id: 'w6', area: 'Quadra poliesportiva', un: 'Bloco B · Apto 302', dia: '03/11', horario: '9h às 10h', inicioMin: 540, fimMin: 600, estado: 'Cumprida', paga: false, eventos: [] },
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
    { k: 'Lembrete de reserva (antecedência do push)', v: 24, un: 'horas antes', pad: 24, min: 1, max: 72, herd: true },
    { k: 'Score mínimo para reservas gratuitas', v: 60, un: 'pontos', pad: 60, min: 0, max: 100, herd: true },
    { k: 'Prazo de resposta do alvo da reclamação', v: 5, un: 'dias', pad: 5, min: 1, max: 15, herd: true },
    { k: 'Prazo do chamado de limpeza', v: 24, un: 'horas', pad: 24, min: 1, max: 72, herd: true },
    { k: 'Prazo para avaliar o atendimento do chamado', v: 7, un: 'dias', pad: 7, min: 1, max: 30, herd: true },
    { k: 'Guarda de encomendas', v: 30, un: 'dias', pad: 30, min: 7, max: 90, herd: true },
    { k: 'Entregas esperadas ativas por unidade', v: 10, un: 'entregas', pad: 10, min: 1, max: 30, herd: true },
    { k: 'Tolerância para vincular entrega que não chegou', v: 3, un: 'dias', pad: 3, min: 0, max: 7, herd: true },
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

function scoreContexto() {
  return S.scoresFuncionais[CUR.p] || S.scoresMoradia[S.unit];
}
Object.defineProperties(S, {
  score: { get: () => scoreContexto().valor, set: valor => { scoreContexto().valor = valor; } },
  scoreHist: { get: () => scoreContexto().historico },
});

/* Convidados da lista l1: 18 pessoas, 5 já chegaram */
['Ana Beatriz Cruz', 'Bruno Tavares', 'Camila Duarte', 'Daniel Freitas', 'Eduarda Moraes', 'Felipe Araújo', 'Gabriela Neves', 'Henrique Salles', 'Isabela Rocha', 'João Vitor Prado', 'Karina Mello', 'Leonardo Brito', 'Mariana Teixeira', 'Nicolas Ferraz', 'Olívia Campos', 'Pedro Henrique Lins', 'Quitéria Alves', 'Rodrigo Matos']
  .forEach((nome, i) => S.esperados.push({ id: 'lp' + i, nome, un: 'Bloco A · Apto 101', bloco: 'A', estado: i < 5 ? 'Entrou' : 'Esperado', hora: i < 5 ? '18h' + String(2 + i * 4).padStart(2, '0') : undefined, lista: 'l1', data: '2026-11-05' }));

/* ---------- Finanças do condomínio (RN-FI-21 a RN-FI-32) ----------
   Dados fictícios de um condomínio de 120 unidades, de dez/2025 a nov/2026 (hoje = 05/11/2026). Receitas de cobrança e de reservas
   são lançamentos automáticos agregados por dia e categoria (origem 'auto'); o resto é avulso (origem 'manual'). Valor negativo = estorno. */
const FIN_CATS_D = { energia: 'Energia', agua: 'Água e esgoto', gas: 'Gás', terc: 'Serviços terceirizados', folha: 'Folha de funcionários', manut: 'Manutenção e obras', seg: 'Seguros', adm: 'Administração', outros: 'Outros' };
const FIN_CATS_R = { taxa: 'Taxa condominial', extras: 'Cobranças extras', multas: 'Multas e juros por atraso', infr: 'Multas por infração', areas: 'Aluguel de áreas', outras: 'Outras receitas' };
const FIN_SERVICOS = ['Portaria', 'Limpeza', 'Elevador', 'Jardinagem', 'Outro'];
const FIN_MESES = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
const FIN_MES_NOME = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const finMesNome = ym => FIN_MES_NOME[+ym.slice(5) - 1];
const finMesLabel = ym => finMesNome(ym).charAt(0).toUpperCase() + finMesNome(ym).slice(1) + ' de ' + ym.slice(0, 4);
const finMesCurto = ym => finMesNome(ym).slice(0, 3);
S.fin = { hoje: '2026-11-05', mesAtual: '2026-11', diaFech: 10, cobrancaAtiva: true, lanc: [], coment: [],
  fechados: FIN_MESES.slice(0, 10), fechadoEm: {}, n: 0 };
(function () {
  const F = S.fin, L = F.lanc;
  FIN_MESES.slice(0, 10).forEach(ym => { const m = +ym.slice(5), y = +ym.slice(0, 4); F.fechadoEm[ym] = '10/' + String(m === 12 ? 1 : m + 1).padStart(2, '0'); });
  const add = o => {
    const inserir = x => { L.push(Object.assign({ id: 'f' + (++F.n), sub: '', desc: '', forn: '', comp: false, rec: false, origem: 'manual', qtd: 0 }, x)); return L[L.length - 1]; };
    if (o.origem !== 'auto' || o.tipo !== 'receita' || o.qtd < 3) return inserir(o);
    const qtd1 = Math.floor(o.qtd / 3), qtd2 = Math.floor(o.qtd / 3), quantidades = [qtd1, qtd2, o.qtd - qtd1 - qtd2];
    const total = Math.round(o.valor * 100), valores = quantidades.map(q => Math.floor(total * q / o.qtd)); valores[2] = total - valores[0] - valores[1];
    const dias = o.ym === '2026-11' ? ['03', '04', '05'] : ['10', '20', '27'];
    return quantidades.map((q, i) => inserir({ ...o, data: o.ym + '-' + dias[i], valor: valores[i] / 100, qtd: q, desc: (FIN_CATS_R[o.cat] || 'Recebimentos') + ' · recebimentos do dia' }))[0];
  };
  const taxaN = [114, 116, 115, 117, 116, 118, 117, 116, 118, 117, 117, 84];
  const multas = [380, 455, 402.4, 510, 468.2, 395, 430.8, 520, 410, 447.6, 412.6, 0];
  const areas = [840, 1080, 720, 990, 1260, 870, 1140, 960, 1350, 780, 1020, 240];
  const infr = [0, 95, 0, 190, 0, 95, 0, 0, 190, 95, 190, 0];
  const juros = [236.5, 210.4, 188.9, 301.7, 262, 197.8, 244.1, 281.3, 226.5, 205.9, 312.4, 0];
  const f = (i, base, amp) => Math.round(base * (1 + (((i * 37 + 11) % 13) - 6) / 6 * amp) * 100) / 100;
  FIN_MESES.forEach((ym, i) => {
    const nov = ym === '2026-11', dia = d => ym + '-' + String(d).padStart(2, '0');
    // Receitas automáticas (RN-FI-22)
    add({ ym, data: dia(nov ? 5 : 27), tipo: 'receita', cat: 'taxa', desc: 'Taxa condominial · ' + taxaN[i] + ' cobranças pagas', forn: 'Cobranças pagas', valor: taxaN[i] * (i === 0 ? 580 : 620), origem: 'auto', qtd: taxaN[i] });
    if (multas[i]) add({ ym, data: dia(27), tipo: 'receita', cat: 'multas', desc: 'Multa e juros de ' + (i % 4 + 2) + ' cobranças pagas com atraso', forn: 'Cobranças pagas', valor: Math.round((multas[i] + juros[i]) * 100) / 100, origem: 'auto', qtd: i % 4 + 2 });
    add({ ym, data: dia(nov ? 4 : 24), tipo: 'receita', cat: 'areas', desc: 'Reservas pagas · Salão de festas e Espaço gourmet', forn: 'Reservas pagas', valor: areas[i], origem: 'auto', qtd: Math.round(areas[i] / 120) });
    if (infr[i]) add({ ym, data: dia(20), tipo: 'receita', cat: 'infr', desc: 'Multas por infração pagas', forn: 'Cobranças pagas', valor: infr[i], origem: 'auto', qtd: infr[i] / 95 });
    if (ym === '2026-10') add({ ym, data: dia(27), tipo: 'receita', cat: 'extras', desc: 'Fundo de obras · 115 cobranças pagas', forn: 'Cobranças pagas', valor: 115 * 180, origem: 'auto', qtd: 115 });
    if (nov) add({ ym, data: dia(4), tipo: 'receita', cat: 'extras', desc: 'Fundo de obras, parcela 1 de 3 · 14 cobranças pagas', forn: 'Cobranças pagas', valor: 14 * 180, origem: 'auto', qtd: 14 });
    // Tarifa do gateway: despesa automática (RN-FI-23)
    add({ ym, data: dia(nov ? 5 : 27), tipo: 'despesa', cat: 'adm', sub: 'Tarifas', desc: 'Tarifas do gateway · ' + (taxaN[i] + 6) + ' pagamentos', forn: 'Gateway de pagamento', valor: Math.round((taxaN[i] + 6) * 2.49 * 100) / 100, origem: 'auto', comp: true });
    // Receitas avulsas
    add({ ym, data: dia(7 > 5 && nov ? 5 : 7), tipo: 'receita', cat: 'outras', desc: 'Aluguel de espaço para antena', forn: 'Torre Sul Telecom', valor: 1200, comp: true, rec: true });
    if (!nov && i % 3 === 1) add({ ym, data: dia(2), tipo: 'receita', cat: 'outras', desc: 'Rendimento da aplicação do fundo de reserva', forn: 'Banco do condomínio', valor: f(i, 290, .2), comp: true });
    // Despesas avulsas
    if (!nov) {
      add({ ym, data: dia(12), tipo: 'despesa', cat: 'energia', desc: 'Conta de energia das áreas comuns', forn: 'Enel', valor: f(i, 4300, .12), comp: i !== 4 });
      add({ ym, data: dia(15), tipo: 'despesa', cat: 'agua', desc: 'Conta de água e esgoto', forn: 'Sabesp', valor: f(i + 3, 9650, .1), comp: true });
      add({ ym, data: dia(18), tipo: 'despesa', cat: 'gas', desc: 'Gás da central', forn: 'Comgás', valor: f(i + 5, 1250, .15), comp: true });
      add({ ym, data: dia(6), tipo: 'despesa', cat: 'terc', sub: 'Portaria', desc: 'Portaria noturna e rondas', forn: 'Segurança Total Ltda', valor: 14800, comp: true, rec: true });
      add({ ym, data: dia(6), tipo: 'despesa', cat: 'terc', sub: 'Limpeza', desc: 'Equipe de apoio à limpeza das áreas comuns', forn: 'LimpMax Serviços', valor: 8200, comp: true, rec: true });
      add({ ym, data: dia(8), tipo: 'despesa', cat: 'terc', sub: 'Elevador', desc: 'Manutenção preventiva dos elevadores', forn: 'Elevadores Atlas', valor: 1950, comp: true, rec: true });
      add({ ym, data: dia(10), tipo: 'despesa', cat: 'terc', sub: 'Jardinagem', desc: 'Jardinagem mensal', forn: 'Verde Vivo Jardins', valor: 1100, comp: true, rec: true });
      if (i % 3 === 0) add({ ym, data: dia(14), tipo: 'despesa', cat: 'terc', sub: 'Outro', desc: 'Controle de pragas', forn: 'Dedetiza Já', valor: 780, comp: true });
      if (i === 3 || i === 9) add({ ym, data: dia(21), tipo: 'despesa', cat: 'terc', sub: 'Limpeza', desc: 'Limpeza semestral das caixas d’água', forn: 'HidroLimp', valor: 1350, comp: true });
      add({ ym, data: dia(20), tipo: 'despesa', cat: 'seg', desc: 'Seguro predial, parcela mensal', forn: 'Porto Seguro', valor: 1050, comp: true, rec: true });
      add({ ym, data: dia(25), tipo: 'despesa', cat: 'outros', desc: i % 2 ? 'Material de escritório e chaveiro' : 'Materiais de limpeza e descartáveis', forn: i % 2 ? 'Papelaria Central' : 'Casa Limpa Atacado', valor: f(i + 1, 330, .3), comp: i !== 6 });
      if (i % 2 === 0 && ym !== '2026-10') add({ ym, data: dia(22), tipo: 'despesa', cat: 'manut', desc: 'Manutenção elétrica das áreas comuns', forn: 'Eletro Rápida', valor: f(i, 620, .3), comp: true });
    }
    add({ ym, data: dia(5), tipo: 'despesa', cat: 'folha', desc: i === 0 ? 'Folha de pagamento, encargos e 13º salário' : 'Folha de pagamento e encargos', forn: 'Folha do condomínio', valor: i === 0 ? 28800 : 19200, comp: true, rec: i !== 0 });
    add({ ym, data: dia(5), tipo: 'despesa', cat: 'adm', sub: 'Honorários', desc: 'Honorários da administradora', forn: 'Administradora', valor: 3600, comp: true, rec: true });
  });
  // Cenários de exemplo: estorno de mês fechado, obra comentada pelo conselho
  const set = add({ ym: '2026-09', data: '2026-09-18', tipo: 'despesa', cat: 'manut', desc: 'Conserto da bomba d’água', forn: 'Hidrobombas Ltda', valor: 4200, comp: true });
  set.estornado = true;
  const est = add({ ym: '2026-10', data: '2026-10-14', tipo: 'despesa', cat: 'manut', desc: 'Estorno: conserto da bomba d’água', forn: 'Hidrobombas Ltda', valor: -4200, comp: true, estornoDe: set.id, motivo: 'Valor digitado errado: a nota fiscal é de R$ 2.400,00.' });
  set.estornoId = est.id;
  add({ ym: '2026-10', data: '2026-10-14', tipo: 'despesa', cat: 'manut', desc: 'Conserto da bomba d’água (valor correto)', forn: 'Hidrobombas Ltda', valor: 2400, comp: true });
  add({ ym: '2026-10', data: '2026-10-09', tipo: 'despesa', cat: 'manut', desc: 'Troca de lâmpadas da garagem', forn: 'Eletro Rápida', valor: 380, comp: true });
  add({ ym: '2026-10', data: '2026-10-16', tipo: 'despesa', cat: 'manut', desc: 'Ajuste do portão da garagem', forn: 'Portões Silva', valor: 540, comp: false });
  const obra = add({ ym: '2026-10', data: '2026-10-19', tipo: 'despesa', cat: 'manut', sub: 'Obras', desc: 'Reforma da garagem, 1ª parcela', forn: 'Construtora Prumo', valor: 18500, comp: true });
  add({ ym: '2026-11', data: '2026-11-03', tipo: 'despesa', cat: 'manut', desc: 'Vistoria hidráulica do Bloco B', forn: 'HidroFix', valor: 450, comp: false });
  F.coment.push({ id: 'k1', alvo: obra.id, por: 'Luiza Prado', papel: 'Conselho fiscal', data: '03/11', txt: 'Podem anexar o contrato e as 3 propostas da reforma da garagem? Queremos conferir antes da reunião.', novo: true });
  F.coment.push({ id: 'k2', alvo: 'mes:2026-09', por: 'Pedro Alves', papel: 'Síndico', data: '11/10', txt: 'Conferi o mês com as notas fiscais. Tudo certo.', novo: false });
})();

const ADMIN_NAV = [
  ['visao-geral', 'Visão geral', 'layout-dashboard'], ['implantacao', 'Implantação', 'rocket'], ['unidades', 'Unidades e moradores', 'house'],
  ['funcionarios', 'Funcionários', 'id-card'], ['areas', 'Áreas e regras', 'calendar-days'], ['reclamacoes', 'Reclamações', 'message-square-warning'],
  ['cancelamentos', 'Cancelar pelo condomínio', 'calendar-x'], ['eleicoes', 'Eleições', 'vote'], ['recebimentos-pendentes', 'Recebimentos em análise', 'receipt'], ['assinatura', 'Assinatura da plataforma', 'file-text'],
  ['cobranca', 'Cobrança', 'receipt'], ['financas', 'Finanças', 'wallet'], ['relatorios', 'Relatórios', 'chart-no-axes-combined'], ['exportacoes-relatorios', 'Exportações', 'download'], ['comunicados', 'Comunicados', 'megaphone'], ['reunioes', 'Reuniões e mandatos', 'vote'],
  ['solicitacoes', 'Solicitações', 'inbox'], ['bloqueio', 'Lista de bloqueio', 'ban'], '-', ['configuracoes', 'Configurações', 'settings'],
];

const HUB = [
  { p: 'acesso', t: 'Acesso e conta', s: 'Todos os perfis · fluxos 3.1 a 3.3', f: ['Primeiro acesso com código de 6 dígitos', 'Login, conta pausada e recuperação de senha', 'Aceite de termos e onboarding', 'Novo aceite de termos'] },
  { p: 'morador', t: 'Morador', s: 'App · Início, Reservas, Visitantes, Chamados, Menu', f: ['Reserva gratuita e paga (Pix e cartão), cancelamento', 'Visitantes avulsos e recorrentes, e lista de visitantes para festas', 'Chamados com fotos do serviço e avaliação do atendimento', 'Reclamações, recurso e score', 'Cobranças, votações, pesquisa mensal e transparência', 'Simulação de inquilino: voto em pauta sem despesa extraordinária', 'Comunicados, encomendas, aparência e LGPD'] },
  { p: 'sindico', t: 'Síndico', s: 'App · Início, Gestão, Reservas, Visitantes, Menu', f: ['Julgar reclamações (conversa antes de decidir)', 'Acompanhar manutenção e empresas, concluir com fotos', 'Avaliações do atendimento por funcionário e empresa', 'Comunicados gerais e individuais', 'Convocar reunião, votos presenciais e resultado', 'Solicitações de cadastro, inadimplência e substituição'] },
  { p: 'subsindico', t: 'Subsíndico', s: 'App · Início, Gestão, Reservas, Visitantes, Menu', f: ['Gestão enxuta no dia a dia', 'Julga reclamações contra o síndico', 'Acompanha a manutenção, sem avançar o status', 'Sugere comunicados que o síndico revisa e envia', 'Registra votos presenciais e vê encomendas vencidas', 'Na substituição, todas as funções de síndico'] },
  { p: 'admin', t: 'Administradora', s: 'Painel web · navegação lateral', f: ['Implantação: estrutura, conta bancária e planilha', 'Unidades, moradores, mudanças e funcionários', 'Áreas, regras e parâmetros com faixa permitida', 'Média das avaliações de atendimento por funcionário e empresa', 'Cobrança, cobranças extras e inadimplência', 'Reclamações, mandatos, solicitações e bloqueio'] },
  { p: 'portaria', t: 'Funcionário · Portaria', s: 'App · Visitantes, Encomendas, Áreas, Menu', f: ['Entrada em 1 toque com Desfazer, também para quem vem em lista', 'Lista de bloqueio e fora do horário', 'Sem internet, fila e divergência ao sincronizar', 'Encomendas, vistorias e modo treinamento'] },
  { p: 'limpeza', t: 'Funcionário · Limpeza', s: 'App · Chamados, Áreas, Menu', f: ['Fila do setor por prazo, com Concluir no cartão', 'Iniciar atendimento no detalhe', 'Concluir com fotos opcionais, inclusive sem internet', 'Minhas avaliações, sem saber de quem', 'Vistoria e não comparecimento'] },
  { p: 'manutencao', t: 'Funcionário · Manutenção', s: 'Proposta · não previsto no PRD', f: ['Fila de chamados de manutenção atribuídos', 'Agenda de visitas', 'Atualizar andamento e concluir com foto', 'Hoje o PRD prevê só empresas cadastradas pelo síndico'] },
  { p: 'proprietario', t: 'Proprietário não residente', s: 'App · Unidade, Cobranças, Assembleias, Menu', f: ['Unidade alugada: contrato, inquilino e pedidos à administradora', 'Paga as extraordinárias; vê as ordinárias do inquilino', 'Vota nas assembleias e indica procurador', 'Ocorrências validadas contra a unidade, sem ver a rotina do inquilino', 'Unidade desocupada e hóspede de temporada'] },
];

S.complementacao.denuncias[0].comunicadoId = 'k2';
S.complementacao.denuncias[1].comunicadoId = 'k1';
