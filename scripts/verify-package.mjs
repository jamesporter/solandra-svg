// Smoke test for the built, publishable package in `package/`.
//
// Guards the npm artifact (not the source): it checks that both the ESM and
// CJS builds resolve, expose the public API, and can actually render an SVG.
// Run after `pnpm build:package`. Exits non-zero on any failure so CI catches
// a broken publish before it ships.

import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, "..")
const require = createRequire(import.meta.url)

// The named exports every consumer relies on; if any go missing the build,
// the entry points, or the `exports` map are broken.
const expectedExports = [
  "SolandraSvg",
  "Path",
  "Group",
  "Attributes",
  "Transform",
  "v",
  "c",
]

const failures = []

function check(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.log(`  ✗ ${label}`)
    failures.push(label)
  }
}

function assertModule(label, mod) {
  console.log(`\n${label}`)
  for (const name of expectedExports) {
    check(`exports ${name}`, typeof mod[name] !== "undefined")
  }

  if (typeof mod.SolandraSvg === "function") {
    try {
      const s = new mod.SolandraSvg(100, 100, 1)
      s.strokedPath().moveTo([0, 0]).lineTo([1, 1])
      const svg = s.image
      check(
        "renders an <svg> containing a <path>",
        svg.includes("<svg") && svg.includes("<path"),
      )
    } catch (e) {
      check(`renders without throwing (${e.message})`, false)
    }
  }
}

const esm = await import(pathToFileURL(join(root, "package/esm/index.js")).href)
assertModule("ESM build (package/esm/index.js)", esm)

const cjs = require(join(root, "package/cjs/index.js"))
assertModule("CJS build (package/cjs/index.js)", cjs)

// The two builds must present the same public surface.
console.log("\nParity")
const esmKeys = new Set(Object.keys(esm))
const cjsKeys = new Set(Object.keys(cjs))
const missingInCjs = [...esmKeys].filter((k) => !cjsKeys.has(k))
const missingInEsm = [...cjsKeys].filter((k) => !esmKeys.has(k))
check(
  `ESM and CJS expose the same exports${
    missingInCjs.length || missingInEsm.length
      ? ` (esm-only: ${missingInCjs.join(", ")}, cjs-only: ${missingInEsm.join(
          ", ",
        )})`
      : ""
  }`,
  missingInCjs.length === 0 && missingInEsm.length === 0,
)

if (failures.length > 0) {
  console.error(`\n✗ Package verification failed: ${failures.length} check(s).`)
  process.exit(1)
}
console.log("\n✓ Package verification passed.")
