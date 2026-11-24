// Factories determinísticas e carga de cenários fictícios (RM-25; tabelas do RM-20).
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

export interface Usuario {
  id: string;
  nome: string;
  email_normalizado: string | null;
  senha_hash: string | null;
  estado: 'pre_cadastrado' | 'ativo' | 'desativado';
  tema_preferido: 'aparelho' | 'claro' | 'escuro';
  anonimizado_em: string | null;
}

export interface Documento {
  id: string;
  tipo:
    | 'termos_de_uso'
    | 'politica_de_privacidade'
    | 'regimento'
    | 'como_funciona'
    | 'responsabilidade_conta_pf';
  condominio_id: string | null;
  titulo: string;
}

export interface DocumentoVersao {
  id: string;
  documento_id: string;
  numero: number;
  conteudo_texto: string;
  publicado_em: string;
  vigente_desde: string;
}

export interface Aceite {
  id: string;
  usuario_id: string;
  documento_versao_id: string;
  aceito_em: string;
}

export interface ParametroCondominio {
  id: string;
  condominio_id: string;
  definicao_id: string;
  valor_json: unknown;
  vigente_desde: string;
  registrado_por_id: string;
  registrado_em: string;
}

export interface Sessao {
  id: string;
  usuario_id: string;
  renovacao_hash: string;
  renovacao_hash_anterior: string | null;
  rotacionada_em: string | null;
  anterior_reusado_em: string | null;
  expira_em: string;
  revogada_em: string | null;
  dispositivo_identificador: string | null;
  criada_em: string;
}

export interface DesafioAcesso {
  id: string;
  usuario_id: string | null;
  destino_protegido: string;
  finalidade: 'ativacao' | 'recuperacao_senha';
  codigo_hash: string;
  emitido_em: string;
  expira_em: string;
  tentativas: number;
  consumido_em: string | null;
  invalidado_em: string | null;
}

export interface ControleLogin {
  id: string;
  usuario_id: string | null;
  chave_tentativa_protegida: string;
  falhas: number;
  bloqueado_ate: string | null;
}

export interface Manifesto {
  cenario: string;
  condominios: Condominio[];
  usuarios?: Usuario[];
  documentos?: Documento[];
  documentoVersoes?: DocumentoVersao[];
  aceites?: Aceite[];
  parametrosCondominio?: ParametroCondominio[];
  sessoes?: Sessao[];
  desafios?: DesafioAcesso[];
  controlesLogin?: ControleLogin[];
}

// Ordem de carga (respeita as FKs) e tabela de cada lista do manifesto. Documento e versão entram
// na mesma transação, o que satisfaz a constraint diferida "documento exige versão".
const TABELAS = [
  ['condominio', 'condominios'],
  ['usuario', 'usuarios'],
  ['documento', 'documentos'],
  ['documento_versao', 'documentoVersoes'],
  ['aceite', 'aceites'],
  ['parametro_condominio', 'parametrosCondominio'],
  ['sessao', 'sessoes'],
  ['desafio_acesso', 'desafios'],
  ['controle_login', 'controlesLogin'],
] as const;

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

const INSTANTE = '2026-01-01T00:00:00.000Z';
// Id das tabelas do RM-20: prefixo do tipo, para não colidir com o id do condomínio da mesma chave.
const idDe = (cenario: string, tipo: string, chave: string) =>
  uuidV5(`${tipo}:${chave}`, namespaceDoCenario(cenario));

/** Senha fictícia para usuários ativos de fixture (não é hash de nenhuma senha). */
export const SENHA_HASH_FICTICIA = '$fixture$sem-senha-real';

/** Usuário pré-cadastrado por padrão; e-mail fictício derivado da chave e do cenário. */
export function usuario(
  cenario: string,
  chave: string,
  dados: Partial<Omit<Usuario, 'id'>> = {},
): Usuario {
  return {
    id: idDe(cenario, 'usuario', chave),
    nome: `Pessoa Fictícia ${chave}`,
    email_normalizado: `${chave}.${cenario}@exemplo.test`.toLowerCase(),
    senha_hash: null,
    estado: 'pre_cadastrado',
    tema_preferido: 'aparelho',
    anonimizado_em: null,
    ...dados,
  };
}

export function documento(
  cenario: string,
  chave: string,
  dados: Partial<Omit<Documento, 'id'>> = {},
): Documento {
  return {
    id: idDe(cenario, 'documento', chave),
    tipo: 'termos_de_uso',
    condominio_id: null,
    titulo: `Documento fictício ${chave}`,
    ...dados,
  };
}

export function documentoVersao(
  cenario: string,
  doc: Documento,
  numero: number,
  dados: Partial<Omit<DocumentoVersao, 'id' | 'documento_id' | 'numero'>> = {},
): DocumentoVersao {
  return {
    id: idDe(cenario, 'documento_versao', `${doc.id}:${numero}`),
    documento_id: doc.id,
    numero,
    conteudo_texto: `${doc.titulo}, versão ${numero}. Texto fictício para testes.`,
    publicado_em: INSTANTE,
    vigente_desde: INSTANTE,
    ...dados,
  };
}

export function aceite(cenario: string, u: Usuario, v: DocumentoVersao): Aceite {
  return {
    id: idDe(cenario, 'aceite', `${u.id}:${v.id}`),
    usuario_id: u.id,
    documento_versao_id: v.id,
    aceito_em: INSTANTE,
  };
}

export function parametroCondominio(
  cenario: string,
  chave: string,
  dados: Omit<ParametroCondominio, 'id' | 'vigente_desde' | 'registrado_em'> &
    Partial<Pick<ParametroCondominio, 'vigente_desde' | 'registrado_em'>>,
): ParametroCondominio {
  return {
    id: idDe(cenario, 'parametro_condominio', chave),
    vigente_desde: INSTANTE,
    registrado_em: INSTANTE,
    ...dados,
  };
}

export function sessao(
  cenario: string,
  chave: string,
  u: Usuario,
  dados: Partial<Omit<Sessao, 'id' | 'usuario_id'>> = {},
): Sessao {
  return {
    id: idDe(cenario, 'sessao', chave),
    usuario_id: u.id,
    renovacao_hash: `hash-ficticio-${chave}`,
    renovacao_hash_anterior: null,
    rotacionada_em: null,
    anterior_reusado_em: null,
    expira_em: '2026-01-31T00:00:00.000Z',
    revogada_em: null,
    dispositivo_identificador: null,
    criada_em: INSTANTE,
    ...dados,
  };
}

export function desafioAcesso(
  cenario: string,
  chave: string,
  dados: Partial<Omit<DesafioAcesso, 'id'>> = {},
): DesafioAcesso {
  return {
    id: idDe(cenario, 'desafio_acesso', chave),
    usuario_id: null,
    destino_protegido: `destino-ficticio-${chave}`,
    finalidade: 'ativacao',
    codigo_hash: `codigo-ficticio-${chave}`,
    emitido_em: INSTANTE,
    expira_em: '2026-01-01T00:15:00.000Z',
    tentativas: 0,
    consumido_em: null,
    invalidado_em: null,
    ...dados,
  };
}

export function controleLogin(
  cenario: string,
  chave: string,
  dados: Partial<Omit<ControleLogin, 'id'>> = {},
): ControleLogin {
  return {
    id: idDe(cenario, 'controle_login', chave),
    usuario_id: null,
    chave_tentativa_protegida: `chave-ficticia-${chave}`,
    falhas: 0,
    bloqueado_ate: null,
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
  const listas = TABELAS.map(([tabela, campo]) => ({
    tabela: `condomifacil.${tabela}`,
    linhas: (manifesto[campo] ?? []) as { id: string }[],
  })).filter((l) => l.linhas.length > 0);
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
        let h = '';
        for (const { tabela, linhas } of listas) {
          const [r] = await tx<[{ h: string }]>`
            select coalesce(md5(string_agg(row_to_json(c)::text, ',' order by c.id)), '') as h
            from ${tx(tabela)} c where c.id = any(${linhas.map((l) => l.id)}::uuid[])`;
          h += `${tabela}:${r.h};`;
        }
        return h;
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
      for (const { tabela, linhas } of listas) await tx`insert into ${tx(tabela)} ${tx(linhas)}`;
      await tx`update infra_local.namespace_fixture set estado_hash = ${await estadoAtual()}
        where namespace = ${namespace}`;
      return 'carregado' as const;
    });
  } finally {
    await sql.end();
  }
}
