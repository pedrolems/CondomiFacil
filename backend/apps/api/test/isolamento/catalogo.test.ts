// Provas (c) catálogo de RLS e privilégios e (d) papel app_user, conectado como app_user real.
import { afterAll, expect, test } from 'vitest';
import { conectar } from '../../db/scripts/ambiente.js';
import {
  amb,
  auditarCatalogo,
  BANCO_TESTE,
  bancoMigrado,
  EXCECOES_SEM_RLS,
  removerBanco,
} from './apoio.js';

const app = conectar(amb, 'app_user', BANCO_TESTE);
const CONTROLE = 'condomifacil_teste_catalogo';
afterAll(async () => {
  await app.end();
  await removerBanco(CONTROLE);
});

test('(c) toda tabela de condomifacil passa na auditoria do catálogo; exceções explícitas só do plano de autenticação', async () => {
  expect(EXCECOES_SEM_RLS).toEqual(['controle_login', 'desafio_acesso', 'sessao']);
  const [{ n }] = await app<
    [{ n: number }]
  >`select count(*)::int as n from pg_tables where schemaname = 'condomifacil'`;
  expect(n).toBe(15);
  expect(await auditarCatalogo(app)).toEqual([]);
});

test('(c) controle negativo: tabela de tenant criada sem RLS é apontada pela auditoria', async () => {
  await bancoMigrado(CONTROLE);
  const mig = conectar(amb, 'migrador', CONTROLE);
  const appControle = conectar(amb, 'app_user', CONTROLE);
  try {
    await mig`create table condomifacil.tenant_sem_rls (id uuid primary key, condominio_id uuid not null)`;
    await mig`grant select, truncate on condomifacil.tenant_sem_rls to app_user`;
    await mig`grant update (condominio_id) on condomifacil.tenant_sem_rls to app_user`; // grant só de coluna
    await mig`create function condomifacil.definer() returns int language sql security definer as 'select 1'`;
    await mig`grant select on condomifacil.sessao to app_user`; // exceção sem RLS não pode ter privilégio
    const v = await auditarCatalogo(appControle);
    expect(v).toEqual(
      expect.arrayContaining([
        { tabela: 'tenant_sem_rls', problema: 'RLS não habilitada' },
        { tabela: 'tenant_sem_rls', problema: 'RLS não forçada' },
        { tabela: 'tenant_sem_rls', problema: 'SELECT sem política permissiva' },
        { tabela: 'tenant_sem_rls', problema: 'UPDATE sem política permissiva' },
        { tabela: 'tenant_sem_rls', problema: 'privilégio TRUNCATE' },
        { tabela: 'condomifacil.definer()', problema: 'função SECURITY DEFINER' },
        { tabela: 'sessao', problema: 'exceção sem RLS com privilégio' },
      ]),
    );
  } finally {
    await mig.end();
    await appControle.end();
  }
});

test('(c) app_user recebe 42501 ao ler o histórico do Flyway (infra_migracoes) e o marcador de fixtures', async () => {
  await expect(app`select * from infra_migracoes.flyway_schema_history`).rejects.toMatchObject({
    code: '42501',
  });
  await expect(app`select * from infra_local.banco_descartavel`).rejects.toMatchObject({
    code: '42501',
  });
});

test('(d) app_user: não superusuário, sem BYPASSRLS, sem herança e não é dono de nada', async () => {
  const [r] = await app`
    select rolsuper, rolbypassrls, rolinherit, rolcreaterole, rolcreatedb,
      (select count(*) from pg_auth_members where member = r.oid)::int as membro_de,
      (select count(*) from pg_class where relowner = r.oid)::int as relacoes,
      (select count(*) from pg_namespace where nspowner = r.oid)::int as esquemas,
      (select count(*) from pg_proc where proowner = r.oid)::int as funcoes
    from pg_roles r where rolname = current_user`;
  expect(r).toEqual({
    rolsuper: false,
    rolbypassrls: false,
    rolinherit: false,
    rolcreaterole: false,
    rolcreatedb: false,
    membro_de: 0,
    relacoes: 0,
    esquemas: 0,
    funcoes: 0,
  });
});

test('(d) app_user não desliga a RLS, não trunca e row_security=off não contorna a política', async () => {
  await expect(
    app`alter table condomifacil.condominio disable row level security`,
  ).rejects.toMatchObject({
    code: '42501',
  });
  await expect(
    app`alter table condomifacil.condominio no force row level security`,
  ).rejects.toMatchObject({
    code: '42501',
  });
  await expect(app`truncate condomifacil.condominio`).rejects.toMatchObject({ code: '42501' });
  // O SET em si é aceito; o PostgreSQL recusa a consulta que a política afetaria.
  await expect(
    app.begin(async (tx) => {
      await tx`set local row_security = off`;
      await tx`select count(*) from condomifacil.condominio`;
    }),
  ).rejects.toMatchObject({ code: '42501' });
  await expect(
    app`insert into condomifacil.condominio (id, nome) values (gen_random_uuid(), 'x')`,
  ).rejects.toMatchObject({ code: '42501' });
});

test('E4 e vigência: origem coerente com autor e versão; sem empate de vigência na mesma definição', async () => {
  const fx = conectar(amb, 'fixtures', BANCO_TESTE);
  const ROLLBACK = new Error('rollback');
  try {
    await expect(
      fx.begin(async (tx) => {
        const def = '00000000-0000-5000-8000-000000000001';
        await tx`insert into condomifacil.parametro_definicao (id, chave, tipo, niveis_permitidos, regra_id, descricao)
          values (${def}, 'teste.chave', 'inteiro', '{plataforma,condominio}', 'RN-TESTE', 'teste')`;
        type Q = typeof tx;
        const padrao = (
          q: Q,
          n: number,
          origem: string,
          por: string | null,
          versao: string | null,
          desde: string,
        ) =>
          q`insert into condomifacil.parametro_padrao
            (id, definicao_id, valor_json, vigente_desde, registrado_por_id, origem, versao_migracao)
            values (${`00000000-0000-5000-8000-00000000010${n}`}, ${def}, '1', ${desde}, ${por}, ${origem}, ${versao})`;
        const recusa = (
          code: string,
          ...a: [number, string, string | null, string | null, string]
        ) => expect(tx.savepoint((sp) => padrao(sp as Q, ...a))).rejects.toMatchObject({ code });
        const autor = '00000000-0000-5000-8000-0000000000aa';
        await tx`insert into condomifacil.usuario (id, nome, email_normalizado)
          values (${autor}, 'Autor Fictício', 'autor.e4@exemplo.test')`;
        await padrao(tx, 1, 'carga_versionada', null, '202611210003', '2026-01-01T00:00:00Z');
        await padrao(tx, 2, 'usuario', autor, null, '2026-02-01T00:00:00Z');
        await recusa('23514', 3, 'carga_versionada', autor, '1', '2026-03-01T00:00:00Z');
        await recusa('23514', 4, 'carga_versionada', null, null, '2026-03-01T00:00:00Z');
        await recusa('23514', 5, 'usuario', null, null, '2026-03-01T00:00:00Z');
        await recusa('23514', 6, 'usuario', autor, '1', '2026-03-01T00:00:00Z');
        await recusa('23514', 7, 'outra', null, null, '2026-03-01T00:00:00Z');
        await recusa('23505', 8, 'carga_versionada', null, '1', '2026-01-01T00:00:00Z');
        throw ROLLBACK;
      }),
    ).rejects.toBe(ROLLBACK);
  } finally {
    await fx.end();
  }
});
