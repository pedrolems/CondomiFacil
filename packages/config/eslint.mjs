import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Fronteiras do ADR-015: pacotes nunca dependem de apps; shared-types não importa NestJS nem React Native.
const fronteiras = {
  plugins: { boundaries },
  settings: {
    'import/resolver': { typescript: { alwaysTryTypes: true } },
    'boundaries/elements': [
      { type: 'app', pattern: ['backend/apps/*', 'frontend/apps/*'] },
      { type: 'shared-types', pattern: 'packages/shared-types' },
      { type: 'package', pattern: ['packages/*', 'frontend/packages/*'] },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      2,
      {
        default: 'allow',
        checkAllOrigins: true,
        policies: [
          {
            from: { element: { type: ['package', 'shared-types'] } },
            disallow: { to: { element: { type: 'app' } } },
            message: 'Pacotes nunca dependem de apps (ADR-015).',
          },
          {
            from: { element: { type: 'shared-types' } },
            disallow: {
              to: {
                module: {
                  origin: 'external',
                  source: ['@nestjs/*', 'react-native', 'react-native/*'],
                },
              },
            },
            message: 'shared-types não importa NestJS nem React Native (ADR-015).',
          },
        ],
      },
    ],
  },
};

// DS 17: cor em hexadecimal só na paleta (`frontend/packages/design-tokens`); o resto usa tokens.
const HEX = '/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';
const MENSAGEM_HEX = 'Cor em hex solta: use os tokens de @condomifacil/design-tokens (DS 17).';
const semHexSolto = {
  files: ['frontend/**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  ignores: ['frontend/packages/design-tokens/**'],
  rules: {
    'no-restricted-syntax': [
      'error',
      { selector: `Literal[value=${HEX}]`, message: MENSAGEM_HEX },
      {
        selector: `TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=${HEX}]`,
        message: MENSAGEM_HEX,
      },
    ],
  },
};

// ADR-001 item 4 e ADR-008: só compartilhado/tenant importa o driver e o Kysely (tipos são livres);
// o escopo 'sistema' e o despachante do outbox são só do worker (decisão de Pedro, 23/11/2026).
const API_SRC = 'backend/apps/api/src';
const ARQUIVOS_DO_WORKER = [
  `${API_SRC}/worker.module.ts`,
  `${API_SRC}/main.worker.ts`,
  `${API_SRC}/compartilhado/outbox/despachante.ts`,
];
const DRIVERS = [
  { name: 'postgres', message: 'Acesso a dados só por compartilhado/tenant (ADR-001, ADR-008).' },
  { name: 'kysely-postgres-js', message: 'Acesso a dados só por compartilhado/tenant (ADR-008).' },
  { name: 'pg', message: 'Acesso a dados só por compartilhado/tenant (ADR-008).' },
  {
    name: 'kysely',
    allowTypeImports: true,
    message:
      'Kysely em tempo de execução só em compartilhado/tenant; use o sql reexportado por ele.',
  },
];
const semDriverForaDoTenant = {
  files: [`${API_SRC}/**/*.ts`],
  ignores: [`${API_SRC}/compartilhado/tenant/**`, ...ARQUIVOS_DO_WORKER],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: DRIVERS,
        patterns: [
          {
            group: ['**/escopo-sistema*', '**/despachante*'],
            message: 'Escopo sistema e despachante do outbox são só do worker.',
          },
          {
            group: [
              '**/tenant/transacao*',
              '**/tenant/banco*',
              '**/tenant/guarda*',
              '**/tenant/gerado/*',
            ],
            message: 'Fora de compartilhado/tenant, importe só o index.ts do tenant.',
          },
        ],
      },
    ],
  },
};
const workerSemDriver = {
  files: ARQUIVOS_DO_WORKER,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: DRIVERS,
        patterns: [
          {
            group: [
              '**/tenant/transacao*',
              '**/tenant/banco*',
              '**/tenant/guarda*',
              '**/tenant/gerado/*',
            ],
            message: 'Fora de compartilhado/tenant, importe só o index.ts do tenant.',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      'docs/**',
      'prototipo/**',
      'graphify-out/**',
      // PoCs descartáveis do RM-16, fora do workspace e do padrão de produto.
      'pocs/**',
      '**/dist/**',
      '**/.expo/**',
      '**/gerado/**',
      '**/storybook-static/**',
      '**/.rnstorybook/storybook.requires.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  { languageOptions: { globals: globals.node } },
  fronteiras,
  semHexSolto,
  semDriverForaDoTenant,
  workerSemDriver,
  prettier,
);
