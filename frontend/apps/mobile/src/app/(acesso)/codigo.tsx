import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { Banner, Button, CodeField, DIGITOS_DO_CODIGO, Text } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { ErroApi } from '../../infraestrutura/api/erros';
import { useFluxoDeAcesso, usePausaDeCodigo } from '../../modulos/acesso/fluxo-de-acesso';
import { useMontado, useSegundosAte } from '../../modulos/acesso/hooks';
import { TEXTOS, segundosDePausaDeCodigo, textoDoErro } from '../../modulos/acesso/mensagens';
import { useSessao } from '../../modulos/acesso/SessaoProvider';

// O código só é conferido pelo servidor junto com a senha (ativar ou redefinir); se vier errado,
// a tela de senha volta para esta com o erro e as tentativas restantes.
export default function Codigo() {
  const router = useRouter();
  const fluxo = useFluxoDeAcesso();
  const { operacoes } = useSessao();
  const montado = useMontado();
  const { pausado, pausar } = usePausaDeCodigo();
  const segundos = useSegundosAte(fluxo.liberaReenvioEm);
  const [aviso, setAviso] = useState<{ tom: 'info' | 'warning'; texto: string }>();
  const [reenviando, setReenviando] = useState(false);

  if (!fluxo.email) return <Redirect href="/boas-vindas" />;

  async function pedirNovo() {
    setAviso(undefined);
    setReenviando(true);
    try {
      const r = await operacoes.pedirCodigo(fluxo.email, fluxo.finalidade);
      fluxo.atualizar({
        codigo: '',
        erroDoCodigo: undefined,
        codigoInvalidado: false,
        liberaReenvioEm: Date.parse(r.pode_pedir_novo_codigo_em),
      });
      setAviso({ tom: 'info', texto: 'Novo código enviado. O anterior não vale mais.' });
    } catch (e) {
      if (!montado.current) return;
      const pausa = segundosDePausaDeCodigo(e);
      if (pausa) {
        pausar(pausa);
        setAviso(undefined);
        return;
      }
      if (e instanceof ErroApi && e.esperarSegundos) {
        fluxo.atualizar({ liberaReenvioEm: Date.now() + e.esperarSegundos * 1000 });
      }
      setAviso({ tom: 'warning', texto: textoDoErro(e) });
    } finally {
      if (montado.current) setReenviando(false);
    }
  }

  const completo = fluxo.codigo.length === DIGITOS_DO_CODIGO;
  const continuar = () => router.push('/senha');
  // A contagem de 60 s vale também com o código invalidado (UF 3.1, E3).
  const aguardando = segundos > 0;

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Digite o código
      </Text>
      <Banner
        tom="info"
        texto={`Se o e-mail ${fluxo.email} estiver cadastrado, um código foi enviado.`}
      />
      {pausado ? (
        <Banner anunciar tom="warning" icone={Clock} texto={TEXTOS.codigosPausados} />
      ) : (
        aviso && <Banner anunciar tom={aviso.tom} texto={aviso.texto} />
      )}
      <CodeField
        rotulo="Código de 6 dígitos"
        valor={fluxo.codigo}
        onChangeText={(codigo) => fluxo.atualizar({ codigo })}
        erro={fluxo.erroDoCodigo}
        ajuda="Código válido por 15 minutos."
        editable={!fluxo.codigoInvalidado}
        onSubmitEditing={completo ? continuar : undefined}
        autoFocus
      />
      <Text variante="bodySm" tom="secondary">
        Não recebeu? Confira o e-mail digitado ou procure a administradora ou o síndico.
      </Text>
      <View style={{ gap: space[3] }}>
        {fluxo.codigoInvalidado ? null : pausado ? (
          <Button
            rotulo="Continuar"
            tamanho="grande"
            onPress={continuar}
            desabilitado
            motivoDesabilitado={TEXTOS.codigosPausadosMotivo}
          />
        ) : completo ? (
          <Button rotulo="Continuar" tamanho="grande" onPress={continuar} />
        ) : (
          <Button
            rotulo="Continuar"
            tamanho="grande"
            onPress={continuar}
            desabilitado
            motivoDesabilitado="Digite os 6 dígitos do código para continuar."
          />
        )}
        {pausado || aguardando ? (
          <Button
            rotulo="Pedir novo código"
            variante={fluxo.codigoInvalidado ? 'primario' : 'texto'}
            onPress={pedirNovo}
            desabilitado
            motivoDesabilitado={
              pausado
                ? TEXTOS.codigosPausadosMotivo
                : `Você poderá pedir um novo código em ${segundos} s.`
            }
          />
        ) : (
          <Button
            rotulo="Pedir novo código"
            variante={fluxo.codigoInvalidado ? 'primario' : 'texto'}
            onPress={pedirNovo}
            carregando={reenviando}
          />
        )}
      </View>
    </Pagina>
  );
}
