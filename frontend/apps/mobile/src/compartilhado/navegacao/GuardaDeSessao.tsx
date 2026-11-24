import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Clock, ShieldAlert, TriangleAlert, WifiOff } from 'lucide-react-native';
import { space } from '@condomifacil/design-tokens';
import { StatusView, useTheme } from '@condomifacil/ui';
import { falhaDeRestauracao } from '../../modulos/acesso/mensagens';
import { useSessao } from '../../modulos/acesso/SessaoProvider';

/** Quem pode ver a rota: sem sessão, com aceite pendente ou com acesso liberado. */
export type ExigeSessao = 'anonima' | 'aceite-pendente' | 'liberada';

const ICONE_DA_FALHA = {
  rede: WifiOff,
  limite: Clock,
  origem: ShieldAlert,
  inesperado: TriangleAlert,
} as const;

export function useDestinoInicial(): string {
  const { estado } = useSessao();
  if (estado.tipo !== 'autenticada') return '/boas-vindas';
  return estado.aceitesPendentes ? '/documentos' : '/inicio';
}

/**
 * Guarda de navegação pelo estado da sessão (RN-CD-03: aceite pendente impede entrar).
 * Declarativa: quando o estado muda (login, logout, 401 de renovação), a tela se redireciona.
 */
export function GuardaDeSessao({ exige, children }: { exige: ExigeSessao; children: ReactNode }) {
  const { estado, tentarRestaurarDeNovo } = useSessao();
  const { tema } = useTheme();
  const destino = useDestinoInicial();

  if (estado.tipo === 'restaurando' || estado.tipo === 'falha-ao-restaurar') {
    const falha =
      estado.tipo === 'falha-ao-restaurar' ? falhaDeRestauracao(estado.erro) : undefined;
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', padding: space[4], backgroundColor: tema.bg }}
      >
        {!falha ? (
          <StatusView carregando titulo="Abrindo o CondomiFácil…" />
        ) : (
          <StatusView
            tom="warning"
            icone={ICONE_DA_FALHA[falha.tipo]}
            titulo={falha.titulo}
            descricao={falha.descricao}
            acao={{ rotulo: 'Tentar de novo', onPress: tentarRestaurarDeNovo }}
          />
        )}
      </View>
    );
  }

  const permitido =
    exige === 'anonima'
      ? estado.tipo === 'anonima'
      : estado.tipo === 'autenticada' && estado.aceitesPendentes === (exige === 'aceite-pendente');
  return permitido ? <>{children}</> : <Redirect href={destino} />;
}
