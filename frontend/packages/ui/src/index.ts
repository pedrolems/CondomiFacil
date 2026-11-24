// Exportações públicas da biblioteca (biblioteca-de-componentes.md §2.2). Só os componentes da
// tela de saúde (RM-14, D4) e do acesso (RM-20); Dialog e DataTable seguem reservados.
export {
  ThemeProvider,
  useTheme,
  type PreferenciaDeTema,
  type EsquemaDeCor,
} from './theme/ThemeProvider';
export { Button, type ButtonProps } from './components/Button';
export { Text, type TextoProps } from './components/Text';
export { StatusView, type StatusViewProps, type TomDeEstado } from './components/StatusView';
export { TextField, type TextFieldProps } from './components/TextField';
export { PasswordField, type PasswordFieldProps } from './components/PasswordField';
export { CodeField, DIGITOS_DO_CODIGO, type CodeFieldProps } from './components/CodeField';
export { Banner, type BannerProps } from './components/Banner';
export { Checklist, type ChecklistProps, type ItemDeChecklist } from './components/Checklist';
export { Choice, type ChoiceProps } from './components/Choice';
export { ListRow, type ListRowProps } from './components/ListRow';
