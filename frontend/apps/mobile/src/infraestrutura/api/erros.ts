import { validarComum, type ComponentesComum } from '@condomifacil/shared-types';

/** Sem resposta utilizável da rede: URL ausente, falha de conexão ou tempo esgotado. */
export class ErroDeRede extends Error {}
/** A resposta não segue o contrato gerado (corpo ou formato inesperado). */
export class RespostaForaDoContrato extends Error {}
/** O refresh foi recusado (401) ou ausente: a sessão local já foi limpa e é preciso entrar de novo. */
export class SessaoEncerrada extends Error {
  constructor() {
    super('Sessão encerrada');
  }
}

type DetalheDoErro = NonNullable<ComponentesComum['schemas']['Erro']['detalhes']>[number];

/** Erro do contrato (`Erro`): o cliente decide pelo `codigo`, nunca pela `mensagem`. */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly requestId?: string,
    /** Segundos do cabeçalho `Retry-After`, quando vier. */
    readonly esperarSegundos?: number,
    readonly detalhes?: DetalheDoErro[],
  ) {
    super(mensagem);
  }
}

/** Monta o `ErroApi` de uma resposta que não é de sucesso; corpo fora do contrato vira código genérico. */
export function erroDaResposta(resposta: Response, corpo: unknown): ErroApi {
  const retry = Number(resposta.headers.get('Retry-After'));
  const espera = Number.isFinite(retry) && retry > 0 ? retry : undefined;
  if (validarComum('Erro', corpo).valido) {
    const e = corpo as ComponentesComum['schemas']['Erro'];
    return new ErroApi(resposta.status, e.codigo, e.mensagem, e.request_id, espera, e.detalhes);
  }
  return new ErroApi(resposta.status, 'ERRO_DESCONHECIDO', '', undefined, espera);
}
