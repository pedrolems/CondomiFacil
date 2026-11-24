import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@condomifacil/ui';
import TelaSaude from '../src/app/saude';
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

const renderizar = () =>
  render(
    <ThemeProvider>
      <TelaSaude />
    </ThemeProvider>,
  );

test('carregando', async () => {
  consultar.mockReturnValue(new Promise(() => {}));
  await renderizar();
  expect(screen.getByText('Consultando a API…')).toBeTruthy();
});

test.each([
  [
    () => Promise.resolve({ estado: 'disponivel' as const, versao: '0.1.0' }),
    'success',
    'circle-check',
    'API disponível',
    'Versão da API: 0.1.0',
  ],
  [
    () => Promise.reject(new ApiIndisponivel('HTTP 503')),
    'warning',
    'triangle-alert',
    'API indisponível',
    'O servidor respondeu, mas não está pronto. Tente novamente em instantes.',
  ],
  [
    () => Promise.reject(new ErroDeRede('x')),
    'warning',
    'wifi-off',
    'Sem conexão com a API',
    'Verifique a internet e o endereço configurado.',
  ],
  [
    () => Promise.reject(new RespostaForaDoContrato('x')),
    'danger',
    'circle-x',
    'Resposta inesperada da API',
    'O servidor respondeu em um formato que o aplicativo não reconhece.',
  ],
])('estado final com ícone e texto: %#', async (resultado, tom, icone, titulo, descricao) => {
  consultar.mockImplementation(resultado);
  await renderizar();
  expect(await screen.findByText(titulo)).toBeTruthy();
  expect(screen.getByText(descricao)).toBeTruthy();
  const svg = screen.getByTestId(`icone-${tom}`, { includeHiddenElements: true });
  expect(svg.props.className).toContain(`lucide-${icone}`);
  expect(screen.queryAllByRole('button', { name: 'Tentar de novo' })).toHaveLength(
    tom === 'success' ? 0 : 1,
  );
});
