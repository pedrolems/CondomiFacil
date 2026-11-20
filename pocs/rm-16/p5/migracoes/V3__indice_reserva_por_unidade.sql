-- PoC P5 (RM-16). Migration não transacional (V3__...sql.conf: executeInTransaction=false).
-- O DROP antes do CREATE torna a reexecução segura: CREATE INDEX CONCURRENTLY interrompido deixa
-- um índice INVÁLIDO com o mesmo nome, e "create index concurrently if not exists" o manteria inválido.
drop index concurrently if exists app.reserva_por_unidade;
create index concurrently reserva_por_unidade on app.reserva (condominio_id, unidade_id, periodo);
