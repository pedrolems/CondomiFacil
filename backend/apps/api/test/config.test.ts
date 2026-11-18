import { expect, test } from 'vitest';
import { lerConfig } from '../src/compartilhado/config/config.js';

test('aceita configuração mínima', () => {
  expect(lerConfig({ APP_ENV: 'dev', PORT: '3000' })).toEqual({
    APP_ENV: 'dev',
    PORT: 3000,
    CORS_ALLOWED_ORIGINS: [],
  });
});

test('falha sem variável obrigatória, citando o nome', () => {
  expect(() => lerConfig({ APP_ENV: 'dev' })).toThrow(/PORT/);
  expect(() => lerConfig({ PORT: '3000' })).toThrow(/APP_ENV/);
});

test('a mensagem de erro não expõe valores', () => {
  expect(() => lerConfig({ APP_ENV: 'segredo-xyz', PORT: '3000' })).toThrow(
    expect.objectContaining({ message: expect.not.stringContaining('segredo-xyz') }),
  );
});

test('rejeita origem CORS inválida', () => {
  expect(() => lerConfig({ APP_ENV: 'dev', PORT: '3000', CORS_ALLOWED_ORIGINS: '*' })).toThrow(
    /CORS_ALLOWED_ORIGINS/,
  );
});
