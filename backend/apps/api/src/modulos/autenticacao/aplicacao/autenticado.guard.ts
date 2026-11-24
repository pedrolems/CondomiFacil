import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { NaoAutenticado } from '../../../compartilhado/erros/index.js';
import { AcessoServico } from './acesso.servico.js';

export interface Autenticacao {
  usuarioId: string;
  sessaoId: string;
}
export type RequisicaoAutenticada = Request & { autenticacao: Autenticacao };

/** Rotas com `bearerJwt`: token válido e sessão viva (consulta por PK a cada requisição, sem cache). */
@Injectable()
export class AutenticadoGuard implements CanActivate {
  constructor(@Inject(AcessoServico) private readonly acesso: AcessoServico) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const http = contexto.switchToHttp();
    const req = http.getRequest<Request>();
    const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
    if (!m) throw new NaoAutenticado();
    const id = await this.acesso.identificar(m[1]!);
    (req as RequisicaoAutenticada).autenticacao = { usuarioId: id.sub, sessaoId: id.sid };
    http.getResponse<Response>().locals.contextoDeLog = { usuario_id: id.sub };
    return true;
  }
}
