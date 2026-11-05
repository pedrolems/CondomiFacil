/* Administradora — painel web (11.9): fluxos 4.1, 4.3, 4.4, 9.2, 11.2, 13.2 */
'use strict';
const head = (t, sub, actions = '') => `<div class="web-head"><div><h1 class="t-title-md">${t}</h1>${sub ? `<p class="t-body-sm muted" style="margin:4px 0 0">${sub}</p>` : ''}</div><div class="row wrap">${actions}</div></div>`;
function table(cols, rows, o = {}) {
  return `<div class="table-wrap"><table class="tbl"><thead><tr>${cols.map(c => `<th scope="col" class="${c.r ? 'r' : ''}">${c.t}</th>`).join('')}</tr></thead>
    <tbody>${rows.join('')}</tbody></table>${o.foot !== false ? `<div class="tbl-foot"><span>${rows.length} de ${rows.length}</span><span class="row">Linhas por página <select class="select" style="height:36px;width:80px;padding:0 8px"><option>25</option><option>50</option><option>100</option></select></span></div>` : ''}</div>`;
}
const menuCell = items => `<td class="r">${iconBtn('ellipsis', 'Mais ações', () => sheet(`<h2 class="t-title-md">Ações</h2>${items.map(([i, l, fn]) => row({ icon: i, title: l, on: () => { closeLayer(); fn(); } })).join('')}`))}</td>`;

def('admin', 'visao-geral', 'Visão geral', 'Painel', () => ({
  nav: 'visao-geral',
  body: `${head('Visão geral', S.condos[S.condo].nome + ' · ' + S.condos[S.condo].unidades + ' unidades · plano ' + S.condos[S.condo].plano)}
    <div class="kpis">
      <div class="kpi"><div class="t-body-sm muted">Unidades ativas</div><div class="v">118 de 120</div></div>
      <div class="kpi"><div class="t-body-sm muted">Cobrança de novembro paga</div><div class="v">71%</div></div>
      <div class="kpi"><div class="t-body-sm muted">Em atraso</div><div class="v c-danger">${money(S.inad.reduce((a, b) => a + b.valor, 0))}</div></div>
      <div class="kpi"><div class="t-body-sm muted">Solicitações pendentes</div><div class="v">${S.solicitacoes.filter(s => s.estado === 'Pendente').length}</div></div></div>
    <div class="grid-2" style="margin-top:24px">
      <section class="card"><h2 class="t-title-sm">Alertas</h2><div class="list">
        ${row({ icon: 'triangle-alert', title: 'Pagamento em duplicidade', sub: 'Bloco A · Apto 204 pagou duas vezes a cobrança de outubro. Devolva ou abata na próxima.', on: 'admin/cobranca' })}
        ${row({ icon: 'user-x', title: 'Unidade sem morador habilitado', sub: 'Bloco C · Apto 102: o habilitado excluiu a conta. Até definir o substituto, a unidade não vota.', on: 'admin/unidades' })}
        ${row({ icon: 'undo-2', title: 'Reembolso atrasado no gateway', sub: 'Reserva do Espaço gourmet de 18/10.', on: 'admin/cobranca' })}
        ${row({ icon: 'inbox', title: 'Nova solicitação do síndico', sub: 'Incluir morador: Lucas Lima.', on: 'admin/solicitacoes' })}</div></section>
      <section class="card"><h2 class="t-title-sm">Pagamentos de novembro</h2><div class="bars" role="img" aria-label="Pagas 71%, em aberto 27%, em atraso 2%">
        ${[['Pagas', 71], ['Em aberto', 27], ['Em atraso', 2]].map(([l, v], i) => `<div class="bar-row"><span>${l}</span><span class="bar-track"><span class="bar-fill ${i === 1 ? 'cmp' : ''}" style="display:block;width:${v}%"></span></span><b class="num">${v}%</b></div>`).join('')}</div>
        <p class="help">Série principal em azul; comparação em coral.</p></section></div>`,
}));

/* ---- Implantação (4.1) ---- */
def('admin', 'implantacao', 'Implantação', 'Implantação (4.1)', ctx => {
  const n = +(ctx.arg || S.implStep || 1); S.implStep = n;
  const steps = ['Estrutura', 'Conta bancária', 'Pessoas', 'Mandatos e áreas', 'Regras'];
  const nav = `<div class="steps">${steps.map((s, i) => `<button type="button" class="step ${i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}" ${goAttr('admin/implantacao/' + (i + 1))}><span class="n">${i + 1 < n ? ic('check') : i + 1}</span>${s}</button>`).join('')}</div>`;
  let body = '';
  if (n === 1) body = `<div class="form stack-5"><h2 class="t-title-sm">Blocos, portarias e unidades</h2>
    ${table([{ t: 'Bloco' }, { t: 'Unidades' }, { t: 'Portaria' }], [['A', '40', 'Portaria principal'], ['B', '40', 'Portaria principal'], ['C', '40', 'Portaria dos fundos']].map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`), { foot: false })}
    <div class="row">${btn('Adicionar bloco', { v: 'secondary', icon: 'plus', on: () => toast('Bloco D adicionado.') })}${btn('Adicionar portaria', { v: 'secondary', icon: 'plus', on: () => toast('Portaria adicionada.') })}</div>
    ${btn('Salvar e continuar', { on: 'admin/implantacao/2' })}</div>`;
  if (n === 2) {
    const pf = FORM.titular === 'pf';
    body = `<div class="form stack-5"><h2 class="t-title-sm">Conta bancária do condomínio</h2><p class="t-body-sm muted" style="margin:0">A mesma conta recebe reservas pagas e a taxa condominial.</p>
      <div class="field"><span class="field-label">Titular da conta</span><div class="stack-2">${choice('titular', 'pj', 'CNPJ do condomínio', { def: 'pj' })}${choice('titular', 'pf', 'Pessoa física (síndico ou administradora)', { def: 'pj' })}</div></div>
      ${field('Banco', input('banco', { value: FORM.banco ?? '341 · Itaú' }))}<div class="grid-2">${field('Agência', input('ag', { value: FORM.ag ?? '0123', inputmode: 'numeric' }))}${field('Conta', input('cc2', { value: FORM.cc2 ?? '45678-9', inputmode: 'numeric' }))}</div>
      ${pf ? `${banner('warning', 'triangle-alert', 'Conta de pessoa física exige o termo de responsabilidade do titular. Sem ele, a conta não é salva e não há áreas pagas nem cobrança.', { inline: true })}${choice('termo', 'ok', 'O titular aceitou o termo de responsabilidade', { multi: true })}` : ''}
      <div class="row">${btn('Salvar e continuar', { disabled: pf && !(FORM.termo || []).includes('ok'), on: () => { toast('Conta bancária salva.'); go('admin/implantacao/3'); } })}${btn('Pular por agora', { v: 'text', on: () => { toast('Sem conta: áreas pagas e cobrança ficam indisponíveis.'); go('admin/implantacao/3'); } })}</div></div>`;
  }
  if (n === 3) {
    const rows = S.importRows;
    const errs = rows.filter(r => !r.ok).length;
    body = `<div class="stack-5"><h2 class="t-title-sm">Importar moradores e funcionários</h2>
      <div class="row wrap">${btn('Baixar modelo da planilha', { v: 'secondary', icon: 'download', on: () => toast('modelo-condomifacil.xlsx baixado.') })}${btn('Enviar planilha', { icon: 'upload', on: () => { A.imported = true; rerender(); } })}</div>
      ${A.imported ? `${errs ? banner('danger', 'circle-x', `${errs} linhas com erro. Corrija na prévia ou na planilha e reimporte. As linhas válidas não são perdidas.`, { inline: true }) : banner('success', 'circle-check', 'Nenhum erro. Confira as unidades sem morador habilitado.', { inline: true })}
        ${table([{ t: 'Linha' }, { t: 'Nome' }, { t: 'E-mail' }, { t: 'Unidade' }, { t: 'Perfil' }, { t: 'Situação' }, { t: '' }], rows.map(r => `<tr class="${r.ok ? '' : 'err'}"><td class="num">${r.l}</td><td>${esc(r.nome) || '<i class="muted">vazio</i>'}</td><td>${esc(r.email)}</td><td>${r.un || '—'}</td><td>${r.perfil}</td><td>${r.ok ? badge('Válida', 'success') : `<span class="row c-danger t-body-sm">${ic('circle-x')}${r.erro}</span>`}</td><td class="r">${r.ok ? '' : btn('Corrigir', { v: 'text', size: 'sm', on: () => { r.ok = true; r.nome = r.nome || 'Nome corrigido'; r.erro = ''; rerender(); } })}</td></tr>`))}
        ${!errs ? `<div class="card">${banner('warning', 'user-x', 'Escolha o morador habilitado da unidade A-101.', { inline: true })}<div class="stack-2">${choice('hab', 'Ana Lima', 'Ana Lima')}${choice('hab', 'Lucas Lima', 'Lucas Lima')}</div></div>` : ''}
        ${btn('Confirmar importação e enviar convites', { disabled: errs > 0 || !FORM.hab, on: () => { toast('Importação confirmada. Convites de primeiro acesso enviados.'); go('admin/implantacao/4'); } })}
        ${errs > 0 ? `<p class="disabled-reason">${ic('info')}Corrija as linhas com erro para confirmar.</p>` : !FORM.hab ? `<p class="disabled-reason">${ic('info')}Escolha o morador habilitado.</p>` : ''}` : empty('file-spreadsheet', 'Envie a planilha no formato do modelo para ver a prévia.')}</div>`;
  }
  if (n === 4) body = `<div class="form stack-5"><h2 class="t-title-sm">Mandatos, conselho fiscal e áreas</h2>
    ${field('Síndico', `<select class="select" data-bind="msind"><option>Pedro Alves · Bloco B · Apto 101</option><option>Carla Mendes · Bloco B · Apto 202</option></select>`)}
    ${field('Subsíndico', `<select class="select" data-bind="msub"><option>Carla Mendes · Bloco B · Apto 202</option><option>Pedro Alves · Bloco B · Apto 101</option><option value="">Sem subsíndico</option></select>`, { error: A.mErr })}
    ${(FORM.msub === '') ? banner('warning', 'triangle-alert', 'Sem subsíndico, cadastre pelo menos um membro do conselho fiscal. O alerta fica no painel até isso ser feito.', { inline: true }) : ''}
    ${field('Conselho fiscal', input('mcons', { value: FORM.mcons ?? 'Luiza Prado · Bloco A · Apto 303' }))}
    <div class="grid-2">${field('Início do mandato', input('mini', { type: 'date', value: '2025-01-01' }))}${field('Fim do mandato', input('mfim', { type: 'date', value: '2026-12-31' }))}</div>
    ${btn('Salvar e continuar', { on: () => { const s1 = (FORM.msind || 'Pedro Alves · Bloco B · Apto 101').split(' · ').slice(1).join(), s2 = (FORM.msub ?? 'Carla Mendes · Bloco B · Apto 202').split(' · ').slice(1).join(); if (FORM.msub !== '' && s1 === s2) { A.mErr = 'Síndico e subsíndico precisam ser de unidades diferentes.'; rerender(); return; } A.mErr = ''; toast('Mandatos registrados.'); go('admin/implantacao/5'); } })}</div>`;
  if (n === 5) body = `<div class="form stack-5"><h2 class="t-title-sm">Regras</h2><p class="t-body-sm muted" style="margin:0">O condomínio já funciona com as regras padrão. Ajuste só o que for diferente.</p>
    ${btn('Revisar parâmetros', { v: 'secondary', icon: 'settings', on: 'admin/configuracoes' })}
    ${banner('success', 'circle-check', 'Condomínio pronto, com regras padrão.', { inline: true })}${btn('Ir para a visão geral', { on: 'admin/visao-geral' })}</div>`;
  return { nav: 'implantacao', body: head('Implantação', 'A ordem é fixa: cada etapa depende da anterior.') + nav + body };
}, { arg: '1' });

/* ---- Unidades e moradores (4.3) ---- */
def('admin', 'unidades', 'Unidades e moradores', 'Cadastros (4.3)', () => {
  const q = (FORM.uq || '').toLowerCase();
  const L = S.moradores.filter(m => !q || (m.nome + m.un + m.email).toLowerCase().includes(q));
  const mudanca = m => {
    const hab = m.papel.includes('habilitado');
    const mandato = /Síndico|Subsíndica/.test(m.papel);
    if (mandato) return dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Mandato ativo', text: 'Esta pessoa tem mandato ativo. Encerre o mandato antes.', actions: [{ label: 'Ir para mandatos', on: () => go('admin/reunioes') }, { label: 'Voltar', v: 'secondary' }] });
    sheet(() => `<h2 class="t-title-md">Registrar mudança de ${m.nome}</h2>
      ${hab ? `${banner('warning', 'user-x', 'Escolha quem passa a responder pela unidade.', { inline: true })}${choice('novoHab', 'Lucas Lima', 'Lucas Lima')}${choice('novoHab', 'Novo morador (convite)', 'Novo morador (enviar convite)')}${choice('novoHab', 'desocupada', 'Marcar a unidade como desocupada')}` : ''}
      ${/^Inquilin/.test(m.papel) ? banner('info', 'key-round', 'Quem sai é o inquilino: a mudança encerra o contrato de locação na data de hoje.', { inline: true }) : ''}
      ${m.papel.includes('financeiro') ? `<div class="field"><span class="field-label">Defina o novo responsável financeiro</span><select class="select"><option>${FORM.novoHab || 'Novo morador habilitado'} (padrão)</option><option>Helena Duarte · proprietária</option></select></div>` : ''}
      <div class="card t-body-sm"><b>O que acontece</b><ul style="margin:4px 0 0;padding-left:18px"><li>O acesso é desativado na hora; o histórico fica.</li><li>Reservas futuras são canceladas com reembolso integral.</li><li>Visitas recorrentes são encerradas.</li></ul></div>
      ${btn('Confirmar mudança', { v: 'danger', block: true, disabled: hab && !FORM.novoHab, on: () => { m.ativo = false; closeLayer(); rerender(); toast('Mudança registrada.'); } })}`);
  };
  return {
    nav: 'unidades',
    body: `${head('Unidades e moradores', '120 unidades · 3 blocos', btn('Importar planilha', { v: 'secondary', icon: 'upload', on: 'admin/implantacao/3' }) + btn('Novo morador', { icon: 'plus', on: () => sheet(`<h2 class="t-title-md">Pré-cadastrar morador</h2>${field('Nome', input('nm'))}${field('E-mail', input('ne', { type: 'email' }))}${field('Unidade', input('nu', { ph: 'Bloco A · Apto 101' }))}${btn('Salvar e enviar convite', { block: true, on: () => { if ((FORM.nm || '').trim()) S.moradores.push({ nome: FORM.nm, un: FORM.nu || '—', papel: 'Morador', email: FORM.ne || '', ativo: true }); closeLayer(); rerender(); toast('Convite de primeiro acesso enviado.'); } })}`) }))}
      <div class="row wrap" style="margin-bottom:16px"><div style="width:360px;max-width:100%">${input('uq', { icon: 'search', ph: 'Buscar por nome, unidade ou e-mail', attr: 'aria-label="Buscar"' })}</div>${chip('Todos', true)}${chip('Sem habilitado', false, () => toast('Nenhuma unidade ocupada está sem morador habilitado. Bloco C · Apto 102 está desocupada.'))}${chip('Alugadas', false, () => go('admin/unidade/' + encodeURIComponent(S.prop.un)))}${chip('Desocupadas', false, () => go('admin/unidade/' + encodeURIComponent('Bloco C · Apto 102')))}</div>
      ${table([{ t: 'Nome' }, { t: 'Unidade' }, { t: 'Papel' }, { t: 'E-mail' }, { t: 'Situação' }, { t: '', r: true }], L.map(m => `<tr><td><b>${m.nome}</b></td><td>${m.un}</td><td>${m.papel}</td><td>${m.email}</td><td>${m.ativo ? badge('Ativo', 'success') : badge('Desativado', 'neutral')}</td>${menuCell([['house', 'Ver unidade e locação', () => go('admin/unidade/' + encodeURIComponent(m.un))], ['pencil', 'Editar dados', () => toast('Dados salvos.')], ['user-check', 'Definir como morador habilitado', () => toast(m.nome + ' agora é o morador habilitado da unidade.')], ['truck', 'Registrar mudança', () => mudanca(m)]])}</tr>`))}`,
    after: () => { const el = $('#f-uq'); el && el.addEventListener('input', () => { clearTimeout(window._uq); window._uq = setTimeout(() => { rerender(); const n = $('#f-uq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); }); },
  };
});

/* ---- Unidade: locação e unidade desocupada (fluxo 4.5; RN-CD-20 a RN-CD-26, RN-FI-03) ---- */
const UNI = {};
function uniState(un) {
  if (UNI[un]) return UNI[un];
  if (un === S.prop.un) return { prop: S.prop.nome, inq: S.prop.desocupada ? null : S.prop.inq, des: S.prop.desocupada, P: S.prop };
  UNI[un] = un === 'Bloco C · Apto 102' ? { prop: 'Sílvia Nunes', inq: null, des: true } : { prop: (S.moradores.find(m => m.un === un && /habilitad/.test(m.papel)) || {}).nome || 'Proprietário', inq: null, des: false };
  return UNI[un];
}
def('admin', 'unidade', 'Detalhe da unidade', 'Cadastros (4.5)', ctx => {
  const un = ctx.arg || S.prop.un, u = uniState(un), inq = u.inq;
  const estado = u.des ? 'Desocupada' : inq ? 'Alugada' : 'Ocupada pelo proprietário';
  const sel = opts => `<select class="select">${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  const ord = inq ? [inq.nome + ' · inquilino (padrão)', u.prop + ' · proprietário'] : [u.prop + (u.des ? ' · proprietário (padrão)' : ' · morador habilitado (padrão)')];
  const ext = inq ? [u.prop + ' · proprietário (padrão)', inq.nome + ' · inquilino'] : ord;
  const setInq = v => { if (u.P) { if (v) u.P.inq = v; u.P.desocupada = !v; } else { u.inq = v; u.des = !v; } };
  const novoInq = () => sheet(() => `<h2 class="t-title-md">Cadastrar inquilino</h2>${field('Nome', input('in'))}${field('E-mail', input('ie', { type: 'email' }))}
    <div class="grid-2">${field('Início do contrato', input('iini', { type: 'date', value: FORM.iini ?? '2026-12-01' }))}${field('Fim do contrato', input('ifim', { type: 'date', value: FORM.ifim ?? '2027-11-30' }), { help: 'Em branco: prazo indeterminado.' })}</div>
    ${field('Dependentes (opcional)', input('idep', { ph: 'Nomes separados por vírgula' }))}
    <div class="card t-body-sm"><b>O que acontece</b><ul style="margin:4px 0 0;padding-left:18px"><li>O inquilino passa a ser o morador habilitado e recebe o convite de primeiro acesso.</li><li>${esc(u.prop)} passa a proprietário não residente e continua votando.</li><li>Responsáveis sugeridos: inquilino nas ordinárias, proprietário nas extraordinárias.</li></ul></div>
    ${btn('Salvar e enviar convite', { block: true, on: () => {
      const ini = FORM.iini ?? '2026-12-01', fim = FORM.ifim ?? '2027-11-30';
      if (!(FORM.in || '').trim()) { toast('Informe o nome do inquilino.'); return; }
      if (fim && fim <= ini) { toast('A data de fim precisa ser depois do início do contrato.'); return; }
      setInq({ nome: FORM.in, ini: dbr(ini), fim: fim ? dbr(fim) : 'prazo indeterminado', dias: 390, dependentes: (FORM.idep || '').split(',').map(x => x.trim()).filter(Boolean) });
      S.moradores.push({ nome: FORM.in, un, papel: 'Inquilino · Morador habilitado · Responsável pelas ordinárias', email: FORM.ie || '', ativo: true });
      closeLayer(); resetForm(); rerender(); toast('Inquilino cadastrado. Convite de primeiro acesso enviado.');
    } })}`);
  const renovar = () => sheet(() => `<h2 class="t-title-md">Renovar contrato de ${esc(inq.nome)}</h2>${field('Nova data de fim', input('rnf', { type: 'date', value: FORM.rnf ?? '2028-01-31' }))}
    ${btn('Renovar contrato', { block: true, on: () => { inq.fim = dbr(FORM.rnf ?? '2028-01-31'); inq.dias = 450; closeLayer(); rerender(); toast('Contrato renovado até ' + inq.fim + '. O inquilino e o proprietário foram avisados.'); } })}`);
  const encerrar = () => dialog({ tone: 'warning', icon: 'triangle-alert', title: `Encerrar o contrato de ${inq.nome}?`, text: 'O acesso do inquilino e dos dependentes é desativado, como numa mudança: reservas futuras são canceladas com reembolso e visitas recorrentes são encerradas. Cobranças já emitidas continuam no nome dele. A unidade fica desocupada.',
    actions: [{ label: 'Encerrar contrato', v: 'danger', on: () => { S.moradores.filter(m => m.nome === inq.nome || inq.dependentes.includes(m.nome)).forEach(m => m.ativo = false); setInq(null); rerender(); toast('Contrato encerrado. A unidade está desocupada.'); } }, { label: 'Voltar', v: 'secondary' }] });
  const marcarDes = () => dialog({ title: 'Marcar a unidade como desocupada?', text: `Ninguém mora na unidade. ${u.prop} passa a proprietário não residente: vota e responde por todas as cobranças. Ninguém reserva, cadastra visitantes nem abre chamados pela unidade.`,
    actions: [{ label: 'Marcar como desocupada', on: () => { u.des = true; if (u.P) u.P.desocupada = true; rerender(); toast('Unidade marcada como desocupada.'); } }, { label: 'Voltar', v: 'secondary' }] });
  const volta = () => dialog({ title: `${u.prop} volta a morar na unidade?`, text: 'O vínculo muda para morador: passa a ser o morador habilitado e ganha score, começando em 100.',
    actions: [{ label: 'Confirmar', on: () => { UNI[un] = { prop: u.prop, inq: null, des: false }; rerender(); toast(u.prop + ' agora é o morador habilitado da unidade.'); } }, { label: 'Voltar', v: 'secondary' }] });
  return {
    nav: 'unidades',
    body: `${head(esc(un), 'Residencial Jardim Azul · locação e unidade desocupada (fluxo 4.5)', btn('Voltar à lista', { v: 'secondary', icon: 'arrow-left', on: 'admin/unidades' }))}
    <div class="form stack-5" style="max-width:720px">
      <div class="row">${badge(estado, inq ? 'info' : 'neutral')}</div>
      ${card({ icon: 'user', title: 'Proprietário: ' + esc(u.prop), sub: inq || u.des ? 'Não residente · vota pela unidade' : 'Mora na unidade · morador habilitado · vota pela unidade' })}
      ${inq ? card({ icon: 'key-round', title: 'Inquilino: ' + esc(inq.nome), sub: `Contrato de ${inq.ini} a ${inq.fim}` + (inq.dependentes.length ? ' · dependentes: ' + inq.dependentes.map(esc).join(', ') : ''), body: 'Morador habilitado da unidade. Aviso automático 30 dias antes do fim; sem renovação, o acesso é desativado 7 dias depois do fim.', foot: btn('Renovar contrato', { v: 'secondary', size: 'sm', on: renovar }) + btn('Encerrar contrato', { v: 'text', size: 'sm', on: encerrar }) }) : ''}
      ${u.des ? banner('info', 'house', 'Unidade desocupada: sem morador habilitado. O proprietário vota e responde pelas cobranças ordinárias e extraordinárias.', { inline: true }) : ''}
      <h2 class="t-title-sm">Responsáveis financeiros</h2>
      <div class="grid-2">${field('Despesas ordinárias', sel(ord))}${field('Despesas extraordinárias', sel(ext))}</div>
      <p class="help" style="margin:0">Taxa mensal e multa por infração são ordinárias; fundo de reserva e obras, extraordinárias. Mude se o contrato de locação disser outra coisa.</p>
      <div>${btn('Salvar responsáveis', { on: () => toast('Responsáveis financeiros salvos.') })}</div>
      <hr class="hr">
      <div class="row wrap">${!inq ? btn('Cadastrar inquilino', { icon: 'user-plus', on: novoInq }) : ''}${!inq && !u.des ? btn('Marcar como desocupada', { v: 'secondary', icon: 'house', on: marcarDes }) : ''}${u.des ? btn('Proprietário volta a morar', { v: 'secondary', icon: 'log-in', on: volta }) : ''}</div>
    </div>`,
  };
});

def('admin', 'funcionarios', 'Funcionários', 'Cadastros (4.3)', () => ({
  nav: 'funcionarios',
  body: `${head('Funcionários', 'Score visível só para a administradora.', btn('Novo funcionário', { icon: 'plus', on: () => toast('Formulário de pré-cadastro de funcionário.') }))}
    ${table([{ t: 'Nome' }, { t: 'Setor' }, { t: 'Portaria' }, { t: 'Score', r: true }, { t: 'Situação' }, { t: '', r: true }], S.funcionarios.map(f => `<tr><td><b>${f.nome}</b></td><td>${f.setor}</td><td>${f.portaria || '—'}</td><td class="r">${f.score}</td><td>${f.ativo ? badge('Ativo', 'success') : badge('Desligado', 'neutral')}</td>${menuCell([['pencil', 'Editar', () => toast('Dados salvos.')], ['user-x', 'Registrar desligamento', () => dialog({ title: `Desligar ${f.nome}?`, text: 'O acesso é desativado na hora. Os chamados abertos voltam para a fila do setor, e as notas da pesquisa ficam no histórico.', actions: [{ label: 'Desligar funcionário', v: 'danger', on: () => { f.ativo = false; rerender(); toast(f.nome + ' desligado. Chamados devolvidos à fila.'); } }, { label: 'Cancelar', v: 'secondary' }] })]])}</tr>`))}`,
}));

/* ---- Áreas e regras ---- */
def('admin', 'areas', 'Áreas e regras', 'Cadastros (4.1)', () => ({
  nav: 'areas',
  body: `${head('Áreas e regras', 'Regras de reserva, cancelamento e reembolso por área.', btn('Nova área', { icon: 'plus', on: () => sheet(() => `<h2 class="t-title-md">Nova área</h2>${field('Nome', input('an'))}${choice('apaga', 'gratis', 'Gratuita', { def: 'gratis' })}${choice('apaga', 'paga', 'Paga', { def: 'gratis' })}
      ${FORM.apaga === 'paga' ? field('Valor', input('av', { inputmode: 'decimal', ph: 'R$ 0,00' })) : ''}
      ${btn('Salvar área', { block: true, on: () => { closeLayer(); if (FORM.apaga === 'paga' && A.semConta) { dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Sem conta bancária', text: 'Cadastre a conta bancária do condomínio antes de criar áreas pagas.', actions: [{ label: 'Cadastrar conta', on: () => go('admin/implantacao/2') }, { label: 'Agora não', v: 'secondary' }] }); return; } S.areas.push({ id: uid(), nome: FORM.an || 'Nova área', paga: FORM.apaga === 'paga', valor: parseFloat((FORM.av || '0').replace(',', '.')) || 0, cap: 'Até 20 pessoas', ico: 'map-pin' }); rerender(); toast('Área salva.'); } })}
      <label class="row help"><input type="checkbox" class="checkbox" ${A.semConta ? 'checked' : ''} ${cb(() => { A.semConta = !A.semConta; })}>Simular condomínio sem conta bancária</label>`) }))}
    ${table([{ t: 'Área' }, { t: 'Tipo' }, { t: 'Valor', r: true }, { t: 'Capacidade' }, { t: 'Reembolso até' }, { t: '', r: true }], S.areas.map(a => `<tr><td><span class="row">${ic(a.ico)}<b>${a.nome}</b></span></td><td>${a.paga ? badge('Paga', 'info') : badge('Gratuita', 'neutral')}</td><td class="r">${a.paga ? money(a.valor) : '—'}</td><td>${a.cap}</td><td>${a.paga ? '12h antes (herdado do condomínio)' : '—'}</td>${menuCell([['pencil', 'Editar regras', () => go('admin/configuracoes')], ['calendar-x', 'Bloquear para manutenção', () => dialog({ title: `Bloquear ${a.nome}?`, text: 'As reservas no período são canceladas pelo condomínio, com reembolso integral, e os moradores são avisados com o motivo.', actions: [{ label: 'Bloquear e cancelar reservas', v: 'danger', on: () => { S.reservas.filter(r => r.area === a.id && ['Confirmada', 'Aguardando pagamento'].includes(r.estado)).forEach(r => r.estado = 'Cancelada pelo condomínio'); toast('Área bloqueada. Reservas canceladas pelo condomínio.'); } }, { label: 'Cancelar', v: 'secondary' }] })]])}</tr>`))}`,
}));

/* ---- Reclamações (consulta e julgamento nos casos de RN-RC-03/07) ---- */
const RC_ADM = [
  { id: 'a1', alvo: 'Pedro Alves (síndico)', recl: 'Rafael Costa', cat: 'Atendimento', estado: 'Aberta', julgador: 'Administradora', motivo: 'Alvo é o síndico e a subsíndica está em substituição' },
  { id: 'a2', alvo: 'Bloco C · Apto 504', recl: 'Ana Lima', cat: 'Barulho', estado: 'Aberta', julgador: 'Síndico' },
  { id: 'a3', alvo: 'Bloco A · Apto 303', recl: 'Pedro Alves', cat: 'Animal sem coleira', estado: 'Em conversa com o alvo', julgador: 'Síndico' },
  { id: 'a4', alvo: 'Carla Mendes (subsíndica)', recl: 'Luiza Prado', cat: 'Uso indevido de vaga', estado: 'Validada', julgador: 'Síndico' },
];
def('admin', 'reclamacoes', 'Reclamações', 'Reclamações (9.2)', () => ({
  nav: 'reclamacoes',
  body: `${head('Reclamações', 'Todas as reclamações, inclusive contra síndico e subsíndico, com identidade e score das partes.')}
    <div class="chips" style="margin-bottom:16px">${chip('Todas', true)}${chip('Para você julgar', false, () => toast('1 reclamação aguarda a administradora.'))}</div>
    ${table([{ t: 'Alvo' }, { t: 'Reclamante' }, { t: 'Categoria' }, { t: 'Julgador' }, { t: 'Estado' }, { t: '', r: true }], RC_ADM.map(r => `<tr><td><b>${r.alvo}</b></td><td>${r.recl}</td><td>${r.cat}</td><td>${r.julgador}</td><td>${st(r.estado, ['Validada', 'Negada'].includes(r.estado) ? 'neutral' : undefined)}</td><td class="r">${r.julgador === 'Administradora' && r.estado === 'Aberta' ? btn('Julgar', { size: 'sm', on: () => dialog({ title: 'Reclamação contra o síndico', text: `${r.motivo}. Converse com o alvo antes de decidir. A decisão da administradora não tem recurso no app.`, actions: [{ label: 'Conversar com o alvo', icon: 'message-circle', on: () => { r.estado = 'Em conversa com o alvo'; rerender(); toast('Mensagem enviada ao síndico.'); } }, { label: 'Fechar', v: 'secondary' }] }) }) : btn('Ver', { v: 'text', size: 'sm', on: () => toast('Detalhe da reclamação (somente leitura).') })}</td></tr>`))}`,
}));

/* ---- Cobrança (13.2) ---- */
def('admin', 'cobranca', 'Cobrança', 'Cobrança (13.2)', () => {
  const t = FORM.ctab || 'config', C = S.cobrancaCfg;
  const tabs = `<div class="chips" style="margin-bottom:24px">${[['config', 'Configuração'], ['cobrancas', 'Cobranças emitidas'], ['inad', 'Inadimplência'], ['extra', 'Cobrança extra']].map(([k, l]) => chip(l, t === k, () => { FORM.ctab = k; rerender(); })).join('')}</div>`;
  let body = '';
  if (t === 'config') {
    const multa = FORM.multa ?? String(C.multa);
    const mErr = parseFloat(String(multa).replace(',', '.')) > 2 ? 'A multa por atraso não pode passar de 2% (Código Civil, art. 1.336, §1º).' : '';
    if (!FORM.formas) FORM.formas = ['pix', 'boleto'].concat(C.cartao ? ['cartao'] : []);
    const formas = FORM.formas;
    body = `<div class="form stack-5">${sw('Módulo de cobrança ativo', C.ativo, () => { C.ativo = !C.ativo; rerender(); toast(C.ativo ? 'Cobrança ativa.' : 'Cobrança desativada.'); })}
      <div class="field"><span class="field-label">Formas de pagamento</span><div class="stack-2">${choice('formas', 'pix', 'Pix', { multi: true })}${choice('formas', 'boleto', 'Boleto', { multi: true })}${choice('formas', 'cartao', 'Cartão de crédito', { multi: true })}</div>${formas.length ? '' : `<span class="error-msg">${ic('circle-x')}Escolha pelo menos uma forma de pagamento.</span>`}</div>
      <div class="grid-2">${field('Valor da taxa', input('ctv', { value: FORM.ctv ?? 'R$ 620,00', inputmode: 'decimal' }))}${field('Dia do vencimento', input('ctd', { value: FORM.ctd ?? '10', inputmode: 'numeric' }), { help: 'Padrão: 10. Permitido: de 1 a 28.' })}</div>
      <div class="grid-2">${field('Multa por atraso (%)', input('multa', { value: multa, inputmode: 'decimal' }), { error: mErr, help: mErr ? '' : 'Padrão: 2%. Permitido: de 0% a 2%.' })}${field('Juros ao mês (%)', input('juros', { value: FORM.juros ?? '1', inputmode: 'decimal' }), { help: 'Padrão: 1%. Proporcionais aos dias de atraso.' })}</div>
      ${sw('Bloquear reservas de unidades em atraso', C.bloqueioReserva, () => { C.bloqueioReserva = !C.bloqueioReserva; toast('Preferência salva.'); })}
      ${btn('Salvar configuração', { disabled: !!mErr || !formas.length, on: () => { C.multa = parseFloat(String(multa).replace(',', '.')); C.cartao = formas.includes('cartao'); toast('Configuração de cobrança salva.'); } })}
      <p class="help" style="margin:0">Dica do protótipo: digite 3 na multa e saia do campo.</p></div>`;
  } else if (t === 'cobrancas') {
    body = table([{ t: 'Unidade' }, { t: 'Referência' }, { t: 'Tipo' }, { t: 'Emitida para' }, { t: 'Vencimento' }, { t: 'Valor', r: true }, { t: 'Estado' }, { t: '', r: true }], [
      ['Bloco A · Apto 101', 'Novembro de 2026', '10/11', 620, 'Emitida', 'Ordinária', 'Ana Lima'], ['Bloco A · Apto 204', 'Outubro de 2026', '10/10', 620, 'Paga', 'Ordinária', 'Paulo Lima'], ['Bloco C · Apto 504', 'Outubro de 2026', '10/10', 632.4, 'Em atraso', 'Ordinária', 'Rafael Costa'], ['Bloco B · Apto 302', 'Novembro de 2026', '10/11', 620, 'Emitida', 'Ordinária', 'Marina Souza · inquilina'], ['Bloco B · Apto 302', 'Fundo de obras · parcela 2 de 3', '10/12', 180, 'Emitida', 'Extraordinária', 'Helena Duarte · proprietária'],
    ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[5]}</td><td>${r[6]}</td><td class="num">${r[2]}</td><td class="r">${money(r[3])}</td><td>${st(r[4])}</td>${menuCell([['file-check', 'Registrar pagamento fora do app', () => sheet(`<h2 class="t-title-md">Pagamento fora do app</h2>${field('Data do pagamento', input('pfd', { type: 'date' }))}<div class="field"><span class="field-label">Comprovante</span>${photoPicker('pfc')}</div>${btn('Registrar pagamento', { block: true, on: () => { closeLayer(); toast('Cobrança marcada como paga.'); } })}`)],
      ['circle-x', 'Cancelar cobrança', () => dialog({ tone: 'danger', icon: 'triangle-alert', title: 'Cancelar esta cobrança?', text: 'O motivo fica registrado na auditoria.', body: field('Motivo', textarea('cmot')), actions: [{ label: 'Cancelar cobrança', v: 'danger', on: () => toast('Cobrança cancelada. Motivo registrado.') }, { label: 'Manter cobrança', v: 'secondary' }] })]])}</tr>`));
  } else if (t === 'inad') {
    body = `<div class="row" style="margin-bottom:16px">${btn('Exportar CSV', { v: 'secondary', icon: 'download', on: () => toast('inadimplencia.csv baixado para a contabilidade.') })}</div>
      ${table([{ t: 'Unidade' }, { t: 'Responsável financeiro' }, { t: 'Cobranças' }, { t: 'Dias em atraso', r: true }, { t: 'Valor atualizado', r: true }], S.inad.map(u => `<tr><td><b>${u.un}</b></td><td>${u.resp}</td><td>${u.cobr}</td><td class="r">${u.dias}</td><td class="r">${money(u.valor)}</td></tr>`))}`;
  } else {
    body = `<div class="form stack-5">${banner('info', 'inbox', 'Pedido do síndico: Fundo de obras · R$ 180,00 por unidade.', { inline: true })}
      ${field('Descrição', input('exd', { value: FORM.exd ?? 'Fundo de obras' }))}${field('Valor por unidade', input('exv', { value: FORM.exv ?? 'R$ 180,00', inputmode: 'decimal' }))}
      <div class="field"><span class="field-label">Tipo</span>${choice('ext', 'Extraordinária', 'Extraordinária', { def: 'Extraordinária', sub: 'Fundo de reserva, obras e benfeitorias. Na unidade alugada, vai ao proprietário.' })}${choice('ext', 'Ordinária', 'Ordinária', { def: 'Extraordinária', sub: 'Despesas da rotina e multa por infração. Na unidade alugada, vai ao inquilino.' })}</div>
      <div class="field"><span class="field-label">Unidades</span>${choice('exu', 'todas', 'Todas as unidades', { def: 'todas' })}${choice('exu', 'algumas', 'Escolher unidades', { def: 'todas' })}</div>
      ${field('Vencimento', input('exven', { type: 'date', value: '2026-12-10' }))}
      ${btn('Lançar cobrança extra', { on: () => toast(`Cobrança extra emitida para 120 unidades. Nas alugadas, foi para ${(FORM.ext || 'Extraordinária') === 'Extraordinária' ? 'o proprietário' : 'o inquilino'}.`) })}</div>`;
  }
  return { nav: 'cobranca', body: head('Cobrança', 'Taxa condominial, cobranças extras e inadimplência. Só administradora e síndico veem esta área.') + tabs + body,
    after: () => { const el = $('#f-multa'); el && el.addEventListener('blur', () => rerender()); } };
});

def('admin', 'comunicados', 'Comunicados', 'Comunicação (10.1)', () => ({
  nav: 'comunicados',
  body: `${head('Comunicados', 'Só o síndico, ou o subsíndico em substituição, envia comunicados. A administradora acompanha a leitura.')}
    ${table([{ t: 'Título' }, { t: 'Público' }, { t: 'Enviado' }, { t: 'Leitura', r: true }], S.comunicados.filter(c => !c.individual).map(c => `<tr><td><b>${c.titulo}</b></td><td>${c.publico}</td><td>${c.data}</td><td class="r">${c.lidos} de ${c.total}</td></tr>`))}`,
}));

/* ---- Reuniões, mandatos e substituição (4.4, 11.2) ---- */
def('admin', 'reunioes', 'Reuniões e mandatos', 'Mandatos (4.4)', () => ({
  nav: 'reunioes',
  body: `${head('Reuniões e mandatos', '', btn('Abrir eleição', { icon: 'vote', on: () => toast('Eleição 2027–2028 aberta. Candidaturas até 15/11.') }))}
    <h2 class="t-title-sm" style="margin-bottom:12px">Mandatos ativos</h2>
    ${table([{ t: 'Cargo' }, { t: 'Nome' }, { t: 'Unidade' }, { t: 'Início' }, { t: 'Fim' }, { t: '', r: true }], S.mandatos.map(m => `<tr><td><b>${m.cargo}</b></td><td>${m.nome}</td><td>${m.un}</td><td class="num">${m.ini}</td><td class="num">${m.fim}</td>${menuCell([['calendar-x', 'Encerrar mandato antes do fim', () => dialog({ tone: 'danger', icon: 'triangle-alert', title: `Encerrar o mandato de ${m.nome}?`, text: m.cargo === 'Síndico' ? 'A subsíndica assume até a nova eleição. Você será levada a abrir a eleição.' : 'O cargo fica vago até a próxima eleição.', actions: [{ label: 'Encerrar mandato', v: 'danger', on: () => toast('Mandato encerrado. Abra a nova eleição.') }, { label: 'Cancelar', v: 'secondary' }] })]])}</tr>`))}
    <div class="grid-2" style="margin-top:24px"><section class="card"><h2 class="t-title-sm">Substituição do síndico</h2>${sw('Subsíndica assume as funções de síndico', S.substituicao, () => { S.substituicao = !S.substituicao; rerender(); toast(S.substituicao ? 'Substituição ativa.' : 'Funções voltaram ao síndico.'); }, { sub: 'Ativada pela administradora ou pelo síndico. Tudo fica registrado.' })}</section>
      <section class="card"><h2 class="t-title-sm">Regras de eleição</h2>${sw('Permitir reeleição', true, () => toast('Preferência salva.'))}<p class="help">Em empate, segundo turno em até 7 dias.</p></section></div>
    <h2 class="t-title-sm" style="margin:24px 0 12px">Reuniões</h2>
    ${table([{ t: 'Reunião' }, { t: 'Data' }, { t: 'Estado' }], S.reunioes.map(g => `<tr><td><b>${g.titulo}</b></td><td>${g.data}</td><td>${st(g.estado)}</td></tr>`))}`,
}));

/* ---- Solicitações (4.2) ---- */
def('admin', 'solicitacoes', 'Solicitações', 'Solicitações (4.2)', () => ({
  nav: 'solicitacoes',
  body: `${head('Solicitações do síndico e dos proprietários', `Franquia do plano Gestão + Suporte: ${S.franquia.usadas} de ${S.franquia.total} usadas este mês. Recusadas não contam.`)}
    ${table([{ t: 'Data' }, { t: 'Tipo' }, { t: 'Pedido por' }, { t: 'Detalhe' }, { t: 'Estado' }, { t: '', r: true }], S.solicitacoes.map(s => `<tr><td class="num">${s.data}</td><td><b>${s.tipo}</b></td><td>${s.por}</td><td>${s.det}${s.motivo ? `<div class="t-caption muted">Motivo: ${s.motivo}</div>` : ''}</td><td>${st(s.estado)}</td><td class="r">${s.estado === 'Pendente' ? `<span class="row" style="justify-content:flex-end">${btn('Recusar', { v: 'secondary', size: 'sm', on: () => dialog({ title: 'Recusar a solicitação?', text: 'O síndico recebe o motivo. A recusa não conta na franquia.', body: field('Motivo', textarea('smot')), actions: [{ label: 'Recusar', v: 'danger', on: () => { s.estado = 'Recusada'; s.motivo = FORM.smot || 'Dados incompletos.'; S.franquia.usadas = Math.max(0, S.franquia.usadas - 1); rerender(); toast('Solicitação recusada. Quem pediu foi avisado.'); } }, { label: 'Voltar', v: 'secondary' }] }) })}${btn('Atender', { size: 'sm', on: () => { s.estado = 'Concluída'; rerender(); toast('Solicitação concluída. Quem pediu foi avisado.'); } })}</span>` : ''}</td></tr>`))}`,
}));

/* ---- Lista de bloqueio ---- */
def('admin', 'bloqueio', 'Lista de bloqueio', 'Portaria', () => ({
  nav: 'bloqueio',
  body: `${head('Lista de bloqueio', 'Pessoas com entrada bloqueada. A portaria vê um alerta com o motivo.', btn('Adicionar pessoa', { icon: 'plus', on: () => sheet(`<h2 class="t-title-md">Bloquear entrada</h2>${field('Nome', input('bn'))}${field('Documento (opcional)', input('bd'))}${field('Motivo', textarea('bm'))}${btn('Adicionar à lista', { v: 'danger', block: true, on: () => { if ((FORM.bn || '').trim()) S.bloqueados.push({ nome: FORM.bn, doc: FORM.bd || '—', motivo: FORM.bm || '—', desde: 'hoje' }); closeLayer(); rerender(); toast('Pessoa adicionada à lista de bloqueio.'); } })}`) }))}
    ${table([{ t: 'Nome' }, { t: 'Documento' }, { t: 'Motivo' }, { t: 'Desde' }, { t: '', r: true }], S.bloqueados.map((b, i) => `<tr><td><span class="row">${ic('ban')}<b>${b.nome}</b></span></td><td>${b.doc}</td><td>${b.motivo}</td><td>${b.desde}</td><td class="r">${btn('Remover', { v: 'text', size: 'sm', on: () => { S.bloqueados.splice(i, 1); rerender(); toast('Pessoa removida da lista.'); } })}</td></tr>`))}`,
}));

/* ---- Configurações (11.9) ---- */
def('admin', 'configuracoes', 'Configurações', 'Configurações', () => ({
  nav: 'configuracoes',
  body: `${head('Configurações', 'Cada parâmetro mostra o padrão da plataforma, o valor do condomínio e a faixa permitida.')}
    ${table([{ t: 'Parâmetro' }, { t: 'Valor do condomínio' }, { t: 'Padrão' }, { t: 'Permitido' }, { t: 'Origem' }], S.params.map((p, i) => {
      const err = p.err ? `<div class="error-msg" style="margin-top:4px">${ic('circle-x')}Informe um valor entre ${p.min} e ${p.max}.</div>` : '';
      return `<tr><td><b>${p.k}</b></td><td style="padding-top:8px;padding-bottom:8px"><div class="row"><input class="input" style="width:96px;height:44px;${p.err ? 'border:2px solid var(--danger-fg)' : ''}" inputmode="numeric" value="${p.v}" data-param="${i}" aria-label="${p.k}"><span class="t-body-sm muted">${p.un}</span></div>${err}</td><td>${p.pad} ${p.un}</td><td>de ${p.min} a ${p.max}</td><td>${p.herd ? badge('Herdado do condomínio', 'neutral') : badge('Personalizado', 'info')}</td></tr>`;
    }), { foot: false })}
    <p class="help">Altere um valor e saia do campo para salvar. Valores fora da faixa são recusados.</p>`,
  after: () => document.querySelectorAll('[data-param]').forEach(el => el.addEventListener('change', () => {
    const p = S.params[+el.dataset.param], v = parseFloat(el.value);
    if (isNaN(v) || v < p.min || v > p.max) { p.err = true; rerender(); return; }
    p.err = false; p.v = v; p.herd = v === p.pad; rerender(); toast(p.k + ' salvo.');
  })),
}));
