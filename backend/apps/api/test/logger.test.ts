import { randomUUID } from 'node:crypto';
import { expect, test } from 'vitest';
import { LoggerJson, mascararTexto, sanitizar } from '../src/compartilhado/logger/index.js';

test('remove campos proibidos em qualquer profundidade e mascara dado pessoal em texto', () => {
  const saida = JSON.stringify(
    sanitizar({
      request_id: 'req_1',
      usuario: {
        Nome: 'Fulana Ficticia',
        contatos: [{ e_mail: 'a@b.test', telefone: '11999998888' }],
      },
      senha: 'x',
      erro: new Error(
        'falhou para fulana@exemplo.test cpf 123.456.789-09 de Fulana com Bearer abc.def.ghi',
      ),
    }),
  );
  expect(saida).toContain('req_1');
  expect(saida).not.toMatch(/Fulana|a@b\.test|11999998888|fulana@|123\.456|abc\.def/);
});

test('uma linha JSON por evento, com os campos informados', () => {
  const linhas: string[] = [];
  new LoggerJson((l) => linhas.push(l)).info('requisicao', { rota: '/v1/x', duracao_ms: 3 });
  expect(JSON.parse(linhas[0]!)).toMatchObject({
    nivel: 'info',
    evento: 'requisicao',
    rota: '/v1/x',
    duracao_ms: 3,
  });
});

test('UUID não é alterado (10.000 amostras, isolados e dentro de texto) e Date vira ISO', () => {
  for (let i = 0; i < 10_000; i++) {
    const id = randomUUID();
    expect(sanitizar(id)).toBe(id);
    expect(mascararTexto(`id ${id} ok`)).toBe(`id ${id} ok`);
  }
  const d = new Date('2026-11-23T10:00:00.000Z');
  expect(sanitizar({ criada_em: d })).toEqual({ criada_em: '2026-11-23T10:00:00.000Z' });
});

test('telefones reais continuam mascarados', () => {
  for (const t of [
    '(11) 99999-8888',
    '11 99999-8888',
    '11999998888',
    '+55 11 99999-8888',
    '(11) 3333-4444',
  ]) {
    expect(mascararTexto(`ligar ${t} hoje`), t).toBe('ligar [telefone] hoje');
  }
});

test('chaves que contêm termos proibidos são removidas', () => {
  const saida = sanitizar({
    nome_completo: 'a',
    nomeSocial: 'b',
    nome_morador: 'c',
    email_destinatario: 'd',
    estado: 'ok',
  });
  expect(saida).toEqual({
    nome_completo: '[removido]',
    nomeSocial: '[removido]',
    nome_morador: '[removido]',
    email_destinatario: '[removido]',
    estado: 'ok',
  });
});
