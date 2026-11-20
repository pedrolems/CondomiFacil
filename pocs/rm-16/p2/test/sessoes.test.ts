import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SENHA, criarCondominio, criarUsuario, decodificar, fx, get, login, renovar, subir, vincular } from './ambiente.ts';

let s: Awaited<ReturnType<typeof subir>>;
beforeAll(async () => { s = await subir(); });
afterAll(async () => { await s.fim(); await fx.end(); });

async function usuarioComContexto() {
  const u = await criarUsuario(); const c = await criarCondominio(); await vincular(u.id, c, 'morador');
  return { u, c };
}

describe('JWT de acesso', () => {
  it('15 min, so sub e sid (sem papeis nem condominios), com kid, HS256 e iss/aud', async () => {
    const { u } = await usuarioComContexto();
    const { json } = await login(s.base, u.email);
    const { cabecalho, claims } = decodificar(json.access_token);
    expect(cabecalho).toMatchObject({ alg: 'HS256', kid: 'k1' });
    expect(Object.keys(claims).sort()).toEqual(['aud', 'exp', 'iat', 'iss', 'sid', 'sub']);
    expect(claims['sub']).toBe(u.id);
    expect(claims['sid']).toBe(json.sessao_id);
    expect((claims['exp'] as number) - (claims['iat'] as number)).toBe(900);
  });

  it('expira depois de 15 min (relogio controlado) e antes disso vale', async () => {
    const { u, c } = await usuarioComContexto();
    const { json } = await login(s.base, u.email);
    expect((await get(s.base, '/v1/recursos', json.access_token, c)).status).toBe(200);
    s.relogio.avancar(899);
    expect((await get(s.base, '/v1/recursos', json.access_token, c)).status).toBe(200);
    s.relogio.avancar(2);
    expect((await get(s.base, '/v1/recursos', json.access_token, c)).status).toBe(401);
  });

  it('recusa alg none, assinatura adulterada, chave errada, kid desconhecido e token de outro emissor', async () => {
    const { u, c } = await usuarioComContexto();
    const { json } = await login(s.base, u.email);
    const [h, p] = json.access_token.split('.');
    const claims = decodificar(json.access_token).claims;
    const none = `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.${p}.`;
    const adulterado = `${h}.${Buffer.from(JSON.stringify({ ...claims, sub: u.id.replace(/.$/, '0') })).toString('base64url')}.${json.access_token.split('.')[2]}`;
    const falso = (kid: string, iss = 'condomifacil') => new SignJWT({ sid: json.sessao_id }).setProtectedHeader({ alg: 'HS256', kid })
      .setSubject(u.id).setIssuer(iss).setAudience('condomifacil-api').setExpirationTime('15m').sign(randomBytes(32));
    for (const t of [none, adulterado, await falso('k1'), await falso('k-desconhecido'), await falso('k1', 'outro')]) {
      expect((await get(s.base, '/v1/recursos', t, c)).status).toBe(401);
    }
    expect((await get(s.base, '/v1/recursos', 'lixo', c)).status).toBe(401);
    expect((await fetch(`${s.base}/v1/recursos`, { headers: { 'x-condominio-id': c } })).status).toBe(401);
  });

  it('rotacao de kid: token antigo vale enquanto a chave antiga existir; apos aposentar, 401', async () => {
    const { u, c } = await usuarioComContexto();
    const antigo = (await login(s.base, u.email)).json;
    s.chaveiro.rotacionar({ kid: 'k2', segredo: randomBytes(32) });
    const novo = (await login(s.base, u.email)).json;
    expect(decodificar(novo.access_token).cabecalho['kid']).toBe('k2');
    expect((await get(s.base, '/v1/recursos', antigo.access_token, c)).status).toBe(200);
    s.chaveiro.aposentar('k1');
    expect((await get(s.base, '/v1/recursos', antigo.access_token, c)).status).toBe(401);
    expect((await get(s.base, '/v1/recursos', novo.access_token, c)).status).toBe(200);
  });

  it('sid de outra sessao ou sub trocado nao autentica (sessao e usuario precisam casar)', async () => {
    const a = await usuarioComContexto(); const b = await usuarioComContexto();
    const sa = (await login(s.base, a.u.email)).json; const sb = (await login(s.base, b.u.email)).json;
    const k = s.chaveiro;
    const forjado = await k.emitir({ sub: a.u.id, sid: sb.sessao_id }, s.relogio.agora(), 900);
    expect((await get(s.base, '/v1/recursos', forjado, a.c)).status).toBe(401);
    expect((await get(s.base, '/v1/recursos', sa.access_token, a.c)).status).toBe(200);
  });
});

describe('refresh opaco rotativo', () => {
  it('so o hash SHA-256 fica no banco, nunca o token', async () => {
    const { u } = await usuarioComContexto();
    const { json } = await login(s.base, u.email);
    const hash = createHash('sha256').update(json.refresh_token).digest();
    const porHash = await fx`select usado_em from app.refresh_token where hash = ${hash}`;
    expect(porHash).toHaveLength(1);
    const bruto = await fx`select count(*)::int n from app.refresh_token where encode(hash, 'escape') like ${'%' + json.refresh_token.slice(3, 20) + '%'}`;
    expect(bruto[0]!['n']).toBe(0);
    expect(json.refresh_token).toMatch(/^rt_[A-Za-z0-9_-]{43}$/); // 256 bits
  });

  it('cada uso gera outro; o novo funciona e o antigo fica marcado como usado', async () => {
    const { u } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json;
    const r = await renovar(s.base, a.refresh_token);
    expect(r.status).toBe(200);
    const b = (await r.json()) as typeof a;
    expect(b.refresh_token).not.toBe(a.refresh_token);
    expect(b.sessao_id).toBe(a.sessao_id);
    expect((await renovar(s.base, b.refresh_token)).status).toBe(200);
  });

  it('replay indevido revoga a sessao inteira (sucessor e access incluidos)', async () => {
    const { u, c } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json;
    const b = (await (await renovar(s.base, a.refresh_token)).json()) as typeof a;
    expect((await get(s.base, '/v1/recursos', b.access_token, c)).status).toBe(200);
    expect((await renovar(s.base, a.refresh_token)).status).toBe(401); // reuso do antigo
    expect((await renovar(s.base, b.refresh_token)).status).toBe(401); // o sucessor morreu junto
    expect((await get(s.base, '/v1/recursos', b.access_token, c)).status).toBe(401); // e o access na hora
    const [sessao] = await fx`select motivo, revogada_em from app.sessao where id = ${a.sessao_id}`;
    expect(sessao!['motivo']).toBe('reuso_refresh');
  });

  it('renovacao concorrente: de 8 usos simultaneos do mesmo token so 1 vence, e a sessao e revogada', async () => {
    for (let rodada = 0; rodada < 3; rodada++) {
      const { u } = await usuarioComContexto();
      const a = (await login(s.base, u.email)).json;
      const rs = await Promise.all(Array.from({ length: 8 }, () => renovar(s.base, a.refresh_token)));
      const codigos = rs.map((r) => r.status).sort();
      expect(codigos.filter((x) => x === 200)).toHaveLength(1);
      expect(codigos.filter((x) => x === 401)).toHaveLength(7);
      const vencedor = (await (await rs.find((r) => r.status === 200)!.json()) as typeof a);
      const [sessao] = await fx`select motivo from app.sessao where id = ${a.sessao_id}`;
      expect(sessao!['motivo']).toBe('reuso_refresh'); // custo da politica estrita: ate o vencedor cai
      expect((await renovar(s.base, vencedor.refresh_token)).status).toBe(401);
      const filhos = await fx`select count(*)::int n from app.refresh_token where sessao_id = ${a.sessao_id}`;
      expect(filhos[0]!['n']).toBe(2); // login + 1 rotacao: nenhum token duplicado emitido
    }
  });

  it('refresh expirado ou desconhecido: 401, sem abrir sessao nova e sem revogar a vigente', async () => {
    const { u } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json;
    expect((await renovar(s.base, 'rt_' + randomBytes(32).toString('base64url'))).status).toBe(401);
    s.relogio.avancar(30 * 86400 + 1);
    expect((await renovar(s.base, a.refresh_token)).status).toBe(401);
    const [sessao] = await fx`select revogada_em from app.sessao where id = ${a.sessao_id}`;
    expect(sessao!['revogada_em']).toBeNull();
    s.relogio.avancar(-(30 * 86400 + 1));
  });

  it('perda de resposta da renovacao (retry legitimo) hoje derruba a sessao: custo da politica estrita', async () => {
    const { u } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json;
    await renovar(s.base, a.refresh_token); // servidor aplicou; resposta "perdida" no caminho
    expect((await renovar(s.base, a.refresh_token)).status).toBe(401); // cliente repete com o token que ainda tem
    const [sessao] = await fx`select motivo from app.sessao where id = ${a.sessao_id}`;
    expect(sessao!['motivo']).toBe('reuso_refresh'); // indistinguivel de roubo sem mecanismo de retry
  });
});

describe('revogacao de sessao', () => {
  it('logout: access e refresh morrem na hora; outras sessoes do usuario continuam', async () => {
    const { u, c } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json; const outra = (await login(s.base, u.email)).json;
    const r = await fetch(`${s.base}/v1/acesso/sair`, { method: 'POST', headers: { authorization: `Bearer ${a.access_token}` } });
    expect(r.status).toBe(204);
    expect((await get(s.base, '/v1/recursos', a.access_token, c)).status).toBe(401);
    expect((await renovar(s.base, a.refresh_token)).status).toBe(401);
    expect((await get(s.base, '/v1/recursos', outra.access_token, c)).status).toBe(200);
  });

  it('troca de senha: revoga todas as sessoes, abre uma nova; senha antiga deixa de entrar', async () => {
    const { u, c } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json; const b = (await login(s.base, u.email)).json;
    const r = await fetch(`${s.base}/v1/eu/senha`, { method: 'PUT', headers: { authorization: `Bearer ${a.access_token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ senha_atual: SENHA, nova_senha: 'Outra-senha-ficticia-2' }) });
    expect(r.status).toBe(200);
    const nova = (await r.json()) as typeof a;
    for (const t of [a, b]) {
      expect((await get(s.base, '/v1/recursos', t.access_token, c)).status).toBe(401);
      expect((await renovar(s.base, t.refresh_token)).status).toBe(401);
    }
    expect((await get(s.base, '/v1/recursos', nova.access_token, c)).status).toBe(200);
    expect((await login(s.base, u.email)).status).toBe(401); // senha antiga
    const ok = await fetch(`${s.base}/v1/acesso/entrar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: u.email, senha: 'Outra-senha-ficticia-2' }) });
    expect(ok.status).toBe(200);
  });

  it('troca de senha com senha atual errada: 401 e nada e revogado', async () => {
    const { u, c } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json;
    const r = await fetch(`${s.base}/v1/eu/senha`, { method: 'PUT', headers: { authorization: `Bearer ${a.access_token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ senha_atual: 'errada-errada', nova_senha: 'Outra-senha-ficticia-2' }) });
    expect(r.status).toBe(401);
    expect((await get(s.base, '/v1/recursos', a.access_token, c)).status).toBe(200);
  });

  it('exclusao LGPD: revoga tudo, anonimiza o acesso e impede novo login e renovacao', async () => {
    const { u, c } = await usuarioComContexto();
    const a = (await login(s.base, u.email)).json; const b = (await login(s.base, u.email)).json;
    const r = await fetch(`${s.base}/v1/eu`, { method: 'DELETE', headers: { authorization: `Bearer ${a.access_token}` } });
    expect(r.status).toBe(204);
    for (const t of [a, b]) {
      expect((await get(s.base, '/v1/recursos', t.access_token, c)).status).toBe(401);
      expect((await renovar(s.base, t.refresh_token)).status).toBe(401);
    }
    expect((await login(s.base, u.email)).status).toBe(401);
    const [linha] = await fx`select email, senha_hash, excluido_em from app.usuario where id = ${u.id}`;
    expect(linha!['email']).toMatch(/^excluido-.*@anonimo\.invalid$/);
    expect(linha!['senha_hash']).toBeNull();
    expect(linha!['excluido_em']).not.toBeNull();
  });

  it('login: e-mail inexistente e senha errada respondem igual (sem enumeracao)', async () => {
    const { u } = await usuarioComContexto();
    const f = (email: string, senha: string) => fetch(`${s.base}/v1/acesso/entrar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, senha }) });
    const [x, y] = await Promise.all([f(u.email, 'errada-errada'), f('nao-existe@exemplo.invalid', 'errada-errada')]);
    expect([x.status, y.status]).toEqual([401, 401]);
    expect(await x.text()).toBe(await y.text());
  });
});
