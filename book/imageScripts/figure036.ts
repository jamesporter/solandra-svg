import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Gradient grid
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image036.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.withRandomOrder(20, (i) => {
  // i is the original index, but execution order is random
  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)
  )
    .ellipse([s.random(), s.random()], 0.05)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
