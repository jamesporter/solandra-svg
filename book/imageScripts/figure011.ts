import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Concentric circles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image011.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
s.times(20, (i) => {
  const radius = 0.05 + i * 0.02
  s.strokedPath((attr) =>
    attr.strokeWidth(0.001).stroke(i * 10, 70, 50)
  )
    .ellipse(center, radius)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
