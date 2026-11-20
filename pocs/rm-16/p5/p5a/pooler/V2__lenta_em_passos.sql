-- P5a: não transacional com vários comandos curtos, para outro cliente do pooler intercalar entre eles.
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
select pg_sleep(0.5);
insert into public.t values (-1);
