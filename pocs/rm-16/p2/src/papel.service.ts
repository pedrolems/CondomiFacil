import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { CONFIG, DB, RELOGIO, comContexto, type Config, type Db, type Relogio } from './infra.ts';

/**
 * Papel efetivo hoje (ADR-007, camada 2) com cache em processo. A janela de defasagem da permissao e
 * cachePapelMs. Vinculo ausente/inativo e suporte fora do plano Gestao + Suporte resolvem para null.
 */
@Injectable()
export class PapelService {
  private cache = new Map<string, { papel: string | null; ate: number }>();
  consultas = 0;
  constructor(@Inject(DB) private db: Db, @Inject(RELOGIO) private relogio: Relogio, @Inject(CONFIG) private cfg: Config) {}

  async resolver(usuarioId: string, condominioId: string): Promise<string | null> {
    const chave = `${usuarioId}|${condominioId}`;
    const agora = this.relogio.agora().getTime();
    const c = this.cache.get(chave);
    if (c && c.ate > agora) return c.papel;
    const papel = await this.consultar(usuarioId, condominioId);
    if (this.cfg.cachePapelMs > 0) this.cache.set(chave, { papel, ate: agora + this.cfg.cachePapelMs });
    return papel;
  }

  consultar(usuarioId: string, condominioId: string): Promise<string | null> {
    this.consultas++;
    return comContexto(this.db, { usuarioId, condominioId }, async (tx) => {
      const r = await tx.selectFrom('app.vinculo as v').innerJoin('app.condominio as c', 'c.id', 'v.condominio_id')
        .select(sql<string>`case when v.papel = 'subsindico' and exists (select 1 from app.substituicao s
            where s.condominio_id = v.condominio_id and s.subsindico_usuario_id = v.usuario_id and s.ativa)
          then 'sindico' else v.papel end`.as('papel'))
        .where('v.usuario_id', '=', usuarioId).where('v.condominio_id', '=', condominioId).where('v.ativo', '=', true)
        .where(sql<boolean>`(v.papel <> 'suporte' or c.plano = 'gestao_suporte')`)
        .executeTakeFirst();
      return r?.papel ?? null;
    });
  }
}
