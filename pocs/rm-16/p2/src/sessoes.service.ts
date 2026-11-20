import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { sql } from 'kysely';
import { CONFIG, DB, RELOGIO, type Config, type Db, type Relogio } from './infra.ts';
import { Chaveiro } from './tokens.ts';

export const CHAVEIRO = Symbol('CHAVEIRO');
export interface Par { access_token: string; refresh_token: string; expira_em: string; sessao_id: string }
export const sha256 = (t: string) => createHash('sha256').update(t).digest();
const ARGON = { type: argon2.argon2id } as const;
// Hash descartavel para igualar o tempo de login de e-mail inexistente (anti-enumeracao, SEG-04).
const HASH_FALSO = await argon2.hash('nao-existe', ARGON);

@Injectable()
export class SessoesService {
  constructor(
    @Inject(DB) private db: Db, @Inject(RELOGIO) private relogio: Relogio,
    @Inject(CONFIG) private cfg: Config, @Inject(CHAVEIRO) private chaves: Chaveiro,
  ) {}

  private async emitirPar(sessaoId: string, usuarioId: string, agora: Date): Promise<Par> {
    const refresh = 'rt_' + randomBytes(32).toString('base64url');
    const expira = new Date(agora.getTime() + this.cfg.refreshTtlS * 1000);
    await this.db.insertInto('app.refresh_token').values({ hash: sha256(refresh), sessao_id: sessaoId, gerado_em: agora, expira_em: expira, usado_em: null }).execute();
    const access = await this.chaves.emitir({ sub: usuarioId, sid: sessaoId }, agora, this.cfg.accessTtlS);
    return { access_token: access, refresh_token: refresh, sessao_id: sessaoId, expira_em: new Date(agora.getTime() + this.cfg.accessTtlS * 1000).toISOString() };
  }

  private async abrirSessao(usuarioId: string, cliente: 'app' | 'web'): Promise<Par> {
    const agora = this.relogio.agora();
    const id = randomUUID();
    await this.db.insertInto('app.sessao').values({ id, usuario_id: usuarioId, cliente, criada_em: agora, revogada_em: null, motivo: null }).execute();
    return this.emitirPar(id, usuarioId, agora);
  }

  async entrar(email: string, senha: string, cliente: 'app' | 'web'): Promise<Par> {
    const u = await this.db.selectFrom('app.usuario').select(['id', 'senha_hash', 'excluido_em']).where('email', '=', email.toLowerCase()).executeTakeFirst();
    const ok = await argon2.verify(u?.senha_hash ?? HASH_FALSO, senha).catch(() => false);
    if (!u || !u.senha_hash || u.excluido_em || !ok) throw new UnauthorizedException('Credenciais invalidas');
    return this.abrirSessao(u.id, cliente);
  }

  /**
   * Rotacao estrita (ADR-007, sem excecao ao reuso). O UPDATE condicional e atomico: de N renovacoes
   * concorrentes com o mesmo token, so uma encontra usado_em nulo (as demais esperam o lock da linha e
   * reavaliam o predicado). As perdedoras caem no ramo de reuso e revogam a sessao.
   */
  async renovar(refresh: string): Promise<Par> {
    const agora = this.relogio.agora();
    const hash = sha256(refresh);
    const vencedor = await this.db.transaction().execute(async (tx) => {
      const r = await tx.updateTable('app.refresh_token as rt').from('app.sessao as s')
        .set({ usado_em: agora })
        .whereRef('rt.sessao_id', '=', 's.id').where('rt.hash', '=', hash).where('rt.usado_em', 'is', null)
        .where('s.revogada_em', 'is', null).where('rt.expira_em', '>', agora)
        .returning(['rt.sessao_id as sessao_id', 's.usuario_id as usuario_id']).executeTakeFirst();
      if (!r) return null;
      // Usuario excluido (LGPD) nao renova mesmo que a revogacao tenha falhado.
      const u = await tx.selectFrom('app.usuario').select('excluido_em').where('id', '=', r.usuario_id).executeTakeFirstOrThrow();
      if (u.excluido_em) return null;
      return r;
    });
    if (vencedor) return this.emitirPar(vencedor.sessao_id, vencedor.usuario_id, agora);

    const rt = await this.db.selectFrom('app.refresh_token').select(['sessao_id', 'usado_em']).where('hash', '=', hash).executeTakeFirst();
    if (rt?.usado_em) await this.revogarSessao(rt.sessao_id, 'reuso_refresh'); // replay: revoga a sessao inteira
    throw new UnauthorizedException('Sessao invalida');
  }

  async revogarSessao(sessaoId: string, motivo: string) {
    await this.db.updateTable('app.sessao').set({ revogada_em: this.relogio.agora(), motivo })
      .where('id', '=', sessaoId).where('revogada_em', 'is', null).execute();
  }
  async revogarTodas(usuarioId: string, motivo: string) {
    await this.db.updateTable('app.sessao').set({ revogada_em: this.relogio.agora(), motivo })
      .where('usuario_id', '=', usuarioId).where('revogada_em', 'is', null).execute();
  }

  /** Valida sid a cada requisicao (sem cache): logout, troca de senha e exclusao valem na hora. */
  async sessaoViva(sid: string, usuarioId: string): Promise<boolean> {
    const r = await this.db.selectFrom('app.sessao as s').innerJoin('app.usuario as u', 'u.id', 's.usuario_id')
      .select(sql<boolean>`true`.as('ok')).where('s.id', '=', sid).where('s.usuario_id', '=', usuarioId)
      .where('s.revogada_em', 'is', null).where('u.excluido_em', 'is', null).executeTakeFirst();
    return !!r;
  }

  async trocarSenha(usuarioId: string, atual: string, nova: string, cliente: 'app' | 'web'): Promise<Par> {
    if (nova.length < 8) throw new UnauthorizedException('Senha curta');
    const u = await this.db.selectFrom('app.usuario').select('senha_hash').where('id', '=', usuarioId).executeTakeFirstOrThrow();
    if (!u.senha_hash || !(await argon2.verify(u.senha_hash, atual))) throw new UnauthorizedException('Credenciais invalidas');
    await this.db.updateTable('app.usuario').set({ senha_hash: await argon2.hash(nova, ARGON) }).where('id', '=', usuarioId).execute();
    await this.revogarTodas(usuarioId, 'troca_senha');
    return this.abrirSessao(usuarioId, cliente);
  }

  /** Exclusao LGPD: anonimiza o acesso e revoga tudo. Dados de negocio tem retencao propria (fora da PoC). */
  async excluirConta(usuarioId: string) {
    await this.db.updateTable('app.usuario').set({ excluido_em: this.relogio.agora(), senha_hash: null, email: `excluido-${usuarioId}@anonimo.invalid` })
      .where('id', '=', usuarioId).execute();
    await this.revogarTodas(usuarioId, 'exclusao_lgpd');
  }

  hashSenha(s: string) { return argon2.hash(s, ARGON); }
}
