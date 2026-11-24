// Recortes do DB gerado (pendência do banco do RM-20): o codegen vê tudo o que o app_user e o
// app_autenticacao alcançam juntos, mas cada papel tem grants próprios. Não gerado: derivado por
// Omit/Pick, então uma tabela nova só aparece aqui por escolha explícita.
import type { DB, Usuario } from './gerado/tipos-banco.js';

/** O que o app_user (TenantContext) enxerga: sem o plano de autenticação e sem usuario.senha_hash. */
export type DbApp = Omit<DB, 'sessao' | 'desafio_acesso' | 'controle_login' | 'usuario'> & {
  usuario: Omit<Usuario, 'senha_hash'>;
};

/** O que o app_autenticacao enxerga: só o plano de autenticação e as colunas de credencial. */
export type DbAutenticacao = Pick<DB, 'sessao' | 'desafio_acesso' | 'controle_login'> & {
  usuario: Pick<Usuario, 'id' | 'email_normalizado' | 'senha_hash' | 'estado' | 'anonimizado_em'>;
};
