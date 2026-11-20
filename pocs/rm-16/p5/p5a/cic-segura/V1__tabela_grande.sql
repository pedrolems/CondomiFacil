-- P5a: tabela grande (3 mi de linhas) para o índice da V2 levar alguns segundos.
create table public.g as select i from generate_series(1, 3000000) i;
