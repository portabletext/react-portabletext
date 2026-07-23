import type {NextConfig} from 'next'

const config: NextConfig = {
  // Both the repo root and this app have a pnpm-lock.yaml while `pnpm test:next` runs; pin
  // the workspace root so Turbopack doesn't infer it from the repo's lockfile.
  turbopack: {root: __dirname},
}

export default config
