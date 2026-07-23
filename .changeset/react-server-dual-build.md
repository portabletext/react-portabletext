---
'@portabletext/react': major
---

`<PortableText>` now ships as two builds selected by export conditions: the `default` build is optimized with [React Compiler](https://react.dev/learn/react-compiler) auto-memoization, and an uncompiled build serves the `react-server` condition, since React Server Components refuse to load compiled output ([facebook/react#31702](https://github.com/facebook/react/issues/31702)):

```json
".": {
  "types": "./dist/index.d.ts",
  "react-server": "./dist/index.react-server.js",
  "default": "./dist/index.js"
}
```

There are no API changes. Client components and SSR get the compiled build, with finer-grained memoization than the manual `useMemo` calls it replaces, and server components render the same source uncompiled — they render exactly once, so memoization can never pay off there.

**BREAKING**: React 19 is now required (`peerDependencies.react` is `^19`) — the compiled build loads `react/compiler-runtime`, which only exists in React 19. Stay on `@portabletext/react@6` if you are on React 18.
