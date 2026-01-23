import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Rainbow gradient
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image019.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(36, (i) => {
  const hue = i * 10  // 0 to 350
  s.strokedPath((attr) =>
    attr.fill(hue, 80, 60).noStroke()
  )
    .rect([i / 36, 0.3], [(i + 1) / 36, 0.7])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
