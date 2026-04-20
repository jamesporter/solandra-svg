import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Smooth random walk
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image058.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

let pos = [0.1, 0.5]
const path = s.strokedPath((attr) =>
  attr.noFill().stroke(180, 70, 50).strokeWidth(0.003)
)
path.moveTo(pos)
s.times(15, () => {
  pos = [
    pos[0] + s.random() * 0.1,
    pos[1] + (s.random() - 0.5) * 0.2
  ]
  path.lineTo(pos)
})
// Apply smoothing
path.chaiken(4)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
