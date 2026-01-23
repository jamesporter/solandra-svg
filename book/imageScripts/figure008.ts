import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Regular polygons
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image008.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Triangle (3 sides)
s.strokedPath()
  .regularPolygon([0.25, 0.25], 0.15, 3)
// Pentagon (5 sides)
s.strokedPath()
  .regularPolygon([0.5, 0.5], 0.2, 5)
// Hexagon (6 sides)
s.strokedPath()
  .regularPolygon([0.75, 0.25], 0.15, 6)
// Octagon (8 sides)
s.strokedPath()
  .regularPolygon([0.75, 0.75], 0.15, 8)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
