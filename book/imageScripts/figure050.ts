import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Random walk
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image050.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create a regular grid
s.forTiling({ n: 10, type: 'square', margin: 0.1 }, ([x, y], [d], [cX, cY]) => {
  // Perturb the center point
  const perturbedPoint = s.perturb([cX, cY], 0.03)
  s.strokedPath()
    .ellipse(perturbedPoint, 0.02)
})
// Creates a slightly irregular grid

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
