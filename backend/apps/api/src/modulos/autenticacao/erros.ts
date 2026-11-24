// Erros do acesso (contrato comum.yaml; textos de UF 3.1, 3.2 e 3.4, aprovados por Pedro em 24/11/2026).
import {
  cabecalhoRetryAfter as retryAfter,
  ErroDeAplicacao,
} from '../../compartilhado/erros/index.js';

export class CodigoIncorreto extends ErroDeAplicacao {
  constructor(restantes: number) {
    super(
      422,
      'CODIGO_INCORRETO',
      `Código incorreto. Você tem mais ${restantes} ${restantes === 1 ? 'tentativa' : 'tentativas'}.`,
    );
  }
}

export class CodigoInvalidoOuVencido extends ErroDeAplicacao {
  constructor() {
    super(422, 'CODIGO_INVALIDO_OU_VENCIDO', 'Este código não vale mais. Peça um novo.');
  }
}

export class CodigoReenvioAntecipado extends ErroDeAplicacao {
  constructor(segundos: number) {
    super(
      429,
      'CODIGO_REENVIO_ANTECIPADO',
      'Você poderá pedir um novo código em instantes.',
      undefined,
      retryAfter(segundos),
    );
  }
}

export class CodigoPausado extends ErroDeAplicacao {
  constructor(segundos: number) {
    super(
      429,
      'CODIGO_PAUSADO',
      'Por segurança, novos códigos foram pausados por 24 horas. Tente de novo mais tarde.',
      undefined,
      retryAfter(segundos),
    );
  }
}

export class CredenciaisInvalidas extends ErroDeAplicacao {
  constructor() {
    super(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
  }
}

export class AcessoEncerrado extends ErroDeAplicacao {
  constructor() {
    super(
      403,
      'ACESSO_ENCERRADO',
      'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.',
    );
  }
}

export class AcessoPausado extends ErroDeAplicacao {
  constructor(origem: 'acesso' | 'troca_de_senha', segundos: number) {
    super(
      429,
      'ACESSO_PAUSADO',
      origem === 'acesso'
        ? 'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.'
        : 'Por segurança, a troca de senha foi pausada por 15 minutos. Você pode redefinir a senha agora.',
      undefined,
      retryAfter(segundos),
    );
  }
}

export class SenhaAtualIncorreta extends ErroDeAplicacao {
  constructor() {
    super(422, 'SENHA_ATUAL_INCORRETA', 'Senha atual incorreta.');
  }
}

export class OrigemNaoPermitida extends ErroDeAplicacao {
  constructor() {
    super(403, 'ORIGEM_NAO_PERMITIDA', 'Não foi possível concluir a operação por este endereço.');
  }
}
