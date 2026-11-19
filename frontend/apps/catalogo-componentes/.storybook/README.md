# Configuração Storybook web

- `main.ts`: framework, stories da `ui`, addons (a11y e vitest). O pacote `@condomifacil/ui` aponta para `src`, para o preview e as stories usarem o mesmo `ThemeProvider`.
- `preview.tsx`: `ThemeProvider` com o seletor de tema na barra (Claro, Escuro, Igual ao aparelho), fundo do canvas em `tema.bg` e `a11y.test: 'error'`.

Addons e APIs web ficam só aqui; as stories não usam DOM, para servirem também ao Storybook nativo. Referência: docs/06-frontend/biblioteca-de-componentes.md, seção 6.
