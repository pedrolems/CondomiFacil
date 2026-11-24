import { Module } from '@nestjs/common';
import { AceitesServico } from './aplicacao/aceites.servico.js';
import { PerfilServico } from './aplicacao/perfil.servico.js';

// Usa o TenantContext do TenantModule global (app_user).
@Module({ providers: [AceitesServico, PerfilServico], exports: [AceitesServico, PerfilServico] })
export class AcessoModule {}
