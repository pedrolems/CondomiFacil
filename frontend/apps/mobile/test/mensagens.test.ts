import {
  ErroApi,
  ErroDeRede,
  RespostaForaDoContrato,
  SessaoEncerrada,
} from '../src/infraestrutura/api/erros';
import {
  falhaDeRestauracao,
  segundosDePausa,
  segundosDePausaDeCodigo,
  tentativasRestantes,
  textoDoErro,
} from '../src/modulos/acesso/mensagens';

const api = (status: number, codigo: string, mensagem = '', espera?: number) =>
  new ErroApi(status, codigo, mensagem, 'req_1', espera);

test.each([
  [
    api(422, 'CODIGO_INCORRETO', 'Código incorreto. Você tem mais 3 tentativas.'),
    'Código incorreto. Você tem mais 3 tentativas.',
  ],
  [
    api(422, 'CODIGO_INCORRETO', 'Código incorreto. Você tem mais 1 tentativa.'),
    'Código incorreto. Você tem mais 1 tentativa.',
  ],
  [api(422, 'CODIGO_INVALIDO_OU_VENCIDO'), 'Este código não vale mais. Peça um novo.'],
  [api(429, 'CODIGO_REENVIO_ANTECIPADO'), 'Você poderá pedir um novo código em instantes.'],
  [
    api(429, 'ACESSO_PAUSADO'),
    'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.',
  ],
  [
    api(403, 'ACESSO_ENCERRADO'),
    'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.',
  ],
  [
    api(429, 'CODIGO_PAUSADO'),
    'Por segurança, novos códigos foram pausados por 24 horas. Tente de novo mais tarde.',
  ],
  [api(401, 'CREDENCIAIS_INVALIDAS'), 'E-mail ou senha incorretos.'],
  [api(422, 'SENHA_ATUAL_INCORRETA'), 'Senha atual incorreta.'],
  [
    api(422, 'ACEITE_VERSAO_DESATUALIZADA'),
    'Este documento foi atualizado. Leia a nova versão para aceitar.',
  ],
  [api(403, 'ORIGEM_NAO_PERMITIDA'), 'Não foi possível concluir a operação por este endereço.'],
  [api(429, 'OUTRO_CODIGO'), 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.'],
  [api(500, 'ERRO_INTERNO'), 'Algo deu errado do nosso lado. Tente de novo em alguns minutos.'],
  [new ErroDeRede('x'), 'Não foi possível conectar. Verifique a internet e tente de novo.'],
  [new SessaoEncerrada(), 'Por segurança, entre de novo na sua conta.'],
  [
    new RespostaForaDoContrato('x'),
    'Algo deu errado do nosso lado. Tente de novo em alguns minutos.',
  ],
  [new Error('qualquer'), 'Algo deu errado do nosso lado. Tente de novo em alguns minutos.'],
])('texto do erro %#', (erro, texto) => {
  expect(textoDoErro(erro)).toBe(texto);
});

test('a pausa da troca de senha tem texto próprio', () => {
  expect(textoDoErro(api(429, 'ACESSO_PAUSADO'), 'troca-de-senha')).toBe(
    'Por segurança, a troca de senha foi pausada por 15 minutos. Você pode redefinir a senha agora.',
  );
});

test('o texto nunca depende da mensagem do servidor, que pode vir em outro tom', () => {
  expect(textoDoErro(api(401, 'CREDENCIAIS_INVALIDAS', 'mensagem do servidor'))).toBe(
    'E-mail ou senha incorretos.',
  );
});

test('tentativas restantes e pausa vêm do erro', () => {
  expect(
    tentativasRestantes(
      api(422, 'CODIGO_INCORRETO', 'Código incorreto. Você tem mais 2 tentativas.'),
    ),
  ).toBe(2);
  expect(tentativasRestantes(api(422, 'OUTRO'))).toBeUndefined();
  expect(segundosDePausa(api(429, 'ACESSO_PAUSADO', '', 120))).toBe(120);
  expect(segundosDePausa(api(429, 'ACESSO_PAUSADO'))).toBe(900);
  expect(segundosDePausa(api(429, 'OUTRO'))).toBeUndefined();
});

test('pausa de códigos usa o Retry-After e, sem ele, 24 h', () => {
  expect(segundosDePausaDeCodigo(api(429, 'CODIGO_PAUSADO', '', 600))).toBe(600);
  expect(segundosDePausaDeCodigo(api(429, 'CODIGO_PAUSADO'))).toBe(86_400);
  expect(segundosDePausaDeCodigo(api(429, 'ACESSO_PAUSADO'))).toBeUndefined();
});

test('falha ao restaurar a sessão explica a causa certa', () => {
  expect(falhaDeRestauracao(new ErroDeRede('x')).tipo).toBe('rede');
  const limite = falhaDeRestauracao(api(429, 'LIMITE_DE_TAXA_EXCEDIDO', '', 120));
  expect(limite.tipo).toBe('limite');
  expect(limite.descricao).toBe(
    'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo. Espere cerca de 2 min.',
  );
  expect(falhaDeRestauracao(api(403, 'ORIGEM_NAO_PERMITIDA'))).toMatchObject({
    tipo: 'origem',
    descricao: 'Não foi possível concluir a operação por este endereço.',
  });
  expect(falhaDeRestauracao(api(503, 'INDISPONIVEL')).tipo).toBe('inesperado');
});
