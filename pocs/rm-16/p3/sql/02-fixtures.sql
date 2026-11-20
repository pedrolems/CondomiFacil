-- PoC P3 (RM-16). Executado como "fixtures" no banco p3. Dados 100% fictícios e determinísticos
-- (IDs derivados de md5; datas e horários relativos ao momento da execução). Nunca usar fora deste ambiente local.
--
-- Volume (RNF-10 e RNF-17):
--   condomínio 1 ("Grande"): 5.000 unidades, 10 portarias, 10.000 visitas/dia por 180 dias (1,8 mi);
--   condomínios 2 a 100: 150 unidades, 1 portaria, 150 visitas/dia por 30 dias (~445 mil).

begin;

insert into app.condominio (id, nome)
select md5('condominio-' || i)::uuid,
       case when i = 1 then 'Residencial Grande (fictício)' else 'Condomínio fictício ' || i end
from generate_series(1, 100) i;

insert into app.unidade (id, condominio_id, bloco, numero)
select md5('unidade-' || i || '-' || n)::uuid,
       md5('condominio-' || i)::uuid,
       'Bloco ' || ((n - 1) / 250 + 1),
       ((n - 1) % 250 + 1)::text
from generate_series(1, 100) i,
     generate_series(1, case when i = 1 then 5000 else 150 end) n;

insert into app.portaria (id, condominio_id, nome)
select md5('portaria-' || i || '-' || p)::uuid, md5('condominio-' || i)::uuid, 'Portaria ' || p
from generate_series(1, 100) i,
     generate_series(1, case when i = 1 then 10 else 1 end) p;

insert into app.visita (id, condominio_id, unidade_id, nome_visitante, dia, estado,
                        criada_em, entrada_em, portaria_entrada_id)
select md5('visita-' || i || '-' || d || '-' || n)::uuid,
       md5('condominio-' || i)::uuid,
       md5('unidade-' || i || '-' || ((n - 1) % u + 1))::uuid,
       'Visitante fictício ' || n,
       current_date - d,
       e.estado,
       c.criada_em,
       case when e.estado in ('dentro', 'saiu') then c.criada_em + interval '10 minutes' end,
       case when e.estado in ('dentro', 'saiu')
            then md5('portaria-' || i || '-' || (case when i = 1 then n % 10 + 1 else 1 end))::uuid end
from generate_series(1, 100) i
cross join lateral (select case when i = 1 then 5000 else 150 end as u,
                           case when i = 1 then 180 else 30 end as dias,
                           case when i = 1 then 10000 else 150 end as por_dia) p
cross join lateral generate_series(0, p.dias - 1) d
cross join lateral generate_series(1, p.por_dia) n
cross join lateral (select case
         when d > 0 then case when n % 10 = 9 then 'cancelada' else 'saiu' end
         when n % 10 <= 5 then 'esperada'
         when n % 10 <= 7 then 'dentro'
         when n % 10 = 8 then 'saiu'
         else 'cancelada' end as estado) e
-- Hoje: criadas na última hora antes da carga, para que visitas novas fiquem no topo da lista do dia.
cross join lateral (select case when d = 0 then now() - interval '1 hour' - n * interval '300 milliseconds'
                                else (current_date - d)::timestamptz + n * interval '8 seconds' end as criada_em) c;

commit;
