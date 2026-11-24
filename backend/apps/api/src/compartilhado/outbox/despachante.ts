import { Inject, Injectable } from '@nestjs/common';
import { LoggerJson, descreverErro } from '../logger/index.js';
import { EscopoSistema } from '../tenant/escopo-sistema.js';
import { TenantContext } from '../tenant/index.js';
import { MANIPULADORES_DE_EVENTO, type ManipuladorDeEvento } from './manipulador.js';

const LOTE = 20;
// Evento que falha sempre não trava a fila para sempre; passou disso, fica para análise humana.
const MAX_TENTATIVAS = 10;

/**
 * Despachante do outbox (E13), só do worker. Entrega pelo menos uma vez: o handler pode rodar de
 * novo se o processo cair antes do COMMIT, então todo consumidor é idempotente.
 */
@Injectable()
export class Despachante {
  private readonly porTipo: Map<string, ManipuladorDeEvento>;
  private ativo = false;

  constructor(
    @Inject(EscopoSistema) private readonly sistema: EscopoSistema,
    @Inject(TenantContext) private readonly tenant: TenantContext,
    @Inject(MANIPULADORES_DE_EVENTO) manipuladores: ManipuladorDeEvento[],
    @Inject(LoggerJson) private readonly logger: LoggerJson,
  ) {
    this.porTipo = new Map(manipuladores.map((m) => [m.tipo, m]));
  }

  /** Uma passada: devolve quantos eventos foram publicados. */
  async executarUmaVez(): Promise<number> {
    const condominios = await this.sistema.executar((tx) =>
      tx
        .selectFrom('evento_saida')
        .select('condominio_id')
        .where('tentativas', '<', MAX_TENTATIVAS)
        .distinct()
        .execute(),
    );
    let publicados = 0;
    for (const { condominio_id: condominioId } of condominios) {
      publicados += await this.tenant.executar({ condominioId }, async (tx) => {
        const eventos = await tx
          .selectFrom('evento_saida')
          .selectAll()
          .where('publicado_em', 'is', null)
          .where('tentativas', '<', MAX_TENTATIVAS)
          .orderBy('criado_em')
          .limit(LOTE)
          .forUpdate()
          .skipLocked()
          .execute();
        let ok = 0;
        for (const evento of eventos) {
          try {
            const m = this.porTipo.get(evento.tipo);
            if (!m) throw new Error(`sem manipulador para o tipo ${evento.tipo}`);
            await m.tratar(evento);
            await tx
              .updateTable('evento_saida')
              .set({ publicado_em: new Date() })
              .where('id', '=', evento.id)
              .execute();
            ok++;
          } catch (e) {
            this.logger.erro('evento_com_falha', {
              condominio_id: condominioId,
              evento_id: evento.id,
            });
            await tx
              .updateTable('evento_saida')
              .set({
                tentativas: evento.tentativas + 1,
                ultimo_erro_sanitizado: e instanceof Error ? descreverErro(e) : 'erro desconhecido',
              })
              .where('id', '=', evento.id)
              .execute();
            if (evento.tentativas + 1 >= MAX_TENTATIVAS) {
              this.logger.erro('evento_limite_de_tentativas', {
                condominio_id: condominioId,
                evento_id: evento.id,
                tipo: evento.tipo,
              });
            }
          }
        }
        return ok;
      });
    }
    return publicados;
  }

  /** Laço do processo worker; só espera quando a passada não publicou nada. */
  async iniciar(intervaloMs = 2000): Promise<void> {
    this.ativo = true;
    while (this.ativo) {
      const n = await this.executarUmaVez().catch((e: unknown) => {
        this.logger.erro('despacho_falhou', { causa: e });
        return 0;
      });
      if (n === 0) await new Promise((r) => setTimeout(r, intervaloMs));
    }
  }

  parar(): void {
    this.ativo = false;
  }
}
