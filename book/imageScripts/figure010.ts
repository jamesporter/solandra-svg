import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Grid of squares
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image010.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    const size = 0.15
    const spacing = 0.2
    s.strokedPath()
      .rect(
        [x * spacing + 0.05, y * spacing + 0.05],
        [x * spacing + 0.05 + size, y * spacing + 0.05 + size]
      )
  }
}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
