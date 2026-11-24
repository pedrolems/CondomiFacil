import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, WifiOff } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { Banner, Button, PasswordField, Text, TextField } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { ErroApi, ErroDeRede } from '../../infraestrutura/api/erros';
import { useMontado, usePausa } from '../../modulos/acesso/hooks';
import { segundosDePausa, textoDoErro } from '../../modulos/acesso/mensagens';
import { useSessao } from '../../modulos/acesso/SessaoProvider';
import { EMAIL_VALIDO } from '../../modulos/acesso/validacao';

type Aviso = { tom: 'danger' | 'warning'; texto: string; rede: boolean };

// Fluxo 3.2. A mensagem de credencial nunca diz qual dos dois está errado, nem se o e-mail existe.
export default function Login() {
  const router = useRouter();
  const { operacoes } = useSessao();
  const montado = useMontado();
  const { pausado, pausar } = usePausa();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroDoEmail, setErroDoEmail] = useState<string>();
  const [erroDaSenha, setErroDaSenha] = useState<string>();
  const [aviso, setAviso] = useState<Aviso>();
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setAviso(undefined);
    const emailInvalido = !EMAIL_VALIDO.test(email.trim());
    setErroDoEmail(emailInvalido ? 'Informe um e-mail válido, como nome@email.com.' : undefined);
    setErroDaSenha(senha ? undefined : 'Informe sua senha.');
    if (emailInvalido || !senha) return;

    setCarregando(true);
    try {
      await operacoes.entrar(email.trim(), senha);
      // A guarda do grupo leva à tela certa quando a sessão abre.
    } catch (e) {
      if (!montado.current) return;
      const espera = segundosDePausa(e);
      if (espera) pausar(espera);
      if (e instanceof ErroApi && e.codigo === 'CREDENCIAIS_INVALIDAS') {
        setErroDaSenha(textoDoErro(e));
      } else {
        const rede = e instanceof ErroDeRede;
        setAviso({ tom: rede || espera ? 'warning' : 'danger', texto: textoDoErro(e), rede });
      }
    } finally {
      if (montado.current) setCarregando(false);
    }
  }

  const esqueci = () => router.push('/email?finalidade=recuperacao_senha');

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Entrar
      </Text>
      {aviso && (
        <Banner
          anunciar
          tom={aviso.tom}
          texto={aviso.texto}
          icone={aviso.rede ? WifiOff : pausado ? Clock : undefined}
          acao={pausado ? { rotulo: 'Esqueci minha senha', onPress: esqueci } : undefined}
        />
      )}
      <View style={{ gap: space[4] }}>
        <TextField
          rotulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          erro={erroDoEmail}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PasswordField
          rotulo="Senha"
          valor={senha}
          onChangeText={setSenha}
          erro={erroDaSenha}
          autoComplete="current-password"
          onSubmitEditing={entrar}
        />
      </View>
      {pausado ? (
        <Button
          rotulo="Entrar"
          tamanho="grande"
          onPress={entrar}
          desabilitado
          motivoDesabilitado="Aguarde 15 minutos ou redefina a senha."
        />
      ) : (
        <Button rotulo="Entrar" tamanho="grande" onPress={entrar} carregando={carregando} />
      )}
      <Button rotulo="Esqueci minha senha" variante="texto" onPress={esqueci} />
    </Pagina>
  );
}
