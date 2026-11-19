// Movimento (DS 9): durações em ms e curvas cubic-bezier (x1, y1, x2, y2) de entrada e saída.
export const motion = { fast: 100, base: 200, slow: 300 } as const;

export const easing = {
  entrada: [0.2, 0, 0, 1],
  saida: [0.3, 0, 1, 1],
} as const;
