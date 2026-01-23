import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Wavy line with map()
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image061.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const steps = 50
const path = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.003)
)
path.moveTo([0.1, 0.5])
s.times(steps, (i) => {
  path.lineTo([0.1 + (i / steps) * 0.8, 0.5])
})
path.map((segment, index) => {
  return {
    ...segment,
    to: [
      segment.to[0],
      segment.to[1] + Math.sin(index * 0.5) * 0.1
    ]
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
