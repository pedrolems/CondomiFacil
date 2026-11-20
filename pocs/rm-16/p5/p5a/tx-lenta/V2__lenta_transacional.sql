-- P5a: transacional; a conexão é derrubada durante o pg_sleep. Nada pode sobrar (DDL transacional).
create table public.u (x int not null);
select pg_sleep(8);
