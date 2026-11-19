import type { Decorator, Preview } from '@storybook/react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { space } from '@condomifacil/design-tokens';
// Código-fonte da biblioteca, não o `dist`: as stories importam `src`, e o ThemeProvider precisa
// ser o mesmo módulo para o contexto chegar aos componentes (como o alias do catálogo web).
import { Button, ThemeProvider, useTheme, type PreferenciaDeTema } from '../../../packages/ui/src';

// Mesmas opções do seletor do catálogo web (DS 12 e 17). A interface nativa leve não tem barra de
// ferramentas, então o seletor fica no topo da story e o estado aparece no próprio rótulo.
const OPCOES: { valor: PreferenciaDeTema; rotulo: string }[] = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'sistema', rotulo: 'Igual ao aparelho' },
];

// Fora do componente para o tema escolhido sobreviver à troca de story.
let indiceAtual = 0;

function Fundo({ children }: { children: ReactNode }) {
  const { tema } = useTheme();
  return (
    <View style={{ flex: 1, gap: space[6], padding: space[6], backgroundColor: tema.bg }}>
      {children}
    </View>
  );
}

function ComTema({ children }: { children: ReactNode }) {
  const [indice, setIndice] = useState(indiceAtual);
  const opcao = OPCOES[indice] ?? OPCOES[0]!;
  const trocar = () => {
    indiceAtual = (indice + 1) % OPCOES.length;
    setIndice(indiceAtual);
  };
  return (
    <ThemeProvider preferencia={opcao.valor}>
      <Fundo>
        <Button
          variante="secundario"
          rotulo={`Trocar tema (atual: ${opcao.rotulo})`}
          onPress={trocar}
        />
        {children}
      </Fundo>
    </ThemeProvider>
  );
}

const comTema: Decorator = (Story) => (
  <ComTema>
    <Story />
  </ComTema>
);

const preview: Preview = {
  decorators: [comTema],
};

export default preview;
