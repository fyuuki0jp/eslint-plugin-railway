/**
 * ESLint plugin for Railway Oriented Programming with Result types
 */

import { requireResultReturnType } from './rules/require-result-return-type';

// Define the plugin object without configs first
const pluginBase = {
  meta: {
    name: '@fyuuki0jp/eslint-plugin-railway',
    version: '1.0.0',
  },
  rules: {
    'require-result-return-type': requireResultReturnType,
  },
};

// Create configs that reference the plugin
const configs = {
  recommended: {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    plugins: {
      '@fyuuki0jp/railway': pluginBase,
    },
    rules: {
      '@fyuuki0jp/railway/require-result-return-type': [
        'error',
        {
          allowedReturnTypes: [
            'void',
            'Promise<void>',
            'never'
          ],
          exemptFunctions: [
            'main',
            'setup',
            'teardown',
            'describe',
            'it',
            'expect',
            'beforeEach',
            'afterEach',
            'beforeAll',
            'afterAll',
            'console.log',
            'console.error',
            'console.warn',
            'console.info',
            'isOk',
            'isErr',
            'constructor',
            'anonymous',
            'ok',
            'err'
          ],
          exemptPatterns: [
            '^test.*',
            '^spec.*',
            '.*Test$',
            '.*Spec$',
            '^mock.*',
            '^stub.*'
          ]
        }
      ]
    },
  },
  strict: {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    plugins: {
      '@fyuuki0jp/railway': pluginBase,
    },
    rules: {
      '@fyuuki0jp/railway/require-result-return-type': [
        'error',
        {
          allowedReturnTypes: ['void', 'never'],
          exemptFunctions: ['isOk', 'isErr', 'constructor', 'ok', 'err'],
          exemptPatterns: ['^test.*', '^spec.*'],
        },
      ],
    },
  },
};

// Combine plugin base with configs
const plugin = {
  ...pluginBase,
  configs,
};

export = plugin;
