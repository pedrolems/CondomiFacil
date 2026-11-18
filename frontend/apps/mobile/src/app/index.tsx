import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ApiIndisponivel,
  RespostaForaDoContrato,
  consultarSaude,
  type SaudeComum,
} from '../infraestrutura/api/saude';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'disponivel'; saude: SaudeComum }
  | { tipo: 'indisponivel' }
  | { tipo: 'rede' }
  | { tipo: 'contrato' };

// Estado sempre com ícone e texto, nunca só cor. Tema e ícones do Design System: RM-14.
const MENSAGENS = {
  disponivel: { icone: '✔', titulo: 'API disponível' },
  indisponivel: {
    icone: '⚠',
    titulo: 'API indisponível',
    detalhe: 'O servidor respondeu, mas não está pronto. Tente novamente em instantes.',
  },
  rede: {
    icone: '✖',
    titulo: 'Sem conexão com a API',
    detalhe: 'Verifique a internet e o endereço configurado.',
  },
  contrato: {
    icone: '⚠',
    titulo: 'Resposta inesperada da API',
    detalhe: 'O servidor respondeu em um formato que o aplicativo não reconhece.',
  },
} as const;

export default function TelaSaude() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  const consultar = useCallback(() => {
    setEstado({ tipo: 'carregando' });
    consultarSaude().then(
      (saude) => setEstado({ tipo: 'disponivel', saude }),
      (e: unknown) =>
        setEstado({
          tipo:
            e instanceof ApiIndisponivel
              ? 'indisponivel'
              : e instanceof RespostaForaDoContrato
                ? 'contrato'
                : 'rede',
        }),
    );
  }, []);

  useEffect(consultar, [consultar]);

  if (estado.tipo === 'carregando') {
    return (
      <View style={estilos.tela}>
        <ActivityIndicator size="large" accessibilityLabel="Carregando" />
        <Text style={estilos.titulo}>Consultando a API…</Text>
      </View>
    );
  }

  const m = MENSAGENS[estado.tipo];
  return (
    <View style={estilos.tela}>
      <Text style={estilos.icone} accessibilityElementsHidden importantForAccessibility="no">
        {m.icone}
      </Text>
      <Text style={estilos.titulo} accessibilityRole="header">
        {m.titulo}
      </Text>
      <Text>
        {estado.tipo === 'disponivel'
          ? `Versão da API: ${estado.saude.versao}`
          : MENSAGENS[estado.tipo].detalhe}
      </Text>
      {estado.tipo !== 'disponivel' && (
        <Pressable accessibilityRole="button" onPress={consultar} style={estilos.botao}>
          <Text style={estilos.botaoTexto}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  icone: { fontSize: 40 },
  titulo: { fontSize: 20, fontWeight: '600' },
  botao: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  botaoTexto: { fontSize: 16, fontWeight: '600' },
});
