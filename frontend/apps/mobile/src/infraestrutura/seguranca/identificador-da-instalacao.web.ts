import { novoIdentificador } from './novo-identificador';

const CHAVE = 'condomifacil.instalacao';

// O `localStorage` guarda só este identificador anônimo; token algum passa por ele.
export async function identificadorDaInstalacao(): Promise<string> {
  const existente = globalThis.localStorage?.getItem(CHAVE);
  if (existente) return existente;
  const novo = novoIdentificador();
  globalThis.localStorage?.setItem(CHAVE, novo);
  return novo;
}
