---
"@portabletext/react": patch
---

Avoid repeated serialization of nested styled list items and reuse unchanged blocks
and prepared marks trees in the React Compiler build.

Reuse requires immutable block identities, stable keys, components and missing-component
handlers, and unchanged block indices. Mounts, refetched documents with new objects,
and updates with new component maps can incur additional per-block overhead.

Missing-component handlers no longer run for discarded styled-list subtrees or reused
block output. Each top-level block and list item now has a `RenderedNode` boundary
(including in the hook-free RSC build). Built-in block styles and list items render
native tags directly, so their default component functions no longer appear in React
DevTools or warning stacks. Custom components still receive the full props contract,
including mark text and the single-argument `renderNode` callback.
