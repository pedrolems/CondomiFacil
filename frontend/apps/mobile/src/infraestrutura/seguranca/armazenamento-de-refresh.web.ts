import type { ArmazenamentoDeRefresh } from '../api/cliente-sessao';

const MARCA_DE_SAIDA = 'condomifacil.saida-pendente';

// `localStorage` pode estar bloqueado (navegação privada, política do navegador): sem ele não há marca.
const marca = {
  ler: () => {
    try {
      return localStorage.getItem(MARCA_DE_SAIDA) === '1';
    } catch {
      return false;
    }
  },
  gravar: () => {
    try {
      localStorage.setItem(MARCA_DE_SAIDA, '1');
    } catch {
      // sem armazenamento local: a limitação é aceita (a sessão segue até o cookie vencer)
    }
  },
  apagar: () => {
    try {
      localStorage.removeItem(MARCA_DE_SAIDA);
    } catch {
      // nada a apagar
    }
  },
};

// Na web o refresh vive só no cookie httpOnly `rt`: o JS nunca o lê nem o grava (ADR-007).
// A única coisa guardada é a marca "saída pendente", sem dado pessoal.
export const armazenamentoDeRefresh: ArmazenamentoDeRefresh = {
  ler: () => Promise.resolve(null),
  gravar: () => Promise.reject(new Error('Na web o refresh não passa pelo JavaScript.')),
  limpar: () => Promise.resolve(),
  saidaPendente: () => Promise.resolve(marca.ler()),
  marcarSaidaPendente: () => Promise.resolve(marca.gravar()),
  limparSaidaPendente: () => Promise.resolve(marca.apagar()),
};
