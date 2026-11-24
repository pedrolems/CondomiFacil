import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado } from '../../../compartilhado/erros/index.js';
import { TenantContext } from '../../../compartilhado/tenant/index.js';

export type Tema = 'aparelho' | 'claro' | 'escuro';

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  tema_preferido: Tema;
}

const COLUNAS = ['id', 'nome', 'email_normalizado', 'tema_preferido'] as const;
type Linha = { id: string; nome: string; email_normalizado: string | null; tema_preferido: string };
const paraPerfil = (l: Linha | undefined): Perfil => {
  if (!l?.email_normalizado) throw new NaoAutenticado();
  return {
    id: l.id,
    nome: l.nome,
    email: l.email_normalizado,
    tema_preferido: l.tema_preferido as Tema,
  };
};

/** Perfil próprio (RF-AC-05): pelo app_user, RLS do titular, sem senha_hash; só o tema é editável. */
@Injectable()
export class PerfilServico {
  constructor(@Inject(TenantContext) private readonly tenant: TenantContext) {}

  async obter(usuarioId: string): Promise<Perfil> {
    return paraPerfil(
      await this.tenant.executarComoUsuario({ usuarioId }, (tx) =>
        tx.selectFrom('usuario').select(COLUNAS).where('id', '=', usuarioId).executeTakeFirst(),
      ),
    );
  }

  async atualizarTema(usuarioId: string, tema: Tema): Promise<Perfil> {
    return paraPerfil(
      await this.tenant.executarComoUsuario({ usuarioId }, (tx) =>
        tx
          .updateTable('usuario')
          .set({ tema_preferido: tema })
          .where('id', '=', usuarioId)
          .returning(COLUNAS)
          .executeTakeFirst(),
      ),
    );
  }
}
