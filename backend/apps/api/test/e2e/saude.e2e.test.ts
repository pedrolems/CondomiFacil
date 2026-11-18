import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { validarComum } from '@condomifacil/shared-types';
import request from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { ApiModule, configurarApp } from '../../src/api.module.js';
import { lerConfig } from '../../src/compartilhado/config/config.js';

let app: INestApplication;
const origem = 'http://localhost:8081';

beforeAll(async () => {
  const mod = await Test.createTestingModule({ imports: [ApiModule] }).compile();
  app = mod.createNestApplication();
  configurarApp(app, lerConfig({ APP_ENV: 'dev', PORT: '3000', CORS_ALLOWED_ORIGINS: origem }));
  await app.init();
});
afterAll(() => app.close());

test('GET /v1/saude responde 200 conforme SaudeComum, sem autenticação', async () => {
  const res = await request(app.getHttpServer()).get('/v1/saude');
  expect(res.status).toBe(200);
  expect(validarComum('res_comumConsultarSaude_200', res.body)).toEqual({ valido: true });
  expect(res.headers['x-request-id']).toMatch(/^req_/);
  expect(res.headers['x-powered-by']).toBeUndefined();
});

test('CORS libera só a origem configurada', async () => {
  const ok = await request(app.getHttpServer()).get('/v1/saude').set('Origin', origem);
  expect(ok.headers['access-control-allow-origin']).toBe(origem);
  const outra = await request(app.getHttpServer()).get('/v1/saude').set('Origin', 'http://x.test');
  expect(outra.headers['access-control-allow-origin']).toBeUndefined();
});
