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
  const L = lista().filter(v => (b === 'todos' || v.bloco === b) && (!q || (v.nome + ' ' + v.un).toLowerCase().includes(q)));
  const bloqueado = q.length > 2 && S.bloqueados.find(x => x.nome.toLowerCase().includes(q));
  const rowV = v => {
    const dentro = v.estado === 'Entrou' || v.estado === 'Autorizado por interfone';
    const action = v.estado === 'Saiu' ? '' : dentro
      ? btn('Saída', { v: 'secondary', size: 'lg', icon: 'log-out', on: () => registrar(v, 'Saiu') })
      : btn('Entrada', { size: 'lg', icon: 'log-in', on: () => tocarEntrada(v) });
    return `<div class="list-row" style="min-height:80px">
      <span class="body"><span class="title t-body-lg">${esc(v.nome)}</span><span class="sub">${v.un}${v.hora ? ' · ' + v.hora : ''}</span>
      <span class="row wrap" style="gap:6px;margin-top:4px">${st(v.estado)}${v.bloqueio ? badge('Na lista de bloqueio', 'danger', 'ban') : ''}${v.fora ? badge('Fora do horário cadastrado', 'warning', 'clock') : ''}${v.rec ? badge('Recorrente', 'neutral') : ''}</span></span>${action}</div>`;
  };
  return {
    tab: 'visitantes', top: { title: 'Esperados hoje' }, flush: true,
    body: `<div class="pad stack-2" style="position:sticky;top:0;background:var(--bg);z-index:2;box-shadow:var(--elev-2)">
        ${input('pq', { icon: 'search', ph: 'Nome, unidade ou bloco', attr: 'aria-label="Buscar visitante" autocomplete="off"' })}
        <div class="chips">${['todos', 'A', 'B'].map(x => chip(x === 'todos' ? 'Todos' : 'Bloco ' + x, b === x, () => { FORM.pb = x; rerender(); })).join('')}</div></div>
      ${bloqueado ? `<div class="pad" style="padding-bottom:0">${banner('danger', 'ban', `<b>${bloqueado.nome}</b> está na lista de bloqueio. Motivo: ${bloqueado.motivo}`, { inline: true })}</div>` : ''}
      <div class="list">${L.length ? L.map(rowV).join('') : outro ? empty('search', 'Nenhum resultado. Esta portaria atende os blocos A e B.') : empty('users', q ? 'Ninguém com esse nome nos esperados de hoje. Interfone para o morador e use Entrada sem cadastro.' : 'Nenhum visitante esperado hoje.')}</div>
      <p class="help pad">Dica do protótipo: busque “bloco c” para ver o aviso de outra portaria, ou “Marcos” para a lista de bloqueio.</p>`,
    fab: { icon: 'user-plus', label: 'Entrada sem cadastro', on: () => { FORM.sc_auth = []; sheet(() => `<h2 class="t-title-md">Entrada sem cadastro</h2>
      ${field('Nome do visitante', input('scn'))}${field('Unidade', input('scu', { ph: 'Ex.: Bloco A · Apto 101' }))}
      ${choice('sc_auth', 'ok', 'Autorizado por interfone', { multi: true, icon: 'phone' })}
      ${btn('Registrar entrada', { block: true, size: 'lg', icon: 'log-in', disabled: !(FORM.sc_auth || []).includes('ok') || !(FORM.scn || '').trim(), on: () => { const v = { id: uid(), nome: FORM.scn, un: FORM.scu || 'Unidade não informada', bloco: 'A', estado: 'Esperado' }; lista().unshift(v); closeLayer(); registrar(v, 'Autorizado por interfone'); FORM.scn = ''; FORM.scu = ''; } })}
      ${!(FORM.sc_auth || []).includes('ok') ? `<p class="disabled-reason">${ic('info')}Interfone para o morador e marque a autorização.</p>` : ''}`); } },
    after: () => { const el = $('#f-pq'); if (el) { el.addEventListener('input', () => { clearTimeout(window._pq); window._pq = setTimeout(() => { rerender(); const n = $('#f-pq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); }); } },
  };
});

/* Encomendas (7.1) */
def('portaria', 'encomendas', 'Encomendas', 'Encomendas (7.1)', () => {
  const f = FORM.pe || 'Recebida';
  const L = S.encomendas.filter(e => f === 'todas' || e.estado === f || (f === 'Recebida' && e.estado === 'Prazo vencido'));
  const retirar = e => { FORM.quem = null; sheet(() => `<h2 class="t-title-md">Quem está retirando?</h2><div class="t-body-sm muted">${e.rem} · ${e.un}</div>
    ${['Ana Lima', 'Lucas Lima'].map(n => choice('quem', n, n, { sub: 'Morador da unidade' })).join('')}
    ${choice('quem', 'outro', 'Outra pessoa, autorizada pelo morador pelo interfone')}
    ${FORM.quem === 'outro' ? field('Nome de quem retirou', input('quemn')) : ''}
    ${btn('Registrar retirada', { block: true, size: 'lg', disabled: !FORM.quem, on: () => { e.estado = 'Retirada'; e.quem = FORM.quem === 'outro' ? FORM.quemn : FORM.quem; vibrate(); closeLayer(); rerender(); toast('Retirada registrada.'); } })}
    ${btn('Corrigir unidade', { v: 'text', block: true, on: () => { closeLayer(); sheet(`<h2 class="t-title-md">Corrigir unidade</h2>${field('Unidade certa', input('nun', { value: e.un }))}${btn('Salvar correção', { block: true, on: () => { e.un = FORM.nun || e.un; closeLayer(); rerender(); toast('Unidade corrigida. A unidade anterior foi avisada do engano.'); } })}`); } })}`); };
  return {
    tab: 'encomendas', top: { title: 'Encomendas' }, flush: true,
    body: `<div class="pad chips">${[['Recebida', 'Aguardando retirada'], ['Retirada', 'Retiradas'], ['todas', 'Todas']].map(([k, l]) => chip(l, f === k, () => { FORM.pe = k; rerender(); })).join('')}</div>
      <div class="list">${L.map(e => `<div class="list-row" style="min-height:76px"><span class="lead">${ic('package')}</span><span class="body"><span class="title t-body-lg">${e.un}</span><span class="sub">${e.rem} · ${e.data}${e.quem ? ' · retirou: ' + e.quem : ''}</span><span style="margin-top:4px">${st(e.estado)}</span></span>
        ${['Recebida', 'Prazo vencido'].includes(e.estado) ? btn('Retirada', { v: 'secondary', size: 'lg', on: () => retirar(e) }) : ''}</div>`).join('')}</div>`,
    fab: { icon: 'plus', label: 'Registrar', aria: 'Registrar encomenda', on: () => { if (!S.online) { dialog({ tone: 'warning', icon: 'wifi-off', title: 'Sem internet', text: 'Encomendas precisam de internet. Anote e registre quando a conexão voltar.', actions: [{ label: 'Entendi' }] }); return; } resetForm(); go('portaria/encomenda-nova'); } },
  };
});
def('portaria', 'encomenda-nova', 'Registrar encomenda', 'Encomendas (7.1)', () => ({
  tab: 'encomendas', top: { title: 'Registrar encomenda', back: 'portaria/encomendas' },
  body: `<div class="stack-5">${banner('info', 'info', 'Comida por aplicativo não é registrada: avise o morador pelo interfone.', { inline: true })}
    ${field('Unidade', input('eun', { ph: 'Ex.: Bloco A · Apto 101', cls: 't-body-lg' }), { error: A.eErr })}
    <div class="field"><span class="field-label">Remetente</span><div class="chips">${['Amazon', 'Mercado Livre', 'Correios', 'Shopee', 'Outro'].map(r => chip(r, FORM.erem === r, () => { FORM.erem = r; rerender(); })).join('')}</div></div>
    <div class="field"><span class="field-label">Foto da etiqueta (opcional)</span>${photoPicker('efotos')}</div></div>`,
  footer: btn('Registrar encomenda', { block: true, size: 'lg', icon: 'package', disabled: !S.online, on: () => {
    if (!(FORM.eun || '').trim()) { A.eErr = 'Informe a unidade.'; rerender(); return; }
    A.eErr = ''; S.encomendas.unshift({ id: 'e' + uid(), un: FORM.eun, rem: FORM.erem || 'Outro', data: 'Hoje, ' + nowH(), estado: 'Recebida' }); vibrate();
    go('portaria/encomendas'); setTimeout(() => toast('Encomenda registrada. O morador foi avisado.'), 50);
  } }) + (!S.online ? `<p class="disabled-reason">${ic('wifi-off')}Encomendas precisam de internet. Anote e registre quando a conexão voltar.</p>` : ''),
}));

/* Áreas: vistoria e não comparecimento (5.3) — portaria e limpeza */
def(['portaria', 'limpeza'], 'areas', 'Vistorias', 'Áreas (5.3)', ctx => ({
  tab: 'areas', top: { title: 'Áreas' }, flush: true,
  body: `<div class="pad t-body-sm muted">Reservas encerradas aguardando vistoria.</div>
    <div class="list">${S.vistorias.map(w => row({ icon: 'clipboard-check', title: w.area, sub: w.un + ' · terminou ' + w.fim, right: badge(w.estado, w.estado === 'Pendente' ? 'warning' : TONES[w.estado] || 'neutral'), on: w.estado === 'Pendente' ? ctx.p + '/vistoria/' + w.id : null })).join('')}</div>`,
}));
def(['portaria', 'limpeza'], 'vistoria', 'Fazer vistoria', 'Áreas (5.3)', ctx => {
  const w = S.vistorias.find(x => x.id === ctx.arg) || S.vistorias[0], p = ctx.p;
  const usou = FORM.usou, chk = FORM.chk || [];
  const ITENS = ['Área limpa', 'Móveis no lugar', 'Sem lixo', 'Equipamentos funcionando', 'Chave devolvida'];
  const done = (estado, msg) => { w.estado = estado; if (!S.online) S.pending.push({ t: 'Vistoria · ' + w.area }); go(p + '/areas'); setTimeout(() => toast(msg), 50); };
  return {
    tab: 'areas', top: { title: 'Vistoria', back: p + '/areas' },
    body: `<div class="stack-5">${card({ icon: 'clipboard-check', title: w.area, sub: w.un + ' · terminou ' + w.fim, badge: w.paga ? badge('Paga', 'info') : badge('Gratuita', 'neutral') })}
      <div class="field"><span class="field-label">O morador usou a área?</span><div class="stack-2">${choice('usou', 'sim', 'Sim, usou')}${choice('usou', 'nao', 'Não, não compareceu')}</div></div>
      ${usou === 'sim' ? `<div class="field"><span class="field-label">Checklist</span><div class="stack-2">${ITENS.map(i => choice('chk', i, i, { multi: true })).join('')}</div>${A.chkErr ? `<span class="error-msg">${ic('circle-x')}Marque todos os itens obrigatórios ou registre um dano.</span>` : ''}</div>
        <div class="field"><span class="field-label">Fotos</span>${photoPicker('vfotos')}${!S.online && (FORM.vfotos || []).length ? `<span class="help row">${ic('cloud-upload')}A foto será enviada quando a conexão voltar.</span>` : ''}</div>
        <div class="field"><span class="field-label">Encontrou dano?</span><div class="stack-2">${choice('dano', 'nao', 'Não', { def: 'nao' })}${choice('dano', 'sim', 'Sim, registrar dano')}</div></div>
        ${FORM.dano === 'sim' ? field('Descreva o dano', textarea('vdano')) + banner('info', 'info', 'Uma reclamação contra a unidade será aberta em nome do condomínio, com as fotos.', { inline: true }) : ''}` : ''}
      ${usou === 'nao' ? banner(w.paga ? 'info' : 'warning', w.paga ? 'info' : 'triangle-alert', w.paga ? 'Reserva paga: o registro de que a área não foi usada não gera penalidade.' : 'Não comparecimento: a cada 2 faltas no trimestre, a unidade perde 5 pontos.', { inline: true }) : ''}
    </div>`,
    footer: !usou ? '' : usou === 'nao' ? btn(w.paga ? 'Registrar área não usada' : 'Registrar não comparecimento', { block: true, size: 'lg', on: () => done(w.paga ? 'Realizada' : 'Não comparecimento', 'Registro salvo.') })
      : btn('Concluir vistoria', { block: true, size: 'lg', on: () => {
        if (FORM.dano !== 'sim' && chk.length < ITENS.length) { A.chkErr = true; rerender(); return; }
        A.chkErr = false; done('Realizada', FORM.dano === 'sim' ? 'Vistoria salva. Reclamação aberta em nome do condomínio.' : 'Vistoria salva. Reserva realizada.');
      } }),
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
  sheet(`<h2 class="t-title-md">Concluir chamado</h2><div class="t-body-sm muted">${c.cat} · ${c.local}</div>
    <div class="field"><span class="field-label">Foto (opcional)</span>${photoPicker('lfotos')}</div>
    ${btn('Concluir chamado', { block: true, size: 'lg', icon: 'check', on: () => {
      c.estado = 'Concluído'; c.concluido = 'agora'; vibrate(); closeLayer();
      if (!S.online) S.pending.push(Object.assign({ t: 'Conclusão · ' + c.local }, c.id === 'c3' ? { dup: 'Este chamado já tinha sido concluído por Rita Farias.' } : {}));
      if (back) go(back); else rerender();
      toast(S.online ? 'Chamado concluído. Quem abriu foi avisado.' : 'Chamado concluído. Será enviado quando a conexão voltar.');
    } })}`);
}
def('limpeza', 'chamados', 'Fila do setor', 'Chamados (8.2)', () => {
  const f = FORM.lf || 'abertos';
  const L = S.chamados.filter(c => c.tipo === 'limpeza' && (f === 'abertos' ? c.estado !== 'Concluído' : c.estado === 'Concluído')).sort((a, b) => (b.fora ? 1 : 0) - (a.fora ? 1 : 0));
  return {
    tab: 'chamados', top: { title: 'Chamados de limpeza' },
    body: `<div class="stack"><div class="chips">${chip('Na fila', f === 'abertos', () => { FORM.lf = 'abertos'; rerender(); })}${chip('Concluídos', f === 'feitos', () => { FORM.lf = 'feitos'; rerender(); })}</div>
      ${L.length ? L.map(c => card({ icon: 'spray-can', title: c.local, sub: c.cat + ' · aberto ' + c.aberto, badge: `<span class="stack-2" style="align-items:flex-end">${st(c.estado)}${c.fora && c.estado !== 'Concluído' ? badge('Fora do prazo', 'danger') : ''}</span>`,
        body: `${esc(c.desc)}${c.estado !== 'Concluído' ? `<div class="row t-body-sm ${c.fora ? 'c-danger' : 'muted'}" style="margin-top:6px">${ic('clock')}${c.prazo}</div>` : ''}`,
        foot: c.estado !== 'Concluído' ? btn('Concluir', { size: 'lg', icon: 'check', on: () => concluirLimpeza(c) }) : '', on: 'limpeza/chamado/' + c.id })).join('') : empty('spray-can', f === 'abertos' ? 'Nenhum chamado na fila. Bom trabalho!' : 'Nenhum chamado concluído hoje.')}</div>`,
  };
});
def('limpeza', 'chamado', 'Detalhe do chamado', 'Chamados (8.2)', ctx => {
  const c = S.chamados.find(x => x.id === ctx.arg) || S.chamados[0];
  return {
    tab: 'chamados', top: { title: 'Chamado', back: 'limpeza/chamados' },
    body: `<div class="stack">${card({ icon: 'spray-can', title: c.cat, sub: c.local + ' · aberto ' + c.aberto + ' por ' + c.autor, badge: st(c.estado), body: esc(c.desc) })}
      ${c.estado !== 'Concluído' ? `<div class="row t-body ${c.fora ? 'c-danger' : ''}">${ic('clock')}${c.prazo}</div>` : ''}
      ${c.fora && c.estado !== 'Concluído' ? banner('danger', 'circle-x', 'Fora do prazo. O síndico vê este chamado em destaque.', { inline: true }) : ''}
      ${timeline([{ t: 'Aberto', d: c.aberto, state: 'done' }, { t: 'Em atendimento', state: c.estado === 'Em atendimento' ? 'now' : c.estado === 'Concluído' ? 'done' : '' }, { t: 'Concluído', state: c.estado === 'Concluído' ? 'done' : '' }])}</div>`,
    footer: c.estado === 'Concluído' ? '' : `${btn('Concluir', { block: true, size: 'lg', icon: 'check', on: () => concluirLimpeza(c, 'limpeza/chamados') })}${c.estado === 'Aberto' ? btn('Iniciar atendimento', { v: 'secondary', block: true, on: () => { c.estado = 'Em atendimento'; if (!S.online) S.pending.push({ t: 'Início · ' + c.local }); rerender(); toast('Chamado em atendimento.'); } }) : ''}`,
  };
});
def('limpeza', 'menu', 'Menu', 'Menu', () => ({
  tab: 'menu', top: { title: 'Menu' }, flush: true,
  body: `<div class="pad"><div class="t-title-sm">Sandra Rocha</div><div class="t-body-sm muted">Limpeza · turno da manhã</div></div>
    <div class="list">${[['gauge', 'Meu score', 'score'], ['eye', 'Transparência', 'transparencia'], ['megaphone', 'Comunicados', 'comunicados'], ['circle-help', 'Como funciona', 'como-funciona'], ['sparkles', 'Como usar o app', 'como-usar'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']].map(([i, l, r]) => row({ icon: i, title: l, on: 'limpeza/' + r })).join('')}
    ${row({ icon: 'log-out', title: 'Sair', on: sairStaff })}</div>`,
}));

/* ---------------- Manutenção (proposta: funcionário interno; não previsto no PRD) ---------------- */
const MAN = [
  { id: 'm-1', cat: 'Hidráulica', local: 'Bloco B, 3º andar', desc: 'Vazamento no teto do corredor.', estado: 'Agendado', agenda: 'Hoje, 10h', autor: 'Síndico Pedro Alves', notas: [] },
  { id: 'm-2', cat: 'Elétrica', local: 'Garagem, vaga 14', desc: 'Lâmpada queimada perto da vaga 14.', estado: 'Aberto', agenda: 'Hoje, 14h', autor: 'Síndico Pedro Alves', notas: [] },
  { id: 'm-3', cat: 'Portão', local: 'Portão da garagem', desc: 'Lubrificar e ajustar o fim de curso.', estado: 'Em atendimento', agenda: 'Amanhã, 9h', autor: 'Síndico Pedro Alves', notas: ['Peça encomendada, chega amanhã.'] },
  { id: 'm-4', cat: 'Estrutura', local: 'Playground', desc: 'Parafuso solto no balanço.', estado: 'Concluído', agenda: '03/11', autor: 'Síndico Pedro Alves', notas: [] },
];
const banProposta = () => banner('accent', 'sparkles', 'Perfil proposto: o PRD ainda não tem funcionário de manutenção. Hoje o síndico acompanha empresas cadastradas.');
def('manutencao', 'chamados', 'Meus chamados', 'Chamados (proposta)', () => {
  const f = FORM.mf || 'ativos';
  const L = MAN.filter(c => f === 'ativos' ? c.estado !== 'Concluído' : c.estado === 'Concluído');
  return {
    tab: 'chamados', top: { title: 'Manutenção' }, banner: S.online ? banProposta() : undefined,
    body: `<div class="stack"><div class="chips">${chip('Ativos', f === 'ativos', () => { FORM.mf = 'ativos'; rerender(); })}${chip('Concluídos', f === 'feitos', () => { FORM.mf = 'feitos'; rerender(); })}</div>
      ${L.map(c => card({ icon: 'wrench', title: c.local, sub: c.cat + ' · ' + c.agenda, badge: st(c.estado), body: esc(c.desc), on: 'manutencao/chamado/' + c.id,
        foot: c.estado === 'Agendado' || c.estado === 'Aberto' ? btn('Iniciar atendimento', { v: 'secondary', size: 'lg', on: () => { c.estado = 'Em atendimento'; rerender(); toast('Chamado em atendimento. O síndico foi avisado.'); } }) : c.estado === 'Em atendimento' ? btn('Concluir', { size: 'lg', icon: 'check', on: () => go('manutencao/chamado/' + c.id) }) : '' })).join('')}</div>`,
  };
});
def('manutencao', 'chamado', 'Detalhe do chamado', 'Chamados (proposta)', ctx => {
  const c = MAN.find(x => x.id === ctx.arg) || MAN[0];
  return {
    tab: 'chamados', top: { title: 'Chamado', back: 'manutencao/chamados' },
    body: `<div class="stack">${card({ icon: 'wrench', title: c.cat, sub: c.local + ' · ' + c.agenda, badge: st(c.estado), body: esc(c.desc) })}
      ${row({ icon: 'user', title: c.autor, sub: 'Quem atribuiu' })}
      <h3 class="t-title-sm">Andamento</h3>${timeline([{ t: 'Atribuído pelo síndico', state: 'done' }, { t: 'Agendado', d: c.agenda, state: c.estado === 'Aberto' ? 'now' : 'done' }, { t: 'Em atendimento', state: c.estado === 'Em atendimento' ? 'now' : c.estado === 'Concluído' ? 'done' : '' }, { t: 'Concluído', state: c.estado === 'Concluído' ? 'done' : '' }])}
      ${c.notas.length ? `<h3 class="t-title-sm">Anotações</h3>${c.notas.map(n => `<div class="msg">${esc(n)}</div>`).join('')}` : ''}
      ${c.estado !== 'Concluído' ? `<div class="field"><span class="field-label">Fotos do serviço</span>${photoPicker('mfotos')}</div>` : ''}</div>`,
    footer: c.estado === 'Concluído' ? '' : `${c.estado === 'Em atendimento' ? btn('Concluir chamado', { block: true, size: 'lg', icon: 'check', on: () => { c.estado = 'Concluído'; vibrate(); go('manutencao/chamados'); setTimeout(() => toast('Chamado concluído. O síndico e quem abriu foram avisados.'), 50); } }) : btn('Iniciar atendimento', { block: true, size: 'lg', on: () => { c.estado = 'Em atendimento'; rerender(); toast('Chamado em atendimento.'); } })}
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
