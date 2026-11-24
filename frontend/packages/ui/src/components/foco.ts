import { useState } from 'react';

/** Estado de foco para o anel de foco do DS 10 (2 dp em `focus`, afastado 2 dp). */
export function useFoco() {
  const [focado, setFocado] = useState(false);
  return { focado, aoFocar: () => setFocado(true), aoDesfocar: () => setFocado(false) };
}

export const anelDeFoco = (cor: string) =>
  ({ outlineColor: cor, outlineStyle: 'solid', outlineWidth: 2, outlineOffset: 2 }) as const;
