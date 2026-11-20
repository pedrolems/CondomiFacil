// Utilitários de ambiente da PoC P5: docker, psql como superusuário (só preparação) e Flyway.
// O superusuário só cria/remove bancos e configura SSL; migrations rodam como "migrador".
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PG = 'poc-rm16-pg';
export const REDE = 'poc-rm16-net';
// Fonte da versão: imagem oficial flyway/flyway no Docker Hub; "flyway version" = "Flyway OSS Edition 13.12.2".
export const FLYWAY_IMAGEM = 'flyway/flyway:13.12.2';
export const SENHAS = {
  migrador: 'migrador_local_ficticia',
  app_user: 'app_local_ficticia',
  fixtures: 'fixtures_local_ficticia',
};

/** Executa um comando e devolve { code, out } (stdout+stderr juntos), sem lançar. */
export function rodar(cmd, args, { entrada, timeoutMs } = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    let timer;
    if (timeoutMs) timer = setTimeout(() => { out += `\n[timeout ${timeoutMs} ms]`; p.kill(); }, timeoutMs);
    p.on('close', (code) => { clearTimeout(timer); resolve({ code, out }); });
    p.stdin.end(entrada ?? '');
  });
}

/** psql como superusuário pelo socket local do contêiner. Lança se falhar. */
export async function psql(banco, sql, usuario = 'postgres') {
  const r = await rodar('docker', ['exec', '-i', PG, 'psql', '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1',
    '-U', usuario, '-d', banco], { entrada: sql });
  if (r.code !== 0) throw new Error(`psql (${usuario}@${banco}) falhou:\n${r.out}`);
  return r.out.trim();
}

export async function recriarBanco(banco) {
  await psql('postgres', `drop database if exists ${banco} with (force);`);
  await psql('postgres', `create database ${banco} owner migrador;
    revoke all on database ${banco} from public;
    grant connect on database ${banco} to app_user, fixtures;`);
}

export const removerBanco = (banco) => psql('postgres', `drop database if exists ${banco} with (force);`);

/**
 * Roda o Flyway 13.12.2 (imagem oficial, Java 25 dentro) na rede da PoC, como "migrador", com SSL
 * verify-full. `locais` é um diretório do host com as migrations. Devolve { code, out }.
 */
export function flyway(comando, { banco, locais = path.join(RAIZ, 'migracoes'), extra = [], nome,
  host = PG, sslmode = 'verify-full', porta = 5432, timeoutMs = 180_000, lockTransacional = false } = {}) {
  const url = `jdbc:postgresql://${host}:${porta}/${banco}?sslmode=${sslmode}&sslrootcert=/flyway/ssl/ca.crt`;
  const args = ['run', '--rm', '--network', REDE,
    ...(nome ? ['--name', nome] : []),
    '-v', `${path.join(RAIZ, 'ssl')}:/flyway/ssl:ro`,
    '-v', `${locais}:/flyway/sql:ro`,
    '-e', `FLYWAY_PASSWORD=${SENHAS.migrador}`,
    FLYWAY_IMAGEM,
    `-url=${url}`, '-user=migrador',
    '-schemas=migracao', // histórico em esquema próprio, sem acesso do app_user
    '-locations=filesystem:/flyway/sql',
    `-postgresql.transactional.lock=${lockTransacional}`,
    ...extra, comando];
  return rodar('docker', args, { timeoutMs });
}

export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
