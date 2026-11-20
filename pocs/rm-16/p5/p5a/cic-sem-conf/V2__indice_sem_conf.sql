-- P5a: CONCURRENTLY sem o .conf, para ver se o Flyway detecta sozinho que não é transacional.
create index concurrently t_ix on public.t (x);
