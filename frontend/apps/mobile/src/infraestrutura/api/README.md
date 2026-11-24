# API

`cliente-sessao.ts`: sessão do ADR-007 (acesso só em memória, renovação single-flight com trava, refresh no armazenamento seguro do app ou no cookie httpOnly da web). `erros.ts`: `ErroApi` com o `codigo` do contrato. `saude.ts`: consulta de saúde. Contexto (`X-Condominio-Id`) entra no RM-21.

Referência: docs/06-frontend/frontend.md, seção 2.1.
