import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 5: Parametric wave
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image039.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 10, type: 'square', margin: 0.1 }, ([x, y], [d], [cX, cY]) => {
  const distFromCenter = Math.sqrt(
    Math.pow(cX - 0.5, 2) + Math.pow(cY - 0.5, 2)
  )
  const radius = d * 0.4 * (1 - distFromCenter * 1.5)
  if (radius > 0) {
    s.strokedPath((attr) =>
      attr.fill(distFromCenter * 360, 70, 50)
    )
      .ellipse([cX, cY], radius)
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
