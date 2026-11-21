# apps/api/db/seeds

Factories determinísticas e cargas sintéticas, só com dados fictícios, só em banco descartável. Nunca vão para piloto ou produção.

- `fixtures.ts`: `uuidV5` (RFC 9562), namespace por cenário (`namespaceDoCenario`), factory `condominio(cenario, chave, dados)` com todas as colunas explícitas e `carregarCenario`, que roda como `fixtures` e recusa host não permitido, banco sem o marcador `infra_local.banco_descartavel` e namespace repetido (exceto o mesmo manifesto em estado inicial, que só informa "já pronto"). Barreira detalhada em `../README.md`.
- `manual.ts`: seed manual mínimo com três condomínios fictícios (`pnpm --filter @condomifacil/api db:seed`).

Hoje só existe a tabela `condominio`; unidades entram no RM-21 e as factories crescem com as tabelas de cada pacote.
