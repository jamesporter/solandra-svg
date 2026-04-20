import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Line join styles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image017.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Miter (default) - sharp corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('miter')
)
  .moveTo([0.1, 0.3]).lineTo([0.2, 0.2]).lineTo([0.3, 0.3])
// Round - rounded corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('round')
)
  .moveTo([0.4, 0.3]).lineTo([0.5, 0.2]).lineTo([0.6, 0.3])
// Bevel - flat corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('bevel')
)
  .moveTo([0.7, 0.3]).lineTo([0.8, 0.2]).lineTo([0.9, 0.3])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
