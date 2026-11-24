# apps/api/src/modulos/autenticacao

Único módulo que toca `sessao`, `desafio_acesso`, `controle_login` e as colunas de credencial de `usuario`, pelo papel `app_autenticacao` (`ExecutorDeAutenticacao`, fora do `TenantContext`; ADR-007, fase 2 E6 e E7). Os controllers ficam em `interfaces/http/comum/`.

Implementado (RM-20): código de acesso (`DesafiosServico`), login e pausa (`ControleDeLogin`), sessões e renovação com retry B+E (`SessoesServico`), JWT HS256 (`TokenDeAcesso`), HMAC e Argon2id (`Credenciais`, biblioteca `argon2`), limitador em memória (`LimitadorDeTaxa`), `AutenticadoGuard` (token + sessão viva, sem cache) e `AcessoServico`, que compõe tudo. Relógio injetável (`RELOGIO`). Configuração e segredos por variável de ambiente (`config.ts`; `.env.example`).

Aceites e perfil ficam no módulo `acesso` (`app_user`, pelo `TenantContext`).
