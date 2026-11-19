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

export default tseslint.config(
  {
    ignores: [
      'docs/**',
      'prototipo/**',
      'graphify-out/**',
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
  prettier,
);
