import { Inject, Injectable } from '@nestjs/common';
import { LimiteDeTaxaExcedido } from '../../../compartilhado/erros/index.js';
import { CONFIG_ACESSO, type ConfigAcesso } from '../config.js';
import { Credenciais } from './credenciais.js';
import { RELOGIO, type Relogio } from './relogio.js';

const JANELA_MS = 60_000;

/**
 * Limite de taxa de /v1/acesso/* (E16), por IP e por e-mail, em janela fixa de 1 minuto e em
 * memória. shortcut: o contador se perde ao reiniciar e não é compartilhado entre instâncias;
 * mover para o banco ou um cache se a API passar de uma instância. O e-mail entra só como HMAC.
 */
@Injectable()
export class LimitadorDeTaxa {
  private readonly janelas = new Map<string, { inicio: number; usos: number }>();

  constructor(
    @Inject(CONFIG_ACESSO) private readonly config: ConfigAcesso,
    @Inject(Credenciais) private readonly cred: Credenciais,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  porIp(ip: string | undefined): void {
    this.consumir(`ip:${ip ?? 'desconhecido'}`, this.config.limiteIpPorMinuto);
  }

  porEmail(email: string): void {
    this.consumir(`email:${this.cred.chaveDeLimite(email)}`, this.config.limiteEmailPorMinuto);
  }

  private consumir(chave: string, limite: number): void {
    const agora = this.relogio.agora().getTime();
    if (this.janelas.size > 10_000) {
      for (const [k, j] of this.janelas) if (agora >= j.inicio + JANELA_MS) this.janelas.delete(k);
    }
    let j = this.janelas.get(chave);
    if (!j || agora >= j.inicio + JANELA_MS) {
      j = { inicio: agora, usos: 0 };
      this.janelas.set(chave, j);
    }
    j.usos += 1;
    if (j.usos > limite) throw new LimiteDeTaxaExcedido((j.inicio + JANELA_MS - agora) / 1000 || 1);
  }
}
