import { randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { sql, type TransacaoAutenticacao } from '../../../compartilhado/tenant/index.js';
import { UUID } from '../../../compartilhado/uuid.js';
import { CONFIG_ACESSO, type ConfigAcesso } from '../config.js';
import { Credenciais } from './credenciais.js';

const TOLERANCIA_DO_RETRY_MS = 30_000;

export interface SessaoRenovada {
  usuarioId: string;
  sessaoId: string;
  refreshToken: string;
}

export interface SessaoListada {
  id: string;
  dispositivo_identificador: string | null;
  expira_em: Date;
}

/**
 * Plano de sessão (tabela `sessao`; ADR-007). Todos os métodos recebem a transação do chamador, para
 * o caso de uso compor ato e sessão no mesmo commit. Refresh = `<sessao_id>.<segredo>`: só o HMAC do
 * segredo fica gravado. A renovação segue as instruções SQL canônicas da migration
 * V202611240001 (normal, retry B+E de 30 s uma vez, senão replay).
 */
@Injectable()
export class SessoesServico {
  constructor(
    @Inject(CONFIG_ACESSO) private readonly config: ConfigAcesso,
    @Inject(Credenciais) private readonly cred: Credenciais,
  ) {}

  private expiraEm(agora: Date): Date {
    return new Date(agora.getTime() + this.config.validadeSessaoDias * 86_400_000);
  }

  /** Janela deslizante limitada ao teto absoluto: nunca passa de `criada_em` + teto (ADR-007). */
  private expiraComTeto(agora: Date) {
    return sql<Date>`least(${this.expiraEm(agora)}::timestamptz, criada_em + make_interval(days => ${this.config.tetoSessaoDias}::int))`;
  }

  private novoSegredo(): string {
    return randomBytes(32).toString('base64url');
  }

  async criar(
    tx: TransacaoAutenticacao,
    usuarioId: string,
    dispositivoIdentificador: string | null,
    agora: Date,
  ): Promise<{ sessaoId: string; refreshToken: string }> {
    const sessaoId = randomUUID();
    const segredo = this.novoSegredo();
    await tx
      .insertInto('sessao')
      .values({
        id: sessaoId,
        usuario_id: usuarioId,
        renovacao_hash: this.cred.hashDoSegredoDeRenovacao(segredo),
        expira_em: this.expiraEm(agora),
        dispositivo_identificador: dispositivoIdentificador,
      })
      .execute();
    return { sessaoId, refreshToken: `${sessaoId}.${segredo}` };
  }

  /**
   * null = inválido (formato ruim, id inexistente, expirada, revogada ou segredo errado). Replay
   * (id existente com segredo que não é o vigente nem o retry permitido) revoga a sessão inteira:
   * por isso o chamador faz COMMIT antes de responder 401, em vez de lançar de dentro da transação.
   */
  async renovar(
    tx: TransacaoAutenticacao,
    refreshToken: string,
    agora: Date,
  ): Promise<SessaoRenovada | null> {
    const ponto = refreshToken.indexOf('.');
    const sessaoId = refreshToken.slice(0, ponto);
    const segredo = refreshToken.slice(ponto + 1);
    if (ponto < 0 || !UUID.test(sessaoId) || segredo === '') return null;

    const apresentado = this.cred.hashDoSegredoDeRenovacao(segredo);
    const novoSegredo = this.novoSegredo();
    const novo = this.cred.hashDoSegredoDeRenovacao(novoSegredo);
    const expira = this.expiraComTeto(agora);
    const emitida = (usuarioId: string): SessaoRenovada => ({
      usuarioId,
      sessaoId,
      refreshToken: `${sessaoId}.${novoSegredo}`,
    });

    // Renovação normal: apresentou o segredo vigente (conta ainda ativa).
    const normal = await tx
      .updateTable('sessao')
      .set((eb) => ({
        renovacao_hash_anterior: eb.ref('renovacao_hash'),
        renovacao_hash: novo,
        rotacionada_em: agora,
        anterior_reusado_em: null,
        expira_em: expira,
      }))
      .where('id', '=', sessaoId)
      .where('renovacao_hash', '=', apresentado)
      .where('revogada_em', 'is', null)
      .where('expira_em', '>', agora)
      .where('usuario_id', 'in', (eb) =>
        eb.selectFrom('usuario').select('id').where('estado', '=', 'ativo'),
      )
      .returning('usuario_id')
      .executeTakeFirst();
    if (normal) return emitida(normal.usuario_id);

    // Retry B+E: apresentou o anterior, uma vez, dentro de 30 s, com o sucessor ainda não usado.
    const retry = await tx
      .updateTable('sessao')
      .set({ renovacao_hash: novo, anterior_reusado_em: agora, expira_em: expira })
      .where('id', '=', sessaoId)
      .where('renovacao_hash_anterior', '=', apresentado)
      .where('anterior_reusado_em', 'is', null)
      .where('rotacionada_em', '>', new Date(agora.getTime() - TOLERANCIA_DO_RETRY_MS))
      .where('revogada_em', 'is', null)
      .where('expira_em', '>', agora)
      .where('usuario_id', 'in', (eb) =>
        eb.selectFrom('usuario').select('id').where('estado', '=', 'ativo'),
      )
      .returning('usuario_id')
      .executeTakeFirst();
    if (retry) return emitida(retry.usuario_id);

    // Replay: qualquer outro segredo de uma sessão existente. Id inexistente não revoga nada.
    await tx
      .updateTable('sessao')
      .set({ revogada_em: agora })
      .where('id', '=', sessaoId)
      .where('revogada_em', 'is', null)
      .execute();
    return null;
  }

  /** Consulta por PK a cada requisição, sem cache (E15): sessão revogada, vencida ou de conta inativa não passa. */
  async ativa(tx: TransacaoAutenticacao, sid: string, sub: string, agora: Date): Promise<boolean> {
    const r = await tx
      .selectFrom('sessao')
      .innerJoin('usuario', 'usuario.id', 'sessao.usuario_id')
      .select('sessao.id')
      .where('sessao.id', '=', sid)
      .where('sessao.usuario_id', '=', sub)
      .where('sessao.revogada_em', 'is', null)
      .where('sessao.expira_em', '>', agora)
      .where('usuario.estado', '=', 'ativo')
      .executeTakeFirst();
    return r !== undefined;
  }

  async revogar(tx: TransacaoAutenticacao, sessaoId: string, agora: Date): Promise<void> {
    await tx
      .updateTable('sessao')
      .set({ revogada_em: agora })
      .where('id', '=', sessaoId)
      .where('revogada_em', 'is', null)
      .execute();
  }

  /** Troca e redefinição de senha: `manter` é a sessão atual (troca); sem ela, todas (redefinição). */
  async revogarDoUsuario(
    tx: TransacaoAutenticacao,
    usuarioId: string,
    agora: Date,
    manter?: string,
  ): Promise<void> {
    let q = tx
      .updateTable('sessao')
      .set({ revogada_em: agora })
      .where('usuario_id', '=', usuarioId)
      .where('revogada_em', 'is', null);
    if (manter) q = q.where('id', '<>', manter);
    await q.execute();
  }

  /** Só do titular: sessão de outro usuário não casa e dá false (o chamador responde 404). */
  async encerrar(
    tx: TransacaoAutenticacao,
    usuarioId: string,
    sessaoId: string,
    agora: Date,
  ): Promise<boolean> {
    const r = await tx
      .updateTable('sessao')
      .set({ revogada_em: agora })
      .where('id', '=', sessaoId)
      .where('usuario_id', '=', usuarioId)
      .where('revogada_em', 'is', null)
      .returning('id')
      .executeTakeFirst();
    return r !== undefined;
  }

  /** Vivas do titular (não revogadas e não vencidas), por id (cursor estável); pede limite + 1 para saber se há mais. */
  listar(
    tx: TransacaoAutenticacao,
    usuarioId: string,
    limite: number,
    agora: Date,
    depoisDe?: string,
  ): Promise<SessaoListada[]> {
    let q = tx
      .selectFrom('sessao')
      .select(['id', 'dispositivo_identificador', 'expira_em'])
      .where('usuario_id', '=', usuarioId)
      .where('revogada_em', 'is', null)
      .where('expira_em', '>', agora)
      .orderBy('id')
      .limit(limite + 1);
    if (depoisDe) q = q.where('id', '>', depoisDe);
    return q.execute();
  }
}
