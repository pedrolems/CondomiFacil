# Catálogo de componentes

Storybook web, o catálogo principal da biblioteca (`@storybook/react-native-web-vite` 10.6.7 e `@storybook/addon-a11y`). As stories ficam junto dos componentes, em `frontend/packages/ui/src/components/*/*.stories.tsx`, e o catálogo as importa. O aplicativo não depende do catálogo nem das stories. Referência: docs/06-frontend/biblioteca-de-componentes.md, seções 5.2, 6 e 7.

| Comando | O que faz |
| --- | --- |
| `pnpm --filter @condomifacil/catalogo-componentes storybook` | Abre o catálogo em `http://localhost:6006` |
| `pnpm --filter @condomifacil/catalogo-componentes build-storybook` | Gera o site estático em `storybook-static/` (o `build` do Turborepo faz o mesmo) |
| `pnpm --filter @condomifacil/catalogo-componentes test:a11y` | Roda o axe em cada story, nos temas Claro e Escuro; violação falha o comando |

Antes do primeiro `test:a11y`, instale o Chromium do Playwright (download único, fora do repositório):

```sh
pnpm --filter @condomifacil/catalogo-componentes exec playwright install chromium
```

O `test:a11y` usa `@storybook/addon-vitest` (Vitest 5.1.0 em modo navegador, Playwright 1.65.1) com `a11y.test: 'error'`. Fica fora do `pnpm check` porque precisa desse navegador; no CI roda em passo próprio, depois do `pnpm check`, com o Chromium instalado pelo workflow. O `design-tokens` precisa estar compilado (`pnpm turbo run build`).

`fixtures/` guarda exemplos sintéticos comuns; não incluir dados pessoais reais nem credenciais.
