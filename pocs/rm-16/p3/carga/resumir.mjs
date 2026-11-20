// Mediana das rodadas em resultados/rodadas/r<N>-<driver>-<alvo>.json, em tabela Markdown.
// Uso: node carga/resumir.mjs
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../resultados/rodadas/', import.meta.url);
const grupos = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const r = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
  (grupos[`${r.driver} | ${r.alvo}`] ??= []).push(r);
}
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
console.log('| Driver | Ligação | Rodadas | Transações/s | p50 ms | p95 ms | p99 ms | máx ms | p95 visibilidade ms | máx visibilidade ms | erros | cruzamentos |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [k, rs] of Object.entries(grupos).sort()) {
  const m = (f) => med(rs.map(f));
  console.log(`| ${k} | ${rs.length} | ${m((r) => r.transacoesPorSegundo)} | ${m((r) => r.geral_ms.p50)} | ${m((r) => r.geral_ms.p95)} | ` +
    `${m((r) => r.geral_ms.p99)} | ${Math.max(...rs.map((r) => r.geral_ms.max))} | ${m((r) => r.visibilidadeNaPortaria_ms.p95)} | ` +
    `${Math.max(...rs.map((r) => r.visibilidadeNaPortaria_ms.max))} | ${rs.reduce((a, r) => a + r.erros, 0)} | ${rs.reduce((a, r) => a + r.cruzamentos, 0)} |`);
}
