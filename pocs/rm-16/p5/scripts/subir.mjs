// PoC P5: prepara o banco p5 no contêiner da P3 (poc-rm16-pg), sem mexer no banco p3.
// 1) garante os papéis da P3 (cluster inteiro); 2) liga SSL com certificado fictício local;
// 3) exige SSL do migrador nos bancos p5*; 4) recria p5 e aplica as migrations pelo Flyway (dono);
// 5) carrega fixtures fictícias como "fixtures".  Uso: node scripts/subir.mjs
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { RAIZ, PG, SENHAS, psql, rodar, recriarBanco, flyway } from './ambiente.mjs';

const ok = (r, msg) => { if (r.code !== 0) throw new Error(`${msg}:\n${r.out}`); return r.out; };

// 1) Papéis (iguais aos da P3; só cria se o contêiner tiver sido recriado sem eles).
await psql('postgres', `
do $$ begin
  if not exists (select from pg_roles where rolname = 'migrador') then
    create role migrador login password '${SENHAS.migrador}' nosuperuser nobypassrls nocreaterole;
  end if;
  if not exists (select from pg_roles where rolname = 'app_user') then
    create role app_user login password '${SENHAS.app_user}' nosuperuser nobypassrls nocreatedb nocreaterole noinherit noreplication;
  end if;
  if not exists (select from pg_roles where rolname = 'fixtures') then
    create role fixtures login password '${SENHAS.fixtures}' nosuperuser bypassrls noinherit;
  end if;
end $$;`);

// 2) SSL. Chaves privadas ficam só dentro do contêiner; só o ca.crt (público) sai para ssl/.
const DADOS = '/var/lib/postgresql/data';
if ((await psql('postgres', 'show ssl')) !== 'on') {
  ok(await rodar('docker', ['exec', PG, 'bash', '-ec', `cd ${DADOS}
    openssl req -new -x509 -days 30 -nodes -subj "/CN=poc-rm16-ca-ficticia" -keyout ca.key -out ca.crt 2>/dev/null
    openssl req -new -nodes -subj "/CN=poc-rm16-pg" -keyout server.key -out server.csr 2>/dev/null
    printf "subjectAltName=DNS:poc-rm16-pg,DNS:localhost\\n" > san.ext
    openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 30 -extfile san.ext -out server.crt 2>/dev/null
    chown postgres:postgres server.key server.crt ca.crt ca.key && chmod 600 server.key ca.key`]), 'gerar certificados');
  await psql('postgres', 'alter system set ssl = on;');
}

// 3) pg_hba: o migrador só entra nos bancos p5* com SSL (regex de banco, PostgreSQL 16+). Não afeta p3.
const HBA = `${DADOS}/pg_hba.conf`;
const REGRA = 'hostnossl /^p5 migrador all reject';
ok(await rodar('docker', ['exec', PG, 'bash', '-ec',
  `grep -qF "${REGRA}" ${HBA} || sed -i "1i ${REGRA}" ${HBA}`]), 'ajustar pg_hba');
await psql('postgres', 'select pg_reload_conf();');
mkdirSync(path.join(RAIZ, 'ssl'), { recursive: true });
ok(await rodar('docker', ['cp', `${PG}:${DADOS}/ca.crt`, path.join(RAIZ, 'ssl', 'ca.crt')]), 'copiar ca.crt');
console.log('SSL:', await psql('postgres', 'show ssl'), '| regra pg_hba:', REGRA);

// 4) Banco p5 limpo + migrations pelo Flyway como migrador (dono), com SSL verify-full.
await recriarBanco('p5');
const mig = await flyway('migrate', { banco: 'p5' });
console.log(mig.out.split('\n').filter((l) => /Successfully|Migrating|Creating|Flyway/.test(l)).join('\n'));
ok(mig, 'flyway migrate');
console.log(ok(await flyway('info', { banco: 'p5' }), 'flyway info').split('\n').filter((l) => l.startsWith('|')).join('\n'));

// 5) Fixtures fictícias: grants só neste ambiente local (fora da cadeia de migrations).
await psql('p5', `grant usage on schema app to fixtures;
  grant select, insert on all tables in schema app to fixtures;`, 'migrador');
await psql('p5', readFileSync(path.join(RAIZ, 'fixtures', 'fixtures.sql'), 'utf8'), 'fixtures');
console.log('Pronto: banco p5 migrado e com fixtures (localhost:54329).');
