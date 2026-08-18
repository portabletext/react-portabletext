import react from '@vitejs/plugin-react'
import {bundleAnalyzerPlugin} from 'rolldown/experimental'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [react({compiler: {target: '19'}}), bundleAnalyzerPlugin()],
})
