-- P5a: migration não transacional e lenta. Com o lock transacional (padrão) o Flyway não teria
-- transação própria para segurar a trava durante o CREATE INDEX CONCURRENTLY.
select pg_sleep(6);
create index concurrently t_ix on public.t (x);
