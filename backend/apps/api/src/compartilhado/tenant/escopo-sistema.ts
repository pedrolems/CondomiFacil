import { Inject, Injectable, Module } from '@nestjs/common';
import { BANCO, type Banco } from './banco.js';
import { sql } from 'kysely';
import type { Transacao } from './transacao.js';

/**
 * Escopo 'sistema' (decisão de Pedro, 23/11/2026): sem condomínio, lê só evento_saida pendente de
 * todos os condomínios. SÓ O WORKER pode importar este arquivo (no-restricted-imports em
 * packages/config/eslint.mjs); a API não declara o SistemaModule e não tem caminho para ele.
 */
@Injectable()
export class EscopoSistema {
  constructor(@Inject(BANCO) private readonly banco: Banco) {}

  executar<T>(fn: (tx: Transacao) => Promise<T>): Promise<T> {
    return this.banco.db.transaction().execute(async (tx) => {
      await sql`select set_config('app.condominio_id', '', true),
        set_config('app.escopo', 'sistema', true)`.execute(tx);
      return fn(tx);
    });
  }
}

// Usa o BANCO do TenantModule global.
@Module({ providers: [EscopoSistema], exports: [EscopoSistema] })
export class SistemaModule {}
