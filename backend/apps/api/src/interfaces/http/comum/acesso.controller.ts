import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { ComponentesComum } from '@condomifacil/shared-types';
import type { Request, Response } from 'express';
import { NaoAutenticado } from '../../../compartilhado/erros/index.js';
import { AceitesServico } from '../../../modulos/acesso/index.js';
import {
  AcessoServico,
  AutenticadoGuard,
  CONFIG_ACESSO,
  LimitadorDeTaxa,
  type ConfigAcesso,
  type RequisicaoAutenticada,
  type SessaoEmitida,
} from '../../../modulos/autenticacao/index.js';
import {
  apagarCookieRt,
  classificarCliente,
  gravarCookieRt,
  refreshRecebido,
  type Cliente,
} from './cliente-web.js';
import { LimitePorIpGuard } from './limite-por-ip.guard.js';
import { lerPaginacao, paginar, validarCorpo } from './validacao.js';

type Esq = ComponentesComum['schemas'];

const MENSAGEM_DO_CODIGO =
  'Se o e-mail estiver cadastrado, enviamos um código. Se não chegar, confira o e-mail digitado ou procure a administradora ou o síndico.';

// /v1/acesso/* (comum.yaml, decisão de Pedro de 24/11/2026). Só traduz HTTP: o que importa está em
// AcessoServico e AceitesServico.
@Controller('v1/acesso')
@UseGuards(LimitePorIpGuard)
export class AcessoController {
  constructor(
    @Inject(AcessoServico) private readonly acesso: AcessoServico,
    @Inject(AceitesServico) private readonly aceites: AceitesServico,
    @Inject(CONFIG_ACESSO) private readonly config: ConfigAcesso,
    @Inject(LimitadorDeTaxa) private readonly limitador: LimitadorDeTaxa,
  ) {}

  // Web x app e CSRF primeiro, antes do corpo e de qualquer token.
  private cliente(req: Request): Cliente {
    return classificarCliente(req, this.config.origensWeb);
  }

  private async sessao(
    res: Response,
    cliente: Cliente,
    s: SessaoEmitida,
  ): Promise<Esq['SessaoAbertaComum']> {
    if (cliente === 'web') {
      gravarCookieRt(res, s.refreshToken, this.config.validadeSessaoDias * 86_400);
    }
    return {
      token_acesso: s.tokenAcesso,
      token_acesso_expira_em: s.tokenAcessoExpiraEm.toISOString(),
      refresh_token: cliente === 'web' ? null : s.refreshToken,
      aceites_pendentes: await this.aceites.temPendentes(s.usuarioId),
    };
  }

  @Post('codigo')
  @HttpCode(202)
  async pedirCodigo(@Body() corpo: unknown): Promise<Esq['RespostaCodigoComum']> {
    const b = validarCorpo<Esq['PedirCodigoComum']>('req_comumPedirCodigo', corpo);
    this.limitador.porEmail(b.email);
    const r = await this.acesso.pedirCodigo(b.email, b.finalidade);
    return {
      mensagem: MENSAGEM_DO_CODIGO,
      pode_pedir_novo_codigo_em: r.podePedirNovoCodigoEm.toISOString(),
    };
  }

  @Post('ativar')
  @HttpCode(200)
  async ativar(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() corpo: unknown,
  ) {
    const cliente = this.cliente(req);
    const b = validarCorpo<Esq['AtivarComum']>('req_comumAtivar', corpo);
    this.limitador.porEmail(b.email);
    return this.sessao(
      res,
      cliente,
      await this.acesso.ativar(b.email, b.codigo, b.nova_senha, b.dispositivo),
    );
  }

  @Post('entrar')
  @HttpCode(200)
  async entrar(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() corpo: unknown,
  ) {
    const cliente = this.cliente(req);
    const b = validarCorpo<Esq['EntrarComum']>('req_comumEntrar', corpo);
    this.limitador.porEmail(b.email);
    return this.sessao(res, cliente, await this.acesso.entrar(b.email, b.senha, b.dispositivo));
  }

  @Post('redefinir-senha')
  @HttpCode(200)
  async redefinirSenha(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() corpo: unknown,
  ) {
    const cliente = this.cliente(req);
    const b = validarCorpo<Esq['RedefinirSenhaComum']>('req_comumRedefinirSenha', corpo);
    this.limitador.porEmail(b.email);
    return this.sessao(
      res,
      cliente,
      await this.acesso.redefinirSenha(b.email, b.codigo, b.nova_senha, b.dispositivo),
    );
  }

  @Post('renovar')
  @HttpCode(200)
  async renovar(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cliente = this.cliente(req);
    const refresh = refreshRecebido(req, cliente);
    if (!refresh) throw new NaoAutenticado();
    return this.sessao(res, cliente, await this.acesso.renovar(refresh));
  }

  @Post('sair')
  @HttpCode(204)
  @UseGuards(AutenticadoGuard)
  async sair(
    @Req() req: RequisicaoAutenticada,
    @Res({ passthrough: true }) res: Response,
    @Body() corpo: unknown,
  ): Promise<void> {
    const cliente = this.cliente(req);
    // `dispositivo_id` (remoção do token de push) fica para a etapa de dispositivos: aceito e ignorado.
    validarCorpo<Esq['SairComum']>('req_comumSair', corpo);
    await this.acesso.sair(req.autenticacao.sessaoId);
    if (cliente === 'web') apagarCookieRt(res);
  }

  @Get('aceites')
  @UseGuards(AutenticadoGuard)
  async listarAceites(@Req() req: RequisicaoAutenticada, @Query() q: Record<string, unknown>) {
    const { limite, depoisDe } = lerPaginacao(q);
    const itens = await this.aceites.listarPendentes(req.autenticacao.usuarioId, limite, depoisDe);
    const pagina = paginar(itens, limite, (i) => i.documento_versao_id);
    return {
      ...pagina,
      dados: pagina.dados.map((d) => ({
        ...d,
        publicado_em: d.publicado_em.toISOString(),
        vigente_desde: d.vigente_desde.toISOString(),
        arquivo_id: null,
      })),
    };
  }

  @Post('aceites')
  @HttpCode(201)
  @UseGuards(AutenticadoGuard)
  async registrarAceites(
    @Req() req: RequisicaoAutenticada,
    @Body() corpo: unknown,
  ): Promise<Esq['AceitesRegistradosComum']> {
    const b = validarCorpo<Esq['RegistrarAceitesComum']>('req_comumRegistrarAceites', corpo);
    const r = await this.aceites.registrar(req.autenticacao.usuarioId, b.documento_versao_ids);
    return {
      aceitos: r.aceitos.map((a) => ({
        documento_versao_id: a.documento_versao_id,
        aceito_em: a.aceito_em.toISOString(),
      })),
      pendentes_restantes: r.pendentesRestantes,
    };
  }
}
