import type { ComponentType } from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@condomifacil/ui';
import { ClienteSessao } from '../src/infraestrutura/api/cliente-sessao';
import { criarTravaEmProcesso } from '../src/infraestrutura/seguranca/trava';
import { FluxoDeAcessoProvider, type Fluxo } from '../src/modulos/acesso/fluxo-de-acesso';
import { SessaoProvider } from '../src/modulos/acesso/SessaoProvider';

export const json = (status: number, corpo?: unknown, cabecalhos?: Record<string, string>) =>
  new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: cabecalhos });

export const erro = (
  status: number,
  codigo: string,
  mensagem = 'x',
  cab?: Record<string, string>,
) => json(status, { codigo, mensagem, request_id: 'req_1' }, cab);

export const sessaoAberta = (pendentes = false) => ({
  token_acesso: 'acesso-1',
  token_acesso_expira_em: new Date(Date.now() + 15 * 60_000).toISOString(),
  refresh_token: 'rt-1',
  aceites_pendentes: pendentes,
});

export const PERFIL = {
  id: '3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10',
  nome: 'Ana Exemplo',
  email: 'ana.exemplo@example.com',
  tema_preferido: 'aparelho',
};

export type Rotas = Record<string, (corpo: unknown, vez: number) => Response | Promise<Response>>;
export type ChamadaFeita = { metodo: string; caminho: string; corpo: unknown; init: RequestInit };

/**
 * Renderiza uma tela com a sessão real sobre um servidor falso. `logado` põe um refresh no
 * armazenamento e a rota de renovação, como depois de abrir o app com a sessão salva.
 */
export async function renderizar(
  Tela: ComponentType,
  opcoes: { rotas?: Rotas; logado?: boolean; fluxo?: Partial<Fluxo> } = {},
) {
  const chamadas: ChamadaFeita[] = [];
  const vezes: Record<string, number> = {};
  const rotas: Rotas = {
    ...(opcoes.logado
      ? {
          'POST /v1/acesso/renovar': () => json(200, sessaoAberta()),
          'GET /v1/eu': () => json(200, PERFIL),
        }
      : {}),
    ...opcoes.rotas,
  };
  let refresh: string | null = opcoes.logado ? 'rt-1' : null;
  const cliente = new ClienteSessao({
    baseUrl: 'http://api.teste',
    plataforma: 'android',
    armazenamento: {
      ler: async () => refresh,
      gravar: async (t) => {
        refresh = t;
      },
      limpar: async () => {
        refresh = null;
      },
    },
    trava: criarTravaEmProcesso(),
    identificadorDaInstalacao: async () => 'inst-teste',
    fetch: (async (url: string, init: RequestInit = {}) => {
      const caminho = String(url).replace('http://api.teste', '');
      const chave = `${init.method ?? 'GET'} ${caminho.split('?')[0]}`;
      const corpo = init.body ? JSON.parse(String(init.body)) : undefined;
      chamadas.push({ metodo: init.method ?? 'GET', caminho, corpo, init });
      vezes[chave] = (vezes[chave] ?? 0) + 1;
      const rota = rotas[chave];
      if (!rota) throw new Error(`rota não prevista: ${chave}`);
      return rota(corpo, vezes[chave]);
    }) as unknown as typeof fetch,
  });
  const tela = await render(
    <ThemeProvider>
      <SessaoProvider cliente={cliente}>
        <FluxoDeAcessoProvider inicial={opcoes.fluxo}>
          <Tela />
        </FluxoDeAcessoProvider>
      </SessaoProvider>
    </ThemeProvider>,
  );
  return { cliente, chamadas, ...tela };
}
