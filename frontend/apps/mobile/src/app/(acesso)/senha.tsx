import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { Banner, Button, Checklist, PasswordField, Text } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { ErroApi, ErroDeRede } from '../../infraestrutura/api/erros';
import { useFluxoDeAcesso, usePausaDeCodigo } from '../../modulos/acesso/fluxo-de-acesso';
import { useMontado } from '../../modulos/acesso/hooks';
import { TEXTOS, segundosDePausaDeCodigo, textoDoErro } from '../../modulos/acesso/mensagens';
import { useSessao } from '../../modulos/acesso/SessaoProvider';
import { requisitosDaSenha } from '../../modulos/acesso/validacao';

const ERROS_DO_CODIGO = ['CODIGO_INCORRETO', 'CODIGO_INVALIDO_OU_VENCIDO'];

// Criar senha (3.1) e nova senha da recuperação (3.2): uma chamada só, com código e senha.
export default function CriarSenha() {
  const router = useRouter();
  const fluxo = useFluxoDeAcesso();
  const { operacoes } = useSessao();
  const montado = useMontado();
  const { pausado, pausar } = usePausaDeCodigo();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; rede: boolean }>();
  const [carregando, setCarregando] = useState(false);
  const recuperando = fluxo.finalidade === 'recuperacao_senha';

  if (!fluxo.email || fluxo.codigo.length === 0) return <Redirect href="/boas-vindas" />;

  const requisitos = requisitosDaSenha(senha, confirmacao);

  async function salvar() {
    setAviso(undefined);
    setTentou(true);
    if (!requisitos.every((r) => r.atendido)) return;

    setCarregando(true);
    try {
      const abrir = recuperando ? operacoes.redefinirSenha : operacoes.ativar;
      await abrir(fluxo.email, fluxo.codigo, senha);
      // A guarda do grupo leva ao aceite de documentos ou à tela inicial.
    } catch (e) {
      if (!montado.current) return;
      const pausa = segundosDePausaDeCodigo(e);
      if (pausa) {
        pausar(pausa);
      } else if (e instanceof ErroApi && ERROS_DO_CODIGO.includes(e.codigo)) {
        const vencido = e.codigo === 'CODIGO_INVALIDO_OU_VENCIDO';
        fluxo.atualizar({
          erroDoCodigo: textoDoErro(e),
          codigoInvalidado: vencido,
          codigo: vencido ? '' : fluxo.codigo,
        });
        router.back();
      } else {
        setAviso({ texto: textoDoErro(e), rede: e instanceof ErroDeRede });
      }
    } finally {
      if (montado.current) setCarregando(false);
    }
  }

  return (
    <Pagina>
      <Stack.Screen options={{ title: recuperando ? 'Nova senha' : 'Criar senha' }} />
      <Text variante="titleMd" accessibilityRole="header">
        {recuperando ? 'Nova senha' : 'Criar senha'}
      </Text>
      {pausado ? (
        <Banner anunciar tom="warning" icone={Clock} texto={TEXTOS.codigosPausados} />
      ) : (
        aviso && <Banner anunciar tom={aviso.rede ? 'warning' : 'danger'} texto={aviso.texto} />
      )}
      <View style={{ gap: space[4] }}>
        <PasswordField
          rotulo={recuperando ? 'Nova senha' : 'Senha'}
          valor={senha}
          onChangeText={setSenha}
          autoComplete="new-password"
        />
        <PasswordField
          rotulo="Confirmar senha"
          valor={confirmacao}
          onChangeText={setConfirmacao}
          autoComplete="new-password"
          onSubmitEditing={salvar}
        />
      </View>
      <Checklist itens={requisitos} tentou={tentou} />
      {recuperando && (
        <Banner
          tom="info"
          texto="Ao salvar, as outras sessões abertas da sua conta serão encerradas."
        />
      )}
      {pausado ? (
        <Button
          rotulo={recuperando ? 'Salvar nova senha' : 'Criar senha'}
          tamanho="grande"
          onPress={salvar}
          desabilitado
          motivoDesabilitado={TEXTOS.codigosPausadosMotivo}
        />
      ) : (
        <Button
          rotulo={recuperando ? 'Salvar nova senha' : 'Criar senha'}
          tamanho="grande"
          onPress={salvar}
          carregando={carregando}
        />
      )}
    </Pagina>
  );
}
