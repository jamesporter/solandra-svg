import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Checkerboard pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image035.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Build an array of points
const points = s.build(10, (i) => {
  return [s.random(), s.random()]
})
// Use the points
points.forEach((pt, i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 36, 70, 50)
  )
    .ellipse(pt, 0.05)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
