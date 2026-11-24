import { createHmac, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { CONFIG_ACESSO, type ConfigAcesso } from '../config.js';

// Hash de uma senha que ninguém tem: o login de e-mail inexistente gasta o mesmo tempo de um real.
let senhaFalsa: Promise<string> | undefined;

/**
 * Tudo o que protege credencial: HMAC com segredo do servidor (nunca hash simples) para e-mail,
 * código e refresh, e Argon2id com os parâmetros padrão da biblioteca (64 MiB, 3 passes, 4 de
 * paralelismo; E16) para senha.
 */
@Injectable()
export class Credenciais {
  constructor(@Inject(CONFIG_ACESSO) private readonly config: ConfigAcesso) {}

  normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // O domínio separa os usos: o mesmo valor em usos diferentes dá HMACs diferentes.
  private mac(dominio: string, valor: string): string {
    return createHmac('sha256', this.config.chaveHmac).update(`${dominio}\0${valor}`).digest('hex');
  }

  /** desafio_acesso.destino_protegido. */
  destinoProtegido(email: string): string {
    return this.mac('destino', this.normalizarEmail(email));
  }

  /** controle_login.chave_tentativa_protegida (login, troca de senha e e-mail desconhecido). */
  chaveDeLogin(email: string): string {
    return this.mac('login', this.normalizarEmail(email));
  }

  /** controle_login.chave_tentativa_protegida do teto de códigos errados (RN-CD-02); distinta da chave do login. */
  chaveDeCodigo(email: string): string {
    return this.mac('codigo-teto', this.normalizarEmail(email));
  }

  /** Chave do limitador em memória por e-mail. */
  chaveDeLimite(email: string): string {
    return this.mac('limite', this.normalizarEmail(email));
  }

  /** O código fica preso ao desafio: o mesmo código em outro desafio dá outro hash. */
  hashDoCodigo(desafioId: string, codigo: string): string {
    return this.mac('codigo', `${desafioId}:${codigo}`);
  }

  hashDoSegredoDeRenovacao(segredo: string): string {
    return this.mac('renovacao', segredo);
  }

  /** Comparação em tempo constante de dois hashes hexadecimais. */
  iguais(a: string, b: string): boolean {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  }

  hashDaSenha(senha: string): Promise<string> {
    return argon2.hash(senha);
  }

  /** `hash` nulo (conta inexistente ou sem senha) confere contra o hash falso e dá sempre falso. */
  async senhaConfere(hash: string | null, senha: string): Promise<boolean> {
    senhaFalsa ??= argon2.hash('senha-que-ninguem-tem');
    try {
      const ok = await argon2.verify(hash ?? (await senhaFalsa), senha);
      return ok && hash !== null;
    } catch {
      return false;
    }
  }
}
