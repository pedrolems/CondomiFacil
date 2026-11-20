-- P5a: tabela simples para o cenário de dois migradores concorrentes.
create table public.t (x int not null);
insert into public.t select generate_series(1, 1000);
