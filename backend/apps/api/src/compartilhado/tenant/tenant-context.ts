import { Inject, Injectable } from '@nestjs/common';
import { BANCO, type Banco } from './banco.js';
import { abrirTransacao, type Transacao } from './transacao.js';

export interface ContextoDeTenant {
  condominioId: string;
  usuarioId?: string;
  unidadeId?: string;
  papel?: string;
}

/** Porta única para dados de tenant (ADR-001): toda consulta roda numa transação com o contexto. */
@Injectable()
export class TenantContext {
  constructor(@Inject(BANCO) private readonly banco: Banco) {}

  executar<T>(ctx: ContextoDeTenant, fn: (tx: Transacao) => Promise<T>): Promise<T> {
    return abrirTransacao(this.banco, ctx, fn);
  }

  /** Escopo de plataforma: só permite INSERIR em auditoria_plataforma (sem SELECT, sem RETURNING). */
  executarComoPlataforma<T>(
    ctx: { usuarioId: string },
    fn: (tx: Transacao) => Promise<T>,
  ): Promise<T> {
    return abrirTransacao(this.banco, { escopo: 'plataforma', usuarioId: ctx.usuarioId }, fn);
  }
}
