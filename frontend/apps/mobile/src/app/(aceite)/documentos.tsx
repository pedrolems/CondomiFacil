import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { radius, space } from '@condomifacil/design-tokens';
import { Banner, Button, Choice, StatusView, Text, useTheme } from '@condomifacil/ui';
import { Pagina } from '../../compartilhado/componentes/Pagina';
import { ErroApi, ErroDeRede } from '../../infraestrutura/api/erros';
import { useMontado } from '../../modulos/acesso/hooks';
import { textoDoErro } from '../../modulos/acesso/mensagens';
import type { DocumentoPendente } from '../../modulos/acesso/operacoes';
import { useSessao } from '../../modulos/acesso/SessaoProvider';

type Carga = { tipo: 'carregando' } | { tipo: 'erro'; texto: string } | { tipo: 'ok' };

const RECUSA = 'Para usar o CondomiFacil, é preciso aceitar os documentos do seu condomínio.';

// Fluxos 3.1 e 3.3: lê e aceita cada documento pendente; só então o app libera o resto.
export default function Documentos() {
  const { tema } = useTheme();
  const { operacoes, cliente } = useSessao();
  const montado = useMontado();
  const [carga, setCarga] = useState<Carga>({ tipo: 'carregando' });
  const [documentos, setDocumentos] = useState<DocumentoPendente[]>([]);
  const [aceitos, setAceitos] = useState<string[]>([]);
  const [abertos, setAbertos] = useState<string[]>([]);
  const [aviso, setAviso] = useState<{ tom: 'warning' | 'danger'; texto: string }>();
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setCarga({ tipo: 'carregando' });
    try {
      const lista = await operacoes.listarAceitesPendentes();
      if (!montado.current) return;
      if (lista.length === 0) cliente.aceitesEmDia();
      setDocumentos(lista);
      setAceitos([]);
      setAbertos([]);
      setCarga({ tipo: 'ok' });
    } catch (e) {
      if (montado.current) setCarga({ tipo: 'erro', texto: textoDoErro(e) });
    }
  }, [operacoes, cliente, montado]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const alternar = (lista: string[], id: string) =>
    lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];

  async function aceitar() {
    setAviso(undefined);
    setEnviando(true);
    try {
      const r = await operacoes.registrarAceites(aceitos);
      if (r.pendentes_restantes === 0) cliente.aceitesEmDia();
      else await carregar();
    } catch (e) {
      if (!montado.current) return;
      setAviso({ tom: e instanceof ErroDeRede ? 'warning' : 'danger', texto: textoDoErro(e) });
      // Versão trocada depois de abrir a tela: recarrega para ler a nova antes de aceitar.
      if (e instanceof ErroApi && e.codigo === 'ACEITE_VERSAO_DESATUALIZADA') await carregar();
    } finally {
      if (montado.current) setEnviando(false);
    }
  }

  if (carga.tipo === 'carregando') {
    return (
      <Pagina>
        <StatusView carregando titulo="Buscando os documentos…" />
      </Pagina>
    );
  }
  if (carga.tipo === 'erro') {
    return (
      <Pagina>
        <StatusView
          tom="warning"
          icone={WifiOff}
          titulo="Não foi possível carregar os documentos"
          descricao={carga.texto}
          acao={{ rotulo: 'Tentar de novo', onPress: () => void carregar() }}
        />
      </Pagina>
    );
  }

  const todos = documentos.length > 0 && aceitos.length === documentos.length;
  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Documentos do condomínio
      </Text>
      <Text tom="secondary">Leia e aceite cada documento para começar a usar o CondomiFacil.</Text>
      {aviso && <Banner anunciar tom={aviso.tom} texto={aviso.texto} />}
      {documentos.map((d) => {
        const aberto = abertos.includes(d.documento_versao_id);
        return (
          <View
            key={d.documento_versao_id}
            style={{
              gap: space[2],
              padding: space[3],
              borderRadius: radius.md,
              backgroundColor: tema.surface,
            }}
          >
            <Choice
              tipo="checkbox"
              rotulo={`Li e aceito: ${d.titulo}`}
              descricao={`Versão ${d.numero}`}
              marcado={aceitos.includes(d.documento_versao_id)}
              onChange={() => setAceitos((a) => alternar(a, d.documento_versao_id))}
            />
            <Button
              rotulo={aberto ? 'Fechar texto' : `Ler ${d.titulo}`}
              variante="texto"
              onPress={() => setAbertos((a) => alternar(a, d.documento_versao_id))}
            />
            {aberto && (
              <Text>
                {d.conteudo_texto ??
                  'Este documento é um arquivo. A leitura dele chega numa próxima etapa.'}
              </Text>
            )}
          </View>
        );
      })}
      {todos ? (
        <Button
          rotulo="Aceitar e continuar"
          tamanho="grande"
          onPress={aceitar}
          carregando={enviando}
        />
      ) : (
        <Button
          rotulo="Aceitar e continuar"
          tamanho="grande"
          onPress={aceitar}
          desabilitado
          motivoDesabilitado={`Marque os ${documentos.length} documentos para continuar.`}
        />
      )}
      <Button
        rotulo="Agora não"
        variante="texto"
        onPress={() => setAviso({ tom: 'warning', texto: RECUSA })}
      />
      <Button rotulo="Sair da conta" variante="texto" onPress={() => void cliente.sair()} />
    </Pagina>
  );
}
