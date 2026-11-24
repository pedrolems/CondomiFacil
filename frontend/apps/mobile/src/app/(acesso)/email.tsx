import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Banner, Button, Text, TextField } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { ErroApi } from '../../infraestrutura/api/erros';
import { useFluxoDeAcesso, usePausaDeCodigo } from '../../modulos/acesso/fluxo-de-acesso';
import { useMontado } from '../../modulos/acesso/hooks';
import { TEXTOS, segundosDePausaDeCodigo, textoDoErro } from '../../modulos/acesso/mensagens';
import type { FinalidadeDoCodigo } from '../../modulos/acesso/operacoes';
import { useSessao } from '../../modulos/acesso/SessaoProvider';
import { EMAIL_VALIDO } from '../../modulos/acesso/validacao';

// Fluxos 3.1 (primeiro acesso) e 3.2 (recuperação): o mesmo pedido de código, com `finalidade`.
export default function InformarEmail() {
  const router = useRouter();
  const { finalidade: parametro } = useLocalSearchParams<{ finalidade?: string }>();
  const finalidade: FinalidadeDoCodigo =
    parametro === 'recuperacao_senha' ? 'recuperacao_senha' : 'primeiro_acesso';
  const fluxo = useFluxoDeAcesso();
  const { operacoes } = useSessao();
  const montado = useMontado();
  const { pausado, pausar } = usePausaDeCodigo();
  const [email, setEmail] = useState(fluxo.email);
  const [erroDoEmail, setErroDoEmail] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    setAviso(undefined);
    const invalido = !EMAIL_VALIDO.test(email.trim());
    setErroDoEmail(invalido ? 'Informe um e-mail válido, como nome@email.com.' : undefined);
    if (invalido) return;

    setCarregando(true);
    try {
      const resposta = await operacoes.pedirCodigo(email.trim(), finalidade);
      fluxo.atualizar({
        email: email.trim(),
        finalidade,
        codigo: '',
        erroDoCodigo: undefined,
        codigoInvalidado: false,
        liberaReenvioEm: Date.parse(resposta.pode_pedir_novo_codigo_em),
      });
      router.push('/codigo');
    } catch (e) {
      if (!montado.current) return;
      // A resposta é a mesma para qualquer e-mail: nada aqui revela se a conta existe (RN-CD-02).
      const pausa = segundosDePausaDeCodigo(e);
      if (pausa) pausar(pausa);
      else if (e instanceof ErroApi && e.esperarSegundos) {
        fluxo.atualizar({ liberaReenvioEm: Date.now() + e.esperarSegundos * 1000 });
      }
      if (!pausa) setAviso(textoDoErro(e));
    } finally {
      if (montado.current) setCarregando(false);
    }
  }

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        {finalidade === 'recuperacao_senha' ? 'Redefinir senha' : 'Qual é o seu e-mail?'}
      </Text>
      <Text tom="secondary">
        Use o e-mail que você informou à administradora ou ao síndico. Vamos enviar um código de 6
        dígitos.
      </Text>
      {pausado ? (
        <Banner anunciar tom="warning" icone={Clock} texto={TEXTOS.codigosPausados} />
      ) : (
        aviso && <Banner anunciar tom="warning" texto={aviso} />
      )}
      <TextField
        rotulo="E-mail"
        valor={email}
        onChangeText={setEmail}
        erro={erroDoEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={enviar}
      />
      {pausado ? (
        <Button
          rotulo="Enviar código"
          tamanho="grande"
          onPress={enviar}
          desabilitado
          motivoDesabilitado={TEXTOS.codigosPausadosMotivo}
        />
      ) : (
        <Button rotulo="Enviar código" tamanho="grande" onPress={enviar} carregando={carregando} />
      )}
    </Pagina>
  );
}
