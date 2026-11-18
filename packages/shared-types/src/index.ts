import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js';
import addFormatsCjs, { type FormatsPlugin } from 'ajv-formats';
import { esquemaComum } from './gerado/comum.esquema.js';
import { esquemaTempoReal, eventosTempoReal } from './gerado/tempo-real.esquema.js';

export type {
  components as ComponentesComum,
  operations as OperacoesComum,
  paths as CaminhosComum,
} from './gerado/comum.tipos.js';
export type { components as ComponentesTempoReal } from './gerado/tempo-real.tipos.js';
export { esquemaComum, esquemaTempoReal, eventosTempoReal };

// ajv-formats é CJS com `export default` nos tipos: em ESM o plugin vem como `.default` ou direto.
const addFormats = ((addFormatsCjs as unknown as { default?: FormatsPlugin }).default ??
  addFormatsCjs) as unknown as FormatsPlugin;

/** Ajv estrito (palavra-chave desconhecida falha), com formatos como uuid e date-time. */
export function criarAjv(): Ajv2020 {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  return ajv;
}

const ajv = criarAjv();
ajv.addSchema(esquemaComum);
ajv.addSchema(esquemaTempoReal);

export type ResultadoValidacao = { valido: true } | { valido: false; erros: ErrorObject[] };

function validar(esquemaId: string, nome: string, dado: unknown): ResultadoValidacao {
  const fn = ajv.getSchema(`${esquemaId}#/$defs/${nome}`);
  if (!fn) throw new Error(`Esquema inexistente no contrato: ${nome}`);
  return fn(dado) ? { valido: true } : { valido: false, erros: fn.errors ?? [] };
}

/** Valida contra um esquema do OpenAPI comum: componente, `req_<operationId>` ou `res_<operationId>_<status>`. */
export function validarComum(nome: keyof (typeof esquemaComum)['$defs'], dado: unknown) {
  return validar(esquemaComum.$id, nome, dado);
}

/** Valida a carga de um evento do canal de tempo real pelo nome do evento (ex.: `visitante.editado`). */
export function validarEventoTempoReal(evento: keyof typeof eventosTempoReal, dado: unknown) {
  return validar(esquemaTempoReal.$id, eventosTempoReal[evento], dado);
}
