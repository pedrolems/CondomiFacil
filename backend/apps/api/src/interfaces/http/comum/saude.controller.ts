import { createRequire } from 'node:module';
import { Controller, Get } from '@nestjs/common';
import type { ComponentesComum } from '@condomifacil/shared-types';

type SaudeComum = ComponentesComum['schemas']['SaudeComum'];

// Mesma profundidade em src/ e dist/, então o caminho vale em dev e em build.
const { version } = createRequire(import.meta.url)('../../../../package.json') as {
  version: string;
};

// GET /v1/saude (comumConsultarSaude): sem autenticação, tenant nem banco (D5).
@Controller('v1/saude')
export class SaudeController {
  @Get()
  consultar(): SaudeComum {
    return { estado: 'disponivel', versao: version };
  }
}
