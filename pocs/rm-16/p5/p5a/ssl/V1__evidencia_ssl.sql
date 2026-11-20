-- P5a: grava o estado TLS da própria sessão do Flyway (pg_stat_ssl).
create table public.evidencia_ssl as
  select ssl, version, cipher, current_user as usuario from pg_stat_ssl where pid = pg_backend_pid();
