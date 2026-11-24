import {
  ErroApi,
  ErroDeRede,
  RespostaForaDoContrato,
  SessaoEncerrada,
} from '../../infraestrutura/api/erros';

/** Onde o erro aparece: muda só o texto da pausa (login x troca de senha). */
export type ContextoDoErro = 'geral' | 'troca-de-senha';

// Textos dos User Flows 3.1 a 3.4 e do Design System 13.4. O cliente decide pelo `codigo`.
export const TEXTOS = {
  rede: 'Não foi possível conectar. Verifique a internet e tente de novo.',
  inesperado: 'Algo deu errado do nosso lado. Tente de novo em alguns minutos.',
  sessaoExpirada: 'Por segurança, entre de novo na sua conta.',
  limiteDeTaxa: 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.',
  credenciais: 'E-mail ou senha incorretos.',
  codigoInvalido: 'Este código não vale mais. Peça um novo.',
  reenvioAntecipado: 'Você poderá pedir um novo código em instantes.',
  acessoPausado:
    'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.',
  trocaPausada:
    'Por segurança, a troca de senha foi pausada por 15 minutos. Você pode redefinir a senha agora.',
  codigosPausados:
    'Por segurança, novos códigos foram pausados por 24 horas. Tente de novo mais tarde.',
  codigosPausadosMotivo: 'Novos códigos estão pausados por 24 horas.',
  acessoEncerrado:
    'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.',
  senhaAtualIncorreta: 'Senha atual incorreta.',
  versaoDesatualizada: 'Este documento foi atualizado. Leia a nova versão para aceitar.',
  origemNaoPermitida: 'Não foi possível concluir a operação por este endereço.',
} as const;

/** Tentativas restantes do `CODIGO_INCORRETO` (o servidor só as informa no texto da mensagem). */
export function tentativasRestantes(erro: unknown): number | undefined {
  if (!(erro instanceof ErroApi) || erro.codigo !== 'CODIGO_INCORRETO') return undefined;
  const n = /(\d+)\s+tentativa/.exec(erro.message)?.[1];
  return n === undefined ? undefined : Number(n);
}

export function textoDoErro(erro: unknown, contexto: ContextoDoErro = 'geral'): string {
  if (erro instanceof ErroDeRede) return TEXTOS.rede;
  if (erro instanceof SessaoEncerrada) return TEXTOS.sessaoExpirada;
  if (erro instanceof RespostaForaDoContrato || !(erro instanceof ErroApi))
    return TEXTOS.inesperado;

  switch (erro.codigo) {
    case 'CODIGO_INCORRETO': {
      const n = tentativasRestantes(erro);
      return n === undefined
        ? erro.message
        : `Código incorreto. Você tem mais ${n} ${n === 1 ? 'tentativa' : 'tentativas'}.`;
    }
    case 'CODIGO_INVALIDO_OU_VENCIDO':
      return TEXTOS.codigoInvalido;
    case 'CODIGO_REENVIO_ANTECIPADO':
      return TEXTOS.reenvioAntecipado;
    case 'ACESSO_PAUSADO':
      return contexto === 'troca-de-senha' ? TEXTOS.trocaPausada : TEXTOS.acessoPausado;
    case 'CODIGO_PAUSADO':
      return TEXTOS.codigosPausados;
    case 'ACESSO_ENCERRADO':
      return TEXTOS.acessoEncerrado;
    case 'CREDENCIAIS_INVALIDAS':
      return TEXTOS.credenciais;
    case 'SENHA_ATUAL_INCORRETA':
      return TEXTOS.senhaAtualIncorreta;
    case 'ACEITE_VERSAO_DESATUALIZADA':
      return TEXTOS.versaoDesatualizada;
    case 'ORIGEM_NAO_PERMITIDA':
      return TEXTOS.origemNaoPermitida;
    case 'SESSAO_EXPIRADA':
      return TEXTOS.sessaoExpirada;
    default:
      if (erro.status === 429) return TEXTOS.limiteDeTaxa;
      return TEXTOS.inesperado;
  }
}

/** Segundos de pausa do `ACESSO_PAUSADO` (`Retry-After`; 15 min se o cabeçalho faltar). */
export function segundosDePausa(erro: unknown): number | undefined {
  if (!(erro instanceof ErroApi) || erro.codigo !== 'ACESSO_PAUSADO') return undefined;
  return erro.esperarSegundos ?? 15 * 60;
}

/** Segundos de pausa do `CODIGO_PAUSADO` (`Retry-After`; 24 h se o cabeçalho faltar). */
export function segundosDePausaDeCodigo(erro: unknown): number | undefined {
  if (!(erro instanceof ErroApi) || erro.codigo !== 'CODIGO_PAUSADO') return undefined;
  return erro.esperarSegundos ?? 24 * 60 * 60;
}

function espera(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.ceil(segundos / 60);
  return min < 60 ? `${min} min` : `${Math.ceil(min / 60)} h`;
}

/** Por que a abertura do app não restaurou a sessão (renovação sem 401): a tela de falha escolhe o ícone. */
export type FalhaDeRestauracao = {
  tipo: 'rede' | 'limite' | 'origem' | 'inesperado';
  titulo: string;
  descricao: string;
};

export function falhaDeRestauracao(erro: unknown): FalhaDeRestauracao {
  if (erro instanceof ErroApi && erro.status === 429) {
    const aguarde = erro.esperarSegundos ? ` Espere cerca de ${espera(erro.esperarSegundos)}.` : '';
    return {
      tipo: 'limite',
      titulo: 'Muitas tentativas',
      descricao: `${TEXTOS.limiteDeTaxa}${aguarde}`,
    };
  }
  if (erro instanceof ErroApi && erro.codigo === 'ORIGEM_NAO_PERMITIDA') {
    return {
      tipo: 'origem',
      titulo: 'Endereço não permitido',
      descricao: TEXTOS.origemNaoPermitida,
    };
  }
  if (erro === undefined || erro instanceof ErroDeRede) {
    return { tipo: 'rede', titulo: 'Sem conexão com a API', descricao: TEXTOS.rede };
  }
  return { tipo: 'inesperado', titulo: 'Não foi possível abrir', descricao: TEXTOS.inesperado };
}
