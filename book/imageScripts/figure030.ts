import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Scaling animation effect
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image030.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(20, (i) => {
  const scaleFactor = 0.1 + i * 0.05
  const opacity = 1 - (i / 20)
  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .scale(scaleFactor),
    () => {
      s.strokedPath((attr) =>
        attr
          .noFill()
          .stroke(200, 70, 50)
          .strokeWidth(0.01)
          .opacity(opacity)
      )
        .regularPolygon([0, 0], 0.5, 6)
    }
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
