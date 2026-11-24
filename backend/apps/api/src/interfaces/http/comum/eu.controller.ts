import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { ComponentesComum } from '@condomifacil/shared-types';
import { PerfilServico } from '../../../modulos/acesso/index.js';
import {
  AcessoServico,
  AutenticadoGuard,
  type RequisicaoAutenticada,
} from '../../../modulos/autenticacao/index.js';
import { lerPaginacao, paginar, uuidDaRota, validarCorpo } from './validacao.js';

type Esq = ComponentesComum['schemas'];

// /v1/eu: dados do próprio titular, com Authorization e sem cabeçalhos de contexto.
@Controller('v1/eu')
@UseGuards(AutenticadoGuard)
export class EuController {
  constructor(
    @Inject(AcessoServico) private readonly acesso: AcessoServico,
    @Inject(PerfilServico) private readonly perfil: PerfilServico,
  ) {}

  @Get()
  obterPerfil(@Req() req: RequisicaoAutenticada): Promise<Esq['PerfilComum']> {
    return this.perfil.obter(req.autenticacao.usuarioId);
  }

  @Patch()
  atualizarPerfil(
    @Req() req: RequisicaoAutenticada,
    @Body() corpo: unknown,
  ): Promise<Esq['PerfilComum']> {
    const b = validarCorpo<Esq['AtualizarPerfilComum']>('req_comumAtualizarPerfil', corpo);
    return this.perfil.atualizarTema(req.autenticacao.usuarioId, b.tema_preferido);
  }

  @Get('sessoes')
  async listarSessoes(@Req() req: RequisicaoAutenticada, @Query() q: Record<string, unknown>) {
    const { limite, depoisDe } = lerPaginacao(q);
    const itens = await this.acesso.listarSessoes(req.autenticacao.usuarioId, limite, depoisDe);
    const pagina = paginar(itens, limite, (i) => i.id);
    return {
      ...pagina,
      dados: pagina.dados.map((s) => ({
        id: s.id,
        dispositivo_identificador: s.dispositivo_identificador,
        expira_em: s.expira_em.toISOString(),
        atual: s.id === req.autenticacao.sessaoId,
      })),
    };
  }

  @Delete('sessoes/:sessaoId')
  @HttpCode(204)
  async encerrarSessao(
    @Req() req: RequisicaoAutenticada,
    @Param('sessaoId') sessaoId: string,
  ): Promise<void> {
    await this.acesso.encerrarSessao(req.autenticacao.usuarioId, uuidDaRota(sessaoId));
  }

  @Post('senha')
  @HttpCode(204)
  async trocarSenha(@Req() req: RequisicaoAutenticada, @Body() corpo: unknown): Promise<void> {
    const b = validarCorpo<Esq['TrocarSenhaComum']>('req_comumTrocarSenha', corpo);
    await this.acesso.trocarSenha(
      req.autenticacao.usuarioId,
      req.autenticacao.sessaoId,
      b.senha_atual,
      b.nova_senha,
    );
  }
}
