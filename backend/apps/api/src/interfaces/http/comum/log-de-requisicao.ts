import type { NextFunction, Request, Response } from 'express';
import type { LoggerJson } from '../../../compartilhado/logger/index.js';

/** Contexto que as etapas seguintes (RM-20 em diante) preenchem em `res.locals.contextoDeLog`. */
export interface ContextoDeLog {
  condominio_id?: string;
  usuario_id?: string;
  perfil?: string;
}

/** Uma linha por requisição, ao terminar. Nunca registra corpo, cabeçalhos nem query string. */
export function logDeRequisicao(logger: LoggerJson) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const inicio = process.hrtime.bigint();
    res.on('finish', () => {
      const ctx = (res.locals.contextoDeLog ?? {}) as ContextoDeLog;
      logger.info('requisicao', {
        request_id: res.getHeader('X-Request-Id'),
        ...ctx,
        metodo: req.method,
        // Padrão da rota (/v1/x/:id), não a URL: o identificador de pessoa não entra no log.
        rota: req.route ? `${req.baseUrl}${String(req.route.path)}` : 'nao_roteada',
        status: res.statusCode,
        duracao_ms: Number((process.hrtime.bigint() - inicio) / 1_000_000n),
      });
    });
    next();
  };
}
