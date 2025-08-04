const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))

// Get all dependencies and devDependencies, excluding workspace:* packages
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
const externalPackages = Object.keys(allDeps).filter(pkg => allDeps[pkg] !== 'workspace:*')

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: externalPackages,
  format: 'cjs',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'info'
}).catch(() => process.exit(1))