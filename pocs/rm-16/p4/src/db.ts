import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { File, FileMode, Paths } from 'expo-file-system';

// Um arquivo de fila e um de cache por (usuario_id, condominio_id), cada um com chave propria
// guardada no SecureStore (ADR-003, linha 48). Apagar o cache apaga arquivo e chave; a fila fica.
export type Papel = 'fila' | 'cache';

const nomeArquivo = (papel: Papel, usuario: string, condominio: string) => `${papel}_${usuario}_${condominio}.db`;
const nomeChave = (arquivo: string) => `chave_${arquivo.replace(/[^A-Za-z0-9._-]/g, '_')}`;

async function chaveDe(arquivo: string): Promise<string> {
  const k = nomeChave(arquivo);
  let hex = await SecureStore.getItemAsync(k);
  if (!hex) {
    hex = Array.from(Crypto.getRandomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(k, hex);
  }
  return hex;
}

function caminho(arquivo: string): File {
  return new File(Paths.document, 'SQLite', arquivo);
}

export async function cabecalhoDoArquivo(arquivo: string): Promise<string> {
  const h = caminho(arquivo).open(FileMode.ReadOnly);
  try {
    const bytes = await h.readBytes(16);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  } finally {
    h.close();
  }
}

const CABECALHO_SQLITE_PLANO = '53514c69746520666f726d6174203300'; // "SQLite format 3\0"

// Falha ALTO se a cifra nao estiver ativa (reprovacao: "criptografia que falha sem aviso").
export async function abrir(papel: Papel, usuario: string, condominio: string, chaveExplicita?: string) {
  const arquivo = nomeArquivo(papel, usuario, condominio);
  const db = await SQLite.openDatabaseAsync(arquivo);
  const chave = chaveExplicita ?? (await chaveDe(arquivo));
  await db.execAsync(`PRAGMA key = "x'${chave}'";`);
  const v = await db.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version;');
  if (!v?.cipher_version) {
    await db.closeAsync();
    throw new Error('SQLCipher ausente neste build: banco NAO esta criptografado');
  }
  // Toca o arquivo (valida a chave) e confere que o cabecalho em disco nao e o de SQLite plano.
  await db.execAsync('CREATE TABLE IF NOT EXISTS _meta (k TEXT PRIMARY KEY, v TEXT);');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  if ((await cabecalhoDoArquivo(arquivo)) === CABECALHO_SQLITE_PLANO) {
    await db.closeAsync();
    throw new Error('Arquivo do banco esta em texto plano apesar do PRAGMA key');
  }
  return { db, arquivo, cipher: v.cipher_version };
}

export async function apagarCache(usuario: string, condominio: string) {
  const arquivo = nomeArquivo('cache', usuario, condominio);
  await SQLite.deleteDatabaseAsync(arquivo);
  await SecureStore.deleteItemAsync(nomeChave(arquivo));
}

export const existeArquivo = (papel: Papel, usuario: string, condominio: string) =>
  caminho(nomeArquivo(papel, usuario, condominio)).exists;

export const chaveAtual = (papel: Papel, usuario: string, condominio: string) =>
  chaveDe(nomeArquivo(papel, usuario, condominio));
