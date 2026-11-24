import { Stack } from 'expo-router';
import { obterClienteDoApp } from '../infraestrutura/api/cliente-do-app';
import { SessaoProvider, TemaDoPerfil } from '../modulos/acesso/SessaoProvider';
import { useOpcoesDaPilha } from '../compartilhado/navegacao/opcoes-da-pilha';

// Cada grupo de rotas tem a própria pilha e barra superior; só `saude` usa a do nível raiz.
function PilhaRaiz() {
  const opcoes = useOpcoesDaPilha();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="saude"
        options={{ ...opcoes, headerShown: true, title: 'Saúde da API' }}
      />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <SessaoProvider cliente={obterClienteDoApp()}>
      {/* Tema do aparelho até o perfil carregar; depois vale o tema salvo na conta (RF-AC-05). */}
      <TemaDoPerfil>
        <PilhaRaiz />
      </TemaDoPerfil>
    </SessaoProvider>
  );
}
