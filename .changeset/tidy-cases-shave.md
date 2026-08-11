---
"@portabletext/react": major
---

Lists now nest as deeply as their `level` says they do

#### When you will see a difference

Only when your content has a list item that starts deeper than level 1, or that jumps more than
one level at a time, such as going straight from level 1 to level 3. Lists that start at level 1
and change one level at a time render exactly as before.

Portable Text stores list nesting as a flat `level` number on each block, and an editor lets an
author produce both of those shapes. Previously the rendered nesting could be shallower than
`level` said, and an item returning to a shallower level could start a new list instead of
continuing the one it belonged to, which restarts the numbering of an `<ol>`.

#### What changes

Two list items, the first at level 3 and the second at level 1, used to render as two unrelated
lists:

```html
<ul>
  <li>Level 3</li>
</ul>
<ul>
  <li>Level 1</li>
</ul>
```

They now render as one list, three levels deep, with the second item as a sibling at the top:

```html
<ul>
  <li>
    <ul>
      <li>
        <ul>
          <li>Level 3</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>Level 1</li>
</ul>
```

The levels nobody authored have to be filled with something, and HTML can only put a list inside a
list item, so they become empty list items. A browser draws a bullet or a number for each of them.

#### What you may need to do

Snapshot tests covering lists that start deep or skip levels will need updating.

If the empty markers are visible somewhere you do not want them, the durable fix is the content
itself, since a list skipping from level 1 to level 3 usually means an authoring mistake. To hide
them in the meantime, target list items whose only child is a nested list:

```css
li:has(> ul:only-child),
li:has(> ol:only-child) {
  list-style: none;
}
```

Note that in an `<ol>` this hides the number but the item still counts, so the numbering of the
items after it is unchanged.

#### If you render to something other than HTML

Ignore this part if your lists render as `<ul>`, `<ol>` and `<li>`, which is the default.

If you have replaced the `list` and `listItem` components with something that has no equivalent of
HTML's restriction, such as React Native views or a custom layout component, you can pass
`listNestingMode="direct"` to `<PortableText />`. A deeper list is then nested straight inside its
parent list rather than inside the preceding list item, so the levels nobody authored are filled
with a bare list and never draw a marker. In both modes, nesting depth now matches `level`, so a
component can indent by either one and get the same result.
