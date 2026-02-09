import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Wavy line
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image049.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(100, () => {
  const count = s.poisson(5)  // Lambda = 5
  s.times(count, () => {
    s.strokedPath((attr) =>
      attr.fill(count * 30, 70, 50)
    )
      .ellipse(s.randomPoint(), 0.01)
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
