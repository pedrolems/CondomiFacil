// Fachada pública do tenant. escopo-sistema fica de fora de propósito (só o worker o importa).
export { sql } from 'kysely';
// BANCO, criarBanco, banco, transacao e guarda ficam de fora: só tenant/ os importa.
export type { OpcoesDoBanco } from './banco.js';
export { ForaDoTenantContext } from './guarda.js';
export { TenantContext, type ContextoDeTenant } from './tenant-context.js';
export { TenantModule } from './tenant.module.js';
export type { Transacao, TransacaoAutenticacao } from './transacao.js';
export type { DbApp, DbApp as DB, DbAutenticacao } from './tipos.js';
// ExecutorDeAutenticacao fica de fora de propósito: só o módulo autenticacao o importa (de ./autenticacao.js).
export { AutenticacaoBancoModule } from './autenticacao.js';
