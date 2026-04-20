import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Basic forTiling
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image033.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 6, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Note: for square type, dX = dY = d
  s.strokedPath((attr) =>
    attr.fill(x * 360, 70, 50)  // Hue based on x position
  )
    .rect([x, y], [x + d, y + d])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
