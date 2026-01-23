import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Deformed grid
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image071.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 8, type: 'square', margin: 0.1 }, ([x, y], [d]) => {
  const path = s.strokedPath((attr) =>
    attr.noFill().stroke(0, 0, 0).strokeWidth(0.001)
  )
    .rect([x, y], [x + d, y + d])
  // Deform each rectangle
  path.map((segment, index) => {
    if (index === 0) return segment
    return {
      ...segment,
      to: s.perturb(segment.to, 0.01)
    }
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
