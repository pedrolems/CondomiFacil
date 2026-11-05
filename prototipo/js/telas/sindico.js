/* Síndico — aba Gestão: fluxos 4.2, 4.4, 8.3, 9.2, 10.1, 11.1, 11.2 e 13.2 */
'use strict';

def('sindico', 'gestao', 'Gestão', 'Gestão', () => {
  const abertas = S.julgar.filter(j => !['Validada', 'Negada', 'Encerrada'].includes(j.estado)).length;
  const manut = S.chamados.filter(c => c.tipo === 'manutencao' && c.estado !== 'Concluído');
  const fora = S.chamados.filter(c => c.fora && c.estado !== 'Concluído');
  const items = [
    ['scale', 'Reclamações para julgar', 'julgar', abertas ? badge(String(abertas), 'warning') : ''],
    ['wrench', 'Chamados de manutenção', 'manutencao', manut.some(c => c.fora) ? badge('Fora do prazo', 'danger') : badge(String(manut.length), 'info')],
    ['spray-can', 'Limpeza: fila do setor', 'limpeza-painel', fora.filter(c => c.tipo === 'limpeza').length ? badge('Fora do prazo', 'danger') : ''],
    ['megaphone', 'Comunicados', 'comunicados', ''],
    ['vote', 'Reuniões e eleições', 'reunioes', ''],
    ['inbox', 'Solicitações de cadastro', 'solicitacoes', badge(`${S.franquia.usadas} de ${S.franquia.total}`, 'neutral')],
    ['receipt', 'Inadimplência', 'inadimplencia', badge(S.inad.length + ' unidades', 'danger')],
    ['package', 'Encomendas com prazo vencido', 'encomendas-vencidas', badge(String(S.encomendas.filter(e => e.estado === 'Prazo vencido').length), 'warning')],
    ['user-round-cog', 'Substituição pelo subsíndico', 'substituicao', S.substituicao ? badge('Ativa', 'info') : ''],
  ];
  return {
    tab: 'gestao', top: { title: 'Gestão', actions: [{ icon: 'bell', label: 'Notificações', on: 'sindico/notificacoes', dot: true }] }, flush: true,
    body: `<div class="pad" style="padding-bottom:0"><div class="kpis" style="grid-template-columns:1fr 1fr;gap:8px">
        <div class="kpi"><div class="t-caption muted">Seu score</div><div class="v">72</div></div>
        <div class="kpi"><div class="t-caption muted">Fora do prazo</div><div class="v c-danger">${fora.length}</div></div></div></div>
      <div class="list" style="margin-top:8px">${items.map(([i, l, r, b]) => row({ icon: i, title: l, right: b, on: 'sindico/' + r })).join('')}</div>`,
  };
});

/* ---- Julgar reclamações (9.2) ---- */
def('sindico', 'julgar', 'Reclamações para julgar', 'Reclamações (9.2)', () => {
  const f = FORM.fj || 'todas', ord = FORM.oj || 'data';
  let list = S.julgar.filter(j => f === 'todas' || j.estado === f);
  if (ord === 'score') list = list.slice().sort((a, b) => a.alvo.score - b.alvo.score);
  return {
    tab: 'gestao', top: { title: 'Para julgar', back: 'sindico/gestao' }, flush: true,
    body: `<div class="pad stack-2"><div class="chips scroll">${['todas', 'Aberta', 'Em conversa com o alvo', 'Em recurso', 'Validada', 'Negada'].map(x => chip(x === 'todas' ? 'Todas' : x, f === x, () => { FORM.fj = x; rerender(); })).join('')}</div>
        <div class="row t-body-sm muted">${ic('sliders-horizontal')}Ordenar por ${chip('Data', ord === 'data', () => { FORM.oj = 'data'; rerender(); })}${chip('Score do alvo', ord === 'score', () => { FORM.oj = 'score'; rerender(); })}</div></div>
      <div class="list">${list.length ? list.map(j => row({ icon: 'scale', title: j.cat + ' · ' + j.alvo.un, sub: 'Aberta em ' + j.data + ' · gravidade ' + j.grav, right: st(j.estado, ['Validada', 'Negada'].includes(j.estado) ? 'neutral' : undefined), on: 'sindico/julgamento/' + j.id })).join('') : empty('scale', 'Nenhuma reclamação com este filtro.')}</div>`,
  };
});
def('sindico', 'julgamento', 'Julgar reclamação', 'Reclamações (9.2)', ctx => {
  const j = S.julgar.find(x => x.id === ctx.arg) || S.julgar[0];
  const decidida = ['Validada', 'Negada', 'Encerrada'].includes(j.estado);
  const podeDecidir = j.resposta || j.semResposta;
  const pessoa = (l, x) => `<div class="card" style="flex:1"><div class="t-caption muted">${l}</div><b>${x.nome}</b><div class="t-body-sm muted">${x.un}</div><div class="t-body-sm">Score <b class="num">${x.score}</b></div></div>`;
  const conversar = () => sheet(`<h2 class="t-title-md">Conversar com o alvo</h2><p class="t-body-sm muted">Vai como comunicado individual para ${j.alvo.nome}. Não cite quem reclamou.</p>
    ${field('Mensagem', textarea('jmsg', { value: `Olá, ${j.alvo.nome.split(' ')[0]}. Recebemos uma reclamação sobre ${j.cat.toLowerCase()}. Pode nos contar o que aconteceu?` }))}
    ${btn('Enviar', { block: true, icon: 'send', on: () => { j.conversa = true; j.estado = 'Em conversa com o alvo'; closeLayer(); rerender(); toast('Mensagem enviada. Estado: Em conversa com o alvo.'); } })}`);
  const validar = () => sheet(() => `<h2 class="t-title-md">Validar reclamação</h2><p class="t-body-sm muted">${j.alvo.nome} perde os pontos da gravidade escolhida.</p>
    ${[['Leve · −5', 'Leve'], ['Média · −10', 'Média'], ['Grave · −20', 'Grave']].map(([v, l]) => choice('jgrav', v, `${l} <b class="num">${v.split('·')[1]}</b>`, { def: j.grav, sub: v === j.grav ? 'Padrão da categoria' : '' })).join('')}
    ${(FORM.jgrav && FORM.jgrav !== j.grav) ? field('Por que a gravidade mudou?', textarea('jjust'), { error: A.jErr }) : ''}
    ${btn('Validar e aplicar pontos', { v: 'danger', block: true, on: () => {
      if (FORM.jgrav && FORM.jgrav !== j.grav && !(FORM.jjust || '').trim()) { A.jErr = 'Explique por que a gravidade mudou.'; validar(); return; }
      A.jErr = ''; closeLayer();
      dialog({ tone: 'danger', icon: 'scale', title: 'Validar a reclamação?', text: `${j.alvo.nome} perde ${(FORM.jgrav || j.grav).split('·')[1].trim()} pontos e pode recorrer em até 7 dias.`, actions: [{ label: 'Validar', v: 'danger', on: () => { j.estado = 'Validada'; rerender(); toast('Reclamação validada. As partes foram avisadas.'); } }, { label: 'Voltar', v: 'secondary' }] });
    } })}`);
  const negar = () => sheet(() => {
    const mot = FORM.jmot;
    const pen = mot === 'desp' || mot === 'falsa';
    return `<h2 class="t-title-md">Negar reclamação</h2>
      ${choice('jmot', 'boa', 'Feita de boa-fé, sem fundamento', { sub: 'Sem penalidade' })}
      ${choice('jmot', 'dup', 'Duplicada', { sub: 'Sem penalidade' })}
      ${choice('jmot', 'desp', 'Desproporcional', { sub: '−5 pontos para quem reclamou' })}
      ${choice('jmot', 'falsa', 'Falsa ou de má-fé', { sub: '−15 pontos para quem reclamou' })}
      ${pen ? field(`Explique por que esta reclamação foi considerada ${mot === 'desp' ? 'desproporcional' : 'falsa'}.`, textarea('jneg'), { error: A.nErr }) : ''}
      ${btn('Negar reclamação', { v: pen ? 'danger' : 'primary', block: true, disabled: !mot, on: () => {
        if (pen && !(FORM.jneg || '').trim()) { A.nErr = 'A justificativa é obrigatória.'; negar(); return; }
        A.nErr = ''; closeLayer(); j.estado = pen ? 'Negada' : 'Encerrada'; rerender(); toast(pen ? 'Reclamação negada. Quem reclamou perdeu pontos.' : 'Reclamação encerrada sem penalidade.');
      } })}`;
  });
  return {
    tab: 'gestao', top: { title: 'Reclamação', back: 'sindico/julgar' },
    body: `<div class="stack">${card({ icon: 'message-square-warning', title: j.cat, sub: 'Aberta em ' + j.data + ' · gravidade ' + j.grav, badge: st(j.estado, decidida ? 'neutral' : undefined), body: esc(j.desc) })}
      <div class="row" style="align-items:stretch">${pessoa('Reclamante', j.reclamante)}${pessoa('Alvo', j.alvo)}</div>
      <h3 class="t-title-sm">Conversa com o alvo</h3>
      ${j.conversa ? `<div class="stack-2"><div class="msg me">Olá, ${j.alvo.nome.split(' ')[0]}. Recebemos uma reclamação sobre ${j.cat.toLowerCase()}. Pode nos contar o que aconteceu?</div>${j.resposta ? `<div class="msg">${esc(j.resposta)}</div>` : j.semResposta ? `<div class="t-body-sm muted row">${ic('clock')}Registro: alvo não respondeu em 5 dias.</div>` : `<div class="t-body-sm muted row">${ic('clock')}Aguardando resposta até ${j.liberaEm}.</div>`}</div>`
        : `<p class="t-body-sm muted" style="margin:0">Nenhuma conversa ainda.</p>${btn('Conversar com o alvo', { v: 'secondary', icon: 'message-circle', on: conversar })}`}
      ${j.conversa && !j.resposta && !j.semResposta ? `<div class="row wrap">${btn('Simular resposta do alvo', { v: 'text', size: 'sm', on: () => { j.resposta = 'Foi uma festa de aniversário, não vai se repetir.'; rerender(); } })}${btn('Simular 5 dias sem resposta', { v: 'text', size: 'sm', on: () => { j.semResposta = true; rerender(); } })}</div>` : ''}
      ${j.estado === 'Em recurso' ? banner('info', 'undo-2', 'O alvo recorreu. Como a decisão foi da subsíndica, o recurso é seu.', { inline: true }) : ''}
    </div>`,
    footer: decidida ? `<p class="t-body-sm muted center" style="margin:0">Decisão registrada. Prazo de recurso: 7 dias.</p>`
      : j.estado === 'Em recurso' ? `${btn('Aceitar recurso', { block: true, on: () => { j.estado = 'Recurso aceito'; rerender(); toast('Recurso aceito. Os pontos foram devolvidos.'); } })}${btn('Manter decisão', { v: 'secondary', block: true, on: () => { j.estado = 'Encerrada'; rerender(); toast('Decisão mantida. Reclamação encerrada.'); } })}`
      : `<div class="row">${btn('Negar', { v: 'secondary', block: true, disabled: !podeDecidir, on: () => { FORM.jmot = null; negar(); } })}${btn('Validar', { v: 'danger', block: true, disabled: !podeDecidir, on: () => { FORM.jgrav = j.grav; validar(); } })}</div>
         ${podeDecidir ? '' : `<p class="disabled-reason">${ic('lock')}Converse com o alvo antes de decidir. Liberado em ${j.liberaEm} se não houver resposta.</p>`}`,
  };
});

/* ---- Manutenção (8.3) ---- */
def('sindico', 'manutencao', 'Chamados de manutenção', 'Chamados (8.3)', () => {
  const list = S.chamados.filter(c => c.tipo === 'manutencao');
  return {
    tab: 'gestao', top: { title: 'Manutenção', back: 'sindico/gestao' }, flush: true,
    body: `<div class="list">${list.map(c => row({ icon: 'wrench', title: c.cat + ' · ' + c.local, sub: 'Aberto ' + c.aberto + (c.empresa ? ' · ' + c.empresa : ''), right: `<span class="stack-2" style="align-items:flex-end">${st(c.estado)}${c.fora && c.estado !== 'Concluído' ? badge('Fora do prazo', 'danger') : ''}</span>`, on: 'sindico/manutencao-detalhe/' + c.id })).join('')}</div>`,
    fab: { icon: 'plus', label: 'Abrir chamado', on: () => { resetForm({ ctipo: 'manutencao' }); go('sindico/chamado-novo'); } },
  };
});
def('sindico', 'manutencao-detalhe', 'Acompanhar manutenção', 'Chamados (8.3)', ctx => {
  const c = S.chamados.find(x => x.id === ctx.arg) || S.chamados[1];
  const steps = ['Aberto', 'Orçamento', 'Agendado', 'Concluído'];
  const idx = Math.max(0, steps.indexOf(c.estado));
  const nextS = steps[idx + 1];
  const escolherEmpresa = () => sheet(`<h2 class="t-title-md">Empresa responsável</h2>${S.empresas.map(e => row({ icon: 'building-2', title: e.nome, sub: e.serv + ' · ' + e.tel, right: c.empresa === e.nome ? ic('check') : '', noChev: true, on: () => { c.empresa = e.nome; c.fora = false; closeLayer(); rerender(); toast('Empresa definida: ' + e.nome); } })).join('')}
    ${btn('Cadastrar nova empresa', { v: 'secondary', icon: 'plus', block: true, on: () => sheet(`<h2 class="t-title-md">Nova empresa</h2>${field('Nome', input('enome'))}${field('Serviço', input('eserv', { ph: 'Ex.: Hidráulica' }))}${field('Telefone', input('etel', { inputmode: 'tel', ph: '(11) 90000-0000' }))}
      ${btn('Salvar empresa', { block: true, on: () => { if (!(FORM.enome || '').trim()) return; S.empresas.push({ nome: FORM.enome, serv: FORM.eserv || '', tel: FORM.etel || '' }); c.empresa = FORM.enome; closeLayer(); rerender(); toast('Empresa salva.'); } })}`) })}`);
  return {
    tab: 'gestao', top: { title: 'Chamado de manutenção', back: 'sindico/manutencao' },
    body: `<div class="stack">${card({ icon: 'wrench', title: c.cat, sub: c.local + ' · aberto ' + c.aberto + ' por ' + c.autor, badge: st(c.estado), body: esc(c.desc) })}
      ${c.fora && c.estado !== 'Concluído' ? banner('danger', 'circle-x', 'Sem atualização há mais de 48h. Defina a empresa ou avance o andamento.', { inline: true }) : ''}
      ${row({ icon: 'building-2', title: c.empresa || 'Nenhuma empresa definida', sub: 'Empresa responsável', on: escolherEmpresa })}
      ${c.agenda ? row({ icon: 'calendar-days', title: 'Visita agendada', sub: c.agenda }) : ''}
      <h3 class="t-title-sm">Andamento</h3>${timeline(steps.map((s, i) => ({ t: s, state: i < idx || (c.estado === 'Concluído' && i === idx) ? 'done' : i === idx ? 'now' : '' })))}</div>`,
    footer: nextS ? btn('Avançar para ' + nextS, { block: true, size: 'lg', on: () => {
      const doIt = () => { c.estado = nextS; c.fora = false; if (nextS === 'Agendado' && !c.agenda) c.agenda = '10/11 às 14h'; rerender(); toast(nextS === 'Concluído' ? 'Chamado concluído. Quem abriu foi avisado e pode reabrir em até 48h.' : 'Andamento atualizado: ' + nextS + '.'); };
      if (!c.empresa && nextS !== 'Orçamento') { escolherEmpresa(); return; }
      if (nextS === 'Agendado') sheet(`<h2 class="t-title-md">Agendar visita</h2>${field('Data', input('adata', { type: 'date', value: '2026-11-10' }))}${field('Horário', input('ahora', { type: 'time', value: '14:00' }))}${btn('Agendar', { block: true, on: () => { closeLayer(); c.agenda = (FORM.adata || '2026-11-10').split('-').reverse().slice(0, 2).join('/') + ' às ' + (FORM.ahora || '14:00').replace(':00', 'h'); doIt(); } })}`);
      else doIt();
    } }) : '',
  };
});
def('sindico', 'limpeza-painel', 'Painel da limpeza', 'Chamados (8.3)', () => ({
  tab: 'gestao', top: { title: 'Limpeza', back: 'sindico/gestao' }, flush: true,
  body: `<div class="list">${S.chamados.filter(c => c.tipo === 'limpeza').map(c => row({ icon: 'spray-can', title: c.cat + ' · ' + c.local, sub: c.estado === 'Concluído' ? 'Concluído ' + (c.concluido || '') : c.prazo, right: `<span class="stack-2" style="align-items:flex-end">${st(c.estado)}${c.fora && c.estado !== 'Concluído' ? badge('Fora do prazo', 'danger') : ''}</span>` })).join('')}</div>`,
}));

/* ---- Comunicados (10.1) ---- */
def('sindico', 'comunicado-novo', 'Novo comunicado', 'Comunicados (10.1)', () => {
  const tipo = FORM.ktipo || 'geral';
  return {
    tab: 'gestao', top: { title: 'Novo comunicado', back: 'sindico/comunicados' },
    body: `<div class="stack-5">
      <div class="field"><span class="field-label">Tipo</span><div class="stack-2">${choice('ktipo', 'geral', 'Geral', { def: 'geral', sub: 'Para um público inteiro' })}${choice('ktipo', 'individual', 'Individual', { def: 'geral', sub: 'Para uma pessoa; ela pode responder' })}</div></div>
      ${tipo === 'geral' ? `<div class="field"><span class="field-label">Público</span><div class="chips">${['Moradores', 'Funcionários', 'Todos'].map(x => chip(x, (FORM.kpub || 'Moradores') === x, () => { FORM.kpub = x; rerender(); })).join('')}</div></div>`
        : field('Destinatário', `<select class="select" data-bind="kdest">${S.moradores.map(m => `<option>${m.nome} · ${m.un}</option>`).join('')}</select>`)}
      ${field('Título', input('ktit', { ph: 'Ex.: Manutenção do elevador' }))}
      ${field('Mensagem', textarea('ktxt'), { error: A.kErr })}
      ${A.kErr ? `<div class="card t-body-sm">${esc(FORM.ktxt || '').replace(/(idiota|burro)/ig, '<span class="mark">$1</span>')}</div>` : ''}
    </div>`,
    footer: btn('Enviar comunicado', { block: true, size: 'lg', icon: 'send', on: () => {
      if (/idiota|burro/i.test(FORM.ktxt || '')) { A.kErr = 'Reescreva o trecho destacado antes de enviar.'; rerender(); return; }
      if (!(FORM.ktit || '').trim() || !(FORM.ktxt || '').trim()) { A.kErr = 'Preencha o título e a mensagem.'; rerender(); return; }
      A.kErr = '';
      S.comunicados.unshift({ id: 'k' + uid(), titulo: FORM.ktit, txt: FORM.ktxt, data: 'agora', publico: tipo === 'geral' ? (FORM.kpub || 'Moradores') : 'Individual', lidos: 0, total: 120, individual: tipo === 'individual', novo: false });
      go('sindico/comunicados'); setTimeout(() => toast('Comunicado enviado. Você verá as confirmações de leitura.'), 50);
    } }),
  };
});

/* ---- Reuniões (11.1, 11.2) ---- */
def('sindico', 'reunioes', 'Reuniões e eleições', 'Reuniões (11)', () => ({
  tab: 'gestao', top: { title: 'Reuniões', back: 'sindico/gestao' },
  body: `<div class="stack">${S.reunioes.map(g => card({ icon: g.eleicao ? 'vote' : 'calendar-days', title: g.titulo, sub: g.data, badge: st(g.estado), on: g.eleicao ? 'sindico/eleicao/' + g.id : 'sindico/reuniao-gestao/' + g.id })).join('')}
    ${btn('Abrir eleição', { v: 'secondary', icon: 'vote', on: () => toast('A eleição 2027–2028 já está aberta.') })}</div>`,
  fab: { icon: 'plus', label: 'Convocar', aria: 'Convocar reunião', on: () => { resetForm({ pautas: [{ q: '', tipo: 'votacao' }] }); go('sindico/convocar'); } },
}));
def('sindico', 'convocar', 'Convocar reunião', 'Reuniões (11)', () => {
  const pautas = FORM.pautas || [{ q: '', tipo: 'votacao' }];
  return {
    tab: 'gestao', top: { title: 'Convocar reunião', back: 'sindico/reunioes' },
    body: `<div class="stack-5">${field('Título', input('gtit', { ph: 'Ex.: Assembleia extraordinária' }))}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${field('Data', input('gdata', { type: 'date', value: FORM.gdata ?? '2026-11-28' }))}${field('Horário', input('ghora', { type: 'time', value: FORM.ghora ?? '19:00' }))}</div>
      ${field('Local', input('glocal', { value: FORM.glocal ?? 'Salão de festas' }))}
      <h3 class="t-title-sm">Pautas</h3>
      ${pautas.map((pt, i) => `<div class="card"><div class="row-between"><b>Pauta ${i + 1}</b>${pautas.length > 1 ? iconBtn('trash-2', 'Remover pauta', () => { pautas.splice(i, 1); rerender(); }) : ''}</div>
        <input class="input" placeholder="Pergunta ou assunto" value="${esc(pt.q)}" ${'data-pauta="' + i + '"'}>
        <div class="chips">${chip('Com votação', pt.tipo === 'votacao', () => { pt.tipo = 'votacao'; rerender(); })}${chip('Informativa', pt.tipo === 'informativa', () => { pt.tipo = 'informativa'; rerender(); })}</div>
        ${pt.tipo === 'votacao' ? `<div class="help">Opções: Aprovar, Reprovar e Abster-se · Quórum: maioria simples dos presentes</div>` : ''}</div>`).join('')}
      ${btn('Adicionar pauta', { v: 'secondary', icon: 'plus', on: () => { pautas.push({ q: '', tipo: 'votacao' }); FORM.pautas = pautas; rerender(); } })}</div>`,
    footer: btn('Convocar e abrir votação', { block: true, size: 'lg', on: () => {
      const g = { id: 'g' + uid(), titulo: FORM.gtit || 'Assembleia extraordinária', data: (FORM.gdata || '2026-11-28').split('-').reverse().slice(0, 2).join('/') + ' às ' + (FORM.ghora || '19:00').replace(':00', 'h'), local: FORM.glocal || 'Salão de festas', estado: 'Votação aberta',
        pautas: pautas.map((pt, i) => ({ id: 'p' + uid(), q: pt.q || 'Pauta ' + (i + 1), tipo: pt.tipo, opcoes: ['Aprovar', 'Reprovar', 'Abster-se'], quorum: 'Maioria simples dos presentes', voto: null, res: [0, 0, 0] })) };
      S.reunioes.unshift(g); go('sindico/reuniao-gestao/' + g.id); setTimeout(() => toast('Reunião convocada. Os moradores foram avisados.'), 50);
    } }),
    after: () => document.querySelectorAll('[data-pauta]').forEach(el => el.addEventListener('input', () => { pautas[+el.dataset.pauta].q = el.value; FORM.pautas = pautas; })),
  };
});
def('sindico', 'reuniao-gestao', 'Conduzir reunião', 'Reuniões (11)', ctx => {
  const g = S.reunioes.find(x => x.id === ctx.arg) || S.reunioes[0];
  const enc = g.estado === 'Encerrada';
  return {
    tab: 'gestao', top: { title: 'Reunião', back: 'sindico/reunioes' },
    body: `<div class="stack">${card({ icon: 'calendar-days', title: g.titulo, sub: g.data + ' · ' + g.local, badge: st(g.estado) })}
      ${g.pautas.filter(p => p.tipo !== 'informativa').map(pt => `<div class="card"><h3 class="t-title-sm">${pt.q}</h3><div class="t-body-sm muted">Quórum: ${pt.quorum}</div>
        ${enc || pt.encerrada ? `<div class="bars">${pt.opcoes.map((o, i) => `<div class="bar-row"><span>${o}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${(pt.res[i] / Math.max(1, pt.res.reduce((a, b) => a + b))) * 100}%"></span></span><b class="num">${pt.res[i]}</b></div>`).join('')}</div>${pt.res.reduce((a, b) => a + b) < 10 ? badge('Sem quórum', 'warning') : ''}`
          : `<div class="t-body-sm">Votos online até agora: <b class="num">${pt.res.reduce((a, b) => a + b)}</b> unidades. O resultado só aparece no encerramento.</div>`}</div>`).join('')}
      ${enc ? (g.ata ? row({ icon: 'file-text', title: 'Ata e lista de presença.pdf', sub: 'Anexada' }) : btn('Anexar ata e lista de presença', { v: 'secondary', icon: 'file-text', on: () => { g.ata = true; rerender(); toast('Ata anexada.'); } })) : ''}
    </div>`,
    footer: enc ? '' : `${btn('Registrar voto presencial', { v: 'secondary', block: true, icon: 'vote', on: () => sheet(`<h2 class="t-title-md">Voto presencial</h2>${field('Unidade', `<select class="select" data-bind="vpun"><option>Bloco A · Apto 101</option><option>Bloco C · Apto 201</option><option>Bloco A · Apto 204</option></select>`, { help: 'Bloco A · Apto 101 já votou pelo app no protótipo.' })}
        ${field('Pauta', `<select class="select" data-bind="vppt">${g.pautas.filter(p => p.tipo !== 'informativa').map((p, i) => `<option value="${i}">${esc(p.q)}</option>`).join('')}</select>`)}
        ${field('Opção', `<select class="select" data-bind="vpop"><option value="0">Aprovar</option><option value="1">Reprovar</option><option value="2">Abster-se</option></select>`)}
        ${btn('Registrar voto', { block: true, on: () => { if ((FORM.vpun || 'Bloco A · Apto 101') === 'Bloco A · Apto 101') { closeLayer(); dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Voto recusado', text: 'Esta unidade já votou pelo app.', actions: [{ label: 'Entendi' }] }); return; } const pt = g.pautas.filter(p => p.tipo !== 'informativa')[+(FORM.vppt || 0)]; pt.res[+(FORM.vpop || 0)]++; closeLayer(); rerender(); toast('Voto presencial registrado.'); } })}`) })}
      ${btn('Encerrar reunião', { block: true, size: 'lg', on: () => dialog({ title: 'Encerrar a reunião?', text: 'A votação fecha e o resultado é publicado para todos os moradores.', actions: [{ label: 'Encerrar e publicar', on: () => { g.estado = 'Encerrada'; rerender(); toast('Resultado publicado.'); } }, { label: 'Continuar reunião', v: 'secondary' }] }) })}`,
  };
});

/* ---- Solicitações (4.2) ---- */
def('sindico', 'solicitacoes', 'Solicitações de cadastro', 'Solicitações (4.2)', () => ({
  tab: 'gestao', top: { title: 'Solicitações', back: 'sindico/gestao' }, flush: true,
  body: `<div class="pad">${banner('info', 'inbox', `${S.franquia.usadas} de ${S.franquia.total} solicitações usadas este mês. As próximas custam R$ 15,00 cada.`, { inline: true })}</div>
    <div class="list">${S.solicitacoes.map(s => row({ icon: 'inbox', title: s.tipo, sub: s.det, sub2: s.data + (s.motivo ? ' · Motivo: ' + s.motivo : ''), right: st(s.estado) })).join('')}</div>`,
  fab: { icon: 'plus', label: 'Nova', aria: 'Nova solicitação', on: () => { resetForm({ stipo: 'Incluir morador' }); go('sindico/solicitacao-nova'); } },
}));
def('sindico', 'solicitacao-nova', 'Nova solicitação', 'Solicitações (4.2)', () => {
  const esg = S.franquia.usadas >= S.franquia.total;
  return {
    tab: 'gestao', top: { title: 'Nova solicitação', back: 'sindico/solicitacoes' },
    body: `<div class="stack-5"><div class="field"><span class="field-label">O que você precisa?</span><div class="stack-2">${['Incluir morador', 'Alterar dados', 'Remover morador', 'Incluir funcionário', 'Remover funcionário'].map(t => choice('stipo', t, t, { def: 'Incluir morador' })).join('')}</div></div>
      ${field('Nome', input('snome'), { error: A.sErr })}${field('Unidade ou setor', input('sun', { ph: 'Ex.: Bloco A · Apto 101' }))}${field('Detalhes (opcional)', textarea('sdet'))}
      ${banner(esg ? 'warning' : 'info', esg ? 'triangle-alert' : 'info', esg ? `Você já usou as ${S.franquia.total} solicitações do mês. Esta custará R$ 15 na próxima fatura.` : `Restam ${S.franquia.total - S.franquia.usadas} solicitações na franquia deste mês.`, { inline: true })}
      ${btn(esg ? 'Voltar a franquia (protótipo)' : 'Simular franquia esgotada', { v: 'text', on: () => { S.franquia.usadas = esg ? 7 : 10; rerender(); } })}</div>`,
    footer: btn('Enviar solicitação', { block: true, size: 'lg', on: () => {
      if (!(FORM.snome || '').trim()) { A.sErr = 'Informe o nome.'; rerender(); return; }
      A.sErr = '';
      const send = () => { S.solicitacoes.unshift({ id: 's' + uid(), tipo: FORM.stipo || 'Incluir morador', det: FORM.snome + (FORM.sun ? ' · ' + FORM.sun : ''), estado: 'Pendente', data: 'hoje' }); S.franquia.usadas++; go('sindico/solicitacoes'); setTimeout(() => toast('Solicitação enviada à administradora.'), 50); };
      if (esg) dialog({ title: 'Enviar solicitação extra?', text: 'Esta solicitação custará R$ 15,00 na próxima fatura do condomínio.', actions: [{ label: 'Enviar por R$ 15,00', on: send }, { label: 'Esperar o próximo mês', v: 'secondary' }] });
      else send();
    } }),
  };
});

/* ---- Inadimplência (13.2) ---- */
def('sindico', 'inadimplencia', 'Inadimplência', 'Cobrança (13.2)', () => ({
  tab: 'gestao', top: { title: 'Inadimplência', back: 'sindico/gestao' }, flush: true,
  body: `<div class="pad">${banner('info', 'lock', 'Só você e a administradora veem esta tela.', { inline: true })}</div>
    <div class="list">${S.inad.map(u => row({ icon: 'house', title: u.un, sub: `${u.resp} · ${u.cobr} ${u.cobr > 1 ? 'cobranças' : 'cobrança'}`, right: `<span class="stack-2" style="align-items:flex-end"><b class="num">${money(u.valor)}</b>${badge(u.dias + ' dias', 'danger')}</span>` })).join('')}</div>
    <div class="pad stack-2">${btn('Exportar CSV', { v: 'secondary', icon: 'download', block: true, on: () => toast('inadimplencia-novembro.csv baixado.') })}${btn('Solicitar cobrança extra', { v: 'text', block: true, on: () => sheet(`<h2 class="t-title-md">Solicitar cobrança extra</h2><p class="t-body-sm muted">A administradora lança a cobrança.</p>${field('Descrição', input('cxd', { ph: 'Ex.: Fundo de obras' }))}${field('Valor por unidade', input('cxv', { inputmode: 'decimal', ph: 'R$ 0,00' }))}${btn('Enviar solicitação', { block: true, on: () => { closeLayer(); toast('Solicitação de cobrança extra enviada.'); } })}`) })}</div>`,
}));

/* ---- Encomendas vencidas e substituição ---- */
def('sindico', 'encomendas-vencidas', 'Encomendas com prazo vencido', 'Gestão', () => ({
  tab: 'gestao', top: { title: 'Prazo vencido', back: 'sindico/gestao' }, flush: true,
  body: `<div class="list">${S.encomendas.filter(e => e.estado === 'Prazo vencido' || e.estado === 'Devolvida').map(e => row({ icon: 'package', title: e.rem + ' · ' + e.un, sub: 'Chegou em ' + e.data + ' · mais de 30 dias', right: st(e.estado) })).join('')}</div>
    <div class="pad">${S.encomendas.some(e => e.estado === 'Prazo vencido') ? btn('Marcar como devolvida', { v: 'secondary', block: true, on: () => { S.encomendas.forEach(e => { if (e.estado === 'Prazo vencido') e.estado = 'Devolvida'; }); rerender(); toast('Encomenda marcada como devolvida ao remetente.'); } }) : ''}</div>`,
}));
def('sindico', 'substituicao', 'Substituição pelo subsíndico', 'Gestão', () => ({
  tab: 'gestao', top: { title: 'Substituição', back: 'sindico/gestao' },
  body: `<div class="stack"><p class="t-body" style="margin:0">Em ausência temporária, a subsíndica Carla Mendes assume as funções de síndico até você desativar.</p>
    ${sw('Ativar substituição pela subsíndica', S.substituicao, () => { S.substituicao = !S.substituicao; rerender(); toast(S.substituicao ? 'Substituição ativa. Carla Mendes tem as funções de síndico.' : 'Substituição desativada. As funções voltaram para você.'); })}
    ${S.substituicao ? banner('info', 'info', 'Tudo o que a subsíndica fizer fica registrado.', { inline: true }) : ''}</div>`,
}));
