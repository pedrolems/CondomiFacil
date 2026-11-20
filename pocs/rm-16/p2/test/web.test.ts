import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ORIGEM, SENHA, criarCondominio, criarUsuario, fx, navegador, subir, vincular } from './ambiente.ts';

let s: Awaited<ReturnType<typeof subir>>;
beforeAll(async () => { s = await subir(); });
afterAll(async () => { await s.fim(); await fx.end(); });

const WEB = { 'content-type': 'application/json', 'x-condomifacil-web': '1' };
const post = (nav: ReturnType<typeof navegador>, caminho: string, corpo: unknown = {}, cab: Record<string, string> = WEB) =>
  nav.fetch(`${s.base}${caminho}`, { method: 'POST', headers: cab, body: JSON.stringify(corpo) });
async function loginWeb() {
  const u = await criarUsuario(); const c = await criarCondominio(); await vincular(u.id, c, 'morador');
  const nav = navegador();
  const r = await post(nav, '/v1/acesso/entrar', { email: u.email, senha: SENHA, cliente: 'web' });
  return { u, c, nav, r, json: (await r.json()) as { access_token: string; refresh_token?: string; sessao_id: string } };
}

describe('web: refresh em cookie httpOnly', () => {
  it('o refresh vai so no cookie (HttpOnly, Secure, SameSite=Lax, Path restrito) e nunca no corpo; o access nunca vai em cookie', async () => {
    const { r, json } = await loginWeb();
    expect(r.status).toBe(200);
    expect(json.refresh_token).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain('rt_');
    const cookies = r.headers.getSetCookie();
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatch(/^rt=rt_[A-Za-z0-9_-]{43}; HttpOnly; Secure; SameSite=Lax; Path=\/v1\/acesso; Max-Age=2592000$/);
    expect(cookies[0]).not.toContain(json.access_token);
  });

  it('renova pelo cookie com Origin e cabecalho proprio; o cookie rotaciona e o antigo deixa de valer', async () => {
    const { nav, json } = await loginWeb();
    const antigo = nav.jar.get('rt')!;
    const r = await post(nav, '/v1/acesso/renovar');
    expect(r.status).toBe(200);
    const novo = (await r.json()) as typeof json;
    expect(novo.refresh_token).toBeUndefined();
    expect(nav.jar.get('rt')).not.toBe(antigo);
    expect(novo.sessao_id).toBe(json.sessao_id);
  });

  it('CSRF: sem Origin, Origin de terceiro ou sem o cabecalho proprio = 403, e o token NAO e consumido', async () => {
    const { nav } = await loginWeb();
    const cookie = `rt=${nav.jar.get('rt')}`;
    const cru = (cab: Record<string, string>) => fetch(`${s.base}/v1/acesso/renovar`, { method: 'POST', headers: { 'content-type': 'application/json', cookie, ...cab }, body: '{}' });
    expect((await cru({ 'x-condomifacil-web': '1' })).status).toBe(403); // sem Origin
    expect((await cru({ origin: 'https://atacante.invalid', 'x-condomifacil-web': '1' })).status).toBe(403);
    expect((await cru({ origin: ORIGEM })).status).toBe(403); // sem cabecalho proprio (formulario HTML nao o envia)
    expect((await cru({ origin: 'null', 'x-condomifacil-web': '1' })).status).toBe(403);
    expect((await post(nav, '/v1/acesso/renovar')).status).toBe(200); // o legitimo ainda funciona
  });

  it('login web tambem exige Origin e cabecalho (login CSRF)', async () => {
    const u = await criarUsuario();
    const r = await fetch(`${s.base}/v1/acesso/entrar`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://atacante.invalid' },
      body: JSON.stringify({ email: u.email, senha: SENHA, cliente: 'web' }) });
    expect(r.status).toBe(403);
  });

  it('CORS: preflight de origem de terceiro nao autoriza; a origem do painel recebe credentials e nada de curinga', async () => {
    const pre = (origin: string) => fetch(`${s.base}/v1/acesso/renovar`, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'x-condomifacil-web,content-type' } });
    const ruim = await pre('https://atacante.invalid');
    expect(ruim.headers.get('access-control-allow-origin')).toBeNull();
    const bom = await pre(ORIGEM);
    expect(bom.headers.get('access-control-allow-origin')).toBe(ORIGEM);
    expect(bom.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('replay do cookie antigo revoga a sessao e limpa o cookie; logout limpa e revoga', async () => {
    const { nav, json } = await loginWeb();
    const antigo = nav.jar.get('rt')!;
    await post(nav, '/v1/acesso/renovar');
    const atacante = navegador(); atacante.jar.set('rt', antigo);
    const r = await post(atacante, '/v1/acesso/renovar');
    expect(r.status).toBe(401);
    expect(r.headers.getSetCookie()[0]).toMatch(/^rt=; .*Max-Age=0$/);
    expect((await post(nav, '/v1/acesso/renovar')).status).toBe(401); // a vitima tambem cai (fail closed)
    const [sess] = await fx`select motivo from app.sessao where id = ${json.sessao_id}`;
    expect(sess!['motivo']).toBe('reuso_refresh');
  });

  it('sem cookie e sem corpo: 401; logout web revoga e apaga o cookie', async () => {
    expect((await post(navegador(), '/v1/acesso/renovar')).status).toBe(401);
    const { nav, json } = await loginWeb();
    const r = await post(nav, '/v1/acesso/sair', {}, { ...WEB, authorization: `Bearer ${json.access_token}` });
    expect(r.status).toBe(204);
    expect(nav.jar.has('rt')).toBe(false);
    expect((await post(nav, '/v1/acesso/renovar')).status).toBe(401);
  });
});
