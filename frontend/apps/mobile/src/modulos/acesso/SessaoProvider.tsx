import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ThemeProvider, type PreferenciaDeTema } from '@condomifacil/ui';
import type { ClienteSessao, EstadoDaSessao } from '../../infraestrutura/api/cliente-sessao';
import {
  criarOperacoesDeAcesso,
  type OperacoesDeAcesso,
  type Perfil,
  type TemaPreferido,
} from './operacoes';

type ValorDaSessao = {
  estado: EstadoDaSessao;
  cliente: ClienteSessao;
  operacoes: OperacoesDeAcesso;
  perfil: Perfil | null;
  atualizarTema: (tema: TemaPreferido) => Promise<void>;
  tentarRestaurarDeNovo: () => void;
};

const Contexto = createContext<ValorDaSessao | null>(null);

export const PREFERENCIA_DE_TEMA: Record<TemaPreferido, PreferenciaDeTema> = {
  aparelho: 'sistema',
  claro: 'claro',
  escuro: 'escuro',
};

export function SessaoProvider({
  cliente,
  children,
}: {
  cliente: ClienteSessao;
  children: ReactNode;
}) {
  const estado = useSyncExternalStore(cliente.assinar, () => cliente.estado);
  const operacoes = useMemo(() => criarOperacoesDeAcesso(cliente), [cliente]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    void cliente.restaurar();
    // Logout e sessão revogada apagam todo dado do usuário que a tela guarda.
    return cliente.aoLimparSessao(() => setPerfil(null));
  }, [cliente]);

  const autenticada = estado.tipo === 'autenticada';
  useEffect(() => {
    if (!autenticada) return;
    let ativo = true;
    // O tema salvo vale em qualquer aparelho; se falhar, segue "Igual ao aparelho".
    operacoes.obterPerfil().then(
      (p) => ativo && setPerfil(p),
      () => undefined,
    );
    return () => {
      ativo = false;
    };
  }, [autenticada, operacoes]);

  const atualizarTema = useCallback(
    async (tema: TemaPreferido) => setPerfil(await operacoes.atualizarTema(tema)),
    [operacoes],
  );
  const tentarRestaurarDeNovo = useCallback(() => void cliente.restaurar(), [cliente]);

  const valor = useMemo(
    () => ({ estado, cliente, operacoes, perfil, atualizarTema, tentarRestaurarDeNovo }),
    [estado, cliente, operacoes, perfil, atualizarTema, tentarRestaurarDeNovo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): ValorDaSessao {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSessao precisa estar dentro de SessaoProvider.');
  return valor;
}

/** Aplica o tema salvo no perfil (padrão: igual ao aparelho) aos tokens do app. */
export function TemaDoPerfil({ children }: { children: ReactNode }) {
  const { perfil } = useSessao();
  return (
    <ThemeProvider preferencia={PREFERENCIA_DE_TEMA[perfil?.tema_preferido ?? 'aparelho']}>
      {children}
    </ThemeProvider>
  );
}
