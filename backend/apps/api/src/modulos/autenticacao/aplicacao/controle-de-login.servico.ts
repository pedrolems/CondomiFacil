import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ErroDeAplicacao } from '../../../compartilhado/erros/index.js';
import type { TransacaoAutenticacao } from '../../../compartilhado/tenant/index.js';
import { AcessoPausado, CodigoPausado } from '../erros.js';

/** Quantas falhas pausam, por quanto tempo, e em que janela contam (sem janela: só zera por acerto ou pausa vencida). */
export interface RegraDePausa {
  limite: number;
  pausaMs: number;
  janelaMs?: number;
  pausado: (segundosRestantes: number) => ErroDeAplicacao;
}

/** SEG-04, RN-CD-07: 5 senhas erradas seguidas pausam 15 min (login e troca de senha, RN-CD-29). */
export const regraDeSenha = (origem: 'acesso' | 'troca_de_senha'): RegraDePausa => ({
  limite: 5,
  pausaMs: 15 * 60_000,
  pausado: (s) => new AcessoPausado(origem, s),
});

/** RN-CD-02 (decisão de 24/11/2026): 10 códigos errados em 24 h pausam pedido e uso de código por 24 h. */
export const REGRA_DE_CODIGO: RegraDePausa = {
  limite: 10,
  pausaMs: 24 * 3_600_000,
  janelaMs: 24 * 3_600_000,
  pausado: (s) => new CodigoPausado(s),
};

/**
 * Contadores de tentativas em `controle_login`, por chave protegida: valem igual para e-mail
 * cadastrado ou não. Regra do banco: `(falhas = 0) = (janela_iniciada_em IS NULL)`.
 */
@Injectable()
export class ControleDeLogin {
  /** Lança o 429 da regra, com o tempo restante, se a chave está em pausa. */
  async exigirSemPausa(
    tx: TransacaoAutenticacao,
    chave: string,
    agora: Date,
    regra: RegraDePausa,
  ): Promise<void> {
    const c = await tx
      .selectFrom('controle_login')
      .select('bloqueado_ate')
      .where('chave_tentativa_protegida', '=', chave)
      .executeTakeFirst();
    if (c?.bloqueado_ate && c.bloqueado_ate > agora) {
      throw regra.pausado((c.bloqueado_ate.getTime() - agora.getTime()) / 1000);
    }
  }

  /**
   * Reserva uma tentativa ANTES de conferir a senha (ou depois de errar o código): a linha fica
   * travada (FOR UPDATE) até o commit, então tentativas simultâneas se contam uma a uma e as que
   * passam do limite caem na pausa sem chegar ao Argon2. Em pausa lança o 429. Devolve o fim da
   * pausa se ESTA tentativa foi a que atingiu o limite (o chamador responde 429 depois do commit).
   */
  async reservarTentativa(
    tx: TransacaoAutenticacao,
    chave: string,
    usuarioId: string | null,
    agora: Date,
    regra: RegraDePausa,
  ): Promise<Date | null> {
    await tx
      .insertInto('controle_login')
      .values({ id: randomUUID(), usuario_id: usuarioId, chave_tentativa_protegida: chave })
      .onConflict((oc) => oc.column('chave_tentativa_protegida').doNothing())
      .execute();
    const atual = await tx
      .selectFrom('controle_login')
      .select(['falhas', 'bloqueado_ate', 'janela_iniciada_em'])
      .where('chave_tentativa_protegida', '=', chave)
      .forUpdate()
      .executeTakeFirstOrThrow();
    if (atual.bloqueado_ate && atual.bloqueado_ate > agora) {
      throw regra.pausado((atual.bloqueado_ate.getTime() - agora.getTime()) / 1000);
    }
    // Pausa vencida ou janela vencida: a contagem recomeça.
    const reinicia =
      atual.bloqueado_ate !== null ||
      (regra.janelaMs !== undefined &&
        atual.janela_iniciada_em !== null &&
        atual.janela_iniciada_em.getTime() + regra.janelaMs <= agora.getTime());
    const falhas = reinicia ? 1 : atual.falhas + 1;
    const pausaAte = falhas >= regra.limite ? new Date(agora.getTime() + regra.pausaMs) : null;
    await tx
      .updateTable('controle_login')
      .set({
        falhas,
        usuario_id: usuarioId,
        bloqueado_ate: pausaAte,
        janela_iniciada_em:
          reinicia || atual.janela_iniciada_em === null ? agora : atual.janela_iniciada_em,
      })
      .where('chave_tentativa_protegida', '=', chave)
      .execute();
    return pausaAte;
  }

  /** Login certo, troca ou redefinição de senha: zera o contador e a janela. */
  async zerar(tx: TransacaoAutenticacao, chave: string): Promise<void> {
    await tx
      .updateTable('controle_login')
      .set({ falhas: 0, bloqueado_ate: null, janela_iniciada_em: null })
      .where('chave_tentativa_protegida', '=', chave)
      .execute();
  }
}
