import * as SecureStore from 'expo-secure-store';
import type { ArmazenamentoDeRefresh } from '../api/cliente-sessao';

const CHAVE = 'condomifacil.refresh';
const OPCOES = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

// Só no app (iOS e Android): o refresh mora no Keychain/Keystore e o JS lê só para renovar (ADR-007).
export const armazenamentoDeRefresh: ArmazenamentoDeRefresh = {
  ler: () => SecureStore.getItemAsync(CHAVE, OPCOES),
  gravar: (token) => SecureStore.setItemAsync(CHAVE, token, OPCOES),
  limpar: () => SecureStore.deleteItemAsync(CHAVE, OPCOES),
};
