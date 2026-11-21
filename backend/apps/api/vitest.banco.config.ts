import { defineConfig } from 'vitest/config';

// Testes contra o PostgreSQL 17 real (Docker local ou serviço do CI): "pnpm test:banco".
// Sequenciais: compartilham o cluster e recriam bancos de teste.
export default defineConfig({
  test: {
    include: ['test/isolamento/**/*.test.ts'],
    globalSetup: ['test/isolamento/preparar.ts'],
    fileParallelism: false,
    testTimeout: 180_000,
    hookTimeout: 300_000,
  },
});
