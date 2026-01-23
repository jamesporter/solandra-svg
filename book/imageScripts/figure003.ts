import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 1: Colored arcs with varying hues
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image003.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(25, (i) => {
  // Create a path with custom attributes
  s.strokedPath((attr) =>
    attr
      .fill(i * 10, 80, 60, 0.5)  // HSL: hue, saturation, lightness, opacity
      .strokeWidth(0.002)
      .stroke(0, 0, 0)  // Black stroke
  )
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
