import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiModule, configurarApp } from './api.module.js';
import { lerConfig } from './compartilhado/config/config.js';

async function iniciar(): Promise<void> {
  let config;
  try {
    config = lerConfig();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
  const app = await NestFactory.create(ApiModule);
  configurarApp(app, config);
  await app.listen(config.PORT);
}

void iniciar();
