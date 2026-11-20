import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SERVIDOR, ctxAtual, executar } from './cenarios';
import { confirmarDivergencia, contarPendentes, divergenciasAbertas } from './outbox';

type Div = { op_id: string; mensagem: string };

// Tela minima: indicador de pendencias + hora da ultima sync (RNF-06/08) e o dialogo bloqueante
// de divergencia (RN-OF-04): sem botao de fechar, sem fechar pelo "voltar", so apos confirmar.
export default function App() {
  const [status, setStatus] = useState('aguardando plano');
  const [pend, setPend] = useState(0);
  const [ultima, setUltima] = useState('nunca');
  const [divs, setDivs] = useState<Div[]>([]);

  const atualizar = async () => {
    if (!ctxAtual) return;
    setPend(await contarPendentes(ctxAtual.db));
    const u = await ctxAtual.db.getFirstAsync<{ v: string }>("SELECT v FROM sync_estado WHERE k='ultima_sync'");
    if (u) setUltima(new Date(Number(u.v)).toLocaleTimeString('pt-BR'));
    setDivs(await divergenciasAbertas(ctxAtual.db));
  };

  useEffect(() => {
    let vivo = true;
    (async () => {
      while (vivo) {
        try {
          const { nome } = await (await fetch(`${SERVIDOR}/plano`)).json();
          if (nome) { setStatus(`executando ${nome}`); await executar(nome); setStatus(`fim ${nome}`); }
          await atualizar();
        } catch (e) { setStatus(`sem servidor: ${String(e).slice(0, 60)}`); }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();
    return () => { vivo = false; };
  }, []);

  const d = divs[0];
  return (
    <View style={{ flex: 1, padding: 24, paddingTop: 64 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>P4 Offline PoC</Text>
      <Text accessibilityLabel="status">{status}</Text>
      <Text accessibilityLabel="pendencias">Pendências: {pend}</Text>
      <Text accessibilityLabel="ultima-sync">Última sincronização: {ultima}</Text>
      <ScrollView />
      <Modal visible={!!d} transparent animationType="fade" onRequestClose={() => { /* bloqueante: o botão voltar não fecha */ }}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 24 }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Divergência no registro offline</Text>
            <Text style={{ marginVertical: 12 }}>{d?.mensagem}</Text>
            <Pressable
              accessibilityRole="button"
              style={{ minHeight: 56, justifyContent: 'center', backgroundColor: '#1d4ed8', borderRadius: 8, paddingHorizontal: 16 }}
              onPress={async () => { await confirmarDivergencia(ctxAtual!.db, d!.op_id, 'porteiro_ficticio'); await atualizar(); }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Confirmei por interfone</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
