import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Perturbed grid
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image048.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(1000, () => {
  const x = s.random()  // Uniform across canvas
  const y = s.gaussian(0.5, 0.15)  // Clustered around middle
  s.strokedPath((attr) =>
    attr.fill(0, 0, 0, 0.1)
  )
    .ellipse([x, y], 0.003)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
