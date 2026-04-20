import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Gaussian distribution
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image046.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon']
const selectedShapes = s.samples(shapes, 3)
// Returns 3 random shapes (without replacement)
selectedShapes.forEach((shape, i) => {
  const x = 0.2 + i * 0.3
  if (shape === 'circle') {
    s.strokedPath().ellipse([x, 0.5], 0.1)
  } else if (shape === 'square') {
    s.strokedPath().rect([x - 0.1, 0.4], [x + 0.1, 0.6])
  }
  // ... handle other shapes
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
