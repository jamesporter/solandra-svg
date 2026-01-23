import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Layered smooth paths
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image066.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(5, (layer) => {
  const path = s.strokedPath((attr) =>
    attr
      .fill(layer * 60, 70, 50, 0.3)
      .strokeWidth(0.001)
  )
  path.moveTo([0.1, 0.3 + layer * 0.08])
  s.times(10, (i) => {
    const x = 0.1 + (i / 9) * 0.8
    const y = 0.3 + layer * 0.08 + s.gaussian(0, 0.03)
    path.lineTo([x, y])
  })
  path.chaiken(3)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
