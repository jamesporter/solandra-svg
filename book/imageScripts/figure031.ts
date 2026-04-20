import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Perspective with skew
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image031.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create a pseudo-3D floor pattern
const rows = 10
for (let i = 0; i < rows; i++) {
  const y = 0.3 + i * 0.05
  const skewAmount = (i / rows) * Math.PI / 6
  s.group((t) =>
    t
      .translate([0, y])
      .skewX(skewAmount),
    () => {
      s.strokedPath((attr) =>
        attr.strokeWidth(0.002).stroke(0, 0, 20 + i * 5)
      )
        .moveTo([0.2, 0])
        .lineTo([0.8, 0])
    }
  )
}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
