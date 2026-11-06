/* Finanças do condomínio (11.15): fluxos 13.3 e 13.4.
   Administradora edita (web); síndico, subsíndico em substituição e conselho fiscal só leem, comentam e exportam (RN-FI-29). */
'use strict';

const FIN = () => S.fin;
const fPer = () => FORM.fper || '2026-10';
const fMeses = per => /^\d+m$/.test(per) ? FIN_MESES.slice(-parseInt(per, 10)) : [per];
const fDia = iso => iso.slice(8) + '/' + iso.slice(5, 7);
const fEfeito = l => (l.tipo === 'receita' ? 1 : -1) * l.valor;
const fSoma = (arr, tipo) => arr.filter(l => l.tipo === tipo).reduce((a, l) => a + l.valor, 0);
const fPct = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',') + '%';
const fMesAnt = ym => FIN_MESES[FIN_MESES.indexOf(ym) - 1];
const fStatus = ym => FIN().fechados.includes(ym) ? 'fechado' : (ym < FIN().mesAtual ? 'terminado' : 'aberto');
const fPodeLer = p => p === 'admin' || (p === 'sindico') || (p === 'subsindico' && S.substituicao) || (p === 'morador' && S.conselho);

function fDados(per) {
  const ms = fMeses(per), L = FIN().lanc.filter(l => ms.includes(l.ym));
  const rec = fSoma(L, 'receita'), desp = fSoma(L, 'despesa');
  const ant = ms.length === 1 && fMesAnt(per) ? (() => { const A = FIN().lanc.filter(l => l.ym === fMesAnt(per)); return { ym: fMesAnt(per), rec: fSoma(A, 'receita'), desp: fSoma(A, 'despesa'), L: A }; })() : null;
  const cats = Object.keys(FIN_CATS_D).map(k => {
    const v = L.filter(l => l.tipo === 'despesa' && l.cat === k).reduce((a, l) => a + l.valor, 0);
    const a = ant ? ant.L.filter(l => l.tipo === 'despesa' && l.cat === k).reduce((x, l) => x + l.valor, 0) : null;
    return { k, nome: FIN_CATS_D[k], v, a, pct: desp ? v / desp * 100 : 0 };
  }).filter(c => c.v !== 0).sort((a, b) => b.v - a.v);
  const origens = Object.keys(FIN_CATS_R).map(k => {
    const R = L.filter(l => l.tipo === 'receita' && l.cat === k);
    return { k, nome: FIN_CATS_R[k], v: R.reduce((a, l) => a + l.valor, 0), auto: R.some(l => l.origem === 'auto'), qtd: R.reduce((a, l) => a + (l.qtd || 0), 0) };
  }).filter(o => o.v);
  const extra = L.filter(l => l.tipo === 'receita' && l.cat === 'extras').reduce((a, l) => a + l.valor, 0);
  return { ms, L, rec, desp, saldo: rec - desp, ant, cats, origens, extra };
}
const fVar = (v, a, ym) => {
  if (a == null) return '';
  const d = v - a, p = a ? Math.abs(d) / Math.abs(a) * 100 : 0;
  const ic_ = d > 0 ? 'trending-up' : d < 0 ? 'trending-down' : 'minus';
  const t = d === 0 ? 'Igual a ' + finMesNome(ym) : fPct(p) + (d > 0 ? ' a mais' : ' a menos') + ' que ' + finMesNome(ym);
  return `<span class="t-body-sm muted row" style="gap:4px">${ic(ic_)}${t}</span>`;
};
const fSinal = l => (fEfeito(l) >= 0 ? '+ ' : '− ') + money(Math.abs(l.valor));
const fComp = l => l.comp ? `<span class="row" style="gap:4px">${ic('paperclip')}Anexado</span>` : `<span class="row muted" style="gap:4px">${ic('paperclip')}Não anexado</span>`;
const fComents = alvo => FIN().coment.filter(c => c.alvo === alvo);

function fPeriodoChips() {
  const per = fPer();
  const meses = FIN_MESES.slice().reverse().map(m => [m, finMesLabel(m).replace(' de ', '/').slice(0, 3) + '/' + m.slice(2, 4)]);
  return `<div class="chips scroll" style="margin-bottom:16px" role="group" aria-label="Período">${meses.map(([m, l]) => chip(l.charAt(0).toUpperCase() + l.slice(1), per === m, () => { FORM.fper = m; rerender(); })).join('')}${[['3m', '3 meses'], ['6m', '6 meses'], ['12m', '12 meses']].map(([k, l]) => chip(l, per === k, () => { FORM.fper = k; rerender(); })).join('')}</div>`;
}
function fFaixaMes(per, adm) {
  if (/m$/.test(per)) return '';
  const s = fStatus(per);
  if (s === 'fechado') return banner('neutral', 'lock', `Mês fechado em ${FIN().fechadoEm[per]}. Alterações só por estorno.`, { inline: true });
  if (s === 'terminado') return banner('info', 'info', `${finMesLabel(per).split(' ')[0]} terminou. Fecha sozinho em ${FIN().diaFech}/11.`, { inline: true, action: adm ? btn('Fechar ' + finMesNome(per) + ' agora', { v: 'secondary', size: 'sm', on: () => fFechar(per) }) : '' });
  return banner('info', 'info', 'Mês em andamento. Receitas de cobrança entram sozinhas quando o pagamento é confirmado.', { inline: true });
}
function fMesBadge(per) {
  if (/m$/.test(per)) return '';
  const s = fStatus(per);
  return s === 'fechado' ? badge('Fechado', 'neutral', 'lock') : badge('Aberto', 'info');
}
function fFechar(ym) {
  const sem = FIN().lanc.filter(l => l.ym === ym && l.tipo === 'despesa' && !l.comp).length;
  dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Fechar ' + finMesNome(ym) + '?',
    text: (sem ? `${sem} ${sem > 1 ? 'despesas estão sem comprovante' : 'despesa está sem comprovante'}. ` : '') + 'Depois de fechar, o mês só aceita estorno.',
    actions: [{ label: sem ? 'Fechar mesmo assim' : 'Fechar mês', on: () => { FIN().fechados.push(ym); FIN().fechadoEm[ym] = '05/11'; rerender(); toast(finMesLabel(ym).split(' ')[0] + ' fechado.'); } }, { label: 'Voltar', v: 'secondary' }] });
}

/* Resumo em cartões */
function fResumo(D, per) {
  const cmp = (k) => D.ant ? fVar(D[k], D.ant[k], D.ant.ym) : '';
  const cmpSaldo = D.ant ? fVar(D.saldo, D.ant.rec - D.ant.desp, D.ant.ym) : '';
  return `<div class="kpis"><div class="kpi"><div class="t-body-sm muted">Receitas</div><div class="v">${money(D.rec)}</div>${cmp('rec')}</div>
    <div class="kpi"><div class="t-body-sm muted">Despesas</div><div class="v">${money(D.desp)}</div>${cmp('desp')}</div>
    <div class="kpi"><div class="t-body-sm muted">Saldo</div><div class="v">${money(Math.abs(D.saldo))}</div><span class="t-body-sm row" style="gap:4px">${D.saldo < 0 ? ic('triangle-alert') + 'Déficit' : ic('circle-check') + 'Superávit'}</span>${cmpSaldo}</div></div>
    ${D.extra ? `<p class="help" style="margin:8px 0 0">Inclui ${money(D.extra)} de cobranças extraordinárias (fundo de reserva e obras).</p>` : ''}`;
}
function fCategorias(D) {
  const max = D.cats.length ? D.cats[0].v : 1;
  const top = D.cats[0];
  const resumo = top ? `Maior despesa: ${top.nome}, ${money(top.v)}, ${fPct(top.pct)} do total.` : 'Sem despesas no período.';
  return `<div class="bars" role="img" aria-label="${resumo}">${D.cats.map(c => `<div class="bar-row wide"><span>${c.nome}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${Math.max(2, c.v / max * 100)}%"></span></span><span class="r num">${fPct(c.pct)}</span></div>`).join('')}</div>
    <p class="help" style="margin:8px 0 0">${resumo}</p>`;
}
function fTabelaCats(D) {
  const rows = D.cats.map(c => `<tr><td>${c.nome}</td><td class="r">${money(c.v)}</td><td class="r">${fPct(c.pct)}</td><td class="r">${c.a == null ? '—' : (c.v - c.a === 0 ? 'Igual' : (c.v > c.a ? '+ ' : '− ') + money(Math.abs(c.v - c.a)))}</td></tr>`);
  rows.push(`<tr><td><b>Total</b></td><td class="r"><b>${money(D.desp)}</b></td><td class="r">100%</td><td class="r">${D.ant ? ((D.desp - D.ant.desp >= 0 ? '+ ' : '− ') + money(Math.abs(D.desp - D.ant.desp))) : '—'}</td></tr>`);
  return table([{ t: 'Categoria' }, { t: 'Valor', r: true }, { t: '%', r: true }, { t: D.ant ? 'vs. ' + finMesNome(D.ant.ym) : 'Variação', r: true }], rows, { foot: false });
}
function fOrigens(D) {
  return table([{ t: 'Categoria' }, { t: 'Origem' }, { t: 'Valor', r: true }], D.origens.map(o => `<tr><td>${o.nome}</td><td>${o.auto ? badge('Automático', 'neutral', 'zap') + ' <span class="t-body-sm muted">' + (o.qtd ? o.qtd + (o.k === 'areas' ? ' reservas pagas' : ' cobranças pagas') : '') + '</span>' : badge('Avulso', 'neutral')}</td><td class="r">${money(o.v)}</td></tr>`), { foot: false });
}

/* Evolução: barras agrupadas em SVG (4.7), com resumo em texto e tabela equivalente */
function fEvolucao() {
  const n = FORM.fevo === 12 ? 12 : 6, ms = FIN_MESES.slice(-n);
  const dados = ms.map(m => { const L = FIN().lanc.filter(l => l.ym === m); return { m, r: fSoma(L, 'receita'), d: fSoma(L, 'despesa') }; });
  const max = Math.max(...dados.map(x => Math.max(x.r, x.d))), W = 640, H = 220, base = 190, gw = W / n;
  const bw = Math.min(26, gw / 2 - 6), hh = v => Math.round(v / max * 150);
  const k = v => Math.round(v / 1000) + ' mil';
  const resumo = `Receitas e despesas dos últimos ${n} meses. Em ${finMesNome(ms[n - 1])}: receitas de ${money(dados[n - 1].r)} e despesas de ${money(dados[n - 1].d)}.`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${resumo}" style="max-width:${W}px">
    <line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="var(--border-divider)" stroke-width="2"/>
    ${dados.map((x, i) => { const cx = i * gw + gw / 2;
      return `<rect x="${cx - bw - 2}" y="${base - hh(x.r)}" width="${bw}" height="${hh(x.r)}" rx="3" fill="var(--chart-1)"/>
      <rect x="${cx + 2}" y="${base - hh(x.d)}" width="${bw}" height="${hh(x.d)}" rx="3" fill="var(--chart-2)" stroke="var(--coral-700)" stroke-width="1.5"/>
      ${n === 6 ? `<text x="${cx - bw / 2 - 2}" y="${base - hh(x.r) - 5}" text-anchor="middle" font-size="11" fill="var(--text-primary)">${k(x.r)}</text><text x="${cx + bw / 2 + 2}" y="${base - hh(x.d) - 5}" text-anchor="middle" font-size="11" fill="var(--text-primary)">${k(x.d)}</text>` : ''}
      <text x="${cx}" y="${base + 18}" text-anchor="middle" font-size="12" fill="var(--text-secondary)">${finMesCurto(x.m)}</text>`; }).join('')}</svg>`;
  const tab = table([{ t: 'Mês' }, { t: 'Receitas', r: true }, { t: 'Despesas', r: true }, { t: 'Saldo', r: true }], dados.map(x => `<tr><td>${finMesLabel(x.m)}</td><td class="r">${money(x.r)}</td><td class="r">${money(x.d)}</td><td class="r">${(x.r - x.d < 0 ? '− ' : '') + money(Math.abs(x.r - x.d))}</td></tr>`), { foot: false });
  return `<div class="chips" style="margin-bottom:12px">${chip('6 meses', n === 6, () => { FORM.fevo = 6; FORM.fevoTab = false; rerender(); })}${chip('12 meses', n === 12, () => { FORM.fevo = 12; rerender(); })}</div>
    ${svg}
    <div class="row wrap t-body-sm" style="gap:16px;margin:4px 0 8px"><span class="row" style="gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:var(--chart-1);display:inline-block"></span>Receitas</span><span class="row" style="gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:var(--chart-2);border:1.5px solid var(--coral-700);display:inline-block"></span>Despesas</span></div>
    ${btn(FORM.fevoTab ? 'Ocultar tabela' : 'Ver como tabela', { v: 'text', on: () => { FORM.fevoTab = !FORM.fevoTab; rerender(); } })}${FORM.fevoTab ? tab : ''}`;
}

/* Lançamentos filtrados */
function fFiltrados(D) {
  const t = FORM.ftipo || 'todos', c = FORM.fcat || '', q = (FORM.fq || '').toLowerCase();
  return D.L.filter(l => (t === 'todos' || l.tipo === t.replace(/s$/, '')) && (!c || l.cat === c) && (!q || (l.desc + ' ' + l.forn).toLowerCase().includes(q)))
    .sort((a, b) => b.data.localeCompare(a.data));
}
function fFiltros() {
  const t = FORM.ftipo || 'todos';
  const todas = Object.assign({}, FIN_CATS_D, FIN_CATS_R);
  return `<div class="row wrap" style="margin-bottom:16px;gap:12px">
    <div style="min-width:220px;flex:1">${input('fq', { ph: 'Buscar descrição ou fornecedor', icon: 'search' })}</div>
    <select class="select" id="f-fcat" data-bind="fcat" aria-label="Categoria" style="width:220px"><option value="">Todas as categorias</option>${Object.entries(todas).map(([k, v]) => `<option value="${k}" ${FORM.fcat === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <div class="chips">${[['todos', 'Todos'], ['receitas', 'Receitas'], ['despesas', 'Despesas']].map(([k, l]) => chip(l, t === k, () => { FORM.ftipo = k; rerender(); })).join('')}</div></div>`;
}
const fAfter = () => { const e = $('#f-fcat'); e && e.addEventListener('change', () => rerender()); const q = $('#f-fq'); q && q.addEventListener('change', () => rerender()); };

function fExportar(fmt, D) {
  const n = fFiltrados(D).length;
  toast(`financeiro-${/m$/.test(fPer()) ? fPer() + '-' + fPer().slice(0, -1) : fPer()}.${fmt} baixado (${n} lançamentos, sem dados de unidade).`);
}

function fDetalhe(id, adm, p) {
  const l = FIN().lanc.find(x => x.id === id); if (!l) return;
  const cm = () => fComents(id);
  sheet(() => {
    const fech = FIN().fechados.includes(l.ym);
    return `<h2 class="t-title-md">${l.desc}</h2>
    <div class="stack-2">${[['Data', fDia(l.data) + '/' + l.data.slice(0, 4)], ['Categoria', (l.tipo === 'receita' ? FIN_CATS_R : FIN_CATS_D)[l.cat] + (l.sub && l.cat === 'terc' ? ' · ' + l.sub : '')], [l.tipo === 'receita' ? 'Origem' : 'Fornecedor', l.forn], ['Valor', fSinal(l)], ['Comprovante', l.comp ? 'Anexado' : 'Não anexado'], ['Recorrente', l.rec ? 'Sim, todo mês' : 'Não']].map(([k, v]) => `<div class="row" style="justify-content:space-between"><span class="muted">${k}</span><b>${v}</b></div>`).join('')}</div>
    ${l.origem === 'auto' ? banner('info', 'zap', 'Vem de cobranças ou reservas pagas, sem unidade. Para corrigir, altere a cobrança ou a reserva.', { inline: true }) : ''}
    ${l.estornado ? banner('warning', 'undo-2', 'Estornado. Veja o estorno na lista.', { inline: true }) : ''}${l.estornoDe ? banner('neutral', 'undo-2', 'Estorno de lançamento de mês fechado. Motivo: ' + l.motivo, { inline: true }) : ''}
    ${l.origem === 'manual' && adm ? `<p class="t-caption muted" style="margin:0">Lançado pela administradora. ${fech ? 'Mês fechado: só estorno.' : 'Histórico de alterações na auditoria.'}</p>` : ''}
    <h3 class="t-title-sm">Comentários</h3>${cm().length ? cm().map(c => `<div class="card"><div class="t-label-sm">${c.por} · ${c.papel} · ${c.data}</div><div class="t-body-sm">${c.txt}</div></div>`).join('') : '<p class="help">Nenhum comentário.</p>'}
    ${!adm ? btn('Comentar', { v: 'secondary', icon: 'message-circle', block: true, on: () => fComentar(id, p) }) : ''}`;
  });
}
function fComentar(alvo, p) {
  FORM.fcom = ''; FORM.fcomErr = '';
  const papel = p === 'sindico' ? 'Síndico' : p === 'subsindico' ? 'Subsíndico em substituição' : 'Conselho fiscal';
  const por = p === 'sindico' ? 'Pedro Alves' : p === 'subsindico' ? 'Carla Mendes' : 'Luiza Prado';
  sheet(() => `<h2 class="t-title-md">${String(alvo).startsWith('mes:') ? 'Comentar ' + finMesNome(alvo.slice(4)) : 'Comentar lançamento'}</h2>
    <p class="t-body-sm muted">A administradora é avisada. O comentário não altera valores nem aprova o mês.</p>${field('Comentário', textarea('fcom'), { error: FORM.fcomErr })}
    ${btn('Enviar comentário', { block: true, on: () => { if (!(FORM.fcom || '').trim()) { FORM.fcomErr = 'Escreva o comentário.'; return sheet(CUR_SHEET[0], CUR_SHEET[1]); } FORM.fcomErr = ''; FIN().coment.push({ id: 'k' + uid(), alvo, por, papel, data: '05/11', txt: FORM.fcom.trim(), novo: true }); closeLayer(); rerender(); toast('Comentário enviado. A administradora foi avisada.'); } })}`);
}

/* ---- Novo lançamento e edição (administradora) ---- */
function fForm(edit) {
  const e = edit || null;
  if (!FORM.ftp) Object.assign(FORM, { ftp: e ? e.tipo : 'despesa', fdata: e ? e.data : FIN().hoje, fcategoria: e ? e.cat : 'energia', fserv: e ? e.sub : 'Elevador', fval: e ? String(e.valor).replace('.', ',') : '', fforn: e ? e.forn : '', fdesc: e ? e.desc : '', frec: e ? e.rec : false, fcomp: e && e.comp ? [1] : [] });
  const tp = FORM.ftp, cats = tp === 'receita' ? (FIN().cobrancaAtiva ? { outras: FIN_CATS_R.outras } : { outras: FIN_CATS_R.outras, taxa: FIN_CATS_R.taxa, extras: 'Fundo de reserva' }) : FIN_CATS_D;
  if (!cats[FORM.fcategoria]) FORM.fcategoria = Object.keys(cats)[0];
  const E = () => FORM.ferr || {};
  sheet(() => `<h2 class="t-title-md">${e ? 'Editar lançamento' : 'Novo lançamento'}</h2>
    <div class="field"><span class="field-label">Tipo</span><div class="stack-2">${choice('ftp', 'despesa', 'Despesa')}${choice('ftp', 'receita', 'Receita avulsa')}</div></div>
    ${tp === 'receita' ? banner('info', 'info', 'Taxas, multas, fundo de reserva e aluguel de áreas entram sozinhos das cobranças e reservas pagas.', { inline: true }) : ''}
    ${field('Data', input('fdata', { type: 'date', attr: 'max="' + FIN().hoje + '"' }), { error: E().data })}
    ${field('Categoria', `<select class="select" data-bind="fcategoria">${Object.entries(cats).map(([k, v]) => `<option value="${k}" ${FORM.fcategoria === k ? 'selected' : ''}>${v}</option>`).join('')}</select>`)}
    ${tp === 'despesa' && FORM.fcategoria === 'terc' ? `<div class="field"><span class="field-label">Serviço</span><div class="chips">${FIN_SERVICOS.map(s => chip(s, FORM.fserv === s, () => { FORM.fserv = s; sheet(CUR_SHEET[0], CUR_SHEET[1]); })).join('')}</div></div>` : ''}
    ${tp === 'despesa' && FORM.fcategoria === 'folha' ? banner('info', 'info', 'Informe só o total da folha do mês, sem nomes nem salários.', { inline: true }) : ''}
    ${field('Valor', input('fval', { inputmode: 'decimal', ph: 'R$ 0,00' }), { error: E().valor })}
    ${field(tp === 'receita' ? 'Origem' : 'Fornecedor', input('fforn'), { error: E().forn })}
    ${field('Descrição (opcional)', input('fdesc'))}
    <div class="field"><span class="field-label">Comprovante (opcional)</span>${photoPickerSheet('fcomp')}</div>
    ${sw('Repetir todo mês', !!FORM.frec, () => { FORM.frec = !FORM.frec; }, { sub: 'Só para valor fixo. Contas variáveis, como energia e água, são digitadas todo mês.' })}
    ${btn(e ? 'Salvar alterações' : 'Salvar lançamento', { block: true, on: () => fSalvar(e) })}`);
  const sel = document.querySelector('#layer select[data-bind="fcategoria"]'); sel && sel.addEventListener('change', () => sheet(CUR_SHEET[0], CUR_SHEET[1]));
}
const photoPickerSheet = key => `<div class="row">${(FORM[key] || []).length ? `<span class="row" style="gap:6px">${ic('file-check')}Comprovante anexado</span>${btn('Remover', { v: 'text', on: () => { FORM[key] = []; sheet(CUR_SHEET[0], CUR_SHEET[1]); } })}` : btn('Anexar foto ou PDF', { v: 'secondary', icon: 'paperclip', on: () => { FORM[key] = [1]; sheet(CUR_SHEET[0], CUR_SHEET[1]); } })}</div>`;
function fSalvar(e) {
  const er = {}, v = parseFloat(String(FORM.fval || '').replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
  const data = FORM.fdata || '';
  if (!(v > 0)) er.valor = 'Informe um valor maior que zero.';
  if (FORM.ftp === 'despesa' && !(FORM.fforn || '').trim()) er.forn = 'Informe o fornecedor.';
  if (FORM.ftp === 'receita' && !(FORM.fforn || '').trim()) er.forn = 'Informe a origem.';
  if (data > FIN().hoje) er.data = 'A data não pode ser futura.';
  else if (FIN().fechados.includes(data.slice(0, 7))) er.data = 'Este mês está fechado. Use a data de um mês aberto ou estorne um lançamento.';
  FORM.ferr = er;
  if (Object.keys(er).length) return fForm(e);
  const o = { ym: data.slice(0, 7), data, tipo: FORM.ftp, cat: FORM.fcategoria, sub: FORM.fcategoria === 'terc' ? FORM.fserv : '', desc: FORM.fdesc || (FORM.ftp === 'receita' ? FIN_CATS_R : FIN_CATS_D)[FORM.fcategoria], forn: FORM.fforn.trim(), valor: v, comp: (FORM.fcomp || []).length > 0, rec: !!FORM.frec };
  if (e) Object.assign(e, o); else FIN().lanc.push(Object.assign({ id: 'f' + (++FIN().n), origem: 'manual', qtd: 0 }, o));
  FORM.ferr = {}; closeLayer(); ['ftp', 'fdata', 'fcategoria', 'fserv', 'fval', 'fforn', 'fdesc', 'frec', 'fcomp'].forEach(k => delete FORM[k]);
  FORM.fper = o.ym; rerender(); toast(e ? 'Lançamento atualizado. A alteração ficou na auditoria.' : 'Lançamento salvo.' + (o.rec ? ' Será repetido todo mês.' : ''));
}
function fNovo(edit) { ['ftp', 'fdata', 'fcategoria', 'fserv', 'fval', 'fforn', 'fdesc', 'frec', 'fcomp', 'ferr'].forEach(k => delete FORM[k]); fForm(edit); }
function fEstornar(l) {
  FORM.fmot = '';
  const abre = () => dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Estornar este lançamento?', text: 'Cria um lançamento de valor oposto com a data de hoje. O original continua visível, como Estornado.',
    body: field('Motivo', textarea('fmot'), { error: FORM.fmotErr }),
    actions: [{ label: 'Estornar', keep: true, on: () => {
      if (!(FORM.fmot || '').trim()) { FORM.fmotErr = 'Informe o motivo do estorno.'; return abre(); }
      FORM.fmotErr = ''; closeLayer();
      const n = { id: 'f' + (++FIN().n), ym: FIN().mesAtual, data: FIN().hoje, tipo: l.tipo, cat: l.cat, sub: l.sub, desc: 'Estorno: ' + l.desc, forn: l.forn, valor: -l.valor, comp: l.comp, rec: false, origem: 'manual', qtd: 0, estornoDe: l.id, motivo: FORM.fmot.trim() };
      FIN().lanc.push(n); l.estornado = true; l.estornoId = n.id; rerender(); toast('Estorno lançado em 05/11.');
    } }, { label: 'Manter lançamento', v: 'secondary' }] });
  abre();
}
function fExcluir(l) {
  dialog({ tone: 'danger', icon: 'triangle-alert', title: 'Excluir este lançamento?', text: 'A exclusão fica na auditoria, com autor, data e valor.', actions: [{ label: 'Excluir', v: 'danger', on: () => { FIN().lanc.splice(FIN().lanc.indexOf(l), 1); rerender(); toast('Lançamento excluído.'); } }, { label: 'Manter', v: 'secondary' }] });
}

/* ---- Painel web da administradora ---- */
def('admin', 'financas', 'Finanças', 'Finanças (13.3)', () => {
  const per = fPer(), D = fDados(per), lista = fFiltrados(D), adm = true;
  const novos = FIN().coment.filter(c => c.novo).length;
  const acoes = l => {
    const fech = FIN().fechados.includes(l.ym), it = [['eye', 'Ver detalhe', () => fDetalhe(l.id, true, 'admin')]];
    if (l.origem === 'manual' && !fech) { it.push(['pencil', 'Editar', () => fNovo(l)], ['trash-2', 'Excluir', () => fExcluir(l)]); }
    if (l.origem === 'manual' && fech && !l.estornado && !l.estornoDe) it.push(['undo-2', 'Estornar', () => fEstornar(l)]);
    return menuCell(it);
  };
  const linhas = lista.map(l => `<tr><td class="num">${fDia(l.data)}</td><td><span class="row" style="gap:6px">${ic(l.tipo === 'receita' ? 'arrow-down-to-line' : 'arrow-up-from-line')}<span class="sr-only">${l.tipo === 'receita' ? 'Receita: ' : 'Despesa: '}</span><span style="${l.estornado ? 'text-decoration:line-through' : ''}">${l.desc}</span></span>
      <span class="row wrap" style="gap:4px;margin-top:2px">${l.origem === 'auto' ? badge('Automático', 'neutral', 'zap') : ''}${l.rec ? badge('Recorrente', 'neutral', 'repeat') : ''}${l.estornado ? badge('Estornado', 'warning', 'undo-2') : ''}${l.estornoDe ? badge('Estorno', 'neutral', 'undo-2') : ''}${fComents(l.id).length ? badge(fComents(l.id).some(c => c.novo) ? 'Novo comentário' : 'Comentário', fComents(l.id).some(c => c.novo) ? 'accent' : 'neutral', 'message-circle') : ''}</span></td>
      <td>${(l.tipo === 'receita' ? FIN_CATS_R : FIN_CATS_D)[l.cat]}${l.cat === 'terc' && l.sub ? ' · ' + l.sub : ''}</td><td>${l.forn}</td><td>${l.tipo === 'despesa' && l.origem === 'manual' ? fComp(l) : '—'}</td>
      <td class="r" style="${l.estornado ? 'text-decoration:line-through' : ''}">${fSinal(l)}</td>${acoes(l)}</tr>`);
  const tabela = lista.length ? table([{ t: 'Data' }, { t: 'Descrição' }, { t: 'Categoria' }, { t: 'Fornecedor ou origem' }, { t: 'Comprovante' }, { t: 'Valor', r: true }, { t: '', r: true }], linhas)
    : empty('search', 'Nenhum lançamento neste filtro.', btn('Limpar filtros', { v: 'secondary', on: () => { FORM.fq = ''; FORM.fcat = ''; FORM.ftipo = 'todos'; rerender(); } }));
  const rotulo = /m$/.test(per) ? 'últimos ' + per.replace('m', ' meses') : finMesLabel(per);
  return { nav: 'financas', after: fAfter, body: `${head('Finanças do condomínio', 'Controle gerencial de receitas e despesas. Não substitui a contabilidade.',
      btn('Exportar CSV', { v: 'secondary', icon: 'download', on: () => fExportar('csv', D) }) + btn('Exportar PDF', { v: 'secondary', icon: 'download', on: () => fExportar('pdf', D) }) + btn('Novo lançamento', { icon: 'plus', on: () => fNovo() }))}
    ${fPeriodoChips()}
    <div class="row wrap" style="margin-bottom:12px;gap:8px"><h2 class="t-title-sm" style="margin:0">${rotulo}</h2>${fMesBadge(per)}${novos ? badge(novos + ' novo comentário', 'accent', 'message-circle') : ''}</div>
    ${fFaixaMes(per, true)}<div style="height:16px"></div>
    ${fResumo(D, per)}
    <h2 class="t-title-sm" style="margin:32px 0 12px">Despesas por categoria</h2>
    <div class="grid-2"><div class="card">${fCategorias(D)}</div><div>${fTabelaCats(D)}</div></div>
    <h2 class="t-title-sm" style="margin:32px 0 12px">Receitas por origem</h2>${fOrigens(D)}
    <h2 class="t-title-sm" style="margin:32px 0 12px">Evolução mensal</h2><div class="card">${fEvolucao()}</div>
    <h2 class="t-title-sm" style="margin:32px 0 12px">Lançamentos</h2>${fFiltros()}${tabela}
    ${!/m$/.test(per) && fComents('mes:' + per).length ? `<h2 class="t-title-sm" style="margin:32px 0 12px">Comentários do mês</h2>${fComents('mes:' + per).map(c => `<div class="card"><div class="t-label-sm">${c.por} · ${c.papel} · ${c.data}</div><div class="t-body-sm">${c.txt}</div></div>`).join('')}` : ''}` };
});

/* ---- Leitura: síndico, subsíndico em substituição e conselho fiscal (app) ---- */
def(['sindico', 'subsindico', 'morador'], 'financas', 'Finanças do condomínio', 'Finanças (13.4)', ctx => {
  const p = ctx.p, back = p + (p === 'morador' ? '/menu' : '/gestao'), tab = p === 'morador' ? 'menu' : 'gestao';
  if (!fPodeLer(p)) return { tab, top: { title: 'Finanças', back }, body: empty('lock', p === 'subsindico' ? 'Esta função é do síndico. Você passa a ter acesso quando a substituição pelo subsíndico estiver ativa.' : 'Esta área é só do síndico, do conselho fiscal e da administradora.') };
  const per = fPer(), D = fDados(per), lista = fFiltrados(D), t = FORM.ftipo || 'todos';
  const max = D.cats.length ? D.cats[0].v : 1;
  return { tab, after: fAfter, top: { title: p === 'morador' ? 'Finanças do condomínio' : 'Finanças', back }, flush: true, body: `<div class="pad stack">
    ${banner('info', 'eye', 'Só leitura. Você vê totais do condomínio, sem dados de unidades.', { inline: true })}
    ${fPeriodoChips()}<div class="row wrap" style="gap:8px">${fMesBadge(per)}</div>${fFaixaMes(per, false)}
    ${fResumo(D, per)}
    <h2 class="t-title-sm">Despesas por categoria</h2>
    <div class="list">${D.cats.map(c => row({ icon: 'tag', title: c.nome, sub: `<span class="bar-track" style="display:block;margin-top:6px"><span class="bar-fill" style="display:block;width:${Math.max(2, c.v / max * 100)}%"></span></span>`, right: `<span class="stack-2" style="align-items:flex-end"><b class="num">${money(c.v)}</b><span class="t-caption muted">${fPct(c.pct)}</span></span>` })).join('')}</div>
    <h2 class="t-title-sm">Evolução</h2><div class="card">${fEvolucao()}</div>
    <h2 class="t-title-sm">Lançamentos</h2>${input('fq', { ph: 'Buscar descrição ou fornecedor', icon: 'search' })}
    <div class="chips">${[['todos', 'Todos'], ['receitas', 'Receitas'], ['despesas', 'Despesas']].map(([k, l]) => chip(l, t === k, () => { FORM.ftipo = k; rerender(); })).join('')}</div></div>
    <div class="list">${lista.length ? lista.slice(0, 30).map(l => row({ icon: l.tipo === 'receita' ? 'arrow-down-to-line' : 'arrow-up-from-line', title: `<span style="${l.estornado ? 'text-decoration:line-through' : ''}">${l.desc}</span>`, sub: fDia(l.data) + ' · ' + (l.tipo === 'receita' ? FIN_CATS_R : FIN_CATS_D)[l.cat], right: `<span class="stack-2" style="align-items:flex-end"><b class="num">${fSinal(l)}</b>${l.estornado ? badge('Estornado', 'warning', 'undo-2') : l.estornoDe ? badge('Estorno', 'neutral', 'undo-2') : fComents(l.id).length ? badge('Comentário', 'neutral', 'message-circle') : ''}</span>`, on: () => fDetalhe(l.id, false, p) })).join('') : empty('search', 'Nenhum lançamento neste filtro.', btn('Limpar filtros', { v: 'secondary', on: () => { FORM.fq = ''; FORM.ftipo = 'todos'; rerender(); } }))}</div>
    <div class="pad stack-2">${!/m$/.test(per) ? fComents('mes:' + per).map(c => `<div class="card"><div class="t-label-sm">${c.por} · ${c.papel} · ${c.data}</div><div class="t-body-sm">${c.txt}</div></div>`).join('') + btn('Comentar o mês', { v: 'secondary', icon: 'message-circle', block: true, on: () => fComentar('mes:' + per, p) }) : ''}
      ${btn('Exportar CSV', { v: 'secondary', icon: 'download', block: true, on: () => fExportar('csv', D) })}${btn('Exportar PDF', { v: 'secondary', icon: 'download', block: true, on: () => fExportar('pdf', D) })}</div>` };
});
