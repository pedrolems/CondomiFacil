import type { Request, Response } from 'express';
import { OrigemNaoPermitida } from '../../../modulos/autenticacao/index.js';

const COOKIE = 'rt';
const CAMINHO = '/v1/acesso';
const opcoes = { httpOnly: true, secure: true, sameSite: 'lax', path: CAMINHO } as const;

export type Cliente = 'web' | 'app';

function cookieRt(req: Request): string | undefined {
  for (const parte of (req.headers.cookie ?? '').split(';')) {
    const [nome, ...valor] = parte.trim().split('=');
    if (nome === COOKIE) {
      try {
        return decodeURIComponent(valor.join('='));
      } catch {
        return undefined; // `%` malformado: tratado como ausente (401 normal), nunca 500.
      }
    }
  }
  return undefined;
}

/**
 * Web x app e CSRF (ADR-007, decisão de Pedro de 24/11/2026). Roda ANTES de qualquer leitura do
 * token ou do corpo. Web = `X-CondomiFacil-Web: 1` com `Origin` na lista. Origem ausente, `null` ou
 * de terceiro, ou cookie `rt` sem o cabeçalho, dá 403 ORIGEM_NAO_PERMITIDA sem consumir nada.
 */
export function classificarCliente(req: Request, origensPermitidas: string[]): Cliente {
  if (req.headers['x-condomifacil-web'] === '1') {
    const origem = req.headers.origin;
    if (typeof origem !== 'string' || !origensPermitidas.includes(origem)) {
      throw new OrigemNaoPermitida();
    }
    return 'web';
  }
  if (cookieRt(req) !== undefined) throw new OrigemNaoPermitida();
  return 'app';
}

/** Refresh de entrada: da web, só do cookie; do app, só do corpo. */
export function refreshRecebido(req: Request, cliente: Cliente): string | undefined {
  if (cliente === 'web') return cookieRt(req);
  const t = (req.body as { refresh_token?: unknown } | undefined)?.refresh_token;
  return typeof t === 'string' ? t : undefined;
}

export function gravarCookieRt(
  res: Response,
  refreshToken: string,
  validadeSegundos: number,
): void {
  res.cookie(COOKIE, refreshToken, { ...opcoes, maxAge: validadeSegundos * 1000 });
}

export function apagarCookieRt(res: Response): void {
  res.cookie(COOKIE, '', { ...opcoes, maxAge: 0 });
}
