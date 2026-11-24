import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { LimitadorDeTaxa } from '../../../modulos/autenticacao/index.js';

/** Limite por IP em todo /v1/acesso/* (E16). O limite por e-mail fica no handler, depois do corpo validado. */
@Injectable()
export class LimitePorIpGuard implements CanActivate {
  constructor(@Inject(LimitadorDeTaxa) private readonly limitador: LimitadorDeTaxa) {}

  canActivate(contexto: ExecutionContext): boolean {
    this.limitador.porIp(contexto.switchToHttp().getRequest<Request>().ip);
    return true;
  }
}
