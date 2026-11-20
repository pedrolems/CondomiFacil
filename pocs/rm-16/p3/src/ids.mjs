// IDs determinísticos iguais aos de sql/02-fixtures.sql: md5(texto)::uuid.
import { createHash } from 'node:crypto';

export const uuidDe = (texto) => {
  const h = createHash('md5').update(texto).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const condominio = (i) => uuidDe(`condominio-${i}`);
export const unidade = (i, n) => uuidDe(`unidade-${i}-${n}`);
export const portaria = (i, p) => uuidDe(`portaria-${i}-${p}`);
export const visitaHoje = (i, n) => uuidDe(`visita-${i}-0-${n}`);

// Condomínio 1 = A (grande, 5.000 unidades); condomínio 2 = B.
export const A = condominio(1);
export const B = condominio(2);
