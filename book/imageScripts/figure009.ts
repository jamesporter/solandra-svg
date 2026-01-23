import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Flower shape
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image009.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Flower-like shape
const center = [0.5, 0.5]
const petalCount = 8
const radius = 0.3
s.times(petalCount, (i) => {
  const angle = (i / petalCount) * Math.PI * 2
  const petalEnd = [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius
  ]
  s.strokedPath((attr) => attr.fill(i * 30, 70, 60, 0.6))
    .moveTo(center)
    .curveTo(petalEnd, { polarity: 1, curveSize: 0.8 })
    .curveTo(center, { polarity: 1, curveSize: 0.8 })
    .close()
})
// Add center circle
s.strokedPath((attr) => attr.fill(0, 0, 30))
  .ellipse(center, 0.05)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
