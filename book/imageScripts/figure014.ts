import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Overlapping semi-transparent circles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image014.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Semi-transparent overlapping circles
s.strokedPath((attr) => attr.fill(0, 80, 50, 0.5))
  .ellipse([0.4, 0.5], 0.2)
s.strokedPath((attr) => attr.fill(120, 80, 50, 0.5))
  .ellipse([0.5, 0.5], 0.2)
s.strokedPath((attr) => attr.fill(240, 80, 50, 0.5))
  .ellipse([0.6, 0.5], 0.2)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
