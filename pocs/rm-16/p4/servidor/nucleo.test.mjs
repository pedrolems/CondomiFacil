import test from 'node:test';
import assert from 'node:assert/strict';
import { criarEstado, processarOp, resumo } from './nucleo.mjs';

const op = (seq, id, tipo = 'entrada_visitante', carga = {}, t = 0) => ({ seq, op_id: id, tipo, carga, registrado_em: t });

test('reenvio nao duplica', () => {
  const e = criarEstado();
  processarOp(e, op(1, 'a')); processarOp(e, op(1, 'a'));
  assert.equal(resumo(e).unicas, 1);
  assert.equal(resumo(e).duplicatasRecebidas, 1);
});

test('ordem: seq fora de ordem e contada', () => {
  const e = criarEstado();
  processarOp(e, op(2, 'b')); processarOp(e, op(1, 'a'));
  assert.equal(resumo(e).violacoesOrdem, 1);
});

test('divergencia quando o visitante foi cancelado', () => {
  const e = criarEstado(); e.cancelados.add('v1');
  assert.equal(processarOp(e, op(1, 'a', 'entrada_visitante', { visitante_id: 'v1' })).resultado, 'divergente');
});

test('ADR-014: menor registrado_em vence, mesmo chegando depois; empate fica com a primeira a chegar', () => {
  const e = criarEstado();
  processarOp(e, op(1, 'tarde', 'conclusao_chamado', { ciclo: 'c1' }, 2000));
  processarOp(e, op(2, 'cedo', 'conclusao_chamado', { ciclo: 'c1' }, 1000));
  assert.equal(resumo(e).ciclos.c1.efetiva, 'cedo');
  processarOp(e, op(3, 'empate', 'conclusao_chamado', { ciclo: 'c1' }, 1000));
  assert.equal(resumo(e).ciclos.c1.efetiva, 'cedo');
  assert.equal(resumo(e).ciclos.c1.superadas, 2);
});
