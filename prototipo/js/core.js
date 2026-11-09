/* CondomiFacil — protótipo navegável. Núcleo: rotas, layout, componentes e camadas (folha, diálogo, mensagem rápida). */
'use strict';

/* ---------- Perfis e navegação (Design System, seção 12) ---------- */
const PROFILES = {
  acesso:      { name: 'Acesso e conta', icon: 'key-round', layout: 'phone', home: 'boas-vindas' },
  morador:     { name: 'Morador', icon: 'house', layout: 'phone', home: 'inicio',
                 tabs: [['inicio','Início','house'],['reservas','Reservas','calendar-days'],['visitantes','Visitantes','users'],['chamados','Chamados','wrench'],['menu','Menu','menu']] },
  sindico:     { name: 'Síndico', icon: 'layout-dashboard', layout: 'phone', home: 'inicio',
                 tabs: [['inicio','Início','house'],['gestao','Gestão','layout-dashboard'],['reservas','Reservas','calendar-days'],['visitantes','Visitantes','users'],['menu','Menu','menu']] },
  subsindico:  { name: 'Subsíndico', icon: 'user-round-cog', layout: 'phone', home: 'inicio',
                 tabs: [['inicio','Início','house'],['gestao','Gestão','layout-dashboard'],['reservas','Reservas','calendar-days'],['visitantes','Visitantes','users'],['menu','Menu','menu']] },
  admin:       { name: 'Administradora', icon: 'building-2', layout: 'web', home: 'visao-geral' },
  portaria:    { name: 'Portaria', icon: 'door-open', layout: 'phone', home: 'visitantes', staff: true,
                 tabs: [['visitantes','Visitantes','users'],['encomendas','Encomendas','package'],['areas','Áreas','clipboard-check'],['menu','Menu','menu']] },
  limpeza:     { name: 'Limpeza', icon: 'spray-can', layout: 'phone', home: 'chamados', staff: true,
                 tabs: [['chamados','Chamados','spray-can'],['areas','Áreas','clipboard-check'],['menu','Menu','menu']] },
  manutencao:  { name: 'Manutenção', icon: 'wrench', layout: 'phone', home: 'chamados', staff: true, proposta: true,
                 tabs: [['chamados','Chamados','wrench'],['agenda','Agenda','calendar-days'],['menu','Menu','menu']] },
  proprietario:{ name: 'Proprietário não residente', icon: 'key-round', layout: 'phone', home: 'unidade',
                 tabs: [['unidade','Unidade','house'],['cobrancas','Cobranças','receipt'],['assembleias','Assembleias','vote'],['menu','Menu','menu']] },
};

const SCREENS = {};   // 'perfil/tela' -> fn(ctx)
const INDEX = {};     // perfil -> [{name,label,group,arg}]
function def(profiles, name, label, group, fn, opts = {}) {
  [].concat(profiles).forEach(p => {
    SCREENS[p + '/' + name] = fn;
    if (label) (INDEX[p] = INDEX[p] || []).push({ name, label, group, arg: opts.arg });
  });
}

/* ---------- Utilidades ---------- */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = (n, cls = '') => `<i data-lucide="${n}" class="${cls}" aria-hidden="true"></i>`;
const money = v => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const uid = () => Math.random().toString(36).slice(2, 8);
const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const $ = sel => document.querySelector(sel);

/* Callbacks: cada render registra funções e o HTML aponta para elas com data-cb */
let CB = {}, cbn = 0;
const cb = fn => { const k = 'c' + (++cbn); CB[k] = fn; return `data-cb="${k}"`; };
const goAttr = r => `data-go="${r}"`;
function on(o) { if (!o) return ''; if (typeof o === 'function') return cb(o); if (typeof o === 'string') return goAttr(o); return ''; }

/* ---------- Roteamento ---------- */
let CUR = { p: null, name: null, arg: null };
function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [p, name, ...rest] = h.split('/');
  return { p: p || null, name: name || (p && PROFILES[p] ? PROFILES[p].home : null), arg: rest.length ? decodeURIComponent(rest.join('/')) : null };
}
function go(route) { const h = '#/' + route; if (location.hash === h) render(); else location.hash = h; }
function rerender() { render(true); }

/* ---------- Componentes ---------- */
function badge(text, tone = 'neutral', icon) { return `<span class="badge tone-${tone}" aria-label="Estado: ${esc(text)}">${icon ? ic(icon) : ''}${esc(text)}</span>`; }
/* Urgência do chamado (RN-CH-09 a RN-CH-11): alta = danger, média = warning, leve = success; texto e ícone sempre junto da cor */
const URG = {
  alta:  { label: 'Alta',  tone: 'danger',  icon: 'chevrons-up',   ex: 'Risco para pessoas ou dano que cresce rápido. Ex.: líquido no chão do hall (risco de queda), vazamento, portão que não fecha.' },
  media: { label: 'Média', tone: 'warning', icon: 'equal',         ex: 'Atrapalha o uso, mas sem risco imediato. Ex.: lâmpada queimada, torneira pingando, lixo acumulado.' },
  leve:  { label: 'Leve',  tone: 'success', icon: 'chevron-down',  ex: 'Pode esperar alguns dias. Ex.: folhas na piscina, parafuso frouxo, pintura desgastada.' },
};
function urgBadge(u) { const d = URG[u]; return d ? `<span class="badge tone-${d.tone}" aria-label="Urgência: ${d.label}">${ic(d.icon)}Urgência ${d.label.toLowerCase()}</span>` : ''; }
const urgLogLine = c => (c.urgLog || []).length ? c.urgLog.map(l => `<p class="help">${ic('history')} Urgência alterada de ${URG[l.de].label.toLowerCase()} para ${URG[l.para].label.toLowerCase()} por ${esc(l.por)} · ${esc(l.quando)}</p>`).join('') : '';
/* Ordem das listas de chamados (RN-CH-13): abertos antes de concluídos; dentro de cada grupo, urgência alta > média > leve; empate: mais antigo (abertoEm) primeiro. Ordena na renderização, sem mudar o array */
const URG_ORDEM = { alta: 0, media: 1, leve: 2 };
const ordenarChamados = lista => [...lista].sort((a, b) =>
  (a.estado === 'Concluído') - (b.estado === 'Concluído') ||
  (URG_ORDEM[a.urg] ?? 9) - (URG_ORDEM[b.urg] ?? 9) ||
  String(a.abertoEm || '').localeCompare(String(b.abertoEm || '')));
/* Semáforo de prazo da reclamação (RN-RC-17 a RN-RC-19). "Hoje" é fixo para o protótipo ficar determinístico (mesmo dia dos chamados de exemplo).
   Limiar do amarelo = 25% do prazo, arredondado para cima, mínimo 1 dia (RN-RC-18). O dia do vencimento ainda é amarelo; vermelho só depois. */
const HOJE_PROTO = '2026-11-05';
const PRAZO_DECISAO_DIAS = 15;   // reclamacao.prazo_decisao_dias (RN-RC-06)
const PRAZO_TOM = {
  ok:      { tone: 'success', icon: 'circle-check', label: 'No prazo' },
  alerta:  { tone: 'warning', icon: 'clock',        label: 'Prazo se esgotando' },
  vencido: { tone: 'danger',  icon: 'circle-x',     label: 'Prazo esgotado' },
};
const RECL_AGUARDANDO = ['Aberta', 'Em conversa com o alvo'];
const _dia = iso => { const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return Date.UTC(y, m - 1, d); };
const _fmtDia = iso => { const [y, m, d] = String(iso).slice(0, 10).split('-'); return d + '/' + m; };
const _nDias = n => n + (n === 1 ? ' dia' : ' dias');
function prazoEstado(inicioISO, prazoDias = PRAZO_DECISAO_DIAS, hojeISO = HOJE_PROTO) {
  if (!inicioISO) return null;
  const venc = _dia(inicioISO) + prazoDias * 864e5;
  const dias = Math.round((venc - _dia(hojeISO)) / 864e5);   // dias que restam (negativo = esgotado)
  const limiar = Math.max(1, Math.ceil(prazoDias * 0.25));
  const estado = dias < 0 ? 'vencido' : dias <= limiar ? 'alerta' : 'ok';
  const texto = estado === 'vencido' ? `Prazo esgotado há ${_nDias(-dias)}`
    : estado === 'ok' ? `No prazo · ${_nDias(dias)}`
    : dias === 0 ? 'Vence hoje' : dias === 1 ? 'Vence amanhã' : `Prazo se esgotando · ${_nDias(dias)}`;
  const vencISO = new Date(venc).toISOString();
  return { estado, dias, limiar, texto, ...PRAZO_TOM[estado], venceEm: _fmtDia(vencISO), prazoDias };
}
/* Selo de prazo (10.8.2): só para reclamação aguardando decisão e com data de abertura; senão, vazio */
function prazoBadge(r) {
  if (!r || !RECL_AGUARDANDO.includes(r.estado)) return '';
  const p = prazoEstado(r.abertaEm); if (!p) return '';
  return `<span class="badge tone-${p.tone}" aria-label="Prazo de decisão: ${p.texto.toLowerCase()}">${ic(p.icon)}${esc(p.texto)}</span>`;
}
const prazoLinha = r => { const p = RECL_AGUARDANDO.includes(r.estado) && prazoEstado(r.abertaEm); return p ? `<p class="help">${ic('calendar-clock')} Prazo de decisão até ${p.venceEm} · ${p.prazoDias} dias desde a abertura</p>` : ''; };
/* Avaliação do atendimento do chamado (RN-CH-14 a RN-CH-21). "Agora" é fixo, como em HOJE_PROTO, para os chamados de exemplo ficarem determinísticos. */
const AGORA_PROTO = '2026-11-05T14:20';
const JANELA_AVAL_DIAS = 7;   // chamado.janela_avaliacao_dias (RN-CH-17)
const REABRIR_HORAS = 48;     // RN-CH-07
const MIN_AVAL_FUNC = 3;      // RN-CH-20: média e comentários ao funcionário só com 3 ou mais avaliações
const NOTA_AVAL = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'];
const BASE_AVAL = { fotos: 'Viu as fotos do serviço', pessoal: 'Conferiu pessoalmente' };
const horasDesde = iso => (new Date(AGORA_PROTO) - new Date(iso)) / 36e5;
const mediaTxt = n => n.toFixed(1).replace('.', ',');
/* null (não concluído), 'avaliado', 'pendente' (dentro da janela) ou 'encerrada' (passou a janela) */
function avalEstado(c) {
  if (c.estado !== 'Concluído') return null;
  if (c.aval) return 'avaliado';
  const inicio = c.avaliacaoDisponivelEm || c.concluidoEm;
  return inicio && horasDesde(inicio) <= JANELA_AVAL_DIAS * 24 ? 'pendente' : 'encerrada';
}
const dentroReabrir = c => !!c.concluidoEm && horasDesde(c.concluidoEm) <= REABRIR_HORAS;
/* Marcações extras do chamado concluído (DS 4.5): não são estados */
function avalBadge(c, dono) {
  const e = avalEstado(c);
  if (e === 'avaliado') return badge('Avaliado', 'neutral');
  if (e === 'pendente' && dono) return badge('Avaliação pendente', 'warning', 'triangle-alert');
  return '';
}
/* Todas as avaliações recebidas: histórico anônimo (S.avaliacoes) + as dos chamados do protótipo (inclusive de conclusões anteriores a uma reabertura) */
function avalTodas() {
  const dosChamados = [];
  S.chamados.forEach(c => [...(c.avalHist || []), ...(c.aval ? [c.aval] : [])].filter(a => !a.somenteHistorico).forEach(a => dosChamados.push({ quem: c.tipo === 'limpeza' ? (a.quem || c.concluidoPor) : c.empresa, tipo: c.tipo, nota: a.nota, coment: a.coment, mes: 'novembro de 2026', dias: a.dias != null ? a.dias : 1 })));
  return [...S.avaliacoes, ...dosChamados].filter(a => a.quem);
}
function avalResumo(quem) {
  const L = avalTodas().filter(a => a.quem === quem);
  const dist = [5, 4, 3, 2, 1].map(n => L.filter(a => a.nota === n).length);
  return { n: L.length, media: L.length ? L.reduce((s, a) => s + a.nota, 0) / L.length : 0, dist, baixas: L.filter(a => a.nota <= 2 && a.dias <= 30).length, comentarios: L.filter(a => a.coment) };
}
const avalDist = r => `<div class="stack-2" aria-label="Distribuição das avaliações">${r.dist.map((q, i) => `<div class="bar-row" style="grid-template-columns:64px 1fr 32px"><span>${5 - i} ${5 - i === 1 ? 'estrela' : 'estrelas'}</span><span class="bar-track"><span class="bar-fill" style="width:${r.n ? Math.round(q / r.n * 100) : 0}%"></span></span><span class="num">${q}</span></div>`).join('')}</div>`;
const avalLinha = r => `<span class="row wrap" style="gap:8px">${starsRead(r.media)}<span class="t-label-sm">${mediaTxt(r.media)} de 5 · ${r.n} ${r.n === 1 ? 'avaliação' : 'avaliações'}</span></span>`;
/* Fotos do serviço, só leitura; toque abre a foto (DS 10.20) */
function fotosServico(c) {
  if (!c.fotos) return '';
  const abrir = i => sheet(() => `<h2 class="t-title-md">Foto ${i + 1} de ${c.fotos}</h2><div class="thumb" style="width:100%;height:220px" role="img" aria-label="Foto ${i + 1} de ${c.fotos} do serviço">${ic('image')}</div>
    <div class="row" style="justify-content:space-between">${btn('Anterior', { v: 'secondary', disabled: i === 0, on: () => abrir(i - 1) })}${btn('Próxima', { v: 'secondary', disabled: i === c.fotos - 1, on: () => abrir(i + 1) })}</div>`);
  return `<h3 class="t-title-sm">Fotos do serviço</h3><div class="thumbs">${Array.from({ length: c.fotos }, (_, i) => `<button type="button" class="thumb" style="border:0;cursor:pointer" aria-label="Abrir foto ${i + 1} de ${c.fotos}" ${cb(() => abrir(i))}>${ic('image')}</button>`).join('')}</div>`;
}
/* Cartão com a avaliação enviada (leitura), para o morador, o síndico e o subsíndico */
const avalCartao = (c, titulo) => `<div class="card"><h3 class="t-title-sm">${titulo}</h3>
  <span class="row wrap" style="gap:8px">${starsRead(c.aval.nota)}<span class="t-label-sm">${c.aval.nota} de 5 · ${NOTA_AVAL[c.aval.nota]}</span></span>
  ${c.aval.coment ? `<div class="msg">${esc(c.aval.coment)}</div>` : ''}
  <p class="help">${ic('eye')} ${BASE_AVAL[c.aval.base]} · ${esc(c.aval.em)}</p></div>`;
const badgeStack = (...b) => `<span class="stack-2" style="align-items:flex-end">${b.filter(Boolean).join('')}</span>`;
const TONE_ICON = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x', neutral: 'circle-minus', accent: 'sparkles' };

function btn(label, o = {}) {
  const cls = ['btn', 'btn-' + (o.v || 'primary')];
  if (o.size) cls.push('btn-' + o.size);
  if (o.block) cls.push('btn-block');
  if (o.cls) cls.push(o.cls);
  return `<button type="button" class="${cls.join(' ')}" ${o.disabled ? 'disabled aria-disabled="true"' : on(o.on)} ${o.attr || ''}>${o.icon ? ic(o.icon) : ''}${esc(label)}</button>`;
}
function iconBtn(icon, label, onx, extra = '') { return `<button type="button" class="icon-btn" aria-label="${esc(label)}" title="${esc(label)}" ${on(onx)}>${ic(icon)}${extra}</button>`; }

function row(o) {
  const lead = o.avatar ? `<span class="lead avatar">${esc(initials(o.avatar))}</span>` : o.icon ? `<span class="lead" ${o.leadStyle ? `style="${o.leadStyle}"` : ''}>${ic(o.icon)}</span>` : '';
  const tap = o.on ? 'tap' : '';
  return `<div class="list-row ${tap} ${lead ? '' : 'no-icon'}" ${o.on ? 'role="button" tabindex="0"' : ''} ${on(o.on)}>${lead}
    <span class="body"><span class="title ${o.big ? 't-body-lg' : ''}">${o.title}</span>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}${o.sub2 ? `<span class="sub">${o.sub2}</span>` : ''}</span>
    ${o.right || ''}${o.on && !o.noChev ? ic('chevron-right', 'chev') : ''}</div>`;
}
function banner(tone, icon, text, o = {}) {
  return `<div class="banner tone-${tone} ${o.dashed ? 'dashed' : ''} ${o.inline ? 'inline-alert' : ''}" role="status" aria-live="polite">${ic(icon)}<span class="grow">${text}</span>${o.action || ''}</div>`;
}
function field(label, inner, o = {}) {
  return `<div class="field ${o.error ? 'has-error' : ''}">${label ? `<label ${o.for ? `for="${o.for}"` : ''}>${label}</label>` : ''}${inner}
    ${o.error ? `<span class="error-msg" role="alert">${ic('circle-x')}${o.error}</span>` : ''}${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function input(id, o = {}) {
  const v = o.value != null ? o.value : (FORM[id] ?? '');
  const el = `<input class="input ${o.cls || ''}" id="f-${id}" data-bind="${id}" type="${o.type || 'text'}" value="${esc(v)}" placeholder="${esc(o.ph || '')}" ${o.inputmode ? `inputmode="${o.inputmode}"` : ''} ${o.attr || ''}>`;
  return o.icon ? `<div class="input-icon">${ic(o.icon)}${el}</div>` : el;
}
function textarea(id, o = {}) { return `<textarea class="textarea" id="f-${id}" data-bind="${id}" placeholder="${esc(o.ph || '')}">${esc(FORM[id] ?? o.value ?? '')}</textarea>`; }
function choice(name, value, label, o = {}) {
  const sel = o.multi ? (FORM[name] || []).includes(value) : (FORM[name] ?? o.def) === value;
  return `<label class="choice ${sel ? 'is-selected' : ''} ${o.big ? 'choice-big' : ''}"><input type="${o.multi ? 'checkbox' : 'radio'}" name="${name}" value="${esc(value)}" ${sel ? 'checked' : ''} data-choice="${name}">${o.icon ? ic(o.icon) : ''}<span class="grow">${label}${o.sub ? `<span class="help" style="display:block">${o.sub}</span>` : ''}</span>${o.right || ''}</label>`;
}
function chip(label, isOn, onx, icon) { return `<button type="button" class="chip ${isOn ? 'is-on' : ''}" aria-pressed="${!!isOn}" ${on(onx)}>${isOn ? ic('check') : icon ? ic(icon) : ''}${esc(label)}</button>`; }
function sw(label, checked, onx, o = {}) {
  return `<label class="switch-row"><span class="grow"><span class="t-body" style="display:block">${label}</span>${o.sub ? `<span class="help">${o.sub}</span>` : ''}</span>
    <span class="switch"><input type="checkbox" role="switch" ${checked ? 'checked' : ''} ${o.disabled ? 'disabled' : ''} ${o.disabled ? '' : on(onx)} aria-label="${esc(label)}"><span></span></span></label>`;
}
function card(o) {
  return `<div class="card ${o.on ? 'tap' : ''} ${o.cls || ''}" ${o.on ? 'role="button" tabindex="0"' : ''} ${on(o.on)}>
    <div class="card-head"><div class="row grow" style="align-items:flex-start">${o.icon ? `<span class="card-icon" ${o.iconStyle ? `style="${o.iconStyle}"` : ''}>${ic(o.icon)}</span>` : ''}<div class="grow"><h3 class="t-title-sm">${o.title}</h3>${o.sub ? `<div class="t-body-sm muted" style="margin-top:2px">${o.sub}</div>` : ''}</div></div>${o.badge || ''}</div>
    ${o.body ? `<div class="t-body-sm">${o.body}</div>` : ''}${o.foot ? `<div class="card-foot" data-stop="1">${o.foot}</div>` : ''}</div>`;
}
function empty(icon, text, action = '') { return `<div class="empty">${ic(icon)}<div class="t-body">${text}</div>${action}</div>`; }
function starsRead(n) { let s = '<span class="stars-read row" style="gap:2px" aria-label="' + String(n).replace('.', ',') + ' de 5">'; for (let i = 1; i <= 5; i++) s += ic('star', i <= Math.round(n) ? 'on' : ''); return s + '</span>'; }
function scoreBlock(v, o = {}) {
  const low = v <= 60;
  return `<div class="stack-2">
    <div class="score-num"><span class="t-display">${v}</span><span class="t-body muted">de 100</span></div>
    <div class="score-bar ${low ? 'low' : ''}" role="img" aria-label="Score ${v} de 100. Limite para reservas gratuitas: 60"><div class="fill" style="width:${v}%"></div><div class="limit" style="left:60%"><span>Limite para reservas gratuitas</span></div></div>
    ${low && !o.compact ? `<p class="t-body-sm c-warning" style="margin:4px 0 0">Seu score está em ${v}. Reservas gratuitas voltam quando ele passar de 60. Áreas pagas continuam liberadas.</p>` : ''}
  </div>`;
}
function timeline(steps) {
  return `<div class="timeline">${steps.map(s => `<div class="tl-item ${s.state || ''}"><span class="tl-dot">${s.state === 'done' ? ic('check') : s.state === 'now' ? ic('clock') : ''}</span><div class="grow"><div class="t-label-sm">${s.t}</div>${s.d ? `<div class="t-caption muted">${s.d}</div>` : ''}</div></div>`).join('')}</div>`;
}
function photoPicker(key) {
  const list = FORM[key] || [];
  return `<div class="stack-2"><div class="thumbs">${list.map((_, i) => `<div class="thumb">${ic('image')}<button type="button" aria-label="Remover foto" ${cb(() => { list.splice(i, 1); rerender(); })}>${ic('x')}</button></div>`).join('')}</div>
    ${btn('Adicionar foto', { v: 'secondary', icon: 'camera', on: () => sheet(`<h2 class="t-title-md">Adicionar foto</h2>
      ${row({ icon: 'camera', title: 'Tirar foto', on: () => { (FORM[key] = FORM[key] || []).push(1); closeLayer(); rerender(); } })}
      ${row({ icon: 'image', title: 'Escolher da galeria', on: () => { (FORM[key] = FORM[key] || []).push(1); closeLayer(); rerender(); } })}
      <p class="help">A foto é comprimida no aparelho antes do envio.</p>`) })}</div>`;
}
function stepper(cur, total) { return `<div class="t-label-sm muted">Etapa ${cur} de ${total}</div>`; }

/* ---------- Formulário em memória ---------- */
let FORM = {};
function resetForm(o = {}) { FORM = Object.assign({}, o); }

/* ---------- Camadas ---------- */
function layerHost() { return $('#layer'); }
let CUR_SHEET = null;
function closeLayer() { const l = layerHost(); if (l) l.innerHTML = ''; CUR_SHEET = null; }
function sheet(html, o = {}) {
  const l = layerHost();
  if (typeof html === 'function') { CUR_SHEET = [html, o]; html = html(); } else CUR_SHEET = null;
  l.innerHTML = `<div class="overlay" data-scrim="1"><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div><div class="stack">${html}${o.noClose ? '' : btn('Fechar', { v: 'text', block: true, on: closeLayer })}</div></div></div>`;
  icons(l);
}
function dialog(o) {
  const l = layerHost(); CUR_SHEET = null;
  const acts = (o.actions || []).map(a => btn(a.label, { v: a.v || 'primary', block: true, icon: a.icon, on: () => { if (!a.keep) closeLayer(); a.on && a.on(); } })).join('');
  l.innerHTML = `<div class="overlay" ${o.blocking ? '' : 'data-scrim="1"'}><div class="dialog ${o.tone || ''}" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
    ${o.icon ? `<span class="dialog-icon tone-${o.tone || 'info'}">${ic(o.icon)}</span>` : ''}
    <h2 class="t-title-md" id="dlg-t" tabindex="-1">${o.title}</h2>${o.text ? `<p class="t-body muted" style="margin:0">${o.text}</p>` : ''}${o.body || ''}
    <div class="dialog-actions">${acts}</div></div></div>`;
  icons(l); const t = l.querySelector('#dlg-t'); t && t.focus();
}
let toastTimer;
function toast(text, o = {}) {
  const l = $('#toast'); if (!l) return;
  clearTimeout(toastTimer);
  l.innerHTML = `<div class="snackbar" role="status" aria-live="polite"><span class="grow">${text}</span>${o.undo ? `<button type="button" ${cb(() => { l.innerHTML = ''; o.undo(); })}>Desfazer</button>` : ''}</div>`;
  toastTimer = setTimeout(() => { l.innerHTML = ''; }, o.undo ? 10000 : 5000);
}

/* ---------- Tema ---------- */
function applyTheme() {
  if (S.theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', S.theme);
  try { localStorage.setItem('cf-theme', S.theme); } catch (e) {}
}

/* ---------- Render ---------- */
function icons(root) { if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2 }, nameAttr: 'data-lucide', root }); }

function render(keepScroll) {
  const r = parse();
  const prevScroll = keepScroll && $('#content') ? $('#content').scrollTop : 0;
  const routeChanged = r.p !== CUR.p || r.name !== CUR.name || r.arg !== CUR.arg;
  if (routeChanged && !keepScroll) { clearTimeout(toastTimer); }
  CUR = r; CB = {}; cbn = 0;
  const app = $('#app');
  if (!r.p || !PROFILES[r.p]) { document.body.classList.add('is-hub'); app.innerHTML = renderHub(); icons(app); return; }
  document.body.classList.remove('is-hub');
  const P = PROFILES[r.p];
  let fn = SCREENS[r.p + '/' + r.name];
  if (!fn) { go(r.p + '/' + P.home); return; }
  const ctx = { p: r.p, P, arg: r.arg, name: r.name };
  const s = fn(ctx) || {};
  const pendingToast = $('#toast') ? $('#toast').innerHTML : '';
  app.innerHTML = `<div class="proto">${renderSide(ctx)}<main class="proto-stage" id="main-content">${P.layout === 'web' ? renderWeb(ctx, s) : renderPhone(ctx, s)}</main></div>`;
  if (keepScroll && pendingToast) $('#toast').innerHTML = pendingToast;
  icons(app);
  const c = $('#content'); if (c) c.scrollTop = prevScroll;
  if (s.after) s.after();
}

function renderPhone(ctx, s) {
  const P = ctx.P, tabs = s.noTabs ? null : P.tabs;
  const t = s.top || {};
  let top = '';
  if (!s.noTop) {
    const left = t.back ? iconBtn('arrow-left', 'Voltar', t.back) : '';
    const mid = t.unit ? unitSwitcher(ctx) : `<h1 class="tb-title">${esc(t.title || '')}</h1>`;
    const sync = P.staff && t.sync !== false ? syncIndicator() : '';
    const acts = (t.actions || []).map(a => iconBtn(a.icon, a.label, a.on, a.dot ? '<span class="dot"></span>' : '')).join('');
    top = `<header class="topbar">${left}${mid}${sync}${acts}</header>`;
  }
  const bannerHtml = s.banner !== undefined ? s.banner : autoBanner(ctx);
  return `<div class="device"><div class="screen ${tabs ? '' : 'no-tabs'}">
    <div class="statusbar ${s.noTop ? 'light' : ''}"><span class="num">9:41</span><span class="sb-ic">${ic(S.online ? 'signal' : 'signal-zero')}${ic(S.online ? 'wifi' : 'wifi-off')}${ic('battery-full')}</span></div>
    ${top}${bannerHtml || ''}
    <div class="content ${s.flush ? 'flush' : ''} ${s.fab ? 'has-fab' : ''}" id="content">${s.body || ''}</div>
    ${s.footer ? `<div class="footer-bar">${s.footer}</div>` : ''}
    ${s.fab ? `<button type="button" class="fab" aria-label="${esc(s.fab.aria || s.fab.label)}" ${on(s.fab.on)}>${ic(s.fab.icon)}${s.fab.label ? `<span>${esc(s.fab.label)}</span>` : ''}</button>` : ''}
    ${tabs ? `<nav class="tabbar" aria-label="Navegação principal">${tabs.map(([id, label, icon]) => `<button type="button" class="tab ${s.tab === id ? 'is-active' : ''}" ${goAttr(ctx.p + '/' + id)} aria-current="${s.tab === id ? 'page' : 'false'}"><span class="pill">${ic(icon)}</span>${label}</button>`).join('')}</nav>` : ''}
    <div id="toast"></div><div id="layer"></div>
  </div></div>`;
}

/* Faixa automática por prioridade (10.10): sem internet > treinamento > termos > score */
function autoBanner(ctx) {
  if (ctx.P.staff && !S.online) return banner('warning', 'wifi-off', `Sem internet. Lista salva às ${S.lastSync}. ${S.pending.length} ${S.pending.length === 1 ? 'registro aguardando' : 'registros aguardando'} envio.`);
  if (ctx.p === 'portaria' && S.training) return banner('info', 'graduation-cap', 'MODO TREINAMENTO · Nada aqui é real', { dashed: true, action: btn('Sair do treinamento', { v: 'secondary', size: 'sm', on: () => { S.training = false; toast('Você saiu do treinamento. Lista real carregada.'); rerender(); } }) });
  if (S.termsPending && !ctx.P.staff && ctx.p !== 'acesso' && ctx.p !== 'admin') return banner('info', 'file-text', 'Os termos mudaram. Leia e aceite para continuar.', { action: btn('Ler', { v: 'secondary', size: 'sm', on: 'acesso/novo-aceite' }) });
  return '';
}
function syncIndicator() {
  const n = S.pending.length;
  let iconN = 'refresh-cw', txt = 'Atualizado agora', cls = '';
  if (S.syncing) { txt = 'Enviando ' + n; cls = 'spin'; }
  else if (!S.online) { iconN = 'wifi-off'; txt = 'Offline · ' + S.lastSync; }
  else if (n) { iconN = 'cloud-upload'; txt = n + ' pendentes'; }
  return `<button type="button" class="sync-ind" aria-label="Sincronização: ${txt}. Toque para detalhes" ${cb(() => sheet(`<h2 class="t-title-md">Sincronização</h2>
     ${row({ icon: S.online ? 'wifi' : 'wifi-off', title: S.online ? 'Conectado' : 'Sem internet', sub: 'Última atualização às ' + S.lastSync })}
     ${row({ icon: 'cloud-upload', title: n + (n === 1 ? ' registro pendente' : ' registros pendentes'), sub: n ? S.pending.map(p => p.t).join(' · ') : 'Nada aguardando envio' })}
     ${btn(S.online ? 'Simular queda de internet' : 'Simular volta da internet', { v: 'secondary', block: true, icon: S.online ? 'wifi-off' : 'wifi', on: () => { closeLayer(); setOnline(!S.online); } })}`))}>${ic(iconN, cls)}<span>${txt}</span></button>`;
}
function unitSwitcher(ctx) {
  const u = S.units[S.unit];
  const multi = S.units.length > 1;
  return `<button type="button" class="unit-switch" ${multi ? cb(() => sheet(`<h2 class="t-title-md">Trocar unidade</h2><div class="t-label-sm muted">${esc(u.cond)}</div>
    ${S.units.map((x, i) => row({ icon: 'house', title: x.name, sub: x.cond, right: i === S.unit ? ic('check') : '', noChev: true, on: () => { S.unit = i; closeLayer(); rerender(); toast('Mostrando ' + x.name); } })).join('')}`)) : 'disabled'} aria-label="Unidade ativa: ${esc(u.name)}${multi ? '. Toque para trocar' : ''}">
    <span class="u-cond">${esc(u.cond)}</span><span class="u-name">${esc(u.name)}${multi ? ic('chevrons-up-down') : ''}</span></button>`;
}

function renderWeb(ctx, s) {
  const nav = ADMIN_NAV.map(n => n === '-' ? '<div class="sep"></div>' : `<button type="button" class="${s.nav === n[0] ? 'on' : ''}" ${goAttr('admin/' + n[0])} aria-current="${s.nav === n[0] ? 'page' : 'false'}">${ic(n[2])}<span>${n[1]}</span></button>`).join('');
  return `<div class="web"><a href="#web-main" class="sr-only" style="position:absolute;left:-9999px">Pular para o conteúdo</a>
    <header class="web-top"><span class="wordmark">CondomiFacil</span>
      <button type="button" class="cond" ${cb(() => sheet(`<h2 class="t-title-md">Condomínios atendidos</h2>${S.condos.map((c, i) => row({ icon: 'building-2', title: c.nome, sub: c.unidades + ' unidades · ' + c.plano, right: i === S.condo ? ic('check') : '', noChev: true, on: () => { S.condo = i; closeLayer(); rerender(); toast('Mostrando ' + c.nome); } })).join('')}`))}>${ic('building-2')}${esc(S.condos[S.condo].nome)}${ic('chevrons-up-down')}</button>
      <span class="grow"></span>${iconBtn('search', 'Buscar', () => toast('Busca global: digite nome, unidade ou e-mail.'))}${iconBtn('bell', 'Notificações', 'admin/visao-geral', '<span class="dot"></span>')}
      <span class="row" style="color:#fff;font-weight:600;font-size:14px"><span class="lead avatar" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center">AC</span>Admin Central</span></header>
    <div class="web-body"><nav class="web-nav" aria-label="Navegação lateral">${nav}</nav>
    <div class="web-main" id="web-main"><div class="inner" id="content">${s.body || ''}</div></div></div>
    <div id="toast"></div><div id="layer"></div></div>`;
}

/* ---------- Painel lateral do protótipo ---------- */
function renderSide(ctx) {
  const list = INDEX[ctx.p] || [];
  let lastG = null;
  const items = list.map(it => {
    const g = it.group !== lastG ? `<div class="grp">${esc(it.group)}</div>` : ''; lastG = it.group;
    const route = ctx.p + '/' + it.name + (it.arg ? '/' + it.arg : '');
    const isOn = it.name === ctx.name && (it.arg || null) === (ctx.arg || null);
    return g + `<a class="scr ${isOn ? 'on' : ''}" href="#/${route}">${esc(it.label)}</a>`;
  }).join('');
  const sim = [];
  if (ctx.P.staff) sim.push(`<button class="${S.online ? '' : 'on'}" ${cb(() => setOnline(!S.online))}>${S.online ? 'Simular sem internet' : 'Voltar internet'}</button>`);
  if (['morador', 'sindico', 'subsindico'].includes(ctx.p)) {
    sim.push(`<button class="${S.score <= 60 ? 'on' : ''}" ${cb(() => { S.score = S.score <= 60 ? scoreContexto().base : 58; rerender(); })}>Score baixo nesta unidade (58)</button>`);
    sim.push(`<button class="${S.atraso ? 'on' : ''}" ${cb(() => { S.atraso = !S.atraso; rerender(); })}>Unidade em atraso</button>`);
    sim.push(`<button class="${S.termsPending ? 'on' : ''}" ${cb(() => { S.termsPending = !S.termsPending; rerender(); })}>Termos novos</button>`);
    if (ctx.p !== 'morador') sim.push(`<button class="${S.substituicao ? 'on' : ''}" ${cb(() => { S.substituicao = !S.substituicao; rerender(); toast(S.substituicao ? 'Substituição ativa: Carla Mendes tem as funções de síndico.' : 'Substituição desativada.'); })}>Substituição ativa</button>`);
    if (ctx.p === 'morador') sim.push(`<button class="${S.conselho ? 'on' : ''}" ${cb(() => { S.conselho = !S.conselho; rerender(); toast(S.conselho ? 'Ana agora é do conselho fiscal: Menu > Finanças do condomínio.' : 'Ana voltou a ser só moradora.'); })}>Sou do conselho fiscal</button>`);
    if (ctx.p === 'morador') sim.push(`<button class="${S.inquilino ? 'on' : ''}" ${cb(() => { S.inquilino = !S.inquilino; rerender(); toast(S.inquilino ? 'Ana agora é inquilina: a unidade é alugada.' : 'Ana voltou a ser proprietária moradora.'); })}>Morador é inquilino</button>`);
  }
  if (ctx.p === 'proprietario') {
    const P = S.prop;
    sim.push(`<button class="${P.desocupada ? 'on' : ''}" ${cb(() => { P.desocupada = !P.desocupada; rerender(); })}>Unidade desocupada</button>`);
    sim.push(`<button class="${P.temporada ? 'on' : ''}" ${cb(() => { P.temporada = !P.temporada; rerender(); })}>Temporada permitida</button>`);
    sim.push(`<button class="${P.venceLogo ? 'on' : ''}" ${cb(() => { P.venceLogo = !P.venceLogo; rerender(); })}>Contrato vence em 20 dias</button>`);
  }
  return `<aside class="proto-side" aria-label="Painel do protótipo">
    <a href="#/" class="row" style="text-decoration:none;color:inherit;gap:10px"><span class="app-icon sm">C</span><span><b class="wordmark" style="font-size:16px">CondomiFacil</b><br><span style="font-size:12px;color:#74809E">Protótipo navegável</span></span></a>
    <h2>Fluxo</h2>
    <div class="stack-2" style="gap:2px">${Object.entries(PROFILES).map(([k, v]) => `<a class="scr ${k === ctx.p ? 'on' : ''}" href="#/${k}/${v.home}">${ic(v.icon)}${esc(v.name)}${v.proposta ? ' <span style="font-size:11px;opacity:.7">(proposta)</span>' : ''}</a>`).join('')}</div>
    <h2>Aparência</h2>
    <div class="ctl">${[['system', 'Sistema'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button class="${S.theme === k ? 'on' : ''}" ${cb(() => { S.theme = k; applyTheme(); rerender(); })}>${l}</button>`).join('')}</div>
    ${sim.length ? `<h2>Simular</h2><div class="ctl">${sim.join('')}</div>` : ''}
    <h2>Telas de ${esc(ctx.P.name)}</h2>${items}
  </aside>`;
}

/* ---------- Hub ---------- */
function renderHub() {
  const cards = HUB.map(h => `<article class="hub-card"><div class="row"><span class="hc-ico">${ic(PROFILES[h.p].icon)}</span><div><h2 class="t-title-sm">${h.t}</h2><div class="t-body-sm muted">${h.s}</div></div></div>
    <ul>${h.f.map(x => `<li>${x}</li>`).join('')}</ul><div class="row wrap" style="margin-top:auto">${btn('Abrir fluxo', { size: 'sm', on: h.p + '/' + PROFILES[h.p].home })}${h.p2 ? btn(h.p2[0], { v: 'text', size: 'sm', on: h.p2[1] }) : ''}</div></article>`).join('');
  return `<div class="hub"><div class="hub-hero"><span class="app-icon">C</span><div><h1 class="t-title-lg wordmark">CondomiFacil</h1><p class="t-body muted" style="margin:4px 0 0">Protótipo navegável, feito a partir do Design System e dos User Flows. Escolha um perfil para percorrer o fluxo. Os dados são fictícios e ficam só na memória do navegador.</p></div></div>
    <div class="row wrap" style="margin-bottom:8px">${[['system', 'Igual ao aparelho'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => chip(l, S.theme === k, () => { S.theme = k; applyTheme(); render(); })).join('')}</div>
    <h2 class="t-title-md hub-sec">Perfis</h2><div class="hub-grid">${cards}</div></div>`;
}

/* ---------- Eventos ---------- */
document.addEventListener('click', e => {
  const scrim = e.target.closest('[data-scrim]');
  if (scrim && e.target === scrim) { closeLayer(); return; }
  const c = e.target.closest('[data-cb]');
  if (c && !c.disabled) { const fn = CB[c.dataset.cb]; if (fn) { if (c.type === 'checkbox') { /* deixa o estado do input mudar */ } else e.preventDefault(); fn(e, c); } return; }
  const g = e.target.closest('[data-go]');
  if (g && !g.disabled) { e.preventDefault(); closeLayer(); go(g.dataset.go); }
});
document.addEventListener('input', e => { const b = e.target.dataset && e.target.dataset.bind; if (b) FORM[b] = e.target.value; });
document.addEventListener('change', e => {
  const n = e.target.dataset && e.target.dataset.choice;
  if (n) {
    if (e.target.type === 'checkbox') { const arr = FORM[n] = FORM[n] || []; const i = arr.indexOf(e.target.value); i >= 0 ? arr.splice(i, 1) : arr.push(e.target.value); }
    else FORM[n] = e.target.value;
    if (e.target.closest('#layer')) { if (CUR_SHEET) sheet(CUR_SHEET[0], CUR_SHEET[1]); else e.target.closest('.stack, .stack-2, #layer').querySelectorAll('.choice').forEach(c => c.classList.toggle('is-selected', c.querySelector('input').checked)); }
    else rerender();
  }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'button') { e.preventDefault(); e.target.click(); return; } if (e.key === 'Escape') { const o = document.querySelector('.overlay[data-scrim]'); if (o) closeLayer(); } });
window.addEventListener('hashchange', () => render());

function aplicarConclusaoLimpeza(c, op) {
  const ciclo = c.ciclo || 1;
  const historico = c.conclusoesSync || (c.conclusoesSync = []);
  if (historico.some(x => x.opId === op.opId)) return '';
  if (!historico.length && c.estado === 'Concluído' && c.concluidoEm && !c.conclusaoPendente) {
    historico.push({ opId: 'inicial-' + c.id + '-' + ciclo, ciclo, registradaEm: c.concluidoEm, recebidaEm: c.concluidoEm, por: c.concluidoPor, fotos: c.fotos || 0 });
  }
  const anterior = historico.filter(x => x.ciclo === ciclo).sort((a, b) => a.registradaEm.localeCompare(b.registradaEm))[0];
  historico.push(Object.assign({}, op, { recebidaEm: AGORA_PROTO }));
  if (op.ciclo !== ciclo) return '';
  const efetiva = historico.filter(x => x.ciclo === ciclo).sort((a, b) => a.registradaEm.localeCompare(b.registradaEm))[0];
  c.conclusaoPendente = false;
  if (anterior && anterior.opId === efetiva.opId) return op.opId === efetiva.opId ? '' : 'Vale a conclusão de ' + efetiva.por + ', registrada antes pelo horário do celular.';
  const corrigida = !!anterior;
  if (corrigida && c.aval) {
    (c.avalHist || (c.avalHist = [])).push(Object.assign({}, c.aval, { quem: c.aval.quem || anterior.por, somenteHistorico: true, conclusaoOpId: anterior.opId }));
    c.aval = null;
  }
  c.estado = 'Concluído'; c.concluidoEm = efetiva.registradaEm; c.concluidoPor = efetiva.por; c.fotos = efetiva.fotos || 0; c.conclusaoEfetivaOpId = efetiva.opId;
  if (corrigida) { c.avaliacaoDisponivelEm = AGORA_PROTO; c.correcaoConclusao = 'A conclusão de ' + efetiva.por + ' passou a valer pelo horário do celular. Os envolvidos e quem abriu foram avisados.'; }
  return corrigida ? c.correcaoConclusao : '';
}

/* Sincronização simulada (portaria e limpeza) */
function setOnline(v) {
  S.online = v;
  if (!v) { rerender(); return; }
  if (!S.pending.length) { S.lastSync = nowH(); rerender(); toast('Conexão de volta. Tudo em dia.'); return; }
  S.syncing = true; rerender();
  setTimeout(() => {
    S.syncing = false; const had = S.pending.slice(); S.pending = []; S.lastSync = nowH();
    const avisosConclusao = had.filter(x => x.conclusao).map(x => { const c = S.chamados.find(c => c.id === x.chamadoId); return c ? aplicarConclusaoLimpeza(c, x.conclusao) : ''; }).filter(Boolean);
    rerender();
    const div = had.find(x => x.diverge), dup = had.find(x => x.dup);
    if (avisosConclusao.length) dialog({ tone: 'info', icon: 'info', title: 'Conclusão sincronizada', text: avisosConclusao.join(' '), actions: [{ label: 'Entendi' }] });
    else if (dup) dialog({ tone: 'info', icon: 'info', title: 'Chamado já concluído', text: dup.dup, actions: [{ label: 'Entendi' }] });
    else if (div) dialog({ tone: 'warning', icon: 'triangle-alert', blocking: true, title: 'Confirme com o morador', text: div.diverge, actions: [{ label: 'Confirmei com o morador', on: () => toast('Confirmação registrada.') }] });
    else toast(had.length + (had.length === 1 ? ' registro enviado.' : ' registros enviados.'));
  }, 1400);
}
function nowH() { const d = new Date(); return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0'); }
