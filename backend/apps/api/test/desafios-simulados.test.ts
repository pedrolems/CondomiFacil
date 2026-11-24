import { expect, test } from 'vitest';
import { Credenciais } from '../src/modulos/autenticacao/aplicacao/credenciais.js';
import { DesafiosServico } from '../src/modulos/autenticacao/aplicacao/desafios.servico.js';
import { lerConfigAcesso } from '../src/modulos/autenticacao/index.js';

// Transação falsa: toda cadeia do Kysely devolve a si mesma e a execução não acha usuário nenhum,
// ou seja, todo e-mail cai no desafio simulado em memória.
const tx: never = new Proxy(
  {},
  {
    get: (_, prop) =>
      prop === 'execute' || prop === 'executeTakeFirst' ? async () => undefined : () => tx,
  },
) as never;

test('desafios simulados vencidos são podados: o mapa não cresce sem limite', async () => {
  const cred = new Credenciais(
    lerConfigAcesso({
      JWT_SIGNING_KEY: 'a'.repeat(40),
      IDENTITY_HMAC_KEY: 'b'.repeat(40),
      JWT_ISSUER: 'e',
      JWT_AUDIENCE: 'a',
    }),
  );
  const servico = new DesafiosServico(cred);
  const mapa = (servico as unknown as { simulados: Map<string, unknown> }).simulados;
  const t0 = new Date('2026-11-24T12:00:00Z');
  for (let i = 0; i < 10_050; i++) {
    await servico.emitir(tx, {
      email: `x${i}@e.test`,
      destino: `d${i}`,
      finalidade: 'ativacao',
      agora: t0,
    });
  }
  expect(mapa.size).toBeGreaterThan(10_000);
  // 16 min depois (o simulado vale 15): o próximo pedido poda os vencidos.
  await servico.emitir(tx, {
    email: 'novo@e.test',
    destino: 'dn',
    finalidade: 'ativacao',
    agora: new Date(t0.getTime() + 16 * 60_000),
  });
  expect(mapa.size).toBe(1);
});
