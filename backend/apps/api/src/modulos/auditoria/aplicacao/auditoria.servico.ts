import { Injectable } from '@nestjs/common';
import { sanitizar } from '../../../compartilhado/logger/index.js';
import type { Transacao } from '../../../compartilhado/tenant/index.js';

export interface EntradaDeAuditoria {
  condominioId: string;
  /** Exatamente uma origem: pessoa ou rotina do sistema (check do banco). */
  ator: { usuarioId: string } | { sistema: string };
  papelEfetivo: string;
  acao: string;
  entidadeTipo: string;
  entidadeReferencia: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
  motivo?: string;
  correlacaoOperacao: string;
}

export interface EntradaDeAuditoriaPlataforma {
  atorUsuarioId: string;
  acao: string;
  entidadeTipo: string;
  entidadeReferencia: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
}

// O chamador manda dado já sem pessoa; `sanitizar` é a segunda barreira, não a primeira.
const limpo = (o?: Record<string, unknown>) => (o ? (sanitizar(o) as never) : null);

/** Grava na transação recebida (a do ato). As tabelas só aceitam inclusão; o horário é do banco. */
@Injectable()
export class AuditoriaServico {
  async registrar(tx: Transacao, e: EntradaDeAuditoria): Promise<void> {
    await tx
      .insertInto('auditoria')
      .values({
        condominio_id: e.condominioId,
        ator_usuario_id: 'usuarioId' in e.ator ? e.ator.usuarioId : null,
        ator_sistema: 'sistema' in e.ator ? e.ator.sistema : null,
        papel_efetivo: e.papelEfetivo,
        acao: e.acao,
        entidade_tipo: e.entidadeTipo,
        entidade_referencia: e.entidadeReferencia,
        antes_sanitizado: limpo(e.antes),
        depois_sanitizado: limpo(e.depois),
        motivo: e.motivo ?? null,
        correlacao_operacao: e.correlacaoOperacao,
      })
      .execute();
  }

  /** Só em `executarComoPlataforma`. Sem RETURNING: a tabela não tem política de SELECT. */
  async registrarPlataforma(tx: Transacao, e: EntradaDeAuditoriaPlataforma): Promise<void> {
    await tx
      .insertInto('auditoria_plataforma')
      .values({
        ator_usuario_id: e.atorUsuarioId,
        acao: e.acao,
        entidade_tipo: e.entidadeTipo,
        entidade_referencia: e.entidadeReferencia,
        antes_sanitizado: limpo(e.antes),
        depois_sanitizado: limpo(e.depois),
      })
      .execute();
  }
}
