import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado, RecursoNaoEncontrado } from '../../../compartilhado/erros/index.js';
import { LoggerJson } from '../../../compartilhado/logger/index.js';
import { MAILER, type Mailer } from '../../../compartilhado/portas/index.js';
// Import direto de propósito: só este módulo usa o executor; o index do tenant não o exporta.
import { ExecutorDeAutenticacao } from '../../../compartilhado/tenant/autenticacao.js';
import {
  AcessoEncerrado,
  CodigoInvalidoOuVencido,
  CredenciaisInvalidas,
  SenhaAtualIncorreta,
} from '../erros.js';
import { ControleDeLogin, REGRA_DE_CODIGO, regraDeSenha } from './controle-de-login.servico.js';
import { Credenciais } from './credenciais.js';
import { DesafiosServico, type Finalidade } from './desafios.servico.js';
import { RELOGIO, type Relogio } from './relogio.js';
import { SessoesServico, type SessaoListada } from './sessoes.servico.js';
import { TokenDeAcesso, type IdentidadeDoToken } from './tokens.js';

export interface Dispositivo {
  identificador_instalacao: string;
  plataforma: 'android' | 'ios' | 'web';
}

export interface SessaoEmitida {
  usuarioId: string;
  sessaoId: string;
  tokenAcesso: string;
  tokenAcessoExpiraEm: Date;
  refreshToken: string;
}

/**
 * Casos de uso do acesso (RM-20) sobre a conexão do app_autenticacao. Regra de transação: erro de
 * negócio que precisa deixar rastro (tentativa de código, falha de senha, replay de refresh) não
 * lança de dentro da transação; o resultado sai dela e o erro é lançado depois do COMMIT.
 */
@Injectable()
export class AcessoServico {
  constructor(
    @Inject(ExecutorDeAutenticacao) private readonly executor: ExecutorDeAutenticacao,
    @Inject(Credenciais) private readonly cred: Credenciais,
    @Inject(TokenDeAcesso) private readonly tokens: TokenDeAcesso,
    @Inject(SessoesServico) private readonly sessoes: SessoesServico,
    @Inject(DesafiosServico) private readonly desafios: DesafiosServico,
    @Inject(ControleDeLogin) private readonly controle: ControleDeLogin,
    @Inject(MAILER) private readonly mailer: Mailer,
    @Inject(LoggerJson) private readonly logger: LoggerJson,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  private async emitir(
    usuarioId: string,
    sessaoId: string,
    refreshToken: string,
  ): Promise<SessaoEmitida> {
    const t = await this.tokens.emitir({ sub: usuarioId, sid: sessaoId }, this.relogio.agora());
    return {
      usuarioId,
      sessaoId,
      tokenAcesso: t.token,
      tokenAcessoExpiraEm: t.expiraEm,
      refreshToken,
    };
  }

  /** Verificação do access token + sessão viva (sem cache). Usado pelo guard. */
  async identificar(token: string): Promise<IdentidadeDoToken> {
    const agora = this.relogio.agora();
    const id = await this.tokens.verificar(token, agora);
    const viva = await this.executor.executar((tx) =>
      this.sessoes.ativa(tx, id.sid, id.sub, agora),
    );
    if (!viva) throw new NaoAutenticado();
    return id;
  }

  // 1. Código ----------------------------------------------------------------------------------

  async pedirCodigo(
    email: string,
    finalidade: 'primeiro_acesso' | 'recuperacao_senha',
  ): Promise<{ podePedirNovoCodigoEm: Date }> {
    const agora = this.relogio.agora();
    const fin: Finalidade = finalidade === 'primeiro_acesso' ? 'ativacao' : 'recuperacao_senha';
    const destino = this.cred.destinoProtegido(email);
    const codigo = await this.executor.executar(async (tx) => {
      // Teto de códigos errados (RN-CD-02) primeiro; a chave é do e-mail, exista conta ou não.
      await this.controle.exigirSemPausa(
        tx,
        this.cred.chaveDeCodigo(email),
        agora,
        REGRA_DE_CODIGO,
      );
      this.desafios.exigirReenvio(destino, fin, agora);
      return this.desafios.emitir(tx, { email, destino, finalidade: fin, agora });
    });
    if (codigo) {
      // E13/E14: direto pela porta Mailer, sem outbox e sem aguardar: o tempo da resposta não pode
      // depender do envio nem revelar se o e-mail existe. Falhou? A resposta já saiu; o usuário pede reenvio.
      void (async () => {
        try {
          await this.mailer.enviar({
            para: this.cred.normalizarEmail(email),
            assunto: 'Seu código de acesso do CondomiFacil',
            texto: `Seu código de acesso é ${codigo}. Ele vale por 15 minutos. Se não foi você, ignore esta mensagem.`,
          });
        } catch (e) {
          this.logger.erro('envio_de_codigo_falhou', { causa: e });
        }
      })();
    }
    return { podePedirNovoCodigoEm: new Date(agora.getTime() + 60_000) };
  }

  // 2. Ativação e redefinição (mesmo desenho, finalidades e estados diferentes) -----------------

  ativar(email: string, codigo: string, novaSenha: string, d: Dispositivo): Promise<SessaoEmitida> {
    return this.consumirECriarSessao('ativacao', email, codigo, novaSenha, d);
  }

  redefinirSenha(
    email: string,
    codigo: string,
    novaSenha: string,
    d: Dispositivo,
  ): Promise<SessaoEmitida> {
    return this.consumirECriarSessao('recuperacao_senha', email, codigo, novaSenha, d);
  }

  private async consumirECriarSessao(
    finalidade: Finalidade,
    email: string,
    codigo: string,
    novaSenha: string,
    d: Dispositivo,
  ): Promise<SessaoEmitida> {
    const agora = this.relogio.agora();
    const destino = this.cred.destinoProtegido(email);
    // Argon2 sempre, com ou sem desafio real: o custo não distingue e-mail cadastrado de não.
    const senhaHash = await this.cred.hashDaSenha(novaSenha);
    const chaveCodigo = this.cred.chaveDeCodigo(email);
    const r = await this.executor.executar(async (tx) => {
      await this.controle.exigirSemPausa(tx, chaveCodigo, agora, REGRA_DE_CODIGO);
      const c = await this.desafios.conferir(tx, { destino, finalidade, codigo, agora });
      if (!c.ok) {
        // Todo código que não vale conta para o teto, inclusive com desafio simulado (e-mail desconhecido).
        const pausaAte = await this.controle.reservarTentativa(
          tx,
          chaveCodigo,
          null,
          agora,
          REGRA_DE_CODIGO,
        );
        return pausaAte
          ? { ok: false as const, erro: REGRA_DE_CODIGO.pausado(REGRA_DE_CODIGO.pausaMs / 1000) }
          : c;
      }
      const redefinicao = finalidade === 'recuperacao_senha';
      const atualizado = await tx
        .updateTable('usuario')
        .set({ senha_hash: senhaHash, estado: 'ativo' })
        .where('id', '=', c.usuarioId)
        .where('estado', '=', redefinicao ? 'ativo' : 'pre_cadastrado')
        .executeTakeFirst();
      if (atualizado.numUpdatedRows === 0n)
        return { ok: false as const, erro: new CodigoInvalidoOuVencido() };
      if (redefinicao) {
        await this.sessoes.revogarDoUsuario(tx, c.usuarioId, agora);
        await this.controle.zerar(tx, this.cred.chaveDeLogin(email));
      }
      const s = await this.sessoes.criar(tx, c.usuarioId, d.identificador_instalacao, agora);
      return { ok: true as const, usuarioId: c.usuarioId, ...s };
    });
    if (!r.ok) throw r.erro;
    return this.emitir(r.usuarioId, r.sessaoId, r.refreshToken);
  }

  // 3. Login -----------------------------------------------------------------------------------

  async entrar(email: string, senha: string, d: Dispositivo): Promise<SessaoEmitida> {
    const agora = this.relogio.agora();
    const chave = this.cred.chaveDeLogin(email);
    const regra = regraDeSenha('acesso');
    // SEG-04: a tentativa é reservada ANTES do Argon2. Sem isso, várias senhas simultâneas passariam
    // juntas pela verificação de pausa e o limite de 5 seria burlado.
    const { usuario, pausaAte } = await this.executor.executar(async (tx) => {
      const u = await tx
        .selectFrom('usuario')
        .select(['id', 'senha_hash', 'estado'])
        .where('email_normalizado', '=', this.cred.normalizarEmail(email))
        .where('anonimizado_em', 'is', null)
        .executeTakeFirst();
      return {
        usuario: u,
        pausaAte: await this.controle.reservarTentativa(tx, chave, u?.id ?? null, agora, regra),
      };
    });
    const confere = await this.cred.senhaConfere(usuario?.senha_hash ?? null, senha);
    if (!confere || !usuario) {
      // A 5ª senha errada já responde com a pausa (UF 3.2).
      if (pausaAte) throw regra.pausado((pausaAte.getTime() - agora.getTime()) / 1000);
      throw new CredenciaisInvalidas();
    }
    // Acerto zera o contador; SEG-04: só depois de e-mail e senha corretos o cliente aprende que a conta foi encerrada.
    const s = await this.executor.executar(async (tx) => {
      await this.controle.zerar(tx, chave);
      return usuario.estado === 'ativo'
        ? this.sessoes.criar(tx, usuario.id, d.identificador_instalacao, agora)
        : null;
    });
    if (!s) throw new AcessoEncerrado();
    return this.emitir(usuario.id, s.sessaoId, s.refreshToken);
  }

  // 4. Troca de senha com sessão aberta (RN-CD-29) -----------------------------------------------

  async trocarSenha(
    usuarioId: string,
    sessaoAtualId: string,
    senhaAtual: string,
    novaSenha: string,
  ): Promise<void> {
    const agora = this.relogio.agora();
    const regra = regraDeSenha('troca_de_senha');
    // Mesma reserva antes do Argon2 do login, no mesmo contador (RN-CD-29).
    const usuario = await this.executor.executar(async (tx) => {
      const u = await tx
        .selectFrom('usuario')
        .select(['email_normalizado', 'senha_hash'])
        .where('id', '=', usuarioId)
        .executeTakeFirst();
      if (!u?.email_normalizado) throw new NaoAutenticado();
      const chave = this.cred.chaveDeLogin(u.email_normalizado);
      return {
        chave,
        senhaHash: u.senha_hash,
        pausaAte: await this.controle.reservarTentativa(tx, chave, usuarioId, agora, regra),
      };
    });
    if (!(await this.cred.senhaConfere(usuario.senhaHash, senhaAtual))) {
      if (usuario.pausaAte) {
        throw regra.pausado((usuario.pausaAte.getTime() - agora.getTime()) / 1000);
      }
      throw new SenhaAtualIncorreta();
    }
    const novoHash = await this.cred.hashDaSenha(novaSenha);
    await this.executor.executar(async (tx) => {
      await tx
        .updateTable('usuario')
        .set({ senha_hash: novoHash })
        .where('id', '=', usuarioId)
        .execute();
      await this.sessoes.revogarDoUsuario(tx, usuarioId, agora, sessaoAtualId);
      await this.controle.zerar(tx, usuario.chave);
    });
  }

  // 5. Renovação e saída --------------------------------------------------------------------------

  async renovar(refreshToken: string): Promise<SessaoEmitida> {
    const agora = this.relogio.agora();
    // O replay revoga a sessão: a transação confirma e só depois a resposta é 401.
    const r = await this.executor.executar((tx) => this.sessoes.renovar(tx, refreshToken, agora));
    if (!r) throw new NaoAutenticado();
    return this.emitir(r.usuarioId, r.sessaoId, r.refreshToken);
  }

  async sair(sessaoId: string): Promise<void> {
    const agora = this.relogio.agora();
    await this.executor.executar((tx) => this.sessoes.revogar(tx, sessaoId, agora));
  }

  // 6. Sessões do titular --------------------------------------------------------------------------

  listarSessoes(usuarioId: string, limite: number, depoisDe?: string): Promise<SessaoListada[]> {
    const agora = this.relogio.agora();
    return this.executor.executar((tx) =>
      this.sessoes.listar(tx, usuarioId, limite, agora, depoisDe),
    );
  }

  async encerrarSessao(usuarioId: string, sessaoId: string): Promise<void> {
    const agora = this.relogio.agora();
    const ok = await this.executor.executar((tx) =>
      this.sessoes.encerrar(tx, usuarioId, sessaoId, agora),
    );
    if (!ok) throw new RecursoNaoEncontrado();
  }
}
