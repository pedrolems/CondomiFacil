// P5a (RM-16): Flyway 13.12.2 OSS contra os critérios de criterios-de-poc.md (P5a) e da estratégia
// de migrations (seção 10.1). Cada cenário usa um banco temporário p5a_* criado e removido aqui.
// As saídas reais do Flyway vão para resultados/p5a/<cenario>.txt.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RAIZ, PG, psql, rodar, recriarBanco, removerBanco, flyway, esperar } from '../scripts/ambiente.mjs';

const SAIDA = path.join(RAIZ, 'resultados', 'p5a');
mkdirSync(SAIDA, { recursive: true });
const registrar = (cenario, titulo, texto) =>
  appendFileSync(path.join(SAIDA, `${cenario}.txt`), `\n===== ${titulo} =====\n${texto.trim()}\n`);
const iniciar = (cenario) => writeFileSync(path.join(SAIDA, `${cenario}.txt`), `# ${cenario} — ${new Date().toISOString()}\n`);
const dir = (nome) => path.join(RAIZ, 'p5a', nome);

const historico = (banco) => psql(banco,
  `select version || '|' || coalesce(checksum::text, '-') || '|' || success
   from migracao.flyway_schema_history where version is not null order by installed_rank`);

/** Espera até a consulta (como superusuário) devolver algo não vazio. */
async function esperarAte(banco, sql, timeoutMs = 60_000) {
  const fim = Date.now() + timeoutMs;
  while (Date.now() < fim) {
    const r = await psql(banco, sql);
    if (r) return r;
    await esperar(100);
  }
  throw new Error(`timeout esperando: ${sql}`);
}

const BANCOS = [];
const novoBanco = async (nome) => { BANCOS.push(nome); await recriarBanco(nome); return nome; };
after(async () => { for (const b of BANCOS) await removerBanco(b); });

test('checksum e validação: arquivo alterado, inserido fora de ordem ou apagado é detectado', async () => {
  iniciar('checksum');
  const banco = await novoBanco('p5a_checksum');
  const copia = mkdtempSync(path.join(os.tmpdir(), 'p5a-checksum-'));
  try {
    cpSync(path.join(RAIZ, 'migracoes'), copia, { recursive: true });
    const m = await flyway('migrate', { banco, locais: copia });
    assert.equal(m.code, 0, m.out);
    const hist = await historico(banco);
    registrar('checksum', 'histórico após migrate (versão|checksum|sucesso)', hist);
    for (const linha of hist.split('\n')) assert.match(linha, /^\d+\|-?\d+\|true$/,'toda versão com checksum e sucesso');
    assert.equal((await flyway('validate', { banco, locais: copia })).code, 0);

    // 1) Alteração de conteúdo de uma migration já aplicada.
    const v2 = path.join(copia, 'V2__reservas_exclude_gatilho.sql');
    const original = readFileSync(v2, 'utf8');
    writeFileSync(v2, original.replace("('confirmada', 'cancelada')", "('confirmada', 'cancelada', 'pendente')"));
    const val = await flyway('validate', { banco, locais: copia });
    registrar('checksum', 'validate com V2 alterado', val.out);
    assert.notEqual(val.code, 0);
    assert.match(val.out, /checksum mismatch.*version 2/is);
    const mig = await flyway('migrate', { banco, locais: copia });
    registrar('checksum', 'migrate com V2 alterado (validateOnMigrate)', mig.out);
    assert.notEqual(mig.code, 0, 'migrate também recusa');
    writeFileSync(v2, original);

    // 2) Migration nova com versão menor que a última aplicada (fora de ordem).
    writeFileSync(path.join(copia, 'V1_5__fora_de_ordem.sql'), 'select 1;');
    const fo = await flyway('validate', { banco, locais: copia });
    registrar('checksum', 'validate com V1_5 fora de ordem', fo.out);
    assert.notEqual(fo.code, 0);
    assert.match(fo.out, /1\.5/);
    rmSync(path.join(copia, 'V1_5__fora_de_ordem.sql'));

    // 3) Migration aplicada que sumiu do pacote. Achado: a ÚLTIMA aplicada ausente vira "future", que o
    //    padrão ignoreMigrationPatterns=*:future aceita; uma do MEIO ausente ("missing") é recusada.
    const v3 = readFileSync(path.join(copia, 'V3__indice_reserva_por_unidade.sql'));
    rmSync(path.join(copia, 'V3__indice_reserva_por_unidade.sql'));
    const futura = await flyway('validate', { banco, locais: copia });
    registrar('checksum', 'validate sem o V3 (última aplicada) — padrão', futura.out);
    assert.equal(futura.code, 0, 'padrão do Flyway aceita a última aplicada ausente (future)');
    const estrita = await flyway('validate', { banco, locais: copia, extra: ['-ignoreMigrationPatterns='] });
    registrar('checksum', 'validate sem o V3 com -ignoreMigrationPatterns= (vazio, estrito)', estrita.out);
    assert.notEqual(estrita.code, 0, 'modo estrito recusa');
    writeFileSync(path.join(copia, 'V3__indice_reserva_por_unidade.sql'), v3);

    const v1 = readFileSync(path.join(copia, 'V1__base_tenant.sql'));
    rmSync(path.join(copia, 'V1__base_tenant.sql'));
    const meio = await flyway('validate', { banco, locais: copia });
    registrar('checksum', 'validate sem o V1 (aplicada, no meio) — padrão', meio.out);
    assert.notEqual(meio.code, 0);
    assert.match(meio.out, /not resolved locally/i);
    writeFileSync(path.join(copia, 'V1__base_tenant.sql'), v1);
  } finally {
    rmSync(copia, { recursive: true, force: true });
  }
});

test('lock de sessão (transactional.lock=false): dois migradores concorrentes aplicam cada versão uma vez', async () => {
  iniciar('lock');
  const banco = await novoBanco('p5a_lock');
  const a = flyway('migrate', { banco, locais: dir('lock'), nome: 'p5a-lock-a' });
  await esperar(1500);
  const b = flyway('migrate', { banco, locais: dir('lock'), nome: 'p5a-lock-b' });

  // Enquanto um dorme dentro da migration não transacional, o outro tem de estar esperando a trava.
  const dormindo = await esperarAte(banco, `select pid from pg_stat_activity
    where datname = '${banco}' and usename = 'migrador' and backend_type = 'client backend' and state = 'active' and query ilike '%pg_sleep%'`);
  await esperar(2000);
  const travas = await psql(banco, `select l.pid || '|' || l.granted || '|' || l.locktype || '|' || l.objid
    from pg_locks l join pg_stat_activity s using (pid) where s.datname = '${banco}' and l.locktype = 'advisory'`);
  const atividades = await psql(banco, `select pid || '|' || state || '|' || left(regexp_replace(query, '\\s+', ' ', 'g'), 90)
    from pg_stat_activity where datname = '${banco}' and usename = 'migrador' order by pid`);
  registrar('lock', 'pid dormindo na migration V2', dormindo);
  registrar('lock', 'pg_locks advisory (pid|concedida|tipo|objid)', travas);
  registrar('lock', 'pg_stat_activity do migrador', atividades);

  const [ra, rb] = await Promise.all([a, b]);
  registrar('lock', 'migrador A', ra.out);
  registrar('lock', 'migrador B', rb.out);
  assert.equal(ra.code, 0, ra.out);
  assert.equal(rb.code, 0, rb.out);
  // Exatamente uma trava advisory concedida durante a V2, e ela pertence a uma sessão (pid) viva.
  const concedidas = travas.split('\n').filter((l) => l.split('|')[1] === 'true');
  assert.equal(concedidas.length, 1, `uma trava concedida: ${travas}`);
  const hist = await historico(banco);
  registrar('lock', 'histórico final', hist);
  assert.deepEqual(hist.split('\n').map((l) => l.split('|')[0]), ['1', '2'], 'cada versão uma única vez');
  assert.ok(hist.split('\n').every((l) => l.endsWith('|true')));
  const aplicou = [ra.out, rb.out].filter((o) => /Successfully applied 2 migrations/.test(o)).length;
  const nada = [ra.out, rb.out].filter((o) => /up to date|No migration necessary/i.test(o)).length;
  assert.deepEqual([aplicou, nada], [1, 1], 'um aplica, o outro encontra o esquema atualizado');
  assert.equal(await psql(banco, "select indisvalid from pg_index where indexrelid = 'public.t_ix'::regclass"), 't');
});

test('lock: migrador que morre segurando a trava a libera; o outro termina sozinho', async () => {
  iniciar('lock-morte');
  const banco = await novoBanco('p5a_lock_morte');
  const a = flyway('migrate', { banco, locais: dir('lock'), nome: 'p5a-morte-a' });
  await esperarAte(banco, `select pid from pg_stat_activity
    where datname = '${banco}' and usename = 'migrador' and backend_type = 'client backend' and state = 'active' and query ilike '%pg_sleep%'`);
  const b = flyway('migrate', { banco, locais: dir('lock'), nome: 'p5a-morte-b' });
  await esperar(2500);
  const kill = await rodar('docker', ['kill', 'p5a-morte-a']); // processo do migrador A cai (sem desligamento limpo)
  registrar('lock-morte', 'docker kill do migrador A', kill.out);
  const [ra, rb] = await Promise.all([a, b]);
  registrar('lock-morte', 'migrador A (morto)', ra.out);
  registrar('lock-morte', 'migrador B', rb.out);
  assert.notEqual(ra.code, 0, 'A foi morto');
  assert.equal(rb.code, 0, rb.out);
  const hist = await historico(banco);
  registrar('lock-morte', 'histórico final', hist);
  assert.deepEqual(hist.split('\n').map((l) => l.split('|')[0]), ['1', '2']);
  assert.ok(hist.split('\n').every((l) => l.endsWith('|true')), 'nenhuma linha com falha');
  assert.equal(await psql(banco, "select indisvalid from pg_index where indexrelid = 'public.t_ix'::regclass"), 't');
  assert.equal(await psql(banco, `select count(*) from pg_locks l join pg_stat_activity s using (pid)
    where s.datname = '${banco}' and l.locktype = 'advisory'`), '0', 'nenhuma trava sobrando');
});

test('controle: com o lock transacional padrão, a migration CONCURRENTLY trava (por isso transactional.lock=false)', async () => {
  iniciar('lock-transacional');
  const banco = await novoBanco('p5a_lock_tx');
  const r = await flyway('migrate', { banco, locais: dir('lock'), nome: 'p5a-lock-tx', lockTransacional: true, timeoutMs: 45_000 });
  const estado = await psql(banco, `select pid || '|' || state || '|' || coalesce(wait_event_type, '') || '|' || coalesce(wait_event, '')
    || '|' || left(regexp_replace(query, '\\s+', ' ', 'g'), 80) from pg_stat_activity where datname = '${banco}' and usename = 'migrador'`);
  await rodar('docker', ['rm', '-f', 'p5a-lock-tx']);
  registrar('lock-transacional', 'saída (cortada pelo timeout de 45 s, se travou)', r.out);
  registrar('lock-transacional', 'pg_stat_activity no momento do timeout', estado);
  assert.match(r.out, /\[timeout 45000 ms\]/, 'esperava travar com o lock transacional');
  assert.match(estado, /create index concurrently/i);
});

test('SSL e modo de conexão: sem SSL é recusado, verify-full passa, nome errado no certificado falha', async () => {
  iniciar('ssl');
  const banco = await novoBanco('p5a_ssl');
  const sem = await flyway('info', { banco, sslmode: 'disable' });
  registrar('ssl', 'sslmode=disable', sem.out);
  assert.notEqual(sem.code, 0);
  assert.match(sem.out, /no encryption/);

  const ip = (await rodar('docker', ['inspect', '-f', '{{(index .NetworkSettings.Networks "poc-rm16-net").IPAddress}}', PG])).out.trim();
  const nomeErrado = await flyway('info', { banco, host: ip });
  registrar('ssl', `verify-full pelo IP ${ip} (fora do SAN do certificado)`, nomeErrado.out);
  assert.notEqual(nomeErrado.code, 0);
  assert.match(nomeErrado.out, /hostname|certificate|SSL/i);

  const ok = await flyway('migrate', { banco, locais: dir('ssl') });
  registrar('ssl', 'verify-full por poc-rm16-pg', ok.out);
  assert.equal(ok.code, 0, ok.out);
  const ev = await psql(banco, "select ssl || '|' || version || '|' || cipher || '|' || usuario from public.evidencia_ssl");
  registrar('ssl', 'pg_stat_ssl da sessão do Flyway (ssl|versão|cifra|usuário)', ev);
  assert.match(ev, /^true\|TLSv1\.[23]\|.+\|migrador$/);
});

test('arquivo não transacional: CONCURRENTLY com .conf roda fora de transação e gera índice válido', async () => {
  iniciar('nao-transacional');
  const banco = await novoBanco('p5a_cic');
  const r = await flyway('migrate', { banco });
  registrar('nao-transacional', 'migrate das migrations de exemplo', r.out);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /version "3 - indice reserva por unidade" \[non-transactional\]/);
  assert.equal(await psql(banco, "select indisvalid from pg_index where indexrelid = 'app.reserva_por_unidade'::regclass"), 't');

  // Sem o .conf: registrar o comportamento (o Flyway detecta CONCURRENTLY sozinho?).
  const b2 = await novoBanco('p5a_cic_sem_conf');
  const s = await flyway('migrate', { banco: b2, locais: dir('cic-sem-conf') });
  registrar('nao-transacional', 'migrate de CONCURRENTLY sem .conf', s.out);
  assert.equal(s.code, 0, s.out);
  assert.match(s.out, /\[non-transactional\]/, 'detecção automática');
});

test('reconexão: banco indisponível no início é esperado com connectRetries', async () => {
  iniciar('reconexao');
  const banco = 'p5a_retry';
  BANCOS.push(banco);
  await removerBanco(banco);
  const inicio = Date.now();
  const r = flyway('migrate', { banco, extra: ['-connectRetries=10'] });
  await esperar(5000);
  await recriarBanco(banco);
  const fim = await r;
  registrar('reconexao', `connectRetries=10; banco criado 5 s depois; total ${Date.now() - inicio} ms`, fim.out);
  assert.equal(fim.code, 0, fim.out);
  assert.match(fim.out, /Successfully applied 3 migrations/);
});

test('reconexão: conexão derrubada no meio de migration transacional não deixa resto; reexecução aplica', async () => {
  const banco = await novoBanco('p5a_queda_tx');
  const r = flyway('migrate', { banco, locais: dir('tx-lenta') });
  const pid = await esperarAte(banco, `select pid from pg_stat_activity
    where datname = '${banco}' and usename = 'migrador' and backend_type = 'client backend' and state = 'active' and query ilike '%pg_sleep%'`);
  await psql('postgres', `select pg_terminate_backend(${pid})`);
  const caiu = await r;
  registrar('reconexao', 'migration transacional com backend terminado', caiu.out);
  assert.notEqual(caiu.code, 0);
  const hist = await historico(banco);
  registrar('reconexao', 'histórico depois da queda (transacional)', hist);
  assert.deepEqual(hist.split('\n'), [hist.split('\n')[0]], 'só a V1 no histórico');
  assert.equal(await psql(banco, "select to_regclass('public.u') is null"), 't', 'tabela da V2 desfeita');
  const de_novo = await flyway('migrate', { banco, locais: dir('tx-lenta') });
  registrar('reconexao', 'reexecução (transacional)', de_novo.out);
  assert.equal(de_novo.code, 0, de_novo.out);
  assert.deepEqual((await historico(banco)).split('\n').map((l) => l.split('|')[0] + '|' + l.split('|')[2]), ['1|true', '2|true']);
});

test('reconexão: queda no meio de CONCURRENTLY deixa índice inválido; repair + forma segura recuperam', async () => {
  const banco = await novoBanco('p5a_queda_cic');
  const r = flyway('migrate', { banco, locais: dir('cic-ingenua') });
  const pid = await esperarAte(banco, `select pid from pg_stat_activity
    where datname = '${banco}' and usename = 'migrador' and backend_type = 'client backend' and state = 'active' and query ilike '%create index concurrently g_ix%'`, 120_000);
  await esperar(500);
  await psql('postgres', `select pg_terminate_backend(${pid})`);
  const caiu = await r;
  registrar('reconexao', 'CONCURRENTLY com backend terminado', caiu.out);
  assert.notEqual(caiu.code, 0);
  const invalido = await psql(banco, "select indisvalid from pg_index where indexrelid = to_regclass('public.g_ix')");
  const hist = await historico(banco);
  registrar('reconexao', 'depois da queda: g_ix válido? / histórico', `${invalido || '(sem índice)'}\n${hist}`);
  assert.equal(invalido, 'f', 'índice inválido sobrou');

  // Sem repair, o migrate seguinte recusa ou repete; registrar e seguir com repair.
  const sem_repair = await flyway('migrate', { banco, locais: dir('cic-ingenua') });
  registrar('reconexao', 'migrate ingênuo de novo (sem repair)', sem_repair.out);
  const rep = await flyway('repair', { banco, locais: dir('cic-ingenua') });
  registrar('reconexao', 'repair', rep.out);
  assert.equal(rep.code, 0, rep.out);
  const ingenua = await flyway('migrate', { banco, locais: dir('cic-ingenua') });
  registrar('reconexao', 'migrate ingênuo depois do repair', ingenua.out);
  assert.notEqual(ingenua.code, 0, 'forma ingênua falha: índice inválido com o mesmo nome');
  assert.match(ingenua.out, /already exists/);

  assert.equal((await flyway('repair', { banco, locais: dir('cic-segura') })).code, 0);
  const segura = await flyway('migrate', { banco, locais: dir('cic-segura') });
  registrar('reconexao', 'migrate com a forma segura (drop concurrently if exists + create)', segura.out);
  assert.equal(segura.code, 0, segura.out);
  assert.equal(await psql(banco, "select indisvalid from pg_index where indexrelid = 'public.g_ix'::regclass"), 't');
  const final = await historico(banco);
  registrar('reconexao', 'histórico final (CONCURRENTLY)', final);
  assert.deepEqual(final.split('\n').map((l) => l.split('|')[0] + '|' + l.split('|')[2]), ['1|true', '2|true']);
});
