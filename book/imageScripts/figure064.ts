import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Clone with transformations
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image064.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const original = s.strokedPath((attr) =>
  attr.fill(200, 70, 50, 0.6)
)
  .regularPolygon([0.5, 0.5], 0.15, 5)
// Create rotated copies
s.times(8, (i) => {
  s.group((t) => t.rotate((i / 8) * Math.PI * 2), () => {
    original.clone((attr) =>
      attr.fill(i * 45, 70, 50, 0.4)
    )
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
