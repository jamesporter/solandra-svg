import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Stroke width variations
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image015.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Thin line
s.strokedPath((attr) => attr.strokeWidth(0.001))
  .moveTo([0.1, 0.3]).lineTo([0.9, 0.3])
// Medium line
s.strokedPath((attr) => attr.strokeWidth(0.005))
  .moveTo([0.1, 0.5]).lineTo([0.9, 0.5])
// Thick line
s.strokedPath((attr) => attr.strokeWidth(0.02))
  .moveTo([0.1, 0.7]).lineTo([0.9, 0.7])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
