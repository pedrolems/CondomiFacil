import { expect, test } from 'vitest';
import { lerConfig } from '../src/compartilhado/config/config.js';
import { LimiteDeTaxaExcedido } from '../src/compartilhado/erros/index.js';
import {
  AcessoPausado,
  CodigoPausado,
  CodigoReenvioAntecipado,
} from '../src/modulos/autenticacao/erros.js';
import { lerConfigAcesso } from '../src/modulos/autenticacao/index.js';

const ok = {
  JWT_SIGNING_KEY: 'a'.repeat(40),
  IDENTITY_HMAC_KEY: 'b'.repeat(40),
  JWT_ISSUER: 'emissor',
  JWT_AUDIENCE: 'audiencia',
  CORS_ALLOWED_ORIGINS: 'http://web.exemplo.test/',
};

test('lê a configuração do acesso e normaliza as origens', () => {
  const c = lerConfigAcesso(ok);
  expect(c.origensWeb).toEqual(['http://web.exemplo.test']);
  expect(c.ttlAcessoSegundos).toBe(900);
  expect(c.validadeSessaoDias).toBe(30);
  expect(c.tetoSessaoDias).toBe(90);
  expect(c.limiteIpPorMinuto).toBe(60);
  expect(c.limiteEmailPorMinuto).toBe(10);
});

test('recusa subir sem segredo, com chave curta ou igual, citando só os nomes', () => {
  expect(() => lerConfigAcesso({})).toThrow(/JWT_SIGNING_KEY.*IDENTITY_HMAC_KEY/);
  expect(() => lerConfigAcesso({ ...ok, JWT_ISSUER: '' })).toThrow(/JWT_ISSUER/);
  expect(() => lerConfigAcesso({ ...ok, JWT_AUDIENCE: undefined })).toThrow(/JWT_AUDIENCE/);
  expect(() => lerConfigAcesso({ ...ok, JWT_SIGNING_KEY: 'curta-demais' })).toThrow(
    expect.objectContaining({ message: expect.not.stringContaining('curta-demais') }),
  );
  expect(() => lerConfigAcesso({ ...ok, IDENTITY_HMAC_KEY: ok.JWT_SIGNING_KEY })).toThrow(
    /IDENTITY_HMAC_KEY/,
  );
  expect(() => lerConfigAcesso({ ...ok, CORS_ALLOWED_ORIGINS: '*' })).toThrow(
    /CORS_ALLOWED_ORIGINS/,
  );
  expect(() => lerConfigAcesso({ ...ok, RATE_LIMIT_IP_PER_MIN: '0' })).toThrow(
    /RATE_LIMIT_IP_PER_MIN/,
  );
});

test('a lista de origens do acesso é a mesma do CORS (mesmo normalizador)', () => {
  const env = {
    ...ok,
    CORS_ALLOWED_ORIGINS: 'http://web.exemplo.test/,HTTP://web.exemplo.test:80',
  };
  expect(lerConfigAcesso(env).origensWeb).toEqual(
    lerConfig({ APP_ENV: 'dev', PORT: '3000', CORS_ALLOWED_ORIGINS: env.CORS_ALLOWED_ORIGINS })
      .CORS_ALLOWED_ORIGINS,
  );
});

test('o 429 de limite de taxa leva Retry-After', () => {
  expect(new LimiteDeTaxaExcedido(42).cabecalhos).toEqual({ 'Retry-After': '42' });
  expect(new LimiteDeTaxaExcedido().cabecalhos).toBeUndefined();
});

test('Retry-After sempre em segundos inteiros, para cima e nunca 0', () => {
  const ra = (e: { cabecalhos?: Record<string, string> }) => e.cabecalhos?.['Retry-After'];
  expect(ra(new LimiteDeTaxaExcedido(0.2))).toBe('1');
  expect(ra(new LimiteDeTaxaExcedido(0))).toBe('1');
  expect(ra(new LimiteDeTaxaExcedido(42.1))).toBe('43');
  expect(ra(new AcessoPausado('acesso', 899.4))).toBe('900');
  expect(ra(new CodigoPausado(0.5))).toBe('1');
  expect(ra(new CodigoReenvioAntecipado(59.01))).toBe('60');
});
