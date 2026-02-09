import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Kaleidoscope effect
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image070.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create one segment
const segment = s.strokedPath((attr) =>
  attr.fill(300, 70, 50, 0.6)
)
  .moveTo([0.5, 0.5])
  .lineTo([0.5, 0.2])
  .lineTo([0.6, 0.25])
  .close()
  .chaiken(2)
// Repeat in circle
const segments = 12
s.times(segments, (i) => {
  const angle = (i / segments) * Math.PI * 2
  s.group((t) =>
    t.translate([0.5, 0.5]).rotate(angle).translate([-0.5, -0.5]),
    () => {
      segment.clone((attr) =>
        attr.fill(i * 30, 70, 50, 0.6)
      )
    }
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
