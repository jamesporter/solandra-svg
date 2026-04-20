import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Smooth random shapes
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image065.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const points = 8
const shape = s.strokedPath((attr) =>
  attr.fill(280, 60, 50, 0.7).strokeWidth(0.002)
)
const vertices = s.aroundCircle(points, 0.3, center)
shape.moveTo(vertices[0])
vertices.forEach((v) => {
  const perturbedV = s.perturb(v, 0.08)
  shape.lineTo(perturbedV)
})
shape.close().chaiken(4)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
