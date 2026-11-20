// Prepara o banco p2 no contenir da P3 (poc-rm16-pg). Nao toca p3 nem p5. Uso: node scripts/subir.mjs
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const psql = (usuario, banco, sql) => {
  const r = spawnSync('docker', ['exec', '-i', 'poc-rm16-pg', 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', usuario, '-d', banco],
    { input: sql, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`psql ${usuario}@${banco}: ${r.stdout}${r.stderr}`);
};

psql('postgres', 'postgres', `drop database if exists p2 with (force);
  create database p2 owner migrador; revoke all on database p2 from public;
  grant connect on database p2 to app_user, fixtures;`);
psql('migrador', 'p2', readFileSync(path.join(RAIZ, 'sql', '01-esquema.sql'), 'utf8'));
psql('migrador', 'p2', 'grant select, insert, update on all tables in schema app to fixtures;');
// Massa para medir o custo da consulta de papel (RNF-17: 5.000 unidades): 250 condominios, 20.000 usuarios e vinculos.
psql('fixtures', 'p2', `
insert into app.condominio (nome, plano) select 'Cond ' || g, case when g % 5 = 0 then 'gestao_suporte' else 'essencial' end from generate_series(1, 250) g;
insert into app.usuario (email, senha_hash) select 'massa' || g || '@exemplo.invalid', 'x' from generate_series(1, 20000) g;
insert into app.vinculo (usuario_id, condominio_id, papel)
  select u.id, c.id, (array['morador','morador','morador','portaria','sindico'])[1 + (u.rn % 5)]
  from (select id, row_number() over () rn from app.usuario) u
  join (select id, row_number() over () rn from app.condominio) c on c.rn = 1 + (u.rn % 250);
analyze;`);
console.log('Pronto: banco p2 migrado e com massa (localhost:54329).');
