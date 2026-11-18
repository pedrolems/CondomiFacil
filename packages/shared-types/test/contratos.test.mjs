import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as pacote from '@condomifacil/shared-types';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsModulo from 'ajv-formats';
import { gerarAsyncApi, gerarOpenApi, gerarValidadores } from '../scripts/gerar.mjs';

const fx = (nome) => fileURLToPath(new URL(`./fixtures/${nome}`, import.meta.url));
const uuid = '3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10';
const rejeitado = (r) => assert.equal(r.valido, false, 'deveria rejeitar');
const aceito = (r) => assert.equal(r.valido, true, JSON.stringify(r.erros));

test('critério 4: o exports do pacote é importável por Node em ESM', () => {
  for (const nome of ['validarComum', 'validarEventoTempoReal', 'esquemaComum']) {
    assert.equal(typeof pacote[nome] !== 'undefined', true, nome);
  }
});

test('critério 3: SaudeComum (GET /v1/saude) rejeita resposta fora do esquema', () => {
  aceito(pacote.validarComum('SaudeComum', { estado: 'disponivel', versao: '0.1.0' }));
  aceito(
    pacote.validarComum('res_comumConsultarSaude_200', { estado: 'disponivel', versao: '0.1.0' }),
  );
  rejeitado(
    pacote.validarComum('res_comumConsultarSaude_200', { estado: 'indisponivel', versao: '0.1.0' }),
  );
  rejeitado(pacote.validarComum('res_comumConsultarSaude_200', { estado: 'disponivel' }));
  rejeitado(
    pacote.validarComum('res_comumConsultarSaude_200', { estado: 'disponivel', versao: 1 }),
  );
  rejeitado(pacote.validarComum('res_comumConsultarSaude_200', 'texto'));
});

test('critério 3: oneOf do contrato (GET /v1/score) e nulo 3.1 (ScoreComum)', () => {
  const score = { escopo: 'proprio', titular_tipo: 'moradia', condominio_id: uuid, saldo: 85 };
  const lista = { dados: [score], paginacao: { proximo_cursor: null, tem_mais: false } };
  aceito(pacote.validarComum('res_comumObterScore_200', score));
  aceito(pacote.validarComum('res_comumObterScore_200', lista));
  rejeitado(pacote.validarComum('res_comumObterScore_200', { saldo: 85 }));
  rejeitado(
    pacote.validarComum('res_comumObterScore_200', { dados: [{ saldo: 1 }], paginacao: {} }),
  );
  // nulo: opcional e anulável aceita null; não anulável rejeita; tipo errado e enum fora rejeitam
  aceito(
    pacote.validarComum('ScoreComum', {
      ...score,
      unidade: null,
      parte: null,
      funcionario_id: null,
    }),
  );
  rejeitado(pacote.validarComum('ScoreComum', { ...score, saldo: null }));
  rejeitado(pacote.validarComum('ScoreComum', { ...score, unidade: 5 }));
  rejeitado(pacote.validarComum('ScoreComum', { ...score, parte: 'outro' }));
  rejeitado(pacote.validarComum('ScoreComum', { ...score, saldo: 101 }));
  rejeitado(pacote.validarComum('ScoreComum', { ...score, funcionario_id: 'nao-uuid' }));
});

test('PC-03: eventos do AsyncAPI validados por parser + JSON Schema + Ajv', () => {
  const ocorrido_em = '2026-11-12T14:30:00-03:00';
  aceito(
    pacote.validarEventoTempoReal('visitante.editado', {
      evento: 'visitante.editado',
      visita_id: uuid,
      ocorrido_em,
    }),
  );
  aceito(
    pacote.validarEventoTempoReal('entrega_esperada.editada', {
      evento: 'entrega_esperada.editada',
      entrega_esperada_id: uuid,
      ocorrido_em,
    }),
  );
  rejeitado(
    pacote.validarEventoTempoReal('visitante.editado', {
      evento: 'outro',
      visita_id: uuid,
      ocorrido_em,
    }),
  );
  rejeitado(
    pacote.validarEventoTempoReal('visitante.editado', {
      evento: 'visitante.editado',
      visita_id: 'x',
      ocorrido_em,
    }),
  );
  rejeitado(
    pacote.validarEventoTempoReal('entrega_esperada.editada', {
      evento: 'visitante.editado',
      entrega_esperada_id: uuid,
      ocorrido_em,
    }),
  );
  rejeitado(
    pacote.validarEventoTempoReal('visitante.cadastrado', {
      evento: 'visitante.cadastrado',
      visita_id: uuid,
      ocorrido_em: 'ontem',
    }),
  );
});

test('PC-01: oneOf com discriminator, allOf, nulo obrigatório e $ref entre arquivos', async () => {
  const { esquema, tipos } = await gerarOpenApi(fx('discriminator.yaml'), 'urn:fixture:disc');
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  (addFormatsModulo.default ?? addFormatsModulo)(ajv);
  ajv.addSchema(esquema);
  const ok = (nome, dado) => ajv.getSchema(`urn:fixture:disc#/$defs/${nome}`)(dado);
  const gato = { id: uuid, tipo: 'gato', vidas: 7, apelido: null };
  assert.equal(ok('Animal', gato), true);
  assert.equal(ok('Animal', { id: uuid, tipo: 'cao', late: true }), true);
  assert.equal(ok('Animal', { ...gato, tipo: 'passaro' }), false, 'etiqueta desconhecida');
  assert.equal(ok('Animal', { id: uuid, tipo: 'gato', late: true }), false, 'campos do outro ramo');
  assert.equal(ok('Animal', { ...gato, id: 'x' }), false, 'uuid vem de outro arquivo');
  assert.equal(ok('res_listarAnimais_200', gato), true);
  assert.equal(ok('ObrigatorioNulo', { x: null }), true);
  assert.equal(ok('ObrigatorioNulo', {}), false, 'nulo obrigatório não pode faltar');
  assert.match(
    tipos,
    /Animal: components\["schemas"\]\["Gato"\] \| components\["schemas"\]\["Cao"\]/,
  );
  assert.match(tipos, /x: string \| null;/);
  assert.doesNotMatch(tipos, /\bany\b/);
});

test('critério 5: recurso não suportado falha de forma explícita', async () => {
  await assert.rejects(
    gerarOpenApi(fx('nao-suportado.yaml'), 'urn:fixture:x'),
    /não suportada: "if"/,
  );
});

test('critério 1: gerar duas vezes produz a mesma saída, igual aos arquivos versionados', async () => {
  const contrato = fileURLToPath(
    new URL('../../../docs/05-backend/api/openapi/comum.yaml', import.meta.url),
  );
  const a = await gerarOpenApi(contrato, 'urn:condomifacil:contratos:comum');
  const b = await gerarOpenApi(contrato, 'urn:condomifacil:contratos:comum');
  assert.deepEqual(a, b);
  const asyncapi = fileURLToPath(
    new URL('../../../docs/05-backend/api/asyncapi/tempo-real.yaml', import.meta.url),
  );
  assert.deepEqual(await gerarAsyncApi(asyncapi, 'x'), await gerarAsyncApi(asyncapi, 'x'));
  const gravado = readFileSync(new URL('../src/gerado/comum.tipos.ts', import.meta.url), 'utf8');
  assert.ok(gravado.includes(a.tipos.replaceAll('\r\n', '\n')));
});

test('P1-03: a validação em execução não usa Function, eval nem compilação do Ajv', () => {
  const { Function: funcaoOriginal, eval: evalOriginal } = globalThis;
  const proibido = () => {
    throw new Error('Function/eval chamado durante a validação');
  };
  globalThis.Function = proibido;
  globalThis.eval = proibido;
  try {
    aceito(pacote.validarComum('SaudeComum', { estado: 'disponivel', versao: '0.1.0' }));
    rejeitado(pacote.validarComum('SaudeComum', { estado: 'x', versao: 1 }));
    // formats (uuid, date-time) e minLength/pattern passam pelo módulo de apoio do Ajv
    rejeitado(pacote.validarComum('res_comumObterScore_200', { saldo: 1 }));
    aceito(
      pacote.validarEventoTempoReal('visitante.editado', {
        evento: 'visitante.editado',
        visita_id: uuid,
        ocorrido_em: '2026-11-12T14:30:00-03:00',
      }),
    );
    rejeitado(
      pacote.validarEventoTempoReal('visitante.editado', {
        evento: 'visitante.editado',
        visita_id: 'x',
        ocorrido_em: 'ontem',
      }),
    );
  } finally {
    globalThis.Function = funcaoOriginal;
    globalThis.eval = evalOriginal;
  }
});

test('P1-03: o código de execução (dist) não contém new Function, eval nem compile', () => {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  const arquivos = readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.js'));
  assert.ok(arquivos.length >= 5, arquivos.join(','));
  for (const arquivo of arquivos) {
    const codigo = readFileSync(`${dist}${arquivo}`, 'utf8');
    assert.doesNotMatch(
      codigo,
      /new Function|\beval\s*\(|\.compile\(|new Ajv|getSchema|addSchema/,
      arquivo,
    );
  }
});

test('P1-03: gerarValidadores falha para esquema que o Ajv estrito não aceita', () => {
  const esquema = {
    $id: 'urn:condomifacil:x',
    $defs: { A: { type: 'object', palavraDesconhecida: true } },
  };
  assert.throws(() => gerarValidadores(esquema), /unknown keyword/);
});
