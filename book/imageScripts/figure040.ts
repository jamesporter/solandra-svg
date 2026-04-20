import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Nested grid pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image040.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const rays = s.aroundCircle(24, 0.45, center)
rays.forEach((endpoint, i) => {
  s.strokedPath((attr) =>
    attr
      .stroke(i * 15, 70, 50)
      .strokeWidth(0.005)
  )
    .moveTo(center)
    .lineTo(endpoint)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
