/* Morador (e telas compartilhadas com o síndico) — fluxos 5, 6, 7, 8, 9, 10, 11, 12, 13 e 14 */
'use strict';
const RES = ['morador', 'sindico', 'subsindico'];
const TONES = {
  'Esperado': 'info', 'Autorizado por interfone': 'success', 'Entrou': 'success', 'Saiu': 'neutral', 'Saída não registrada': 'warning', 'Cancelado': 'neutral', 'Não compareceu': 'neutral',
  'Recebida': 'info', 'Prazo vencido': 'warning', 'Retirada': 'success', 'Devolvida': 'neutral',
  'Aberto': 'info', 'Em atendimento': 'info', 'Orçamento': 'info', 'Agendado': 'info', 'Concluído': 'success', 'Reaberto': 'warning', 'Fora do prazo': 'danger',
  'Emitida': 'info', 'Em atraso': 'danger', 'Paga': 'success', 'Paga com atraso': 'success', 'Em acordo': 'warning', 'Cancelada': 'neutral',
  'Aguardando pagamento': 'warning', 'Confirmada': 'success', 'Expirada': 'neutral', 'Cancelada com reembolso': 'neutral', 'Cancelada sem reembolso': 'neutral', 'Cancelada pelo condomínio': 'info', 'Realizada': 'neutral', 'Não comparecimento': 'warning',
  'Aberta': 'info', 'Em conversa com o alvo': 'info', 'Pendente': 'warning', 'Em recurso': 'info', 'Recurso aceito': 'success', 'Encerrada': 'neutral',
  'Votação aberta': 'info', 'Candidaturas abertas': 'info', 'Concluída': 'success', 'Recusada': 'neutral', 'Atendida': 'success',
};
const st = (s, toneOverride) => badge(s, toneOverride || TONES[s] || 'neutral');
const areaOf = id => S.areas.find(a => a.id === id) || S.areas[0];
const isRF = () => true; // Ana é a responsável financeira da unidade ativa
// Na unidade alugada, o inquilino só recebe as cobranças ordinárias; as extraordinárias vão ao proprietário (RN-FI-03)
const cobrancaAtual = () => S.cobrancas.filter(c => !(S.inquilino && c.tipo === 'Extraordinária')).map(c => (S.atraso && c.id === 'b1') ? Object.assign({}, c, { estado: 'Em atraso', venc: '10/10', valor: 632.4 }) : c);
const cobList = p => p === 'proprietario' ? S.cobrancasProp : cobrancaAtual();
const isInq = p => p === 'morador' && S.inquilino;

/* ---------------- Início (11.3) ---------------- */
def(RES, 'inicio', 'Início', 'Início', ctx => {
  const p = ctx.p;
  const cob = cobrancaAtual().find(c => ['Emitida', 'Em atraso'].includes(c.estado));
  const enc = S.encomendas.filter(e => e.un === S.units[S.unit].name && e.estado === 'Recebida');
  const prox = S.reservas.filter(r => ['Confirmada', 'Aguardando pagamento'].includes(r.estado));
  const julgar = GES.includes(p) ? julgaveis().filter(j => !['Validada', 'Negada', 'Encerrada'].includes(j.estado)) : [];
  const quick = [['users', 'Cadastrar visitante', p + '/visitante-novo'], ['calendar-days', 'Reservar', p + '/reservas'], ['wrench', 'Abrir chamado', p + '/chamado-novo']];
  return {
    tab: 'inicio', top: { unit: true, actions: [{ icon: 'bell', label: 'Notificações', on: p + '/notificacoes', dot: true }] },
    body: `<div class="stack">
      <h1 class="t-title-lg">Olá, ${p === 'sindico' ? 'Pedro' : p === 'subsindico' ? 'Carla' : 'Ana'}</h1>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${quick.map(([i, l, r]) => `<button type="button" class="card tap" style="align-items:center;text-align:center;padding:14px 8px;gap:8px" ${goAttr(r)}><span class="card-icon">${ic(i)}</span><span class="t-label-sm">${l}</span></button>`).join('')}</div>
      <h2 class="t-title-sm section-title" style="margin-bottom:0">Para você</h2>
      ${cob ? card({ icon: 'receipt', title: cob.estado === 'Em atraso' ? 'Cobrança em atraso' : 'Cobrança em aberto', sub: `${cob.ref} · vence em ${cob.venc}`, badge: st(cob.estado), body: `<span class="t-title-sm num">${money(cob.valor)}</span>`, on: p + '/cobranca/' + cob.id }) : ''}
      ${isInq(p) ? card({ icon: 'file-text', title: 'Contrato de locação', sub: `Seu contrato vai até ${S.contratoFim}. Fale com o proprietário sobre a renovação.`, badge: badge(`Contrato vence em ${S.contratoDias} dias`, 'warning') }) : ''}
      ${p === 'subsindico' && S.substituicao ? card({ icon: 'user-round-cog', title: 'Substituição ativa', sub: 'Você tem as funções de síndico até a desativação.', badge: badge('Ativa', 'info'), on: p + '/gestao' }) : ''}
      ${julgar.length ? card({ icon: 'scale', title: 'Para julgar', sub: p === 'subsindico' && !S.substituicao ? `${julgar.length} ${julgar.length > 1 ? 'reclamações' : 'reclamação'} contra o síndico aguardando você` : `${julgar.length} reclamações aguardando você`, badge: badge(String(julgar.length), 'warning'), on: p + '/julgar' }) : ''}
      ${enc.length ? card({ icon: 'package', title: 'Encomendas na portaria', sub: enc.map(e => e.rem).join(' e ') + ' aguardando retirada', badge: st('Recebida'), on: p + '/encomendas' }) : ''}
      ${card({ icon: 'vote', title: 'Votação aberta', sub: 'Assembleia geral ordinária · até 20/11 às 21h', badge: st('Votação aberta'), on: p + '/reuniao/g1' })}
      ${!S.pesquisa.respondida ? card({ icon: 'star', title: 'Pesquisa do mês', sub: `Avalie a equipe do condomínio até ${S.pesquisa.fecha}.`, badge: badge('Novo', 'accent'), on: p + '/pesquisa' }) : ''}
      ${prox.map(r => card({ icon: 'calendar-days', title: areaOf(r.area).nome, sub: `${r.dia} · ${r.hora}`, badge: st(r.estado), on: p + '/reserva/' + r.id })).join('')}
      <h2 class="t-title-sm section-title" style="margin-bottom:0">Últimos comunicados</h2>
      <div class="list list-full">${S.comunicados.filter(c => !c.individual).slice(0, 2).map(c => row({ icon: 'megaphone', title: c.titulo, sub: c.data, on: p + '/comunicado/' + c.id })).join('')}</div>
    </div>`,
  };
});

def([...RES, 'proprietario'], 'notificacoes', 'Notificações', 'Início', ctx => ({
  tab: ctx.p === 'proprietario' ? 'unidade' : undefined, top: { title: 'Notificações', back: ctx.p + '/' + (ctx.p === 'proprietario' ? 'unidade' : 'inicio') },
  flush: true,
  body: `<div class="list">${[
    ['package', 'Encomenda na portaria', 'Chegou um pacote da Amazon para Bloco A · Apto 101. Retire quando puder.', 'há 2 horas', 'encomendas'],
    ['log-in', 'Visitante entrou', 'Fernando Lopes entrou às 9h05.', 'hoje', 'visitantes'],
    ['message-square-warning', 'Decisão de reclamação', 'Uma reclamação contra você foi validada. Você pode recorrer até 08/11.', 'ontem', 'reclamacao/m3'],
    ['receipt', 'Cobrança vencendo', 'Você tem uma cobrança vencendo em 5 dias.', '05/11', 'cobranca/b1'],
    ['megaphone', 'Novo comunicado', 'Manutenção da piscina', 'hoje', 'comunicado/k1'],
    ['calendar-days', 'Reserva confirmada', 'Churrasqueira, 15/11 das 12h às 16h.', '03/11', 'reserva/r1'],
  ].filter(() => ctx.p !== 'proprietario').concat(ctx.p !== 'proprietario' ? [] : [
    ['message-square-warning', 'Ocorrência na unidade', 'Uma reclamação contra o Bloco B · Apto 302 foi validada: barulho.', '12/10', 'unidade'],
    ['receipt', 'Cobrança vencendo', 'Você tem uma cobrança vencendo em 5 dias.', '05/11', 'cobranca/h1'],
    ['vote', 'Assembleia convocada', 'Assembleia geral ordinária em 20/11 às 19h.', 'há 3 dias', 'reuniao/g1'],
    ['file-text', 'Contrato de locação', 'O contrato de Marina Souza vai até 31/01/2027.', '01/11', 'unidade'],
  ]).map(([i, t, s, d, r]) => row({ icon: i, title: t, sub: s, sub2: d, on: ctx.p + '/' + r })).join('')}</div>`,
}));

/* ---------------- Reservas (5.1, 5.2, 11.4) ---------------- */
def(RES, 'reservas', 'Áreas para reservar', 'Reservas (5.1)', ctx => ({
  tab: 'reservas', top: { title: 'Reservas', actions: [{ icon: 'list', label: 'Minhas reservas', on: ctx.p + '/minhas-reservas' }] },
  body: `<div class="stack">
    ${btn('Minhas reservas', { v: 'secondary', icon: 'calendar-check', on: ctx.p + '/minhas-reservas' })}
    ${S.areas.map(a => `<div class="card tap" role="button" tabindex="0" ${cb(() => { resetForm({ area: a.id, dia: null, slot: null }); go(ctx.p + '/area/' + a.id); })} style="padding:0;overflow:hidden">
      <div style="height:96px;background:linear-gradient(135deg,var(--blue-700),var(--blue-300));display:flex;align-items:center;justify-content:center;color:#fff">${ic(a.ico)}</div>
      <div style="padding:16px" class="row-between"><div><h3 class="t-title-sm">${a.nome}</h3><div class="t-body-sm muted">${a.cap}</div></div>${a.paga ? badge('Paga · ' + money(a.valor), 'info') : badge('Gratuita', 'neutral')}</div></div>`).join('')}
  </div>`,
}));

function slotsFor(area, day, month) {
  const base = { salao: ['12h às 17h', '18h às 23h'], churrasqueira: ['10h às 14h', '15h às 19h'], quadra: ['8h às 9h', '9h às 10h', '10h às 11h', '17h às 18h'], gourmet: ['12h às 16h', '19h às 23h'] }[area.id];
  return base.map((h, i) => {
    let state = 'free', why = '';
    if (!area.paga && S.score <= 60) { state = 'score'; }
    else if (S.atraso && S.cobrancaCfg.bloqueioReserva) { state = 'unavail'; why = 'Novas reservas estão bloqueadas enquanto houver cobrança em atraso.'; }
    else if (month === 0 && day < 6) { state = 'unavail'; why = 'Reservas desta área: de 24h a 60 dias antes.'; }
    else if (area.id === 'quadra' && month === 0) { state = 'unavail'; why = 'Sua unidade já usou as 2 reservas deste mês nesta área.'; }
    else if ((day * 7 + i * 3 + area.id.length) % 5 === 0) state = 'busy';
    return { h, state, why };
  });
}
function slotHtml(s, selected, onSel) {
  if (s.state === 'free') return `<button type="button" class="slot free ${selected ? 'is-sel' : ''}" ${cb(onSel)} aria-pressed="${selected}"><span class="t-label">${s.h}</span><span class="s-state">${selected ? ic('check') : ''}Livre</span></button>`;
  if (s.state === 'busy') return `<button type="button" class="slot busy" disabled aria-label="${s.h}, ocupado"><span class="t-label">${s.h}</span><span class="s-state">Ocupado</span></button>`;
  if (s.state === 'score') return `<button type="button" class="slot unavail" ${cb(() => toast('Seu score está abaixo do limite para áreas gratuitas. Veja o aviso no topo.'))}><span class="t-label">${s.h}</span><span class="s-state">${ic('lock')}Indisponível</span></button>`;
  return `<button type="button" class="slot unavail" ${cb(() => toast(s.why))}><span class="t-label">${s.h}</span><span class="s-state">${ic('calendar-x')}Indisponível</span></button>`;
}

def(RES, 'area', 'Calendário da área', 'Reservas (5.1)', ctx => {
  const a = areaOf(ctx.arg), p = ctx.p;
  const month = FORM.mes || 0; // 0 = nov/2026, 1 = dez/2026
  const first = month === 0 ? 0 : 2; // nov/2026 começa no domingo; dez/2026 na terça
  const days = month === 0 ? 30 : 31;
  const dia = FORM.dia;
  let cells = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => `<span class="dow" aria-label="${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i]}">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const past = (month === 0 && d < 5) || (isInq(p) && month === 1 && d > 5); // inquilino: nada depois do fim do contrato (RN-CD-22)
    const hasFree = !past && slotsFor(a, d, month).some(s => s.state === 'free');
    cells += `<button type="button" class="day ${hasFree ? 'free' : ''} ${month === 0 && d === 5 ? 'today' : ''} ${dia === d ? 'sel' : ''}" ${past ? 'disabled' : cb(() => { FORM.dia = d; FORM.slot = null; rerender(); })} aria-label="${d} de ${month === 0 ? 'novembro' : 'dezembro'}${hasFree ? ', com horário livre' : ''}">${d}</button>`;
  }
  const slots = dia ? slotsFor(a, dia, month) : [];
  const scoreBlocked = !a.paga && S.score <= 60;
  return {
    tab: 'reservas', top: { title: a.nome, back: p + '/reservas' },
    banner: scoreBlocked ? banner('warning', 'lock', `Seu score está em ${S.score}. Reservas gratuitas voltam quando ele passar de 60. Áreas pagas continuam liberadas.`, { action: btn('Ver score', { v: 'secondary', size: 'sm', on: p + '/score' }) }) : isInq(p) ? banner('info', 'file-text', `Seu contrato vai até ${S.contratoFim}. Datas depois disso ficam indisponíveis.`) : undefined,
    body: `<div class="stack">
      <div class="row-between"><button type="button" class="icon-btn" aria-label="Mês anterior" ${month === 0 ? 'disabled style="opacity:.3"' : cb(() => { FORM.mes = 0; FORM.dia = null; rerender(); })}>${ic('chevron-left')}</button>
        <h2 class="t-title-sm">${month === 0 ? 'Novembro de 2026' : 'Dezembro de 2026'}</h2>
        <button type="button" class="icon-btn" aria-label="Próximo mês" ${month === 1 ? 'disabled style="opacity:.3"' : cb(() => { FORM.mes = 1; FORM.dia = null; rerender(); })}>${ic('chevron-right')}</button></div>
      <div class="cal">${cells}</div>
      <div class="row wrap t-caption muted" style="gap:12px"><span class="row" style="gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--success-fg)"></span>Dia com horário livre</span><span>Hoje com contorno</span></div>
      ${dia ? `<h3 class="t-title-sm">Horários de ${dia}/${month === 0 ? '11' : '12'}</h3><div class="stack-2">${slots.map(s => slotHtml(s, FORM.slot === s.h, () => { FORM.slot = s.h; rerender(); })).join('')}</div>`
            : `<p class="t-body-sm muted center">Escolha um dia para ver os horários.</p>`}
    </div>`,
    footer: btn(a.paga ? 'Continuar' : 'Continuar', { block: true, size: 'lg', disabled: !FORM.slot, on: () => go(p + '/reserva-resumo/' + a.id) }) + (!FORM.slot ? `<p class="disabled-reason">${ic('info')}Escolha um dia e um horário livre.</p>` : ''),
  };
});

def(RES, 'reserva-resumo', 'Resumo da reserva', 'Reservas (5.1)', ctx => {
  const a = areaOf(ctx.arg), p = ctx.p, mm = (FORM.mes || 0) === 0 ? '11' : '12';
  const dia = FORM.dia || 14, slot = FORM.slot || '15h às 19h';
  return {
    tab: 'reservas', top: { title: 'Confirmar reserva', back: p + '/area/' + a.id },
    body: `<div class="stack">
      ${card({ icon: a.ico, title: a.nome, sub: `${dia}/${mm} · ${slot}`, badge: a.paga ? badge('Paga · ' + money(a.valor), 'info') : badge('Gratuita', 'neutral') })}
      ${banner('info', 'info', a.paga ? 'Cancelamento com reembolso até 12h antes do início. Depois disso, o valor não é devolvido.' : 'Você pode cancelar até o início da reserva. Faltar sem cancelar conta para o seu score.', { inline: true })}
      ${a.paga ? `<div class="card"><div class="row-between"><span>Valor da reserva</span><b class="num">${money(a.valor)}</b></div><p class="help" style="margin:0">O horário fica guardado por 24h ou até o início da reserva, o que vier antes, enquanto o pagamento não é confirmado.</p></div>` : ''}
      ${row({ icon: 'circle-help', title: 'Regras da área', sub: 'Capacidade, horários e limpeza', on: () => sheet(`<h2 class="t-title-md">Regras · ${a.nome}</h2><ul class="t-body"><li>${a.cap}.</li><li>Reservas de 24h a 60 dias antes.</li><li>Até 2 reservas por unidade, por mês, nesta área.</li><li>Depois do uso, a portaria ou a limpeza faz a vistoria.</li></ul>`) })}
    </div>`,
    footer: btn(a.paga ? 'Reservar e pagar' : 'Reservar', { block: true, size: 'lg', icon: 'calendar-check', on: (e, el) => {
      el.classList.add('is-loading');
      setTimeout(() => {
        if (a.id === 'churrasqueira' && dia === 14) {
          dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Este horário acabou de ser reservado', text: 'Outra unidade confirmou este horário segundos antes. Próximos horários livres: 15/11 das 15h às 19h e 21/11 das 10h às 14h.', actions: [{ label: 'Escolher outro horário', on: () => { FORM.slot = null; go(p + '/area/' + a.id); } }] });
          el.classList.remove('is-loading'); return;
        }
        const r = { id: 'r' + uid(), area: a.id, dia: `${dia}/${mm}`, hora: slot, estado: a.paga ? 'Aguardando pagamento' : 'Confirmada', valor: a.valor, prazo: '14h30 de amanhã' };
        S.reservas.unshift(r);
        go(a.paga ? p + '/reserva-pagamento/' + r.id : p + '/reserva-ok/' + r.id);
      }, 700);
    } }) + (a.id === 'churrasqueira' ? `<p class="help center" style="margin:0">Dica do protótipo: o dia 14 simula outro morador reservando antes.</p>` : ''),
  };
});

def(RES, 'reserva-pagamento', 'Forma de pagamento', 'Reservas (5.1)', ctx => {
  const r = S.reservas.find(x => x.id === ctx.arg) || S.reservas[1], p = ctx.p;
  return {
    tab: 'reservas', top: { title: 'Pagamento', back: p + '/reserva/' + r.id },
    body: `<div class="stack">
      ${card({ icon: areaOf(r.area).ico, title: areaOf(r.area).nome, sub: `${r.dia} · ${r.hora}`, badge: st(r.estado) })}
      <p class="t-body-sm c-warning row" style="margin:0">${ic('clock')}Pague até ${r.prazo || '14h30 de amanhã'} ou o horário é liberado.</p>
      <h2 class="t-title-sm">Como você quer pagar?</h2>
      ${choice('forma', 'pix', '<b>Pix</b>', { def: 'pix', icon: 'qr-code', sub: 'Confirmação em segundos' })}
      ${choice('forma', 'cartao', '<b>Cartão de crédito</b>', { def: 'pix', icon: 'credit-card', sub: 'Visa, Mastercard e Elo' })}
      <div class="row-between card"><span>Total</span><b class="t-title-sm num">${money(r.valor)}</b></div>
    </div>`,
    footer: btn((FORM.forma || 'pix') === 'pix' ? 'Pagar com Pix' : 'Pagar com cartão', { block: true, size: 'lg', on: () => go(p + ((FORM.forma || 'pix') === 'pix' ? '/pix/' : '/cartao/') + 'reserva-' + r.id) }),
  };
});

/* Pix e cartão servem para reservas e cobranças: arg = 'reserva-<id>' ou 'cobranca-<id>' */
function payTarget(arg) {
  const [kind, id] = arg.split(/-(.+)/);
  if (kind === 'reserva') { const r = S.reservas.find(x => x.id === id) || S.reservas[1]; return { kind, obj: r, valor: r.valor, titulo: areaOf(r.area).nome + ' · ' + r.dia, back: 'reserva-pagamento/' + r.id }; }
  const c = cobrancaAtual().concat(S.cobrancasProp).find(x => x.id === id) || S.cobrancas[0]; return { kind, obj: c, valor: c.valor, titulo: c.ref, back: 'cobranca/' + c.id };
}
function payApproved(p, t) {
  if (t.kind === 'reserva') { t.obj.estado = 'Confirmada'; go(p + '/reserva-ok/' + t.obj.id); }
  else { const c = S.cobrancas.concat(S.cobrancasProp).find(x => x.id === t.obj.id); c.estado = S.atraso && c.id === 'b1' ? 'Paga com atraso' : 'Paga'; c.pago = 'hoje'; if (c.id === 'b1') S.atraso = false; go(p + '/cobranca-paga/' + c.id); }
}
def([...RES, 'proprietario'], 'pix', 'Pagar com Pix', 'Pagamentos', ctx => {
  const t = payTarget(ctx.arg || 'reserva-r2'), p = ctx.p;
  return {
    noTabs: ctx.p === 'proprietario', tab: t.kind === 'reserva' ? 'reservas' : 'menu', top: { title: 'Pagar com Pix', back: p + '/' + t.back },
    body: `<div class="stack center">
      <div class="t-body muted">${esc(t.titulo)}</div><div class="t-title-lg num">${money(t.valor)}</div>
      <div class="qr" role="img" aria-label="QR Code do Pix"></div>
      <p class="t-body-sm c-warning row" style="justify-content:center;margin:0">${ic('clock')}${t.kind === 'reserva' ? 'Pague até 14h30 de amanhã ou o horário é liberado.' : 'O código vale até 23h59 de hoje.'}</p>
      ${btn('Copiar código Pix', { v: 'secondary', icon: 'copy', block: true, on: () => { try { navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136condomifacil-exemplo'); } catch (e) {} toast('Código Pix copiado.'); } })}
      <p class="help" style="margin:0">Abra o app do seu banco, escolha Pix copia e cola e cole o código. A confirmação chega aqui sozinha.</p>
    </div>`,
    footer: btn('Simular pagamento confirmado', { block: true, size: 'lg', icon: 'circle-check', on: (e, el) => { el.classList.add('is-loading'); setTimeout(() => payApproved(p, t), 800); } }) + btn('Simular pagamento indisponível', { v: 'text', block: true, on: () => dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Pagamento indisponível agora', text: t.kind === 'reserva' ? 'O pagamento está indisponível agora. Seu horário fica guardado até 14h30 de amanhã.' : (S.atraso ? 'Pagamento indisponível agora. Quando você pagar, o valor será atualizado com multa e juros até o dia do pagamento.' : 'Pagamento indisponível agora. Tente de novo mais tarde; o vencimento continua em 10/11.'), actions: [{ label: 'Entendi' }] }) }),
  };
});
def([...RES, 'proprietario'], 'cartao', 'Pagar com cartão', 'Pagamentos', ctx => {
  const t = payTarget(ctx.arg || 'reserva-r2'), p = ctx.p;
  return {
    noTabs: ctx.p === 'proprietario', tab: t.kind === 'reserva' ? 'reservas' : 'menu', top: { title: 'Pagar com cartão', back: p + '/' + t.back },
    body: `<div class="stack-5">
      ${A.cardErr ? banner('danger', 'circle-x', t.kind === 'reserva' ? 'O pagamento não foi aprovado. Seu horário fica guardado até 14h30 de amanhã.' : 'O cartão não foi aprovado. Tente outro cartão, Pix ou boleto.', { inline: true }) : ''}
      ${field('Número do cartão', input('cc', { inputmode: 'numeric', ph: '0000 0000 0000 0000', attr: 'autocomplete="cc-number"' }), { help: 'Dica do protótipo: final 0000 simula recusa.' })}
      ${field('Nome impresso no cartão', input('ccname', { value: FORM.ccname ?? 'ANA LIMA', attr: 'autocomplete="cc-name"' }))}
      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${field('Validade', input('ccexp', { ph: 'MM/AA', inputmode: 'numeric' }))}${field('CVV', input('cvv', { ph: '123', inputmode: 'numeric' }))}</div>
      <div class="row-between card"><span>Total</span><b class="t-title-sm num">${money(t.valor)}</b></div>
    </div>`,
    footer: btn('Pagar ' + money(t.valor), { block: true, size: 'lg', icon: 'credit-card', on: (e, el) => {
      el.classList.add('is-loading');
      setTimeout(() => { if ((FORM.cc || '').replace(/\s/g, '').endsWith('0000')) { A.cardErr = true; rerender(); } else { A.cardErr = false; payApproved(p, t); } }, 900);
    } }),
  };
});

def(RES, 'reserva-ok', 'Reserva confirmada', 'Reservas (5.1)', ctx => {
  const r = S.reservas.find(x => x.id === ctx.arg) || S.reservas[0], p = ctx.p;
  return {
    tab: 'reservas', top: { title: 'Reserva', back: p + '/reservas' },
    body: `<div class="empty" style="color:var(--text-primary)"><span class="onb-ico" style="background:var(--success-container);color:var(--success-fg)">${ic('circle-check')}</span>
      <h2 class="t-title-md">Reserva confirmada</h2><p class="t-body muted" style="margin:0">${areaOf(r.area).nome} · ${r.dia} · ${r.hora}</p>${st('Confirmada')}
      ${r.valor ? `<p class="help">O comprovante foi enviado para o seu e-mail.</p>` : ''}</div>`,
    footer: `${btn('Ver minhas reservas', { block: true, on: p + '/minhas-reservas' })}${btn('Voltar ao início', { v: 'text', block: true, on: p + '/inicio' })}`,
  };
});

def(RES, 'minhas-reservas', 'Minhas reservas', 'Reservas (5.2)', ctx => {
  const f = FORM.fres || 'proximas';
  const list = S.reservas.filter(r => f === 'proximas' ? ['Confirmada', 'Aguardando pagamento'].includes(r.estado) : !['Confirmada', 'Aguardando pagamento'].includes(r.estado));
  return {
    tab: 'reservas', top: { title: 'Minhas reservas', back: ctx.p + '/reservas' }, flush: true,
    body: `<div class="pad chips">${chip('Próximas', f === 'proximas', () => { FORM.fres = 'proximas'; rerender(); })}${chip('Histórico', f === 'hist', () => { FORM.fres = 'hist'; rerender(); })}</div>
      <div class="list">${list.length ? list.map(r => row({ icon: areaOf(r.area).ico, title: areaOf(r.area).nome, sub: `${r.dia} · ${r.hora}`, right: st(r.estado), on: ctx.p + '/reserva/' + r.id })).join('') : empty('calendar-days', 'Nenhuma reserva aqui.', btn('Reservar', { v: 'secondary', on: ctx.p + '/reservas' }))}</div>`,
    fab: { icon: 'plus', label: 'Nova reserva', aria: 'Fazer nova reserva', on: ctx.p + '/reservas' },
  };
});

def(RES, 'reserva', 'Detalhe da reserva', 'Reservas (5.2)', ctx => {
  const r = S.reservas.find(x => x.id === ctx.arg) || S.reservas[0], a = areaOf(r.area), p = ctx.p;
  const ativa = ['Confirmada', 'Aguardando pagamento'].includes(r.estado);
  const cancelar = () => {
    const end = estado => { r.estado = estado; rerender(); toast('Reserva cancelada.'); };
    if (!a.paga || r.estado === 'Aguardando pagamento') return dialog({ title: 'Cancelar a reserva?', text: `${a.nome}, ${r.dia} · ${r.hora}. O horário fica livre para outros moradores.`, actions: [{ label: 'Cancelar reserva', v: 'danger', on: () => end('Cancelada') }, { label: 'Manter reserva', v: 'secondary' }] });
    dialog({ title: 'Quanto tempo falta para a reserva?', text: 'O protótipo simula as duas situações.', actions: [
      { label: 'Mais de 12h (com reembolso)', v: 'secondary', on: () => dialog({ title: 'Cancelar com reembolso?', text: `Você recebe ${money(r.valor)} de volta: Pix em até 2 dias úteis ou estorno no cartão.`, actions: [{ label: 'Cancelar com reembolso', v: 'danger', on: () => end('Cancelada com reembolso') }, { label: 'Manter reserva', v: 'secondary' }] }) },
      { label: '12h ou menos (sem reembolso)', v: 'secondary', on: () => dialog({ tone: 'danger', icon: 'triangle-alert', title: 'Cancelar a reserva sem reembolso?', text: 'Faltam menos de 12h. Se cancelar, o valor não será devolvido.', actions: [{ label: 'Cancelar sem reembolso', v: 'danger', on: () => end('Cancelada sem reembolso') }, { label: 'Manter reserva', v: 'secondary' }] }) },
    ] });
  };
  return {
    tab: 'reservas', top: { title: 'Reserva', back: p + '/minhas-reservas' },
    body: `<div class="stack">
      ${card({ icon: a.ico, title: a.nome, sub: `${r.dia} · ${r.hora}`, badge: st(r.estado) })}
      ${r.valor ? `<div class="card"><div class="row-between"><span>Valor</span><b class="num">${money(r.valor)}</b></div>${r.estado === 'Aguardando pagamento' ? `<p class="t-body-sm c-warning row" style="margin:0">${ic('clock')}Pague até ${r.prazo} ou o horário é liberado.</p>` : ''}</div>` : ''}
      ${r.estado === 'Confirmada' && a.paga ? banner('info', 'info', 'Cancelamento com reembolso até 12h antes do início.', { inline: true }) : ''}
      ${r.estado === 'Cancelada pelo condomínio' ? banner('info', 'info', 'O condomínio cancelou esta reserva por manutenção. O valor foi devolvido integralmente.', { inline: true }) : ''}
      ${r.estado.startsWith('Cancelada com') ? row({ icon: 'file-check', title: 'Comprovante do reembolso', on: () => toast('Comprovante baixado.') }) : ''}
    </div>`,
    footer: ativa ? `${r.estado === 'Aguardando pagamento' ? btn('Pagar agora', { block: true, size: 'lg', on: p + '/reserva-pagamento/' + r.id }) : ''}${btn('Cancelar reserva', { v: 'secondary', block: true, on: cancelar })}` : '',
  };
});

/* ---------------- Visitantes (6.1) ---------------- */
def(RES, 'visitantes', 'Meus visitantes', 'Visitantes (6.1)', ctx => {
  const f = FORM.fvis || 'ativos';
  const list = S.visitantes.filter(v => f === 'ativos' ? v.estado === 'Esperado' || v.estado === 'Entrou' : !(v.estado === 'Esperado' || v.estado === 'Entrou'));
  return {
    tab: 'visitantes', top: { title: 'Visitantes' }, flush: true,
    body: `<div class="pad chips">${chip('Esperados', f === 'ativos', () => { FORM.fvis = 'ativos'; rerender(); })}${chip('Histórico', f === 'hist', () => { FORM.fvis = 'hist'; rerender(); })}</div>
      <div class="list">${list.length ? list.map(v => row({ avatar: v.nome, title: v.nome, sub: v.tipo === 'recorrente' ? 'Recorrente · ' + v.quando : v.quando, right: st(v.estado), on: ctx.p + '/visitante/' + v.id })).join('') : empty('users', 'Nenhum visitante esperado hoje.', btn('Cadastrar visitante', { v: 'secondary', on: ctx.p + '/visitante-novo' }))}</div>`,
    fab: { icon: 'plus', label: 'Novo', aria: 'Cadastrar novo visitante', on: () => { resetForm({ vtipo: 'avulso', dias: [] }); go(ctx.p + '/visitante-novo'); } },
  };
});
def(RES, 'visitante-novo', 'Cadastrar visitante', 'Visitantes (6.1)', ctx => {
  const tipo = FORM.vtipo || 'avulso', dias = FORM.dias || [];
  const D = [['Seg', 'Segunda'], ['Ter', 'Terça'], ['Qua', 'Quarta'], ['Qui', 'Quinta'], ['Sex', 'Sexta'], ['Sáb', 'Sábado'], ['Dom', 'Domingo']];
  return {
    tab: 'visitantes', top: { title: 'Novo visitante', back: ctx.p + '/visitantes' },
    body: `<div class="stack-5">
      ${field('Nome do visitante', input('vnome', { ph: '', attr: 'autocomplete="off"' }), { error: A.vErr })}
      ${field('Documento (opcional)', input('vdoc', { ph: 'RG ou CPF' }), { help: 'Só a portaria e você veem o documento.' })}
      <div class="field"><span class="field-label">Tipo de visita</span><div class="stack-2">${choice('vtipo', 'avulso', 'Avulsa · um dia', { def: 'avulso' })}${choice('vtipo', 'recorrente', 'Recorrente · diarista, cuidador, professor', { def: 'avulso' })}</div></div>
      ${tipo === 'avulso' ? field('Data da visita', input('vdata', { type: 'date', value: FORM.vdata ?? '2026-11-05', attr: 'min="2026-11-05"' }), { help: 'Hoje por padrão. Datas passadas ficam desabilitadas.' })
        : `<div class="field"><span class="field-label">Dias da semana</span><div class="chips">${D.map(([s, l]) => `<button type="button" class="chip ${dias.includes(s) ? 'is-on' : ''}" aria-label="${l}" aria-pressed="${dias.includes(s)}" ${cb(() => { const i = dias.indexOf(s); i >= 0 ? dias.splice(i, 1) : dias.push(s); FORM.dias = dias; rerender(); })}>${dias.includes(s) ? ic('check') : ''}${s}</button>`).join('')}</div></div>
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${field('Das (opcional)', input('vini', { type: 'time', value: FORM.vini ?? '08:00' }))}${field('Até (opcional)', input('vfim', { type: 'time', value: FORM.vfim ?? '12:00' }))}</div>
           ${field('Data de término (opcional)', input('vterm', { type: 'date' }))}`}
    </div>`,
    footer: btn('Salvar', { block: true, size: 'lg', on: () => {
      if (!(FORM.vnome || '').trim()) { A.vErr = 'Informe o nome do visitante.'; rerender(); return; }
      if (FORM.offline) { dialog({ tone: 'warning', icon: 'wifi-off', title: 'Sem internet', text: 'Sem internet. Seu visitante ainda pode entrar: a portaria vai confirmar com você pelo interfone.', actions: [{ label: 'Entendi' }] }); return; }
      A.vErr = '';
      const v = { id: 'v' + uid(), nome: FORM.vnome.trim(), doc: FORM.vdoc || '', tipo, quando: tipo === 'avulso' ? 'Hoje' : (dias.join(', ') || 'Todos os dias') + (FORM.vini ? ` · ${FORM.vini.replace(':00', 'h')} às ${(FORM.vfim || '').replace(':00', 'h')}` : ''), estado: 'Esperado' };
      S.visitantes.unshift(v);
      S.esperados.unshift({ id: v.id, nome: v.nome, un: S.units[S.unit].name, bloco: 'A', estado: 'Esperado', rec: tipo === 'recorrente' ? v.quando : null });
      FORM.fvis = 'ativos'; go(ctx.p + '/visitantes'); setTimeout(() => toast(`${v.nome} salvo. A portaria já recebeu.`), 50);
    } }) + `<label class="row help" style="justify-content:center"><input type="checkbox" class="checkbox" ${FORM.offline ? 'checked' : ''} ${cb(() => { FORM.offline = !FORM.offline; })}>Simular celular sem internet</label>`,
  };
});
def(RES, 'visitante', 'Detalhe do visitante', 'Visitantes (6.1)', ctx => {
  const v = S.visitantes.find(x => x.id === ctx.arg) || S.visitantes[0];
  const ativo = v.estado === 'Esperado';
  return {
    tab: 'visitantes', top: { title: 'Visitante', back: ctx.p + '/visitantes' },
    body: `<div class="stack">${card({ icon: 'user', title: v.nome, sub: v.tipo === 'recorrente' ? 'Recorrente · ' + v.quando : 'Avulso · ' + v.quando, badge: st(v.estado) })}
      ${v.doc ? row({ icon: 'id-card', title: 'Documento', sub: v.doc }) : ''}
      ${v.estado === 'Não compareceu' ? banner('neutral', 'circle-minus', 'O visitante não veio no dia previsto. Se a visita mudou de data, cadastre de novo.', { inline: true }) : ''}
      ${ativo ? `<h3 class="t-title-sm">Histórico de entradas</h3>${timeline([{ t: 'Cadastrado por você', d: 'hoje, 8h12', state: 'done' }, { t: 'Aparece na lista da portaria', d: 'em até 5 s', state: 'done' }, { t: 'Aguardando chegada', state: 'now' }])}` : ''}
    </div>`,
    footer: ativo ? btn('Cancelar visita', { v: 'secondary', block: true, on: () => dialog({ title: 'Cancelar a visita?', text: `${v.nome} sai da lista de esperados da portaria.`, actions: [{ label: 'Cancelar visita', v: 'danger', on: () => { v.estado = 'Cancelado'; const e = S.esperados.find(x => x.nome === v.nome); if (e) e.cancelado = true; rerender(); toast('Visita cancelada.'); } }, { label: 'Manter visita', v: 'secondary' }] }) }) : '',
  };
});

/* ---------------- Chamados (8.1) ---------------- */
const CAT_CH = { limpeza: ['Área comum suja', 'Lixo acumulado', 'Derramamento', 'Outro'], manutencao: ['Elétrica', 'Hidráulica', 'Portão', 'Elevador', 'Estrutura', 'Outro'] };
def(RES, 'chamados', 'Meus chamados', 'Chamados (8.1)', ctx => {
  const list = S.chamados.filter(c => c.mine);
  return {
    tab: GES.includes(ctx.p) ? 'menu' : 'chamados', top: { title: 'Chamados', back: GES.includes(ctx.p) ? ctx.p + '/menu' : null }, flush: true,
    body: `<div class="list">${list.map(c => row({ icon: c.tipo === 'limpeza' ? 'spray-can' : 'wrench', title: c.cat + ' · ' + c.local, sub: (c.tipo === 'limpeza' ? 'Limpeza' : 'Manutenção') + ' · aberto ' + c.aberto, right: st(c.estado), on: ctx.p + '/chamado/' + c.id })).join('')}</div>`,
    fab: { icon: 'plus', label: 'Abrir chamado', on: () => { resetForm({ ctipo: 'limpeza' }); go(ctx.p + '/chamado-novo'); } },
  };
});
def([...RES, 'portaria'], 'chamado-novo', 'Abrir chamado', 'Chamados (8.1)', ctx => {
  const t = FORM.ctipo || 'limpeza';
  const back = ctx.p === 'portaria' ? 'portaria/menu' : ctx.p + '/chamados';
  return {
    tab: ctx.p === 'morador' ? 'chamados' : 'menu', top: { title: 'Novo chamado', back },
    body: `<div class="stack-5">
      <div class="field"><span class="field-label">Tipo</span><div class="stack-2">${choice('ctipo', 'limpeza', 'Limpeza', { def: 'limpeza', icon: 'spray-can', sub: 'Vai para a fila da limpeza · prazo de 24h' })}${choice('ctipo', 'manutencao', 'Manutenção', { def: 'limpeza', icon: 'wrench', sub: 'Vai para o síndico · primeira atualização em 48h' })}</div></div>
      <div class="field"><span class="field-label">Categoria</span><div class="chips">${CAT_CH[t].map(c => chip(c, FORM.ccat === c, () => { FORM.ccat = c; rerender(); })).join('')}</div></div>
      ${field('Local', input('clocal', { ph: 'Ex.: Hall do Bloco A' }))}
      ${field('Descrição', textarea('cdesc', { ph: 'Conte o que aconteceu' }), { error: A.cErr })}
      <div class="field"><span class="field-label">Foto (opcional)</span>${photoPicker('cfotos')}</div>
    </div>`,
    footer: btn('Enviar', { block: true, size: 'lg', icon: 'send', on: () => {
      if (!(FORM.cdesc || '').trim()) { A.cErr = 'Descreva o problema para a equipe saber o que fazer.'; rerender(); return; }
      if (ctx.p === 'portaria' && !S.online) { dialog({ tone: 'warning', icon: 'wifi-off', title: 'Sem internet', text: 'Sem internet. Seu chamado não foi enviado. O texto ficou salvo como rascunho.', actions: [{ label: 'Entendi' }] }); return; }
      A.cErr = '';
      const c = { id: 'c' + uid(), tipo: t, cat: FORM.ccat || 'Outro', local: FORM.clocal || 'Área comum', desc: FORM.cdesc, estado: 'Aberto', aberto: 'agora', prazo: 'vence em 24h', autor: ctx.p === 'portaria' ? 'Portaria' : S.units[S.unit].name, mine: ctx.p !== 'portaria' };
      S.chamados.unshift(c);
      go(ctx.p === 'portaria' ? 'portaria/menu' : ctx.p + '/chamado/' + c.id);
      setTimeout(() => toast(t === 'limpeza' ? 'Chamado enviado para a fila da limpeza.' : 'Chamado enviado ao síndico.'), 50);
    } }),
  };
});
def(RES, 'chamado', 'Detalhe do chamado', 'Chamados (8.1)', ctx => {
  const c = S.chamados.find(x => x.id === ctx.arg) || S.chamados[0];
  const steps = c.tipo === 'limpeza' ? ['Aberto', 'Em atendimento', 'Concluído'] : ['Aberto', 'Orçamento', 'Agendado', 'Concluído'];
  const idx = Math.max(0, steps.indexOf(c.estado === 'Reaberto' ? 'Aberto' : c.estado));
  return {
    tab: ctx.p === 'morador' ? 'chamados' : 'menu', top: { title: 'Chamado', back: ctx.p + '/chamados' },
    body: `<div class="stack">${card({ icon: c.tipo === 'limpeza' ? 'spray-can' : 'wrench', title: c.cat, sub: c.local + ' · aberto ' + c.aberto, badge: st(c.estado), body: esc(c.desc) })}
      ${c.empresa ? row({ icon: 'building-2', title: c.empresa, sub: 'Empresa responsável' + (c.agenda ? ' · visita ' + c.agenda : '') }) : ''}
      <h3 class="t-title-sm">Andamento</h3>${timeline(steps.map((s, i) => ({ t: s, state: i < idx || (c.estado === 'Concluído' && i === idx) ? 'done' : i === idx ? 'now' : '' })))}
      ${c.estado === 'Concluído' ? `<p class="help">Não ficou resolvido? Você pode reabrir até 48h depois da conclusão.</p>` : ''}</div>`,
    footer: c.estado === 'Concluído' ? btn('Reabrir chamado', { v: 'secondary', block: true, icon: 'undo-2', on: () => { c.estado = 'Reaberto'; rerender(); toast('Chamado reaberto. Ele voltou para a fila.'); } }) : '',
  };
});

/* ---------------- Menu (12) ---------------- */
def(RES, 'menu', 'Menu', 'Menu', ctx => {
  const p = ctx.p;
  const items = [
    ['gauge', 'Meu score', 'score', S.score + ' de 100'], ['message-square-warning', 'Reclamações', 'reclamacoes'], ['receipt', 'Cobranças', 'cobrancas'],
    ['package', 'Encomendas', 'encomendas'], ['vote', 'Reuniões e votações', 'votacoes'], ['star', 'Pesquisa do mês', 'pesquisa'],
    ['megaphone', 'Comunicados', 'comunicados'], ['eye', 'Transparência', 'transparencia'],
    ...(GES.includes(p) ? [['wrench', 'Meus chamados', 'chamados']] : []),
  ];
  const conf = [['circle-help', 'Como funciona', 'como-funciona'], ['sparkles', 'Como usar o app', 'como-usar'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']];
  return {
    tab: 'menu', top: { title: 'Menu' }, flush: true,
    body: `<div class="pad row"><span class="lead avatar" style="width:56px;height:56px;border-radius:50%;background:var(--info-container);color:var(--info-on);display:flex;align-items:center;justify-content:center;font-weight:700">${p === 'sindico' ? 'PA' : p === 'subsindico' ? 'CM' : 'AL'}</span><div><div class="t-title-sm">${p === 'sindico' ? 'Pedro Alves' : p === 'subsindico' ? 'Carla Mendes' : 'Ana Lima'}</div><div class="t-body-sm muted">${p === 'sindico' ? 'Síndico · Bloco B · Apto 101' : p === 'subsindico' ? 'Subsíndica · Bloco B · Apto 202' + (S.substituicao ? ' · em substituição' : '') : S.units[S.unit].name + (S.inquilino ? ' · Inquilina · Morador habilitado' : ' · Proprietária · Morador habilitado')}</div></div></div>
      <div class="list">${items.map(([i, l, r, s]) => row({ icon: i, title: l, sub: s, on: p + '/' + r })).join('')}</div><hr class="hr">
      <div class="list">${conf.map(([i, l, r]) => row({ icon: i, title: l, on: p + '/' + r })).join('')}
      ${row({ icon: 'log-out', title: 'Sair', on: () => dialog({ title: 'Sair da conta?', text: 'Você vai precisar do e-mail e da senha para entrar de novo.', actions: [{ label: 'Sair', on: () => go('acesso/boas-vindas') }, { label: 'Continuar no app', v: 'secondary' }] }) })}</div>`,
  };
});

/* ---------------- Score e transparência (9.4) ---------------- */
def([...RES, 'portaria', 'limpeza', 'manutencao'], 'score', 'Meu score', 'Score e reclamações (9)', ctx => ({
  tab: 'menu', top: { title: 'Meu score', back: ctx.p + '/menu' },
  body: `<div class="stack">${scoreBlock(S.score)}
    <p class="t-body-sm" style="margin:0">Próxima recuperação: <b>+5 em 01/02/2027</b></p>
    ${btn('Como o score funciona', { v: 'text', icon: 'circle-help', on: ctx.p + '/como-funciona' })}
    <h2 class="t-title-sm">Histórico</h2>
    <div class="list list-full">${S.scoreHist.map(h => row({ icon: h.p > 0 ? 'trending-up' : 'trending-down', title: h.t, sub: h.d, right: `<b class="num ${h.p > 0 ? 'c-success' : 'c-danger'}">${h.p > 0 ? '+' : '−'}${Math.abs(h.p)}</b>`, on: h.p < 0 && h.t.startsWith('Reclamação') ? ctx.p + '/reclamacao/m2' : null, noChev: false })).join('')}</div>
  </div>`,
}));
def([...RES, 'portaria', 'limpeza', 'manutencao'], 'transparencia', 'Transparência', 'Score e reclamações (9)', ctx => ({
  tab: 'menu', top: { title: 'Transparência', back: ctx.p + '/menu' },
  body: `<div class="stack">
    <div class="card"><h2 class="t-title-sm">Score do síndico</h2><div class="t-body-sm muted">Pedro Alves</div>${scoreBlock(S.transp.sindico, { compact: true })}</div>
    <h2 class="t-title-sm">Nota dos setores · outubro</h2>
    ${S.transp.setores.map(s => `<div class="card"><div class="row-between"><h3 class="t-title-sm">${s.nome}</h3>${s.nota != null ? `<b class="num">${String(s.nota).replace('.', ',')} de 5</b>` : ''}</div>
      ${s.nota != null ? starsRead(s.nota) : `<p class="t-body-sm muted" style="margin:0">Nota não publicada este mês: poucas avaliações.</p>`}</div>`).join('')}
    <div class="card"><h3 class="t-title-sm">Evolução da nota da limpeza</h3><div class="bars" role="img" aria-label="Nota da limpeza: agosto 3,2; setembro 3,5; outubro 3,7 de 5">
      ${[['Agosto', 3.2], ['Setembro', 3.5], ['Outubro', 3.7]].map(([m, v]) => `<div class="bar-row"><span>${m}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${v / 5 * 100}%"></span></span><b class="num">${String(v).replace('.', ',')}</b></div>`).join('')}</div></div>
  </div>`,
}));

/* ---------------- Reclamações (9.1 e 9.3) ---------------- */
def(RES, 'reclamacoes', 'Minhas reclamações', 'Score e reclamações (9)', ctx => ({
  tab: 'menu', top: { title: 'Reclamações', back: ctx.p + '/menu' }, flush: true,
  body: `<div class="pad t-body-sm muted">Reclamações feitas por você e contra você. Quem reclamou nunca aparece para o alvo.</div>
    <div class="list">${S.minhasRecl.map(r => {
      const tone = r.papel === 'alvo' && r.estado === 'Validada' ? 'danger' : undefined;
      return row({ icon: r.papel === 'alvo' ? 'shield-alert' : 'message-square-warning', title: r.papel === 'alvo' ? 'Contra você · ' + r.cat : 'Feita por você · ' + r.cat, sub: (r.alvo ? 'Alvo: ' + r.alvo + ' · ' : '') + r.data, right: st(r.estado, tone), on: ctx.p + '/reclamacao/' + r.id });
    }).join('')}</div>`,
  fab: { icon: 'plus', label: 'Nova', aria: 'Registrar nova reclamação', on: () => { resetForm(); go(ctx.p + '/reclamacao-nova/1'); } },
}));
const CAT_RC = [['Barulho', 'Média · −10 pontos'], ['Uso indevido de vaga', 'Leve · −5 pontos'], ['Animal sem coleira', 'Leve · −5 pontos'], ['Dano a área comum', 'Grave · −20 pontos'], ['Atendimento', 'Média · −10 pontos']];
def(RES, 'reclamacao-nova', 'Registrar reclamação', 'Score e reclamações (9)', ctx => {
  const n = +(ctx.arg || 1), p = ctx.p;
  const next = () => go(p + '/reclamacao-nova/' + (n + 1));
  const alvos = [['Bloco C · Apto 504', 'Unidade'], ['Bloco A · Apto 303', 'Unidade'], ['José Ribeiro', 'Funcionário · Portaria'], ['Sandra Rocha', 'Funcionário · Limpeza'], ['Pedro Alves', 'Síndico'], ['Carla Mendes', 'Subsíndica']];
  const q = (FORM.qalvo || '').toLowerCase();
  let body = '', footer = '';
  if (n === 1) {
    body = `${stepper(1, 4)}<h2 class="t-title-md">De quem é a reclamação?</h2>
      ${field('Buscar', input('qalvo', { icon: 'search', ph: 'Nome, unidade ou funcionário' }))}
      <p class="help" style="margin:0">Só uma pessoa ou unidade por reclamação. Para reclamar de outra pessoa, abra outra reclamação.</p>
      <div class="stack-2">${alvos.filter(a => !q || a.join(' ').toLowerCase().includes(q)).map(([a, s]) => choice('alvo', a, a, { sub: s })).join('')}</div>`;
    footer = btn('Continuar', { block: true, size: 'lg', disabled: !FORM.alvo, on: next });
  } else if (n === 2) {
    body = `${stepper(2, 4)}<h2 class="t-title-md">Qual é o problema?</h2><div class="stack-2">${CAT_RC.map(([c, g]) => choice('rcat', c, c, { sub: 'Gravidade padrão: ' + g })).join('')}</div>`;
    footer = btn('Continuar', { block: true, size: 'lg', disabled: !FORM.rcat, on: next });
  } else if (n === 3) {
    const bad = /idiota|lixo de gente|burro/i.test(FORM.rdesc || '');
    body = `${stepper(3, 4)}<h2 class="t-title-md">Conte o que aconteceu</h2>
      ${field('Descrição', textarea('rdesc', { ph: 'O que, quando e onde' }), { error: A.rcErr })}
      ${A.rcErr ? `<div class="card t-body-sm">${esc(FORM.rdesc || '').replace(/(idiota|lixo de gente|burro)/ig, '<span class="mark">$1</span>')}</div>` : ''}
      ${field('Data', input('rdata', { type: 'date', value: FORM.rdata ?? '2026-11-04' }))}
      <div class="field"><span class="field-label">Foto (opcional)</span>${photoPicker('rfotos')}</div>
      <p class="help" style="margin:0">Dica do protótipo: escreva "idiota" para ver o filtro de ofensas.</p>`;
    footer = btn('Continuar', { block: true, size: 'lg', on: () => {
      if (!(FORM.rdesc || '').trim()) { A.rcErr = 'Descreva o que aconteceu.'; rerender(); return; }
      if (/idiota|lixo de gente|burro/i.test(FORM.rdesc)) { A.rcErr = 'Reescreva o trecho destacado. Reclamações com ofensas não são enviadas.'; rerender(); return; }
      A.rcErr = ''; next();
    } });
    void bad;
  } else {
    body = `${stepper(4, 4)}<h2 class="t-title-md">Revise e envie</h2>
      <div class="card"><div class="t-body-sm muted">Alvo</div><b>${esc(FORM.alvo)}</b><div class="t-body-sm muted" style="margin-top:8px">Categoria</div><b>${esc(FORM.rcat)}</b><div class="t-body-sm muted" style="margin-top:8px">Descrição</div><div class="t-body-sm">${esc(FORM.rdesc)}</div></div>
      ${banner('info', 'info', `Quem você indicou não vai saber que foi você. Reclamações falsas podem custar pontos a quem reclama. <a href="#/${p}/como-funciona">Como funciona</a>`, { inline: true })}`;
    footer = btn('Enviar reclamação', { block: true, size: 'lg', icon: 'send', on: () => {
      const pend = FORM.alvo === 'Carla Mendes' && false;
      S.minhasRecl.unshift({ id: 'm' + uid(), papel: 'reclamante', alvo: FORM.alvo, cat: FORM.rcat, estado: pend ? 'Pendente' : 'Aberta', data: 'hoje' });
      go(p + '/reclamacoes'); setTimeout(() => toast('Reclamação enviada. Você será avisado da decisão.'), 50);
    } });
  }
  return { tab: 'menu', top: { title: 'Nova reclamação', back: n > 1 ? p + '/reclamacao-nova/' + (n - 1) : p + '/reclamacoes' }, body: `<div class="stack">${body}</div>`, footer };
}, { arg: '1' });

def(RES, 'reclamacao', 'Detalhe da reclamação', 'Score e reclamações (9)', ctx => {
  const r = S.minhasRecl.find(x => x.id === ctx.arg) || S.minhasRecl[0], p = ctx.p;
  if (r.papel === 'alvo') {
    return {
      tab: 'menu', top: { title: 'Reclamação contra você', back: p + '/reclamacoes' },
      body: `<div class="stack">${card({ icon: 'shield-alert', title: r.cat, sub: 'Decidida em ' + r.data, badge: st(r.estado, r.estado === 'Validada' ? 'danger' : r.estado === 'Recurso aceito' ? 'success' : undefined) })}
        ${r.pontos ? `<div class="card"><div class="row-between"><span>Pontos</span><b class="num c-danger">−${Math.abs(r.pontos)}</b></div><p class="t-body-sm muted" style="margin:0">A reclamação foi validada pelo síndico depois de ouvir você.</p></div>` : ''}
        ${r.estado === 'Em recurso' ? banner('info', 'clock', 'Seu recurso está com a subsíndica. Você será avisado da decisão.', { inline: true }) : ''}
        ${r.estado === 'Recurso aceito' ? banner('success', 'circle-check', 'Recurso aceito. Os pontos foram devolvidos.', { inline: true }) : ''}
        <p class="help">Por privacidade, quem fez a reclamação não aparece aqui.</p></div>`,
      footer: r.estado === 'Validada' ? (r.recorrivel ? btn('Recorrer', { block: true, size: 'lg', icon: 'undo-2', on: p + '/recurso/' + r.id }) + `<p class="help center" style="margin:0">Você pode recorrer até ${r.recorrerAte}.</p>` : btn('Recorrer', { block: true, disabled: true }) + `<p class="disabled-reason">${ic('info')}O prazo de recurso terminou em ${r.recorrerAte}.</p>`) : '',
    };
  }
  return {
    tab: 'menu', top: { title: 'Sua reclamação', back: p + '/reclamacoes' },
    body: `<div class="stack">${card({ icon: 'message-square-warning', title: r.cat, sub: 'Alvo: ' + (r.alvo || '') + ' · ' + r.data, badge: st(r.estado) })}
      <h3 class="t-title-sm">Andamento</h3>${timeline([{ t: 'Enviada', d: r.data, state: 'done' }, { t: 'Julgador conversa com o alvo', state: r.estado === 'Aberta' ? '' : 'now' }, { t: 'Decisão', d: 'Você será avisado' }, { t: 'Prazo de recurso de 7 dias' }])}
      ${r.estado === 'Pendente' ? banner('warning', 'clock', 'Sua reclamação aguarda um julgador disponível.', { inline: true }) : ''}</div>`,
  };
});
def(RES, 'recurso', 'Recorrer', 'Score e reclamações (9)', ctx => {
  const r = S.minhasRecl.find(x => x.id === ctx.arg) || S.minhasRecl[2], p = ctx.p;
  return {
    tab: 'menu', top: { title: 'Recorrer', back: p + '/reclamacao/' + r.id },
    body: `<div class="stack-5"><p class="t-body" style="margin:0">Explique por que a decisão deve mudar. Quem julga o recurso é a subsíndica, porque a decisão foi do síndico.</p>
      ${field('Seu recurso', textarea('rec', { ph: 'Conte sua versão e o que mudou' }), { error: A.recErr })}
      <div class="field"><span class="field-label">Foto ou documento (opcional)</span>${photoPicker('recfotos')}</div>
      ${banner('info', 'info', 'Cada decisão aceita um recurso só.', { inline: true })}</div>`,
    footer: btn('Enviar recurso', { block: true, size: 'lg', icon: 'send', on: () => { if (!(FORM.rec || '').trim()) { A.recErr = 'Escreva o recurso antes de enviar.'; rerender(); return; } A.recErr = ''; r.estado = 'Em recurso'; go(p + '/reclamacao/' + r.id); setTimeout(() => toast('Recurso enviado.'), 50); } }),
  };
});

/* ---------------- Cobranças (13.1, 11.8) ---------------- */
def([...RES, 'proprietario'], 'cobrancas', 'Cobranças', 'Cobranças (13.1)', ctx => {
  const p = ctx.p, list = cobList(p);
  const isProp = p === 'proprietario';
  const info = isProp ? (S.prop.desocupada ? 'Unidade desocupada: você responde pelas cobranças ordinárias e extraordinárias.' : 'Você paga as despesas extraordinárias. As ordinárias são da inquilina, Marina Souza; aqui você só acompanha.')
    : isInq(p) ? 'Você paga as despesas ordinárias. As extraordinárias, como o fundo de obras, são do proprietário.' : '';
  return {
    tab: isProp ? 'cobrancas' : 'menu', top: { title: isProp ? 'Cobranças · Bloco B · Apto 302' : 'Cobranças', back: isProp ? null : p + '/menu', actions: isProp ? [{ icon: 'bell', label: 'Notificações', on: 'proprietario/notificacoes' }] : [] },
    flush: true,
    body: `${info ? `<div class="pad">${banner('info', 'info', info, { inline: true })}</div>` : ''}<div class="list">${list.map(c => row({ icon: 'receipt', title: `<span class="t-title-sm num">${money(c.valor)}</span>`, sub: c.ref, sub2: (c.estado.startsWith('Paga') ? 'Paga em ' + c.pago : 'Vence em ' + c.venc) + ' · ' + c.tipo + (c.inq ? ' · Paga pelo inquilino' : ''), right: st(c.estado), on: p + '/cobranca/' + c.id })).join('')}</div>`,
  };
});
def([...RES, 'proprietario'], 'cobranca', 'Detalhe da cobrança', 'Cobranças (13.1)', ctx => {
  const p = ctx.p, L = cobList(p), c = L.find(x => x.id === ctx.arg) || L[0];
  const aberta = ['Emitida', 'Em atraso'].includes(c.estado) && !c.inq;
  const atraso = c.estado === 'Em atraso';
  return {
    tab: p === 'proprietario' ? 'cobrancas' : 'menu', top: { title: 'Cobrança', back: p + '/cobrancas' },
    body: `<div class="stack">
      <div class="card"><div class="row-between"><span class="t-body-sm muted">${c.ref}</span>${st(c.estado)}</div><div class="t-title-lg num">${money(c.valor)}</div>
        <div class="t-body-sm muted">${atraso ? 'Venceu em ' + c.venc : c.estado.startsWith('Paga') ? 'Paga em ' + c.pago : 'Vence em ' + c.venc} · ${c.tipo}${c.inq ? ' · Paga pelo inquilino' : ''}</div></div>
      ${c.inq ? banner('info', 'info', 'Esta cobrança foi emitida para a inquilina, Marina Souza. Você acompanha a situação, mas o pagamento é dela.', { inline: true }) : ''}
      ${atraso ? `<div class="card t-body-sm"><div class="row-between"><span>Valor original</span><span class="num">${money(620)}</span></div><div class="row-between"><span>Multa (2%)</span><span class="num">${money(12.4)}</span></div><div class="row-between"><span>Juros (1% ao mês, 26 dias)</span><span class="num">${money(0)}</span></div><div class="row-between"><b>Total atualizado</b><b class="num">${money(632.4)}</b></div>
        <p class="help" style="margin:0">Valor atualizado com multa e juros até hoje.</p></div>` : ''}
      ${aberta ? `<h2 class="t-title-sm">Formas de pagamento</h2>
        ${row({ icon: 'qr-code', title: 'Pix', sub: 'Confirmação em segundos', on: p + '/pix/cobranca-' + c.id })}
        ${row({ icon: 'barcode', title: 'Boleto', sub: 'Pode levar até 3 dias úteis para confirmar', on: () => sheet(`<h2 class="t-title-md">Boleto</h2><div class="card num t-body-sm" style="word-break:break-all">34191.79001 01043.510047 91020.150008 1 ${atraso ? '91230000063240' : '91230000062000'}</div>${btn('Copiar código', { icon: 'copy', block: true, on: () => { closeLayer(); toast('Código do boleto copiado.'); } })}${btn('Baixar PDF', { v: 'secondary', icon: 'file-text', block: true, on: () => toast('Boleto baixado.') })}<p class="help">Pagamento em processamento. Boleto pode levar até 3 dias úteis.</p>`) })}
        ${S.cobrancaCfg.cartao ? row({ icon: 'credit-card', title: 'Cartão de crédito', on: p + '/cartao/cobranca-' + c.id }) : row({ icon: 'credit-card', title: 'Cartão de crédito', sub: 'O condomínio não aceita cartão para a taxa' })}` : ''}
      ${c.estado.startsWith('Paga') ? btn('Baixar comprovante', { v: 'secondary', icon: 'file-check', block: true, on: () => toast('Comprovante baixado.') }) : ''}
    </div>`,
  };
});
def([...RES, 'proprietario'], 'cobranca-paga', 'Pagamento confirmado', 'Cobranças (13.1)', ctx => {
  const L = S.cobrancas.concat(S.cobrancasProp), c = L.find(x => x.id === ctx.arg) || L[0], p = ctx.p;
  return {
    tab: p === 'proprietario' ? 'cobrancas' : 'menu', top: { title: 'Pagamento', back: p + '/cobrancas' },
    body: `<div class="empty" style="color:var(--text-primary)"><span class="onb-ico" style="background:var(--success-container);color:var(--success-fg)">${ic('circle-check')}</span><h2 class="t-title-md">Pagamento confirmado</h2><p class="t-body muted" style="margin:0">${c.ref} · ${money(c.valor)}</p>${st(c.estado)}</div>`,
    footer: `${btn('Baixar comprovante', { block: true, icon: 'file-check', on: () => toast('Comprovante baixado.') })}${btn('Ver cobranças', { v: 'text', block: true, on: p + '/cobrancas' })}`,
  };
});

/* ---------------- Encomendas (7.1) ---------------- */
def(RES, 'encomendas', 'Encomendas', 'Encomendas (7.1)', ctx => {
  const list = S.encomendas.filter(e => e.un === S.units[S.unit].name || e.un === 'Bloco A · Apto 101');
  return {
    tab: 'menu', top: { title: 'Encomendas', back: ctx.p + '/menu' }, flush: true,
    body: `<div class="list">${list.map(e => row({ icon: 'package', title: e.rem, sub: 'Chegou ' + e.data, right: st(e.estado) })).join('')}</div>
      <div class="pad">${banner('info', 'info', 'Retire na portaria com documento. Outra pessoa pode retirar se você autorizar pelo interfone.', { inline: true })}</div>`,
  };
});

/* ---------------- Reuniões e votações (11.1, 11.2, 11.7) ---------------- */
def(RES, 'votacoes', 'Reuniões e votações', 'Reuniões e votações (11)', ctx => ({
  tab: 'menu', top: { title: 'Reuniões e votações', back: ctx.p + '/menu' },
  body: `<div class="stack">${S.reunioes.map(g => card({ icon: g.eleicao ? 'vote' : 'calendar-days', title: g.titulo, sub: g.data + ' · ' + g.local, badge: st(g.estado), on: ctx.p + (g.eleicao ? '/eleicao/' : '/reuniao/') + g.id })).join('')}</div>`,
}));
def('proprietario', 'assembleias', 'Assembleias', 'Assembleias (11.1)', () => ({
  tab: 'assembleias', top: { title: 'Assembleias' },
  body: `<div class="stack">${banner('info', 'vote', 'Você é a proprietária: quem vota pelo Bloco B · Apto 302 é você ou o procurador que indicar, inclusive a inquilina.', { inline: true })}
    ${S.reunioes.map(g => card({ icon: g.eleicao ? 'vote' : 'calendar-days', title: g.titulo, sub: g.data + ' · ' + g.local, badge: st(g.estado), on: 'proprietario' + (g.eleicao ? '/eleicao/' : '/reuniao/') + g.id })).join('')}</div>`,
}));
def([...RES, 'proprietario'], 'reuniao', 'Reunião e pautas', 'Reuniões e votações (11)', ctx => {
  const g = S.reunioes.find(x => x.id === ctx.arg) || S.reunioes[0], p = ctx.p;
  const enc = g.estado === 'Encerrada';
  const isProp = p === 'proprietario', inq = isInq(p), vk = isProp ? 'votoProp' : 'voto';
  const pautas = g.pautas.map(pt => {
    if (pt.tipo === 'informativa') return card({ icon: 'file-text', title: pt.q, sub: 'Pauta informativa', body: 'Sem votação. O documento fica disponível depois da reunião.' });
    let inner; const fk = 'voto-' + vk + '-' + pt.id;
    if (enc || pt.encerrada) inner = `<div class="bars">${pt.opcoes.map((o, i) => `<div class="bar-row"><span>${o}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${pt.res[i] / pt.res.reduce((a, b) => a + b) * 100}%"></span></span><b class="num">${pt.res[i]}</b></div>`).join('')}</div><p class="help" style="margin:0">Resultado publicado com a contagem por unidade.</p>`;
    else if (inq && pt.extra) inner = banner('info', 'info', 'Só o proprietário vota nesta pauta, porque ela envolve despesa extraordinária. Ele pode indicar você como procurador.', { inline: true });
    else if (S.atraso && !isProp) inner = banner('warning', 'triangle-alert', 'Sua unidade tem cobrança em atraso e não pode votar (Código Civil, art. 1.335, III). Pague para votar nas próximas pautas.', { inline: true, action: btn('Ver cobranças', { v: 'secondary', size: 'sm', on: p + '/cobrancas' }) });
    else if (pt[vk] && inq && pt.subst) inner = `${badge('Substituído pelo voto do proprietário', 'neutral', 'circle-minus')}<p class="help" style="margin:0">O proprietário votou até o encerramento, e o voto dele vale pela unidade.</p>`;
    else if (pt[vk]) inner = `${badge('Seu voto foi registrado', 'success', 'circle-check')}<p class="help" style="margin:0">O resultado aparece quando a reunião for encerrada.</p>
      ${inq ? btn('Simular: o proprietário votou depois', { v: 'text', size: 'sm', on: () => { pt.subst = true; rerender(); toast('O proprietário votou nesta pauta, e o voto dele substituiu o seu.'); } }) : ''}`;
    else inner = `${inq ? banner('info', 'info', 'Você pode votar nesta pauta. Se o proprietário votar até o encerramento, o voto dele vale no lugar do seu.', { inline: true }) : ''}
      <div class="stack-2">${pt.opcoes.map(o => choice(fk, o, o, { big: true })).join('')}</div>
      ${btn('Votar', { block: true, disabled: !FORM[fk], on: () => dialog({ title: 'Confirmar seu voto?', text: `Você escolheu “${FORM[fk]}”. O voto é secreto e não pode ser mudado.`, actions: [{ label: 'Confirmar voto', on: () => { pt[vk] = FORM[fk]; rerender(); toast('Voto registrado.'); } }, { label: 'Revisar', v: 'secondary' }] }) })}
      ${inq ? '' : btn('Indicar procurador', { v: 'text', on: () => sheet(`<h2 class="t-title-md">Indicar procurador</h2><p class="t-body-sm muted">A pessoa indicada vota por sua unidade${isProp ? ', e pode ser a inquilina, Marina Souza' : ''}. Cada procurador representa uma unidade além das suas.</p>${field('Nome do procurador', input('proc', { ph: 'Ex.: Rafael Costa' }))}${btn('Indicar', { block: true, on: () => { if (/rafael/i.test(FORM.proc || '')) { closeLayer(); dialog({ tone: 'warning', icon: 'triangle-alert', title: 'Indicação recusada', text: 'Rafael Costa já representa outra unidade. Escolha outra pessoa.', actions: [{ label: 'Escolher outra pessoa' }] }); } else { closeLayer(); toast('Procurador indicado.'); } } })}`) })}`;
    return `<div class="card"><div class="card-head"><h3 class="t-title-sm">${pt.q}</h3></div><div class="t-body-sm muted">Quórum: ${pt.quorum}${pt.extra ? ' · Envolve despesa extraordinária' : ''}</div>${inner}</div>`;
  }).join('');
  return {
    tab: isProp ? 'assembleias' : 'menu', top: { title: 'Reunião', back: p + (isProp ? '/assembleias' : '/votacoes') },
    body: `<div class="stack">${card({ icon: 'calendar-days', title: g.titulo, sub: g.data + ' · ' + g.local, badge: st(g.estado) })}
      ${!enc ? `<p class="t-body-sm c-warning row" style="margin:0">${ic('clock')}Votação até o fim da reunião, 20/11 às 21h.</p>` : row({ icon: 'file-text', title: 'Ata e lista de presença', sub: 'PDF', on: () => toast('Ata baixada.') })}
      ${pautas}</div>`,
  };
});
def([...RES, 'proprietario'], 'eleicao', 'Eleição e candidatura', 'Reuniões e votações (11)', ctx => {
  const p = ctx.p, isProp = p === 'proprietario';
  return {
    tab: isProp ? 'assembleias' : 'menu', top: { title: 'Eleição', back: p + (isProp ? '/assembleias' : '/votacoes') },
    body: `<div class="stack">${card({ icon: 'vote', title: 'Eleição de síndico e subsíndico 2027–2028', sub: 'Candidaturas até 15/11 · votação em 20/11', badge: st('Candidaturas abertas') })}
      <h3 class="t-title-sm">Candidatos</h3><div class="list list-full">${[['Pedro Alves', 'Síndico · Bloco B · Apto 101 · reeleição'], ['Marta Gouveia', 'Síndica · Bloco C · Apto 201'], ['Carla Mendes', 'Subsíndica · Bloco B · Apto 202']].map(([n, s]) => row({ avatar: n, title: n, sub: s })).concat(A.cand ? [row({ avatar: 'Ana Lima', title: 'Ana Lima', sub: A.cand + ' · Bloco A · Apto 101', right: badge('Candidatura aceita', 'success') })] : []).join('')}</div>
      ${banner('info', 'info', 'Síndico e subsíndico precisam ser de unidades diferentes. Em empate, há segundo turno em até 7 dias.', { inline: true })}
      ${isProp ? banner('info', 'vote', 'Na eleição de 20/11, quem vota pelo Bloco B · Apto 302 é você ou o seu procurador.', { inline: true }) : isInq(p) ? banner('info', 'vote', 'Na eleição, quem vota pela unidade é o proprietário ou o procurador dele. Você pode se candidatar.', { inline: true }) : ''}</div>`,
    footer: A.cand || isProp ? '' : btn('Candidatar-se', { block: true, size: 'lg', on: () => sheet(() => `<h2 class="t-title-md">Candidatar-se a</h2>${choice('cargo', 'Síndica', 'Síndica', { def: 'Síndica' })}${choice('cargo', 'Subsíndica', 'Subsíndica', { def: 'Síndica' })}
      <p class="help">Carla Mendes (Bloco B · Apto 202) já concorre a subsíndica. Isso não impede sua candidatura.</p>${btn('Confirmar candidatura', { block: true, on: () => { A.cand = FORM.cargo || 'Síndica'; closeLayer(); rerender(); toast('Candidatura enviada.'); } })}`) }),
  };
});

/* ---------------- Pesquisa mensal (12.1) ---------------- */
const NOTA_TXT = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'];
def(RES, 'pesquisa', 'Pesquisa do mês', 'Pesquisa mensal (12.1)', ctx => {
  const P = S.pesquisa;
  const rate = (f) => {
    const n = P.notas[f.id];
    return `<div class="card"><div class="row-between"><div><h3 class="t-title-sm">${f.nome}</h3>${f.turno ? `<div class="t-caption muted">${f.turno}</div>` : ''}</div>${n === 0 ? badge('Não conheço', 'neutral') : ''}</div>
      <div class="row wrap" style="gap:4px"><div class="stars" role="radiogroup" aria-label="Avaliação de ${f.nome}">${[1, 2, 3, 4, 5].map(i => `<button type="button" class="star ${n >= i ? 'is-on' : ''}" role="radio" aria-checked="${n === i}" aria-label="${i} de 5, ${NOTA_TXT[i].toLowerCase()}" ${cb(() => { P.notas[f.id] = i; rerender(); })}>${ic('star')}</button>`).join('')}</div>
      <span class="t-label-sm" style="min-width:80px">${n ? NOTA_TXT[n] : ''}</span>${btn('Não conheço', { v: 'text', size: 'sm', on: () => { P.notas[f.id] = 0; rerender(); } })}</div></div>`;
  };
  return {
    tab: 'menu', top: { title: 'Pesquisa de ' + P.mes.toLowerCase(), back: ctx.p + '/menu' },
    body: `<div class="stack"><p class="t-body muted" style="margin:0">Avalie quem trabalha no condomínio. Você pode mudar as notas até ${P.fecha}. Ninguém fica sabendo qual nota você deu.</p>
      ${P.setores.map(s => `<h2 class="t-title-sm section-title" style="margin-bottom:0">${s.nome}</h2>${s.funcs.map(rate).join('')}`).join('')}
      ${field('Comentário (opcional)', textarea('pcom', { ph: 'Algo que a equipe deveria saber?' }))}</div>`,
    footer: btn(P.respondida ? 'Atualizar avaliação' : 'Salvar avaliação', { block: true, size: 'lg', on: () => { P.respondida = true; go(ctx.p + '/inicio'); setTimeout(() => toast('Avaliação salva. Você pode mudar até ' + P.fecha + '.'), 50); } }),
  };
});

/* ---------------- Comunicados (10.1) ---------------- */
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'comunicados', 'Comunicados', 'Comunicados (10.1)', ctx => ({
  tab: GES.includes(ctx.p) ? 'gestao' : 'menu', top: { title: 'Comunicados', back: ctx.p + (GES.includes(ctx.p) ? '/gestao' : '/menu') }, flush: true,
  body: `${sugestoes(ctx.p)}<div class="list">${S.comunicados.filter(c => ctx.p !== 'proprietario' || (!c.individual && c.publico !== 'Funcionários')).map(c => row({ icon: c.individual ? 'message-circle' : 'megaphone', title: c.titulo + (c.novo ? ' ' + badge('Novo', 'accent') : ''), sub: (c.individual ? 'Para você · ' : '') + c.data, on: ctx.p + '/comunicado/' + c.id })).join('')}</div>`,
  fab: GES.includes(ctx.p) ? { icon: plena() ? 'plus' : 'pencil-line', label: plena() ? 'Novo' : 'Sugerir', aria: plena() ? 'Novo comunicado' : 'Sugerir comunicado', on: () => { resetForm({ ktipo: 'geral', kpub: 'Moradores' }); go(ctx.p + '/comunicado-novo'); } } : null,
}));
/* Sugestões de comunicado da subsíndica (RN-CO-05): ela vê as próprias; o síndico revisa, edita e envia, ou descarta */
function sugestoes(p) {
  const st2 = e => badge(e, e === 'Aguardando o síndico' ? 'warning' : e === 'Descartada' ? 'neutral' : 'success');
  if (p === 'subsindico' && !S.substituicao) return S.rascunhos.length ? `<h2 class="t-title-sm pad" style="padding-bottom:0;margin:0">Suas sugestões</h2><div class="list">${S.rascunhos.map(r => row({ icon: 'pencil-line', title: r.titulo, sub: r.publico + ' · ' + r.data + (r.motivo ? ' · ' + r.motivo : ''), right: st2(r.estado) })).join('')}</div><h2 class="t-title-sm pad" style="padding-bottom:0;margin:0">Enviados</h2>` : '';
  if (!GES.includes(p)) return '';   // síndico, ou a subsíndica na substituição, revisa as pendentes
  const pend = S.rascunhos.filter(r => r.estado === 'Aguardando o síndico');
  if (!pend.length) return '';
  const revisar = r => sheet(`<h2 class="t-title-md">${esc(r.titulo)}</h2><div class="t-caption muted">Sugestão da subsíndica Carla Mendes · ${r.data} · ${r.publico}</div><p class="t-body">${esc(r.txt)}</p>
    ${btn('Revisar e enviar', { block: true, icon: 'send', on: () => { closeLayer(); resetForm({ ktipo: r.publico === 'Individual' ? 'individual' : 'geral', kpub: r.publico === 'Individual' ? 'Moradores' : r.publico, ktit: r.titulo, ktxt: r.txt, krasc: r.id }); go(p + '/comunicado-novo'); } })}
    ${btn('Descartar', { v: 'secondary', block: true, on: () => { r.estado = 'Descartada'; closeLayer(); rerender(); toast('Sugestão descartada. A subsíndica foi avisada.'); } })}`);
  return `<h2 class="t-title-sm pad" style="padding-bottom:0;margin:0">${p === 'sindico' ? 'Sugestões da subsíndica' : 'Suas sugestões pendentes'}</h2><div class="list">${pend.map(r => row({ icon: 'pencil-line', title: r.titulo, sub: r.publico + ' · ' + r.data, right: st2(r.estado), on: () => revisar(r) })).join('')}</div><h2 class="t-title-sm pad" style="padding-bottom:0;margin:0">Enviados</h2>`;
}
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'comunicado', 'Ler comunicado', 'Comunicados (10.1)', ctx => {
  const c = S.comunicados.find(x => x.id === ctx.arg) || S.comunicados[0]; c.novo = false;
  return {
    tab: 'menu', top: { title: 'Comunicado', back: ctx.p + '/comunicados', actions: [{ icon: 'ellipsis', label: 'Mais ações', on: () => sheet(`${row({ icon: 'flag', title: 'Denunciar conteúdo', sub: 'Vai para quem julgaria uma reclamação contra o autor', on: () => { closeLayer(); toast('Denúncia enviada.'); } })}`) }] },
    body: `<div class="stack"><h1 class="t-title-md">${c.titulo}</h1><div class="t-caption muted">Síndico Pedro Alves · ${c.data} · ${c.publico}</div><p class="t-body" style="margin:0">${c.txt}</p>
      ${(ctx.p === 'sindico' || (ctx.p === 'subsindico' && S.substituicao)) && !c.individual ? `<div class="card"><div class="row-between"><span>Confirmações de leitura</span><b class="num">${c.lidos} de ${c.total}</b></div></div>` : ''}
      ${c.individual ? `<h2 class="t-title-sm">Conversa</h2><div class="stack-2"><div class="msg">${c.txt}</div>${c.resposta ? `<div class="msg me">${esc(c.resposta)}</div>` : ''}</div>` : ''}</div>`,
    footer: c.individual && !c.resposta && ctx.p !== 'sindico' ? `${field('', textarea('kres', { ph: 'Escreva sua resposta' }))}${btn('Responder', { block: true, icon: 'send', on: () => { if (!(FORM.kres || '').trim()) return; c.resposta = FORM.kres; FORM.kres = ''; rerender(); toast('Resposta enviada ao síndico.'); } })}` : '',
  };
});

/* ---------------- Configurações (12, 14.1) ---------------- */
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'aparencia', 'Aparência', 'Configurações (14.1)', ctx => ({
  tab: 'menu', top: { title: 'Aparência', back: ctx.p + '/menu' },
  body: `<div class="stack-2">${[['system', 'Igual ao aparelho', 'Padrão'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l, s]) => `<label class="choice ${S.theme === k ? 'is-selected' : ''}"><input type="radio" name="tema" ${S.theme === k ? 'checked' : ''} ${cb(() => { S.theme = k; applyTheme(); rerender(); })}><span class="grow">${l}${s ? `<span class="help" style="display:block">${s}</span>` : ''}</span></label>`).join('')}</div>`,
}));
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'notif-config', 'Notificações', 'Configurações (14.1)', ctx => {
  const N = S.notif, lab = { reservas: 'Reservas', visitantes: 'Entrada de visitantes', encomendas: 'Encomendas', chamados: 'Andamento de chamados', comunicados: 'Comunicados', votacoes: 'Reuniões e votações', cobrancas: 'Lembretes de cobrança', pesquisa: 'Pesquisa do mês' };
  return {
    tab: 'menu', top: { title: 'Notificações', back: ctx.p + '/menu' },
    body: `<div>${sw('Decisão de reclamação contra você', true, null, { disabled: true, sub: 'Obrigatória: você precisa saber para poder recorrer.' })}
      ${ctx.p === 'portaria' ? sw('Divergência ao sincronizar', true, null, { disabled: true, sub: 'Obrigatória: exige confirmar com o morador.' }) : ''}
      ${Object.keys(lab).map(k => sw(lab[k], N[k], () => { N[k] = !N[k]; toast('Preferência salva.'); })).join('')}</div>`,
  };
});
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'privacidade', 'Privacidade e dados', 'Configurações (14.1)', ctx => ({
  tab: 'menu', top: { title: 'Privacidade e dados', back: ctx.p + '/menu' }, flush: true,
  body: `<div class="list">${row({ icon: 'file-text', title: 'Política de privacidade', on: () => sheet('<h2 class="t-title-md">Política de privacidade</h2><p class="t-body">Texto de exemplo da política de privacidade do condomínio.</p>') })}
    ${row({ icon: 'download', title: 'Pedir cópia dos meus dados', sub: 'Arquivo por e-mail em até 15 dias', on: () => dialog({ title: 'Pedir cópia dos seus dados?', text: 'Vamos enviar um arquivo para ana.lima@email.com em até 15 dias.', actions: [{ label: 'Pedir cópia', on: () => toast('Pedido registrado. O arquivo chega em até 15 dias.') }, { label: 'Agora não', v: 'secondary' }] }) })}
    ${row({ icon: 'trash-2', title: 'Excluir minha conta', on: () => dialog({ tone: 'danger', icon: 'triangle-alert', title: 'Excluir sua conta?', text: 'Seu histórico fica anônimo. Votos e reclamações continuam, sem identificação. ' + (ctx.p === 'proprietario' ? 'Você é a proprietária: a administradora será avisada para definir o substituto, e até lá a unidade não vota.' : 'Você é o morador habilitado: a administradora será avisada para definir o substituto, e até lá ninguém reserva nem cadastra visitantes pela unidade.'),
      body: field('Confirme com sua senha', `<input class="input" type="password" autocomplete="current-password">`), actions: [{ label: 'Excluir conta', v: 'danger', on: () => go('acesso/boas-vindas') }, { label: 'Manter conta', v: 'secondary' }] }) })}</div>`,
}));
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'como-funciona', 'Como funciona', 'Configurações (14.1)', ctx => ({
  tab: 'menu', top: { title: 'Como funciona', back: ctx.p + '/menu' },
  body: `<div class="stack" style="max-width:640px">${[
    ['gauge', 'Score', 'Todo morador e funcionário começa com 100 pontos. Reclamações validadas tiram 5, 10 ou 20 pontos; boa convivência e boas notas na pesquisa devolvem pontos a cada trimestre. Com 60 ou menos, as reservas gratuitas ficam pausadas.'],
    ['message-square-warning', 'Reclamações', 'O julgador conversa com quem foi indicado antes de decidir. Quem foi indicado nunca sabe quem reclamou. Reclamações falsas ou desproporcionais tiram pontos de quem reclamou.'],
    ['undo-2', 'Recurso', 'Quem perdeu pontos pode recorrer uma vez, em até 7 dias.'],
    ['calendar-days', 'Reservas', 'De 24h a 60 dias antes, até 2 por mês em cada área. Áreas pagas: cancelamento com reembolso até 12h antes.'],
    ['key-round', 'Unidade alugada', 'O inquilino é o morador habilitado e usa todas as funções de morador. Quem vota é o proprietário; o inquilino vota como procurador dele ou nas pautas sem despesa extraordinária. O inquilino paga as despesas ordinárias e o proprietário, as extraordinárias.'],
  ].map(([i, t, d]) => card({ icon: i, title: t, body: d })).join('')}</div>`,
}));
def([...RES, 'portaria', 'limpeza', 'manutencao', 'proprietario'], 'como-usar', 'Como usar o app', 'Configurações (14.1)', ctx => { A.onbRole = ONB[ctx.p] ? ctx.p : 'morador'; setTimeout(() => go('acesso/onboarding/1'), 0); return { body: '' }; });

/* ---------------- Proprietário não residente (RN-CD-19) ---------------- */
def('proprietario', 'menu', 'Menu', 'Menu', () => ({
  tab: 'menu', top: { title: 'Menu' }, flush: true,
  body: `<div class="pad"><div class="t-title-sm">Helena Duarte</div><div class="t-body-sm muted">Proprietária não residente · Bloco B · Apto 302</div></div>
    <div class="list">${[['megaphone', 'Comunicados', 'comunicados'], ['inbox', 'Solicitações', 'solicitacoes'], ['circle-help', 'Como funciona', 'como-funciona'], ['sparkles', 'Como usar o app', 'como-usar'], ['sun-moon', 'Aparência', 'aparencia'], ['bell', 'Notificações', 'notif-config'], ['shield', 'Privacidade e dados', 'privacidade']].map(([i, l, r]) => row({ icon: i, title: l, on: 'proprietario/' + r })).join('')}
    ${row({ icon: 'log-out', title: 'Sair', on: 'acesso/boas-vindas' })}</div>`,
}));

/* Unidade do proprietário não residente (DS 11.10; RN-CD-19 a RN-CD-26, RN-RC-16, RN-VI-10) */
const dbr = s => s ? s.split('-').reverse().join('/') : '—';
function pedirLocacao(tipo) {
  const P = S.prop, novo = tipo === 'Cadastro de inquilino';
  sheet(() => `<h2 class="t-title-md">Pedir ${tipo.toLowerCase()}</h2>
    <p class="t-body-sm muted">O pedido vai para a administradora, que atende ou recusa com motivo. Você é avisada do resultado.</p>
    ${tipo === 'Renovação do contrato' ? field('Nova data de fim', input('pnf', { type: 'date', value: FORM.pnf ?? '2028-01-31' })) : ''}
    ${tipo === 'Encerramento do contrato' ? field('Data de saída da inquilina', input('pns', { type: 'date', value: FORM.pns ?? '2027-01-31' })) : ''}
    ${novo ? field('Nome do inquilino', input('pni', { ph: 'Ex.: Diego Ramos' })) + field('E-mail', input('pne', { type: 'email' })) + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${field('Início do contrato', input('pnini', { type: 'date', value: FORM.pnini ?? '2026-12-01' }))}${field('Fim do contrato', input('pnfim', { type: 'date', value: FORM.pnfim ?? '2027-11-30' }), { help: 'Em branco: prazo indeterminado.' })}</div>` : ''}
    ${field('Observação (opcional)', textarea('pnobs'))}
    ${btn('Enviar pedido', { block: true, on: () => {
      if (novo && !(FORM.pni || '').trim()) { toast('Informe o nome do inquilino.'); return; }
      const ini = FORM.pnini ?? '2026-12-01', fim = FORM.pnfim ?? '2027-11-30';
      if (novo && fim && fim <= ini) { toast('A data de fim precisa ser depois do início do contrato.'); return; }
      const det = tipo === 'Renovação do contrato' ? `${P.inq.nome} · até ${dbr(FORM.pnf ?? '2028-01-31')}` : tipo === 'Encerramento do contrato' ? `${P.inq.nome} · saída em ${dbr(FORM.pns ?? '2027-01-31')}` : `${FORM.pni} · contrato de ${dbr(ini)} a ${fim ? dbr(fim) : 'prazo indeterminado'}`;
      P.pedidos.unshift({ id: 'q' + uid(), tipo, det, estado: 'Pendente', data: '05/11' });
      S.solicitacoes.unshift({ id: 's' + uid(), tipo: tipo === 'Cadastro de inquilino' ? 'Cadastrar inquilino' : tipo, det: P.un + ' · ' + det, estado: 'Pendente', data: '05/11', por: 'Proprietária Helena Duarte' });
      closeLayer(); go('proprietario/solicitacoes'); setTimeout(() => toast('Pedido enviado à administradora.'), 50);
    } })}`);
}
def('proprietario', 'unidade', 'Minha unidade', 'Unidade (11.10)', () => {
  const P = S.prop, des = P.desocupada, dias = P.venceLogo ? 20 : P.inq.dias;
  const estado = des ? badge('Desocupada', 'neutral') : dias <= 30 ? badge(`Contrato vence em ${dias} dias`, 'warning') : badge('Alugada', 'info');
  const cob = S.cobrancasProp.find(c => (des || !c.inq) && ['Emitida', 'Em atraso'].includes(c.estado));
  return {
    tab: 'unidade', top: { title: P.un, actions: [{ icon: 'bell', label: 'Notificações', on: 'proprietario/notificacoes', dot: true }] },
    body: `<div class="stack">
      <h1 class="t-title-lg">Olá, Helena</h1>
      ${des ? card({ icon: 'house', title: 'Unidade desocupada', sub: 'Ninguém mora na unidade agora.', badge: estado, body: 'Você vota e responde pelas cobranças ordinárias e extraordinárias. Ninguém reserva, cadastra visitantes nem abre chamados pela unidade.' })
        : card({ icon: 'key-round', title: 'Alugada para ' + P.inq.nome, sub: `Contrato de ${P.inq.ini} a ${P.inq.fim} · ${P.inq.dependentes.length} dependente`, badge: estado,
          body: dias <= 30 ? `Faltam ${dias} dias para o fim. Sem renovação, o acesso da inquilina é desativado 7 dias depois do fim, e a unidade fica desocupada.` : 'A inquilina é a moradora habilitada: reserva, cadastra visitantes, abre chamados e responde pela unidade no dia a dia.',
          foot: btn('Pedir renovação', { v: 'secondary', size: 'sm', on: () => pedirLocacao('Renovação do contrato') }) + btn('Pedir encerramento', { v: 'text', size: 'sm', on: () => pedirLocacao('Encerramento do contrato') }) })}
      ${des ? btn('Pedir cadastro de inquilino', { block: true, icon: 'user-plus', on: () => pedirLocacao('Cadastro de inquilino') }) : ''}
      ${des && P.temporada ? card({ icon: 'luggage', title: 'Hóspedes de temporada', sub: P.hospedes.length ? P.hospedes.map(h => `${esc(h.nome)} · ${h.ent} a ${h.sai}`).join('<br>') : 'Nenhum hóspede cadastrado.', foot: btn('Cadastrar hóspede', { size: 'sm', icon: 'plus', on: 'proprietario/hospede-novo' }) }) : ''}
      <h2 class="t-title-sm section-title" style="margin-bottom:0">Para você</h2>
      ${cob ? card({ icon: 'receipt', title: 'Cobrança em aberto', sub: `${cob.ref} · vence em ${cob.venc}`, badge: st(cob.estado), body: `<span class="t-title-sm num">${money(cob.valor)}</span>`, on: 'proprietario/cobranca/' + cob.id }) : ''}
      ${card({ icon: 'vote', title: 'Votação aberta', sub: 'Assembleia geral ordinária · até 20/11 às 21h', badge: st('Votação aberta'), on: 'proprietario/reuniao/g1' })}
      <h2 class="t-title-sm section-title" style="margin-bottom:0">Ocorrências da unidade</h2>
      <div class="list list-full">${P.ocorrencias.map(o => row({ icon: 'message-square-warning', title: o.cat, sub: o.decisao + ' · ' + o.data, right: o.multa ? `<span class="num t-label-sm">${money(o.multa)}</span>` : '' })).join('')}</div>
      <p class="help" style="margin:0">Você vê só a categoria, a data, a decisão e a multa. A conversa e quem reclamou ficam com o julgador, e você não perde pontos.</p>
      ${banner('info', 'shield', 'Visitantes, reservas, chamados, encomendas e o score da inquilina não aparecem para você.', { inline: true })}
    </div>`,
  };
});
def('proprietario', 'solicitacoes', 'Solicitações', 'Unidade (11.10)', () => ({
  tab: 'menu', top: { title: 'Solicitações', back: 'proprietario/menu' }, flush: true,
  body: `<div class="list">${S.prop.pedidos.map(q => row({ icon: 'inbox', title: q.tipo, sub: q.det, sub2: 'Enviada em ' + q.data + (q.motivo ? ' · Motivo: ' + q.motivo : ''), right: st(q.estado) })).join('')}</div>
    <div class="pad">${btn('Simular: a administradora atendeu', { v: 'text', size: 'sm', on: () => { const q = S.prop.pedidos.find(x => x.estado === 'Pendente'); if (!q) { toast('Nenhum pedido pendente.'); return; } q.estado = 'Concluída'; rerender(); toast('A administradora atendeu o seu pedido.'); } })}</div>`,
}));
def('proprietario', 'hospede-novo', 'Cadastrar hóspede de temporada', 'Unidade (11.10)', () => {
  const P = S.prop, back = { title: 'Hóspede de temporada', back: 'proprietario/unidade' };
  if (!P.desocupada || !P.temporada) return { tab: 'unidade', top: back, body: empty('luggage', 'O cadastro de hóspedes só aparece em unidade desocupada, quando o condomínio permite aluguel por temporada. Use o painel “Simular”.') };
  return {
    tab: 'unidade', top: back,
    body: `<div class="stack-5">${field('Nome do hóspede', input('hn'))}${field('Documento (opcional)', input('hd'))}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${field('Entrada', input('he', { type: 'date', value: FORM.he ?? '2026-11-20' }))}${field('Saída', input('hs', { type: 'date', value: FORM.hs ?? '2026-11-23' }))}</div>
      ${banner('info', 'info', 'A portaria vê o hóspede marcado como “hóspede de temporada” entre a entrada e a saída. Reclamações sobre a estadia são feitas contra a unidade.', { inline: true })}</div>`,
    footer: btn('Cadastrar hóspede', { block: true, size: 'lg', on: () => {
      const e = FORM.he ?? '2026-11-20', s = FORM.hs ?? '2026-11-23';
      if (!(FORM.hn || '').trim()) { toast('Informe o nome do hóspede.'); return; }
      if (s <= e) { toast('A saída precisa ser depois da entrada.'); return; }
      P.hospedes.push({ nome: FORM.hn, ent: dbr(e), sai: dbr(s) }); resetForm(); go('proprietario/unidade'); setTimeout(() => toast('Hóspede cadastrado. A portaria já pode ver.'), 50);
    } }),
  };
});
