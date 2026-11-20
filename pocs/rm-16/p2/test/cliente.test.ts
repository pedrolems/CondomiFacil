import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ClienteSessao, SessaoExpirada, doSecureStore, type Armazenamento } from '../src/cliente.ts';
import { SENHA, criarCondominio, criarUsuario, fx, navegador, subir, vincular } from './ambiente.ts';

let s: Awaited<ReturnType<typeof subir>>;
beforeAll(async () => { s = await subir(); });
afterAll(async () => { await s.fim(); await fx.end(); });

/** Dublê do expo-secure-store (mesma assinatura getItemAsync/setItemAsync/deleteItemAsync); em aparelho real o conteudo fica no Keystore/Keychain. */
const secureStoreFalso = () => {
  const m = new Map<string, string>();
  return { m, api: doSecureStore({ getItemAsync: async (k) => m.get(k) ?? null, setItemAsync: async (k, v) => void m.set(k, v), deleteItemAsync: async (k) => void m.delete(k) }) };
};
async function novoUsuario() {
  const u = await criarUsuario(); const c = await criarCondominio(); await vincular(u.id, c, 'morador'); return { u, c };
}
const contarRenovar = (f: typeof fetch) => { const n = { v: 0 }; return { n, f: ((url, init) => { if (String(url).endsWith('/renovar')) n.v++; return f(url, init); }) as typeof fetch }; };

describe('app (expo-secure-store)', () => {
  it('guarda o refresh no armazenamento seguro, access so em memoria; app reaberto restaura pela renovacao', async () => {
    const { u, c } = await novoUsuario(); const { m, api } = secureStoreFalso();
    const a = new ClienteSessao({ base: s.base, fetch, modo: 'app', armazenamento: api, condominioId: c });
    await a.entrar(u.email, SENHA);
    const r1 = m.get('condomifacil.refresh')!;
    expect(r1).toMatch(/^rt_/);
    expect((await a.chamar('/v1/recursos')).status).toBe(200);
    const reaberto = new ClienteSessao({ base: s.base, fetch, modo: 'app', armazenamento: api, condominioId: c }); // processo novo: access perdido
    expect((await reaberto.chamar('/v1/recursos')).status).toBe(200);
    expect(m.get('condomifacil.refresh')).not.toBe(r1); // rotacionou e regravou
  });

  it('single-flight: 6 chamadas com access vencido geram UMA renovacao e todas passam', async () => {
    const { u, c } = await novoUsuario(); const { api } = secureStoreFalso(); const { n, f } = contarRenovar(fetch);
    const a = new ClienteSessao({ base: s.base, fetch: f, modo: 'app', armazenamento: api, condominioId: c });
    await a.entrar(u.email, SENHA);
    s.relogio.avancar(901);
    const rs = await Promise.all(Array.from({ length: 6 }, () => a.chamar('/v1/recursos')));
    expect(rs.map((r) => r.status)).toEqual([200, 200, 200, 200, 200, 200]);
    expect(n.v).toBe(1);
  });

  it('dois processos do mesmo aparelho (app + tarefa em segundo plano) renovando juntos derrubam a sessao: risco registrado', async () => {
    const { u, c } = await novoUsuario(); const { api } = secureStoreFalso();
    const a = new ClienteSessao({ base: s.base, fetch, modo: 'app', armazenamento: api, condominioId: c });
    const b = new ClienteSessao({ base: s.base, fetch, modo: 'app', armazenamento: api, condominioId: c });
    await a.entrar(u.email, SENHA);
    s.relogio.avancar(901);
    const r = await Promise.allSettled([a.chamar('/v1/recursos'), b.chamar('/v1/recursos')]);
    expect(r.filter((x) => x.status === 'rejected')).not.toHaveLength(0);
    expect(await api.ler()).toBeNull(); // volta ao login (UF 15)
  });

  it('resposta da renovacao perdida: o retry com o token antigo derruba a sessao e o app volta ao login', async () => {
    const { u, c } = await novoUsuario(); const { api } = secureStoreFalso();
    let perder = true;
    const f: typeof fetch = async (url, init) => {
      const r = await fetch(url, init);
      if (String(url).endsWith('/renovar') && perder) { perder = false; throw new TypeError('rede caiu depois do servidor aplicar'); }
      return r;
    };
    const a = new ClienteSessao({ base: s.base, fetch: f, modo: 'app', armazenamento: api, condominioId: c });
    await a.entrar(u.email, SENHA);
    s.relogio.avancar(901);
    await expect(a.chamar('/v1/recursos')).rejects.toBeInstanceOf(TypeError);
    await expect(a.chamar('/v1/recursos')).rejects.toBeInstanceOf(SessaoExpirada); // retry: reuso, sessao revogada
    expect(await api.ler()).toBeNull();
  });
});

describe('web (cookie httpOnly)', () => {
  it('o codigo do cliente nunca tem o refresh: so o access em memoria; reload recupera pelo cookie; single-flight vale', async () => {
    const { u, c } = await novoUsuario(); const nav = navegador(); const { n, f } = contarRenovar(nav.fetch);
    const a = new ClienteSessao({ base: s.base, fetch: f, modo: 'web', condominioId: c });
    await a.entrar(u.email, SENHA);
    expect(JSON.stringify(a, (_k, v) => (v === f || typeof v === 'function' ? undefined : v))).not.toContain('rt_'); // refresh fora do alcance de JS
    expect((await a.chamar('/v1/recursos')).status).toBe(200);
    s.relogio.avancar(901);
    const rs = await Promise.all([a.chamar('/v1/recursos'), a.chamar('/v1/recursos'), a.chamar('/v1/recursos')]);
    expect(rs.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(n.v).toBe(1);
    const recarregada = new ClienteSessao({ base: s.base, fetch: nav.fetch, modo: 'web', condominioId: c }); // F5: memoria zerada, cookie fica
    expect((await recarregada.chamar('/v1/recursos')).status).toBe(200);
  });
});

it('tipo Armazenamento do app aceita o adaptador do expo-secure-store', () => {
  const x: Armazenamento = secureStoreFalso().api;
  expect(typeof x.ler).toBe('function');
});
