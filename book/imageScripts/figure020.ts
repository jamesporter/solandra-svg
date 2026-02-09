import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Monochrome concentric
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image020.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(10, (i) => {
  const lightness = 10 + i * 8  // 10 to 82
  s.strokedPath((attr) =>
    attr.fill(220, 50, lightness)
  )
    .ellipse([0.5, 0.5], 0.05 + i * 0.04)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
