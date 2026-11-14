'use strict';

const RELATORIOS = [
  { id: 'financeiro', titulo: 'Financeiro do condomínio', colunas: ['Data', 'Tipo', 'Categoria', 'Valor', 'Fornecedor'], grafico: true, dados: [['2026-10-15', 'Despesa', 'Serviços', 400, 'Empresa Exemplo'], ['2026-11-01', 'Receita', 'Taxa condominial', 1800, '—']], nota: 'Receitas agregadas, sem unidade ou responsável financeiro. Não substitui a contabilidade.' },
  { id: 'cobrancas', titulo: 'Cobranças e pagamentos', colunas: ['Competência', 'Unidade', 'Estado', 'Valor', 'Vencimento'], grafico: false, dados: [['2026-10-01', 'A · 101', 'Paga', 620, '10/10/2026'], ['2026-11-01', 'A · 102', 'Emitida', 620, '10/11/2026']], nota: 'Conjunto individual de cobranças, exclusivo da administradora; separado das finanças agregadas.' },
  { id: 'inadimplencia', titulo: 'Inadimplência', colunas: ['Referência', 'Unidade', 'Faixa de atraso', 'Total devido', 'Dias'], grafico: true, dados: [['2026-10-31', 'A · 102', 'Até 30 dias', 620, 21], ['2026-11-14', 'B · 201', 'Mais de 30 dias', 1240, 35]], nota: 'Data de referência explícita; gráfico mostra totais por faixa, sem unidade.' },
  { id: 'ocupacao', titulo: 'Unidades, ocupação e locação', colunas: ['Referência', 'Unidade', 'Ocupação', 'Tipo', 'Fim do contrato'], grafico: true, dados: [['2026-11-14', 'A · 101', 'Ocupada', 'Alugada', '01/01/2027'], ['2026-11-14', 'A · 103', 'Desocupada', '—', '—']], nota: 'Sem nomes, documentos, anexos ou histórico privado dos moradores.' },
  { id: 'cadastros', titulo: 'Funcionários e empresas', colunas: ['Referência', 'Nome', 'Situação', 'Setor/serviço', 'Vínculo'], grafico: false, dados: [['2026-11-14', 'Empresa Exemplo', 'Ativa', 'Manutenção', 'Terceirizado'], ['2026-11-14', 'Funcionária Exemplo', 'Ativa', 'Limpeza', 'Próprio']], nota: 'Sem salário, documentos, score ou notas individuais da pesquisa.' },
  { id: 'solicitacoes', titulo: 'Solicitações administrativas', colunas: ['Abertura', 'Identificador', 'Estado', 'Tipo', 'Tramitação'], grafico: true, dados: [['2026-10-10', 'SOL-01', 'Concluída', 'Cadastro', '24h'], ['2026-11-10', 'SOL-02', 'Pendente', 'Locação', '96h']], nota: 'Sem textos ou anexos privados. Filtro do exemplo usa data de abertura.' },
  { id: 'atendimento', titulo: 'Avaliações de atendimento', colunas: ['Referência', 'Funcionário/empresa', 'Quantidade', 'Média', 'Distribuição'], grafico: true, dados: [['2026-11-14', 'Empresa Exemplo', 8, '4,0', '3★: 2 · 4★: 4 · 5★: 2']], nota: 'Somente agregado RN-CH-19, sem comentário, avaliador, unidade, chamado ou local. Período de cálculo não é definido neste exemplo.' },
  { id: 'reclamacoes', titulo: 'Reclamações gerenciais', colunas: ['Referência', 'Categoria', 'Estado', 'Quantidade', 'Prazo'], grafico: true, dados: [['2026-10-31', 'Barulho', 'Encerrada', 12, 'No prazo'], ['2026-11-14', 'Uso de área', 'Aberta', 9, 'No prazo']], nota: 'Agregado fictício sem pessoa, unidade, relato, conversa, foto ou score. Política de pequenos grupos ainda será validada.' },
  { id: 'reservas', titulo: 'Reservas gerenciais', colunas: ['Referência', 'Área', 'Estado', 'Quantidade', 'Valores agregados'], grafico: true, dados: [['2026-10-31', 'Salão', 'Cumprida', 8, 'R$ 800,00'], ['2026-11-14', 'Quadra', 'Confirmada', 12, 'Gratuita']], nota: 'Sem pessoa, unidade ou rotina individual de quem reservou.' },
];

function estadoRelatorios() {
  return S.relatorios ||= { exportacoes: [], acesso: true };
}
function podeRelatorios(condominio = S.condo) {
  return CUR.p === 'admin' && !S.autogestao.ativa && estadoRelatorios().acesso && S.online && S.condo === condominio;
}
function bloqueioRelatorios(nav) {
  return { nav, body: head('Relatórios e exportações', 'Acesso revalidado no contexto atual.') + empty(S.online ? 'lock' : 'wifi-off', S.online ? 'Acesso indisponível para este contexto.' : 'Conecte-se para consultar ou gerar relatórios.') };
}
function graficoRelatorio(relatorio, linhas) {
  if (!relatorio.grafico || !linhas.length) return '';
  const soma = {};
  linhas.forEach(linha => {
    const grupo = relatorio.id === 'financeiro' ? linha[2] : relatorio.id === 'reclamacoes' ? linha[1] : relatorio.id === 'reservas' ? linha[1] : relatorio.id === 'atendimento' ? 'Avaliações recebidas' : linha[2];
    const valor = ['financeiro', 'inadimplencia', 'reclamacoes', 'reservas'].includes(relatorio.id) ? Number(linha[3]) : relatorio.id === 'atendimento' ? Number(linha[2]) : 1;
    soma[grupo] = (soma[grupo] || 0) + valor;
  });
  const max = Math.max(...Object.values(soma), 1);
  return card({ icon: 'chart-column', title: 'Gráfico agregado · dados fictícios', sub: 'Condomínio: ' + S.condos[S.condo].nome + ' · referência: 14/11/2026', body: Object.entries(soma).map(([rotulo, valor]) => `<div class="stack" style="margin-bottom:12px"><span>${esc(rotulo)}: ${esc(valor)}</span><progress max="${max}" value="${valor}" aria-label="${esc(rotulo)}: ${valor}"></progress></div>`).join('') + table([{ t: 'Grupo' }, { t: 'Valor' }], Object.entries(soma).map(([rotulo, valor]) => `<tr><td>${esc(rotulo)}</td><td>${valor}</td></tr>`), { foot: false }) });
}

def('admin', 'relatorios', 'Relatórios gerenciais', 'Relatórios (18)', () => {
  const estado = estadoRelatorios();
  if (!estado.acesso && CUR.p === 'admin' && !S.autogestao.ativa) return { nav: 'relatorios', body: head('Relatórios', 'Acesso revogado na simulação.') + empty('lock', 'Os relatórios e arquivos não podem ser acessados.') + btn('Restaurar autorização simulada', { on: () => { estado.acesso = true; rerender(); } }) };
  if (!podeRelatorios()) return bloqueioRelatorios('relatorios');
  const condominio = S.condo;
  const selecionado = RELATORIOS.find(r => r.id === FORM.relTipo) || RELATORIOS[0];
  const periodoPermitido = !['ocupacao', 'cadastros', 'atendimento'].includes(selecionado.id);
  const periodo = periodoPermitido ? FORM.relPeriodo || '' : '';
  const busca = String(FORM.relBusca || '').toLocaleLowerCase('pt-BR');
  const linhas = selecionado.dados.filter(l => (!periodo || l[0].startsWith(periodo)) && l.join(' ').toLocaleLowerCase('pt-BR').includes(busca));
  const formatos = selecionado.grafico ? ['pdf', 'csv', 'xlsx', 'png', 'svg'] : ['pdf', 'csv', 'xlsx'];
  const escolha = (id, valores, atual) => `<select class="select" data-bind="${id}">${valores.map(([v, t]) => `<option value="${v}" ${atual === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  const pedir = () => {
    if (!podeRelatorios(condominio)) return toast('Acesso ou condomínio mudou. Consulte novamente.');
    const formato = formatos.includes(FORM.relFormato) ? FORM.relFormato : 'pdf';
    estado.exportacoes.unshift({ id: uid(), condo: condominio, tipo: selecionado.titulo, formato, filtros: { periodo, busca }, linhas: linhas.map(l => [...l]), estado: 'Solicitada', referencia: '14/11/2026', acesso: true });
    go('admin/exportacoes-relatorios');
  };
  return { nav: 'relatorios', body: head('Relatórios gerenciais', 'Nove tipos no MVP · administradora · dados fictícios', btn('Exportações', { v: 'secondary', on: 'admin/exportacoes-relatorios' })) + `<div class="stack">${banner('info', 'flask-conical', 'Simulação de consulta e processamento. Nenhum arquivo PDF, Excel ou imagem real é gerado.', { inline: true })}${field('Relatório', escolha('relTipo', RELATORIOS.map(r => [r.id, r.titulo]), selecionado.id))}${btn('Abrir relatório selecionado', { v: 'secondary', on: () => { FORM.relFormato = 'pdf'; FORM.relBusca = ''; rerender(); } })}${periodoPermitido ? field('Período do exemplo', escolha('relPeriodo', [['', 'Todos os períodos'], ['2026-10', 'Outubro/2026'], ['2026-11', 'Novembro/2026']], periodo)) : '<p class="help">Consulta do estado atual. Não cria filtro histórico sem contrato.</p>'}${field('Buscar no resultado fictício', input('relBusca', { ph: 'Texto do relatório' }))}${btn('Aplicar filtros', { v: 'secondary', on: () => rerender() })}${banner('neutral', 'shield-check', selecionado.nota, { inline: true })}<p>${linhas.length} registros no recorte · referência fictícia: 14/11/2026 · fuso do condomínio. ${periodo ? 'Período: ' + esc(periodo) : 'Todos os dados disponíveis no exemplo.'}</p>${linhas.length ? table(selecionado.colunas.map(t => ({ t })), linhas.map(l => '<tr>' + l.map((v, i) => '<td>' + esc(typeof v === 'number' && i === 3 && ['financeiro', 'cobrancas', 'inadimplencia'].includes(selecionado.id) ? money(v) : v) + '</td>').join('') + '</tr>')) : empty('search', 'Nenhum registro para esses filtros.')}${graficoRelatorio(selecionado, linhas)}${field('Formato', escolha('relFormato', formatos.map(f => [f, f.toUpperCase() + (['png', 'svg'].includes(f) ? ' · gráfico agregado' : ' · tabela')]), formatos.includes(FORM.relFormato) ? FORM.relFormato : 'pdf'))}${btn('Solicitar exportação simulada', { icon: 'download', on: pedir })}${btn('Simular revogação de acesso', { v: 'secondary', on: () => { estado.acesso = false; rerender(); } })}</div>` };
});

def('admin', 'exportacoes-relatorios', 'Exportações de relatórios', 'Relatórios (18)', () => {
  if (!podeRelatorios()) return bloqueioRelatorios('exportacoes-relatorios');
  const condominio = S.condo;
  const pedidos = estadoRelatorios().exportacoes.filter(p => p.condo === condominio);
  const transicao = (p, estado) => {
    if (!podeRelatorios(condominio) || p.condo !== S.condo || !p.acesso) return toast('Acesso indisponível.');
    p.estado = estado; rerender();
  };
  const controles = p => {
    if (!p.acesso) return badge('Acesso revogado', 'neutral', 'lock');
    const acoes = [];
    if (p.estado === 'Solicitada') acoes.push(btn('Simular processamento', { on: () => transicao(p, 'Em processamento') }));
    if (p.estado === 'Em processamento') acoes.push(btn('Simular conclusão', { on: () => transicao(p, 'Pronta') }), btn('Simular falha', { v: 'secondary', on: () => transicao(p, 'Falhou') }));
    if (p.estado === 'Pronta') acoes.push(btn('Simular download', { on: () => { if (podeRelatorios(condominio) && p.acesso && p.estado === 'Pronta') toast('Download simulado de ' + p.formato.toUpperCase() + '. Nenhum arquivo foi gerado ou baixado.'); } }), btn('Simular expiração', { v: 'secondary', on: () => transicao(p, 'Expirada') }));
    if (['Falhou', 'Expirada'].includes(p.estado)) acoes.push(btn('Gerar novamente', { on: () => { if (!podeRelatorios(condominio) || !p.acesso) return; estadoRelatorios().exportacoes.unshift({ ...p, id: uid(), estado: 'Solicitada', linhas: p.linhas.map(l => [...l]) }); rerender(); } }));
    acoes.push(btn('Simular revogação do arquivo', { v: 'secondary', on: () => { if (!podeRelatorios(condominio)) return; p.acesso = false; rerender(); } }));
    return acoes.join('');
  };
  const icones = { Solicitada: 'clock', 'Em processamento': 'loader-circle', Pronta: 'download', Falhou: 'circle-alert', Expirada: 'clock-alert' };
  return { nav: 'exportacoes-relatorios', body: head('Exportações de relatórios', 'Somente pedidos próprios do condomínio selecionado', btn('Relatórios', { v: 'secondary', on: 'admin/relatorios' })) + `<div class="stack">${banner('info', 'flask-conical', 'Jobs e autorização simulados em memória. Arquivos não são gerados; recarregar apaga os pedidos.', { inline: true })}${pedidos.length ? pedidos.map(p => card({ icon: icones[p.estado], title: p.tipo + ' · ' + p.formato.toUpperCase(), sub: 'Pedido ' + p.id + ' · referência ' + p.referencia, body: p.acesso ? badge(p.estado, 'neutral', icones[p.estado]) + `<p>${p.linhas.length} registros · período: ${esc(p.filtros.periodo || 'dados do exemplo')} · busca: ${esc(p.filtros.busca || 'sem filtro')}</p>` : 'Arquivo indisponível após revogação.', foot: controles(p) })).join('') : empty('download', 'Nenhuma exportação neste condomínio.')}</div>` };
});
