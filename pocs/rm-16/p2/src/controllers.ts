import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Param, Post, Put, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CONFIG, DB, comContexto, type Config, type Db } from './infra.ts';
import { AutenticacaoGuard, COOKIE_REFRESH, ContextoGuard, Papeis, cookieRefresh, exigirOrigemWeb, lerCookie, type ReqAuth } from './guards.ts';
import { SessoesService, type Par } from './sessoes.service.ts';

const texto = (v: unknown, nome: string): string => {
  if (typeof v !== 'string' || v.length === 0 || v.length > 512) throw new BadRequestException(nome);
  return v;
};

/** Web: refresh so no cookie httpOnly; o corpo nunca o devolve. App: refresh no corpo (expo-secure-store). */
function responder(par: Par, cliente: 'app' | 'web', res: Response, cfg: Config) {
  if (cliente === 'app') return par;
  res.setHeader('Set-Cookie', cookieRefresh(par.refresh_token, cfg.refreshTtlS));
  const { refresh_token: _omitido, ...semRefresh } = par;
  return semRefresh;
}

@Controller('v1/acesso')
export class AcessoController {
  constructor(@Inject(SessoesService) private sessoes: SessoesService, @Inject(CONFIG) private cfg: Config) {}

  @Post('entrar') @HttpCode(200)
  async entrar(@Body() b: Record<string, unknown>, @Req() req: ReqAuth, @Res({ passthrough: true }) res: Response) {
    const cliente = b['cliente'] === 'web' ? 'web' : 'app';
    if (cliente === 'web') exigirOrigemWeb(req, this.cfg);
    return responder(await this.sessoes.entrar(texto(b['email'], 'email'), texto(b['senha'], 'senha'), cliente), cliente, res, this.cfg);
  }

  @Post('renovar') @HttpCode(200)
  async renovar(@Body() b: Record<string, unknown>, @Req() req: ReqAuth, @Res({ passthrough: true }) res: Response) {
    const doCorpo = typeof b?.['refresh_token'] === 'string' ? b['refresh_token'] : undefined;
    const cliente = doCorpo ? 'app' : 'web';
    if (cliente === 'web') exigirOrigemWeb(req, this.cfg);
    const token = doCorpo ?? lerCookie(req, COOKIE_REFRESH);
    if (!token) throw new UnauthorizedException();
    try {
      return responder(await this.sessoes.renovar(token), cliente, res, this.cfg);
    } catch (e) {
      if (cliente === 'web') res.setHeader('Set-Cookie', cookieRefresh('', 0)); // limpa o cookie invalido/revogado
      throw e;
    }
  }

  @Post('sair') @HttpCode(204) @UseGuards(AutenticacaoGuard)
  async sair(@Req() req: ReqAuth, @Res({ passthrough: true }) res: Response) {
    await this.sessoes.revogarSessao(req.auth!.sid, 'logout');
    res.setHeader('Set-Cookie', cookieRefresh('', 0));
  }
}

@Controller('v1/eu') @UseGuards(AutenticacaoGuard)
export class EuController {
  constructor(@Inject(SessoesService) private sessoes: SessoesService, @Inject(CONFIG) private cfg: Config) {}

  @Put('senha') @HttpCode(200)
  async trocarSenha(@Body() b: Record<string, unknown>, @Req() req: ReqAuth, @Res({ passthrough: true }) res: Response) {
    const cliente = b['cliente'] === 'web' ? 'web' : 'app';
    if (cliente === 'web') exigirOrigemWeb(req, this.cfg);
    const par = await this.sessoes.trocarSenha(req.auth!.sub, texto(b['senha_atual'], 'senha_atual'), texto(b['nova_senha'], 'nova_senha'), cliente);
    return responder(par, cliente, res, this.cfg);
  }

  @Delete() @HttpCode(204)
  async excluir(@Req() req: ReqAuth, @Res({ passthrough: true }) res: Response) {
    await this.sessoes.excluirConta(req.auth!.sub);
    res.setHeader('Set-Cookie', cookieRefresh('', 0));
  }
}

/** Rotas com contexto: AutenticacaoGuard, ContextoGuard e, na transacao, set_config para a RLS (camada 4). */
@Controller('v1') @UseGuards(AutenticacaoGuard, ContextoGuard)
export class RecursosController {
  constructor(@Inject(DB) private db: Db) {}
  private ctx = (r: ReqAuth) => ({ usuarioId: r.auth!.sub, condominioId: r.condominioId!, papel: r.papel! });

  @Get('recursos')
  async listar(@Req() req: ReqAuth) {
    const avisos = await comContexto(this.db, this.ctx(req), (tx) => tx.selectFrom('app.aviso').select(['id', 'texto']).execute());
    return { papel: req.papel, avisos };
  }

  @Get('recursos/avisos/:id')
  async um(@Param('id') id: string, @Req() req: ReqAuth) {
    const a = await comContexto(this.db, this.ctx(req), (tx) => tx.selectFrom('app.aviso').select(['id', 'texto']).where('id', '=', id).executeTakeFirst());
    if (!a) throw new NotFoundException(); // outro condominio = 404 (nunca 403)
    return a;
  }

  @Post('sindico/avisos') @Papeis('sindico') @HttpCode(201)
  async criar(@Body() b: Record<string, unknown>, @Req() req: ReqAuth) {
    const t = texto(b['texto'], 'texto');
    return comContexto(this.db, this.ctx(req), (tx) => tx.insertInto('app.aviso').values({ condominio_id: req.condominioId!, texto: t }).returning('id').executeTakeFirstOrThrow());
  }
}
