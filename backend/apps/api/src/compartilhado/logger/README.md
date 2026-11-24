# apps/api/src/compartilhado/logger

Log estruturado com filtro de dados sensíveis. Não importar módulos de domínio.

Implementado (RM-24): `LoggerJson` (uma linha JSON por evento) e `sanitizar`, que remove campos proibidos em qualquer profundidade e mascara e-mail, documento, telefone e token em texto; de `Error` só o tipo é registrado.
