import { palette } from './palette.js';

// Valores com transparência (DS 4.2, `color.scrim`) viram rgba derivado do tom da paleta,
// para não haver cor fora de `palette`.
function comAlfa(hex: string, alfa: number): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

// Tokens semânticos do tema claro (DS 4.2) e tons de status (DS 4.4: fg, container, onContainer).
export const light = {
  bg: palette.white,
  surface: palette.gray50,
  surfaceRaised: palette.white,
  brand: palette.blue700,
  scrim: comAlfa(palette.blue925, 0.5),
  text: {
    primary: palette.blue950,
    secondary: palette.gray700,
    disabled: palette.gray400,
    onBrand: palette.white,
  },
  link: palette.blue700,
  accentFg: palette.coral700,
  action: {
    primary: palette.blue700,
    primaryPressed: palette.blue850,
    onPrimary: palette.white,
    secondary: palette.blue700,
    danger: palette.red700,
    onDanger: palette.white,
    disabled: palette.gray150,
  },
  fab: palette.coral500,
  onFab: palette.blue925,
  border: { control: palette.gray500, divider: palette.gray200 },
  focus: palette.blue700,
  chart1: palette.blue700,
  chart2: palette.coral500,
  neutral: { fg: palette.gray700, container: palette.gray100, onContainer: palette.gray700 },
  info: { fg: palette.blue700, container: palette.blue100, onContainer: palette.blue700 },
  success: { fg: palette.green700, container: palette.green100, onContainer: palette.green800 },
  warning: { fg: palette.amber800, container: palette.amber100, onContainer: palette.amber800 },
  danger: { fg: palette.red700, container: palette.red100, onContainer: palette.red700 },
  accent: { fg: palette.coral700, container: palette.coral100, onContainer: palette.blue950 },
};

export type Theme = typeof light;

// Coluna "Escuro" das mesmas tabelas (DS 4.2 e 4.4).
export const dark: Theme = {
  bg: palette.blue925,
  surface: palette.blue900,
  surfaceRaised: palette.blue750,
  brand: palette.blue700,
  scrim: comAlfa(palette.black, 0.6),
  text: {
    primary: palette.white,
    secondary: palette.gray300,
    disabled: palette.gray450,
    onBrand: palette.white,
  },
  link: palette.blue300,
  accentFg: palette.coral500,
  action: {
    primary: palette.coral500,
    primaryPressed: palette.coral400,
    onPrimary: palette.blue925,
    secondary: palette.blue300,
    danger: palette.red300,
    onDanger: palette.blue925,
    disabled: palette.navy700,
  },
  fab: palette.coral500,
  onFab: palette.blue925,
  border: { control: palette.navy600, divider: palette.navy750 },
  focus: palette.blue300,
  chart1: palette.blue300,
  chart2: palette.coral500,
  neutral: { fg: palette.gray300, container: palette.navy700, onContainer: palette.gray300 },
  info: { fg: palette.blue300, container: palette.blue800, onContainer: palette.white },
  success: { fg: palette.green400, container: palette.green950, onContainer: palette.green400 },
  warning: { fg: palette.amber300, container: palette.amber950, onContainer: palette.amber300 },
  danger: { fg: palette.red300, container: palette.red950, onContainer: palette.red300 },
  accent: { fg: palette.coral500, container: palette.coral950, onContainer: palette.coral500 },
};
