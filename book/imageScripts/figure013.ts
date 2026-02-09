import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: RGB circles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image013.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Red circle: hue=0, saturation=80, lightness=50
s.strokedPath((attr) => attr.fill(0, 80, 50))
  .ellipse([0.25, 0.5], 0.15)
// Green circle
s.strokedPath((attr) => attr.fill(120, 80, 50))
  .ellipse([0.5, 0.5], 0.15)
// Blue circle
s.strokedPath((attr) => attr.fill(240, 80, 50))
  .ellipse([0.75, 0.5], 0.15)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
