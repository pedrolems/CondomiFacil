import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { StatusView, useTheme, type StatusViewProps } from '@condomifacil/ui';
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

// Estado sempre com ícone e texto, nunca só cor (DS 4.4 e 10.21).
const FALHAS = {
  indisponivel: {
    tom: 'warning',
    titulo: 'API indisponível',
    descricao: 'O servidor respondeu, mas não está pronto. Tente novamente em instantes.',
  },
  rede: {
    tom: 'warning',
    icone: WifiOff,
    titulo: 'Sem conexão com a API',
    descricao: 'Verifique a internet e o endereço configurado.',
  },
  contrato: {
    tom: 'danger',
    titulo: 'Resposta inesperada da API',
    descricao: 'O servidor respondeu em um formato que o aplicativo não reconhece.',
  },
} as const;

export default function TelaSaude() {
  const { tema } = useTheme();
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

  const status: StatusViewProps =
    estado.tipo === 'carregando'
      ? { carregando: true, titulo: 'Consultando a API…' }
      : estado.tipo === 'disponivel'
        ? {
            tom: 'success',
            titulo: 'API disponível',
            descricao: `Versão da API: ${estado.saude.versao}`,
          }
        : { ...FALHAS[estado.tipo], acao: { rotulo: 'Tentar de novo', onPress: consultar } };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: space[4],
        backgroundColor: tema.bg,
      }}
    >
      <StatusView {...status} />
    </View>
  );
}
