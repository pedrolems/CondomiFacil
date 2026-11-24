import { validarComum, type ComponentesComum } from '@condomifacil/shared-types';
import type { ClienteSessao, SessaoAberta } from '../../infraestrutura/api/cliente-sessao';
import { RespostaForaDoContrato } from '../../infraestrutura/api/erros';

type Esquemas = ComponentesComum['schemas'];
export type Perfil = Esquemas['PerfilComum'];
export type TemaPreferido = Esquemas['TemaComum'];
export type DocumentoPendente = Esquemas['DocumentoPendenteComum'];
export type SessaoDoUsuario = Esquemas['SessaoComum'];
export type FinalidadeDoCodigo = Esquemas['PedirCodigoComum']['finalidade'];

type EsquemaComum = Parameters<typeof validarComum>[0];

/** Confere o corpo contra o esquema gerado; fora do contrato nunca chega à tela. */
function conferir<T>(nome: EsquemaComum, dado: unknown): T {
  if (!validarComum(nome, dado).valido)
    throw new RespostaForaDoContrato(`corpo fora do contrato ${nome}`);
  return dado as T;
}

const LIMITE_POR_PAGINA = 50;
const MAXIMO_DE_PAGINAS = 5;

/** Páginas por cursor até acabar (poucos itens por usuário); o teto evita laço sem fim. */
async function todasAsPaginas<T>(
  cliente: ClienteSessao,
  caminho: string,
  esquemaDoItem: EsquemaComum,
): Promise<T[]> {
  const itens: T[] = [];
  let cursor: string | null = null;
  for (let pagina = 0; pagina < MAXIMO_DE_PAGINAS; pagina += 1) {
    const consulta = `limite=${LIMITE_POR_PAGINA}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const dados = (await cliente.requisitar('GET', `${caminho}?${consulta}`)) as {
      dados?: unknown[];
      paginacao?: { proximo_cursor?: string | null; tem_mais?: boolean };
    };
    if (!Array.isArray(dados?.dados) || !dados.paginacao) {
      throw new RespostaForaDoContrato('página fora do contrato');
    }
    for (const item of dados.dados) itens.push(conferir<T>(esquemaDoItem, item));
    cursor = dados.paginacao.proximo_cursor ?? null;
    if (!dados.paginacao.tem_mais || !cursor) break;
  }
  return itens;
}

/** Operações de acesso do RM-20 (`comum.yaml`), uma por `operationId`. */
export function criarOperacoesDeAcesso(cliente: ClienteSessao) {
  return {
    /** comumPedirCodigo */
    async pedirCodigo(email: string, finalidade: FinalidadeDoCodigo) {
      const dados = await cliente.publica('POST', '/v1/acesso/codigo', { email, finalidade });
      return conferir<Esquemas['RespostaCodigoComum']>('RespostaCodigoComum', dados);
    },
    /** comumAtivar */
    ativar: (email: string, codigo: string, novaSenha: string): Promise<SessaoAberta> =>
      cliente.abrirSessaoCom('/v1/acesso/ativar', { email, codigo, nova_senha: novaSenha }),
    /** comumEntrar */
    entrar: (email: string, senha: string): Promise<SessaoAberta> =>
      cliente.abrirSessaoCom('/v1/acesso/entrar', { email, senha }),
    /** comumRedefinirSenha */
    redefinirSenha: (email: string, codigo: string, novaSenha: string): Promise<SessaoAberta> =>
      cliente.abrirSessaoCom('/v1/acesso/redefinir-senha', {
        email,
        codigo,
        nova_senha: novaSenha,
      }),
    /** comumSair */
    sair: () => cliente.sair(),
    /** comumListarAceitesPendentes */
    listarAceitesPendentes: () =>
      todasAsPaginas<DocumentoPendente>(cliente, '/v1/acesso/aceites', 'DocumentoPendenteComum'),
    /** comumRegistrarAceites */
    async registrarAceites(documentoVersaoIds: string[]) {
      const dados = await cliente.requisitar('POST', '/v1/acesso/aceites', {
        documento_versao_ids: documentoVersaoIds,
      });
      return conferir<Esquemas['AceitesRegistradosComum']>('AceitesRegistradosComum', dados);
    },
    /** comumObterPerfil */
    async obterPerfil() {
      return conferir<Perfil>('PerfilComum', await cliente.requisitar('GET', '/v1/eu'));
    },
    /** comumAtualizarPerfil (tema) */
    async atualizarTema(tema: TemaPreferido) {
      const dados = await cliente.requisitar('PATCH', '/v1/eu', { tema_preferido: tema });
      return conferir<Perfil>('PerfilComum', dados);
    },
    /** comumListarSessoes */
    listarSessoes: () => todasAsPaginas<SessaoDoUsuario>(cliente, '/v1/eu/sessoes', 'SessaoComum'),
    /** comumEncerrarSessao */
    async encerrarSessao(sessaoId: string) {
      await cliente.requisitar('DELETE', `/v1/eu/sessoes/${encodeURIComponent(sessaoId)}`);
    },
    /** comumTrocarSenha */
    async trocarSenha(senhaAtual: string, novaSenha: string) {
      await cliente.requisitar('POST', '/v1/eu/senha', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });
    },
  };
}

export type OperacoesDeAcesso = ReturnType<typeof criarOperacoesDeAcesso>;
