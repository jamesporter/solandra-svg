import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Saturation variations
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image021.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(10, (i) => {
  const saturation = i * 10  // 0 to 90
  s.strokedPath((attr) =>
    attr.fill(30, saturation, 50)
  )
    .rect([i * 0.1, 0.2], [i * 0.1 + 0.09, 0.8])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
