-- P5a: forma segura; remove o índice inválido de uma tentativa interrompida antes de recriar.
drop index concurrently if exists public.g_ix;
create index concurrently g_ix on public.g ((md5(i::text)));
