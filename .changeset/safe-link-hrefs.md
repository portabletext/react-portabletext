---
'@portabletext/react': patch
---

The default `link` mark now only renders an `<a>` for safe hrefs (`http`, `https`, `mailto`, `tel`, `#`, `/` and relative URLs). Links with any other protocol, such as `javascript:`, `data:` or `vbscript:`, render their children as plain text. The `uriLooksSafe` check comes from `@portabletext/toolkit` 6.1.0.
