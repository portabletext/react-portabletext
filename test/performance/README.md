# Rendering benchmarks

Run commands from the repository root. `pnpm test --run` runs the automated
rendering regressions, including compiler-managed reuse. The browser page below
is for manual production timing, not a substitute for CI tests.

## Server rendering

`pnpm bench` builds the package first, so `dist/` must be writable. It measures
static-markup first renders through both production entry points and checks
matching output in a suite setup hook. Rendering the uncompiled server entry
through `react-dom/server` measures serialization, not the full RSC transport.
`pnpm test:next` separately validates the packaged entry points in Next.js.

Set `PORTABLETEXT_BENCHMARK_BASELINE` to a directory containing an earlier build's
`index.js` and `index.react-server.js` to add a comparison.

**Both builds must resolve exactly the same React instance**, including
`react/compiler-runtime`, as this checkout's `react-dom/server`. Pointing at a
different checkout with its own React installation can cause an invalid-hook or
`useMemoCache` error. Copy the baseline artifacts into a temporary directory in
this checkout's ignored `node_modules/` (outside `dist/`, which the build cleans)
so dependencies resolve through this checkout. Do not install another React copy
beside those artifacts.

## Browser rendering

1. Run `pnpm build:bench`.
2. Run `pnpm bench:browser` and open the printed URL.
3. Click **Run benchmarks** and save the JSON output.

The build writes to the ignored `test/performance/dist/` directory, emptying it on
each run. It does not modify the demo output. To benchmark an earlier build, set
`PORTABLETEXT_BENCHMARK_ENTRY` to its absolute `index.js` path when running
`pnpm build:bench`. The Vite config deduplicates React and React DOM.

The fixtures cover plain prose, marks, flat lists, and deeply nested styled lists.
Report the **whole matrix**, including default/custom mounts, same-prop updates,
new arrays sharing blocks, one edited block, prepending, deleting the first block,
fully recreated values (such as refetches), and new component maps. Shared-object
updates can benefit substantially while simple mounts, refetches, and new component
maps can regress. Insertions/deletions shift indices and invalidate later blocks;
generated nested-list nodes also limit reuse.

Results are medians of 20 samples after 5 warmups and include custom-component
render counts. Timings cover synchronous React rendering and commits, not paint,
network loading, or input cloning. Small timings are sensitive to timer resolution.
Record the compared commit hashes, browser version, machine, and all results.
Run allocation/GC profiling separately from timing measurements; sampled allocation
totals are not retained heap size. No machine-specific timing or allocation claims
are maintained in the package README.
