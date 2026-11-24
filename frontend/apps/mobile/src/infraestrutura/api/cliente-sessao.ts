import { validarComum, type ComponentesComum } from '@condomifacil/shared-types';
import { ErroDeRede, RespostaForaDoContrato, SessaoEncerrada, erroDaResposta } from './erros';

type Esquemas = ComponentesComum['schemas'];
export type SessaoAberta = Esquemas['SessaoAbertaComum'];

export type EstadoDaSessao =
  | { tipo: 'restaurando' | 'anonima'; aceitesPendentes: false }
  /** `erro` é a causa (rede, 429, 403...) para a tela explicar; sem dado pessoal. */
  | { tipo: 'falha-ao-restaurar'; aceitesPendentes: false; erro?: unknown }
  | { tipo: 'autenticada'; aceitesPendentes: boolean };

/** Refresh token no armazenamento seguro do app. Na web não existe: o refresh fica no cookie httpOnly. */
export type ArmazenamentoDeRefresh = {
  ler(): Promise<string | null>;
  gravar(token: string): Promise<void>;
  limpar(): Promise<void>;
  /**
   * Só na web: marca local "saída pendente" (sem dado pessoal) quando o `sair` não chegou ao servidor,
   * porque o cookie httpOnly continua válido e só o servidor o apaga. Não é apagada por `limpar`.
   */
  saidaPendente?(): Promise<boolean>;
  marcarSaidaPendente?(): Promise<void>;
  limparSaidaPendente?(): Promise<void>;
};

/** Exclusão mútua da renovação entre abas (Web Locks) ou processos; o single-flight fica no cliente. */
export type Trava = <T>(tarefa: () => Promise<T>) => Promise<T>;

export type DependenciasDoCliente = {
  /** Base HTTP da API, sem barra final. */
  baseUrl: string;
  plataforma: 'android' | 'ios' | 'web';
  armazenamento: ArmazenamentoDeRefresh;
  trava: Trava;
  identificadorDaInstalacao: () => Promise<string>;
  fetch?: typeof fetch;
  agora?: () => number;
};

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const TEMPO_LIMITE_MS = 10_000;
/** Renova antes de o token vencer, para a chamada não sair com um token no limite. */
const MARGEM_DE_VENCIMENTO_MS = 30_000;
/** Regra do servidor (ADR-007, B+E): o refresh anterior vale uma vez por 30 s se o sucessor não foi usado. */
const JANELA_DE_RETRY_MS = 30_000;

/**
 * Sessão do cliente (ADR-007): o token de acesso fica só em memória; no app o refresh vai ao
 * armazenamento seguro antes de o novo acesso ser usado; na web o refresh só existe no cookie
 * httpOnly e toda chamada a `/v1/acesso/*` leva `X-CondomiFacil-Web: 1` com `credentials: 'include'`.
 */
export class ClienteSessao {
  private acesso: { token: string; expiraEm: number } | null = null;
  private estadoAtual: EstadoDaSessao = { tipo: 'restaurando', aceitesPendentes: false };
  private renovacao: Promise<void> | undefined;
  /** Sobe a cada limpeza: renovação iniciada antes dela não pode ressuscitar a sessão. */
  private geracao = 0;
  private readonly ouvintes = new Set<() => void>();
  private readonly aoLimpar = new Set<() => void>();
  private readonly web: boolean;
  private readonly chamarFetch: typeof fetch;
  private readonly agora: () => number;

  constructor(private readonly dep: DependenciasDoCliente) {
    this.web = dep.plataforma === 'web';
    this.chamarFetch = dep.fetch ?? ((...args) => globalThis.fetch(...args));
    this.agora = dep.agora ?? Date.now;
  }

  get estado(): EstadoDaSessao {
    return this.estadoAtual;
  }

  /** Para `useSyncExternalStore`. */
  assinar = (ouvinte: () => void): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  /** Registra a limpeza de cache de dados do usuário (logout e sessão revogada). */
  aoLimparSessao(ouvinte: () => void): () => void {
    this.aoLimpar.add(ouvinte);
    return () => this.aoLimpar.delete(ouvinte);
  }

  /** Abertura do app: tenta continuar a sessão pelo refresh (secure-store no app, cookie na web). */
  async restaurar(): Promise<void> {
    this.definirEstado({ tipo: 'restaurando', aceitesPendentes: false });
    try {
      // Com saída pendente (web), a sessão não é retomada: conclui-se o `sair` antes de tudo.
      if (await this.dep.armazenamento.saidaPendente?.()) await this.concluirSaidaPendente();
      else await this.renovar();
    } catch (e) {
      // 401 já limpou a sessão (`anonima`); falha de rede ou 5xx mantém o refresh e deixa tentar de novo.
      if (!(e instanceof SessaoEncerrada)) {
        this.definirEstado({ tipo: 'falha-ao-restaurar', aceitesPendentes: false, erro: e });
      }
    }
  }

  /**
   * O `sair` exige token de acesso, então a renovação aqui serve só para obtê-lo: a sessão não abre.
   * A marca cai quando o servidor confirma o `sair` ou quando a renovação volta 401 (sessão já morta).
   */
  private concluirSaidaPendente(): Promise<void> {
    return this.dep.trava(async () => {
      const renovada = await this.enviar('POST', '/v1/acesso/renovar');
      if (renovada.status !== 401) {
        const dados = await lerCorpo(renovada);
        if (!renovada.ok) throw erroDaResposta(renovada, dados);
        if (!validarComum('SessaoAbertaComum', dados).valido) {
          throw new RespostaForaDoContrato('corpo fora do contrato SessaoAbertaComum');
        }
        const sair = await this.enviar(
          'POST',
          '/v1/acesso/sair',
          undefined,
          (dados as SessaoAberta).token_acesso,
        );
        if (!sair.ok && sair.status !== 401) throw erroDaResposta(sair, await lerCorpo(sair));
      }
      await this.dep.armazenamento.limparSaidaPendente?.();
      await this.limpar();
    });
  }

  /** Renovação com single-flight: N chamadas simultâneas geram uma única ida ao servidor. */
  renovar(): Promise<void> {
    this.renovacao ??= this.dep
      .trava(() => this.renovarSobTrava())
      .finally(() => {
        this.renovacao = undefined;
      });
    return this.renovacao;
  }

  private async renovarSobTrava(): Promise<void> {
    const geracao = this.geracao;
    const inicio = this.agora();
    // Lido dentro da trava: outro processo pode ter rotacionado o refresh enquanto esperávamos.
    const refresh = this.web ? null : await this.dep.armazenamento.ler();
    if (!this.web && !refresh) {
      await this.limpar();
      throw new SessaoEncerrada();
    }
    const corpo = this.web ? undefined : { refresh_token: refresh };

    let resposta: Response;
    try {
      resposta = await this.enviar('POST', '/v1/acesso/renovar', corpo);
    } catch (e) {
      // Resposta perdida: o servidor aceita o mesmo refresh uma vez em 30 s. Nada além disso.
      if (!(e instanceof ErroDeRede) || this.agora() - inicio >= JANELA_DE_RETRY_MS) throw e;
      resposta = await this.enviar('POST', '/v1/acesso/renovar', corpo);
    }

    if (resposta.status === 401) {
      await this.limpar();
      throw new SessaoEncerrada();
    }
    const dados = await lerCorpo(resposta);
    if (!resposta.ok) throw erroDaResposta(resposta, dados);
    if (geracao !== this.geracao) throw new SessaoEncerrada();
    await this.abrirSessao(dados);
  }

  /** `POST` sem sessão (pedir código). */
  async publica(metodo: Metodo, caminho: string, corpo?: unknown): Promise<unknown> {
    return this.tratar(await this.enviar(metodo, caminho, corpo));
  }

  /** Ativar, entrar e redefinir senha: abre a sessão e devolve se há aceite pendente. */
  async abrirSessaoCom(caminho: string, corpo: Record<string, unknown>): Promise<SessaoAberta> {
    const dispositivo = {
      identificador_instalacao: await this.dep.identificadorDaInstalacao(),
      plataforma: this.dep.plataforma,
    };
    const dados = await this.publica('POST', caminho, { ...corpo, dispositivo });
    return this.abrirSessao(dados);
  }

  /** Chamada autenticada: renova antes do vencimento e, num 401, renova uma vez e repete. */
  async requisitar(metodo: Metodo, caminho: string, corpo?: unknown): Promise<unknown> {
    let renovouPorRecusa = false;
    for (;;) {
      const token = await this.tokenValido();
      const resposta = await this.enviar(metodo, caminho, corpo, token);
      if (resposta.status === 401) {
        if (renovouPorRecusa) {
          await this.limpar();
          throw new SessaoEncerrada();
        }
        renovouPorRecusa = true;
        if (this.acesso?.token === token) this.acesso = null;
        continue;
      }
      return this.tratar(resposta);
    }
  }

  /** Sai da conta neste aparelho; a limpeza local acontece mesmo se o servidor não responder. */
  async sair(): Promise<void> {
    try {
      if (this.estadoAtual.tipo === 'autenticada') await this.requisitar('POST', '/v1/acesso/sair');
    } catch (e) {
      // Sem internet ou sessão já revogada: sair localmente é o que importa para a pessoa.
      // Na web o cookie segue válido se o servidor não confirmou: fica a marca para repetir o `sair`.
      if (this.web && !(e instanceof SessaoEncerrada)) {
        await this.dep.armazenamento.marcarSaidaPendente?.().catch(() => undefined);
      }
    } finally {
      await this.limpar();
    }
  }

  /** Depois do aceite de todos os documentos pendentes. */
  aceitesEmDia(): void {
    if (this.estadoAtual.tipo === 'autenticada') {
      this.definirEstado({ tipo: 'autenticada', aceitesPendentes: false });
    }
  }

  /** Apaga acesso, refresh e todo cache de dados do usuário. */
  async limpar(): Promise<void> {
    this.geracao += 1;
    this.acesso = null;
    this.definirEstado({ tipo: 'anonima', aceitesPendentes: false });
    for (const limpeza of this.aoLimpar) limpeza();
    await this.dep.armazenamento.limpar().catch(() => undefined);
  }

  private async tokenValido(): Promise<string> {
    if (this.acesso && this.acesso.expiraEm - this.agora() > MARGEM_DE_VENCIMENTO_MS) {
      return this.acesso.token;
    }
    await this.renovar();
    if (!this.acesso) throw new SessaoEncerrada();
    return this.acesso.token;
  }

  private async abrirSessao(dados: unknown): Promise<SessaoAberta> {
    if (!validarComum('SessaoAbertaComum', dados).valido) {
      throw new RespostaForaDoContrato('corpo fora do contrato SessaoAbertaComum');
    }
    const sessao = dados as SessaoAberta;
    // Novo login troca o cookie: a marca antiga não pode derrubar a sessão nova na próxima abertura.
    await this.dep.armazenamento.limparSaidaPendente?.().catch(() => undefined);
    if (!this.web) {
      if (!sessao.refresh_token) throw new RespostaForaDoContrato('refresh_token ausente no app');
      // Primeiro o refresh novo no armazenamento seguro, só depois o novo acesso em uso.
      await this.dep.armazenamento.gravar(sessao.refresh_token);
    }
    // Na web o refresh nunca é lido nem guardado, mesmo que viesse no corpo.
    this.acesso = {
      token: sessao.token_acesso,
      expiraEm: Date.parse(sessao.token_acesso_expira_em),
    };
    this.definirEstado({ tipo: 'autenticada', aceitesPendentes: sessao.aceites_pendentes });
    return sessao;
  }

  private async tratar(resposta: Response): Promise<unknown> {
    const dados = await lerCorpo(resposta);
    if (!resposta.ok) throw erroDaResposta(resposta, dados);
    return dados;
  }

  private async enviar(
    metodo: Metodo,
    caminho: string,
    corpo?: unknown,
    token?: string,
  ): Promise<Response> {
    if (!this.dep.baseUrl) throw new ErroDeRede('EXPO_PUBLIC_API_URL não definida');
    const cabecalhos: Record<string, string> = { Accept: 'application/json' };
    if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
    if (token) cabecalhos.Authorization = `Bearer ${token}`;
    const cookieDaWeb = this.web && caminho.startsWith('/v1/acesso/');
    if (cookieDaWeb) cabecalhos['X-CondomiFacil-Web'] = '1';

    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    try {
      return await this.chamarFetch(`${this.dep.baseUrl}${caminho}`, {
        method: metodo,
        headers: cabecalhos,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
        credentials: cookieDaWeb ? 'include' : undefined,
        signal: controle.signal,
      });
    } catch (e) {
      throw new ErroDeRede(e instanceof Error ? e.message : 'falha de rede');
    } finally {
      clearTimeout(timer);
    }
  }

  private definirEstado(estado: EstadoDaSessao) {
    this.estadoAtual = estado;
    for (const ouvinte of this.ouvintes) ouvinte();
  }
}

async function lerCorpo(resposta: Response): Promise<unknown> {
  return resposta.status === 204 ? undefined : await resposta.json().catch(() => undefined);
}
