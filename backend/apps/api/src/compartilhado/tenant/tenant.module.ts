import {
  Global,
  Inject,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { BANCO, criarBanco, type Banco, type OpcoesDoBanco } from './banco.js';
import { TenantContext } from './tenant-context.js';

// Global para que o SistemaModule (só do worker) reaproveite o mesmo pool sem reimportar.
@Global()
@Module({})
export class TenantModule implements OnApplicationShutdown {
  constructor(@Inject(BANCO) private readonly banco: Banco) {}

  static registrar(opcoes: OpcoesDoBanco): DynamicModule {
    return {
      module: TenantModule,
      providers: [{ provide: BANCO, useFactory: () => criarBanco(opcoes) }, TenantContext],
      exports: [BANCO, TenantContext],
    };
  }

  onApplicationShutdown(): Promise<void> {
    return this.banco.encerrar();
  }
}
