import { useRouter } from 'expo-router';
import { Button, Text } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { useSessao } from '../../modulos/acesso/SessaoProvider';

// Provisória: o RM-21 troca esta tela pela tela inicial do perfil.
export default function Inicio() {
  const router = useRouter();
  const { perfil } = useSessao();
  const primeiroNome = perfil?.nome.split(' ')[0];
  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        {primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'}
      </Text>
      <Text tom="secondary">
        Você entrou no CondomiFacil. A tela inicial do seu perfil chega numa próxima etapa.
      </Text>
      <Button
        rotulo="Abrir minha conta"
        variante="secundario"
        onPress={() => router.push('/conta')}
      />
    </Pagina>
  );
}
