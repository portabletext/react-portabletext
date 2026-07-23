#!/usr/bin/env node
/**
 * Integration test for the dual React Server Components build, run with `pnpm test:next`.
 *
 * Builds the library, packs it with `pnpm pack` (so `publishConfig` applies, exactly like a
 * publish), installs the tarball into the Next.js app in this directory, and serves a
 * production build with two routes:
 *
 * - `/` is a pure React Server Component page: it must resolve `@portabletext/react` through
 *   the `react-server` export condition to the uncompiled build. If the compiled build leaks
 *   into the react-server environment it throws the `Cannot read properties of undefined
 *   (reading 'H')` TypeError from https://github.com/facebook/react/issues/31702 and the
 *   route responds 500.
 * - `/client` is a `'use client'` page: it resolves the `default` condition to the React
 *   Compiler-optimized build, both for SSR markup and the browser bundle.
 *
 * Both routes must respond 200 with the Portable Text content rendered to markup.
 */

import {spawn, spawnSync} from 'node:child_process'
import {readFile, rm} from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {setTimeout as sleep} from 'node:timers/promises'
import {fileURLToPath} from 'node:url'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(appDir, '../..')
const tarball = path.join(appDir, 'portabletext-react.tgz')
const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next')
const port = Number(process.env.PORT || 3411)
const origin = `http://localhost:${port}`

/** Markup every route must render (deliberately `>text<` shaped so a marker that only shows
 * up in the serialized RSC payload, not in actual markup, does not count). */
const contentMarkers = [
  '>Portable Text in Next.js<',
  '<strong>strong emphasis</strong>',
  'href="https://portabletext.org"',
  '>a bullet list item<',
]

function run(command, args, cwd) {
  console.log(`\n$ ${command} ${args.join(' ')}  # in ${path.relative(rootDir, cwd) || '.'}`)
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {...process.env, NEXT_TELEMETRY_DISABLED: '1'},
  })
  if (result.status !== 0) {
    throw new Error(`\`${command} ${args.join(' ')}\` exited with ${result.status}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
  console.log(`ok - ${message}`)
}

/** The packed artifacts must have the shape consumers install: the `react-server` condition
 * resolving the uncompiled build ahead of the compiled `default`. */
async function checkInstalledArtifacts() {
  const installedDir = path.join(appDir, 'node_modules', '@portabletext', 'react')
  const manifest = JSON.parse(await readFile(path.join(installedDir, 'package.json'), 'utf8'))

  const rootExport = manifest.exports['.']
  const conditions = Object.keys(rootExport)
  assert(
    rootExport['react-server'] === './dist/index.react-server.js',
    'exports["."]["react-server"] resolves the uncompiled build',
  )
  assert(
    rootExport.default === './dist/index.js',
    'exports["."].default resolves the compiled build',
  )
  assert(
    conditions.indexOf('react-server') < conditions.indexOf('default'),
    'the react-server condition matches ahead of default',
  )

  const compiled = await readFile(path.join(installedDir, 'dist', 'index.js'), 'utf8')
  const reactServer = await readFile(
    path.join(installedDir, 'dist', 'index.react-server.js'),
    'utf8',
  )
  assert(
    compiled.includes('react/compiler-runtime'),
    'the compiled build is optimized with React Compiler',
  )
  assert(
    !reactServer.includes('react/compiler-runtime'),
    'the react-server build does not load the compiler runtime',
  )
  assert(
    !reactServer.includes('useMemo(') && !reactServer.includes('useCallback('),
    'the react-server build has no memoization at all',
  )
}

async function checkRoute(pathname, markers) {
  const response = await fetch(origin + pathname)
  const html = await response.text()
  const problems = []
  if (response.status !== 200) problems.push(`expected status 200, got ${response.status}`)
  for (const marker of markers) {
    if (!html.includes(marker)) problems.push(`missing marker ${JSON.stringify(marker)}`)
  }
  if (problems.length > 0) {
    console.error(`--- response body of GET ${pathname} ---\n${html.slice(0, 4000)}\n---`)
    throw new Error(`GET ${pathname}: ${problems.join('; ')}`)
  }
  console.log(`ok - GET ${pathname} responded 200 with all ${markers.length} markers rendered`)
}

// Build the library (compiled + react-server variants) and pack it: `pnpm pack` applies
// `publishConfig`, so the tarball has the conditional `exports` map consumers install.
run('pnpm', ['build'], rootDir)
run('pnpm', ['pack', '--out', path.relative(rootDir, tarball)], rootDir)

// Fresh install: a leftover lockfile pins the integrity of a previously packed tarball, and
// `next@preview` should resolve to the current preview release on every run.
await rm(path.join(appDir, 'pnpm-lock.yaml'), {force: true})
await rm(path.join(appDir, 'node_modules'), {recursive: true, force: true})
await rm(path.join(appDir, '.next'), {recursive: true, force: true})
run('pnpm', ['install'], appDir)

const nextVersion = JSON.parse(
  await readFile(path.join(appDir, 'node_modules', 'next', 'package.json'), 'utf8'),
).version
console.log(`\nTesting against next@${nextVersion}`)

await checkInstalledArtifacts()

run(process.execPath, [nextBin, 'build'], appDir)

console.log(`\n$ next start -p ${port}  # in ${path.relative(rootDir, appDir)}`)
const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
  cwd: appDir,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: {...process.env, NEXT_TELEMETRY_DISABLED: '1'},
})
let serverOutput = ''
server.stdout.on('data', (chunk) => {
  serverOutput += chunk
})
server.stderr.on('data', (chunk) => {
  serverOutput += chunk
})

try {
  // Wait for the server to accept connections (any response counts - assertions come after)
  const deadline = Date.now() + 60_000
  for (;;) {
    try {
      await fetch(origin)
      break
    } catch {
      if (server.exitCode !== null) {
        throw new Error(`next start exited with ${server.exitCode} before accepting connections`)
      }
      if (Date.now() > deadline) throw new Error('next start did not accept connections in 60s')
      await sleep(500)
    }
  }

  await checkRoute('/', ['data-testid="rsc-page"', ...contentMarkers])
  await checkRoute('/client', ['data-testid="client-page"', 'count is', ...contentMarkers])

  console.log('\nAll checks passed: the react-server and default builds both render.')
} catch (error) {
  if (serverOutput) console.error(`--- next start output ---\n${serverOutput}---`)
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  server.kill()
}
