// Fachada pública do módulo autenticacao (único que toca sessao, desafio_acesso, controle_login e
// as colunas de credencial de usuario, pelo app_autenticacao).
export { AcessoServico, type Dispositivo, type SessaoEmitida } from './aplicacao/acesso.servico.js';
export {
  AutenticadoGuard,
  type Autenticacao,
  type RequisicaoAutenticada,
} from './aplicacao/autenticado.guard.js';
export { LimitadorDeTaxa } from './aplicacao/limitador-de-taxa.js';
export { RELOGIO, relogioDoSistema, type Relogio } from './aplicacao/relogio.js';
export { AutenticacaoModule } from './autenticacao.module.js';
export { CONFIG_ACESSO, lerConfigAcesso, type ConfigAcesso } from './config.js';
export { OrigemNaoPermitida } from './erros.js';
