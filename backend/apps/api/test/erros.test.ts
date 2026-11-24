// Critério 1 do RM-24: todo erro valida contra o esquema Erro e carrega o X-Request-Id como request_id.
import { Controller, Get, Param, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validarComum } from '@condomifacil/shared-types';
import request from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { configurarApp } from '../src/api.module.js';
import { lerConfig } from '../src/compartilhado/config/config.js';
import {
  ChaveDeIdempotenciaReutilizada,
  Conflito,
  RecursoNaoEncontrado,
  RequisicaoInvalida,
  SemPermissao,
} from '../src/compartilhado/erros/index.js';
import { LoggerJson } from '../src/compartilhado/logger/index.js';

// Só de teste: não está no ApiModule.
@Controller('v1/teste-erros')
class ErrosController {
  @Get(':tipo')
  falhar(@Param('tipo') tipo: string): never {
    switch (tipo) {
      case '400':
        throw new RequisicaoInvalida([{ campo: 'nome', mensagem: 'Obrigatório.' }]);
      case '403':
        throw new SemPermissao('síndico');
      case '404':
        throw new RecursoNaoEncontrado();
      case '409':
        throw new Conflito();
      case '422':
        throw new ChaveDeIdempotenciaReutilizada();
      default:
        throw new Error('falha interna com segredo-do-banco e fulana@exemplo.test');
    }
  }
}

let app: INestApplication;
const linhas: string[] = [];

beforeAll(async () => {
  const mod = await Test.createTestingModule({ controllers: [ErrosController] }).compile();
  app = mod.createNestApplication();
  configurarApp(
    app,
    lerConfig({ APP_ENV: 'dev', PORT: '3000' }),
    new LoggerJson((l) => linhas.push(l)),
  );
  await app.init();
});
afterAll(() => app.close());

test.each([
  ['400', 400, 'REQUISICAO_INVALIDA'],
  ['403', 403, 'SEM_PERMISSAO'],
  ['404', 404, 'RECURSO_NAO_ENCONTRADO'],
  ['409', 409, 'CONFLITO_DADO_ALTERADO'],
  ['422', 422, 'CHAVE_DE_IDEMPOTENCIA_REUTILIZADA'],
  ['500', 500, 'ERRO_INTERNO'],
])(
  'erro %s sai no formato Erro, com request_id igual ao cabeçalho',
  async (tipo, status, codigo) => {
    const res = await request(app.getHttpServer()).get(`/v1/teste-erros/${tipo}`);
    expect(res.status).toBe(status);
    expect(validarComum('Erro', res.body)).toEqual({ valido: true });
    expect(res.body.codigo).toBe(codigo);
    expect(res.body.request_id).toBe(res.headers['x-request-id']);
  },
);

test('500 não vaza mensagem interna nem stack, nem no corpo nem no log', async () => {
  const res = await request(app.getHttpServer()).get('/v1/teste-erros/500');
  const corpo = JSON.stringify(res.body);
  expect(corpo).not.toMatch(/segredo-do-banco|fulana|stack|at /);
  const log = linhas.join('\n');
  expect(log).toContain('erro_interno');
  expect(log).not.toMatch(/fulana@exemplo\.test/);
});

test('rota inexistente e JSON malformado também usam o formato padrão', async () => {
  const nao = await request(app.getHttpServer()).get('/v1/nao-existe');
  expect(nao.status).toBe(404);
  expect(validarComum('Erro', nao.body)).toEqual({ valido: true });
  const ruim = await request(app.getHttpServer())
    .post('/v1/teste-erros/400')
    .set('Content-Type', 'application/json')
    .send('{quebrado');
  expect(ruim.status).toBe(400);
  expect(validarComum('Erro', ruim.body)).toEqual({ valido: true });
  expect(ruim.body.codigo).toBe('REQUISICAO_INVALIDA');
});

test('corpo de 200 KB responde 413 no formato padrão, nunca 500', async () => {
  const res = await request(app.getHttpServer())
    .post('/v1/teste-erros/400')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ x: 'a'.repeat(200 * 1024) }));
  expect(res.status).toBe(413);
  expect(res.body.codigo).toBe('REQUISICAO_INVALIDA');
  expect(validarComum('Erro', res.body)).toEqual({ valido: true });
  expect(res.body.request_id).toBe(res.headers['x-request-id']);
});
