import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useSegundosAte } from './hooks';
import type { FinalidadeDoCodigo } from './operacoes';

// Estado do fluxo e-mail > código > senha só em memória: nem o código nem a senha vão para a URL.
export type Fluxo = {
  email: string;
  finalidade: FinalidadeDoCodigo;
  codigo: string;
  /** Instante (ms) em que um novo código pode ser pedido. */
  liberaReenvioEm: number;
  erroDoCodigo?: string;
  /** Código invalidado (5 erros ou vencido): é preciso pedir outro. */
  codigoInvalidado: boolean;
  /** Instante (ms) até o qual o servidor pausou pedir e usar código (`CODIGO_PAUSADO`, 24 h). */
  pausaDeCodigoAte: number;
};

const INICIAL: Fluxo = {
  email: '',
  finalidade: 'primeiro_acesso',
  codigo: '',
  liberaReenvioEm: 0,
  codigoInvalidado: false,
  pausaDeCodigoAte: 0,
};

type Valor = Fluxo & { atualizar: (parcial: Partial<Fluxo>) => void };
const Contexto = createContext<Valor | null>(null);

export function FluxoDeAcessoProvider({
  children,
  inicial,
}: {
  children: ReactNode;
  /** Só para testes e stories: começa o fluxo já em andamento. */
  inicial?: Partial<Fluxo>;
}) {
  const [fluxo, setFluxo] = useState<Fluxo>({ ...INICIAL, ...inicial });
  const valor = useMemo(
    () => ({ ...fluxo, atualizar: (p: Partial<Fluxo>) => setFluxo((f) => ({ ...f, ...p })) }),
    [fluxo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFluxoDeAcesso(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useFluxoDeAcesso precisa estar dentro de FluxoDeAcessoProvider.');
  return valor;
}

/** Pausa de 24 h dos códigos (RN-CD-02, SEG-04): vale para e-mail, código e senha, que a leem do fluxo. */
export function usePausaDeCodigo() {
  const { pausaDeCodigoAte, atualizar } = useFluxoDeAcesso();
  const pausado = useSegundosAte(pausaDeCodigoAte) > 0;
  const pausar = (segundos: number) =>
    atualizar({ pausaDeCodigoAte: Date.now() + segundos * 1000 });
  return { pausado, pausar };
}
