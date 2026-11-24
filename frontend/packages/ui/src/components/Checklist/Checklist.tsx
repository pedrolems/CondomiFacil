import { View } from 'react-native';
import { CircleCheck, CircleMinus, CircleX } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text/Text';

export type ItemDeChecklist = { texto: string; atendido: boolean };
export type ChecklistProps = {
  itens: ItemDeChecklist[];
  /** Depois da primeira tentativa, o item pendente vira falha (ícone e texto, não só cor). */
  tentou?: boolean;
};

/** Lista de requisitos (ex.: da senha): cada item tem ícone, texto e o estado dito ao leitor de tela. */
export function Checklist({ itens, tentou = false }: ChecklistProps) {
  const { tema } = useTheme();
  return (
    <View role="list" style={{ gap: space[2] }}>
      {itens.map(({ texto, atendido }) => {
        const Icone = atendido ? CircleCheck : tentou ? CircleX : CircleMinus;
        const cor = atendido ? tema.success.fg : tentou ? tema.danger.fg : tema.text.secondary;
        const estado = atendido ? 'atendido' : tentou ? 'não atendido' : 'pendente';
        return (
          <View
            key={texto}
            role="listitem"
            aria-label={`${texto}: ${estado}`}
            style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}
          >
            <View aria-hidden>
              <Icone size={16} color={cor} testID={`requisito-${estado}`} />
            </View>
            <Text variante="bodySm" tom="secondary" aria-hidden>
              {texto}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
