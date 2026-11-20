import 'reflect-metadata';
import { Module, type INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AcessoController, EuController, RecursosController } from './controllers.ts';
import { AutenticacaoGuard, ContextoGuard } from './guards.ts';
import { CONFIG, DB, RELOGIO, criarDb, relogioReal, configPadrao, type Config, type Relogio } from './infra.ts';
import { PapelService } from './papel.service.ts';
import { CHAVEIRO, SessoesService } from './sessoes.service.ts';
import { Chaveiro } from './tokens.ts';

export interface Dependencias { config?: Partial<Config>; relogio?: Relogio; chaveiro: Chaveiro }

/** Monta a API da PoC. Devolve tambem as pecas que os testes inspecionam. */
export async function criarApp(dep: Dependencias): Promise<{ app: INestApplication; papel: PapelService; config: Config; encerrar: () => Promise<void> }> {
  const config = { ...configPadrao, ...dep.config };
  const { db, encerrar } = criarDb();
  @Module({
    controllers: [AcessoController, EuController, RecursosController],
    providers: [
      { provide: DB, useValue: db }, { provide: CONFIG, useValue: config }, { provide: RELOGIO, useValue: dep.relogio ?? relogioReal },
      { provide: CHAVEIRO, useValue: dep.chaveiro }, SessoesService, PapelService, AutenticacaoGuard, ContextoGuard, Reflector,
    ],
  })
  class ApiModule {}
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, { logger: false });
  app.disable('x-powered-by');
  // CORS restrito as origens da web, com credenciais (cookie). Nunca '*'.
  app.enableCors({ origin: config.origensWeb, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['content-type', 'authorization', 'x-condominio-id', 'x-condomifacil-web'] });
  await app.init();
  return { app, papel: app.get(PapelService), config, encerrar: async () => { await app.close(); await encerrar(); } };
}
