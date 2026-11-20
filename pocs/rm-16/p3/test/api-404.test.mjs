// 404 e não 403 (ADR-001 linha 75; CT-IS-01): ID de outro condomínio é indistinguível de inexistente.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { criarTenantDb } from '../src/tenant-db.mjs';
import { criarApi } from '../src/api.mjs';
import { A, visitaHoje } from '../src/ids.mjs';

let db, api, base;
before(async () => {
  db = criarTenantDb('pg', 'direto', { max: 2 });
  api = criarApi(db).listen(0, '127.0.0.1');
  await once(api, 'listening');
  base = `http://127.0.0.1:${api.address().port}`;
});
after(async () => { api.close(); await db.encerrar(); });

const get = async (id, condominio = A) => {
  const r = await fetch(`${base}/v1/visitas/${id}`, { headers: { 'x-condominio-id': condominio } });
  return { status: r.status, corpo: await r.text() };
};

test('recurso próprio = 200; de outro condomínio, inexistente e malformado = 404 idênticos', async () => {
  assert.equal((await get(visitaHoje(1, 1))).status, 200);
  const deB = await get(visitaHoje(2, 1));
  const inexistente = await get('00000000-0000-4000-8000-000000000000');
  const malformado = await get('nao-e-uuid');
  assert.equal(deB.status, 404);
  assert.deepEqual(deB, inexistente);
  assert.deepEqual(deB, malformado);
  console.log('  resposta para ID de B:', deB.status, deB.corpo);
});
