import type { Trava } from '../api/cliente-sessao';

type GerenciadorDeTravas = { request<T>(nome: string, tarefa: () => Promise<T>): Promise<T> };

/** Fila simples: cada tarefa começa depois que a anterior termina, falhando ou não. */
export function criarTravaEmProcesso(): Trava {
  let fila: Promise<unknown> = Promise.resolve();
  return (tarefa) => {
    const execucao = fila.then(tarefa, tarefa);
    fila = execucao.catch(() => undefined);
    return execucao;
  };
}

/**
 * Trava da renovação entre abas (web, Web Locks API) ou só no processo.
 * shortcut: no app (Expo) não há trava entre processos; hoje há um processo JS só, e a
 * tolerância de 30 s do servidor (ADR-007, B+E) cobre uma corrida. Trocar por uma trava de
 * arquivo ou módulo nativo quando houver tarefa em segundo plano que renove a sessão.
 */
export function criarTrava(nome = 'condomifacil-renovacao'): Trava {
  const locks = (globalThis.navigator as { locks?: GerenciadorDeTravas } | undefined)?.locks;
  return locks ? (tarefa) => locks.request(nome, tarefa) : criarTravaEmProcesso();
}
