import { Module, type DynamicModule, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Config } from './compartilhado/config/config.js';
import { FiltroDeErros } from './compartilhado/erros/index.js';
import { LoggerJson } from './compartilhado/logger/index.js';
import {
  AutenticacaoBancoModule,
  TenantModule,
  type OpcoesDoBanco,
} from './compartilhado/tenant/index.js';
import { EmailModule } from './integracoes/email/email.module.js';
import { AcessoController } from './interfaces/http/comum/acesso.controller.js';
import { EuController } from './interfaces/http/comum/eu.controller.js';
import { AcessoModule } from './modulos/acesso/index.js';
import {
  AutenticacaoModule,
  type ConfigAcesso,
  type Relogio,
} from './modulos/autenticacao/index.js';
import { logDeRequisicao } from './interfaces/http/comum/log-de-requisicao.js';
import { requestId } from './interfaces/http/comum/request-id.js';
import { SaudeController } from './interfaces/http/comum/saude.controller.js';

@Module({ controllers: [SaudeController] })
export class ApiModule {}

export interface OpcoesDaApi {
  acesso: ConfigAcesso;
  /** app_user (TenantContext). */
  banco: OpcoesDoBanco;
  /** app_autenticacao (módulo autenticacao). */
  bancoAutenticacao: OpcoesDoBanco;
  relogio?: Relogio;
  logger?: LoggerJson;
}

/** API com banco: saúde mais o acesso do RM-20. `ApiModule` sozinho segue sem banco (testes de saúde). */
@Module({})
export class ApiComBancoModule {
  static registrar(o: OpcoesDaApi): DynamicModule {
    return {
      module: ApiComBancoModule,
      imports: [
        ApiModule,
        TenantModule.registrar(o.banco),
        AutenticacaoBancoModule.registrar(o.bancoAutenticacao),
        EmailModule,
        AutenticacaoModule.registrar(o.acesso, { relogio: o.relogio, logger: o.logger }),
        AcessoModule,
      ],
      controllers: [AcessoController, EuController],
    };
  }
}

/**
 * Configuração HTTP comum ao processo e aos testes: id da requisição, log, erro padrão e CORS só das
 * origens configuradas, com credenciais (cookie `rt` da web) e nunca curinga.
 */
export function configurarApp(
  app: INestApplication,
  config: Config,
  logger: LoggerJson = new LoggerJson(),
): void {
  (app as NestExpressApplication).disable('x-powered-by');
  app.use(requestId);
  app.use(logDeRequisicao(logger));
  app.useGlobalFilters(new FiltroDeErros(logger));
  app.enableCors({
    origin: config.CORS_ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    exposedHeaders: ['Retry-After', 'X-Request-Id'],
  });
}
