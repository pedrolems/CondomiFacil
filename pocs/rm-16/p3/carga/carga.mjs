// Carga RNF-17 com RLS ativa: condomínio de 5.000 unidades e 10 portarias simultâneas, mais
// moradores criando visitas e ruído de outros condomínios. Perfil "pior caso": sem tempo de pensar.
// Uso: node carga/carga.mjs <pg|postgres.js> <direto|pooler> [segundos=30] [pool=20]
// Mede a latência da transação inteira do TenantContext (espera no pool + BEGIN + set_config +
// consulta + COMMIT), checa isolamento em cada resposta e grava resultados/carga-<driver>-<alvo>.json.
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import pg from 'pg';
import { criarTenantDb, ALVOS } from '../src/tenant-db.mjs';
import { A, condominio, unidade, portaria, visitaHoje } from '../src/ids.mjs';

const [driver = 'pg', alvo = 'direto', segundos = '30', poolMax = '20'] = process.argv.slice(2);
const PORTARIAS = 10, MORADORES = 20, OUTROS = 20;

const SQL = {
  lista: `select id, condominio_id, estado from app.visita
          where dia = current_date and estado in ('esperada', 'dentro')
          order by criada_em desc limit 50`,
  entrada: `update app.visita set estado = 'dentro', entrada_em = now(), portaria_entrada_id = $1
            where id = $2 and estado = 'esperada' returning id`,
  criar: `insert into app.visita (condominio_id, unidade_id, nome_visitante, dia)
          values ($1, $2, $3, current_date) returning id`,
  daUnidade: `select id, condominio_id, unidade_id, nome_visitante, dia, estado from app.visita
              where unidade_id = $1 and dia >= current_date - 30 order by dia desc limit 20`,
  porId: `select id, condominio_id from app.visita where id = $1`,
};

// Pseudoaleatório determinístico (LCG) por trabalhador.
const lcg = (semente) => () => (semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648;

const lat = Object.fromEntries(Object.keys(SQL).map((k) => [k, []]));
const visibilidade = [];
const criadas = new Map(); // id -> instante do commit
let cruzamentos = 0, erros = 0, conflitosEntrada = 0;
const errosAmostra = [];

const db = criarTenantDb(driver, alvo, { max: Number(poolMax) });
const fim = performance.now() + Number(segundos) * 1000;
const inicioRelogio = new Date();

async function medir(nome, ctx, fn) {
  const t0 = performance.now();
  try {
    const r = await db.comTenant(ctx, fn);
    lat[nome].push(performance.now() - t0);
    return r;
  } catch (e) {
    erros++;
    if (errosAmostra.length < 5) errosAmostra.push(`${nome}: ${e.code ?? ''} ${e.message}`);
    return null;
  }
}

async function portariaA(p) {
  const rnd = lcg(p + 1);
  const ctx = { condominioId: A, papel: 'porteiro' };
  while (performance.now() < fim) {
    const linhas = await medir('lista', ctx, (q) => q(SQL.lista));
    if (!linhas) continue;
    const agora = performance.now();
    for (const l of linhas) {
      if (l.condominio_id !== A) cruzamentos++;
      const t = criadas.get(l.id);
      if (t !== undefined) { visibilidade.push(agora - t); criadas.delete(l.id); }
    }
    const esperadas = linhas.filter((l) => l.estado === 'esperada');
    if (!esperadas.length) continue;
    const alvoId = esperadas[Math.floor(rnd() * esperadas.length)].id;
    const r = await medir('entrada', ctx, (q) => q(SQL.entrada, [portaria(1, p + 1), alvoId]));
    if (r && r.length === 0) conflitosEntrada++; // outra portaria registrou antes
  }
}

async function moradorA(m) {
  const rnd = lcg(1000 + m);
  let i = 0;
  while (performance.now() < fim) {
    const un = unidade(1, 1 + Math.floor(rnd() * 5000));
    const ctx = { condominioId: A, unidadeId: un, papel: 'morador' };
    const r = await medir('criar', ctx, (q) => q(SQL.criar, [A, un, `Carga ${m}-${i++}`]));
    if (r) criadas.set(r[0].id, performance.now());
    const lista = await medir('daUnidade', ctx, (q) => q(SQL.daUnidade, [un]));
    if (lista) cruzamentos += lista.filter((l) => l.condominio_id !== A || l.unidade_id !== un).length;
  }
}

async function outroCondominio(o) {
  const rnd = lcg(5000 + o);
  while (performance.now() < fim) {
    const i = 2 + Math.floor(rnd() * 99);
    const ctx = { condominioId: condominio(i), papel: 'porteiro' };
    const linhas = await medir('lista', ctx, (q) => q(SQL.lista));
    if (linhas) cruzamentos += linhas.filter((l) => l.condominio_id !== condominio(i)).length;
    // Tentativa de ler visita do condomínio A pelo ID, sob carga: tem de voltar vazia.
    const alheia = await medir('porId', ctx, (q) => q(SQL.porId, [visitaHoje(1, 1 + Math.floor(rnd() * 10000))]));
    if (alheia) cruzamentos += alheia.length;
  }
}

const pct = (arr, p) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return +s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)].toFixed(2);
};
const resumo = (arr) => ({ n: arr.length, p50: pct(arr, 50), p95: pct(arr, 95), p99: pct(arr, 99), max: pct(arr, 100) });

await Promise.all([
  ...Array.from({ length: PORTARIAS }, (_, p) => portariaA(p)),
  ...Array.from({ length: MORADORES }, (_, m) => moradorA(m)),
  ...Array.from({ length: OUTROS }, (_, o) => outroCondominio(o)),
]);
await db.encerrar();

const todas = Object.values(lat).flat();
const resultado = {
  driver, alvo, segundos: Number(segundos), pool: Number(poolMax),
  trabalhadores: { portariasA: PORTARIAS, moradoresA: MORADORES, outrosCondominios: OUTROS },
  inicio: inicioRelogio.toISOString(),
  transacoesPorSegundo: +(todas.length / Number(segundos)).toFixed(1),
  geral_ms: resumo(todas),
  porOperacao_ms: Object.fromEntries(Object.entries(lat).map(([k, v]) => [k, resumo(v)])),
  visibilidadeNaPortaria_ms: resumo(visibilidade),
  criadasNaoVistas: criadas.size,
  conflitosEntrada, erros, errosAmostra, cruzamentos,
  rnf01_p95_abaixo_de_500ms: pct(todas, 95) < 500,
};
console.log(JSON.stringify(resultado, null, 2));
writeFileSync(new URL(`../resultados/carga-${driver.replace('.', '')}-${alvo}.json`, import.meta.url), JSON.stringify(resultado, null, 2));

// Limpeza do ambiente para a próxima rodada ficar comparável (ferramenta do teste, superusuário
// local; a API nunca recebe essa credencial): remove visitas da carga e desfaz entradas registradas.
const su = new pg.Client({ ...ALVOS.direto, database: 'p3', user: 'postgres', password: 'postgres_local_ficticia' });
await su.connect();
await su.query("delete from app.visita where nome_visitante like 'Carga %'");
await su.query(`update app.visita set estado = 'esperada', entrada_em = null, portaria_entrada_id = null
                where dia = current_date and entrada_em >= $1::timestamptz - interval '5 minutes'`, [inicioRelogio]);
await su.query('vacuum analyze app.visita');
await su.end();
if (cruzamentos > 0) process.exitCode = 1;
