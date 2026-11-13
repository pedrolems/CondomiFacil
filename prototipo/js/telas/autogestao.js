'use strict';

const autogestaoExecuta = () => S.online && S.autogestao.ativa && (CUR.p === 'sindico' || (CUR.p === 'subsindico' && S.substituicao));
const administradorPresente = () => CUR.p === 'admin' && !S.autogestao.ativa;
function responsavelEleitoral() {
  const e = S.eleitoral;
  return e.sindico ? 'Síndico' : e.sub ? 'Subsíndico' : e.conselho ? 'Conselho fiscal' : e.designado ? 'Proprietário designado' : 'Aguardando designação';
}
function podeConduzirEleicao() {
  if (!S.online) return false;
  if (administradorPresente()) return true;
  const e = S.eleitoral;
  if (e.sindico) return CUR.p === 'sindico';
  if (e.sub) return CUR.p === 'subsindico';
  if (e.conselho) return CUR.p === 'morador' && S.conselho;
  return e.designado && e.designadoPerfil === CUR.p && (CUR.p === 'proprietario' || (CUR.p === 'morador' && !S.inquilino));
}

def(['admin', 'sindico', 'subsindico', 'morador', 'proprietario'], 'eleicoes', 'Conduzir eleição', 'Reuniões (11)', ctx => {
  const el = S.complementacao.eleicao, pode = podeConduzirEleicao();
  const concluir = tipo => {
    if (!podeConduzirEleicao() || !['Candidaturas abertas', 'Segundo turno'].includes(el.estado)) return;
    if (tipo === 'empate' && el.turno === 1) {
      el.turno = 2; el.estado = 'Segundo turno'; el.motivo = 'Empate no primeiro turno; segundo turno em até 7 dias.'; el.contagens = [10, 10];
    } else {
      el.estado = tipo === 'vencedor' ? 'Encerrada' : 'Inconclusiva';
      el.motivo = tipo === 'vencedor' ? 'Resultado agregado: candidatura A, 12 votos; candidatura B, 8 votos.' : tipo === 'empate' ? 'Segundo empate; tratamento pelo condomínio, sem vencedor automático.' : 'Nenhum elegível; tratamento pelo condomínio, sem vencedor automático.';
      el.contagens = tipo === 'vencedor' ? [12, 8] : tipo === 'empate' ? [10, 10] : [];
      S.eleitoral.designado = false;
    }
    registrarDecisao('Encerrar/apurar eleição', el.motivo); rerender();
  };
  return { nav: 'eleicoes', tab: 'gestao', top: { title: 'Conduzir eleição', back: ctx.p + (['sindico', 'subsindico'].includes(ctx.p) ? '/reunioes' : '/menu') }, body: `<div class="stack">${banner('info', 'vote', 'Responsável local: ' + responsavelEleitoral() + '. Válido em qualquer plano; a administradora presente também pode conduzir. Suporte exige Gestão + Suporte e autorização vigente.', { inline: true })}${card({ icon: 'vote', title: 'Eleição regular 2027–2028', badge: badge(el.estado, 'neutral', 'vote'), body: ['Encerrada', 'Inconclusiva', 'Segundo turno'].includes(el.estado) ? esc(el.motivo) : 'Votos secretos. Sem resultados parciais.', foot: !pode ? badge('Sem permissão de condução neste cenário', 'neutral', 'lock') : el.estado === 'Não aberta' ? btn('Abrir eleição', { on: () => { if (!podeConduzirEleicao() || el.estado !== 'Não aberta') return; el.estado = 'Candidaturas abertas'; registrarDecisao('Abrir eleição regular', 'Candidaturas abertas; responsável: ' + responsavelEleitoral()); rerender(); } }) : ['Candidaturas abertas', 'Segundo turno'].includes(el.estado) ? `<div class="stack-2">${btn('Encerrar com resultado simulado', { on: () => concluir('vencedor') })}${btn('Simular encerramento com empate', { v: 'secondary', on: () => concluir('empate') })}${btn('Simular ausência de elegível', { v: 'secondary', on: () => concluir('sem_elegivel') })}</div>` : '' })}<p class="help">Os controles laterais simulam disponibilidade e designação já validadas pelo condomínio. Não são um fluxo real de concessão de acesso. A designação só vale para esta eleição e termina no encerramento definitivo. Auditoria registra ações e autoria, sem vínculo entre eleitor e voto.</p></div>` };
});

def(['sindico', 'subsindico', 'morador'], 'autogestao', 'Administração em autogestão', 'Administração (4)', ctx => {
  if (!S.autogestao.ativa || (!autogestaoExecuta() && !(ctx.p === 'morador' && S.conselho))) return { body: empty('lock', 'Área indisponível para sua função ou modalidade atual.') };
  const executar = titulo => {
    if (!autogestaoExecuta()) return;
    FORM.agtexto = ''; FORM.agerro = '';
    const abrir = () => sheet(() => `<h2 class="t-title-md">${esc(titulo)}</h2><p class="help">Simulação de atribuição local. Campos e validações de cada operação serão revisados antes do MVP.</p>${field('Descrição da alteração simulada', textarea('agtexto'), { error: FORM.agerro })}${btn('Registrar simulação', { on: () => {
      if (!autogestaoExecuta()) return;
      if (!(FORM.agtexto || '').trim()) { FORM.agerro = 'Descreva a alteração.'; abrir(); return; }
      S.autogestao.registros.push({ titulo, descricao: FORM.agtexto.trim(), autor: PROFILES[CUR.p].name });
      registrarDecisao(titulo, FORM.agtexto.trim()); closeLayer(); rerender();
    } })}`); abrir();
  };
  return { tab: 'gestao', top: { title: 'Essencial · Autogestão', back: ctx.p + (ctx.p === 'morador' ? '/menu' : '/gestao') }, body: `<div class="stack">${banner('info', 'building-2', 'Sem administradora e sem Gestão + Suporte. Gestão e administração ficam no condomínio.', { inline: true })}${banner('neutral', 'clipboard-check', 'Distribuição proposta para revisão: síndico executa; subsíndico substitui; conselho fiscal acompanha e fiscaliza. Permissões detalhadas ainda serão validadas.', { inline: true })}${['Cadastros de unidades e pessoas', 'Áreas e regras de reserva', 'Cobranças e configuração financeira', 'Configuração cotidiana do condomínio'].map(t => card({ icon: 'settings', title: t, body: autogestaoExecuta() ? 'Execução local simulada, com auditoria.' : 'Fiscalização, sem edição de dados nem exposição de informações pessoais.', foot: autogestaoExecuta() ? btn('Simular alteração', { on: () => executar(t) }) : badge('Fiscalização', 'neutral', 'eye') })).join('')}${card({ icon: 'user-round-cog', title: 'Mandatos e substituições', body: 'Procedimento pendente de definição. Não permite autovalidar mandato nem conceder funções.' })}${btn('Conduzir eleição', { icon: 'vote', on: ctx.p + '/eleicoes' })}${autogestaoExecuta() ? btn('Finanças', { icon: 'wallet', on: ctx.p + '/financas' }) : ''}${S.autogestao.registros.map(r => card({ icon: 'history', title: r.titulo, sub: r.autor, body: ctx.p === 'morador' ? 'Alteração registrada; descrição administrativa restrita.' : esc(r.descricao) })).join('')}</div>` };
});

['sindico', 'subsindico'].forEach(p => {
  ['solicitacoes', 'solicitacao-nova'].forEach(t => {
    const anterior = SCREENS[p + '/' + t];
    SCREENS[p + '/' + t] = ctx => S.autogestao.ativa ? SCREENS[p + '/autogestao'](ctx) : anterior(ctx);
  });
});
