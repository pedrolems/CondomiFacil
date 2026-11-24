import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, space } from '@condomifacil/design-tokens';
import { Button, Text, useTheme } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';

export default function BoasVindas() {
  const { tema } = useTheme();
  const router = useRouter();
  return (
    <Pagina>
      <View style={{ alignItems: 'center', gap: space[3], paddingTop: space[16] }}>
        <View
          aria-hidden
          style={{
            width: 72,
            height: 72,
            borderRadius: radius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.brand,
          }}
        >
          <Text variante="titleLg" style={{ color: tema.text.onBrand }}>
            C
          </Text>
        </View>
        <Text variante="titleLg" accessibilityRole="header">
          CondomiFacil
        </Text>
        <Text tom="secondary" style={{ textAlign: 'center' }}>
          Reservas, visitantes, chamados e a vida do condomínio num lugar só.
        </Text>
      </View>
      <View style={{ gap: space[3], paddingTop: space[8] }}>
        <Button rotulo="Entrar" tamanho="grande" onPress={() => router.push('/login')} />
        <Button
          rotulo="Primeiro acesso"
          variante="secundario"
          onPress={() => router.push('/email?finalidade=primeiro_acesso')}
        />
      </View>
    </Pagina>
  );
}
