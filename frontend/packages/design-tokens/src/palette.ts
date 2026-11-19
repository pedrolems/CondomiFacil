// Paleta base do Design System (DS 4.1). Único lugar do código com valores hexadecimais;
// telas e componentes usam os tokens semânticos de `themes.ts`, nunca a paleta direto.
// Sem `as const`: os valores ficam `string`, para `dark` caber no tipo `Theme` de `light`.
export const palette = {
  white: '#FFFFFF',
  // Só para o fundo escurecido do tema escuro (DS 4.2, `color.scrim`: #000000 a 60%).
  black: '#000000',

  blue950: '#0B1A44',
  blue925: '#081B52',
  blue900: '#0E2766',
  blue850: '#0A2878',
  blue800: '#16307A',
  blue750: '#133080',
  blue700: '#0E359D',
  blue300: '#8FA8F0',
  blue100: '#E7ECFA',

  gray700: '#5A6785',
  gray500: '#74809E',
  gray450: '#7D8BB5',
  gray400: '#8A94AD',
  gray300: '#B8C4E6',
  gray200: '#DCE2F0',
  gray150: '#E3E8F3',
  gray100: '#E9EDF5',
  gray50: '#F3F6FC',

  coral700: '#C8323F',
  coral500: '#FF606A',
  coral400: '#FF7A82',
  coral100: '#FFE9EB',
  coral950: '#3A1530',

  green800: '#1F6B28',
  green700: '#2E7D32',
  green400: '#66BB6A',
  green100: '#E8F5E9',
  green950: '#12391F',

  amber800: '#8F5600',
  amber300: '#FFB74D',
  amber100: '#FFF4E0',
  amber950: '#3A2A0B',

  red700: '#C62828',
  red300: '#FF8A8A',
  red100: '#FDECEC',
  red950: '#3D1420',

  navy600: '#6F84BD',
  navy700: '#1C3A8A',
  navy750: '#1F3A85',
};
