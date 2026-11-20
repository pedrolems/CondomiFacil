import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarAviso, criarCondominio, criarUsuario, fx, get, login, subir, vincular } from './ambiente.ts';

let s: Awaited<ReturnType<typeof subir>>;
beforeAll(async () => { s = await subir({ cachePapelMs: 5_000 }); });
afterAll(async () => { await s.fim(); await fx.end(); });

const entrar = async (papel: string, plano: 'essencial' | 'gestao_suporte' = 'essencial', tipo: 'comum' | 'suporte' = 'comum') => {
  const u = await criarUsuario(tipo); const c = await criarCondominio(plano); await vincular(u.id, c, papel);
  return { u, c, t: (await login(s.base, u.email)).json.access_token };
};
const postar = (caminho: string, t: string, c: string) => fetch(`${s.base}${caminho}`, { method: 'POST',
  headers: { authorization: `Bearer ${t}`, 'x-condominio-id': c, 'content-type': 'application/json' }, body: JSON.stringify({ texto: 'aviso ficticio' }) });

describe('contexto X-Condominio-Id', () => {
  it('ausente, malformado ou sem vinculo: 403; com vinculo: 200', async () => {
    const a = await entrar('morador'); const b = await criarCondominio();
    expect((await get(s.base, '/v1/recursos', a.t)).status).toBe(403);
    expect((await get(s.base, '/v1/recursos', a.t, 'nao-e-uuid')).status).toBe(403);
    expect((await get(s.base, '/v1/recursos', a.t, "' or 1=1 --")).status).toBe(403);
    expect((await get(s.base, '/v1/recursos', a.t, b)).status).toBe(403); // condominio existente, sem vinculo
    expect((await get(s.base, '/v1/recursos', a.t, randomUUID())).status).toBe(403); // inexistente: indistinguivel
    expect((await get(s.base, '/v1/recursos', a.t, a.c)).status).toBe(200);
  });

  it('vinculo inativo nao abre contexto', async () => {
    const u = await criarUsuario(); const c = await criarCondominio(); await vincular(u.id, c, 'morador', false);
    const t = (await login(s.base, u.email)).json.access_token;
    expect((await get(s.base, '/v1/recursos', t, c)).status).toBe(403);
  });

  it('suporte: abre contexto so no plano Gestao + Suporte', async () => {
    const u = await criarUsuario('suporte'); const gs = await criarCondominio('gestao_suporte'); const es = await criarCondominio('essencial');
    await vincular(u.id, gs, 'suporte'); await vincular(u.id, es, 'suporte');
    const t = (await login(s.base, u.email)).json.access_token;
    expect((await get(s.base, '/v1/recursos', t, gs)).status).toBe(200);
    expect((await get(s.base, '/v1/recursos', t, es)).status).toBe(403);
    expect((await postar('/v1/sindico/avisos', t, gs)).status).toBe(403); // e nao ganha papel de sindico
  });

  it('o 403 do contexto e igual para condominio de outro e para inexistente (sem confirmar existencia)', async () => {
    const a = await entrar('morador'); const outro = await criarCondominio();
    const r1 = await get(s.base, '/v1/recursos', a.t, outro); const r2 = await get(s.base, '/v1/recursos', a.t, randomUUID());
    expect(await r1.text()).toBe(await r2.text());
  });
});

describe('papel resolvido no servidor, com cache', () => {
  it('troca de papel vale dentro do tempo do cache: antes da janela vale o velho, depois da janela o novo', async () => {
    const a = await entrar('sindico');
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(201);
    await fx`update app.vinculo set papel = 'morador' where usuario_id = ${a.u.id} and condominio_id = ${a.c}`; // outra instancia/administradora
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(201); // dentro da janela: permissao antiga (limite documentado)
    s.relogio.avancar(4.9);
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(201);
    s.relogio.avancar(0.2); // 5,1 s
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(403); // alem da janela nunca ha permissao antiga
    expect((await get(s.base, '/v1/recursos', a.t, a.c)).status).toBe(200); // segue morador
  });

  it('vinculo desativado vale ao fim da janela', async () => {
    const a = await entrar('morador');
    expect((await get(s.base, '/v1/recursos', a.t, a.c)).status).toBe(200);
    await fx`update app.vinculo set ativo = false where usuario_id = ${a.u.id}`;
    s.relogio.avancar(5.1);
    expect((await get(s.base, '/v1/recursos', a.t, a.c)).status).toBe(403);
  });

  it('substituicao do sindico e dado: subsindico ganha e perde o papel de sindico sem codigo novo', async () => {
    const a = await entrar('subsindico');
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(403);
    await fx`insert into app.substituicao (condominio_id, subsindico_usuario_id, ativa) values (${a.c}, ${a.u.id}, true)`;
    s.relogio.avancar(5.1);
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(201);
    await fx`update app.substituicao set ativa = false where condominio_id = ${a.c}`;
    s.relogio.avancar(5.1);
    expect((await postar('/v1/sindico/avisos', a.t, a.c)).status).toBe(403);
  });

  it('plano mudou para Gestao + Suporte: suporte passa a abrir contexto ao fim da janela', async () => {
    const u = await criarUsuario('suporte'); const c = await criarCondominio('essencial'); await vincular(u.id, c, 'suporte');
    const t = (await login(s.base, u.email)).json.access_token;
    expect((await get(s.base, '/v1/recursos', t, c)).status).toBe(403);
    await fx`update app.condominio set plano = 'gestao_suporte' where id = ${c}`;
    s.relogio.avancar(5.1);
    expect((await get(s.base, '/v1/recursos', t, c)).status).toBe(200);
  });

  it('o cache poupa a consulta: 50 requisicoes na janela = 1 consulta de papel; fora dela, nova consulta', async () => {
    const a = await entrar('morador');
    const antes = s.papel.consultas;
    for (let i = 0; i < 50; i++) await get(s.base, '/v1/recursos', a.t, a.c);
    expect(s.papel.consultas - antes).toBe(1);
    s.relogio.avancar(5.1);
    await get(s.base, '/v1/recursos', a.t, a.c);
    expect(s.papel.consultas - antes).toBe(2);
  });

  it('sem cache (0 ms) a mudanca vale na proxima requisicao', async () => {
    const sem = await subir({ cachePapelMs: 0 });
    try {
      const u = await criarUsuario(); const c = await criarCondominio(); await vincular(u.id, c, 'sindico');
      const t = (await login(sem.base, u.email)).json.access_token;
      expect((await postar2(sem.base, t, c)).status).toBe(201);
      await fx`update app.vinculo set papel = 'morador' where usuario_id = ${u.id}`;
      expect((await postar2(sem.base, t, c)).status).toBe(403);
    } finally { await sem.fim(); }
  });
});
const postar2 = (base: string, t: string, c: string) => fetch(`${base}/v1/sindico/avisos`, { method: 'POST',
  headers: { authorization: `Bearer ${t}`, 'x-condominio-id': c, 'content-type': 'application/json' }, body: JSON.stringify({ texto: 'x' }) });

describe('RLS como ultima barreira', () => {
  it('dois condominios: cada um ve so os avisos do seu; recurso do outro e 404 (nunca 403)', async () => {
    const a = await entrar('morador'); const b = await entrar('morador');
    const idA = await criarAviso(a.c, 'aviso A'); const idB = await criarAviso(b.c, 'aviso B');
    const la = (await (await get(s.base, '/v1/recursos', a.t, a.c)).json()) as { avisos: { texto: string }[] };
    expect(la.avisos.map((x) => x.texto)).toEqual(['aviso A']);
    expect((await get(s.base, `/v1/recursos/avisos/${idA}`, a.t, a.c)).status).toBe(200);
    expect((await get(s.base, `/v1/recursos/avisos/${idB}`, a.t, a.c)).status).toBe(404);
    expect((await get(s.base, `/v1/recursos/avisos/${randomUUID()}`, a.t, a.c)).status).toBe(404);
  });

  const app = () => postgres({ host: 'localhost', port: 54329, database: 'p2', username: 'app_user', password: 'app_local_ficticia', onnotice: () => {} });

  it('com os privilegios reais do app_user: sem contexto = zero linhas; so as linhas do proprio usuario; escrita em outro tenant = 42501', async () => {
    const a = await entrar('morador'); const b = await entrar('morador'); await criarAviso(b.c, 'aviso B');
    const db = app();
    try {
      expect(await db`select * from app.vinculo`).toHaveLength(0);
      expect(await db`select * from app.aviso`).toHaveLength(0);
      const visto = await db.begin(async (tx) => { await tx`select set_config('app.usuario_id', ${a.u.id}, true)`; return tx`select usuario_id from app.vinculo`; });
      expect(visto.map((r) => r['usuario_id'])).toEqual([a.u.id]);
      const condominios = await db.begin(async (tx) => { await tx`select set_config('app.usuario_id', ${a.u.id}, true)`; return tx`select id from app.condominio`; });
      expect(condominios.map((r) => r['id'])).toEqual([a.c]); // nem o condominio alheio aparece
      await expect(db.begin(async (tx) => { await tx`select set_config('app.condominio_id', ${a.c}, true)`;
        await tx`insert into app.aviso (condominio_id, texto) values (${b.c}, 'invasao')`; })).rejects.toMatchObject({ code: '42501' });
    } finally { await db.end(); }
  });

  it('catalogo: so as 3 tabelas do plano de autenticacao ficam sem RLS; papel sem BYPASSRLS; refresh e sessao so mudam colunas permitidas', async () => {
    const db = app();
    try {
      const [papel] = await db`select rolsuper, rolbypassrls from pg_roles where rolname = current_user`;
      expect(papel).toMatchObject({ rolsuper: false, rolbypassrls: false });
      const sem = await db`select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'app' and c.relkind = 'r' and not (c.relrowsecurity and c.relforcerowsecurity) order by 1`;
      expect(sem.map((r) => r['relname'])).toEqual(['refresh_token', 'sessao', 'usuario']);
      const dono = await db`select count(*)::int n from pg_tables where schemaname = 'app' and tableowner = current_user`;
      expect(dono[0]!['n']).toBe(0);
      await expect(db`update app.refresh_token set hash = '\\x00'`).rejects.toMatchObject({ code: '42501' }); // hash imutavel
      await expect(db`update app.sessao set usuario_id = usuario_id`).rejects.toMatchObject({ code: '42501' });
      await expect(db`delete from app.sessao`).rejects.toMatchObject({ code: '42501' }); // sessao nao some: so revoga
      await expect(db`delete from app.vinculo`).rejects.toMatchObject({ code: '42501' });
    } finally { await db.end(); }
  });
});
