import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Cellular/Voronoi pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image055.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 15, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Randomly skip some cells
  if (s.random() < 0.3) return
  // Random rotation
  const rotation = s.random() * Math.PI * 2
  s.group((t) =>
    t.translate([cX, cY]).rotate(rotation),
    () => {
      const size = d * (0.3 + s.random() * 0.5)
      s.strokedPath((attr) =>
        attr.fill(s.random() * 360, 70, 50)
      )
        .rect([-size/2, -size/2], [size/2, size/2])
    }
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
