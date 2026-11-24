export const RELOGIO = Symbol('RELOGIO');

/** Relógio injetável: os prazos de código, pausa e retry se provam sem esperar (testes). */
export interface Relogio {
  agora(): Date;
}

export const relogioDoSistema: Relogio = { agora: () => new Date() };
