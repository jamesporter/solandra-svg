import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Curves with polarity
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image007.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Basic curve
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5])  // Cubic Bézier curve
// With polarity (curve direction)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5], { polarity: 1 })  // Curves one way
s.strokedPath()
  .moveTo([0.1, 0.6])
  .curveTo([0.9, 0.6], { polarity: -1 })  // Curves the opposite way
// With curveSize (0-1, controls curve intensity)
s.strokedPath()
  .moveTo([0.1, 0.3])
  .curveTo([0.9, 0.3], { curveSize: 0.3 })  // Gentle curve
s.strokedPath()
  .moveTo([0.1, 0.7])
  .curveTo([0.9, 0.7], { curveSize: 0.9 })  // Pronounced curve
// With custom handles (full control)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5], {
    curveSize: 0.5,
    polarity: 1,
    curveAngle: Math.PI / 4  // 45-degree angle
  })

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
