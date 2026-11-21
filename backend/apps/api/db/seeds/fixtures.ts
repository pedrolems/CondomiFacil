// Factories determinísticas e carga de cenários fictícios (RM-25).
// IDs: UUID v5 de (namespace do cenário, chave lógica). A carga roda como "fixtures" (BYPASSRLS) e
// só em banco descartável: confere o host permitido antes de conectar e o marcador
// infra_local.banco_descartavel (gravado pelo provisionamento, inacessível ao app_user) antes de
// qualquer DML. Não depende de NODE_ENV nem de "--force".
import { createHash } from 'node:crypto';
import { type Ambiente, conectar, exigirHostDescartavel } from '../scripts/ambiente.js';

// Raiz fixa dos namespaces de cenário do CondomiFacil (gerada uma vez; não alterar).
export const NAMESPACE_RAIZ = '3f1d2c4e-7a5b-4c8d-9e0f-1a2b3c4d5e6f';

/** UUID versão 5 (RFC 9562): SHA-1 de namespace + nome. */
export function uuidV5(nome: string, namespace: string): string {
  const ns = Buffer.from(namespace.replaceAll('-', ''), 'hex');
  if (ns.length !== 16) throw new Error(`Namespace UUID inválido: ${namespace}`);
  const h = createHash('sha1').update(ns).update(nome, 'utf8').digest();
  h[6] = (h[6]! & 0x0f) | 0x50;
  h[8] = (h[8]! & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

export const namespaceDoCenario = (cenario: string) => uuidV5(cenario, NAMESPACE_RAIZ);

export interface Condominio {
  id: string;
  nome: string;
  documento_protegido: string | null;
  fuso_horario: string;
  criado_em: string;
}

export interface Manifesto {
  cenario: string;
  condominios: Condominio[];
}

/** Factory: todas as colunas explícitas (inclusive criado_em) para o estado ser reprodutível. */
export function condominio(
  cenario: string,
  chave: string,
  dados: Partial<Omit<Condominio, 'id'>> = {},
): Condominio {
  return {
    id: uuidV5(chave, namespaceDoCenario(cenario)),
    nome: `Condomínio Fictício ${chave}`,
    documento_protegido: null,
    fuso_horario: 'America/Sao_Paulo',
    criado_em: '2026-01-01T00:00:00.000Z',
    ...dados,
  };
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export type ResultadoCarga = 'carregado' | 'ja-pronto';

export async function carregarCenario(
  amb: Ambiente,
  manifesto: Manifesto,
  banco = amb.banco,
): Promise<ResultadoCarga> {
  exigirHostDescartavel(amb.host);
  const namespace = namespaceDoCenario(manifesto.cenario);
  const manifestoHash = sha256(JSON.stringify(manifesto));
  const ids = manifesto.condominios.map((c) => c.id);
  const sql = conectar(amb, 'fixtures', banco);
  try {
    const [quem] = await sql<[{ usuario: string }]>`select current_user as usuario`;
    if (quem.usuario !== 'fixtures') throw new Error('A carga de fixtures exige o papel fixtures.');
    const marcado =
      await sql`select 1 from infra_local.banco_descartavel where banco = current_database()`.catch(
        () => [],
      );
    if (marcado.length !== 1)
      throw new Error(`Banco ${banco} não está marcado como descartável; carga recusada.`);

    return await sql.begin(async (tx) => {
      const estadoAtual = async () => {
        const [r] = await tx<[{ h: string }]>`
          select coalesce(md5(string_agg(row_to_json(c)::text, ',' order by c.id)), '') as h
          from condomifacil.condominio c where c.id = any(${ids}::uuid[])`;
        return r.h;
      };
      const [existente] = await tx<{ manifesto_hash: string; estado_hash: string | null }[]>`
        select manifesto_hash, estado_hash from infra_local.namespace_fixture
        where namespace = ${namespace} for update`;
      if (existente) {
        if (
          existente.manifesto_hash === manifestoHash &&
          existente.estado_hash === (await estadoAtual())
        ) {
          return 'ja-pronto' as const;
        }
        throw new Error(
          `Namespace do cenário "${manifesto.cenario}" já existe com outro manifesto ou estado alterado.`,
        );
      }
      await tx`insert into infra_local.namespace_fixture (namespace, cenario, manifesto_hash)
        values (${namespace}, ${manifesto.cenario}, ${manifestoHash})`;
      if (manifesto.condominios.length > 0)
        await tx`insert into condomifacil.condominio ${tx(manifesto.condominios)}`;
      await tx`update infra_local.namespace_fixture set estado_hash = ${await estadoAtual()}
        where namespace = ${namespace}`;
      return 'carregado' as const;
    });
  } finally {
    await sql.end();
  }
}
