import { Global, Module } from '@nestjs/common';
import { MAILER } from '../../compartilhado/portas/index.js';
import { CaixaDeSaidaFalsa } from './caixa-de-saida-falsa.mailer.js';

// E14: só a caixa falsa na fase 2. O adaptador do Resend entra no lugar, pela mesma porta.
@Global()
@Module({
  providers: [{ provide: MAILER, useClass: CaixaDeSaidaFalsa }],
  exports: [MAILER],
})
export class EmailModule {}
