// Carga versionada dos parâmetros da RN 13 (V..._carga_parametros), lida como app_user.
import { readdirSync } from 'node:fs';
import { afterAll, expect, test } from 'vitest';
import { conectar, DIR_MIGRACOES } from '../../db/scripts/ambiente.js';
import { amb, BANCO_TESTE } from './apoio.js';

const app = conectar(amb, 'app_user', BANCO_TESTE);
afterAll(() => app.end());

const arquivoCarga = readdirSync(DIR_MIGRACOES).find((f) =>
  /^V\d+__carga_parametros\.sql$/.test(f),
);
const VERSAO_CARGA = arquivoCarga!.slice(1, arquivoCarga!.indexOf('__'));
// Valores permitidos de enum e conjunto (decisão de Pedro de 21/11/2026).
const ENUMS: Record<string, string[]> = { 'reserva.tipo': ['gratuita', 'paga'] };
const CONJUNTOS: Record<string, string[]> = {
  'cobranca.formas_pagamento': ['boleto', 'pix', 'cartao'],
};

interface Linha {
  chave: string;
  tipo: string;
  minimo: string | null;
  maximo: string | null;
  niveis_permitidos: string[];
  valor_json: unknown;
  origem: string | null;
  versao_migracao: string | null;
  registrado_por_id: string | null;
  vigente_desde: Date | null;
}

const linhas = () => app<Linha[]>`
  select d.chave, d.tipo, d.minimo::text, d.maximo::text, d.niveis_permitidos, p.valor_json, p.origem,
         p.versao_migracao, p.registrado_por_id, p.vigente_desde
  from condomifacil.parametro_definicao d
  left join condomifacil.parametro_padrao p on p.definicao_id = d.id
  order by d.chave`;

test('36 definições e 35 padrões (todas menos reserva.valor), origem carga_versionada da versão da migration', async () => {
  const l = await linhas();
  expect(l).toHaveLength(36);
  const comPadrao = l.filter((x) => x.origem !== null);
  expect(comPadrao).toHaveLength(35);
  expect(l.filter((x) => x.origem === null).map((x) => x.chave)).toEqual(['reserva.valor']);
  for (const p of comPadrao) {
    expect(p).toMatchObject({
      origem: 'carga_versionada',
      versao_migracao: VERSAO_CARGA,
      registrado_por_id: null,
    });
    expect(p.vigente_desde?.toISOString()).toBe('2026-11-21T03:00:00.000Z'); // 00:00 em America/Sao_Paulo
  }
  const valor = l.find((x) => x.chave === 'reserva.valor')!;
  expect([valor.tipo, valor.minimo, valor.maximo]).toEqual(['centavos', '100', '1000000']);
});

test('cada padrão respeita o tipo e a faixa; níveis conforme RN 13', async () => {
  for (const p of await linhas()) {
    const area =
      p.chave.startsWith('reserva.') && p.chave !== 'reserva.lembrete_antecedencia_horas';
    expect(p.niveis_permitidos, p.chave).toEqual(
      area ? ['plataforma', 'condominio', 'area'] : ['plataforma', 'condominio'],
    );
    if (p.origem === null) continue;
    const v = p.valor_json;
    const rotulo = `${p.chave}=${JSON.stringify(v)}`;
    switch (p.tipo) {
      case 'inteiro':
      case 'centavos':
      case 'decimal':
        expect(typeof v, rotulo).toBe('number');
        if (p.tipo !== 'decimal') expect(Number.isInteger(v), rotulo).toBe(true);
        expect(v as number, rotulo).toBeGreaterThanOrEqual(Number(p.minimo));
        expect(v as number, rotulo).toBeLessThanOrEqual(Number(p.maximo));
        break;
      case 'booleano':
        expect(typeof v, rotulo).toBe('boolean');
        expect([p.minimo, p.maximo]).toEqual([null, null]);
        break;
      case 'enum':
        expect(ENUMS[p.chave], rotulo).toContain(v);
        break;
      case 'conjunto': {
        const a = v as string[];
        expect(Array.isArray(a) && a.length > 0, rotulo).toBe(true);
        expect(new Set(a).size, rotulo).toBe(a.length);
        for (const x of a) expect(CONJUNTOS[p.chave], rotulo).toContain(x);
        break;
      }
      default:
        throw new Error(`tipo inesperado: ${rotulo} (${p.tipo})`);
    }
  }
});

test('política de carga só para o migrador e só INSERT; app_user continua sem escrever', async () => {
  const pol = await app<{ tabela: string; cmd: string; papeis: string[] }[]>`
    select c.relname::text as tabela, p.polcmd::text as cmd,
           array(select coalesce(r.rolname::text, 'public') from unnest(p.polroles) o
                 left join pg_roles r on r.oid = o) as papeis
    from pg_policy p join pg_class c on c.oid = p.polrelid
    where c.relname like 'parametro_%' order by 1, 2`;
  expect(pol).toEqual([
    { tabela: 'parametro_condominio', cmd: 'a', papeis: ['app_user'] },
    { tabela: 'parametro_condominio', cmd: 'r', papeis: ['app_user'] },
    { tabela: 'parametro_definicao', cmd: 'a', papeis: ['migrador'] },
    { tabela: 'parametro_definicao', cmd: 'r', papeis: ['app_user'] },
    { tabela: 'parametro_padrao', cmd: 'a', papeis: ['migrador'] },
    { tabela: 'parametro_padrao', cmd: 'r', papeis: ['app_user'] },
  ]);
  await expect(
    app`update condomifacil.parametro_padrao set valor_json = '0'`,
  ).rejects.toMatchObject({
    code: '42501',
  });
  await expect(app`delete from condomifacil.parametro_definicao`).rejects.toMatchObject({
    code: '42501',
  });
});
