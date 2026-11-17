'use strict';

function controlesDesignacao(ctx) {
  const e = S.eleitoral, g = S.governanca;
  if (!e.designado || e.designadoPerfil !== ctx.p) return '';
  const simular = acao => {
    if (!S.online || e.designadoPerfil !== CUR.p) return;
    if (acao === 'prorrogar') { if (!podeConduzirEleicao()) return; e.validade = g.dia + 30; }
    else if (acao === 'vencer') g.dia = e.validade;
    else e.designado = false;
    registrarDecisao('Designação eleitoral · ' + acao, 'Cenário fictício; nova validação independente simulada quando aplicável.'); rerender();
  };
  return card({ icon: 'calendar-clock', title: g.dia < e.validade ? 'Designação válida · ' + (e.validade - g.dia) + ' dias restantes' : 'Designação vencida', body: 'Permissão restrita a esta eleição. Prorrogação e substituição exigem validação; os botões abaixo apenas simulam essa validação.', foot: `<div class="stack-2">${btn('Simular prorrogação validada', { v: 'secondary', disabled: !podeConduzirEleicao(), on: () => simular('prorrogar') })}${btn('Simular vencimento', { v: 'secondary', on: () => simular('vencer') })}${btn('Simular cancelamento da eleição', { v: 'secondary', on: () => { if (!podeConduzirEleicao()) return; S.complementacao.eleicao.estado = 'Cancelada'; simular('cancelar'); } })}${btn('Simular substituição validada', { v: 'secondary', on: () => simular('substituir') })}</div>` });
}

const governancaConsulta = () => S.autogestao.ativa && (['sindico', 'subsindico'].includes(CUR.p) || (CUR.p === 'morador' && S.conselho));
const governancaAprovaConta = () => S.online && S.autogestao.ativa && !S.autogestao.semGestor && ((CUR.p === 'subsindico' && !S.substituicao) || (CUR.p === 'morador' && S.conselho));
function solicitarContaSimulada() {
  const g = S.governanca;
  if (!autogestaoExecuta()) return false;
  g.conta = 'Aguardando segunda aprovação'; g.solicitante = CUR.p;
  registrarDecisao('Solicitar troca de conta', 'Comprovação e reautenticação fictícias; conta vigente preservada.'); return true;
}
function aprovarContaSimulada() {
  const g = S.governanca;
  if (!governancaAprovaConta() || !g.segundo || g.solicitante === CUR.p || g.conta !== 'Aguardando segunda aprovação') return false;
  g.conta = 'Troca aprovada por representante independente';
  registrarDecisao('Aprovar troca de conta', 'Validação específica; não concede execução financeira geral.'); return true;
}
function operacaoManualSimulada(tipo, motivo, prova, reautenticado) {
  if (!autogestaoExecuta() || !motivo.trim() || !prova || !reautenticado) return false;
  S.governanca.operacoes.push({ tipo, motivo: motivo.trim() });
  registrarDecisao(tipo + ' manual simulado', motivo.trim()); return true;
}

def(['sindico', 'subsindico', 'morador'], 'procedimentos', 'Implantação e procedimentos', 'Administração (4)', ctx => {
  if (!governancaConsulta()) return { body: empty('lock', 'Disponível à gestão local e ao conselho na autogestão.') };
  const g = S.governanca;
  const simular = fn => { if (!governancaConsulta() || !S.online) return; fn(); rerender(); };
  const manual = tipo => { FORM.gmotivo = ''; FORM.gprova = []; FORM.greauth = []; FORM.gerro = ''; const abrir = () => sheet(() => `<h2 class="t-title-md">${esc(tipo)} · simulação</h2><p class="help">Sem dinheiro ou documentos reais. Regras de estorno, mês fechado e devolução obrigatória permanecem vigentes.</p>${field('Motivo', textarea('gmotivo'), { error: FORM.gerro })}${choice('gprova', 'ok', 'Comprovante fictício conferido', { multi: true })}${choice('greauth', 'ok', 'Reautenticação simulada concluída', { multi: true })}${btn('Registrar operação simulada', { on: () => { if (!operacaoManualSimulada(tipo, FORM.gmotivo || '', (FORM.gprova || []).includes('ok'), (FORM.greauth || []).includes('ok'))) { FORM.gerro = 'Informe motivo, comprovante e reautenticação.'; abrir(); return; } closeLayer(); rerender(); } })}`); abrir(); };
  return { tab: 'gestao', top: { title: 'Implantação e procedimentos', back: ctx.p + '/autogestao' }, body: `<div class="stack">
    ${banner('info', 'flask-conical', 'Somente dados fictícios. Operador oficial não nomeado; nomeação antes do primeiro condomínio oficial. Nenhum operador real foi nomeado.', { inline: true })}
    ${card({ icon: 'file-check', title: 'Identidade e representação', badge: badge(g.verificacao, 'neutral', 'clipboard-check'), body: 'Identidade + condomínio + ata/termo do evento: eleição/posse, designação, renúncia ou destituição. Contratação profissional acrescenta contrato e autorização. Documentos insuficientes exigem complemento, sem concessão provisória. Resultado/posse pelo condutor não interessado; exceções por representante independente ou verificação restrita do Admin, sem acesso à gestão, reclamações ou scores.', foot: `<div class="stack-2">${btn('Simular documentos suficientes', { v: 'secondary', on: () => simular(() => { g.documentos = true; g.verificacao = 'Aguardando verificação independente'; }) })}${btn('Simular recusa motivada', { v: 'secondary', on: () => simular(() => { g.documentos = false; g.verificacao = 'Complementar prova de representação'; }) })}${btn('Simular verificação independente', { disabled: !g.documentos, on: () => simular(() => { if (g.documentos) { g.verificacao = 'Verificação fictícia concluída'; registrarDecisao('Verificação independente fictícia', 'Documentos do evento conferidos; nenhum poder real concedido.'); } }) })}${btn('Simular contestação', { v: 'secondary', on: () => simular(() => { g.contestada = true; }) })}</div>` })}
    ${g.contestada ? banner('neutral', 'scale', 'Contestação aguarda revisão independente. Alegação isolada não suspende poder automaticamente; decisão exige análise de evidências. Sem prazo de atendimento prometido.', { inline: true }) : ''}
    ${card({ icon: 'calendar-range', title: 'Ausência, vacância e conselho', body: 'Ausência programada registrada pelo titular com início/fim e término na data ou retorno registrado. Emergência/vacância: prova e dois representantes independentes do beneficiário; sem acesso/composição, verificação restrita do Admin. Conselho designa representante e substituto por documento para cada eleição; substituto assume após impedimento registrado. Sem gestor habilitado, somente rotinas automáticas e eleição continuam; tarefas administrativas aguardam responsável.' })}
    ${card({ icon: 'landmark', title: 'Troca da conta recebedora', badge: badge(g.conta, 'neutral', 'shield-check'), body: 'Solicitação com comprovação, motivo e reautenticação simulados. Subsíndico fora da substituição ou conselho podem apenas aprovar como segundo representante independente. Sem segundo, aguarda; recebimentos seguem na conta vigente.', foot: `<div class="stack-2">${autogestaoExecuta() ? btn('Simular solicitação de troca', { on: () => simular(solicitarContaSimulada) }) : ''}${governancaAprovaConta() ? btn('Aprovar como segundo representante', { disabled: !g.segundo || g.conta !== 'Aguardando segunda aprovação', on: () => simular(aprovarContaSimulada) }) : ''}${btn('Segundo representante: ' + (g.segundo ? 'disponível' : 'ausente'), { v: 'secondary', on: () => simular(() => { g.segundo = !g.segundo; }) })}</div>` })}
    ${card({ icon: 'receipt', title: 'Baixas, cancelamentos e devoluções', body: 'Executor vigente, motivo, comprovante, reautenticação e auditoria. Nenhum pagamento, baixa ou reembolso real é realizado aqui.', foot: autogestaoExecuta() ? `<div class="stack-2">${['Baixa', 'Cancelamento', 'Devolução'].map(t => btn('Simular ' + t.toLowerCase(), { v: 'secondary', on: () => manual(t) })).join('')}</div>` : badge('Sem execução financeira', 'neutral', 'lock') })}
    ${card({ icon: 'scale', title: g.julgador ? 'Julgador elegível disponível' : 'Aguardando julgador elegível', body: 'Sem pessoa imparcial, reclamação/recurso aguarda com aviso; sem punição, julgamento ou encerramento automático pela espera. Suporte não acessa reclamações ou scores.', foot: btn('Simular ' + (g.julgador ? 'ausência' : 'disponibilidade') + ' de julgador', { v: 'secondary', on: () => simular(() => { g.julgador = !g.julgador; }) }) })}
    ${card({ icon: 'replace', title: 'Transição assistida de modalidade', badge: badge(g.transicao, 'neutral', 'clock'), body: 'Verificar autoridade solicitante e representação de destino, vigência, filas, arquivos e histórico; revogar acesso anterior na efetivação. Admin apenas verifica com capacidade restrita; gestão local valida entrega. Cobrança comercial mantém regras próprias. Sem autoridade, recuperar acesso primeiro.', foot: autogestaoExecuta() ? btn('Simular preparação da transição', { v: 'secondary', on: () => simular(() => { g.transicao = 'Aguardando verificação e entrega das pendências'; registrarDecisao('Preparar transição fictícia', 'Nenhuma mudança de modalidade ou acesso efetivada.'); }) }) : '' })}
    ${card({ icon: 'mail', title: 'Atendimento do Essencial', body: 'E-mail técnico/comercial, separado da administração do condomínio. Responsável e endereço serão definidos antes da operação oficial. Recuperação segue verificação restrita; sem franquia administrativa ou cobrança avulsa presumida.' })}
    ${g.operacoes.map(o => card({ icon: 'history', title: o.tipo + ' simulada', body: ctx.p === 'morador' ? 'Registro disponível à fiscalização conforme seu acesso.' : esc(o.motivo) })).join('')}
  </div>` };
});
