const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: [
    '@prisma/client',
    'prisma'
  ],
  format: 'cjs',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'info'
}).catch(() => process.exit(1))