import { SignJWT, jwtVerify, errors } from 'jose';

export interface ChaveJwt { kid: string; segredo: Uint8Array }
export interface Claims { sub: string; sid: string }

/** Chaveiro com kid: assina com a chave ativa; verifica com qualquer chave ainda presente (rotacao sem derrubar sessoes). */
export class Chaveiro {
  constructor(private chaves: ChaveJwt[], private ativa: string) {}
  rotacionar(nova: ChaveJwt) { this.chaves = [nova, ...this.chaves]; this.ativa = nova.kid; }
  aposentar(kid: string) { this.chaves = this.chaves.filter((c) => c.kid !== kid); }
  private achar(kid?: string) { return this.chaves.find((c) => c.kid === kid); }

  async emitir(c: Claims, agora: Date, ttlS: number): Promise<string> {
    const k = this.achar(this.ativa)!;
    const t = Math.floor(agora.getTime() / 1000);
    return new SignJWT({ sid: c.sid }).setProtectedHeader({ alg: 'HS256', kid: k.kid, typ: 'at+jwt' })
      .setSubject(c.sub).setIssuer('condomifacil').setAudience('condomifacil-api').setIssuedAt(t).setExpirationTime(t + ttlS)
      .sign(k.segredo);
  }

  /** Lanca se assinatura, algoritmo, kid, emissor, audiencia ou validade falham. So `sub` e `sid` sao lidos. */
  async verificar(jwt: string, agora: Date): Promise<Claims> {
    const { payload } = await jwtVerify(jwt, async (h) => {
      const k = this.achar(h.kid);
      if (!k) throw new errors.JWSSignatureVerificationFailed('kid desconhecido');
      return k.segredo;
    }, { algorithms: ['HS256'], issuer: 'condomifacil', audience: 'condomifacil-api', currentDate: agora, requiredClaims: ['sub', 'sid', 'exp'] });
    return { sub: payload.sub as string, sid: payload['sid'] as string };
  }
}
