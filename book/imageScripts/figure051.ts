import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Organic shape
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image051.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const path = s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0).strokeWidth(0.002)
)
// Create a wavy line by perturbing points
const y = 0.5
path.moveTo([0, y])
s.times(50, (i) => {
  const x = i / 50
  const perturbedPoint = s.perturb([x, y], 0.1)
  path.lineTo(perturbedPoint)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
