import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { space } from '@condomifacil/design-tokens';
import { useTheme } from '@condomifacil/ui';

const LARGURA_DE_LEITURA = 480;

/** Página de formulário: rola com o teclado aberto e limita a largura na web (DS 11). */
export function Pagina({ children }: { children: ReactNode }) {
  const { tema } = useTheme();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: tema.bg }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: space[4] }}
      >
        <View style={{ width: '100%', maxWidth: LARGURA_DE_LEITURA, gap: space[5] }}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
