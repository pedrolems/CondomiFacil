import { render, screen } from '@testing-library/react-native';
import TelaSaude from '../src/app/index';
import {
  consultarSaude,
  ApiIndisponivel,
  ErroDeRede,
  RespostaForaDoContrato,
} from '../src/infraestrutura/api/saude';

jest.mock('../src/infraestrutura/api/saude', () => ({
  ...jest.requireActual('../src/infraestrutura/api/saude'),
  consultarSaude: jest.fn(),
}));
const consultar = jest.mocked(consultarSaude);

test('carregando', async () => {
  consultar.mockReturnValue(new Promise(() => {}));
  await render(<TelaSaude />);
  expect(screen.getByText('Consultando a API…')).toBeTruthy();
});

test.each([
  [
    () => Promise.resolve({ estado: 'disponivel' as const, versao: '0.1.0' }),
    '✔',
    'API disponível',
  ],
  [() => Promise.reject(new ApiIndisponivel('HTTP 503')), '⚠', 'API indisponível'],
  [() => Promise.reject(new ErroDeRede('x')), '✖', 'Sem conexão com a API'],
  [() => Promise.reject(new RespostaForaDoContrato('x')), '⚠', 'Resposta inesperada da API'],
])('estado final com ícone e texto: %#', async (resultado, icone, titulo) => {
  consultar.mockImplementation(resultado);
  await render(<TelaSaude />);
  expect(await screen.findByText(titulo)).toBeTruthy();
  expect(screen.getByText(icone, { includeHiddenElements: true })).toBeTruthy();
});
