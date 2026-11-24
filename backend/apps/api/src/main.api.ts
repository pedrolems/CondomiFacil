import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiComBancoModule, configurarApp } from './api.module.js';
import { lerConfig } from './compartilhado/config/config.js';
import { lerConfigAcesso } from './modulos/autenticacao/index.js';

// DATABASE_URL é do app_user e DATABASE_AUTH_URL do app_autenticacao (nunca do migrador nem dono).
function opcoesDoBanco(nome: string, invalidas: string[]) {
  try {
    const u = new URL(process.env[nome] ?? '');
    return {
      host: u.hostname,
      port: Number(u.port || 5432),
      database: u.pathname.slice(1),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    };
  } catch {
    invalidas.push(nome);
    return {};
  }
}

async function iniciar(): Promise<void> {
  let config, acesso;
  const invalidas: string[] = [];
  const banco = opcoesDoBanco('DATABASE_URL', invalidas);
  const bancoAutenticacao = opcoesDoBanco('DATABASE_AUTH_URL', invalidas);
  try {
    config = lerConfig();
    acesso = lerConfigAcesso();
    if (invalidas.length > 0) {
      throw new Error(`Configuração inválida ou ausente: ${invalidas.join(', ')}`);
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
  const app = await NestFactory.create(
    ApiComBancoModule.registrar({ acesso, banco, bancoAutenticacao }),
  );
  app.enableShutdownHooks();
  configurarApp(app, config);
  await app.listen(config.PORT);
}

void iniciar();
