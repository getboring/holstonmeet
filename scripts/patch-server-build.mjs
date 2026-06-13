// Post-build script: patches build/server/index.js for Cloudflare Workers compatibility.
// The Vite build exports `__require` (via createRequire) but never actually calls it.
// esbuild strips `import.meta.url` during bundling, causing a runtime error.
// Fix: stub out __require since it's unused.

import { readFileSync, writeFileSync } from 'node:fs'

const file = 'build/server/index.js'
let content = readFileSync(file, 'utf8')

// Remove the createRequire import and stub __require
content = content.replace(
	/import \{ createRequire \} from "node:module";\n/,
	''
)
content = content.replace(
	/var __require = .+createRequire\(import\.meta\.url\);/,
	'var __require = function() { throw new Error("__require is not available in Workers"); };'
)

writeFileSync(file, content)
console.log('Patched build/server/index.js for Workers compatibility')
