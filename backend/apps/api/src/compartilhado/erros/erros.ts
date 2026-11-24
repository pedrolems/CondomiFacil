// Hierarquia de erros da aplicação (backend §4.5; guia da API §8). O `codigo` é o que o cliente usa;
// a `mensagem` é texto de tela. Textos "Proposta" do guia aguardam validação do Pedro.
export interface DetalheDeErro {
  campo?: string;
  mensagem: string;
  codigo?: string;
}

export class ErroDeAplicacao extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly detalhes?: DetalheDeErro[],
  ) {
    super(mensagem);
  }
}

export class RequisicaoInvalida extends ErroDeAplicacao {
  constructor(detalhes?: DetalheDeErro[]) {
    super(400, 'REQUISICAO_INVALIDA', 'Confira os campos destacados e tente de novo.', detalhes);
  }
}

export class NaoAutenticado extends ErroDeAplicacao {
  constructor() {
    super(401, 'SESSAO_EXPIRADA', 'Por segurança, entre de novo na sua conta.');
  }
}

export class SemPermissao extends ErroDeAplicacao {
  constructor(perfil?: string) {
    super(
      403,
      'SEM_PERMISSAO',
      perfil
        ? `Esta área é só para ${perfil}.`
        : 'Esta área não está disponível para o seu acesso.',
    );
  }
}

export class VinculoInvalido extends ErroDeAplicacao {
  constructor() {
    super(403, 'VINCULO_INVALIDO', 'Esta área não está disponível para o seu acesso.');
  }
}

/** Também é a resposta para recurso de outro condomínio: indistinguível de inexistente. */
export class RecursoNaoEncontrado extends ErroDeAplicacao {
  constructor() {
    super(404, 'RECURSO_NAO_ENCONTRADO', 'Não encontramos o que você procurou.');
  }
}

/** Dado alterado por outra pessoa (padrão) ou código específico `<MODULO>_ESTADO_INVALIDO`. */
export class Conflito extends ErroDeAplicacao {
  constructor(
    codigo = 'CONFLITO_DADO_ALTERADO',
    mensagem = 'Estas informações mudaram. Atualizamos a tela.',
  ) {
    super(409, codigo, mensagem);
  }
}

export class RegraDeNegocioViolada extends ErroDeAplicacao {
  constructor(codigo: string, mensagem: string) {
    super(422, codigo, mensagem);
  }
}

export class ChaveDeIdempotenciaReutilizada extends ErroDeAplicacao {
  constructor() {
    super(
      422,
      'CHAVE_DE_IDEMPOTENCIA_REUTILIZADA',
      'Esta chave de idempotência já foi usada com outros dados.',
    );
  }
}

export class LimiteDeTaxaExcedido extends ErroDeAplicacao {
  constructor() {
    super(
      429,
      'LIMITE_DE_TAXA_EXCEDIDO',
      'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.',
    );
  }
}
