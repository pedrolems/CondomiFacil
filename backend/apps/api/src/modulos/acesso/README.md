# apps/api/src/modulos/acesso

Núcleo do domínio acesso. Outros módulos importam somente sua fachada index.ts.

Implementado (RM-20): aceites de documentos (`AceitesServico`; só documentos globais até o RM-21 trazer os vínculos para o regimento por condomínio) e perfil próprio com tema (`PerfilServico`), pelo `app_user` com escopo só de usuário (`TenantContext.executarComoUsuario`). Código, sessão e senha são do módulo `autenticacao`.
