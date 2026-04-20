import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Colored square grid
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image034.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling(
  { n: 5, type: 'proportionate', margin: 0.1 },
  ([x, y], [dX, dY], [cX, cY]) => {
    // dX and dY may be different to fill the canvas proportionally
    s.strokedPath()
      .ellipse([cX, cY], Math.min(dX, dY) * 0.4)
  }
)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
