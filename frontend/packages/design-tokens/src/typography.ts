// Escala tipográfica (DS 5.2). Sem `fontFamily`: até a Inter ser carregada, vale a fonte do
// sistema (DS 5.1). Pesos: Regular 400, Medium 500, SemiBold 600, Bold 700.
export const typography = {
  display: { fontSize: 48, lineHeight: 56, fontWeight: '700' },
  titleLg: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  titleMd: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  titleSm: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  bodyLg: { fontSize: 18, lineHeight: 26, fontWeight: '400' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  labelSm: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

export type TypographyToken = keyof typeof typography;
