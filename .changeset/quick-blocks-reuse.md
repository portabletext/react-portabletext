---
'@portabletext/react': patch
---

Render faster, on the first render and when `value` changes

- Styled list items (a list item with a `style` other than `normal`) are rendered once instead of twice. Deeply nested styled lists used to double their work at every level. Missing components inside them are now reported once instead of twice.
- Blocks made only of unmarked text skip building a marks tree.
- In client components, blocks that are the same object at the same position as in the previous render are not rendered again. This is the same assumption React makes for props: change a block by passing a new object, not by mutating it in place. Blocks with missing components still render, and report them, on every render. Passing a new `components` object or `onMissingComponent` function on every render still re-renders every block.
