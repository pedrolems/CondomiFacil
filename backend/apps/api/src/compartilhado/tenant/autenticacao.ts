import {
  Global,
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { criarBanco, type Banco, type OpcoesDoBanco } from './banco.js';
import { abrirTransacao, type TransacaoAutenticacao } from './transacao.js';
import type { DbAutenticacao } from './tipos.js';

export const BANCO_AUTENTICACAO = Symbol('BANCO_AUTENTICACAO');

/**
 * Conexão própria do módulo autenticacao (ADR-007, E6): papel app_autenticacao, sem RLS e fora do
 * TenantContext, com a mesma guarda de transação e o contexto vazio. Só o módulo autenticacao a usa.
 */
@Injectable()
export class ExecutorDeAutenticacao {
  constructor(@Inject(BANCO_AUTENTICACAO) private readonly banco: Banco<DbAutenticacao>) {}

  executar<T>(fn: (tx: TransacaoAutenticacao) => Promise<T>): Promise<T> {
    return abrirTransacao(this.banco, {}, fn);
  }
}

// Global, como o TenantModule: o módulo autenticacao injeta o executor sem reimportar o pool.
@Global()
@Module({})
export class AutenticacaoBancoModule implements OnApplicationShutdown {
  constructor(@Inject(BANCO_AUTENTICACAO) private readonly banco: Banco<DbAutenticacao>) {}

  static registrar(opcoes: OpcoesDoBanco): DynamicModule {
    return {
      module: AutenticacaoBancoModule,
      providers: [
        { provide: BANCO_AUTENTICACAO, useFactory: () => criarBanco<DbAutenticacao>(opcoes) },
        ExecutorDeAutenticacao,
      ],
      exports: [ExecutorDeAutenticacao],
    };
  }

  onApplicationShutdown(): Promise<void> {
    return this.banco.encerrar();
  }
}
