/* Funcionários — Portaria (6.2, 6.3, 6.4, 7.1, 5.3), Limpeza (8.2, 5.3) e Manutenção (proposta) */
'use strict';

const TREINO = [
  { id: 't1', nome: 'Visitante Exemplo 1', un: 'Bloco A · Apto 000', bloco: 'A', estado: 'Esperado' },
  { id: 't2', nome: 'Visitante Exemplo 2', un: 'Bloco B · Apto 000', bloco: 'B', estado: 'Esperado', bloqueio: 'Exemplo de pessoa na lista de bloqueio.' },
  { id: 't3', nome: 'Visitante Exemplo 3', un: 'Bloco A · Apto 000', bloco: 'A', estado: 'Entrou', hora: '8h00' },
];
const lista = () => S.training ? TREINO : S.esperados;
function vibrate() { try { navigator.vibrate && navigator.vibrate(15); } catch (e) {} }

function registrar(v, estado) {
  const prev = { estado: v.estado, hora: v.hora };
  v.estado = estado; v.hora = nowH(); vibrate();
  let pend = null;
  if (!S.online && !S.training) {
    pend = { t: (estado === 'Saiu' ? 'Saída de ' : 'Entrada de ') + v.nome };
    if (v.cancelado && estado !== 'Saiu') pend.diverge = `${v.nome} entrou às ${v.hora}, mas a visita tinha sido cancelada pelo morador. Ligue para ${v.un} pelo interfone.`;
    S.pending.push(pend);
  }
  rerender();
  toast(`${estado === 'Saiu' ? 'Saída' : 'Entrada'} de ${v.nome} registrada`, { undo: () => { Object.assign(v, prev); if (pend) S.pending.splice(S.pending.indexOf(pend), 1); rerender(); toast('Registro desfeito.'); } });
}
function tocarEntrada(v) {
  if (v.bloqueio) {
    return dialog({ tone: 'danger', icon: 'ban', blocking: true, title: 'Na lista de bloqueio', text: `<b>${v.nome}</b> · ${v.un}<br>Motivo: ${v.bloqueio}`,
      actions: [{ label: 'Não liberar', on: () => toast('Entrada negada e registrada.') },
                { label: 'Liberar mesmo assim', v: 'secondary', keep: true, on: () => dialog({ tone: 'danger', icon: 'ban', blocking: true, title: 'Por que liberar?', text: 'A decisão fica registrada com o seu nome.', body: field('Motivo', textarea('libmot', { ph: 'Ex.: autorizado pelo síndico por telefone' })),
                  actions: [{ label: 'Liberar entrada', v: 'danger', on: () => registrar(v, 'Entrou') }, { label: 'Não liberar', v: 'secondary', on: () => toast('Entrada negada e registrada.') }] }) }] });
  }
  if (v.fora) {
    return dialog({ tone: 'warning', icon: 'clock', title: 'Fora do horário cadastrado', text: `${v.nome} · ${v.un}. ${v.fora} Interfone para o morador antes de liberar.`,
      actions: [{ label: 'Morador autorizou pelo interfone', icon: 'phone', on: () => registrar(v, 'Autorizado por interfone') }, { label: 'Morador não autorizou', v: 'secondary', on: () => toast('Entrada não autorizada e registrada.') }] });
  }
  registrar(v, 'Entrou');
}

def('portaria', 'visitantes', 'Esperados hoje', 'Visitantes (6.2 e 6.3)', () => {
  const q = (FORM.pq || '').toLowerCase().trim(), b = FORM.pb || 'todos';
  const outro = /bloco c|^c\b|c-/.test(q);
  const tit = v => v.lista ? ((S.listas.find(l => l.id === v.lista) || {}).titulo || '') : '';
  const visivel = v => !v.lista || (v.estado !== 'Cancelado' && (!v.data || v.data <= HOJE_PROTO));   // pessoa de lista futura ou removida não aparece
  const L = lista().filter(v => visivel(v) && (b === 'todos' || v.bloco === b) && (!q || (v.nome + ' ' + v.un + ' ' + tit(v)).toLowerCase().includes(q)));
  const solo = L.filter(v => !v.lista), grupos = [...new Set(L.filter(v => v.lista).map(v => v.lista))].map(id => S.listas.find(l => l.id === id)).filter(Boolean);
  const abertos = FORM.pgrp = FORM.pgrp || {};
  const rowG = l => {
    const todos = lista().filter(v => v.lista === l.id && visivel(v)), cheg = todos.filter(chegou).length, aberto = abertos[l.id] || !!q;
    const P = L.filter(v => v.lista === l.id).sort((x, y) => chegou(x) - chegou(y));
    return `<div class="list-row tap" style="min-height:80px" role="button" tabindex="0" aria-expanded="${aberto}" aria-label="Lista ${esc(l.titulo)}, ${todos.length} pessoas, ${cheg} chegaram. ${aberto ? 'Recolher' : 'Ver pessoas'}" ${cb(() => { abertos[l.id] = !abertos[l.id]; rerender(); })}>
      <span class="lead">${ic('list-checks')}</span><span class="body"><span class="title t-body-lg">Lista: ${esc(l.titulo)}</span><span class="sub">${l.un}${l.local ? ' · ' + esc(l.local) : ''}${l.ini ? ' · ' + hhmm(l.ini) + (l.fim ? ' às ' + hhmm(l.fim) : '') : ''}</span>
      <span class="row wrap" style="gap:6px;margin-top:4px">${badge(`${todos.length} pessoas, ${cheg} chegaram`, cheg === todos.length ? 'success' : 'info', 'users')}</span></span>${ic(aberto ? 'chevron-up' : 'chevron-down', 'chev')}</div>
      ${aberto ? `<div role="group" aria-label="Pessoas da lista ${esc(l.titulo)}" style="padding-left:20px;border-left:3px solid var(--border-divider);margin-left:16px">${P.map(v => rowV(v, true)).join('')}</div>` : ''}`;
  };
  const bloqueado = q.length > 2 && S.bloqueados.find(x => x.nome.toLowerCase().includes(q));
  const rowV = (v, grp) => {
    const dentro = v.estado === 'Entrou' || v.estado === 'Autorizado por interfone';
    const action = v.estado === 'Saiu' ? '' : dentro
      ? btn('Saída', { v: 'secondary', size: 'lg', icon: 'log-out', on: () => registrar(v, 'Saiu') })
      : btn('Entrada', { size: 'lg', icon: 'log-in', on: () => tocarEntrada(v) });
    return `<div class="list-row" style="min-height:80px">
      <span class="body"><span class="title t-body-lg">${esc(v.nome)}</span><span class="sub">${grp ? (v.hora ? 'Entrou às ' + v.hora : 'Da lista') : v.un + (v.hora ? ' · ' + v.hora : '')}</span>
      <span class="row wrap" style="gap:6px;margin-top:4px">${st(v.estado)}${v.bloqueio ? badge('Na lista de bloqueio', 'danger', 'ban') : ''}${v.fora ? badge('Fora do horário cadastrado', 'warning', 'clock') : ''}${v.rec ? badge('Recorrente', 'neutral') : ''}</span></span>${action}</div>`;
  };
  return {
    tab: 'visitantes', top: { title: 'Esperados hoje' }, flush: true,
    body: `<div class="pad stack-2" style="position:sticky;top:0;background:var(--bg);z-index:2;box-shadow:var(--elev-2)">
        ${input('pq', { icon: 'search', ph: 'Nome, unidade ou bloco', attr: 'aria-label="Buscar visitante" autocomplete="off"' })}
        <div class="chips">${['todos', 'A', 'B'].map(x => chip(x === 'todos' ? 'Todos' : 'Bloco ' + x, b === x, () => { FORM.pb = x; rerender(); })).join('')}</div></div>
      ${bloqueado ? `<div class="pad" style="padding-bottom:0">${banner('danger', 'ban', `<b>${bloqueado.nome}</b> está na lista de bloqueio. Motivo: ${bloqueado.motivo}`, { inline: true })}</div>` : ''}
      <div class="list">${solo.length ? solo.map(v => rowV(v)).join('') : ''}${grupos.length ? `<h3 class="t-label-sm muted pad" style="margin:0">Listas de visitantes</h3>${grupos.map(rowG).join('')}` : ''}${L.length ? '' : outro ? empty('search', 'Nenhum resultado. Esta portaria atende os blocos A e B.') : empty('users', q ? 'Ninguém com esse nome nos esperados de hoje. Interfone para o morador e use Entrada sem cadastro.' : 'Nenhum visitante esperado hoje.')}</div>
      <p class="help pad">Dica do protótipo: busque “bloco c” para ver o aviso de outra portaria, ou “Marcos” para a lista de bloqueio.</p>`,
    fab: { icon: 'user-plus', label: 'Entrada sem cadastro', on: () => { FORM.sc_auth = []; sheet(() => `<h2 class="t-title-md">Entrada sem cadastro</h2>
      ${field('Nome do visitante', input('scn'))}${field('Unidade', input('scu', { ph: 'Ex.: Bloco A · Apto 101' }))}
      ${choice('sc_auth', 'ok', 'Autorizado por interfone', { multi: true, icon: 'phone' })}
      ${btn('Registrar entrada', { block: true, size: 'lg', icon: 'log-in', disabled: !(FORM.sc_auth || []).includes('ok') || !(FORM.scn || '').trim(), on: () => { const v = { id: uid(), nome: FORM.scn, un: FORM.scu || 'Unidade não informada', bloco: 'A', estado: 'Esperado' }; lista().unshift(v); closeLayer(); registrar(v, 'Autorizado por interfone'); FORM.scn = ''; FORM.scu = ''; } })}
      ${!(FORM.sc_auth || []).includes('ok') ? `<p class="disabled-reason">${ic('info')}Interfone para o morador e marque a autorização.</p>` : ''}`); } },
    after: () => { const el = $('#f-pq'); if (el) { el.addEventListener('input', () => { clearTimeout(window._pq); window._pq = setTimeout(() => { rerender(); const n = $('#f-pq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); }); } },
  };
});

/* Entregas esperadas (7.2): "Esperadas hoje" e vínculo ao registrar a encomenda (RN-EN-10 a RN-EN-12) */
const normUn = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const remDaOrigem = o => o === 'Outra' ? 'Outro' : o;
const diasDesde = iso => Math.round((_dia(HOJE_PROTO) - _dia(iso)) / 864e5);
const esperadasHoje = () => S.entregas.filter(x => x.estado === 'Esperada' && x.data === HOJE_PROTO)
  .sort((a, b) => (a.ini ? 0 : 1) - (b.ini ? 0 : 1) || a.ini.localeCompare(b.ini) || a.un.localeCompare(b.un));
/* Candidatas ao vínculo: Esperadas (hoje primeiro, depois futuras) e "Não chegou" dentro da tolerância; aviso de entregador nunca vincula (RN-EN-12) */
const ordemVinculo = x => x.data === HOJE_PROTO ? 0 : x.estado === 'Não chegou' ? 1 : 2;
const candidatasVinculo = un => S.entregas.filter(x => normUn(x.un) === normUn(un) && !entregaAviso(x) && (x.estado === 'Esperada' || (x.estado === 'Não chegou' && diasDesde(x.data) <= S.toleranciaVinculo)))
  .sort((a, b) => (ordemVinculo(a) - ordemVinculo(b)) || a.data.localeCompare(b.data));
const vinculoSugerido = (un, rem) => { const c = candidatasVinculo(un); return c.find(x => rem && remDaOrigem(x.origem) === rem) || (c.length === 1 ? c[0] : null); };
function abrirRegistroEncomenda(pre) {
  if (!S.online) { dialog({ tone: 'warning', icon: 'wifi-off', title: 'Sem internet', text: 'Encomendas precisam de internet. Anote e registre quando a conexão voltar.', actions: [{ label: 'Entendi' }] }); return; }
  resetForm(pre || {}); go('portaria/encomenda-nova');
}

/* Encomendas (7.1) */
def('portaria', 'encomendas', 'Encomendas', 'Encomendas (7.1 e 7.2)', () => {
  const f = FORM.pe || 'Recebida';
  const esp = esperadasHoje();
  const L = S.encomendas.filter(e => f === 'todas' || e.estado === f || (f === 'Recebida' && e.estado === 'Prazo vencido'));
  const retirar = e => { FORM.quem = null; sheet(() => `<h2 class="t-title-md">Quem está retirando?</h2><div class="t-body-sm muted">${e.rem} · ${e.un}</div>
    ${['Ana Lima', 'Lucas Lima'].map(n => choice('quem', n, n, { sub: 'Morador da unidade' })).join('')}
    ${choice('quem', 'outro', 'Outra pessoa, autorizada pelo morador pelo interfone')}
    ${FORM.quem === 'outro' ? field('Nome de quem retirou', input('quemn')) : ''}
    ${btn('Registrar retirada', { block: true, size: 'lg', disabled: !FORM.quem, on: () => { e.estado = 'Retirada'; e.quem = FORM.quem === 'outro' ? FORM.quemn : FORM.quem; vibrate(); closeLayer(); rerender(); toast('Retirada registrada.'); } })}
    ${btn('Corrigir unidade', { v: 'text', block: true, on: () => { closeLayer(); sheet(`<h2 class="t-title-md">Corrigir unidade</h2>${field('Unidade certa', input('nun', { value: e.un }))}${btn('Salvar correção', { block: true, on: () => { const v = S.entregas.find(x => x.encId === e.id); if (v) { v.estado = v.data < HOJE_PROTO ? 'Não chegou' : 'Esperada'; delete v.encId; } e.un = FORM.nun || e.un; closeLayer(); rerender(); toast('Unidade corrigida. A unidade anterior foi avisada do engano.' + (v ? ' O vínculo com a entrega esperada foi desfeito.' : '')); } })}`); } })}`); };
  return {
    tab: 'encomendas', top: { title: 'Encomendas' }, flush: true,
    body: `<h2 class="t-title-sm pad" style="margin:0;padding-bottom:0">Esperadas hoje</h2>
      <div class="list" aria-label="Entregas esperadas hoje">${esp.length ? esp.map(x => `<div class="list-row" style="min-height:76px"><span class="lead">${ic('package-open')}</span><span class="body"><span class="title t-body-lg">${x.un}</span><span class="sub">${[entregaOrigem(x), entregaFaixa(x)].filter(Boolean).map(esc).join(' · ') || 'Sem origem nem faixa'}${x.desc ? ' · ' + esc(x.desc) : ''}</span>
        <span class="row wrap" style="gap:6px;margin-top:4px">${st(x.estado)}${entregaAviso(x) ? badge('Só aviso', 'neutral', 'info') : ''}</span>${entregaAviso(x) ? `<span class="help">Libere pelo interfone. Não é encomenda.</span>` : ''}</span>
        ${entregaAviso(x) ? '' : btn('Registrar', { v: 'secondary', size: 'lg', icon: 'package', attr: `aria-label="Registrar encomenda de ${esc(x.un)}"`, on: () => abrirRegistroEncomenda({ eun: x.un, erem: remDaOrigem(x.origem), evinc: x.id }) })}</div>`).join('') : empty('package-open', 'Nenhuma entrega esperada hoje.')}</div>
      <div class="pad chips">${[['Recebida', 'Aguardando retirada'], ['Retirada', 'Retiradas'], ['todas', 'Todas']].map(([k, l]) => chip(l, f === k, () => { FORM.pe = k; rerender(); })).join('')}</div>
      <div class="list">${L.map(e => `<div class="list-row" style="min-height:76px"><span class="lead">${ic('package')}</span><span class="body"><span class="title t-body-lg">${e.un}</span><span class="sub">${e.rem} · ${e.data}${e.quem ? ' · retirou: ' + e.quem : ''}</span><span style="margin-top:4px">${st(e.estado)}</span></span>
        ${['Recebida', 'Prazo vencido'].includes(e.estado) ? btn('Retirada', { v: 'secondary', size: 'lg', on: () => retirar(e) }) : ''}</div>`).join('')}</div>`,
    fab: { icon: 'plus', label: 'Registrar', aria: 'Registrar encomenda', on: () => abrirRegistroEncomenda() },
  };
});
def('portaria', 'encomenda-nova', 'Registrar encomenda', 'Encomendas (7.1 e 7.2)', () => {
  const cand = candidatasVinculo(FORM.eun), sug = vinculoSugerido(FORM.eun, FORM.erem);
  const sel = FORM.evinc === 'nenhuma' ? null : (cand.find(x => x.id === FORM.evinc) || sug);
  return {
  tab: 'encomendas', top: { title: 'Registrar encomenda', back: 'portaria/encomendas' },
  body: `<div class="stack-5">${banner('info', 'info', 'Comida por aplicativo não é registrada: avise o morador pelo interfone.', { inline: true })}
    ${field('Unidade', input('eun', { ph: 'Ex.: Bloco A · Apto 101', cls: 't-body-lg' }), { error: A.eErr })}
    <div class="field"><span class="field-label">Remetente</span><div class="chips">${['Amazon', 'Mercado Livre', 'Correios', 'Shopee', 'Outro'].map(r => chip(r, FORM.erem === r, () => { FORM.erem = r; rerender(); })).join('')}</div></div>
    ${cand.length ? `<div class="field" role="radiogroup" aria-label="Entregas esperadas desta unidade"><span class="field-label">Entregas esperadas desta unidade</span>
      ${cand.map(x => choice('evinc', x.id, esc(entregaOrigem(x) || 'Entrega') + ' · ' + entregaQuando(x) + (entregaFaixa(x) ? ' · ' + entregaFaixa(x) : ''), { def: sel ? sel.id : 'nenhuma', icon: 'package-open', sub: [x.desc ? esc(x.desc) : '', x.estado === 'Não chegou' ? 'Não chegou na data' : ''].filter(Boolean).join(' · '), right: (sug && sug.id === x.id ? badge('Sugerida', 'info') : '') })).join('')}
      ${choice('evinc', 'nenhuma', 'Não vincular', { def: sel ? sel.id : 'nenhuma' })}
      <span class="help">Vinculada, a entrega fica "Chegou" e o morador recebe um único aviso.</span></div>` : ''}
    <div class="field"><span class="field-label">Foto da etiqueta (opcional)</span>${photoPicker('efotos')}</div></div>`,
  footer: btn('Registrar encomenda', { block: true, size: 'lg', icon: 'package', disabled: !S.online, on: () => {
    if (!(FORM.eun || '').trim()) { A.eErr = 'Informe a unidade.'; rerender(); return; }
    A.eErr = ''; const id = 'e' + uid(), rem = FORM.erem || (sel && sel.origem ? remDaOrigem(sel.origem) : 'Outro');
    S.encomendas.unshift({ id, un: FORM.eun, rem, data: 'Hoje, ' + nowH(), estado: 'Recebida' }); vibrate();
    if (sel) { sel.estado = 'Chegou'; sel.encId = id; }
    go('portaria/encomendas'); setTimeout(() => toast(sel ? 'Encomenda registrada e vinculada. O morador foi avisado.' : 'Encomenda registrada. O morador foi avisado.'), 50);
  } }) + (!S.online ? `<p class="disabled-reason">${ic('wifi-off')}Encomendas precisam de internet. Anote e registre quando a conexão voltar.</p>` : ''),
  after: () => { const el = $('#f-eun'); if (el) el.addEventListener('change', () => { FORM.evinc = undefined; rerender(); }); },
  };
});

/* Horário fixo acompanha HOJE_PROTO; a tela identifica a simulação. */
const HORA_RESERVAS_PROTO = 14 * 60 + 30;
const diaReservaStaff = () => HOJE_PROTO.slice(8) + '/' + HOJE_PROTO.slice(5, 7);
const dataReservaStaff = w => '2026-' + w.dia.slice(3) + '-' + w.dia.slice(0, 2);
const iniciouReserva = w => dataReservaStaff(w) < HOJE_PROTO || (dataReservaStaff(w) === HOJE_PROTO && w.inicioMin <= HORA_RESERVAS_PROTO);
const terminouReserva = w => dataReservaStaff(w) < HOJE_PROTO || (dataReservaStaff(w) === HOJE_PROTO && w.fimMin <= HORA_RESERVAS_PROTO);
const usoReservaAtivo = w => ['Confirmada', 'Em andamento'].includes(w.estado);
const seloUsoReserva = w => badge(w.estado, TONES[w.estado] || 'neutral', w.estado === 'Em andamento' ? 'clock' : w.estado === 'Cumprida' ? 'circle-check' : w.estado === 'Não comparecimento' ? 'user-x' : 'calendar-days');
function marcarUsoReserva(w, estado, p) {
  if (!['portaria', 'limpeza'].includes(p)) return false;
  if (!['Em andamento', 'Cumprida', 'Não comparecimento'].includes(estado)) return false;
  if (p === 'portaria' && S.training) { toast('Treinamento: marcação simulada, sem alterar as reservas.'); return false; }
  if (!S.online) { toast('Reservas e vistorias precisam de internet. Seu preenchimento foi mantido.'); return false; }
  if (estado === 'Em andamento' && (p !== 'portaria' || w.estado !== 'Confirmada' || !iniciouReserva(w))) return false;
  if (estado === 'Cumprida' && (!usoReservaAtivo(w) || !iniciouReserva(w))) return false;
  if (estado === 'Não comparecimento' && (w.estado !== 'Confirmada' || !terminouReserva(w))) return false;
  w.eventos.push({ anterior: w.estado, novo: estado, autor: p === 'portaria' ? 'José Ribeiro · Portaria' : 'Sandra Rocha · Limpeza', em: HOJE_PROTO + 'T14:30:00' });
  w.estado = estado;
  const reserva = S.reservas.find(r => r.id === w.reserva);
  if (reserva) reserva.estado = estado;
  return true;
}
def(['portaria', 'limpeza'], 'areas', 'Reservas e vistorias', 'Áreas (5.3)', ctx => {
  const hoje = S.vistorias.filter(w => w.dia === diaReservaStaff()).sort((a, b) => a.inicioMin - b.inicioMin);
  const pendentes = S.vistorias.filter(w => dataReservaStaff(w) < HOJE_PROTO && usoReservaAtivo(w));
  const linhas = L => L.length ? L.map(w => row({ icon: 'calendar-days', title: w.area, sub: w.un + ' · ' + w.dia + ' · ' + w.horario, right: seloUsoReserva(w), on: () => { resetForm(); go(ctx.p + '/vistoria/' + w.id); } })).join('') : `<p class="pad t-body-sm muted">Nenhuma reserva neste grupo.</p>`;
  return {
    tab: 'areas', top: { title: 'Áreas' }, flush: true,
    body: `<div class="pad"><h2 class="t-title-sm">${ctx.p === 'portaria' ? 'Reservas de hoje' : 'Vistorias de hoje'}</h2><p class="help">Simulação: 05/11/2026, 14h30. Registros de uso e vistoria precisam de internet.</p></div>
      <div class="list">${linhas(hoje)}</div><h2 class="t-title-sm pad">Vistorias pendentes de dias anteriores</h2><div class="list">${linhas(pendentes)}</div>`,
  };
});
def(['portaria', 'limpeza'], 'vistoria', 'Fazer vistoria', 'Áreas (5.3)', ctx => {
  const w = S.vistorias.find(x => x.id === ctx.arg) || S.vistorias[0], p = ctx.p;
  const usou = FORM.usou, chk = FORM.chk || [];
  const ITENS = ['Área limpa', 'Móveis no lugar', 'Sem lixo', 'Equipamentos funcionando', 'Chave devolvida'];
  const done = (estado, msg) => { if (!marcarUsoReserva(w, estado, p)) return; go(p + '/areas'); setTimeout(() => toast(msg), 50); };
  const podeVistoriar = usoReservaAtivo(w) && iniciouReserva(w);
  const podeFalta = w.estado === 'Confirmada' && terminouReserva(w);
  const podeIniciar = p === 'portaria' && w.estado === 'Confirmada' && iniciouReserva(w);
  const historico = w.eventos.map(e => `<p class="help">${ic('history')}${esc(e.autor)} · ${e.em.slice(11, 16)} · ${esc(e.anterior)} → ${esc(e.novo)}</p>`).join('');
  return {
    tab: 'areas', top: { title: 'Vistoria', back: p + '/areas' },
    body: `<div class="stack-5">${card({ icon: 'clipboard-check', title: w.area, sub: w.un + ' · ' + w.dia + ' · ' + w.horario, badge: seloUsoReserva(w) })}
      ${podeIniciar ? btn('Marcar em andamento', { v: 'secondary', block: true, size: 'lg', disabled: !S.online, on: () => { if (marcarUsoReserva(w, 'Em andamento', p)) { rerender(); toast('Uso em andamento registrado.'); } } }) : ''}
      ${!S.online ? banner('warning', 'wifi-off', 'Reservas e vistorias precisam de internet. Seu preenchimento foi mantido.', { inline: true }) : ''}
      ${!podeVistoriar ? banner('info', 'info', usoReservaAtivo(w) ? 'O horário ainda não começou. As ações de uso serão liberadas a partir do início.' : 'Esta reserva não aceita novas marcações de uso.', { inline: true }) : `<div class="field"><span class="field-label">Como está o uso da área?</span><div class="stack-2">${choice('usou', 'sim', 'O uso terminou: fazer vistoria')}${podeFalta ? choice('usou', 'nao', 'Não houve comparecimento') : ''}</div><p class="help">Não comparecimento só pode ser registrado após o fim previsto e se não houve uso. Se o uso terminou antes, a vistoria pode ser feita; o intervalo reservado continua ocupado até o fim previsto.</p></div>`}
      ${podeVistoriar && usou === 'sim' ? `<div class="field"><span class="field-label">Checklist</span><div class="stack-2">${ITENS.map(i => choice('chk', i, i, { multi: true })).join('')}</div>${A.chkErr ? `<span class="error-msg">${ic('circle-x')}Marque todos os itens obrigatórios ou registre um dano.</span>` : ''}</div>
        <div class="field"><span class="field-label">Fotos</span>${photoPicker('vfotos')}</div>
        <div class="field"><span class="field-label">Encontrou dano?</span><div class="stack-2">${choice('dano', 'nao', 'Não', { def: 'nao' })}${choice('dano', 'sim', 'Sim, registrar dano')}</div></div>
        ${FORM.dano === 'sim' ? field('Descreva o dano', textarea('vdano')) + banner('info', 'info', 'Uma reclamação contra a unidade será aberta em nome do condomínio, com as fotos.', { inline: true }) : ''}` : ''}
      ${podeFalta && usou === 'nao' ? banner(w.paga ? 'info' : 'warning', w.paga ? 'info' : 'triangle-alert', w.paga ? 'Reserva paga: Não comparecimento não gera perda de pontos nem reembolso automático.' : 'Não comparecimento: a cada 2 faltas gratuitas no trimestre pelo mesmo vínculo de moradia, quem reservou perde 5 pontos.', { inline: true }) : ''}${historico}
    </div>`,
    footer: !podeVistoriar || !usou ? '' : usou === 'nao' && podeFalta ? btn('Registrar não comparecimento', { block: true, size: 'lg', disabled: !S.online, on: () => done('Não comparecimento', 'Não comparecimento registrado.') })
      : usou === 'sim' ? btn('Marcar cumprida', { block: true, size: 'lg', disabled: !S.online, on: () => {
        if (FORM.dano !== 'sim' && chk.length < ITENS.length) { A.chkErr = true; rerender(); return; }
        if (!(FORM.vfotos || []).length) { toast('Anexe fotos da vistoria.'); return; }
        if (FORM.dano === 'sim' && !(FORM.vdano || '').trim()) { toast('Descreva o dano encontrado.'); return; }
        A.chkErr = false; w.vistoria = { checklist: [...chk], fotos: [...FORM.vfotos], dano: FORM.dano === 'sim' ? FORM.vdano : null };
        done('Cumprida', FORM.dano === 'sim' ? 'Vistoria salva. Reclamação aberta em nome do condomínio.' : 'Vistoria salva. Reserva cumprida.');
      } }) : '',
  };
});

def('portaria', 'menu', 'Menu', 'Menu', () => ({
  tab: 'menu', top: { title: 'Menu' }, flush: true,
  body: `<div class="pad"><div class="t-title-sm">José Ribeiro</div><div class="t-body-sm muted">Portaria principal · Blocos A e B · turno diurno</div></div>
    <div class="list">${row({ icon: 'wrench', title: 'Abrir chamado', on: () => { resetForm({ ctipo: 'limpeza' }); go('portaria/chamado-novo'); } })}
    ${sw('Modo treinamento', S.training, () => { S.training = !S.training; rerender(); toast(S.training ? 'Modo treinamento ligado. Nada aqui é real.' : 'Você saiu do treinamento.'); }, { sub: 'Lista fictícia. Nada é gravado e ninguém é avisado.' }).replace('switch-row', 'switch-row list-row')}
    ${[['gauge', 'Meu score', 'score'], ['eye', 'Transparência', 'transparencia'], ['megaphone', 'Comunicados', 'comunicados'], ['circle-help', 'Como funciona', 'como-funciona'], ['sparkles', 'Como usar o app', 'como-usar'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']].map(([i, l, r]) => row({ icon: i, title: l, on: 'portaria/' + r })).join('')}
    ${row({ icon: 'log-out', title: 'Sair', on: sairStaff })}</div>`,
}));
function sairStaff() {
  if (S.pending.length) return dialog({ tone: 'warning', icon: 'cloud-upload', title: 'Registros não enviados', text: `Há ${S.pending.length} registros ainda não enviados. Conecte-se antes de sair.`, actions: [{ label: 'Entendi' }] });
  dialog({ title: 'Sair da conta?', text: 'A cópia da lista salva neste aparelho será apagada.', actions: [{ label: 'Sair', on: () => go('acesso/boas-vindas') }, { label: 'Continuar', v: 'secondary' }] });
}

/* ---------------- Limpeza (8.2, 11.2) ---------------- */
function concluirLimpeza(c, back) {
  FORM.lfotos = [];
  sheet(() => `<h2 class="t-title-md">Concluir chamado</h2><div class="t-body-sm muted">${c.cat} · ${c.local}</div>
    ${c.id === 'c3' && !S.online ? `<div class="field"><span class="field-label">Simular disputa no mesmo ciclo</span>${choice('ordemConclusao', 'colega', 'Rita concluiu às 14h10 e enviou antes', { def: 'colega' })}${choice('ordemConclusao', 'minha', 'Rita concluiu às 14h15 e enviou antes; minha conclusão das 14h10 chega depois')}<span class="help">Vale o menor horário do celular. Horários iguais usam ordem da fila apenas como proposta de desempate nesta simulação.</span></div>` : ''}
    <div class="field"><span class="field-label">Fotos do serviço (opcional)</span>${photoPicker('lfotos')}<span class="help">Até 5 fotos. Você pode concluir sem foto.</span></div>
    ${btn('Concluir chamado', { block: true, size: 'lg', icon: 'check', on: () => {
      const op = { opId: uid(), ciclo: c.ciclo || 1, registradaEm: c.id === 'c3' && !S.online && FORM.ordemConclusao === 'minha' ? '2026-11-05T14:10' : AGORA_PROTO, por: 'Sandra Rocha', fotos: Math.min((FORM.lfotos || []).length, 5) };
      if (!S.online) {
        if (c.id === 'c3') S.pending.push({ t: 'Conclusão da colega · ' + c.local, chamadoId: c.id, conclusao: { opId: uid(), ciclo: op.ciclo, registradaEm: FORM.ordemConclusao === 'minha' ? '2026-11-05T14:15' : '2026-11-05T14:10', por: 'Rita Farias', fotos: 0 } });
        S.pending.push({ t: 'Conclusão · ' + c.local, chamadoId: c.id, conclusao: op });
        c.estado = 'Concluído'; c.conclusaoPendente = true; c.concluidoEm = op.registradaEm; c.concluidoPor = op.por; c.fotos = op.fotos;
      } else aplicarConclusaoLimpeza(c, op);
      c.concluido = 'agora'; FORM.lfotos = []; vibrate(); closeLayer();
      if (back) go(back); else rerender();
      toast(S.online ? 'Chamado concluído. Quem abriu foi avisado.' : 'Chamado concluído. Será enviado quando a conexão voltar.');
    } })}`);
}
def('limpeza', 'chamados', 'Fila do setor', 'Chamados (8.2)', () => {
  const f = FORM.lf || 'abertos';
  const L = ordenarChamados(S.chamados.filter(c => c.tipo === 'limpeza' && (f === 'abertos' ? c.estado !== 'Concluído' : c.estado === 'Concluído')));
  return {
    tab: 'chamados', top: { title: 'Chamados de limpeza' },
    body: `<div class="stack"><div class="chips">${chip('Na fila', f === 'abertos', () => { FORM.lf = 'abertos'; rerender(); })}${chip('Concluídos', f === 'feitos', () => { FORM.lf = 'feitos'; rerender(); })}</div>
      ${L.length ? L.map(c => card({ icon: 'spray-can', title: c.local, sub: c.cat + ' · aberto ' + c.aberto, badge: badgeStack(st(c.estado), urgBadge(c.urg), c.fora && c.estado !== 'Concluído' ? badge('Fora do prazo', 'danger') : ''),
        body: `${esc(c.desc)}${c.estado !== 'Concluído' ? `<div class="row t-body-sm ${c.fora ? 'c-danger' : 'muted'}" style="margin-top:6px">${ic('clock')}${c.prazo}</div>` : ''}`,
        foot: c.estado !== 'Concluído' ? btn('Concluir', { size: 'lg', icon: 'check', on: () => concluirLimpeza(c) }) : '', on: 'limpeza/chamado/' + c.id })).join('') : empty('spray-can', f === 'abertos' ? 'Nenhum chamado na fila. Bom trabalho!' : 'Nenhum chamado concluído hoje.')}</div>`,
  };
});
def('limpeza', 'chamado', 'Detalhe do chamado', 'Chamados (8.2)', ctx => {
  const c = S.chamados.find(x => x.id === ctx.arg) || S.chamados[0];
  return {
    tab: 'chamados', top: { title: 'Chamado', back: 'limpeza/chamados' },
    body: `<div class="stack">${card({ icon: 'spray-can', title: c.cat, sub: c.local + ' · aberto ' + c.aberto + ' por ' + c.autor, badge: badgeStack(st(c.estado), urgBadge(c.urg)), body: esc(c.desc) })}
      ${urgLogLine(c)}${c.estado === 'Concluído' ? `<p class="help">${ic('camera')} ${c.fotos ? c.fotos + (c.fotos === 1 ? ' foto do serviço anexada' : ' fotos do serviço anexadas') : 'Concluído sem fotos do serviço'}</p>` : ''}${c.estado !== 'Concluído' ? `<div class="row t-body ${c.fora ? 'c-danger' : ''}">${ic('clock')}${c.prazo}</div>` : ''}
      ${c.fora && c.estado !== 'Concluído' ? banner('danger', 'circle-x', 'Fora do prazo. O síndico vê este chamado em destaque.', { inline: true }) : ''}
      ${timeline([{ t: 'Aberto', d: c.aberto, state: 'done' }, { t: 'Em atendimento', state: c.estado === 'Em atendimento' ? 'now' : c.estado === 'Concluído' ? 'done' : '' }, { t: 'Concluído', state: c.estado === 'Concluído' ? 'done' : '' }])}</div>`,
    footer: c.estado === 'Concluído' ? '' : `${btn('Concluir', { block: true, size: 'lg', icon: 'check', on: () => concluirLimpeza(c, 'limpeza/chamados') })}${c.estado === 'Aberto' ? btn('Iniciar atendimento', { v: 'secondary', block: true, on: () => { c.estado = 'Em atendimento'; if (!S.online) S.pending.push({ t: 'Início · ' + c.local }); rerender(); toast('Chamado em atendimento.'); } }) : ''}`,
  };
});
/* Minhas avaliações (RN-CH-20): média e comentários sem identificar o morador; só com 3 ou mais avaliações; sem efeito no score (RN-CH-21) */
def('limpeza', 'avaliacoes', 'Minhas avaliações', 'Avaliações do atendimento (8.5)', () => {
  const r = avalResumo(A.poucas ? 'Rita Farias' : 'Sandra Rocha');
  const ok = r.n >= MIN_AVAL_FUNC;
  const com = [...r.comentarios].sort((a, b) => a.dias - b.dias);
  return {
    tab: 'menu', top: { title: 'Minhas avaliações', back: 'limpeza/menu' },
    body: `<div class="stack">${banner('info', 'info', 'A avaliação do atendimento não muda o seu score. Os comentários chegam sem o nome de quem avaliou.', { inline: true })}
      ${ok ? `<div class="card"><div class="score-num"><span class="t-display num">${mediaTxt(r.media)}</span><span class="t-body muted">de 5 · ${r.n} avaliações</span></div>${starsRead(r.media)}${avalDist(r)}</div>
        <h3 class="t-title-sm">Comentários</h3>${com.length ? com.map(a => `<div class="msg"><div>${esc(a.coment)}</div><div class="t-caption muted" style="margin-top:4px">${starsRead(a.nota)} ${esc(a.mes)}</div></div>`).join('') : '<p class="help">Ninguém deixou comentário ainda.</p>'}`
        : empty('star', 'Poucas avaliações para mostrar a média.')}
      <label class="row help"><input type="checkbox" class="checkbox" ${A.poucas ? 'checked' : ''} ${cb(() => { A.poucas = !A.poucas; rerender(); })}>Simular funcionário com poucas avaliações (Rita Farias)</label></div>`,
  };
});
def('limpeza', 'menu', 'Menu', 'Menu', () => ({
  tab: 'menu', top: { title: 'Menu' }, flush: true,
  body: `<div class="pad"><div class="t-title-sm">Sandra Rocha</div><div class="t-body-sm muted">Limpeza · turno da manhã</div></div>
    <div class="list">${[['gauge', 'Meu score', 'score'], ['star', 'Minhas avaliações', 'avaliacoes'], ['eye', 'Transparência', 'transparencia'], ['megaphone', 'Comunicados', 'comunicados'], ['circle-help', 'Como funciona', 'como-funciona'], ['sparkles', 'Como usar o app', 'como-usar'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']].map(([i, l, r]) => row({ icon: i, title: l, on: 'limpeza/' + r })).join('')}
    ${row({ icon: 'log-out', title: 'Sair', on: sairStaff })}</div>`,
}));

/* ---------------- Manutenção (proposta: funcionário interno; não previsto no PRD) ---------------- */
const MAN = [
  { id: 'm-1', urg: 'alta', abertoEm: '2026-11-02T08:30', cat: 'Hidráulica', local: 'Bloco B, 3º andar', desc: 'Vazamento no teto do corredor.', estado: 'Agendado', agenda: 'Hoje, 10h', autor: 'Síndico Pedro Alves', notas: [] },
  { id: 'm-2', urg: 'media', abertoEm: '2026-11-03T09:40', cat: 'Elétrica', local: 'Garagem, vaga 14', desc: 'Lâmpada queimada perto da vaga 14.', estado: 'Aberto', agenda: 'Hoje, 14h', autor: 'Síndico Pedro Alves', notas: [] },
  { id: 'm-3', urg: 'leve', abertoEm: '2026-10-31T10:00', cat: 'Portão', local: 'Portão da garagem', desc: 'Lubrificar e ajustar o fim de curso.', estado: 'Em atendimento', agenda: 'Amanhã, 9h', autor: 'Síndico Pedro Alves', notas: ['Peça encomendada, chega amanhã.'] },
  { id: 'm-4', urg: 'media', abertoEm: '2026-11-01T15:00', cat: 'Estrutura', local: 'Playground', desc: 'Parafuso solto no balanço.', estado: 'Concluído', agenda: '03/11', autor: 'Síndico Pedro Alves', notas: [] },
];
const banProposta = () => banner('accent', 'sparkles', 'Perfil proposto: o PRD ainda não tem funcionário de manutenção. Hoje o síndico acompanha empresas cadastradas.');
def('manutencao', 'chamados', 'Meus chamados', 'Chamados (proposta)', () => {
  const f = FORM.mf || 'ativos';
  const L = ordenarChamados(MAN.filter(c => f === 'ativos' ? c.estado !== 'Concluído' : c.estado === 'Concluído'));
  return {
    tab: 'chamados', top: { title: 'Manutenção' }, banner: S.online ? banProposta() : undefined,
    body: `<div class="stack"><div class="chips">${chip('Ativos', f === 'ativos', () => { FORM.mf = 'ativos'; rerender(); })}${chip('Concluídos', f === 'feitos', () => { FORM.mf = 'feitos'; rerender(); })}</div>
      ${L.map(c => card({ icon: 'wrench', title: c.local, sub: c.cat + ' · ' + c.agenda, badge: badgeStack(st(c.estado), urgBadge(c.urg)), body: esc(c.desc), on: 'manutencao/chamado/' + c.id,
        foot: c.estado === 'Agendado' || c.estado === 'Aberto' ? btn('Iniciar atendimento', { v: 'secondary', size: 'lg', on: () => { c.estado = 'Em atendimento'; rerender(); toast('Chamado em atendimento. O síndico foi avisado.'); } }) : c.estado === 'Em atendimento' ? btn('Concluir', { size: 'lg', icon: 'check', on: () => go('manutencao/chamado/' + c.id) }) : '' })).join('')}</div>`,
  };
});
def('manutencao', 'chamado', 'Detalhe do chamado', 'Chamados (proposta)', ctx => {
  const c = MAN.find(x => x.id === ctx.arg) || MAN[0];
  return {
    tab: 'chamados', top: { title: 'Chamado', back: 'manutencao/chamados' },
    body: `<div class="stack">${card({ icon: 'wrench', title: c.cat, sub: c.local + ' · ' + c.agenda, badge: badgeStack(st(c.estado), urgBadge(c.urg)), body: esc(c.desc) })}
      ${row({ icon: 'user', title: c.autor, sub: 'Quem atribuiu' })}
      <h3 class="t-title-sm">Andamento</h3>${timeline([{ t: 'Atribuído pelo síndico', state: 'done' }, { t: 'Agendado', d: c.agenda, state: c.estado === 'Aberto' ? 'now' : 'done' }, { t: 'Em atendimento', state: c.estado === 'Em atendimento' ? 'now' : c.estado === 'Concluído' ? 'done' : '' }, { t: 'Concluído', state: c.estado === 'Concluído' ? 'done' : '' }])}
      ${c.notas.length ? `<h3 class="t-title-sm">Anotações</h3>${c.notas.map(n => `<div class="msg">${esc(n)}</div>`).join('')}` : ''}
      ${c.estado !== 'Concluído' ? `<div class="field"><span class="field-label">Fotos do serviço (opcional)</span>${photoPicker('mfotos')}</div>` : ''}</div>`,
    footer: c.estado === 'Concluído' ? '' : `${c.estado === 'Em atendimento' ? btn('Concluir chamado', { block: true, size: 'lg', icon: 'check', on: () => { c.estado = 'Concluído'; c.fotos = (FORM.mfotos || []).length; FORM.mfotos = []; vibrate(); go('manutencao/chamados'); setTimeout(() => toast('Chamado concluído. O síndico e quem abriu foram avisados.'), 50); } }) : btn('Iniciar atendimento', { block: true, size: 'lg', on: () => { c.estado = 'Em atendimento'; rerender(); toast('Chamado em atendimento.'); } })}
      ${btn('Registrar andamento', { v: 'secondary', block: true, icon: 'message-circle', on: () => sheet(`<h2 class="t-title-md">Registrar andamento</h2>${field('Anotação', textarea('mnota', { ph: 'Ex.: Precisa de peça, volto amanhã' }))}${btn('Salvar anotação', { block: true, on: () => { if ((FORM.mnota || '').trim()) { c.notas.push(FORM.mnota); FORM.mnota = ''; } closeLayer(); rerender(); toast('Anotação salva.'); } })}`) })}`,
  };
});
def('manutencao', 'agenda', 'Agenda', 'Agenda (proposta)', () => ({
  tab: 'agenda', top: { title: 'Agenda' }, flush: true,
  body: `${['Hoje', 'Amanhã'].map(d => `<div class="pad" style="padding-bottom:0"><h2 class="t-title-sm">${d}</h2></div><div class="list">${MAN.filter(c => c.agenda.startsWith(d)).map(c => row({ icon: 'clock', title: c.agenda.split(', ')[1] + ' · ' + c.local, sub: c.cat, right: st(c.estado), on: 'manutencao/chamado/' + c.id })).join('')}</div>`).join('')}`,
}));
def('manutencao', 'menu', 'Menu', 'Menu', () => ({
  tab: 'menu', top: { title: 'Menu' }, flush: true,
  body: `<div class="pad"><div class="t-title-sm">Marcelo Dias</div><div class="t-body-sm muted">Manutenção · equipe interna</div></div>
    <div class="list">${[['gauge', 'Meu score', 'score'], ['eye', 'Transparência', 'transparencia'], ['megaphone', 'Comunicados', 'comunicados'], ['circle-help', 'Como funciona', 'como-funciona'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']].map(([i, l, r]) => row({ icon: i, title: l, on: 'manutencao/' + r })).join('')}
    ${row({ icon: 'log-out', title: 'Sair', on: sairStaff })}</div>`,
}));
