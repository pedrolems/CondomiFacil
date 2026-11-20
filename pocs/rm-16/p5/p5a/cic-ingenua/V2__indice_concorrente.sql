-- P5a: forma ingênua; interrompida, deixa índice INVÁLIDO e a reexecução falha ("already exists").
create index concurrently g_ix on public.g ((md5(i::text)));
