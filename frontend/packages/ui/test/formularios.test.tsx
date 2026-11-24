import { useState, type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Clock } from 'lucide-react-native';
import {
  Banner,
  Checklist,
  Choice,
  CodeField,
  ListRow,
  PasswordField,
  TextField,
  ThemeProvider,
} from '../src';

const comTema = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TextField', () => {
  test('o nome acessível é o rótulo e o texto digitado chega ao pai', async () => {
    const onChangeText = jest.fn();
    await comTema(<TextField rotulo="E-mail" valor="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@email.com');
    expect(onChangeText).toHaveBeenCalledWith('ana@email.com');
  });

  test('erro aparece com ícone e texto anunciado (alert) no lugar da ajuda', async () => {
    await comTema(
      <TextField rotulo="E-mail" valor="x" ajuda="Dica" erro="Informe um e-mail válido." />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um e-mail válido.');
    expect(screen.queryByText('Dica')).toBeNull();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
  });

  test('o campo leva o erro (ou a ajuda) como descrição para o leitor repetir', async () => {
    const { rerender } = await comTema(
      <TextField rotulo="E-mail" valor="x" ajuda="Dica" erro="Informe um e-mail válido." />,
    );
    expect(screen.getByLabelText('E-mail').props.accessibilityHint).toBe(
      'Informe um e-mail válido.',
    );
    await rerender(
      <ThemeProvider>
        <TextField rotulo="E-mail" valor="x" ajuda="Dica" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('E-mail').props.accessibilityHint).toBe('Dica');
  });
});

describe('PasswordField', () => {
  test('mostrar e ocultar trocam o nome do botão e a visibilidade', async () => {
    await comTema(
      <PasswordField
        rotulo="Senha"
        valor="segredo"
        autoComplete="current-password"
        onChangeText={() => {}}
      />,
    );
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
  });
});

describe('CodeField', () => {
  test('aceita só dígitos, no máximo 6, com preenchimento automático de código', async () => {
    const onChangeText = jest.fn();
    await comTema(<CodeField rotulo="Código" valor="" onChangeText={onChangeText} />);
    const campo = screen.getByLabelText('Código');
    expect(campo.props.maxLength).toBe(6);
    expect(campo.props.autoComplete).toBe('one-time-code');
    expect(campo.props.inputMode).toBe('numeric');
    await fireEvent.changeText(campo, '48a3-92047');
    expect(onChangeText).toHaveBeenCalledWith('483920');
  });
});

describe('Checklist', () => {
  test('cada item diz o estado em texto, além do ícone', async () => {
    const itens = [
      { texto: 'Pelo menos 8 caracteres', atendido: true },
      { texto: 'Confirmação igual à senha', atendido: false },
    ];
    const { rerender } = await comTema(<Checklist itens={itens} />);
    expect(screen.getByLabelText('Pelo menos 8 caracteres: atendido')).toBeTruthy();
    expect(screen.getByLabelText('Confirmação igual à senha: pendente')).toBeTruthy();
    await rerender(
      <ThemeProvider>
        <Checklist itens={itens} tentou />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('Confirmação igual à senha: não atendido')).toBeTruthy();
  });
});

describe('Choice', () => {
  test('caixa expõe o estado marcado e alterna ao tocar', async () => {
    function Exemplo() {
      const [marcado, setMarcado] = useState(false);
      return (
        <Choice
          tipo="checkbox"
          rotulo="Li e aceito"
          marcado={marcado}
          onChange={() => setMarcado(!marcado)}
        />
      );
    }
    await comTema(<Exemplo />);
    expect(screen.getByRole('checkbox', { name: 'Li e aceito' })).not.toBeChecked();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Li e aceito' }));
    expect(screen.getByRole('checkbox', { name: 'Li e aceito' })).toBeChecked();
  });

  test('a descrição chega ao leitor como dica, sem repetir o rótulo', async () => {
    await comTema(
      <Choice tipo="checkbox" rotulo="Li" descricao="Termos de uso" marcado onChange={() => {}} />,
    );
    expect(screen.getByRole('checkbox', { name: 'Li' }).props.accessibilityHint).toBe(
      'Termos de uso',
    );
  });

  test('opção única usa o papel radio', async () => {
    await comTema(<Choice tipo="radio" rotulo="Escuro" marcado onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
  });
});

describe('Banner e ListRow', () => {
  test('banner traz ícone e texto, e a ação opcional', async () => {
    const onPress = jest.fn();
    await comTema(
      <Banner
        tom="warning"
        icone={Clock}
        texto="Acesso pausado."
        acao={{ rotulo: 'Esqueci minha senha', onPress }}
        anunciar
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Acesso pausado.');
    expect(
      screen.getByTestId('icone-banner-warning', { includeHiddenElements: true }),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('linha de menu é um botão com o título', async () => {
    const onPress = jest.fn();
    await comTema(<ListRow icone={Clock} titulo="Sessões" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sessões' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
