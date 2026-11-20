// P5b (RM-16): critérios do ADR-008 (linhas 68-70) para Kysely 0.29.9 e Drizzle 0.45.4, cada um com
// pg 8.23.1 e postgres.js 4.1.1, sobre o banco p5 migrado pelo Flyway. Sempre como app_user.
// Pré-requisito: node scripts/subir.mjs (fixtures fictícias de IDs fixos).
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { criarAcessoKysely } from '../src/acesso-kysely.ts';
import { criarAcessoDrizzle } from '../src/acesso-drizzle.ts';
import { repoKysely, repoDrizzle, type RepoReservas } from '../src/repositorios.ts';
import { reserva } from '../src/esquema-drizzle.ts';
import type { AcessoDados, Driver } from '../src/conexao.ts';
import { psql, esperar } from '../scripts/ambiente.mjs';

const A = '00000000-0000-4000-8000-00000000000a';
const B = '00000000-0000-4000-8000-00000000000b';
const AREA_A = '0000000a-0000-4000-8000-0000000000f1';
const UNID_A = '0000000a-0000-4000-8000-000000000101';
const UNID_A2 = '0000000a-0000-4000-8000-000000000102';
const AREA_B = '0000000b-0000-4000-8000-0000000000f1';
const UNID_B = '0000000b-0000-4000-8000-000000000101';
const RESERVA_A = '0000000a-0000-4000-8000-00000000e001';
const RESERVA_B = '0000000b-0000-4000-8000-00000000e001';

/** Código SQLSTATE, inclusive quando a biblioteca embrulha o erro (Drizzle: DrizzleQueryError.cause). */
const codigo = (e: unknown): string | undefined => {
  for (let x = e as { code?: string; cause?: unknown } | undefined; x; x = x.cause as typeof x) if (x.code) return x.code;
};
const nomes = (e: unknown): string[] => {
  const r: string[] = [];
  for (let x = e as { name?: string; cause?: unknown } | undefined; x; x = x.cause as typeof x) r.push(x.name ?? '');
  return r;
};
let dia = 0; // cada teste reserva um dia diferente de 2031, para não colidir entre combinações
const periodo = (hIni = 18, hFim = 22) => {
  dia++;
  const d = new Date(Date.UTC(2031, 0, 1 + dia)).toISOString().slice(0, 10);
  return `[${d} ${hIni}:00-03, ${d} ${hFim}:00-03)`;
};

type Combinacao = { biblioteca: 'kysely' | 'drizzle'; driver: Driver };
const COMBINACOES: Combinacao[] = [
  { biblioteca: 'kysely', driver: 'pg' }, { biblioteca: 'kysely', driver: 'postgres.js' },
  { biblioteca: 'drizzle', driver: 'pg' }, { biblioteca: 'drizzle', driver: 'postgres.js' },
];
const criar = (c: Combinacao, opcoes: { max?: number; nomeApp?: string } = {}) =>
  (c.biblioteca === 'kysely' ? criarAcessoKysely(c.driver, opcoes) : criarAcessoDrizzle(c.driver, opcoes)) as AcessoDados<any>;
const repoDe = (c: Combinacao) => (c.biblioteca === 'kysely' ? repoKysely : repoDrizzle) as RepoReservas<any>;

after(async () => { // limpa reservas criadas pelos testes (2031), como o preparador de fixtures
  await psql('p5', "delete from app.reserva where lower(periodo) >= '2031-01-01'; delete from app.reserva_auditoria where reserva_id not in (select id from app.reserva);");
});

for (const c of COMBINACOES) {
  describe(`${c.biblioteca} + ${c.driver}`, () => {
    const repo = repoDe(c);
    let db: AcessoDados<any>;
    before(() => { db = criar(c, { max: 5, nomeApp: `p5b-${c.biblioteca}-${c.driver}` }); });
    after(async () => { assert.deepEqual(db.violacoes(), [], 'nenhuma violação nos usos legítimos'); await db.encerrar(); });

    test('não abre conexão antes do primeiro comTenant (nem ao ser criado)', async () => {
      const nomeApp = `p5b-ocioso-${c.biblioteca}-${c.driver}`.slice(0, 60);
      const ocioso = criar(c, { max: 5, nomeApp });
      try {
        await esperar(500);
        assert.equal(await psql('postgres', `select count(*) from pg_stat_activity where application_name = '${nomeApp}'`), '0');
        await ocioso.comTenant({ condominioId: A }, (tx) => repo.listar(tx));
        assert.equal(await psql('postgres', `select count(*) from pg_stat_activity where application_name = '${nomeApp}'`), '1');
      } finally { await ocioso.encerrar(); }
    });

    test('transação com set_config local e consulta sob RLS: cada condomínio vê só o seu', async () => {
      const deA = await db.comTenant({ condominioId: A }, (tx) => repo.listar(tx));
      const deB = await db.comTenant({ condominioId: B }, (tx) => repo.listar(tx));
      assert.ok(deA.length >= 1 && deA.every((r) => r.condominioId === A), JSON.stringify(deA));
      assert.ok(deB.length >= 1 && deB.every((r) => r.condominioId === B), JSON.stringify(deB));
      assert.ok(deA.some((r) => r.id === RESERVA_A) && !deA.some((r) => r.id === RESERVA_B));
      const s = await db.comTenant({ condominioId: A }, (tx) => repo.sessao(tx));
      assert.equal(s.condominio, A, 'set_config aplicado dentro da transação');
    });

    test('escrita em outro condomínio é recusada pela RLS (42501) e a reserva alheia não é alterável', async () => {
      await assert.rejects(
        db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: B, areaId: AREA_B, unidadeId: UNID_B, periodo: periodo() })),
        (e) => codigo(e) === '42501');
      assert.equal(await db.comTenant({ condominioId: A }, (tx) => repo.cancelar(tx, RESERVA_B)), 0, 'UPDATE alheio = 0 linhas');
      // FK composta: unidade de B dentro de A também é recusada (23503).
      await assert.rejects(
        db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_B, periodo: periodo() })),
        (e) => codigo(e) === '23503');
    });

    test('EXCLUDE: sobreposição na mesma área é recusada (23P01); cancelada não bloqueia', async () => {
      const p = periodo(18, 22);
      const d = p.slice(1, 11);
      const id = await db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_A, periodo: p }));
      await assert.rejects(
        db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_A2, periodo: `[${d} 21:00-03, ${d} 23:00-03)` })),
        (e) => codigo(e) === '23P01');
      // Encostada (fim exclusivo) passa.
      await db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_A2, periodo: `[${d} 22:00-03, ${d} 23:00-03)` }));
      await db.comTenant({ condominioId: A }, (tx) => repo.cancelar(tx, id));
      await db.comTenant({ condominioId: A }, (tx) => repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_A2, periodo: `[${d} 18:00-03, ${d} 21:00-03)` }));
    });

    test('gatilho grava auditoria pela RLS do próprio condomínio; outro condomínio não a vê', async () => {
      const id = await db.comTenant({ condominioId: A }, async (tx) => {
        const novo = await repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId: UNID_A, periodo: periodo() });
        await repo.cancelar(tx, novo);
        return novo;
      });
      assert.deepEqual(await db.comTenant({ condominioId: A }, (tx) => repo.auditoria(tx, id)), [
        { acao: 'INSERT', estadoAntes: null, estadoDepois: 'confirmada' },
        { acao: 'UPDATE', estadoAntes: 'confirmada', estadoDepois: 'cancelada' },
      ]);
      assert.deepEqual(await db.comTenant({ condominioId: B }, (tx) => repo.auditoria(tx, id)), []);
    });

    test('concorrência: duas transações em conexões distintas na mesma faixa; exatamente uma vence', async () => {
      const p = periodo(10, 12);
      const tentar = (unidadeId: string) => db.comTenant({ condominioId: A }, async (tx) => {
        const id = await repo.criar(tx, { condominioId: A, areaId: AREA_A, unidadeId, periodo: p });
        const { pid } = await repo.sessao(tx);
        await repo.dormir(tx, 0.3); // segura a transação aberta para a outra colidir
        return { id, pid };
      });
      const r = await Promise.allSettled([tentar(UNID_A), tentar(UNID_A2)]);
      const ok = r.filter((x) => x.status === 'fulfilled');
      const falhas = r.filter((x): x is PromiseRejectedResult => x.status === 'rejected');
      assert.equal(ok.length, 1, JSON.stringify(r.map((x) => x.status)));
      assert.equal(codigo(falhas[0]!.reason), '23P01');
      const pids = await psql('p5', `select count(*) from app.reserva where periodo = '${p}'::tstzrange`);
      assert.equal(pids, '1', 'uma única reserva gravada');
    });

    test('conexão volta limpa ao pool: após commit, erro SQL e exceção JS (mesma conexão física)', async () => {
      const um = criar(c, { max: 1, nomeApp: `p5b-limpa-${c.biblioteca}-${c.driver}`.slice(0, 60) });
      try {
        const ler = async () => (await um.teste.bruto(
          "select nullif(current_setting('app.condominio_id', true), '') as c, pg_backend_pid() as pid, now() = statement_timestamp() as fora_de_tx"))[0]!;
        const { pid } = await um.comTenant({ condominioId: A }, (tx) => repo.sessao(tx));
        const depoisCommit = await ler();
        await assert.rejects(um.comTenant({ condominioId: A }, (tx) =>
          repo.criar(tx, { condominioId: B, areaId: AREA_B, unidadeId: UNID_B, periodo: periodo() })));
        const depoisErroSql = await ler();
        await assert.rejects(um.comTenant({ condominioId: A }, async (tx) => { await repo.listar(tx); throw new Error('falha da aplicação'); }), /falha da aplicação/);
        const depoisErroJs = await ler();
        for (const [nome, s] of Object.entries({ depoisCommit, depoisErroSql, depoisErroJs })) {
          assert.equal(Number(s.pid), pid, `${nome}: mesma conexão física`);
          assert.equal(s.c, null, `${nome}: sem contexto residual`);
        }
        // E a transação seguinte da mesma conexão funciona normalmente.
        assert.ok((await um.comTenant({ condominioId: B }, (tx) => repo.listar(tx))).every((r) => r.condominioId === B));
        assert.deepEqual(um.violacoes(), []);
      } finally { await um.encerrar(); }
    });

    test('controle negativo: set_config de SESSÃO vaza para a próxima transação e o teste detecta', async () => {
      const um = criar(c, { max: 1, nomeApp: `p5b-vaza-${c.biblioteca}-${c.driver}`.slice(0, 60) });
      try {
        await um.teste.bruto(`select set_config('app.condominio_id', '${A}', false)`);
        const [s] = await um.teste.bruto("select current_setting('app.condominio_id', true) as c");
        assert.equal(s!.c, A, 'vazou (é isso que o TenantContext proíbe)');
      } finally { await um.encerrar(); }
    });

    test('queda da conexão no meio da transação: o pool descarta e a próxima usa conexão nova', async () => {
      const um = criar(c, { max: 1, nomeApp: `p5b-queda-${c.biblioteca}-${c.driver}`.slice(0, 60) });
      try {
        let pidMorto = 0;
        await assert.rejects(um.comTenant({ condominioId: A }, async (tx) => {
          pidMorto = (await repo.sessao(tx)).pid;
          await psql('postgres', `select pg_terminate_backend(${pidMorto})`);
          return repo.listar(tx);
        }));
        const s = await um.comTenant({ condominioId: A }, (tx) => repo.sessao(tx));
        assert.notEqual(s.pid, pidMorto);
        assert.equal(s.condominio, A);
      } finally { await um.encerrar(); }
    });

    test('biblioteca usada fora do TenantContext é bloqueada antes de chegar ao banco', async () => {
      const um = criar(c, { max: 1, nomeApp: `p5b-fora-${c.biblioteca}-${c.driver}`.slice(0, 60) });
      try {
        const crua = um.teste.bibliotecaCrua as any;
        const tentativas: Array<[string, () => Promise<unknown>]> = c.biblioteca === 'kysely'
          ? [
              ['consulta direta', () => crua.selectFrom('app.reserva').selectAll().execute()],
              ['transação sem set_config', () => crua.transaction().execute((trx: any) => trx.selectFrom('app.reserva').selectAll().execute())],
            ]
          : [
              ['consulta direta', () => crua.select().from(reserva)],
              ['transação sem set_config', () => crua.transaction((tx: any) => tx.select().from(reserva))],
            ];
        for (const [nome, fn] of tentativas) {
          await assert.rejects(fn(), (e) => nomes(e).includes('ForaDoTenantContext'), nome);
        }
        assert.equal(um.violacoes().filter((v) => v.startsWith('consulta fora')).length, 2, um.violacoes().join('\n'));
        // O pool continua utilizável e o caminho legítimo funciona.
        assert.ok((await um.comTenant({ condominioId: A }, (tx) => repo.listar(tx))).length >= 1);
      } finally { await um.encerrar(); }
    });
  });
}

describe('kysely + pg: cancelamento de consulta', () => {
  test("com inflightQueryAbortStrategy 'cancel query' o Kysely abre um pg.Client FORA do pool; o padrão do acesso proíbe", async () => {
    let abertas = 0;
    class ClienteEspiao extends pg.Client { constructor(o: pg.ClientConfig) { super(o); abertas++; } }
    const espiao = criarAcessoKysely('pg', { max: 1, nomeApp: 'p5b-cancel-espiao', clienteDeControle: ClienteEspiao });
    const proibido = criarAcessoKysely('pg', { max: 1, nomeApp: 'p5b-cancel-proibido' });
    const { sql } = await import('kysely');
    const lenta = (db: AcessoDados<any>) => db.comTenant({ condominioId: A }, (tx) =>
      sql`select pg_sleep(1)`.execute(tx, { signal: AbortSignal.timeout(100), inflightQueryAbortStrategy: 'cancel query' } as never));
    try {
      await assert.rejects(lenta(espiao));
      await esperar(1500);
      assert.equal(abertas, 1, 'a biblioteca abriu 1 conexão fora do pool (sem set_config) para cancelar');
      const avisos: unknown[] = [];
      const errOriginal = console.error;
      console.error = (...a: unknown[]) => { avisos.push(a); };
      try {
        await assert.rejects(lenta(proibido));
        await esperar(1500);
      } finally { console.error = errOriginal; }
      // Com o construtor proibido não há conexão extra; a falha fica explícita (log do Kysely).
      assert.match(JSON.stringify(avisos.map(String)), /conexão de controle proibida/);
    } finally { await espiao.encerrar(); await proibido.encerrar(); }
  });
});
