// Provisionamento local/CI (RM-25, E6): roda como superusuário do contêiner, fora da cadeia do
// Flyway. Cria/atualiza os papéis, recria o banco, os esquemas, o marcador de banco descartável e
// os grants das fixtures. Recusa qualquer host fora de HOSTS_DESCARTAVEIS.
import { type Ambiente, conectar, exigirHostDescartavel, type Papel, senha } from './ambiente.js';

const ATRIBUTOS: Record<Exclude<Papel, 'postgres'>, string> = {
  // Dono dos objetos; só o Flyway usa. Sem BYPASSRLS.
  migrador: 'login nosuperuser nobypassrls nocreatedb nocreaterole noreplication',
  // API/worker: não dono, sem BYPASSRLS, sem herdar papéis.
  app_user: 'login nosuperuser nobypassrls nocreatedb nocreaterole noreplication noinherit',
  // Módulo autenticacao: grants por coluna dados pelas migrations do RM-20.
  app_autenticacao: 'login nosuperuser nobypassrls nocreatedb nocreaterole noreplication noinherit',
  // Carga de fixtures; BYPASSRLS só em banco descartável.
  fixtures: 'login nosuperuser bypassrls nocreatedb nocreaterole noreplication noinherit',
};

const literal = (s: string) => `'${s.replaceAll("'", "''")}'`;
const ident = (s: string) => `"${s.replaceAll('"', '""')}"`;

export async function provisionarPapeis(amb: Ambiente): Promise<void> {
  exigirHostDescartavel(amb.host);
  const su = conectar(amb, 'postgres', 'postgres');
  try {
    for (const [papel, atributos] of Object.entries(ATRIBUTOS)) {
      const [{ existe }] = await su<[{ existe: boolean }]>`
        select exists (select from pg_roles where rolname = ${papel}) as existe`;
      try {
        await su.unsafe(
          `${existe ? 'alter' : 'create'} role ${papel} ${atributos} password ${literal(senha(papel as Papel))}`,
        );
      } catch (e) {
        // Não propagar o erro original (nem como cause): o texto da consulta contém a senha.
        // eslint-disable-next-line preserve-caught-error
        throw new Error(
          `Falha ao provisionar o papel ${papel}: ${(e as { code?: string }).code ?? 'erro'}`,
        );
      }
    }
  } finally {
    await su.end();
  }
}

/**
 * Recria o banco do zero. `marcar: false` só existe para o teste que prova a recusa das fixtures
 * em banco sem marcador.
 */
export async function recriarBanco(
  amb: Ambiente,
  banco: string,
  { marcar = true } = {},
): Promise<void> {
  exigirHostDescartavel(amb.host);
  const su = conectar(amb, 'postgres', 'postgres');
  try {
    await su.unsafe(`drop database if exists ${ident(banco)} with (force)`);
    await su.unsafe(`create database ${ident(banco)} owner migrador`);
  } finally {
    await su.end();
  }
  const db = conectar(amb, 'postgres', banco);
  try {
    await db.unsafe(`
      revoke all on database ${ident(banco)} from public;
      grant connect on database ${ident(banco)} to app_user, app_autenticacao, fixtures;
      drop schema public;

      create schema condomifacil authorization migrador;
      create schema infra_migracoes authorization migrador;
      create schema extensoes authorization migrador;

      -- Fixtures (BYPASSRLS): DML nas tabelas que o migrador criar em condomifacil.
      grant usage on schema condomifacil to fixtures;
      alter default privileges for role migrador in schema condomifacil
        grant select, insert, update, delete on tables to fixtures;

      -- Controle das fixtures, fora da cadeia do Flyway e sem acesso de app_user nem migrador.
      create schema infra_local;
      create table infra_local.banco_descartavel (
        banco      name primary key,
        marcado_em timestamptz not null default now()
      );
      create table infra_local.namespace_fixture (
        namespace      uuid primary key,
        cenario        text not null,
        manifesto_hash text not null,
        estado_hash    text,
        carregado_em   timestamptz not null default now()
      );
      grant usage on schema infra_local to fixtures;
      grant select on infra_local.banco_descartavel to fixtures;
      grant select, insert, update on infra_local.namespace_fixture to fixtures;
    `);
    if (marcar)
      await db`insert into infra_local.banco_descartavel (banco) values (current_database())`;
  } finally {
    await db.end();
  }
}
