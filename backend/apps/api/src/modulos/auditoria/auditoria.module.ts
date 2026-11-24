import { Module } from '@nestjs/common';
import { AuditoriaServico } from './aplicacao/auditoria.servico.js';

@Module({ providers: [AuditoriaServico], exports: [AuditoriaServico] })
export class AuditoriaModule {}
