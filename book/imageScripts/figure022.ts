import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Rotated square
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image022.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Rotate a square 45 degrees
s.group((transform) => transform.rotate(Math.PI / 4), () => {
  s.strokedPath()
    .rect([0.3, 0.3], [0.7, 0.7])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
