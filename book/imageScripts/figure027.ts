import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Rotating star pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image027.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const points = 12
s.times(points, (i) => {
  const angle = (i / points) * Math.PI * 2
  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .rotate(angle),
    () => {
      s.strokedPath((attr) =>
        attr
          .fill(i * 30, 80, 60, 0.7)
          .strokeWidth(0.002)
      )
        .moveTo([0, 0])
        .lineTo([0.4, 0])
        .lineTo([0.3, -0.1])
        .close()
    }
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
