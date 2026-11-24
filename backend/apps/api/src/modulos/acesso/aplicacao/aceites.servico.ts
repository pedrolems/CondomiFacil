import { Inject, Injectable } from '@nestjs/common';
import { sql, TenantContext, type Transacao } from '../../../compartilhado/tenant/index.js';
import { AceiteVersaoDesatualizada } from '../erros.js';

export interface DocumentoPendente {
  documento_versao_id: string;
  documento_id: string;
  tipo: string;
  titulo: string;
  numero: number;
  condominio_id: string | null;
  publicado_em: Date;
  vigente_desde: Date;
  conteudo_texto: string | null;
}

export interface AceiteRegistrado {
  documento_versao_id: string;
  aceito_em: Date;
}

// Versão vigente = maior `numero` já em vigor (`vigente_desde <= now()`) do documento (RN-CD-03):
// versão agendada para o futuro não é pendência nem aceitável. RLS (app_user, só usuário): enxerga
// os documentos globais; o regimento por condomínio só aparece com condomínio no contexto.
const VIGENTE = sql<boolean>`dv.vigente_desde <= now() and dv.numero = (select max(v.numero)
  from condomifacil.documento_versao v where v.documento_id = d.id and v.vigente_desde <= now())`;

/**
 * Aceites de documentos (RN-CD-03, SEG-03), pelo app_user com escopo só de usuário.
 * Pendência (RM-21): o regimento de cada condomínio depende dos vínculos do titular; hoje só os
 * documentos globais (condominio_id nulo) entram. Para estender, trocar o filtro `d.condominio_id is
 * null` por "global ou condomínio com vínculo vigente do titular" em `vigentes`, sem mexer no resto.
 */
@Injectable()
export class AceitesServico {
  constructor(@Inject(TenantContext) private readonly tenant: TenantContext) {}

  private vigentes(tx: Transacao, usuarioId: string) {
    return tx
      .selectFrom('documento as d')
      .innerJoin('documento_versao as dv', 'dv.documento_id', 'd.id')
      .leftJoin('aceite as a', (j) =>
        j.onRef('a.documento_versao_id', '=', 'dv.id').on('a.usuario_id', '=', usuarioId),
      )
      .where('d.condominio_id', 'is', null)
      .where(VIGENTE);
  }

  async temPendentes(usuarioId: string): Promise<boolean> {
    return this.tenant.executarComoUsuario({ usuarioId }, async (tx) => {
      const r = await this.vigentes(tx, usuarioId)
        .where('a.id', 'is', null)
        .select('dv.id')
        .limit(1)
        .executeTakeFirst();
      return r !== undefined;
    });
  }

  /** Ordenado por id da versão (cursor estável); pede limite + 1 para saber se há mais. */
  listarPendentes(
    usuarioId: string,
    limite: number,
    depoisDe?: string,
  ): Promise<DocumentoPendente[]> {
    return this.tenant.executarComoUsuario({ usuarioId }, (tx) => {
      let q = this.vigentes(tx, usuarioId)
        .where('a.id', 'is', null)
        .select([
          'dv.id as documento_versao_id',
          'd.id as documento_id',
          'd.tipo',
          'd.titulo',
          'dv.numero',
          'd.condominio_id',
          'dv.publicado_em',
          'dv.vigente_desde',
          'dv.conteudo_texto',
        ])
        .orderBy('dv.id')
        .limit(limite + 1);
      if (depoisDe) q = q.where('dv.id', '>', depoisDe);
      return q.execute();
    });
  }

  /**
   * Tudo ou nada: uma versão que não é a vigente (ou que o titular não enxerga) desfaz o pedido
   * inteiro. Versão já aceita pelo titular não duplica (único por usuário e versão).
   */
  async registrar(
    usuarioId: string,
    versaoIds: string[],
  ): Promise<{ aceitos: AceiteRegistrado[]; pendentesRestantes: number }> {
    const ids = [...new Set(versaoIds)];
    return this.tenant.executarComoUsuario({ usuarioId }, async (tx) => {
      const alvo = await this.vigentes(tx, usuarioId)
        .where('dv.id', 'in', ids)
        .select(['dv.id', 'a.aceito_em'])
        .execute();
      if (alvo.length !== ids.length) throw new AceiteVersaoDesatualizada();

      const aceitos: AceiteRegistrado[] = [];
      for (const v of alvo) {
        let aceitoEm = v.aceito_em;
        if (!aceitoEm) {
          const novo = await tx
            .insertInto('aceite')
            .values({ usuario_id: usuarioId, documento_versao_id: v.id })
            .onConflict((oc) => oc.columns(['usuario_id', 'documento_versao_id']).doNothing())
            .returning('aceito_em')
            .executeTakeFirst();
          aceitoEm =
            novo?.aceito_em ??
            (
              await tx
                .selectFrom('aceite')
                .select('aceito_em')
                .where('usuario_id', '=', usuarioId)
                .where('documento_versao_id', '=', v.id)
                .executeTakeFirstOrThrow()
            ).aceito_em;
        }
        aceitos.push({ documento_versao_id: v.id, aceito_em: aceitoEm });
      }
      const restantes = await this.vigentes(tx, usuarioId)
        .where('a.id', 'is', null)
        .select((eb) => eb.fn.countAll<string>().as('n'))
        .executeTakeFirstOrThrow();
      return { aceitos, pendentesRestantes: Number(restantes.n) };
    });
  }
}
