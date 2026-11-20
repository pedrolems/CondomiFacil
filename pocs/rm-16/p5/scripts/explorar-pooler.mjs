// Exploração (P5a, modo de conexão): dois Flyway concorrentes através de um PgBouncer temporário
// (poc-rm16-p5-pooler, só na rede Docker, removido no fim). Uso: node scripts/explorar-pooler.mjs <transaction|session> <pool_size>
import { rodar, recriarBanco, psql, flyway, esperar, RAIZ } from './ambiente.mjs';
import path from 'node:path';
const modo = process.argv[2] ?? 'transaction';
const banco = 'rm16_pool_flyway';
await rodar('docker', ['rm', '-f', 'poc-rm16-p5-pooler']);
await recriarBanco(banco);
console.log((await rodar('docker', ['run', '-d', '--name', 'poc-rm16-p5-pooler', '--network', 'poc-rm16-net',
  '-e', 'DB_HOST=poc-rm16-pg', '-e', `DB_NAME=${banco}`, '-e', 'DB_USER=migrador', '-e', 'DB_PASSWORD=migrador_local_ficticia',
  '-e', 'AUTH_TYPE=scram-sha-256', '-e', `POOL_MODE=${modo}`, '-e', `DEFAULT_POOL_SIZE=${process.argv[3] ?? 5}`, 'edoburu/pgbouncer:latest'])).out);
await esperar(2000);
const op = { banco, host: 'poc-rm16-p5-pooler', sslmode: 'disable', locais: path.join(RAIZ, 'p5a', 'pooler'), timeoutMs: 90000 };
const a = flyway('migrate', { ...op, nome: 'p5a-pool-a' });
await esperar(1500);
const b = flyway('migrate', { ...op, nome: 'p5a-pool-b' });
await esperar(4000);
console.log('LOCKS', await psql(banco, `select l.pid||'|'||l.granted||'|'||l.objid||'|'||s.state||'|'||left(s.query,60) from pg_locks l join pg_stat_activity s using (pid) where s.datname='${banco}' and l.locktype='advisory'`));
const [ra, rb] = await Promise.all([a, b]);
await rodar('docker', ['rm', '-f', 'p5a-pool-a', 'p5a-pool-b']);
const f = (o) => o.split('\n').filter((l) => /Migrat|Success|ERROR|WARN|up to date|timeout|lock|Lock/.test(l)).slice(0, 12).join('\n');
console.log('A code', ra.code, '\n' + f(ra.out)); console.log('B code', rb.code, '\n' + f(rb.out));
console.log('MARCAS -1 em t:', await psql(banco, 'select count(*) from public.t where x = -1').catch(e=>e.message)); console.log('HIST', await psql(banco, `select version||'|'||success from migracao.flyway_schema_history where version is not null order by installed_rank`).catch(e => e.message));
console.log('LOCKS DEPOIS', await psql(banco, `select l.pid||'|'||s.state from pg_locks l join pg_stat_activity s using (pid) where s.datname='${banco}' and l.locktype='advisory'`));
await rodar('docker', ['rm', '-f', 'poc-rm16-p5-pooler']);
await psql('postgres', `drop database if exists ${banco} with (force);`);
