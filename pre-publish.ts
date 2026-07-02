import fs from "fs"
import path from "path"
import { sync as rimrafSync } from "rimraf"

rimrafSync("package")
fs.mkdirSync("package")

const mainPackage = JSON.parse(fs.readFileSync("./package.json").toString())
const version = mainPackage.version

const packageTemplate = {
  name: "solandra-svg",
  author: "James Porter <james@amimetic.co.uk>",
  version,
  description:
    "A declarative, fluent, concise, type-safe SVG drawing library for generative art and plotting",
  keywords: [
    "svg",
    "generative-art",
    "creative-coding",
    "plotter",
    "drawing",
    "graphics",
  ],
  repository: {
    type: "git",
    url: "git+https://github.com/jamesporter/solandra-svg.git",
  },
  homepage: "https://solandra-svg.netlify.app/",
  license: "MIT",
  main: "./cjs/index.js",
  module: "./esm/index.js",
  types: "./esm/index.d.ts",
  exports: {
    ".": {
      import: {
        types: "./esm/index.d.ts",
        default: "./esm/index.js",
      },
      require: {
        types: "./cjs/index.d.ts",
        default: "./cjs/index.js",
      },
    },
  },
  sideEffects: false,
  dependencies: {},
}

fs.writeFileSync(
  path.join("package", "package.json"),
  JSON.stringify(packageTemplate, null, 2)
)

// Mark each build directory with its module type so Node resolves both
// formats correctly (the published root package.json has no "type" field).
fs.mkdirSync(path.join("package", "esm"))
fs.writeFileSync(
  path.join("package", "esm", "package.json"),
  JSON.stringify({ type: "module" }, null, 2)
)
fs.mkdirSync(path.join("package", "cjs"))
fs.writeFileSync(
  path.join("package", "cjs", "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2)
)

fs.copyFileSync("README.md", path.join("package", "README.md"))
fs.copyFileSync("LICENSE", path.join("package", "LICENSE"))
