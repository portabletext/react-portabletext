import {defineConfig} from '@sanity/tsdown-config'
import type {UserConfig} from 'tsdown'

const config: Promise<UserConfig[]> = defineConfig({
  tsconfig: './tsconfig.dist.json',
  reactCompiler: {transform: 'oxc', target: '19', reactServer: true},
  bundleAnalyzer: process.env['ENABLE_BUNDLE_ANALYZER'] === 'true',
})

export default config
