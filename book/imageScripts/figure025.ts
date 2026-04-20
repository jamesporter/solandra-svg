import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Growing circles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image025.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(10, (i) => {
  const scaleFactor = 0.2 + i * 0.1
  s.group((t) => t.scale(scaleFactor), () => {
    s.strokedPath((attr) =>
      attr.noFill().stroke(i * 30, 70, 50).strokeWidth(0.005)
    )
      .ellipse([0.5, 0.5], 0.4)
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
