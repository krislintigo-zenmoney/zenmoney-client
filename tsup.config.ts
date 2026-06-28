import { defineConfig } from 'tsup'

// eslint-disable-next-line import-x/no-default-export,import-x/no-anonymous-default-export
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node20',
})
