import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Circular pattern with varying sizes
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image037.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 8, type: 'square', margin: 0 }, ([x, y], [d], _, __, index) => {
  const row = Math.floor(index / 8)
  const col = index % 8
  const isBlack = (row + col) % 2 === 0
  if (isBlack) {
    s.strokedPath((attr) =>
      attr.fill(0, 0, 0).noStroke()
    )
      .rect([x, y], [x + d, y + d])
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
