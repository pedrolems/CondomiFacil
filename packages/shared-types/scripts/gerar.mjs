// Gera tipos TypeScript e JSON Schema (para Ajv) a partir dos contratos OpenAPI 3.1 e AsyncAPI 3.0.
// Os contratos são a única fonte (ADR-015): este script não os altera nem escreve esquemas à mão.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Parser } from '@asyncapi/parser';
import { bundle, createConfig } from '@redocly/openapi-core';
import openapiTS, { astToString } from 'openapi-typescript';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contratos = resolve(raiz, '../../docs/05-backend/api');
const saida = resolve(raiz, 'src/gerado');
const CABECALHO = '// Gerado por scripts/gerar.mjs a partir dos contratos. Não editar.\n';

// Palavras-chave de esquema que os tipos gerados traduzem sem perda. Qualquer outra falha
// de forma explícita (PC-01): nada de degradar para `unknown` em silêncio.
const SUPORTADAS = new Set([
  '$ref',
  'type',
  'properties',
  'required',
  'items',
  'enum',
  'const',
  'oneOf',
  'anyOf',
  'allOf',
  'discriminator',
  'format',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minLength',
  'maxLength',
  'pattern',
  'minItems',
  'maxItems',
  'uniqueItems',
  'additionalProperties',
  'default',
  'description',
  'title',
  'examples',
  'readOnly',
  'writeOnly',
  'deprecated',
]);
// Só documentação, sem efeito na validação: removidas do JSON Schema (o Ajv estrito não as conhece).
const ANOTACOES = new Set(['example', 'externalDocs', 'xml']);

/** Copia o esquema, reescreve `$ref` para `#/$defs/` e falha em palavra-chave não suportada. */
export function limparEsquema(esquema, caminho) {
  if (typeof esquema === 'boolean') return esquema;
  if (esquema === null || typeof esquema !== 'object' || Array.isArray(esquema)) {
    throw new Error(`Esquema inválido em ${caminho}`);
  }
  const resultado = {};
  for (const [chave, valor] of Object.entries(esquema)) {
    const onde = `${caminho}/${chave}`;
    if (ANOTACOES.has(chave) || chave.startsWith('x-')) continue;
    if (!SUPORTADAS.has(chave)) {
      throw new Error(`Palavra-chave de esquema não suportada: "${chave}" em ${caminho}`);
    }
    if (chave === '$ref') {
      if (!valor.startsWith('#/components/schemas/')) {
        throw new Error(`$ref não suportado em ${caminho}: ${valor}`);
      }
      resultado.$ref = valor.replace('#/components/schemas/', '#/$defs/');
    } else if (chave === 'properties') {
      resultado[chave] = Object.fromEntries(
        Object.entries(valor).map(([nome, filho]) => [
          nome,
          limparEsquema(filho, `${onde}/${nome}`),
        ]),
      );
    } else if (['oneOf', 'anyOf', 'allOf'].includes(chave)) {
      resultado[chave] = valor.map((filho, i) => limparEsquema(filho, `${onde}/${i}`));
    } else if (chave === 'items' || chave === 'additionalProperties') {
      resultado[chave] = limparEsquema(valor, onde);
    } else if (chave === 'discriminator') {
      // Fica só nos tipos gerados: no JSON Schema o `oneOf` já exige exatamente um ramo, e o
      // `discriminator` do Ajv recusa ramos compostos com `allOf`.
      continue;
    } else {
      resultado[chave] = valor;
    }
  }
  return resultado;
}

function resolverRef(doc, obj) {
  let atual = obj;
  while (atual?.$ref) {
    if (!atual.$ref.startsWith('#/')) throw new Error(`$ref externo remanescente: ${atual.$ref}`);
    atual = atual.$ref
      .slice(2)
      .split('/')
      .reduce((no, parte) => no?.[parte.replaceAll('~1', '/').replaceAll('~0', '~')], doc);
  }
  return atual;
}

const ehJson = (tipoMidia) => /json/.test(tipoMidia);

function montarEsquema(id, defs) {
  return { $schema: 'https://json-schema.org/draft/2020-12/schema', $id: id, $defs: defs };
}

/** Gera tipos e JSON Schema de um OpenAPI 3.1 (com `$ref` entre arquivos). */
export async function gerarOpenApi(arquivo, id) {
  const { bundle: pacote, problems } = await bundle({
    ref: arquivo,
    config: await createConfig({}),
  });
  const erros = problems.filter((p) => p.severity === 'error');
  if (erros.length) throw new Error(`Contrato inválido: ${erros.map((e) => e.message).join('; ')}`);
  const doc = pacote.parsed;
  const defs = {};
  for (const [nome, esquema] of Object.entries(doc.components?.schemas ?? {})) {
    defs[nome] = limparEsquema(esquema, `schemas/${nome}`);
  }
  // Corpos e respostas JSON de cada operação: req_<operationId> e res_<operationId>_<status>.
  for (const [rota, item] of Object.entries(doc.paths ?? {})) {
    for (const [metodo, op] of Object.entries(item)) {
      if (!op?.operationId) continue;
      const corpo = resolverRef(doc, op.requestBody);
      for (const [tipoMidia, midia] of Object.entries(corpo?.content ?? {})) {
        if (midia.schema && ehJson(tipoMidia)) {
          defs[`req_${op.operationId}`] = limparEsquema(midia.schema, `${metodo} ${rota} corpo`);
        }
      }
      for (const [status, resposta] of Object.entries(op.responses ?? {})) {
        const conteudo = resolverRef(doc, resposta)?.content ?? {};
        for (const [tipoMidia, midia] of Object.entries(conteudo)) {
          if (midia.schema && ehJson(tipoMidia)) {
            const onde = `${metodo} ${rota} ${status}`;
            defs[`res_${op.operationId}_${status}`] = limparEsquema(midia.schema, onde);
          }
        }
      }
    }
  }
  const tipos = astToString(await openapiTS(doc));
  return { tipos, esquema: montarEsquema(id, defs), nomes: Object.keys(defs) };
}

/** Gera tipos e JSON Schema do AsyncAPI 3.0 (PC-03: parser + JSON Schema + Ajv). */
export async function gerarAsyncApi(arquivo, id) {
  const { document, diagnostics } = await new Parser().parse(readFileSync(arquivo, 'utf8'));
  const erros = diagnostics.filter((d) => d.severity === 0);
  if (!document || erros.length) {
    throw new Error(`Contrato inválido: ${erros.map((e) => e.message).join('; ')}`);
  }
  const schemas = document.json().components?.schemas ?? {};
  const defs = Object.fromEntries(
    Object.entries(schemas).map(([nome, esq]) => [nome, limparEsquema(esq, `schemas/${nome}`)]),
  );
  // Nome do evento -> esquema da carga; o parser informa o nome do esquema em `x-parser-schema-id`.
  const eventos = Object.fromEntries(
    document.allMessages().map((m) => [m.name(), m.payload().json()['x-parser-schema-id']]),
  );
  for (const [evento, nome] of Object.entries(eventos)) {
    if (!defs[nome]) throw new Error(`Carga do evento ${evento} sem esquema em components.schemas`);
  }
  // OpenAPI sintético só para reaproveitar o gerador de tipos nos mesmos esquemas.
  const sintetico = {
    openapi: '3.1.0',
    info: { title: 'tempo-real', version: '0' },
    paths: {},
    components: { schemas: defs },
  };
  const tipos = astToString(await openapiTS(sintetico));
  return { tipos, esquema: montarEsquema(id, defs), nomes: Object.keys(defs), eventos };
}

const ts = (nome, valor) =>
  `${CABECALHO}export const ${nome} = ${JSON.stringify(valor, null, 2)};\n`;
const lf = (texto) => texto.replaceAll('\r\n', '\n');

async function principal() {
  mkdirSync(saida, { recursive: true });
  const http = await gerarOpenApi(
    resolve(contratos, 'openapi/comum.yaml'),
    'urn:condomifacil:contratos:comum',
  );
  const tempoReal = await gerarAsyncApi(
    resolve(contratos, 'asyncapi/tempo-real.yaml'),
    'urn:condomifacil:contratos:tempo-real',
  );
  const arquivos = {
    'comum.tipos.ts': CABECALHO + lf(http.tipos),
    'comum.esquema.ts': ts('esquemaComum', http.esquema),
    'tempo-real.tipos.ts': CABECALHO + lf(tempoReal.tipos),
    'tempo-real.esquema.ts':
      ts('esquemaTempoReal', tempoReal.esquema) +
      `export const eventosTempoReal = ${JSON.stringify(tempoReal.eventos, null, 2)} as const;\n`,
  };
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    writeFileSync(resolve(saida, nome), conteudo);
  }
  console.log(`Gerado em ${saida}: ${Object.keys(arquivos).join(', ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await principal();
