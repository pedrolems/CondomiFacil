import { Stack } from 'expo-router';
import { GuardaDeSessao } from '../../compartilhado/navegacao/GuardaDeSessao';
import { useOpcoesDaPilha } from '../../compartilhado/navegacao/opcoes-da-pilha';

// Fluxos 3.1 e 3.3: com aceite pendente não se entra no app (RN-CD-03).
export default function LayoutDoAceite() {
  const opcoes = useOpcoesDaPilha();
  return (
    <GuardaDeSessao exige="aceite-pendente">
      <Stack screenOptions={opcoes}>
        <Stack.Screen name="documentos" options={{ title: 'Documentos do condomínio' }} />
      </Stack>
    </GuardaDeSessao>
  );
}
