import { randomBytes, randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import argon2 from 'argon2';
import postgres from 'postgres';
import { criarApp } from '../src/app.ts';
import type { Config, Relogio } from '../src/infra.ts';
import { Chaveiro } from '../src/tokens.ts';

export const SENHA = 'Senha-ficticia-1';
const HASH = await argon2.hash(SENHA, { type: argon2.argon2id });
export const ORIGEM = 'https://painel.exemplo.invalid';

/** Relogio controlavel: o servidor inteiro (JWT, expiracao, cache) le o tempo daqui. */
export class RelogioFalso implements Relogio {
  t = Date.now();
  agora() { return new Date(this.t); }
  avancar(s: number) { this.t += s * 1000; }
}

export const novoChaveiro = (kid = 'k1') => new Chaveiro([{ kid, segredo: randomBytes(32) }], kid);

/** Papel "fixtures" (BYPASSRLS): simula a administradora/outra instancia alterando dados e prepara massa. Nunca e a API. */
export const fx = postgres({ host: 'localhost', port: 54329, database: 'p2', username: 'fixtures', password: 'fixtures_local_ficticia', onnotice: () => {} });

export async function subir(config: Partial<Config> = {}) {
  const relogio = new RelogioFalso();
  const chaveiro = novoChaveiro();
  const a = await criarApp({ config, relogio, chaveiro });
  await a.app.listen(0);
  const base = `http://127.0.0.1:${(a.app.getHttpServer().address() as AddressInfo).port}`;
  return { ...a, relogio, chaveiro, base, server: a.app.getHttpServer(), fim: () => a.encerrar() };
}

export async function criarCondominio(plano: 'essencial' | 'gestao_suporte' = 'essencial') {
  const id = randomUUID();
  await fx`insert into app.condominio (id, nome, plano) values (${id}, ${'Condominio ficticio ' + id.slice(0, 6)}, ${plano})`;
  return id;
}
export async function criarUsuario(tipo: 'comum' | 'suporte' = 'comum') {
  const id = randomUUID();
  const email = `u-${id}@exemplo.invalid`;
  await fx`insert into app.usuario (id, email, senha_hash, tipo) values (${id}, ${email}, ${HASH}, ${tipo})`;
  return { id, email };
}
export const vincular = (u: string, c: string, papel: string, ativo = true) =>
  fx`insert into app.vinculo (usuario_id, condominio_id, papel, ativo) values (${u}, ${c}, ${papel}, ${ativo})`;
export const criarAviso = (c: string, texto: string) => fx`insert into app.aviso (condominio_id, texto) values (${c}, ${texto}) returning id`.then((r) => r[0]!['id'] as string);

export async function login(base: string, email: string, extra: Record<string, unknown> = {}) {
  const r = await fetch(`${base}/v1/acesso/entrar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, senha: SENHA, ...extra }) });
  return { status: r.status, json: (await r.json()) as { access_token: string; refresh_token: string; sessao_id: string } };
}
export const renovar = (base: string, refresh: string) =>
  fetch(`${base}/v1/acesso/renovar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh }) });
export const get = (base: string, caminho: string, access: string, cond?: string) =>
  fetch(`${base}${caminho}`, { headers: { authorization: `Bearer ${access}`, ...(cond ? { 'x-condominio-id': cond } : {}) } });
export const decodificar = (jwt: string) => ({
  cabecalho: JSON.parse(Buffer.from(jwt.split('.')[0]!, 'base64url').toString()) as Record<string, unknown>,
  claims: JSON.parse(Buffer.from(jwt.split('.')[1]!, 'base64url').toString()) as Record<string, unknown>,
});

/** Navegador simulado: guarda Set-Cookie (HttpOnly: o codigo do cliente nao le o jar), envia Cookie so no Path do cookie e Origin. */
export function navegador(origem = ORIGEM) {
  const jar = new Map<string, string>();
  const f: typeof fetch = async (url, init = {}) => {
    const u = new URL(url as string);
    const cab = new Headers(init.headers);
    cab.set('origin', origem);
    if (u.pathname.startsWith('/v1/acesso') && jar.size) cab.set('cookie', [...jar].map(([k, v]) => `${k}=${v}`).join('; '));
    const r = await fetch(url, { ...init, headers: cab });
    for (const sc of r.headers.getSetCookie()) {
      const [par] = sc.split(';'); const i = par!.indexOf('=');
      const nome = par!.slice(0, i), val = par!.slice(i + 1);
      if (/Max-Age=0/i.test(sc) || val === '') jar.delete(nome); else jar.set(nome, val);
    }
    return r;
  };
  return { fetch: f, jar };
}
