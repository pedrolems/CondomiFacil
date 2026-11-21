// Ambiente do banco local descartável (RM-25): configuração, conexões, Docker e Flyway.
// Credenciais só por variável de ambiente ou db/.env (ignorado pelo Git); nunca em argumento ou log.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

export const DIR_DB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIR_MIGRACOES = path.join(DIR_DB, 'migracoes');
const ARQUIVO_ENV = path.join(DIR_DB, '.env');

// Fonte: imagem oficial flyway/flyway no Docker Hub; "flyway version" = Flyway OSS Edition 13.12.2.
export const FLYWAY_IMAGEM =
  'flyway/flyway:13.12.2@sha256:99c4dd175ca5e622700e6397c4eadf092d83b5080f5b1340e04e73c9a5d343b5';

// Únicos hosts em que o banco pode ser recriado ou receber fixtures: máquina local e o serviço do CI.
export const HOSTS_DESCARTAVEIS = ['localhost', '127.0.0.1', '::1', 'postgres'];

const SENHAS = {
  postgres: 'DB_SENHA_SUPERUSUARIO',
  migrador: 'DB_SENHA_MIGRADOR',
  app_user: 'DB_SENHA_APP',
  app_autenticacao: 'DB_SENHA_APP_AUTENTICACAO',
  fixtures: 'DB_SENHA_FIXTURES',
} as const;
export type Papel = keyof typeof SENHAS;

export interface Ambiente {
  host: string;
  porta: number;
  banco: string;
  compose: boolean;
  flyway: { rede: string; host: string; porta: number };
}

/** Lê db/.env (gerando senhas aleatórias na primeira vez, se nada estiver definido). */
export function carregarAmbiente(): Ambiente {
  if (!existsSync(ARQUIVO_ENV) && !process.env.DB_SENHA_SUPERUSUARIO) {
    const linhas = Object.values(SENHAS).map((v) => `${v}=${randomBytes(18).toString('hex')}`);
    writeFileSync(
      ARQUIVO_ENV,
      `# Gerado por db:instalar; local, fictício e ignorado pelo Git.\n${linhas.join('\n')}\n`,
    );
  }
  if (existsSync(ARQUIVO_ENV)) process.loadEnvFile(ARQUIVO_ENV);
  for (const v of Object.values(SENHAS)) {
    if (!process.env[v]) throw new Error(`Variável ${v} ausente (db/.env ou ambiente).`);
  }
  const e = process.env;
  return {
    host: e.DB_HOST || '127.0.0.1',
    porta: Number(e.DB_PORTA || 54320),
    banco: e.DB_NOME || 'condomifacil',
    compose: e.DB_COMPOSE !== '0',
    flyway: {
      rede: e.FLYWAY_REDE || 'condomifacil-db',
      host: e.FLYWAY_DB_HOST || 'postgres',
      porta: Number(e.FLYWAY_DB_PORTA || 5432),
    },
  };
}

export const senha = (papel: Papel): string => process.env[SENHAS[papel]] as string;

export function exigirHostDescartavel(host: string): void {
  if (!HOSTS_DESCARTAVEIS.includes(host)) {
    throw new Error(
      `Host "${host}" não é banco descartável permitido (${HOSTS_DESCARTAVEIS.join(', ')}).`,
    );
  }
}

/** Conexão postgres.js de um papel. Pool de 1 por padrão: testes e scripts são sequenciais. */
export function conectar(amb: Ambiente, papel: Papel, banco = amb.banco, max = 1) {
  return postgres({
    host: amb.host,
    port: amb.porta,
    database: banco,
    username: papel,
    password: senha(papel),
    max,
    onnotice: () => {},
    connection: { TimeZone: 'UTC', application_name: `condomifacil-${papel}` },
  });
}

/** Executa um comando e devolve { code, out } (stdout + stderr), sem lançar. */
export function rodar(
  cmd: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('error', (err) => resolve({ code: -1, out: String(err) }));
    p.on('close', (code) => resolve({ code, out }));
  });
}

export async function subirCompose(): Promise<void> {
  const r = await rodar('docker', [
    'compose',
    '-f',
    path.join(DIR_DB, 'compose.yaml'),
    'up',
    '-d',
    '--wait',
  ]);
  if (r.code !== 0) throw new Error(`docker compose up falhou:\n${r.out}`);
}

/**
 * Flyway pela imagem oficial, como migrador, em ligação direta. A senha vai por variável de
 * ambiente herdada ("-e FLYWAY_PASSWORD" sem valor), fora da linha de comando.
 */
export function flyway(amb: Ambiente, args: string[], banco = amb.banco, locais = DIR_MIGRACOES) {
  const { rede, host, porta } = amb.flyway;
  return rodar(
    'docker',
    [
      'run',
      '--rm',
      '--network',
      rede,
      '-v',
      `${path.join(DIR_DB, 'flyway.conf')}:/flyway/conf/flyway.conf:ro`,
      '-v',
      `${locais}:/flyway/sql:ro`,
      '-e',
      'FLYWAY_URL',
      '-e',
      'FLYWAY_USER',
      '-e',
      'FLYWAY_PASSWORD',
      // Telemetria desligada (documentation.red-gate.com, "Redgate Disable Telemetry Environment Variable").
      '-e',
      'REDGATE_DISABLE_TELEMETRY=true',
      FLYWAY_IMAGEM,
      ...args,
    ],
    {
      ...process.env,
      FLYWAY_URL: `jdbc:postgresql://${host}:${porta}/${banco}`,
      FLYWAY_USER: 'migrador',
      FLYWAY_PASSWORD: senha('migrador'),
    },
  );
}
