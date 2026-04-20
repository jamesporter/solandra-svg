import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Random grid disruption
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image053.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const points = 12
const path = s.strokedPath((attr) =>
  attr.fill(150, 60, 50, 0.7).strokeWidth(0.002)
)
const vertices = []
s.times(points, (i) => {
  const angle = (i / points) * Math.PI * 2
  const radius = 0.2 + s.gaussian(0, 0.05)  // Varying radius
  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius
  vertices.push([x, y])
})
path.moveTo(vertices[0])
vertices.forEach((v) => {
  path.curveTo(v, { curveSize: s.random() * 0.5 })
})
path.close()

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
