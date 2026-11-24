// Fachada pública do módulo acesso: aceites e perfil próprio (RM-20). Código, sessão e senha são do
// módulo autenticacao.
export {
  AceitesServico,
  type AceiteRegistrado,
  type DocumentoPendente,
} from './aplicacao/aceites.servico.js';
export { PerfilServico, type Perfil, type Tema } from './aplicacao/perfil.servico.js';
export { AcessoModule } from './acesso.module.js';
