import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ChaveDeIdempotenciaReutilizada } from '../erros/index.js';
import { sql, TenantContext, type ContextoDeTenant, type Transacao } from '../tenant/index.js';

export interface RespostaDoAto {
  status: number;
  corpo?: unknown;
}

export interface Requisicao {
  /** Valor de Idempotency-Key; sem ele o ato roda normalmente, sem guarda. */
  chave?: string;
  metodo: string;
  rota: string;
  corpo: unknown;
}

// Sinal interno: perdi a corrida pela chave; desfaz o ato inteiro e relê a resposta gravada.
class PerdeuACorrida extends Error {}

const canonico = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(canonico)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([k, x]) => [k, canonico(x)]),
        )
      : v;

const hashDoCorpo = (corpo: unknown) =>
  createHash('sha256')
    .update(JSON.stringify(canonico(corpo ?? null)))
    .digest('hex');

/**
 * Idempotency-Key (E17): a guarda é gravada na MESMA transação do ato, então ato e guarda nascem ou
 * somem juntos. Sem ON CONFLICT DO UPDATE (com RLS ele erra em vez de filtrar): a corrida é
 * resolvida pela PK (23505) e a linha expirada, por UPDATE ... where expira_em <= now().
 */
@Injectable()
export class Idempotencia {
  constructor(@Inject(TenantContext) private readonly tenant: TenantContext) {}

  async executar(
    ctx: ContextoDeTenant & { usuarioId: string },
    req: Requisicao,
    ato: (tx: Transacao) => Promise<RespostaDoAto>,
  ): Promise<RespostaDoAto & { repetida: boolean }> {
    if (!req.chave) return { ...(await this.tenant.executar(ctx, ato)), repetida: false };
    // Segunda volta só ocorre após perder a corrida; na terceira a linha já existe e é válida.
    for (let volta = 0; ; volta++) {
      try {
        return await this.tenant.executar(ctx, (tx) =>
          this.uma(tx, ctx, req as Required<Requisicao>, ato),
        );
      } catch (e) {
        const chaveDuplicada =
          (e as { code?: string }).code === '23505' &&
          (e as { constraint_name?: string }).constraint_name === 'requisicao_idempotente_pkey';
        if ((e instanceof PerdeuACorrida || chaveDuplicada) && volta < 2) continue;
        throw e;
      }
    }
  }

  private async uma(
    tx: Transacao,
    ctx: ContextoDeTenant & { usuarioId: string },
    req: Required<Requisicao>,
    ato: (tx: Transacao) => Promise<RespostaDoAto>,
  ) {
    const hash = hashDoCorpo(req.corpo);
    const existente = await tx
      .selectFrom('requisicao_idempotente')
      .selectAll()
      .select(sql<boolean>`expira_em <= now()`.as('expirada'))
      .where('usuario_id', '=', ctx.usuarioId)
      .where('chave', '=', req.chave)
      .where('condominio_id', '=', ctx.condominioId)
      .executeTakeFirst();
    if (existente && !existente.expirada) {
      if (
        existente.hash_corpo !== hash ||
        existente.metodo !== req.metodo ||
        existente.rota !== req.rota
      ) {
        throw new ChaveDeIdempotenciaReutilizada();
      }
      return {
        status: existente.status_http,
        corpo: existente.resposta ?? undefined,
        repetida: true,
      };
    }

    const r = await ato(tx);
    const valores = {
      metodo: req.metodo,
      rota: req.rota,
      hash_corpo: hash,
      status_http: r.status,
      resposta: (r.corpo ?? null) as never,
    };
    if (existente) {
      const renovada = await tx
        .updateTable('requisicao_idempotente')
        .set({
          ...valores,
          criada_em: sql`now()`,
          expira_em: sql`now() + interval '24 hours'`,
        })
        .where('condominio_id', '=', ctx.condominioId)
        .where('usuario_id', '=', ctx.usuarioId)
        .where('chave', '=', req.chave)
        .where('expira_em', '<=', sql<Date>`now()`)
        .executeTakeFirst();
      // Outra requisição renovou a chave primeiro: o UPDATE não casa mais; desfaz o ato.
      if (renovada.numUpdatedRows === 0n) throw new PerdeuACorrida();
    } else {
      await tx
        .insertInto('requisicao_idempotente')
        .values({
          condominio_id: ctx.condominioId,
          usuario_id: ctx.usuarioId,
          chave: req.chave,
          ...valores,
        })
        .execute();
    }
    return { ...r, repetida: false };
  }
}
