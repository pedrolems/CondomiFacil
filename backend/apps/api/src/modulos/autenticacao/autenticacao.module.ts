import { Module, type DynamicModule } from '@nestjs/common';
import { LoggerJson } from '../../compartilhado/logger/index.js';
import { AcessoServico } from './aplicacao/acesso.servico.js';
import { AutenticadoGuard } from './aplicacao/autenticado.guard.js';
import { ControleDeLogin } from './aplicacao/controle-de-login.servico.js';
import { Credenciais } from './aplicacao/credenciais.js';
import { DesafiosServico } from './aplicacao/desafios.servico.js';
import { LimitadorDeTaxa } from './aplicacao/limitador-de-taxa.js';
import { RELOGIO, relogioDoSistema, type Relogio } from './aplicacao/relogio.js';
import { SessoesServico } from './aplicacao/sessoes.servico.js';
import { TokenDeAcesso } from './aplicacao/tokens.js';
import { CONFIG_ACESSO, type ConfigAcesso } from './config.js';

// Precisa de ExecutorDeAutenticacao (AutenticacaoBancoModule) e de MAILER (módulo de e-mail, global).
@Module({})
export class AutenticacaoModule {
  static registrar(
    config: ConfigAcesso,
    opcoes: { relogio?: Relogio; logger?: LoggerJson } = {},
  ): DynamicModule {
    return {
      module: AutenticacaoModule,
      providers: [
        { provide: CONFIG_ACESSO, useValue: config },
        { provide: RELOGIO, useValue: opcoes.relogio ?? relogioDoSistema },
        { provide: LoggerJson, useValue: opcoes.logger ?? new LoggerJson() },
        Credenciais,
        TokenDeAcesso,
        SessoesServico,
        DesafiosServico,
        ControleDeLogin,
        AcessoServico,
        LimitadorDeTaxa,
        AutenticadoGuard,
      ],
      exports: [CONFIG_ACESSO, AcessoServico, LimitadorDeTaxa, AutenticadoGuard],
    };
  }
}
