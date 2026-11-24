// RM-24: auditoria append-only, outbox (evento_saida) e requisicao_idempotente, como app_user real.
// Cada teste roda numa transação desfeita no fim (auditoria não aceita DELETE nem para limpeza).
import { randomUUID } from 'node:crypto';
import type { TransactionSql as Tx } from 'postgres';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { conectar } from '../../db/scripts/ambiente.js';
import { carregarCenario, condominio } from '../../db/seeds/fixtures.js';
import { amb, BANCO_TESTE } from './apoio.js';

const CENARIO = 'transversal-dois-condominios';
const A = condominio(CENARIO, 'a', { nome: 'Condomínio Transversal A (fictício)' });
const B = condominio(CENARIO, 'b', { nome: 'Condomínio Transversal B (fictício)' });
const USUARIO = '00000000-0000-5000-8000-0000000000aa';
const app = conectar(amb, 'app_user', BANCO_TESTE);
const ROLLBACK = new Error('rollback');

beforeAll(async () => {
  expect(['carregado', 'ja-pronto']).toContain(
    await carregarCenario(amb, { cenario: CENARIO, condominios: [A, B] }),
  );
});
afterAll(() => app.end());

/** Transação do app_user desfeita no fim; `ctx` troca o contexto local dentro dela. */
const desfeita = (fn: (tx: Tx, ctx: (id: string) => Promise<unknown>) => Promise<void>) =>
  expect(
    app.begin(async (tx) => {
      await fn(tx, (id) => tx`select set_config('app.condominio_id', ${id}, true)`);
      throw ROLLBACK;
    }),
  ).rejects.toBe(ROLLBACK);

const falha = (tx: Tx, code: string, q: (sp: Tx) => Promise<unknown>) =>
  expect(tx.savepoint((sp) => q(sp))).rejects.toMatchObject({ code });

const auditar = (q: Tx, cond: string, ref: string = randomUUID()) =>
  q`insert into condomifacil.auditoria
    (condominio_id, ator_usuario_id, papel_efetivo, acao, entidade_tipo, entidade_referencia, correlacao_operacao)
    values (${cond}, ${USUARIO}, 'sindico', 'teste', 'condominio', ${ref}, ${randomUUID()})`;
const evento = (q: Tx, cond: string, chave: string = randomUUID()) =>
  q`insert into condomifacil.evento_saida (condominio_id, tipo, entidade_referencia, carga_minima_restrita, chave_idempotencia)
    values (${cond}, 'teste.criado', ${randomUUID()}, '{"x":1}', ${chave})`;
const requisicao = (q: Tx, cond: string, chave: string = randomUUID()) =>
  q`insert into condomifacil.requisicao_idempotente (condominio_id, usuario_id, chave, metodo, rota, hash_corpo, status_http)
    values (${cond}, ${USUARIO}, ${chave}, 'POST', '/v1/teste', 'h1', 201)`;
const contar = async (q: Tx, tabela: string) =>
  (await q.unsafe<[{ n: number }]>(`select count(*)::int as n from condomifacil.${tabela}`))[0].n;

const TENANT: [string, typeof auditar][] = [
  ['auditoria', auditar],
  ['evento_saida', evento],
  ['requisicao_idempotente', requisicao],
];

test('isolamento nas 3 tabelas de tenant: A não lê as linhas de B nem insere em nome de B; sem contexto vê zero', async () => {
  for (const [tabela, inserir] of TENANT) {
    await desfeita(async (tx, ctx) => {
      await ctx(B.id);
      await inserir(tx, B.id);
      expect(await contar(tx, tabela)).toBe(1);
      await ctx(A.id);
      expect(await contar(tx, tabela)).toBe(0);
      await falha(tx, '42501', (sp) => inserir(sp, B.id));
      await inserir(tx, A.id);
      expect(await contar(tx, tabela)).toBe(1);
      await ctx('');
      expect(await contar(tx, tabela)).toBe(0);
      await falha(tx, '42501', (sp) => inserir(sp, A.id));
    });
  }
});

test('auditoria: exatamente uma origem (pessoa ou sistema)', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    const origem = (sp: Tx, ator: string | null, sistema: string | null) =>
      sp`insert into condomifacil.auditoria
        (condominio_id, ator_usuario_id, ator_sistema, papel_efetivo, acao, entidade_tipo, entidade_referencia, correlacao_operacao)
        values (${A.id}, ${ator}, ${sistema}, 'sistema', 'teste', 'x', 'r', 'c')`;
    await origem(tx, null, 'rotina.teste');
    await falha(tx, '23514', (sp) => origem(sp, USUARIO, 'rotina.teste'));
    await falha(tx, '23514', (sp) => origem(sp, null, null));
  });
});

test('auditoria: app_user não faz UPDATE, DELETE nem TRUNCATE (sem grant) e não informa registrada_em', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await auditar(tx, A.id);
    await falha(tx, '42501', (sp) => sp`update condomifacil.auditoria set motivo = 'x'`);
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.auditoria`);
    await falha(tx, '42501', (sp) => sp`truncate condomifacil.auditoria`);
    await falha(
      tx,
      '42501',
      (sp) => sp`insert into condomifacil.auditoria
        (condominio_id, ator_sistema, papel_efetivo, acao, entidade_tipo, entidade_referencia, correlacao_operacao, registrada_em)
        values (${A.id}, 's', 'p', 'a', 'e', 'r', 'c', '2000-01-01')`,
    );
  });
});

test('auditoria e auditoria_plataforma: com grant e política hipotéticos, o gatilho recusa UPDATE e DELETE', async () => {
  const su = conectar(amb, 'postgres', BANCO_TESTE);
  try {
    await expect(
      su.begin(async (tx) => {
        for (const tabela of ['auditoria', 'auditoria_plataforma']) {
          await tx.unsafe(`grant select, update, delete on condomifacil.${tabela} to app_user;
            create policy hipotetica on condomifacil.${tabela} to app_user using (true) with check (true)`);
        }
        await tx`set local role app_user`;
        await tx`select set_config('app.condominio_id', ${A.id}, true)`;
        await tx`select set_config('app.escopo', 'plataforma', true)`;
        await auditar(tx, A.id);
        await tx`insert into condomifacil.auditoria_plataforma (ator_usuario_id, acao, entidade_tipo, entidade_referencia)
          values (${USUARIO}, 'teste', 'condominio', ${A.id})`;
        for (const tabela of ['auditoria', 'auditoria_plataforma']) {
          for (const cmd of [
            `update condomifacil.${tabela} set acao = 'x'`,
            `delete from condomifacil.${tabela}`,
          ]) {
            await expect(tx.savepoint((sp) => sp.unsafe(cmd))).rejects.toMatchObject({
              code: 'P0001',
              message: expect.stringMatching(/somente inclusão/),
            });
          }
        }
        throw ROLLBACK;
      }),
    ).rejects.toBe(ROLLBACK);
  } finally {
    await su.end();
  }
});

test('auditoria_plataforma: app_user só insere com app.escopo = plataforma e não lê', async () => {
  const inserir = (sp: Tx) =>
    sp`insert into condomifacil.auditoria_plataforma (ator_usuario_id, acao, entidade_tipo, entidade_referencia)
      values (${USUARIO}, 'teste', 'condominio', ${A.id})`;
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await falha(tx, '42501', inserir);
    await tx`select set_config('app.escopo', 'sistema', true)`;
    await falha(tx, '42501', inserir);
    await tx`select set_config('app.escopo', 'plataforma', true)`;
    await inserir(tx);
    await falha(tx, '42501', (sp) => sp`select * from condomifacil.auditoria_plataforma`);
  });
});

test('chave duplicada dá 23505 em evento_saida e em requisicao_idempotente; outro condomínio pode repetir a chave', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await evento(tx, A.id, 'chave-1');
    await falha(tx, '23505', (sp) => evento(sp, A.id, 'chave-1'));
    await requisicao(tx, A.id, 'chave-1');
    await falha(tx, '23505', (sp) => requisicao(sp, A.id, 'chave-1'));
    await ctx(B.id);
    await evento(tx, B.id, 'chave-1');
    await requisicao(tx, B.id, 'chave-1');
  });
});

test('evento_saida: app_user publica e registra tentativa, mas não altera carga, chave nem condomínio, e não apaga', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await evento(tx, A.id, 'despacho');
    const [r] = await tx<[{ publicado_em: Date; tentativas: number }]>`
      update condomifacil.evento_saida set publicado_em = now(), tentativas = tentativas + 1,
        ultimo_erro_sanitizado = null
      where chave_idempotencia = 'despacho' returning publicado_em, tentativas`;
    expect(r.publicado_em).toBeInstanceOf(Date);
    expect(r.tentativas).toBe(1);
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.evento_saida set carga_minima_restrita = '{}'`,
    );
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.evento_saida set chave_idempotencia = 'y'`,
    );
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.evento_saida set condominio_id = ${B.id}`,
    );
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.evento_saida`);
    await falha(
      tx,
      '42501',
      (
        sp,
      ) => sp`insert into condomifacil.evento_saida (condominio_id, tipo, entidade_referencia, carga_minima_restrita, chave_idempotencia, publicado_em)
        values (${A.id}, 't', 'r', '{}', 'z', now())`,
    );
  });
});

test('evento_saida: escopo sistema, sem contexto de tenant, lista só os condomínios com pendência', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await evento(tx, A.id, 'pendente-a');
    await evento(tx, A.id, 'publicado-a');
    await tx`update condomifacil.evento_saida set publicado_em = now() where chave_idempotencia = 'publicado-a'`;
    await ctx(B.id);
    await evento(tx, B.id, 'publicado-b');
    await tx`update condomifacil.evento_saida set publicado_em = now() where chave_idempotencia = 'publicado-b'`;
    await ctx('');
    await tx`select set_config('app.escopo', 'sistema', true)`;
    const pend = await tx<{ condominio_id: string; chave_idempotencia: string }[]>`
      select condominio_id, chave_idempotencia from condomifacil.evento_saida`;
    expect(pend).toEqual([{ condominio_id: A.id, chave_idempotencia: 'pendente-a' }]);
    // Sistema não publica: o despacho volta ao contexto do condomínio.
    const sem = await tx`update condomifacil.evento_saida set publicado_em = now() returning id`;
    expect(sem).toHaveLength(0);
    // Escopo sistema com contexto de tenant não soma: B vê só o próprio (e nada pendente de A).
    await ctx(B.id);
    expect(
      (
        await tx<{ c: string }[]>`select chave_idempotencia as c from condomifacil.evento_saida`
      ).map((x) => x.c),
    ).toEqual(['publicado-b']);
  });
});

test('requisicao_idempotente: guarda de 24 h por padrão; só linha expirada é sobrescrita; sem DELETE', async () => {
  await desfeita(async (tx, ctx) => {
    await ctx(A.id);
    await requisicao(tx, A.id, 'vigente');
    const [g] = await tx<[{ horas: number }]>`
      select extract(epoch from expira_em - criada_em)::int / 3600 as horas
      from condomifacil.requisicao_idempotente where chave = 'vigente'`;
    expect(g.horas).toBe(24);
    const vigente = await tx`update condomifacil.requisicao_idempotente set hash_corpo = 'h2'
      where chave = 'vigente' returning chave`;
    expect(vigente).toHaveLength(0);

    await tx`insert into condomifacil.requisicao_idempotente
      (condominio_id, usuario_id, chave, metodo, rota, hash_corpo, status_http, criada_em, expira_em)
      values (${A.id}, ${USUARIO}, 'expirada', 'POST', '/v1/teste', 'h1', 201, now() - interval '25 hours', now() - interval '1 hour')`;
    const sobrescrita = await tx`update condomifacil.requisicao_idempotente
      set hash_corpo = 'h2', status_http = 200, resposta = '{"ok":true}', criada_em = now(),
          expira_em = now() + interval '24 hours'
      where chave = 'expirada' returning chave`;
    expect(sobrescrita).toHaveLength(1);
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.requisicao_idempotente set chave = 'outra'`,
    );
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.requisicao_idempotente`);
  });
});
