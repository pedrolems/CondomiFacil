import * as SecureStore from 'expo-secure-store';
import { novoIdentificador } from './novo-identificador';

const CHAVE = 'condomifacil.instalacao';

/** Identificador anônimo desta instalação (não é segredo); liga a sessão ao aparelho (ADR-007). */
export async function identificadorDaInstalacao(): Promise<string> {
  const existente = await SecureStore.getItemAsync(CHAVE);
  if (existente) return existente;
  const novo = novoIdentificador();
  await SecureStore.setItemAsync(CHAVE, novo);
  return novo;
}
