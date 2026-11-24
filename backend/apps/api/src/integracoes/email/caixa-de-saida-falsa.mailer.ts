import type { Mailer, MensagemDeEmail } from '../../compartilhado/portas/index.js';

/** Adaptador em memória (E14): guarda o que seria enviado. O adaptador do Resend vem depois. */
export class CaixaDeSaidaFalsa implements Mailer {
  readonly enviados: MensagemDeEmail[] = [];

  async enviar(mensagem: MensagemDeEmail): Promise<void> {
    this.enviados.push(mensagem);
  }
}
