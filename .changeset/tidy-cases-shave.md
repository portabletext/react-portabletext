---
"@portabletext/react": major
---

Nest lists as deeply as their level says

A list item can start at a level deeper than 1, and can skip any number of levels at a time.
Neither was accounted for, so a level 3 item could be rendered only one list deep, and items that
later returned to a shallower level could start a new list rather than continuing the one they
belonged to.

The levels that were never authored are now rendered as an empty list item holding the deeper
list, since HTML can only nest a list inside a list item. `[level 3, level 1]` now renders as
`<ul><li><ul><li><ul><li>…</li></ul></li></ul></li><li>…</li></ul>` rather than two sibling lists.

Renderers that do not have HTML's restriction can pass `listNestingMode="direct"`, which nests a
deeper list straight inside its parent list and so fills generated levels with a bare list rather
than an empty list item.
