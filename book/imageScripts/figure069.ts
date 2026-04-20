import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Mirrored paths
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image069.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create one half
const halfPath = s.strokedPath((attr) =>
  attr.fill(180, 70, 50, 0.7)
)
halfPath.moveTo([0.5, 0.2])
s.times(10, (i) => {
  const t = i / 9
  const x = 0.5 + t * 0.3
  const y = 0.2 + Math.sin(t * Math.PI) * 0.4 + s.gaussian(0, 0.02)
  halfPath.lineTo([x, y])
})
halfPath.lineTo([0.5, 0.8]).close().chaiken(3)
// Mirror it
halfPath.clone().map((segment) => {
  return {
    ...segment,
    to: [1 - segment.to[0], segment.to[1]]
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
