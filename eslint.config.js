import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwrightPlugin from 'eslint-plugin-playwright';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Playwright
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'warn',
      // POM assertion methods (expectOnPage, expectCartCount etc.) all wrap expect() internally.
      // The rule cannot look inside external POM definitions, so 'warn' avoids false positives
      // on tests that have real assertions hidden behind the POM layer.
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['expect', 'expect*'] }],

      // General
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
    },
  },
];
