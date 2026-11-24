import { Stack } from 'expo-router';
import { GuardaDeSessao } from '../../compartilhado/navegacao/GuardaDeSessao';
import { useOpcoesDaPilha } from '../../compartilhado/navegacao/opcoes-da-pilha';
import { FluxoDeAcessoProvider } from '../../modulos/acesso/fluxo-de-acesso';

// Fluxos 3.1 e 3.2: só para quem não tem sessão; com sessão aberta a guarda leva ao destino.
export default function LayoutDoAcesso() {
  const opcoes = useOpcoesDaPilha();
  return (
    <GuardaDeSessao exige="anonima">
      <FluxoDeAcessoProvider>
        <Stack screenOptions={opcoes}>
          <Stack.Screen name="boas-vindas" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Entrar' }} />
          <Stack.Screen name="email" options={{ title: 'Informar e-mail' }} />
          <Stack.Screen name="codigo" options={{ title: 'Código de verificação' }} />
          <Stack.Screen name="senha" options={{ title: 'Criar senha' }} />
        </Stack>
      </FluxoDeAcessoProvider>
    </GuardaDeSessao>
  );
}
