// Servidor de sync minimo da PoC P4 (so memoria, dados ficticios).
// Deduplica por op_id, confere a ordem por seq, e pode "cair" no meio de um lote.
import http from 'node:http';

export function criarEstado() {
  return {
    vistas: new Map(), // op_id -> resultado
    ordemAplicada: [], // seq na ordem de aplicacao
    ultimaSeq: 0,
    violacoesOrdem: 0,
    duplicatasRecebidas: 0,
    cancelados: new Set(), // visitante_id cancelado pelo morador
    ciclos: new Map(), // ciclo -> { efetiva: op, superadas: [] }
    falha: null, // { cair_apos, atraso_ms }
    resultadosApp: [],
    plano: null,
  };
}

// ADR-014 (proposta): vale o menor registrado_em; empate exato -> a que chegou primeiro (desempate estavel).
// O servidor NAO rejeita horario futuro nem passado (nenhum limite aprovado); so registra a distancia.
export function aplicarConclusao(est, op, recebidoEm) {
  const c = est.ciclos.get(op.carga.ciclo);
  const nova = { op_id: op.op_id, registrado_em: op.registrado_em, recebido_em: recebidoEm, desvio_ms: op.registrado_em - recebidoEm };
  if (!c) { est.ciclos.set(op.carga.ciclo, { efetiva: nova, superadas: [] }); return 'efetiva'; }
  if (op.registrado_em < c.efetiva.registrado_em) { c.superadas.push(c.efetiva); c.efetiva = nova; return 'efetiva_por_correcao'; }
  c.superadas.push(nova); // inclui empate exato: chegada anterior prevalece
  return 'superada';
}

export function processarOp(est, op, recebidoEm = Date.now()) {
  const ja = est.vistas.get(op.op_id);
  if (ja) { est.duplicatasRecebidas++; return ja; }
  if (op.seq <= est.ultimaSeq) est.violacoesOrdem++;
  est.ultimaSeq = Math.max(est.ultimaSeq, op.seq);
  est.ordemAplicada.push(op.seq);
  let r = { op_id: op.op_id, resultado: 'aplicada' };
  if (op.tipo === 'entrada_visitante' && est.cancelados.has(op.carga.visitante_id))
    r = { op_id: op.op_id, resultado: 'divergente', mensagem: `Visitante ${op.carga.visitante_id} foi cancelado pelo morador. Confirme por interfone.` };
  else if (op.tipo === 'conclusao_chamado') r.situacao = aplicarConclusao(est, op, recebidoEm);
  else if (op.tipo === 'invalida') r = { op_id: op.op_id, resultado: 'recusada', mensagem: 'carga invalida' };
  est.vistas.set(op.op_id, r);
  return r;
}

export function resumo(est) {
  return {
    unicas: est.vistas.size,
    duplicatasRecebidas: est.duplicatasRecebidas,
    violacoesOrdem: est.violacoesOrdem,
    ordemCrescente: est.ordemAplicada.every((s, i, a) => i === 0 || s > a[i - 1]),
    divergentes: [...est.vistas.values()].filter((r) => r.resultado === 'divergente').length,
    ciclos: Object.fromEntries([...est.ciclos].map(([k, v]) => [k, { efetiva: v.efetiva.op_id, superadas: v.superadas.length, efetiva_registrado_em: v.efetiva.registrado_em }])),
  };
}

const corpo = (req) => new Promise((ok) => { let s = ''; req.on('data', (d) => (s += d)); req.on('end', () => ok(s ? JSON.parse(s) : {})); });
const json = (res, obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

export function criarServidor(est = criarEstado()) {
  const srv = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    const b = req.method === 'POST' ? await corpo(req) : {};
    if (url === '/sync') {
      const resultados = [];
      let novas = 0;
      for (const op of b.ops) {
        const eraNova = !est.vistas.has(op.op_id);
        resultados.push(processarOp(est, op));
        if (eraNova) novas++;
        if (est.falha?.cair_apos && novas >= est.falha.cair_apos) {
          // aplicou parte do lote e derruba a conexao sem responder; `cair_vezes` > 1 vence a nova tentativa
          // automatica do OkHttp do React Native (sem isso o app nem enxerga a queda)
          est.falha.cair_vezes = (est.falha.cair_vezes ?? 1) - 1;
          if (est.falha.cair_vezes <= 0) est.falha = null;
          return req.socket.destroy();
        }
      }
      if (est.falha?.atraso_ms) await new Promise((r) => setTimeout(r, est.falha.atraso_ms));
      return json(res, { resultados });
    }
    if (url === '/admin/reset') { Object.assign(est, criarEstado(), { resultadosApp: est.resultadosApp }); return json(res, { ok: true }); }
    if (url === '/admin/falha') { est.falha = b; return json(res, { ok: true }); }
    if (url === '/admin/cancelar_visitante') { est.cancelados.add(b.id); return json(res, { ok: true }); }
    if (url === '/admin/plano') { est.plano = b.nome; return json(res, { ok: true }); }
    if (url === '/admin/estado') return json(res, resumo(est));
    if (url === '/plano') { const p = est.plano; est.plano = null; return json(res, { nome: p }); }
    if (url === '/resultado') { est.resultadosApp.push(b); console.log('RESULTADO', JSON.stringify(b)); return json(res, { ok: true }); }
    if (url === '/admin/resultados') return json(res, est.resultadosApp);
    json(res, { erro: 'nao encontrado' }, 404);
  });
  return srv;
}
