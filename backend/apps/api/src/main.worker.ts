// Ponto de entrada do worker, sem servidor HTTP: despachante do outbox (E13).
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Despachante } from './compartilhado/outbox/despachante.js';
import { WorkerModule } from './worker.module.js';

// DATABASE_URL é sempre do app_user (nunca do migrador nem dono); só localhost em dev.
function opcoesDoBanco(url: string | undefined) {
  if (!url) {
    console.error('Configuração inválida ou ausente: DATABASE_URL');
    process.exit(1);
  }
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.slice(1),
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  };
}

async function iniciar(): Promise<void> {
  const app = await NestFactory.createApplicationContext(
    WorkerModule.registrar(opcoesDoBanco(process.env.DATABASE_URL)),
  );
  app.enableShutdownHooks();
  const despachante = app.get(Despachante);
  process.once('SIGTERM', () => despachante.parar());
  await despachante.iniciar();
  await app.close();
}

void iniciar();
