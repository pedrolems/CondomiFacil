// Espaçamento em grade de 4 dp (DS 6.1).
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Áreas de toque (DS 6.2): mínimo para todo elemento tocável e altura das ações da portaria.
export const touchTarget = { min: 48, portaria: 56 } as const;
