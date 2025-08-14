import { config as baseConfig } from './packages/eslint-config/base.js';

export default [
  ...baseConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      'scripts/**',
      'migrations/**',
      'prisma/**'
    ]
  }
];
