import { useCallback, useEffect, useRef, useState } from 'react';

/** Segundos que faltam até `instante` (ms), atualizando a cada segundo; 0 quando já passou. */
export function useSegundosAte(instante: number): number {
  const calcular = () => Math.max(0, Math.ceil((instante - Date.now()) / 1000));
  const [segundos, setSegundos] = useState(calcular);
  useEffect(() => {
    setSegundos(calcular());
    if (instante <= Date.now()) return;
    const id = setInterval(() => {
      const s = calcular();
      setSegundos(s);
      if (s === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [instante]);
  return segundos;
}

/** Pausa de acesso (SEG-04): `pausar(segundos)` trava a ação até o `Retry-After` passar. */
export function usePausa() {
  const [ate, setAte] = useState(0);
  const restante = useSegundosAte(ate);
  const pausar = useCallback((segundos: number) => setAte(Date.now() + segundos * 1000), []);
  return { pausado: restante > 0, pausar };
}

/** Evita `setState` depois de a tela sair (a navegação pode desmontar durante a chamada). */
export function useMontado() {
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  return montado;
}
