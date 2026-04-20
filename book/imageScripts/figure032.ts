import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Simple times() loop
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image032.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create circles with varying colors
s.times(20, (i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)  // Hue varies from 0 to 342
  )
    .ellipse([s.random(), s.random()], 0.05)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
