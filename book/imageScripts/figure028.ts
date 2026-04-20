import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Spirograph effect
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image028.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(36, (i) => {
  const angle = (i / 36) * Math.PI * 2
  const scale = 0.3 + Math.sin(i * 0.5) * 0.2
  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .rotate(angle)
      .scale(scale),
    () => {
      s.strokedPath((attr) =>
        attr.fill(i * 10, 70, 60, 0.3)
      )
        .ellipse([0.3, 0], 0.1)
    }
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
