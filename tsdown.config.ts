import {defineConfig} from '@sanity/tsdown-config'

export default defineConfig({
  tsconfig: './tsconfig.dist.json',
  reactCompiler: {target: '19', reactServer: true},
})
