import { expect, test } from 'vitest';
import { condominio, namespaceDoCenario, uuidV5 } from '../db/seeds/fixtures.js';

test('uuidV5 confere com o vetor da RFC (namespace DNS, www.example.com)', () => {
  expect(uuidV5('www.example.com', '6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(
    '2ed6657d-e927-568b-95e1-2665a8aea6a2',
  );
});

test('factory é determinística e separa cenários', () => {
  expect(condominio('c1', 'alfa')).toEqual(condominio('c1', 'alfa'));
  expect(condominio('c1', 'alfa').id).not.toBe(condominio('c2', 'alfa').id);
  expect(namespaceDoCenario('c1')).toBe(uuidV5('c1', '3f1d2c4e-7a5b-4c8d-9e0f-1a2b3c4d5e6f'));
});
