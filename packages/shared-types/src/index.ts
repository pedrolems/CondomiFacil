import type { ErrorObject } from 'ajv';
import type { esquemaComum as EsquemaComum } from './gerado/comum.esquema.js';
import * as validadoresComum from './gerado/comum.validadores.js';
import { eventosTempoReal } from './gerado/tempo-real.esquema.js';
import * as validadoresTempoReal from './gerado/tempo-real.validadores.js';

export type {
  components as ComponentesComum,
  operations as OperacoesComum,
  paths as CaminhosComum,
} from './gerado/comum.tipos.js';
export type { components as ComponentesTempoReal } from './gerado/tempo-real.tipos.js';
export { esquemaComum } from './gerado/comum.esquema.js';
export { esquemaTempoReal, eventosTempoReal } from './gerado/tempo-real.esquema.js';

export type ResultadoValidacao = { valido: true } | { valido: false; erros: ErrorObject[] };

type Validador = ((dado: unknown) => boolean) & { errors?: ErrorObject[] | null };

// Validadores pré-compilados pelo Ajv na geração (modo standalone): nada compila em execução.
function validar(validadores: object, nome: string, dado: unknown): ResultadoValidacao {
  const fn = (validadores as Record<string, Validador | undefined>)[nome];
  if (typeof fn !== 'function') throw new Error(`Esquema inexistente no contrato: ${nome}`);
  return fn(dado) ? { valido: true } : { valido: false, erros: fn.errors ?? [] };
}

/** Valida contra um esquema do OpenAPI comum: componente, `req_<operationId>` ou `res_<operationId>_<status>`. */
export function validarComum(nome: keyof (typeof EsquemaComum)['$defs'], dado: unknown) {
  return validar(validadoresComum, nome, dado);
}

/** Valida a carga de um evento do canal de tempo real pelo nome do evento (ex.: `visitante.editado`). */
export function validarEventoTempoReal(evento: keyof typeof eventosTempoReal, dado: unknown) {
  return validar(validadoresTempoReal, eventosTempoReal[evento], dado);
}
