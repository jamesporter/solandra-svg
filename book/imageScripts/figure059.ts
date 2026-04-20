import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Organic shape from polygon
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image059.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.strokedPath((attr) =>
  attr.fill(150, 60, 50, 0.7).strokeWidth(0.001)
)
  .regularPolygon([0.5, 0.5], 0.3, 6)
  .chaiken(5)
// Hexagon becomes a smooth, organic blob

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
