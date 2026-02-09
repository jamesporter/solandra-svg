import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Random polarity curves
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image044.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(50, () => {
  const sides = s.uniformRandomInt(3, 8)  // 3 to 8 sides
  s.strokedPath((attr) =>
    attr.fill(s.random() * 360, 70, 50)
  )
    .regularPolygon([s.random(), s.random()], 0.05, sides)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
