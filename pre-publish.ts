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
  main: "./cjs/index.js",
  module: "./esm/index.js",
  license: "MIT",
  dependencies: {},
  types: "./esm/index.d.ts",
}

fs.writeFileSync(
  path.join("package", "package.json"),
  JSON.stringify(packageTemplate, null, 2)
)
