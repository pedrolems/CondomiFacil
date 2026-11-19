import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { dark, light } from '@condomifacil/design-tokens';
import { WifiOff } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Button, StatusView, ThemeProvider, useTheme, type PreferenciaDeTema } from '../src';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));
const esquemaDoAparelho = jest.mocked(useColorScheme);

const comTema = (ui: ReactElement, preferencia?: PreferenciaDeTema) =>
  render(<ThemeProvider preferencia={preferencia}>{ui}</ThemeProvider>);

describe('Button', () => {
  test('carregando mantém o texto, marca ocupado e não dispara onPress', async () => {
    const onPress = jest.fn();
    await comTema(<Button rotulo="Registrar entrada" onPress={onPress} carregando />);
    const botao = screen.getByRole('button', { name: 'Registrar entrada' });
    expect(botao).toBeBusy();
    fireEvent.press(botao);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('desabilitado mostra o motivo e não dispara onPress', async () => {
    const onPress = jest.fn();
    await comTema(
      <Button
        rotulo="Decidir"
        onPress={onPress}
        desabilitado
        motivoDesabilitado="Registre a conversa com o morador antes de decidir."
      />,
    );
    expect(screen.getByText('Registre a conversa com o morador antes de decidir.')).toBeTruthy();
    const botao = screen.getByRole('button', { name: 'Decidir' });
    expect(botao).toBeDisabled();
    fireEvent.press(botao);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('habilitado dispara onPress', async () => {
    const onPress = jest.fn();
    await comTema(<Button rotulo="Tentar de novo" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('StatusView', () => {
  test.each([
    ['success', 'circle-check', light.success.fg],
    ['warning', 'triangle-alert', light.warning.fg],
    ['danger', 'circle-x', light.danger.fg],
    ['info', 'info', light.info.fg],
  ] as const)('tom %s: ícone %s na cor do tom, com título', async (tom, icone, cor) => {
    await comTema(<StatusView tom={tom} titulo="Título" descricao="Descrição" />);
    expect(screen.getByRole('header', { name: 'Título' })).toBeTruthy();
    expect(screen.getByText('Descrição')).toBeTruthy();
    const svg = screen.getByTestId(`icone-${tom}`, { includeHiddenElements: true });
    expect(svg.props.className).toContain(`lucide-${icone}`);
    expect(svg.props.stroke ?? svg.props.color).toBe(cor);
    // Decorativo: fora da árvore do leitor de tela.
    expect(screen.queryByTestId(`icone-${tom}`)).toBeNull();
  });

  test('aceita outro ícone (sem internet) e a ação primária', async () => {
    const onPress = jest.fn();
    await comTema(
      <StatusView
        tom="warning"
        icone={WifiOff}
        titulo="Sem conexão com a API"
        acao={{ rotulo: 'Tentar de novo', onPress }}
      />,
    );
    const svg = screen.getByTestId('icone-warning', { includeHiddenElements: true });
    expect(svg.props.className).toContain('lucide-wifi-off');
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('carregando mostra o título', async () => {
    await comTema(<StatusView carregando titulo="Consultando a API…" />);
    expect(screen.getByRole('header', { name: 'Consultando a API…' })).toBeTruthy();
  });
});

describe('ThemeProvider', () => {
  let esquema: string | undefined;
  function Sonda() {
    esquema = useTheme().tema === dark ? 'escuro' : 'claro';
    return null;
  }

  test('preferencia escuro usa o tema escuro mesmo com o aparelho no claro', async () => {
    esquemaDoAparelho.mockReturnValue('light');
    await comTema(<Sonda />, 'escuro');
    expect(esquema).toBe('escuro');
  });

  test.each([
    ['dark', 'escuro'],
    ['light', 'claro'],
  ] as const)('sistema segue o aparelho (%s)', async (aparelho, esperado) => {
    esquemaDoAparelho.mockReturnValue(aparelho);
    await comTema(<Sonda />, 'sistema');
    expect(esquema).toBe(esperado);
  });

  test('useTheme fora do provedor falha', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Sonda />)).rejects.toThrow('ThemeProvider');
  });
});
