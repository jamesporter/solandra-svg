import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Path cloning
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image063.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create original path
const original = s.strokedPath((attr) =>
  attr.fill(0, 70, 50)
)
  .ellipse([0.5, 0.5], 0.2)
// Clone with different attributes
original.clone((attr) =>
  attr.fill(120, 70, 50).opacity(0.5)
)
original.clone((attr) =>
  attr.fill(240, 70, 50).opacity(0.5)
)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
