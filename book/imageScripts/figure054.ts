import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Branching structure
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image054.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const palette = [
  [0, 70, 50],
  [30, 70, 50],
  [200, 70, 50],
  [280, 70, 50]
]
s.times(150, () => {
  const pos = s.randomPoint()
  const size = s.random() * 0.08 + 0.01
  const color = s.sample(palette)
  const opacity = s.random() * 0.5 + 0.3
  s.strokedPath((attr) =>
    attr.fill(color[0], color[1], color[2], opacity)
  )
    .ellipse(pos, size)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
