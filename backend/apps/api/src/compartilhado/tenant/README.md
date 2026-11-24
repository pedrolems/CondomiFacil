# apps/api/src/compartilhado/tenant

TenantContext: único caminho ao banco com isolamento por condomínio. Não importar módulos de domínio.

Implementado (RM-24): `TenantContext` (`executar` e `executarComoPlataforma`), guarda no driver que recusa consulta fora do contexto antes de chegar ao banco, Kysely sobre postgres.js e tipos gerados em `gerado/` (`pnpm db:tipos`). `escopo-sistema.ts` (leitura de pendências do outbox) é só do worker e fica fora do `index.ts`; o lint barra o import fora dele.

RM-20: `executarComoUsuario` (escopo só de usuário, sem condomínio; perfil e aceites) e `tipos.ts` (não gerado), que restringe o `DB` gerado por `Omit`/`Pick`: o `DbApp` do `TenantContext` não tem `sessao`, `desafio_acesso`, `controle_login` nem `usuario.senha_hash`; o `DbAutenticacao` só tem o plano de autenticação e as colunas de credencial. `autenticacao.ts` cria a conexão própria do módulo `autenticacao` (papel `app_autenticacao`, mesma guarda de transação), fora do `TenantContext`.
