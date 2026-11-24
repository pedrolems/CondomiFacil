import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import Documentos from '../src/app/(aceite)/documentos';
import Aparencia from '../src/app/(autenticado)/conta/aparencia';
import Sessoes from '../src/app/(autenticado)/conta/sessoes';
import TrocarSenha from '../src/app/(autenticado)/conta/trocar-senha';
import MinhaConta from '../src/app/(autenticado)/conta/index';
import { GuardaDeSessao } from '../src/compartilhado/navegacao/GuardaDeSessao';
import { PERFIL, erro, json, renderizar } from './apoio';
import { mockRoteador } from './roteador';
import { Text } from 'react-native';

beforeEach(() => jest.clearAllMocks());

const digitar = (rotulo: string, texto: string) =>
  fireEvent.changeText(screen.getByLabelText(rotulo), texto);
const tocar = (nome: string) => fireEvent.press(screen.getByRole('button', { name: nome }));

const DOCUMENTOS = [
  {
    documento_versao_id: '3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10',
    documento_id: '7a1d3c55-0e2b-4c8f-b1a4-9d6e5f302b18',
    tipo: 'termos_de_uso',
    titulo: 'Termos de uso',
    numero: 3,
    condominio_id: null,
    vigente_desde: '2026-11-05T00:00:00-03:00',
    conteudo_texto: 'Texto dos termos.',
    arquivo_id: null,
  },
  {
    documento_versao_id: 'b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b',
    documento_id: 'c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f',
    tipo: 'politica_de_privacidade',
    titulo: 'Política de privacidade',
    numero: 1,
    condominio_id: null,
    vigente_desde: '2026-11-01T00:00:00-03:00',
    conteudo_texto: 'Texto da política.',
    arquivo_id: null,
  },
];
const pagina = (dados: unknown[]) =>
  json(200, { dados, paginacao: { proximo_cursor: null, tem_mais: false } });

describe('Documentos pendentes (fluxos 3.1 e 3.3)', () => {
  test('só libera o aceite com todos marcados e registra as versões', async () => {
    const { chamadas, cliente } = await renderizar(Documentos, {
      logado: true,
      rotas: {
        'GET /v1/acesso/aceites': () => pagina(DOCUMENTOS),
        'POST /v1/acesso/aceites': () => json(201, { aceitos: [], pendentes_restantes: 0 }),
      },
    });
    await screen.findByRole('checkbox', { name: 'Li e aceito: Termos de uso' });
    expect(screen.getAllByRole('button', { name: 'Aceitar e continuar' })[0]).toBeDisabled();
    expect(screen.getByText('Marque os 2 documentos para continuar.')).toBeTruthy();

    await tocar('Ler Termos de uso');
    expect(screen.getByText('Texto dos termos.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Li e aceito: Termos de uso' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Li e aceito: Política de privacidade' }),
    );
    await tocar('Aceitar e continuar');
    await waitFor(() =>
      expect(
        chamadas.find((c) => c.metodo === 'POST' && c.caminho === '/v1/acesso/aceites')?.corpo,
      ).toEqual({
        documento_versao_ids: DOCUMENTOS.map((d) => d.documento_versao_id),
      }),
    );
    await waitFor(() =>
      expect(cliente.estado).toEqual({ tipo: 'autenticada', aceitesPendentes: false }),
    );
  });

  test('"Agora não" explica que é preciso aceitar para usar o app', async () => {
    await renderizar(Documentos, {
      logado: true,
      rotas: { 'GET /v1/acesso/aceites': () => pagina(DOCUMENTOS) },
    });
    await screen.findByRole('checkbox', { name: 'Li e aceito: Termos de uso' });
    await tocar('Agora não');
    expect(
      await screen.findByText(
        'Para usar o CondomiFacil, é preciso aceitar os documentos do seu condomínio.',
      ),
    ).toBeTruthy();
  });

  test('versão desatualizada: mostra o texto aprovado, recarrega e zera as marcações', async () => {
    const { chamadas } = await renderizar(Documentos, {
      logado: true,
      rotas: {
        'GET /v1/acesso/aceites': () => pagina(DOCUMENTOS),
        'POST /v1/acesso/aceites': () => erro(422, 'ACEITE_VERSAO_DESATUALIZADA'),
      },
    });
    await screen.findByRole('checkbox', { name: 'Li e aceito: Termos de uso' });
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Li e aceito: Termos de uso' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Li e aceito: Política de privacidade' }),
    );
    await tocar('Aceitar e continuar');
    expect(
      await screen.findByText('Este documento foi atualizado. Leia a nova versão para aceitar.'),
    ).toBeTruthy();
    await waitFor(() =>
      expect(chamadas.filter((c) => c.caminho.startsWith('/v1/acesso/aceites?')).length).toBe(2),
    );
    expect(screen.getByRole('checkbox', { name: 'Li e aceito: Termos de uso' })).not.toBeChecked();
  });

  test('falha ao listar mostra erro com ação de tentar de novo', async () => {
    await renderizar(Documentos, {
      logado: true,
      rotas: {
        'GET /v1/acesso/aceites': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    expect(await screen.findByText('Não foi possível carregar os documentos')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeTruthy();
  });
});

describe('Trocar senha (fluxo 3.4)', () => {
  const preencher = async (atual = 'senha-atual-1', nova = 'senha-nova-123', conf = nova) => {
    await digitar('Senha atual', atual);
    await digitar('Nova senha', nova);
    await digitar('Confirmar nova senha', conf);
    await tocar('Salvar nova senha');
  };

  test('senha atual incorreta aparece no campo, sem derrubar a sessão', async () => {
    const { cliente } = await renderizar(TrocarSenha, {
      logado: true,
      rotas: { 'POST /v1/eu/senha': () => erro(422, 'SENHA_ATUAL_INCORRETA') },
    });
    await preencher();
    expect(await screen.findByText('Senha atual incorreta.')).toBeTruthy();
    expect(cliente.estado.tipo).toBe('autenticada');
  });

  test('nova senha fraca ou confirmação diferente não chama a API', async () => {
    const { chamadas } = await renderizar(TrocarSenha, { logado: true });
    await preencher('senha-atual-1', 'curta', 'curta');
    expect(await screen.findByLabelText('Pelo menos 8 caracteres: não atendido')).toBeTruthy();
    await preencher('senha-atual-1', 'senha-nova-123', 'diferente-123');
    expect(await screen.findByLabelText('Confirmação igual à senha: não atendido')).toBeTruthy();
    expect(chamadas.some((c) => c.caminho === '/v1/eu/senha')).toBe(false);
  });

  test('5 erros seguidos: troca pausada, botão desabilitado e saída pela recuperação', async () => {
    await renderizar(TrocarSenha, {
      logado: true,
      rotas: {
        'POST /v1/eu/senha': () => erro(429, 'ACESSO_PAUSADO', 'x', { 'Retry-After': '900' }),
        'POST /v1/acesso/sair': () => json(204),
      },
    });
    await preencher();
    expect(
      await screen.findByText(
        'Por segurança, a troca de senha foi pausada por 15 minutos. Você pode redefinir a senha agora.',
      ),
    ).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Salvar nova senha' })[0]).toBeDisabled();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Esqueci minha senha' })[0]!);
    await waitFor(() =>
      expect(mockRoteador.replace).toHaveBeenCalledWith('/email?finalidade=recuperacao_senha'),
    );
  });

  test('troca concluída confirma com ícone e texto', async () => {
    const { chamadas } = await renderizar(TrocarSenha, {
      logado: true,
      rotas: { 'POST /v1/eu/senha': () => json(204) },
    });
    await preencher();
    expect(await screen.findByText('Senha alterada. Você saiu dos outros aparelhos.')).toBeTruthy();
    expect(chamadas.find((c) => c.caminho === '/v1/eu/senha')?.corpo).toEqual({
      senha_atual: 'senha-atual-1',
      nova_senha: 'senha-nova-123',
    });
  });
});

describe('Conta', () => {
  test('menu mostra os dados e leva às telas; Sair limpa a sessão', async () => {
    const { cliente } = await renderizar(MinhaConta, {
      logado: true,
      rotas: { 'POST /v1/acesso/sair': () => json(204) },
    });
    expect(await screen.findByText('Ana Exemplo')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Sessões/ }));
    expect(mockRoteador.push).toHaveBeenCalledWith('/conta/sessoes');
    await tocar('Sair');
    await waitFor(() => expect(cliente.estado.tipo).toBe('anonima'));
  });

  test('Aparência salva o tema pela API', async () => {
    const { chamadas } = await renderizar(Aparencia, {
      logado: true,
      rotas: { 'PATCH /v1/eu': () => json(200, { ...PERFIL, tema_preferido: 'escuro' }) },
    });
    await fireEvent.press(await screen.findByRole('radio', { name: 'Escuro' }));
    expect(await screen.findByText('Aparência salva.')).toBeTruthy();
    expect(chamadas.find((c) => c.metodo === 'PATCH')?.corpo).toEqual({ tema_preferido: 'escuro' });
    expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
  });

  test('Sessões lista e encerra as outras, nunca a atual', async () => {
    const { chamadas } = await renderizar(Sessoes, {
      logado: true,
      rotas: {
        'GET /v1/eu/sessoes': () =>
          pagina([
            {
              id: 'b2e4f6a8-1c3d-4e5f-8a7b-9c0d1e2f3a4b',
              expira_em: '2026-12-10T14:30:00-03:00',
              atual: true,
            },
            {
              id: 'c3f5a7b9-2d4e-4f60-9b8c-0d1e2f3a4b5c',
              expira_em: '2026-12-11T10:00:00-03:00',
              atual: false,
            },
          ]),
        'DELETE /v1/eu/sessoes/c3f5a7b9-2d4e-4f60-9b8c-0d1e2f3a4b5c': () => json(204),
      },
    });
    expect(await screen.findByText('Este aparelho')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Encerrar sessão' })).toHaveLength(1);
    await tocar('Encerrar sessão');
    expect(await screen.findByText('Sessão encerrada.')).toBeTruthy();
    expect(chamadas.some((c) => c.metodo === 'DELETE')).toBe(true);
    expect(screen.queryByText('Outro aparelho')).toBeNull();
  });
});

describe('Guarda de sessão', () => {
  const Conteudo = () => <Text>conteúdo</Text>;
  const comGuarda = (exige: 'anonima' | 'aceite-pendente' | 'liberada') => () => (
    <GuardaDeSessao exige={exige}>
      <Conteudo />
    </GuardaDeSessao>
  );

  test('sem sessão: área autenticada manda ao login e acesso fica livre', async () => {
    await renderizar(comGuarda('liberada'));
    expect(await screen.findByText('redirecionou:/boas-vindas')).toBeTruthy();
    await renderizar(comGuarda('anonima'));
    expect(await screen.findAllByText('conteúdo')).toHaveLength(1);
  });

  test('aceite pendente impede entrar: só os documentos ficam acessíveis', async () => {
    const rotas = {
      'POST /v1/acesso/renovar': () =>
        json(200, {
          ...JSON.parse(
            '{"token_acesso":"a","token_acesso_expira_em":"2099-01-01T00:00:00Z","refresh_token":"r","aceites_pendentes":true}',
          ),
        }),
      'GET /v1/eu': () => json(200, PERFIL),
    };
    await renderizar(comGuarda('liberada'), { logado: true, rotas });
    expect(await screen.findByText('redirecionou:/documentos')).toBeTruthy();
    await renderizar(comGuarda('aceite-pendente'), { logado: true, rotas });
    expect(await screen.findAllByText('conteúdo')).toHaveLength(1);
  });

  test('com sessão e aceites em dia: área autenticada abre e acesso redireciona ao início', async () => {
    await renderizar(comGuarda('liberada'), { logado: true });
    expect(await screen.findByText('conteúdo')).toBeTruthy();
    await renderizar(comGuarda('anonima'), { logado: true });
    expect(await screen.findByText('redirecionou:/inicio')).toBeTruthy();
  });

  test('falha ao restaurar a sessão mostra o erro de conexão com nova tentativa', async () => {
    await renderizar(comGuarda('liberada'), {
      logado: true,
      rotas: {
        'POST /v1/acesso/renovar': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    expect(await screen.findByText('Sem conexão com a API')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeTruthy();
  });
});
