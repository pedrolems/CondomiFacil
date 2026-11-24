import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { radius, space } from '@condomifacil/design-tokens';
import { Banner, Button, StatusView, Text, useTheme } from '@condomifacil/ui';
import { Pagina } from '../../../compartilhado/componentes/Pagina';
import { useMontado } from '../../../modulos/acesso/hooks';
import { textoDoErro } from '../../../modulos/acesso/mensagens';
import type { SessaoDoUsuario } from '../../../modulos/acesso/operacoes';
import { useSessao } from '../../../modulos/acesso/SessaoProvider';

type Carga = { tipo: 'carregando' } | { tipo: 'erro'; texto: string } | { tipo: 'ok' };

/** dd/mm/aaaa (DS 13.2). */
function formatarData(iso: string): string {
  const d = new Date(iso);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Sessões abertas da conta (ADR-007): o usuário encerra as que não reconhece.
export default function Sessoes() {
  const { tema } = useTheme();
  const { operacoes } = useSessao();
  const montado = useMontado();
  const [carga, setCarga] = useState<Carga>({ tipo: 'carregando' });
  const [sessoes, setSessoes] = useState<SessaoDoUsuario[]>([]);
  const [aviso, setAviso] = useState<{ tom: 'success' | 'danger'; texto: string }>();
  const [encerrando, setEncerrando] = useState<string>();

  const carregar = useCallback(async () => {
    setCarga({ tipo: 'carregando' });
    try {
      const lista = await operacoes.listarSessoes();
      if (!montado.current) return;
      setSessoes(lista);
      setCarga({ tipo: 'ok' });
    } catch (e) {
      if (montado.current) setCarga({ tipo: 'erro', texto: textoDoErro(e) });
    }
  }, [operacoes, montado]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function encerrar(id: string) {
    setAviso(undefined);
    setEncerrando(id);
    try {
      await operacoes.encerrarSessao(id);
      if (!montado.current) return;
      setSessoes((s) => s.filter((x) => x.id !== id));
      setAviso({ tom: 'success', texto: 'Sessão encerrada.' });
    } catch (e) {
      if (montado.current) setAviso({ tom: 'danger', texto: textoDoErro(e) });
    } finally {
      if (montado.current) setEncerrando(undefined);
    }
  }

  if (carga.tipo === 'carregando') {
    return (
      <Pagina>
        <StatusView carregando titulo="Buscando as sessões…" />
      </Pagina>
    );
  }
  if (carga.tipo === 'erro') {
    return (
      <Pagina>
        <StatusView
          tom="warning"
          icone={WifiOff}
          titulo="Não foi possível carregar as sessões"
          descricao={carga.texto}
          acao={{ rotulo: 'Tentar de novo', onPress: () => void carregar() }}
        />
      </Pagina>
    );
  }

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Sessões
      </Text>
      <Text tom="secondary">
        Aparelhos com a sua conta aberta. Encerre os que você não reconhece.
      </Text>
      {aviso && <Banner anunciar tom={aviso.tom} texto={aviso.texto} />}
      {sessoes.map((s) => (
        <View
          key={s.id}
          style={{
            gap: space[2],
            padding: space[3],
            borderRadius: radius.md,
            backgroundColor: tema.surface,
          }}
        >
          <Text variante="label">{s.atual ? 'Este aparelho' : 'Outro aparelho'}</Text>
          <Text variante="bodySm" tom="secondary">
            Válida até {formatarData(s.expira_em)}
          </Text>
          {!s.atual && (
            <Button
              rotulo="Encerrar sessão"
              variante="secundario"
              carregando={encerrando === s.id}
              onPress={() => void encerrar(s.id)}
            />
          )}
        </View>
      ))}
    </Pagina>
  );
}
