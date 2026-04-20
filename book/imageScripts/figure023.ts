import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Rotated pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image023.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create a rotated pattern
s.times(8, (i) => {
  const angle = (i / 8) * Math.PI * 2  // 0 to 2π
  s.group((t) => t.rotate(angle), () => {
    s.strokedPath((attr) => attr.fill(i * 40, 70, 50))
      .rect([0.45, 0.1], [0.55, 0.4])
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
