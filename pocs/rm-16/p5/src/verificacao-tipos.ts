// Prova de tipos (critério 3 do ADR-008): cada @ts-expect-error tem de ser um erro real de compilação.
// Se a biblioteca deixar passar, o tsc acusa "Unused '@ts-expect-error' directive". Só tsc; não executa.
import type { TxKysely } from './acesso-kysely.ts';
import type { TxDrizzle } from './acesso-drizzle.ts';
import { reserva } from './esquema-drizzle.ts';

export async function kysely(tx: TxKysely) {
  // @ts-expect-error coluna inexistente
  await tx.selectFrom('app.reserva').select('coluna_inexistente').execute();
  // @ts-expect-error tabela inexistente
  await tx.selectFrom('app.nao_existe').selectAll().execute();
  // @ts-expect-error tipo errado (condominio_id é uuid/string)
  await tx.insertInto('app.reserva').values({ condominio_id: 1, area_id: 'a', unidade_id: 'u', periodo: '[,)' }).execute();
  // @ts-expect-error coluna obrigatória ausente (periodo)
  await tx.insertInto('app.reserva').values({ condominio_id: 'c', area_id: 'a', unidade_id: 'u' }).execute();
  const linhas = await tx.selectFrom('app.reserva').select(['id', 'estado']).execute();
  // @ts-expect-error resultado tipado: só id e estado
  linhas[0]?.periodo;
}

export async function drizzle(tx: TxDrizzle) {
  // @ts-expect-error coluna inexistente
  await tx.select({ x: reserva.colunaInexistente }).from(reserva);
  // @ts-expect-error tipo errado (condominioId é string)
  await tx.insert(reserva).values({ condominioId: 1, areaId: 'a', unidadeId: 'u', periodo: '[,)' });
  // @ts-expect-error coluna obrigatória ausente (periodo)
  await tx.insert(reserva).values({ condominioId: 'c', areaId: 'a', unidadeId: 'u' });
  const linhas = await tx.select({ id: reserva.id, estado: reserva.estado }).from(reserva);
  // @ts-expect-error resultado tipado: só id e estado
  linhas[0]?.periodo;
}
