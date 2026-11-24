import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import Login from '../src/app/(acesso)/login';
import InformarEmail from '../src/app/(acesso)/email';
import Codigo from '../src/app/(acesso)/codigo';
import CriarSenha from '../src/app/(acesso)/senha';
import { GuardaDeSessao } from '../src/compartilhado/navegacao/GuardaDeSessao';
import { erro, json, renderizar, sessaoAberta } from './apoio';
import { mockParametros, mockRoteador } from './roteador';

beforeEach(() => {
  jest.clearAllMocks();
  for (const k of Object.keys(mockParametros)) delete mockParametros[k];
});

const digitar = (rotulo: string, texto: string) =>
  fireEvent.changeText(screen.getByLabelText(rotulo), texto);
const tocar = (nome: string) => fireEvent.press(screen.getByRole('button', { name: nome }));

describe('Login (fluxo 3.2)', () => {
  test('valida e-mail e senha antes de chamar a API', async () => {
    const { chamadas } = await renderizar(Login);
    await tocar('Entrar');
    expect(await screen.findByText('Informe um e-mail válido, como nome@email.com.')).toBeTruthy();
    expect(screen.getByText('Informe sua senha.')).toBeTruthy();
    expect(chamadas).toHaveLength(0);
  });

  test('credenciais erradas: mensagem única, sem dizer qual dos dois', async () => {
    const { chamadas } = await renderizar(Login, {
      rotas: { 'POST /v1/acesso/entrar': () => erro(401, 'CREDENCIAIS_INVALIDAS') },
    });
    await digitar('E-mail', 'ana@email.com');
    await digitar('Senha', 'errada123');
    await tocar('Entrar');
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeTruthy();
    expect(chamadas[0]?.corpo).toMatchObject({
      email: 'ana@email.com',
      dispositivo: { identificador_instalacao: 'inst-teste', plataforma: 'android' },
    });
  });

  test('5 senhas erradas: aviso com ícone e texto, botão desabilitado com motivo e atalho de recuperação', async () => {
    await renderizar(Login, {
      rotas: {
        'POST /v1/acesso/entrar': () => erro(429, 'ACESSO_PAUSADO', 'x', { 'Retry-After': '900' }),
      },
    });
    await digitar('E-mail', 'ana@email.com');
    await digitar('Senha', 'errada123');
    await tocar('Entrar');
    expect(
      await screen.findByText(
        'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByTestId('icone-banner-warning', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(screen.getByText('Aguarde 15 minutos ou redefina a senha.')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Entrar' })[0]).toBeDisabled();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Esqueci minha senha' })[0]!);
    expect(mockRoteador.push).toHaveBeenCalledWith('/email?finalidade=recuperacao_senha');
  });

  test.each([
    [
      'ACESSO_ENCERRADO',
      403,
      'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.',
    ],
    ['ORIGEM_NAO_PERMITIDA', 403, 'Não foi possível concluir a operação por este endereço.'],
    [
      'LIMITE_DE_TAXA_EXCEDIDO',
      429,
      'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.',
    ],
  ])('%s mostra o texto do fluxo', async (codigo, status, texto) => {
    await renderizar(Login, { rotas: { 'POST /v1/acesso/entrar': () => erro(status, codigo) } });
    await digitar('E-mail', 'ana@email.com');
    await digitar('Senha', 'senha-qualquer');
    await tocar('Entrar');
    expect(await screen.findByText(texto)).toBeTruthy();
  });

  test('sem internet', async () => {
    await renderizar(Login, {
      rotas: {
        'POST /v1/acesso/entrar': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    await digitar('E-mail', 'ana@email.com');
    await digitar('Senha', 'senha-qualquer');
    await tocar('Entrar');
    expect(
      await screen.findByText('Não foi possível conectar. Verifique a internet e tente de novo.'),
    ).toBeTruthy();
    expect(
      screen.getByTestId('icone-banner-warning', { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});

describe('E-mail para o código (fluxos 3.1 e 3.2)', () => {
  test('pede o código com a finalidade da rota e segue para a tela do código', async () => {
    mockParametros.finalidade = 'recuperacao_senha';
    const { chamadas } = await renderizar(InformarEmail, {
      rotas: {
        'POST /v1/acesso/codigo': () =>
          json(202, {
            mensagem: 'Se o e-mail estiver cadastrado, enviamos um código.',
            pode_pedir_novo_codigo_em: new Date(Date.now() + 60_000).toISOString(),
          }),
      },
    });
    expect(screen.getByText('Redefinir senha')).toBeTruthy();
    await digitar('E-mail', 'ana@email.com');
    await tocar('Enviar código');
    await waitFor(() => expect(mockRoteador.push).toHaveBeenCalledWith('/codigo'));
    expect(chamadas[0]?.corpo).toEqual({ email: 'ana@email.com', finalidade: 'recuperacao_senha' });
  });

  test('e-mail inválido não chama a API; reenvio antecipado mostra o texto aprovado', async () => {
    const { chamadas } = await renderizar(InformarEmail, {
      rotas: {
        'POST /v1/acesso/codigo': () =>
          erro(429, 'CODIGO_REENVIO_ANTECIPADO', 'x', { 'Retry-After': '30' }),
      },
    });
    await digitar('E-mail', 'sem-arroba');
    await tocar('Enviar código');
    expect(await screen.findByText('Informe um e-mail válido, como nome@email.com.')).toBeTruthy();
    expect(chamadas).toHaveLength(0);

    await digitar('E-mail', 'ana@email.com');
    await tocar('Enviar código');
    expect(await screen.findByText('Você poderá pedir um novo código em instantes.')).toBeTruthy();
    expect(mockRoteador.push).not.toHaveBeenCalled();
  });
});

describe('Código (fluxo 3.1)', () => {
  const base = { email: 'ana@email.com', liberaReenvioEm: Date.now() + 60_000 };

  test('só continua com 6 dígitos e filtra o que não é número', async () => {
    await renderizar(Codigo, { fluxo: base });
    expect(screen.getAllByRole('button', { name: 'Continuar' })[0]).toBeDisabled();
    expect(screen.getByText('Digite os 6 dígitos do código para continuar.')).toBeTruthy();
    await digitar('Código de 6 dígitos', '48a3-9207');
    expect(screen.getByLabelText('Código de 6 dígitos').props.value).toBe('483920');
    await tocar('Continuar');
    expect(mockRoteador.push).toHaveBeenCalledWith('/senha');
  });

  test('reenvio fica bloqueado por 60 s com motivo e contagem', async () => {
    await renderizar(Codigo, { fluxo: base });
    expect(screen.getByText(/Você poderá pedir um novo código em \d+ s\./)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Pedir novo código' })[0]).toBeDisabled();
  });

  test('erro de código mostra as tentativas restantes e orienta quem não recebeu', async () => {
    await renderizar(Codigo, {
      fluxo: {
        ...base,
        codigo: '111111',
        erroDoCodigo: 'Código incorreto. Você tem mais 3 tentativas.',
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Código incorreto. Você tem mais 3 tentativas.',
    );
    expect(
      screen.getByText(
        'Não recebeu? Confira o e-mail digitado ou procure a administradora ou o síndico.',
      ),
    ).toBeTruthy();
  });

  test('código invalidado dentro dos 60 s: o reenvio espera a contagem, visível', async () => {
    await renderizar(Codigo, {
      fluxo: {
        ...base,
        codigoInvalidado: true,
        erroDoCodigo: 'Este código não vale mais. Peça um novo.',
      },
    });
    expect(screen.getByText(/Você poderá pedir um novo código em \d+ s\./)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Pedir novo código' })[0]).toBeDisabled();
  });

  test('código invalidado: campo travado e novo código liberado', async () => {
    const { chamadas } = await renderizar(Codigo, {
      fluxo: {
        email: 'ana@email.com',
        liberaReenvioEm: 0,
        codigoInvalidado: true,
        erroDoCodigo: 'Este código não vale mais. Peça um novo.',
      },
      rotas: {
        'POST /v1/acesso/codigo': () =>
          json(202, {
            mensagem: 'ok',
            pode_pedir_novo_codigo_em: new Date(Date.now() + 60_000).toISOString(),
          }),
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Este código não vale mais. Peça um novo.');
    expect(screen.getByLabelText('Código de 6 dígitos').props.editable).toBe(false);
    await tocar('Pedir novo código');
    expect(await screen.findByText('Novo código enviado. O anterior não vale mais.')).toBeTruthy();
    expect(chamadas[0]?.corpo).toEqual({ email: 'ana@email.com', finalidade: 'primeiro_acesso' });
  });
});

describe('Pausa de 24 h dos códigos (CODIGO_PAUSADO)', () => {
  const pausa = () => erro(429, 'CODIGO_PAUSADO', 'x', { 'Retry-After': '86400' });
  const aviso =
    'Por segurança, novos códigos foram pausados por 24 horas. Tente de novo mais tarde.';

  test('e-mail: banner com ícone de relógio e envio desabilitado com o motivo', async () => {
    await renderizar(InformarEmail, { rotas: { 'POST /v1/acesso/codigo': pausa } });
    await digitar('E-mail', 'ana@email.com');
    await tocar('Enviar código');
    expect(await screen.findByText(aviso)).toBeTruthy();
    expect(screen.getByText('Novos códigos estão pausados por 24 horas.')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Enviar código' })[0]).toBeDisabled();
    expect(mockRoteador.push).not.toHaveBeenCalled();
  });

  test('código: com a pausa ativa, pedir novo e continuar ficam desabilitados', async () => {
    await renderizar(Codigo, {
      fluxo: {
        email: 'ana@email.com',
        codigo: '123456',
        liberaReenvioEm: 0,
        pausaDeCodigoAte: Date.now() + 86_400_000,
      },
    });
    expect(screen.getByText(aviso)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Pedir novo código' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Continuar' })[0]).toBeDisabled();
  });

  test('senha: o servidor pausa ao usar o código e o envio fica desabilitado', async () => {
    await renderizar(CriarSenha, {
      fluxo: { email: 'ana@email.com', codigo: '483920' },
      rotas: { 'POST /v1/acesso/ativar': pausa },
    });
    await digitar('Senha', 'senha-longa-1');
    await digitar('Confirmar senha', 'senha-longa-1');
    await tocar('Criar senha');
    expect(await screen.findByText(aviso)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Criar senha' })[0]).toBeDisabled();
    expect(mockRoteador.back).not.toHaveBeenCalled();
  });
});

describe('Criar senha (fluxos 3.1 e 3.2)', () => {
  const fluxo = { email: 'ana@email.com', codigo: '483920' };

  test('senha curta ou confirmação diferente: requisito pendente com ícone e texto, sem chamar a API', async () => {
    const { chamadas } = await renderizar(CriarSenha, { fluxo });
    await digitar('Senha', 'curta');
    await digitar('Confirmar senha', 'outra');
    await tocar('Criar senha');
    expect(await screen.findByLabelText('Pelo menos 8 caracteres: não atendido')).toBeTruthy();
    expect(screen.getByLabelText('Confirmação igual à senha: não atendido')).toBeTruthy();
    expect(chamadas).toHaveLength(0);
  });

  test('ativa a conta com código e senha, e o app guarda o refresh', async () => {
    const { chamadas, cliente } = await renderizar(CriarSenha, {
      fluxo,
      rotas: {
        'POST /v1/acesso/ativar': () => json(200, sessaoAberta(true)),
        'GET /v1/eu': () =>
          json(200, { id: 'x', nome: 'Ana', email: 'a@b.co', tema_preferido: 'aparelho' }),
      },
    });
    await digitar('Senha', 'senha-longa-1');
    await digitar('Confirmar senha', 'senha-longa-1');
    await tocar('Criar senha');
    await waitFor(() =>
      expect(cliente.estado).toEqual({ tipo: 'autenticada', aceitesPendentes: true }),
    );
    expect(chamadas[0]?.corpo).toMatchObject({
      email: 'ana@email.com',
      codigo: '483920',
      nova_senha: 'senha-longa-1',
    });
  });

  test('código incorreto na ativação volta para a tela do código', async () => {
    await renderizar(CriarSenha, {
      fluxo,
      rotas: {
        'POST /v1/acesso/ativar': () =>
          erro(422, 'CODIGO_INCORRETO', 'Código incorreto. Você tem mais 3 tentativas.'),
      },
    });
    await digitar('Senha', 'senha-longa-1');
    await digitar('Confirmar senha', 'senha-longa-1');
    await tocar('Criar senha');
    await waitFor(() => expect(mockRoteador.back).toHaveBeenCalled());
  });

  test('recuperação avisa que as outras sessões serão encerradas e usa a rota de redefinição', async () => {
    const { chamadas } = await renderizar(CriarSenha, {
      fluxo: { ...fluxo, finalidade: 'recuperacao_senha' },
      rotas: {
        'POST /v1/acesso/redefinir-senha': () => json(200, sessaoAberta()),
        'GET /v1/eu': () =>
          json(200, { id: 'x', nome: 'Ana', email: 'a@b.co', tema_preferido: 'aparelho' }),
      },
    });
    expect(
      screen.getByText('Ao salvar, as outras sessões abertas da sua conta serão encerradas.'),
    ).toBeTruthy();
    await digitar('Nova senha', 'senha-longa-1');
    await digitar('Confirmar senha', 'senha-longa-1');
    await tocar('Salvar nova senha');
    await waitFor(() =>
      expect(chamadas.some((c) => c.caminho === '/v1/acesso/redefinir-senha')).toBe(true),
    );
  });

  test('o título da barra segue a finalidade', async () => {
    await renderizar(CriarSenha, { fluxo });
    expect(mockRoteador.titulo).toBe('Criar senha');
    await renderizar(CriarSenha, { fluxo: { ...fluxo, finalidade: 'recuperacao_senha' } });
    expect(mockRoteador.titulo).toBe('Nova senha');
  });

  test('sem fluxo em andamento volta às boas-vindas', async () => {
    await renderizar(CriarSenha);
    expect(screen.getByText('redirecionou:/boas-vindas')).toBeTruthy();
  });
});

describe('Abertura do app com a renovação recusada', () => {
  const guarda = () => (
    <GuardaDeSessao exige="anonima">
      <></>
    </GuardaDeSessao>
  );

  test('429 mostra o texto de limite com o tempo do Retry-After', async () => {
    await renderizar(guarda, {
      logado: true,
      rotas: {
        'POST /v1/acesso/renovar': () => erro(429, 'LIMITE', 'x', { 'Retry-After': '120' }),
      },
    });
    expect(await screen.findByText('Muitas tentativas')).toBeTruthy();
    expect(screen.getByText(/Muitas tentativas em pouco tempo\..*cerca de 2 min\./)).toBeTruthy();
    expect(screen.queryByText('Sem conexão com a API')).toBeNull();
  });

  test('403 ORIGEM_NAO_PERMITIDA mostra o texto do contrato', async () => {
    await renderizar(guarda, {
      logado: true,
      rotas: { 'POST /v1/acesso/renovar': () => erro(403, 'ORIGEM_NAO_PERMITIDA') },
    });
    expect(
      await screen.findByText('Não foi possível concluir a operação por este endereço.'),
    ).toBeTruthy();
  });

  test('sem internet continua como sem conexão', async () => {
    await renderizar(guarda, {
      logado: true,
      rotas: {
        'POST /v1/acesso/renovar': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    expect(await screen.findByText('Sem conexão com a API')).toBeTruthy();
  });
});
