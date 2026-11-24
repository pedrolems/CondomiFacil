import { Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { touchTarget } from '@condomifacil/design-tokens';
import { useTheme } from '@condomifacil/ui';
import { GuardaDeSessao } from '../../compartilhado/navegacao/GuardaDeSessao';
import { useOpcoesDaPilha } from '../../compartilhado/navegacao/opcoes-da-pilha';

// Área autenticada com os aceites em dia. O contexto (condomínio e unidade) e a tela inicial
// por perfil entram no RM-21; por ora `inicio` é provisória.
export default function LayoutAutenticado() {
  const opcoes = useOpcoesDaPilha();
  const { tema } = useTheme();
  const router = useRouter();
  return (
    <GuardaDeSessao exige="liberada">
      <Stack screenOptions={opcoes}>
        <Stack.Screen
          name="inicio"
          options={{
            title: 'Início',
            headerRight: () => (
              <Pressable
                accessibilityRole="button"
                aria-label="Minha conta"
                onPress={() => router.push('/conta')}
                style={{
                  width: touchTarget.min,
                  height: touchTarget.min,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserRound size={24} color={tema.text.onBrand} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="conta/index" options={{ title: 'Minha conta' }} />
        <Stack.Screen name="conta/aparencia" options={{ title: 'Aparência' }} />
        <Stack.Screen name="conta/sessoes" options={{ title: 'Sessões' }} />
        <Stack.Screen name="conta/trocar-senha" options={{ title: 'Trocar senha' }} />
      </Stack>
    </GuardaDeSessao>
  );
}
