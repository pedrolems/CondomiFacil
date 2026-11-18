import {
  ApiIndisponivel,
  ErroDeRede,
  RespostaForaDoContrato,
  consultarSaude,
} from '../src/infraestrutura/api/saude';

const responder = (status: number, corpo: unknown) =>
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(corpo), { status }));

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = 'http://api.teste';
});
afterEach(() => jest.restoreAllMocks());

test('aceita o corpo conforme SaudeComum e chama GET /v1/saude', async () => {
  const fetchMock = responder(200, { estado: 'disponivel', versao: '0.1.0' });
  await expect(consultarSaude()).resolves.toEqual({ estado: 'disponivel', versao: '0.1.0' });
  expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.teste/v1/saude');
});

test('rejeita resposta fora do contrato', async () => {
  responder(200, { estado: 'quebrado', versao: 1 });
  await expect(consultarSaude()).rejects.toBeInstanceOf(RespostaForaDoContrato);
});

test('503 vira ApiIndisponivel e falha de conexão vira ErroDeRede', async () => {
  responder(503, {});
  await expect(consultarSaude()).rejects.toBeInstanceOf(ApiIndisponivel);
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Network request failed'));
  await expect(consultarSaude()).rejects.toBeInstanceOf(ErroDeRede);
});
