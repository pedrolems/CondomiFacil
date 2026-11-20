// Custo da consulta de papel por requisicao contra o RNF-01 (95% < 500 ms). Grava resultados/carga.txt.
import { writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';
import { criarDb } from '../src/infra.ts';
import { PapelService } from '../src/papel.service.ts';
import { RelogioFalso, fx, get, login, subir } from './ambiente.ts';
import { sql } from 'kysely';

const linhas: string[] = [];
const pct = (v: number[], p: number) => [...v].sort((a, b) => a - b)[Math.min(v.length - 1, Math.floor(v.length * p))]!;
const resumo = (nome: string, v: number[]) => {
  const l = `${nome.padEnd(58)} n=${String(v.length).padStart(5)}  p50=${pct(v, 0.5).toFixed(2)} ms  p95=${pct(v, 0.95).toFixed(2)} ms  p99=${pct(v, 0.99).toFixed(2)} ms`;
  linhas.push(l); console.log(l); return pct(v, 0.95);
};
afterAll(async () => { writeFileSync(new URL('../resultados/carga.txt', import.meta.url), linhas.join('\n') + '\n'); await fx.end(); });

async function alvo() { // usuario da massa (20.000 vinculos, 250 condominios), com vinculo real
  const [v] = await fx`select u.id usuario, u.email, v.condominio_id from app.usuario u join app.vinculo v on v.usuario_id = u.id where u.email like 'massa%' limit 1`;
  await fx`update app.usuario set senha_hash = (select senha_hash from app.usuario where email like 'u-%' limit 1) where id = ${v!['usuario']}`;
  return { id: v!['usuario'] as string, email: v!['email'] as string, c: v!['condominio_id'] as string };
}

describe('RNF-01', () => {
  it('consulta de papel isolada (transacao + set_config + join, sob RLS), 2.000 vezes em sequencia', async () => {
    const { db, encerrar } = criarDb(10);
    const papeis = new PapelService(db, new RelogioFalso(), { origensWeb: [], cachePapelMs: 0, accessTtlS: 900, refreshTtlS: 1 });
    const u = await alvo();
    for (let i = 0; i < 200; i++) await papeis.consultar(u.id, u.c); // aquecimento
    const t: number[] = [];
    for (let i = 0; i < 2000; i++) { const t0 = performance.now(); await papeis.consultar(u.id, u.c); t.push(performance.now() - t0); }
    const p95 = resumo('consulta de papel isolada (sequencial)', t);
    expect(p95).toBeLessThan(500);
    const plano = await db.transaction().execute(async (tx) => {
      await sql`select set_config('app.usuario_id', ${u.id}, true), set_config('app.condominio_id', ${u.c}, true)`.execute(tx);
      return sql<{ 'QUERY PLAN': string }>`explain (analyze, costs off) select v.papel from app.vinculo v join app.condominio c on c.id = v.condominio_id
        where v.usuario_id = ${u.id} and v.condominio_id = ${u.c} and v.ativo`.execute(tx);
    });
    linhas.push('EXPLAIN (como app_user, com RLS):', ...plano.rows.map((r) => '  ' + r['QUERY PLAN']));
    await encerrar();
  });

  for (const [rotulo, cachePapelMs] of [['sem cache de papel (0 ms)', 0], ['com cache de papel (5.000 ms)', 5_000]] as const) {
    it(`requisicao HTTP completa GET /v1/recursos, ${rotulo}: 3.000 requisicoes, 20 em paralelo`, async () => {
      const s = await subir({ cachePapelMs });
      try {
        const u = await alvo(); const t = (await login(s.base, u.email)).json.access_token;
        s.relogio.t = Date.now(); // o cache usa o relogio falso; com ele parado, vale pelo teste inteiro
        for (let i = 0; i < 100; i++) await get(s.base, '/v1/recursos', t, u.c);
        const lat: number[] = []; let restantes = 3000; let falhas = 0;
        const t0 = performance.now();
        await Promise.all(Array.from({ length: 20 }, async () => {
          while (restantes-- > 0) {
            const a = performance.now(); const r = await get(s.base, '/v1/recursos', t, u.c); await r.arrayBuffer();
            if (r.status !== 200) falhas++; lat.push(performance.now() - a);
          }
        }));
        const seg = (performance.now() - t0) / 1000;
        const p95 = resumo(`GET /v1/recursos, ${rotulo}`, lat);
        linhas.push(`  vazao ${(lat.length / seg).toFixed(0)} req/s; falhas ${falhas}; consultas de papel ao banco: ${s.papel.consultas}`);
        expect(falhas).toBe(0);
        expect(p95).toBeLessThan(500);
      } finally { await s.fim(); }
    }, 120_000);
  }
});
