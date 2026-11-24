export const MAILER = Symbol('MAILER');

export interface MensagemDeEmail {
  para: string;
  assunto: string;
  texto: string;
}

/** Porta de e-mail (ADR-005): o domínio nunca conhece o provedor. */
export interface Mailer {
  enviar(mensagem: MensagemDeEmail): Promise<void>;
}
