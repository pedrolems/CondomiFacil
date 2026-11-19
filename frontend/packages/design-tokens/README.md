# Tokens do Design System

Paleta (DS 4.1), temas claro e escuro com tokens semânticos e tons de status (DS 4.2 e 4.4), tipografia (DS 5.2), espaçamento e áreas de toque (DS 6.1 e 6.2), raios (DS 7.1) e movimento (DS 9). Sem React, API, sessão ou regras de negócio.

`src/palette.ts` é o único lugar do código com cor em hexadecimal; a regra `no-restricted-syntax` de `packages/config/eslint.mjs` recusa hex no restante de `frontend/`. O fundo escurecido (`scrim`) é rgba derivado da paleta. Elevação (DS 7.2) e a fonte Inter (DS 5.1) ainda não entraram.

Comandos: `pnpm --filter @condomifacil/design-tokens build` (gera `dist/`) e `typecheck`. Referência: `docs/06-frontend/biblioteca-de-componentes.md`, seções 2 e 5.
