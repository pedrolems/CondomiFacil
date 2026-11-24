import { validarComum } from '@condomifacil/shared-types';
import { RecursoNaoEncontrado, RequisicaoInvalida } from '../../../compartilhado/erros/index.js';
import { UUID } from '../../../compartilhado/uuid.js';

type NomeDoEsquema = Parameters<typeof validarComum>[0];

/** Valida o corpo pelo Ajv gerado do contrato. O detalhe cita só o campo, nunca o valor enviado. */
export function validarCorpo<T>(esquema: NomeDoEsquema, corpo: unknown): T {
  const r = validarComum(esquema, corpo ?? {});
  if (r.valido) return (corpo ?? {}) as T;
  throw new RequisicaoInvalida(
    r.erros.map((e) => {
      const falta = (e.params as { missingProperty?: string }).missingProperty;
      const campo = [e.instancePath.slice(1).replaceAll('/', '.'), falta].filter(Boolean).join('.');
      return { campo, mensagem: falta ? 'Campo obrigatório.' : 'Valor inválido.' };
    }),
  );
}

/** Identificador de rota malformado é o mesmo que inexistente: 404, como o contrato lista. */
export function uuidDaRota(v: string): string {
  if (!UUID.test(v)) throw new RecursoNaoEncontrado();
  return v;
}

/** `limite` (1 a 100, padrão 20) e `cursor` opaco (guia, seção 6). Cursor: id do último item, em base64url. */
export function lerPaginacao(q: Record<string, unknown>): { limite: number; depoisDe?: string } {
  const detalhes = [];
  let limite = 20;
  if (q.limite !== undefined) {
    limite = Number(q.limite);
    if (typeof q.limite !== 'string' || !Number.isInteger(limite) || limite < 1 || limite > 100) {
      detalhes.push({ campo: 'limite', mensagem: 'Valor inválido.' });
    }
  }
  let depoisDe: string | undefined;
  if (q.cursor !== undefined) {
    depoisDe = typeof q.cursor === 'string' ? Buffer.from(q.cursor, 'base64url').toString() : '';
    if (!UUID.test(depoisDe)) detalhes.push({ campo: 'cursor', mensagem: 'Valor inválido.' });
  }
  if (detalhes.length) throw new RequisicaoInvalida(detalhes);
  return { limite, depoisDe };
}

/** `itens` veio com até limite + 1 linhas ordenadas por id. */
export function paginar<T>(itens: T[], limite: number, idDe: (i: T) => string) {
  const dados = itens.slice(0, limite);
  const temMais = itens.length > limite;
  return {
    dados,
    paginacao: {
      proximo_cursor: temMais
        ? Buffer.from(idDe(dados[dados.length - 1]!)).toString('base64url')
        : null,
      tem_mais: temMais,
    },
  };
}
