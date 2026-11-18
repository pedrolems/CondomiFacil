import { Module, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Config } from './compartilhado/config/config.js';
import { requestId } from './interfaces/http/comum/request-id.js';
import { SaudeController } from './interfaces/http/comum/saude.controller.js';

@Module({ controllers: [SaudeController] })
export class ApiModule {}

/** Configuração HTTP comum ao processo e aos testes. CORS só para as origens configuradas. */
export function configurarApp(app: INestApplication, config: Config): void {
  (app as NestExpressApplication).disable('x-powered-by');
  app.use(requestId);
  app.enableCors({ origin: config.CORS_ALLOWED_ORIGINS, methods: ['GET'] });
}
