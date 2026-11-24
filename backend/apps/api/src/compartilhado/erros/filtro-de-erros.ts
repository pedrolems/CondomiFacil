import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import type { LoggerJson } from '../logger/index.js';
import { ErroDeAplicacao, RequisicaoInvalida } from './erros.js';

const ERRO_INTERNO = new ErroDeAplicacao(
  500,
  'ERRO_INTERNO',
  'Algo deu errado do nosso lado. Tente de novo em alguns minutos.',
);

// Status do guia §8 para erro que não é da aplicação (rota inexistente, corpo grande, JSON malformado...):
// só o status importa, nunca o texto. 413 não tem código próprio no guia: usa REQUISICAO_INVALIDA.
const POR_STATUS: Record<number, [string, string]> = {
  401: ['SESSAO_EXPIRADA', 'Por segurança, entre de novo na sua conta.'],
  403: ['SEM_PERMISSAO', 'Esta área não está disponível para o seu acesso.'],
  404: ['RECURSO_NAO_ENCONTRADO', 'Não encontramos o que você procurou.'],
  409: ['CONFLITO_DADO_ALTERADO', 'Estas informações mudaram. Atualizamos a tela.'],
  422: ['REGRA_DE_NEGOCIO_VIOLADA', 'Não foi possível concluir. Confira os dados e tente de novo.'],
  426: ['VERSAO_DO_APP_NAO_SUPORTADA', 'Atualize o app para continuar.'],
  429: [
    'LIMITE_DE_TAXA_EXCEDIDO',
    'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.',
  ],
  503: ['SERVICO_INDISPONIVEL', ERRO_INTERNO.message],
};

function statusDe(e: unknown): number | undefined {
  if (e instanceof HttpException) return e.getStatus();
  // Erros do body-parser (http-errors) não são HttpException.
  const x = e as { status?: unknown; expose?: unknown };
  return typeof x?.status === 'number' && x.expose === true ? x.status : undefined;
}

function dePadrao(e: unknown): ErroDeAplicacao {
  const status = statusDe(e);
  if (status === undefined || status === 500) return ERRO_INTERNO;
  const conhecido = POR_STATUS[status];
  if (conhecido) return new ErroDeAplicacao(status, conhecido[0], conhecido[1]);
  if (status >= 400 && status < 500) {
    const r = new RequisicaoInvalida();
    return new ErroDeAplicacao(status, r.codigo, r.message);
  }
  return ERRO_INTERNO;
}

/** Filtro global: todo erro sai em { codigo, mensagem, detalhes?, request_id }; 500 sem detalhe interno. */
@Catch()
export class FiltroDeErros implements ExceptionFilter {
  constructor(private readonly logger: LoggerJson) {}

  catch(excecao: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const erro = excecao instanceof ErroDeAplicacao ? excecao : dePadrao(excecao);
    const requestId = String(res.getHeader('X-Request-Id') ?? '');
    if (erro.status >= 500) {
      this.logger.erro('erro_interno', { request_id: requestId, causa: excecao });
    }
    res.status(erro.status).json({
      codigo: erro.codigo,
      mensagem: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
      request_id: requestId,
    });
  }
}
