import { configDefaults, defineConfig } from 'vitest/config';

// "test" (pnpm check) roda sem Docker; os testes de banco real ficam em "test:banco".
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, 'test/isolamento/**'] },
});
