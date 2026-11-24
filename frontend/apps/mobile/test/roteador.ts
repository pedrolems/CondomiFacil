// Dublê do expo-router para os testes de tela: registra a navegação em vez de executá-la.
export const mockRoteador: {
  push: jest.Mock;
  back: jest.Mock;
  replace: jest.Mock;
  titulo?: string;
} = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
export const mockParametros: Record<string, string> = {};
