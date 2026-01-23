import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Color sampling
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image045.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(30, (i) => {
  const polarity = s.randomPolarity()
  s.strokedPath()
    .moveTo([0.1 + i * 0.03, 0.5])
    .curveTo([0.1 + (i + 1) * 0.03, 0.5], {
      polarity: polarity,
      curveSize: 0.5
    })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
