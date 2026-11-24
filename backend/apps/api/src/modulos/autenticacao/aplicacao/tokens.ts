import { Inject, Injectable } from '@nestjs/common';
import { jwtVerify, SignJWT } from 'jose';
import { NaoAutenticado } from '../../../compartilhado/erros/index.js';
import { UUID } from '../../../compartilhado/uuid.js';
import { CONFIG_ACESSO, type ConfigAcesso } from '../config.js';

// Algoritmo fixo: `algorithms` só aceita este, então "none" e outros algoritmos não passam.
const ALGORITMO = 'HS256';

export interface IdentidadeDoToken {
  /** usuario.id */
  sub: string;
  /** sessao.id */
  sid: string;
}

/**
 * JWT de acesso (ADR-007, E15) pela biblioteca `jose`: HS256, 15 min, só `sub` e `sid` (mais emissor,
 * audiência e prazo), sem papéis nem condomínios. `verificar` é a única função que lê um token de
 * acesso; a sessão viva é conferida pelo chamador a cada requisição.
 */
@Injectable()
export class TokenDeAcesso {
  constructor(@Inject(CONFIG_ACESSO) private readonly config: ConfigAcesso) {}

  async emitir(
    identidade: IdentidadeDoToken,
    agora: Date,
  ): Promise<{ token: string; expiraEm: Date }> {
    const iat = Math.floor(agora.getTime() / 1000);
    const exp = iat + this.config.ttlAcessoSegundos;
    const token = await new SignJWT({ sid: identidade.sid })
      .setProtectedHeader({ alg: ALGORITMO, typ: 'JWT' })
      .setSubject(identidade.sub)
      .setIssuer(this.config.emissor)
      .setAudience(this.config.audiencia)
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(this.config.chaveJwt);
    return { token, expiraEm: new Date(exp * 1000) };
  }

  /** Qualquer defeito vira o mesmo NaoAutenticado (401): o cliente não aprende o motivo. */
  async verificar(token: string, agora: Date): Promise<IdentidadeDoToken> {
    try {
      const { payload } = await jwtVerify(token, this.config.chaveJwt, {
        algorithms: [ALGORITMO],
        issuer: this.config.emissor,
        audience: this.config.audiencia,
        currentDate: agora,
        requiredClaims: ['exp', 'sub', 'sid'],
      });
      const { sub, sid } = payload;
      if (
        typeof sub !== 'string' ||
        !UUID.test(sub) ||
        typeof sid !== 'string' ||
        !UUID.test(sid)
      ) {
        throw new NaoAutenticado();
      }
      return { sub, sid };
    } catch {
      throw new NaoAutenticado();
    }
  }
}
