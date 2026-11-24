import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { Banner, Button, Checklist, PasswordField, Text } from '@condomifacil/ui';
import { Pagina } from '../../../compartilhado/componentes/Pagina';
import { ErroApi, ErroDeRede } from '../../../infraestrutura/api/erros';
import { useMontado, usePausa } from '../../../modulos/acesso/hooks';
import { segundosDePausa, textoDoErro } from '../../../modulos/acesso/mensagens';
import { useSessao } from '../../../modulos/acesso/SessaoProvider';
import { requisitosDaSenha } from '../../../modulos/acesso/validacao';

// Fluxo 3.4 (RF-AC-09, RN-CD-29): com a sessão aberta, sem código por e-mail.
export default function TrocarSenha() {
  const router = useRouter();
  const { operacoes, cliente } = useSessao();
  const montado = useMontado();
  const { pausado, pausar } = usePausa();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erroDaAtual, setErroDaAtual] = useState<string>();
  const [aviso, setAviso] = useState<{ tom: 'warning' | 'danger'; texto: string }>();
  const [concluida, setConcluida] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const requisitos = requisitosDaSenha(nova, confirmacao);

  async function salvar() {
    setAviso(undefined);
    setErroDaAtual(undefined);
    setTentou(true);
    if (!atual) {
      setErroDaAtual('Informe a senha atual.');
      return;
    }
    if (!requisitos.every((r) => r.atendido)) return;

    setCarregando(true);
    try {
      await operacoes.trocarSenha(atual, nova);
      if (montado.current) setConcluida(true);
    } catch (e) {
      if (!montado.current) return;
      const espera = segundosDePausa(e);
      if (espera) pausar(espera);
      if (e instanceof ErroApi && e.codigo === 'SENHA_ATUAL_INCORRETA') {
        setErroDaAtual(textoDoErro(e));
      } else {
        setAviso({
          tom: e instanceof ErroDeRede || espera ? 'warning' : 'danger',
          texto: textoDoErro(e, 'troca-de-senha'),
        });
      }
    } finally {
      if (montado.current) setCarregando(false);
    }
  }

  // "Esqueci minha senha" (3.2) exige sessão anônima: sai deste aparelho e vai pedir o código.
  async function redefinirPeloEmail() {
    await cliente.sair();
    router.replace('/email?finalidade=recuperacao_senha');
  }

  if (concluida) {
    return (
      <Pagina>
        <Banner
          anunciar
          tom="success"
          icone={Check}
          texto="Senha alterada. Você saiu dos outros aparelhos."
        />
        <Button rotulo="Voltar" variante="secundario" onPress={() => router.back()} />
      </Pagina>
    );
  }

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Trocar senha
      </Text>
      {aviso && (
        <Banner
          anunciar
          tom={aviso.tom}
          texto={aviso.texto}
          icone={pausado ? Clock : undefined}
          acao={
            pausado
              ? { rotulo: 'Esqueci minha senha', onPress: () => void redefinirPeloEmail() }
              : undefined
          }
        />
      )}
      <View style={{ gap: space[4] }}>
        <PasswordField
          rotulo="Senha atual"
          valor={atual}
          onChangeText={setAtual}
          autoComplete="current-password"
          erro={erroDaAtual}
        />
        <PasswordField
          rotulo="Nova senha"
          valor={nova}
          onChangeText={setNova}
          autoComplete="new-password"
        />
        <PasswordField
          rotulo="Confirmar nova senha"
          valor={confirmacao}
          onChangeText={setConfirmacao}
          autoComplete="new-password"
          onSubmitEditing={salvar}
        />
      </View>
      <Checklist itens={requisitos} tentou={tentou} />
      <Text variante="bodySm" tom="secondary">
        Ao salvar, os outros aparelhos serão desconectados.
      </Text>
      {pausado ? (
        <Button
          rotulo="Salvar nova senha"
          tamanho="grande"
          onPress={salvar}
          desabilitado
          motivoDesabilitado="Aguarde 15 minutos ou redefina a senha."
        />
      ) : (
        <Button
          rotulo="Salvar nova senha"
          tamanho="grande"
          onPress={salvar}
          carregando={carregando}
        />
      )}
    </Pagina>
  );
}
