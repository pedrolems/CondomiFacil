import { Module, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Config } from './compartilhado/config/config.js';
import { FiltroDeErros } from './compartilhado/erros/index.js';
import { LoggerJson } from './compartilhado/logger/index.js';
import { logDeRequisicao } from './interfaces/http/comum/log-de-requisicao.js';
import { requestId } from './interfaces/http/comum/request-id.js';
import { SaudeController } from './interfaces/http/comum/saude.controller.js';

@Module({ controllers: [SaudeController] })
export class ApiModule {}

/** Configuração HTTP comum ao processo e aos testes: id da requisição, log, erro padrão e CORS só das origens configuradas. */
export function configurarApp(
  app: INestApplication,
  config: Config,
  logger: LoggerJson = new LoggerJson(),
): void {
  (app as NestExpressApplication).disable('x-powered-by');
  app.use(requestId);
  app.use(logDeRequisicao(logger));
  app.useGlobalFilters(new FiltroDeErros(logger));
  app.enableCors({ origin: config.CORS_ALLOWED_ORIGINS, methods: ['GET'] });
}
