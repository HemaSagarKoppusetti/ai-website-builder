import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/generators/index.ts',
    'src/prompts/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'openai',
    '@anthropic-ai/sdk',
    'langchain',
    '@langchain/openai',
    '@langchain/anthropic'
  ]
})