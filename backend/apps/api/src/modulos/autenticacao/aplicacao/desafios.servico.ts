import { randomInt, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { ErroDeAplicacao } from '../../../compartilhado/erros/index.js';
import type { TransacaoAutenticacao } from '../../../compartilhado/tenant/index.js';
import { CodigoIncorreto, CodigoInvalidoOuVencido, CodigoReenvioAntecipado } from '../erros.js';
import { Credenciais } from './credenciais.js';

export type Finalidade = 'ativacao' | 'recuperacao_senha';

const VALIDADE_MS = 15 * 60_000;
const REENVIO_MS = 60_000;
const TENTATIVAS = 5;

export type ResultadoDoCodigo =
  { ok: true; usuarioId: string } | { ok: false; erro: ErroDeAplicacao };

interface Simulado {
  expiraEm: number;
  tentativas: number;
  invalidado: boolean;
}

/**
 * Código de acesso (RN-CD-02): 6 dígitos, 15 min, 5 tentativas, reenvio após 60 s (o novo invalida o
 * anterior na mesma transação, antes do INSERT: o índice parcial recusa dois ativos).
 * Resposta idêntica para e-mail cadastrado ou não: quem não tem desafio real (e-mail desconhecido ou
 * em estado que não pode usar a finalidade) ganha um desafio simulado em memória, que repete as
 * mesmas tentativas restantes e o mesmo vencimento, e nunca confere.
 */
@Injectable()
export class DesafiosServico {
  // Em memória (E16: multi-instância exigiria mover para o banco). Chave: destino + finalidade.
  private readonly ultimoPedido = new Map<string, number>();
  private readonly simulados = new Map<string, Simulado>();

  constructor(@Inject(Credenciais) private readonly cred: Credenciais) {}

  private chave(destino: string, finalidade: Finalidade) {
    return `${destino}|${finalidade}`;
  }

  /** 429 se o último pedido (de qualquer e-mail, igual para todos) foi há menos de 60 s. Registra o pedido. */
  exigirReenvio(destino: string, finalidade: Finalidade, agora: Date): void {
    const k = this.chave(destino, finalidade);
    const ultimo = this.ultimoPedido.get(k);
    if (ultimo !== undefined && agora.getTime() < ultimo + REENVIO_MS) {
      throw new CodigoReenvioAntecipado((ultimo + REENVIO_MS - agora.getTime()) / 1000);
    }
    if (this.ultimoPedido.size > 10_000) {
      for (const [chave, t] of this.ultimoPedido) {
        if (agora.getTime() >= t + REENVIO_MS) this.ultimoPedido.delete(chave);
      }
    }
    this.ultimoPedido.set(k, agora.getTime());
  }

  /**
   * Invalida o desafio ativo e, se o e-mail pode usar a finalidade (primeiro acesso: pré-cadastrado;
   * recuperação: ativo), grava o novo. Devolve o código em claro só para o envio, ou null.
   */
  async emitir(
    tx: TransacaoAutenticacao,
    p: { email: string; destino: string; finalidade: Finalidade; agora: Date },
  ): Promise<string | null> {
    const k = this.chave(p.destino, p.finalidade);
    await tx
      .updateTable('desafio_acesso')
      .set({ invalidado_em: p.agora })
      .where('destino_protegido', '=', p.destino)
      .where('finalidade', '=', p.finalidade)
      .where('consumido_em', 'is', null)
      .where('invalidado_em', 'is', null)
      .execute();

    const usuario = await tx
      .selectFrom('usuario')
      .select(['id', 'estado'])
      .where('email_normalizado', '=', this.cred.normalizarEmail(p.email))
      .where('anonimizado_em', 'is', null)
      .executeTakeFirst();
    const estadoDaFinalidade = p.finalidade === 'ativacao' ? 'pre_cadastrado' : 'ativo';
    if (!usuario || usuario.estado !== estadoDaFinalidade) {
      // Poda os vencidos antes de crescer: sem isso, e-mails desconhecidos enchem o mapa sem limite.
      // shortcut: poda só acima de 10 mil entradas (varredura linear); o limite por IP e por e-mail
      // segura o ritmo. Mover para o banco junto com o limitador se a API passar de uma instância.
      if (this.simulados.size > 10_000) {
        for (const [chave, s] of this.simulados) {
          if (s.expiraEm <= p.agora.getTime()) this.simulados.delete(chave);
        }
      }
      this.simulados.set(k, {
        expiraEm: p.agora.getTime() + VALIDADE_MS,
        tentativas: 0,
        invalidado: false,
      });
      return null;
    }
    this.simulados.delete(k);
    const id = randomUUID();
    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await tx
      .insertInto('desafio_acesso')
      .values({
        id,
        usuario_id: usuario.id,
        destino_protegido: p.destino,
        finalidade: p.finalidade,
        codigo_hash: this.cred.hashDoCodigo(id, codigo),
        expira_em: new Date(p.agora.getTime() + VALIDADE_MS),
      })
      .execute();
    return codigo;
  }

  /**
   * Confere o código. Erro de código NÃO lança: o chamador faz COMMIT (a tentativa precisa ficar
   * gravada) e só então responde 422. Código certo consome o desafio na mesma transação do chamador.
   */
  async conferir(
    tx: TransacaoAutenticacao,
    p: { destino: string; finalidade: Finalidade; codigo: string; agora: Date },
  ): Promise<ResultadoDoCodigo> {
    const d = await tx
      .selectFrom('desafio_acesso')
      .select(['id', 'usuario_id', 'codigo_hash', 'expira_em', 'tentativas'])
      .where('destino_protegido', '=', p.destino)
      .where('finalidade', '=', p.finalidade)
      .where('consumido_em', 'is', null)
      .where('invalidado_em', 'is', null)
      .forUpdate()
      .executeTakeFirst();
    if (!d) return this.conferirSimulado(p.destino, p.finalidade, p.agora);

    if (d.expira_em <= p.agora) {
      await this.invalidar(tx, d.id, d.tentativas, p.agora);
      return { ok: false, erro: new CodigoInvalidoOuVencido() };
    }
    if (d.usuario_id && this.cred.iguais(d.codigo_hash, this.cred.hashDoCodigo(d.id, p.codigo))) {
      await tx
        .updateTable('desafio_acesso')
        .set({ consumido_em: p.agora })
        .where('id', '=', d.id)
        .execute();
      return { ok: true, usuarioId: d.usuario_id };
    }
    const tentativas = d.tentativas + 1;
    if (tentativas >= TENTATIVAS) {
      await this.invalidar(tx, d.id, tentativas, p.agora);
      return { ok: false, erro: new CodigoInvalidoOuVencido() };
    }
    await tx.updateTable('desafio_acesso').set({ tentativas }).where('id', '=', d.id).execute();
    return { ok: false, erro: new CodigoIncorreto(TENTATIVAS - tentativas) };
  }

  private async invalidar(tx: TransacaoAutenticacao, id: string, tentativas: number, agora: Date) {
    await tx
      .updateTable('desafio_acesso')
      .set({ tentativas, invalidado_em: agora })
      .where('id', '=', id)
      .execute();
  }

  private conferirSimulado(
    destino: string,
    finalidade: Finalidade,
    agora: Date,
  ): ResultadoDoCodigo {
    const s = this.simulados.get(this.chave(destino, finalidade));
    if (!s || s.invalidado || s.expiraEm <= agora.getTime()) {
      return { ok: false, erro: new CodigoInvalidoOuVencido() };
    }
    s.tentativas += 1;
    if (s.tentativas >= TENTATIVAS) {
      s.invalidado = true;
      return { ok: false, erro: new CodigoInvalidoOuVencido() };
    }
    return { ok: false, erro: new CodigoIncorreto(TENTATIVAS - s.tentativas) };
  }
}
