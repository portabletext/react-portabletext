---
'@portabletext/react': patch
---

Build with the Rust port of React Compiler (`oxc-transform-react` via `reactCompiler.transform: 'oxc'` in `@sanity/tsdown-config@0.26.0`) instead of `babel-plugin-react-compiler`. The published output is functionally identical — the client build stays auto-memoized and the `react-server` build stays uncompiled — but the compiler pass now runs in a single native pass, cutting the compiled bundle's build time from ~440ms to ~85ms (5x faster).
