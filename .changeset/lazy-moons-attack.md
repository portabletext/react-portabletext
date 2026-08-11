---
"@portabletext/react": major
---

Node.js 22.12 or later is now required

The previous range also allowed Node.js 20.19 and later. Node.js 20 reached end of life in April 2026, so it is no longer supported here.

If you build or server-render on Node.js 20, upgrade to 22.12 or later before taking this version. Installing on an older release will fail the `engines` check. Nothing changes for browsers or for bundled output.