// Montagem do worker: banco do app_user, escopo sistema (só aqui), despachante do outbox e Mailer.
import { Module, type DynamicModule } from '@nestjs/common';
import { Despachante } from './compartilhado/outbox/despachante.js';
import { MANIPULADORES_DE_EVENTO } from './compartilhado/outbox/index.js';
import { LoggerJson } from './compartilhado/logger/index.js';
import { MAILER } from './compartilhado/portas/index.js';
import { SistemaModule } from './compartilhado/tenant/escopo-sistema.js';
import { TenantModule, type OpcoesDoBanco } from './compartilhado/tenant/index.js';
import { CaixaDeSaidaFalsa } from './integracoes/email/caixa-de-saida-falsa.mailer.js';

@Module({})
export class WorkerModule {
  static registrar(opcoesDoBanco: OpcoesDoBanco): DynamicModule {
    return {
      module: WorkerModule,
      imports: [TenantModule.registrar(opcoesDoBanco), SistemaModule],
      providers: [
        Despachante,
        { provide: LoggerJson, useValue: new LoggerJson() },
        // E14: sem Resend nesta etapa; o adaptador real entra no lugar deste, pela mesma porta.
        { provide: MAILER, useClass: CaixaDeSaidaFalsa },
        // Sem tipos de evento em produção ainda; cada módulo acrescenta o seu manipulador.
        { provide: MANIPULADORES_DE_EVENTO, useValue: [] },
      ],
    };
  }
}
