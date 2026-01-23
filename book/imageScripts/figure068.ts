import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Wobbling spiral
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image068.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const spiral = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.002)
)
const center = [0.5, 0.5]
const turns = 3
const steps = 100
spiral.moveTo(center)
s.times(steps, (i) => {
  const t = i / steps
  const angle = t * turns * Math.PI * 2
  const radius = t * 0.4
  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius
  spiral.lineTo([x, y])
})
// Add wobble to the spiral
spiral.map((segment, index) => {
  if (index === 0) return segment
  const wobble = Math.sin(index * 0.3) * 0.02
  return {
    ...segment,
    to: [
      segment.to[0] + wobble,
      segment.to[1] + wobble
    ]
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
