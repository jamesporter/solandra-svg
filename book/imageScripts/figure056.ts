import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Weighted randomness
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image056.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Generate random seed points
const seedPoints = s.build(30, () => s.randomPoint())
// Create cells around each seed
s.forTiling({ n: 50, type: 'square', margin: 0 }, ([x, y], [d], [cX, cY]) => {
  // Find nearest seed point
  let minDist = Infinity
  let nearestIndex = 0
  seedPoints.forEach((seed, i) => {
    const dist = Math.sqrt(
      Math.pow(cX - seed[0], 2) + Math.pow(cY - seed[1], 2)
    )
    if (dist < minDist) {
      minDist = dist
      nearestIndex = i
    }
  })
  s.strokedPath((attr) =>
    attr.fill(nearestIndex * 12, 70, 50).strokeWidth(0.001)
  )
    .rect([x, y], [x + d, y + d])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
