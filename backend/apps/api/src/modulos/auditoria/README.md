# apps/api/src/modulos/auditoria

Núcleo do domínio auditoria. Outros módulos importam somente sua fachada index.ts.

Implementado (RM-24): `AuditoriaServico` (fachada em `index.ts`) grava `auditoria` e `auditoria_plataforma` na transação recebida; as tabelas só aceitam inclusão.
