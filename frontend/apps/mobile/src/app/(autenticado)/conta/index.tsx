import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, LogOut, Palette, Smartphone } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { Button, ListRow, Text } from '@condomifacil/ui';
import { Pagina } from '../../../compartilhado/componentes/Pagina';
import { useSessao } from '../../../modulos/acesso/SessaoProvider';

// Menu > Minha conta (3.4). Sair apaga acesso, refresh e cache neste aparelho.
export default function MinhaConta() {
  const router = useRouter();
  const { perfil, cliente } = useSessao();
  const [saindo, setSaindo] = useState(false);

  return (
    <Pagina>
      {perfil && (
        <View>
          <Text variante="titleSm" accessibilityRole="header">
            {perfil.nome}
          </Text>
          <Text tom="secondary">{perfil.email}</Text>
        </View>
      )}
      <View style={{ gap: space[1] }}>
        <ListRow
          icone={Palette}
          titulo="Aparência"
          onPress={() => router.push('/conta/aparencia')}
        />
        <ListRow
          icone={Smartphone}
          titulo="Sessões"
          descricao="Aparelhos com a sua conta aberta"
          onPress={() => router.push('/conta/sessoes')}
        />
        <ListRow
          icone={KeyRound}
          titulo="Trocar senha"
          onPress={() => router.push('/conta/trocar-senha')}
        />
      </View>
      <Button
        rotulo="Sair"
        icone={LogOut}
        variante="secundario"
        carregando={saindo}
        onPress={() => {
          setSaindo(true);
          void cliente.sair();
        }}
      />
    </Pagina>
  );
}
