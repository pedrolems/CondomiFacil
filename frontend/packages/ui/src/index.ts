// Exportações públicas da biblioteca (biblioteca-de-componentes.md §2.2). Só os componentes da
// tela de saúde (RM-14, D4); Dialog e DataTable seguem reservados.
export {
  ThemeProvider,
  useTheme,
  type PreferenciaDeTema,
  type EsquemaDeCor,
} from './theme/ThemeProvider';
export { Button, type ButtonProps } from './components/Button';
export { Text, type TextoProps } from './components/Text';
export { StatusView, type StatusViewProps, type TomDeEstado } from './components/StatusView';
