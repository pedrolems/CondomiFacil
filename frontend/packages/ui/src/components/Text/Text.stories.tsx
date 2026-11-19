// Escala tipográfica (DS 5.2). Sem DOM nem API web: as mesmas stories servem ao Storybook nativo.
import { View } from 'react-native';
import { space, typography, type TypographyToken } from '@condomifacil/design-tokens';
import { Text } from './Text';

export default {
  title: 'Fundamentos/Texto',
  component: Text,
};

const variantes = Object.keys(typography) as TypographyToken[];

export const Escala = {
  render: () => (
    <View style={{ gap: space[4] }}>
      {variantes.map((variante) => (
        <Text key={variante} variante={variante}>
          {variante}: Encomenda na portaria
        </Text>
      ))}
    </View>
  ),
};

export const TomDeApoio = {
  name: 'Tom de apoio',
  args: { tom: 'secondary', children: 'Última atualização às 14h32.' },
};
