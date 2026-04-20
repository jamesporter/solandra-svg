import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Natural terrain
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image060.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const terrain = s.strokedPath((attr) =>
  attr.fill(120, 50, 40).stroke(80, 60, 30).strokeWidth(0.002)
)
terrain.moveTo([0, 0.7])
s.times(20, (i) => {
  const x = i / 19
  const y = 0.5 + s.gaussian(0, 0.1)
  terrain.lineTo([x, y])
})
terrain.lineTo([1, 0.7])
  .lineTo([1, 1])
  .lineTo([0, 1])
  .close()
  .chaiken(3)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
