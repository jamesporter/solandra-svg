import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Gaussian visualization
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image047.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const positions = []
for (let i = 0; i < 20; i++) {
  positions.push([0.1 + i * 0.04, 0.5])
}
const shuffled = s.shuffle(positions)
shuffled.forEach((pos, i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)
  )
    .ellipse(pos, 0.02)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
