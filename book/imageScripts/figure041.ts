import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Random circles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image041.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(50, () => {
  const x = s.random()  // 0 to 1
  const y = s.random()  // 0 to 1
  const radius = s.random() * 0.1  // 0 to 0.1
  s.strokedPath()
    .ellipse([x, y], radius)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
