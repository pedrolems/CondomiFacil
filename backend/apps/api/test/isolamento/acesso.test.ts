// RM-20: usuario, plano de autenticação (sessao, desafio_acesso, controle_login), documentos e
// aceites e parametro_condominio, como app_user e app_autenticacao reais. Cada teste roda numa
// transação desfeita no fim, salvo a carga inicial e os testes de concorrência.
import type { Sql, TransactionSql as Tx } from 'postgres';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { conectar } from '../../db/scripts/ambiente.js';
import {
  aceite,
  carregarCenario,
  condominio,
  documento,
  documentoVersao,
  SENHA_HASH_FICTICIA,
  usuario,
} from '../../db/seeds/fixtures.js';
import { amb, BANCO_TESTE } from './apoio.js';

const CENARIO = 'acesso-rm20';
const A = condominio(CENARIO, 'a', { nome: 'Condomínio Acesso A (fictício)' });
const B = condominio(CENARIO, 'b', { nome: 'Condomínio Acesso B (fictício)' });
const U1 = usuario(CENARIO, 'u1', { estado: 'ativo', senha_hash: SENHA_HASH_FICTICIA });
const U2 = usuario(CENARIO, 'u2', { estado: 'ativo', senha_hash: SENHA_HASH_FICTICIA });
const TERMOS = documento(CENARIO, 'termos', { tipo: 'termos_de_uso', titulo: 'Termos (fictício)' });
const REG_A = documento(CENARIO, 'regimento-a', {
  tipo: 'regimento',
  condominio_id: A.id,
  titulo: 'Regimento A (fictício)',
});
const REG_B = documento(CENARIO, 'regimento-b', {
  tipo: 'regimento',
  condominio_id: B.id,
  titulo: 'Regimento B (fictício)',
});
const TERMOS_V1 = documentoVersao(CENARIO, TERMOS, 1);
const TERMOS_V2 = documentoVersao(CENARIO, TERMOS, 2);
const REG_A_V1 = documentoVersao(CENARIO, REG_A, 1);
const REG_B_V1 = documentoVersao(CENARIO, REG_B, 1);
const ACEITE_U2 = aceite(CENARIO, U2, TERMOS_V1);
// Definição real da carga da RN 13 (id derivado da chave na migration de carga).
const DEF_SCORE = 'score.pontos_leve';

const app = conectar(amb, 'app_user', BANCO_TESTE);
const aut = conectar(amb, 'app_autenticacao', BANCO_TESTE);
const ROLLBACK = new Error('rollback');

beforeAll(async () => {
  expect(['carregado', 'ja-pronto']).toContain(
    await carregarCenario(amb, {
      cenario: CENARIO,
      condominios: [A, B],
      usuarios: [U1, U2],
      documentos: [TERMOS, REG_A, REG_B],
      documentoVersoes: [TERMOS_V1, TERMOS_V2, REG_A_V1, REG_B_V1],
      aceites: [ACEITE_U2],
    }),
  );
});
afterAll(async () => {
  await app.end();
  await aut.end();
});

interface Ctx {
  usuario?: string;
  condominio?: string;
}
type ComCtx = (c: Ctx) => Promise<unknown>;

/** Transação desfeita no fim; `ctx` troca o contexto local (vazio = sem contexto). */
const desfeita = (sql: Sql, fn: (tx: Tx, ctx: ComCtx) => Promise<void>) =>
  expect(
    sql.begin(async (tx) => {
      await fn(
        tx,
        (c) =>
          tx`select set_config('app.usuario_id', ${c.usuario ?? ''}, true),
                    set_config('app.condominio_id', ${c.condominio ?? ''}, true)`,
      );
      throw ROLLBACK;
    }),
  ).rejects.toBe(ROLLBACK);

const falha = (tx: Tx, code: string, q: (sp: Tx) => Promise<unknown>) =>
  expect(tx.savepoint((sp) => q(sp))).rejects.toMatchObject({ code });

const ids = async (tx: Tx, tabela: string) =>
  (await tx.unsafe<{ id: string }[]>(`select id from condomifacil.${tabela} order by id`)).map(
    (r) => r.id,
  );

// usuario ----------------------------------------------------------------------------------------

test('usuario: o titular vê só a própria linha; sem titular vê zero', async () => {
  await desfeita(app, async (tx, ctx) => {
    await ctx({ usuario: U1.id });
    expect(await ids(tx, 'usuario')).toEqual([U1.id]);
    await ctx({ usuario: U2.id, condominio: A.id });
    expect(await ids(tx, 'usuario')).toEqual([U2.id]);
    await ctx({ condominio: A.id });
    expect(await ids(tx, 'usuario')).toEqual([]);
  });
});

test('usuario: app_user não lê senha_hash, não altera estado nem e-mail, muda só o próprio tema, não insere nem apaga', async () => {
  await desfeita(app, async (tx, ctx) => {
    await ctx({ usuario: U1.id });
    await falha(tx, '42501', (sp) => sp`select senha_hash from condomifacil.usuario`);
    await falha(tx, '42501', (sp) => sp`select * from condomifacil.usuario`);
    await falha(tx, '42501', (sp) => sp`update condomifacil.usuario set estado = 'desativado'`);
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.usuario set email_normalizado = 'x@exemplo.test'`,
    );
    await falha(tx, '42501', (sp) => sp`update condomifacil.usuario set senha_hash = 'x'`);
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.usuario`);
    await falha(
      tx,
      '42501',
      (sp) => sp`insert into condomifacil.usuario (nome, email_normalizado)
        values ('Novo', 'novo@exemplo.test')`,
    );
    const proprio =
      await tx`update condomifacil.usuario set tema_preferido = 'escuro' returning id`;
    expect(proprio.map((r) => r.id)).toEqual([U1.id]);
    const outro = await tx`update condomifacil.usuario set tema_preferido = 'claro'
      where id = ${U2.id} returning id`;
    expect(outro).toHaveLength(0);
    await falha(tx, '23514', (sp) => sp`update condomifacil.usuario set tema_preferido = 'azul'`);
  });
});

test('usuario: app_autenticacao lê e grava só as colunas de credencial', async () => {
  await desfeita(aut, async (tx) => {
    const [l] = await tx<[{ senha_hash: string; estado: string }]>`
      select senha_hash, estado from condomifacil.usuario where email_normalizado = ${U1.email_normalizado}`;
    expect(l).toEqual({ senha_hash: SENHA_HASH_FICTICIA, estado: 'ativo' });
    const r =
      await tx`update condomifacil.usuario set senha_hash = 'novo-hash', estado = 'desativado'
      where id = ${U1.id} returning id`;
    expect(r).toHaveLength(1);
    await falha(tx, '42501', (sp) => sp`select nome from condomifacil.usuario`);
    await falha(tx, '42501', (sp) => sp`update condomifacil.usuario set tema_preferido = 'claro'`);
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.usuario set email_normalizado = 'x@exemplo.test'`,
    );
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.usuario`);
    await falha(
      tx,
      '42501',
      (sp) =>
        sp`insert into condomifacil.usuario (nome, email_normalizado) values ('N', 'n@exemplo.test')`,
    );
  });
});

test('usuario: constraints de estado, senha, e-mail normalizado e anonimização', async () => {
  const fx = conectar(amb, 'fixtures', BANCO_TESTE);
  try {
    await desfeita(fx, async (tx) => {
      const ins = (sp: Tx, u: Record<string, unknown>) =>
        sp`insert into condomifacil.usuario ${sp({ nome: 'Teste', ...u })}`;
      await falha(tx, '23514', (sp) => ins(sp, { email_normalizado: 'Maiuscula@exemplo.test' }));
      await falha(tx, '23514', (sp) =>
        ins(sp, { email_normalizado: 'a@exemplo.test', estado: 'ativo' }),
      );
      await falha(tx, '23514', (sp) =>
        ins(sp, { email_normalizado: 'b@exemplo.test', senha_hash: 'h' }),
      );
      await falha(tx, '23514', (sp) => ins(sp, {})); // identificável sem e-mail
      await falha(tx, '23514', (sp) =>
        ins(sp, { email_normalizado: 'c@exemplo.test', anonimizado_em: new Date() }),
      );
      await falha(tx, '23505', (sp) => ins(sp, { email_normalizado: U1.email_normalizado }));
      // Anonimizado libera o e-mail e fica desativado, sem e-mail nem senha.
      await ins(tx, { estado: 'desativado', anonimizado_em: new Date() });
    });
  } finally {
    await fx.end();
  }
});

// plano de autenticação ----------------------------------------------------------------------

const AUTENTICACAO = ['sessao', 'desafio_acesso', 'controle_login'];

test('app_user não tem nenhum privilégio em sessao, desafio_acesso e controle_login', async () => {
  for (const t of AUTENTICACAO) {
    await expect(app.unsafe(`select 1 from condomifacil.${t}`)).rejects.toMatchObject({
      code: '42501',
    });
    await expect(app.unsafe(`delete from condomifacil.${t}`)).rejects.toMatchObject({
      code: '42501',
    });
  }
});

test('app_autenticacao: só usuario e as três tabelas de autenticação; nenhuma tabela de tenant', async () => {
  const comPrivilegio = await aut<{ t: string }[]>`
    select c.relname::text as t from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'condomifacil' and c.relkind in ('r', 'p')
      and (has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
           or has_table_privilege(c.oid, 'DELETE, TRUNCATE, TRIGGER'))
    order by 1`;
  expect(comPrivilegio.map((r) => r.t)).toEqual([
    'controle_login',
    'desafio_acesso',
    'sessao',
    'usuario',
  ]);
  for (const t of ['condominio', 'auditoria', 'parametro_condominio', 'documento', 'aceite']) {
    await expect(aut.unsafe(`select 1 from condomifacil.${t}`)).rejects.toMatchObject({
      code: '42501',
    });
  }
  const [r] = await aut<[{ delete: boolean; truncate: boolean }]>`
    select has_table_privilege('condomifacil.sessao', 'DELETE') as delete,
           has_table_privilege('condomifacil.sessao', 'TRUNCATE') as truncate`;
  expect(r).toEqual({ delete: false, truncate: false });
});

test('desafio_acesso: dois desafios ativos para o mesmo destino e finalidade são recusados; reenvio invalida o anterior', async () => {
  await desfeita(aut, async (tx) => {
    const emitir = (sp: Tx, finalidade = 'ativacao') =>
      sp`insert into condomifacil.desafio_acesso (usuario_id, destino_protegido, finalidade, codigo_hash, expira_em)
        values (${U1.id}, 'destino-u1', ${finalidade}, 'codigo', now() + interval '15 minutes')`;
    await emitir(tx);
    await falha(tx, '23505', (sp) => emitir(sp));
    await emitir(tx, 'recuperacao_senha'); // outra finalidade convive
    await tx`update condomifacil.desafio_acesso set invalidado_em = now()
      where destino_protegido = 'destino-u1' and finalidade = 'ativacao'
        and consumido_em is null and invalidado_em is null`;
    await emitir(tx);
    await falha(tx, '23514', (sp) => emitir(sp, 'outra'));
    const r = await tx`update condomifacil.desafio_acesso set tentativas = tentativas + 1
      where destino_protegido = 'destino-u1' and finalidade = 'ativacao' and invalidado_em is null
      returning tentativas`;
    expect(r.map((x) => x.tentativas)).toEqual([1]);
    await falha(tx, '42501', (sp) => sp`update condomifacil.desafio_acesso set codigo_hash = 'x'`);
  });
});

test('controle_login: uma linha por chave protegida, contador incrementado por upsert', async () => {
  await desfeita(aut, async (tx) => {
    const falhar = (sp: Tx) => sp<
      [{ falhas: number; bloqueado_ate: Date | null; janela_iniciada_em: Date | null }]
    >`
      insert into condomifacil.controle_login (chave_tentativa_protegida, falhas, janela_iniciada_em)
      values ('chave-x', 1, now())
      on conflict (chave_tentativa_protegida) do update set falhas = controle_login.falhas + 1,
        bloqueado_ate = case when controle_login.falhas + 1 >= 5 then now() + interval '15 minutes' end
      returning falhas, bloqueado_ate, janela_iniciada_em`;
    for (let i = 0; i < 4; i++) await falhar(tx);
    const [quinta] = await falhar(tx);
    expect(quinta.falhas).toBe(5);
    expect(quinta.bloqueado_ate).toBeInstanceOf(Date);
    expect(quinta.janela_iniciada_em).toBeInstanceOf(Date); // fixada na primeira falha
    await falha(
      tx,
      '23505',
      (sp) =>
        sp`insert into condomifacil.controle_login (chave_tentativa_protegida) values ('chave-x')`,
    );
  });
});

test('controle_login: falhas e janela_iniciada_em coerentes (controle_login_janela_coerente)', async () => {
  await desfeita(aut, async (tx) => {
    const recusa = (falhas: number, janela: Date | null) =>
      expect(
        tx.savepoint(
          (
            sp,
          ) => sp`insert into condomifacil.controle_login (chave_tentativa_protegida, falhas, janela_iniciada_em)
            values ('chave-janela', ${falhas}, ${janela})`,
        ),
      ).rejects.toMatchObject({ code: '23514', constraint_name: 'controle_login_janela_coerente' });
    await recusa(1, null);
    await recusa(0, new Date());
    await tx`insert into condomifacil.controle_login (chave_tentativa_protegida) values ('chave-janela')`;
    await tx`update condomifacil.controle_login set falhas = 1, janela_iniciada_em = now()
      where chave_tentativa_protegida = 'chave-janela'`;
    await expect(
      tx.savepoint(
        (sp) => sp`update condomifacil.controle_login set falhas = 0
          where chave_tentativa_protegida = 'chave-janela'`,
      ),
    ).rejects.toMatchObject({ code: '23514', constraint_name: 'controle_login_janela_coerente' });
    await tx`update condomifacil.controle_login set falhas = 0, janela_iniciada_em = null
      where chave_tentativa_protegida = 'chave-janela'`;
  });
});

// Retry B+E (ADR-007): as instruções da migration V202611240001. O refresh é
// "<sessao_id>.<segredo>": a sessão é achada pelo id e o hash apresentado é o do segredo.
const rotacionar = (q: Tx, id: string, apresentado: string, novo: string) => q`
  update condomifacil.sessao set renovacao_hash_anterior = renovacao_hash, renovacao_hash = ${novo},
    rotacionada_em = now(), anterior_reusado_em = null, expira_em = now() + interval '30 days'
  where id = ${id} and renovacao_hash = ${apresentado} and revogada_em is null and expira_em > now()
  returning id`;
const retry = (q: Tx, id: string, apresentado: string, novo: string) => q`
  update condomifacil.sessao set renovacao_hash = ${novo}, anterior_reusado_em = now(),
    expira_em = now() + interval '30 days'
  where id = ${id} and renovacao_hash_anterior = ${apresentado} and anterior_reusado_em is null
    and rotacionada_em > now() - interval '30 seconds' and revogada_em is null and expira_em > now()
  returning id`;
/** Renovação completa: normal, senão retry, senão qualquer outro segredo é replay e revoga. */
const renovar = async (q: Tx, id: string, apresentado: string, novo: string) => {
  if ((await rotacionar(q, id, apresentado, novo)).length === 1) return 'normal';
  if ((await retry(q, id, apresentado, novo)).length === 1) return 'retry';
  const r = await q`update condomifacil.sessao set revogada_em = now()
    where id = ${id} and revogada_em is null returning id`;
  return r.length === 1 ? 'replay' : 'revogada';
};
const abrirSessao = (q: Tx, hash: string) => q<[{ id: string }]>`
  insert into condomifacil.sessao (usuario_id, renovacao_hash, expira_em)
  values (${U1.id}, ${hash}, now() + interval '30 days') returning id`;
const revogada = async (q: Tx, id: string) =>
  (
    await q<
      [{ r: boolean }]
    >`select revogada_em is not null as r from condomifacil.sessao where id = ${id}`
  )[0].r;

test('B+E: anterior vale uma vez em 30 s enquanto o sucessor não foi usado; qualquer outro segredo é replay e revoga', async () => {
  await desfeita(aut, async (tx) => {
    // Resposta perdida: o cliente repete com h0 e recebe h2; repetir h0 de novo é replay.
    const [{ id: s1 }] = await abrirSessao(tx, 'h0');
    expect(await renovar(tx, s1, 'h0', 'h1')).toBe('normal');
    expect(await renovar(tx, s1, 'h0', 'h2')).toBe('retry');
    expect(await revogada(tx, s1)).toBe(false);
    expect(await renovar(tx, s1, 'h0', 'h3')).toBe('replay');
    expect(await revogada(tx, s1)).toBe(true);
    expect(await renovar(tx, s1, 'h2', 'h4')).toBe('revogada'); // sessão revogada não renova

    // Sucessor já usado: h0 deixa de ser o anterior; reusá-lo é replay.
    const [{ id: s2 }] = await abrirSessao(tx, 'h0'); // mesmo hash em outra sessão: busca é por id
    expect(await renovar(tx, s2, 'h0', 'h1')).toBe('normal');
    expect(await renovar(tx, s2, 'h1', 'h2')).toBe('normal');
    expect((await retry(tx, s2, 'h0', 'x')).length).toBe(0);
    expect(await renovar(tx, s2, 'h1', 'h3')).toBe('retry'); // h1 é o anterior agora
    expect(await revogada(tx, s2)).toBe(false);
    // Segredo de rotação antiga (h0, duas gerações atrás) e o sucessor perdido (h2) revogam.
    const [{ id: s2b }] = await abrirSessao(tx, 'k0');
    expect(await renovar(tx, s2b, 'k0', 'k1')).toBe('normal');
    expect(await renovar(tx, s2b, 'k1', 'k2')).toBe('normal');
    expect(await renovar(tx, s2b, 'k0', 'k3')).toBe('replay');
    expect(await renovar(tx, s2, 'h2', 'h4')).toBe('replay');

    // Fora da janela de 30 s: o anterior é replay.
    const [{ id: s3 }] = await abrirSessao(tx, 'h0');
    expect(await renovar(tx, s3, 'h0', 'h1')).toBe('normal');
    await tx`update condomifacil.sessao set rotacionada_em = now() - interval '31 seconds' where id = ${s3}`;
    expect(await renovar(tx, s3, 'h0', 'h2')).toBe('replay');
    expect(await revogada(tx, s3)).toBe(true);

    // Integridade das colunas.
    await falha(
      tx,
      '23514',
      (sp) => sp`update condomifacil.sessao set rotacionada_em = null where id = ${s2}`,
    );
    await falha(
      tx,
      '23514',
      (sp) =>
        sp`update condomifacil.sessao set renovacao_hash_anterior = renovacao_hash where id = ${s2}`,
    );
    await falha(tx, '42501', (sp) => sp`update condomifacil.sessao set usuario_id = ${U2.id}`);
  });
});

test('B+E concorrente (duas conexões): dois retries com o mesmo anterior, só um vence', async () => {
  await concorrente(async (c1, c2, id) => {
    const [a, b] = await corrida(
      (tx) => retry(tx, id, 'h0', 'h2a'),
      (tx) => retry(tx, id, 'h0', 'h2b'),
      c1,
      c2,
    );
    expect([a, b]).toEqual([1, 0]);
  });
});

test('B+E concorrente (duas conexões): sucessor usado enquanto o retry espera; o retry perde', async () => {
  await concorrente(async (c1, c2, id) => {
    const [a, b] = await corrida(
      (tx) => rotacionar(tx, id, 'h1', 'h2n'),
      (tx) => retry(tx, id, 'h0', 'h2r'),
      c1,
      c2,
    );
    expect([a, b]).toEqual([1, 0]);
  });
});

/** Sessão real (commitada) com h0 -> h1, removida no fim pelo superusuário (sem DELETE no app). */
async function concorrente(fn: (c1: Sql, c2: Sql, id: string) => Promise<void>) {
  const c1 = conectar(amb, 'app_autenticacao', BANCO_TESTE);
  const c2 = conectar(amb, 'app_autenticacao', BANCO_TESTE);
  const su = conectar(amb, 'postgres', BANCO_TESTE);
  let id = '';
  try {
    await c1.begin(async (tx) => {
      [{ id }] = await abrirSessao(tx, 'h0');
      expect(await rotacionar(tx, id, 'h0', 'h1')).toHaveLength(1);
    });
    await fn(c1, c2, id);
  } finally {
    if (id) await su`delete from condomifacil.sessao where id = ${id}`;
    await Promise.all([c1.end(), c2.end(), su.end()]);
  }
}

/** c1 atualiza e segura o bloqueio da linha; c2 tenta durante a espera e só termina depois. */
async function corrida(
  primeiro: (tx: Tx) => Promise<unknown[]>,
  segundo: (tx: Tx) => Promise<unknown[]>,
  c1: Sql,
  c2: Sql,
): Promise<[number, number]> {
  let antesDoCommit = 0;
  const t1 = c1.begin(async (tx) => {
    const n = (await primeiro(tx)).length;
    await tx`select pg_sleep(0.6)`;
    antesDoCommit = Date.now();
    return n;
  });
  await new Promise((r) => setTimeout(r, 150));
  const t2 = c2.begin(async (tx) => {
    const n = (await segundo(tx)).length;
    // O segundo UPDATE só volta depois do commit do primeiro (esperou o bloqueio da linha).
    expect(antesDoCommit).toBeGreaterThan(0);
    return n;
  });
  return [await t1, await t2];
}

// documentos e aceites -------------------------------------------------------------------------

test('documento sem versão publicada é recusado no commit; com versão é aceito; um documento por tipo em cada escopo', async () => {
  const fx = conectar(amb, 'fixtures', BANCO_TESTE);
  try {
    await expect(
      fx.begin(
        (tx) =>
          tx`insert into condomifacil.documento (tipo, titulo) values ('como_funciona', 'Sem versão')`,
      ),
    ).rejects.toMatchObject({ code: '23514', constraint_name: 'documento_exige_versao' });
    await desfeita(fx, async (tx) => {
      const [d] = await tx<[{ id: string }]>`insert into condomifacil.documento (tipo, titulo)
        values ('como_funciona', 'Com versão') returning id`;
      await tx`insert into condomifacil.documento_versao (documento_id, numero, conteudo_texto, vigente_desde)
        values (${d.id}, 1, 'Texto fictício', now())`;
      await tx`set constraints all immediate`; // antecipa a checagem do commit
      // Um documento por tipo em cada escopo: global repetido e regimento repetido no condomínio.
      await falha(
        tx,
        '23505',
        (sp) =>
          sp`insert into condomifacil.documento (tipo, titulo) values ('termos_de_uso', 'Outros termos')`,
      );
      await falha(
        tx,
        '23505',
        (sp) => sp`insert into condomifacil.documento (tipo, condominio_id, titulo)
          values ('regimento', ${A.id}, 'Outro regimento A')`,
      );
      await falha(
        tx,
        '23514',
        (sp) =>
          sp`insert into condomifacil.documento (tipo, titulo) values ('regimento', 'Sem condomínio')`,
      );
    });
  } finally {
    await fx.end();
  }
});

test('documento: global com titular; de condomínio só no contexto dele; versões herdam; app_user não publica nem altera', async () => {
  await desfeita(app, async (tx, ctx) => {
    await ctx({ usuario: U1.id, condominio: A.id });
    const meus = (await ids(tx, 'documento')).filter((i) =>
      [TERMOS.id, REG_A.id, REG_B.id].includes(i),
    );
    expect(meus.sort()).toEqual([TERMOS.id, REG_A.id].sort());
    const versoes = await ids(tx, 'documento_versao');
    expect(versoes).toEqual(expect.arrayContaining([TERMOS_V1.id, TERMOS_V2.id, REG_A_V1.id]));
    expect(versoes).not.toContain(REG_B_V1.id);

    await ctx({ usuario: U1.id }); // sem condomínio: só globais
    expect(await ids(tx, 'documento')).not.toContain(REG_A.id);
    await ctx({ condominio: B.id }); // sem titular: global fechado
    const semTitular = await ids(tx, 'documento');
    expect(semTitular).toContain(REG_B.id);
    expect(semTitular).not.toContain(TERMOS.id);
    await ctx({});
    expect(await ids(tx, 'documento')).toEqual([]);
    expect(await ids(tx, 'documento_versao')).toEqual([]);

    await ctx({ usuario: U1.id, condominio: A.id });
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.documento_versao set conteudo_texto = 'x'`,
    );
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.documento_versao`);
    await falha(tx, '42501', (sp) => sp`update condomifacil.documento set titulo = 'x'`);
    await falha(
      tx,
      '42501',
      (sp) => sp`insert into condomifacil.documento (tipo, condominio_id, titulo)
        values ('regimento', ${A.id}, 'x')`,
    );
    await falha(
      tx,
      '42501',
      (
        sp,
      ) => sp`insert into condomifacil.documento_versao (documento_id, numero, conteudo_texto, vigente_desde)
        values (${REG_A.id}, 2, 'x', now())`,
    );
  });
});

test('aceite: titular insere e lê só os próprios; único por versão; imutável; nova versão exige novo aceite', async () => {
  await desfeita(app, async (tx, ctx) => {
    const aceitar = (sp: Tx, u: string, v: string) =>
      sp`insert into condomifacil.aceite (usuario_id, documento_versao_id) values (${u}, ${v})`;
    await ctx({ usuario: U1.id });
    expect(await ids(tx, 'aceite')).toEqual([]); // o aceite de U2 é invisível
    await aceitar(tx, U1.id, TERMOS_V1.id);
    await falha(tx, '23505', (sp) => aceitar(sp, U1.id, TERMOS_V1.id));
    await aceitar(tx, U1.id, TERMOS_V2.id);
    await falha(tx, '42501', (sp) => aceitar(sp, U2.id, TERMOS_V2.id)); // em nome de outro
    await falha(tx, '42501', (sp) => aceitar(sp, U1.id, REG_B_V1.id)); // versão fora do escopo
    await falha(
      tx,
      '42501',
      (sp) => sp`insert into condomifacil.aceite (usuario_id, documento_versao_id, aceito_em)
        values (${U1.id}, ${REG_A_V1.id}, '2000-01-01')`,
    );
    await falha(tx, '42501', (sp) => sp`update condomifacil.aceite set aceito_em = now()`);
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.aceite`);
    expect((await ids(tx, 'aceite')).length).toBe(2);
    await ctx({ usuario: U2.id });
    expect(await ids(tx, 'aceite')).toEqual([ACEITE_U2.id]);
    // Regimento só no contexto do condomínio.
    await falha(tx, '42501', (sp) => aceitar(sp, U2.id, REG_A_V1.id));
    await ctx({ usuario: U2.id, condominio: A.id });
    await aceitar(tx, U2.id, REG_A_V1.id);
  });
});

// parametro_condominio -------------------------------------------------------------------------

test('parametro_condominio: isolado entre A e B, autor é o titular, sem UPDATE e DELETE, sem empate de vigência', async () => {
  await desfeita(app, async (tx, ctx) => {
    const configurar = (sp: Tx, cond: string, autor: string, desde = '2026-12-01T00:00:00Z') =>
      sp`insert into condomifacil.parametro_condominio (condominio_id, definicao_id, valor_json, vigente_desde, registrado_por_id)
        select ${cond}, d.id, '5', ${desde}, ${autor} from condomifacil.parametro_definicao d
        where d.chave = ${DEF_SCORE}`;
    await ctx({ usuario: U1.id, condominio: A.id });
    await configurar(tx, A.id, U1.id);
    expect((await ids(tx, 'parametro_condominio')).length).toBe(1);
    await falha(tx, '23505', (sp) => configurar(sp, A.id, U1.id));
    await configurar(tx, A.id, U1.id, '2027-01-01T00:00:00Z'); // nova vigência é nova linha
    await falha(tx, '42501', (sp) => configurar(sp, B.id, U1.id));
    await falha(tx, '42501', (sp) => configurar(sp, A.id, U2.id));
    await falha(
      tx,
      '42501',
      (sp) => sp`update condomifacil.parametro_condominio set valor_json = '1'`,
    );
    await falha(tx, '42501', (sp) => sp`delete from condomifacil.parametro_condominio`);
    const [r] = await tx<[{ recente: boolean }]>`
      select bool_and(registrado_em > now() - interval '1 minute') as recente
      from condomifacil.parametro_condominio`;
    expect(r.recente).toBe(true);

    await ctx({ usuario: U1.id, condominio: B.id });
    expect(await ids(tx, 'parametro_condominio')).toEqual([]);
    await ctx({ usuario: U1.id });
    expect(await ids(tx, 'parametro_condominio')).toEqual([]);
  });
});
