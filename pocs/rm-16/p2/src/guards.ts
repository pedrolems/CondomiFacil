import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CONFIG, RELOGIO, type Config, type Relogio } from './infra.ts';
import { PapelService } from './papel.service.ts';
import { CHAVEIRO, SessoesService } from './sessoes.service.ts';
import { Chaveiro } from './tokens.ts';

export interface ReqAuth extends Request { auth?: { sub: string; sid: string }; papel?: string; condominioId?: string }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Papeis aceitos na rota. Sem o decorator, qualquer papel com vinculo valido passa. */
export const Papeis = (...p: string[]) => SetMetadata('papeis', p);

/** Etapa 2 da cadeia (guia 3): JWT valido (so sub e sid) e sessao nao revogada. 401 em qualquer falha. */
@Injectable()
export class AutenticacaoGuard implements CanActivate {
  constructor(@Inject(CHAVEIRO) private chaves: Chaveiro, @Inject(RELOGIO) private relogio: Relogio, @Inject(SessoesService) private sessoes: SessoesService) {}
  async canActivate(c: ExecutionContext) {
    const req = c.switchToHttp().getRequest<ReqAuth>();
    const m = /^Bearer (\S+)$/.exec(req.header('authorization') ?? '');
    if (!m) throw new UnauthorizedException();
    let claims;
    try { claims = await this.chaves.verificar(m[1]!, this.relogio.agora()); } catch { throw new UnauthorizedException(); }
    if (!(await this.sessoes.sessaoViva(claims.sid, claims.sub))) throw new UnauthorizedException();
    req.auth = claims;
    return true;
  }
}

/** Etapas 3 e 4: X-Condominio-Id com vinculo (403 sem) e papel efetivo hoje resolvido no servidor. */
@Injectable()
export class ContextoGuard implements CanActivate {
  constructor(@Inject(PapelService) private papeis: PapelService, @Inject(Reflector) private refl: Reflector) {}
  async canActivate(c: ExecutionContext) {
    const req = c.switchToHttp().getRequest<ReqAuth>();
    const cond = req.header('x-condominio-id');
    if (!cond || !UUID.test(cond)) throw new ForbiddenException();
    const papel = await this.papeis.resolver(req.auth!.sub, cond);
    if (!papel) throw new ForbiddenException();
    const exigidos = this.refl.getAllAndOverride<string[] | undefined>('papeis', [c.getHandler(), c.getClass()]);
    if (exigidos && !exigidos.includes(papel)) throw new ForbiddenException();
    req.papel = papel;
    req.condominioId = cond;
    return true;
  }
}

/**
 * Protecao CSRF do cookie de refresh (ADR-007, linha 43). O cookie e SameSite=Lax, mas isso sozinho nao
 * basta (ataque a partir de subdominio irmao). Exigimos Origin na lista e um cabecalho proprio, que
 * navegador nao envia em formulario nem em fetch cross-origin sem preflight aprovado pelo CORS.
 */
export function exigirOrigemWeb(req: Request, cfg: Config) {
  const origin = req.header('origin');
  if (!origin || !cfg.origensWeb.includes(origin) || req.header('x-condomifacil-web') !== '1') throw new ForbiddenException('CSRF');
}

export function lerCookie(req: Request, nome: string): string | undefined {
  for (const par of (req.header('cookie') ?? '').split(';')) {
    const i = par.indexOf('=');
    if (i > 0 && par.slice(0, i).trim() === nome) return par.slice(i + 1).trim();
  }
  return undefined;
}

export const COOKIE_REFRESH = 'rt';
export const cookieRefresh = (valor: string, maxAgeS: number) =>
  `${COOKIE_REFRESH}=${valor}; HttpOnly; Secure; SameSite=Lax; Path=/v1/acesso; Max-Age=${maxAgeS}`;
