import babel from '@rolldown/plugin-babel'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import {bundleAnalyzerPlugin} from 'rolldown/experimental'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [
    react(),
    babel({presets: [reactCompilerPreset({target: '19'})]}),
    bundleAnalyzerPlugin(),
  ],
})
