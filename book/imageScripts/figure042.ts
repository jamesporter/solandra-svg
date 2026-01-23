import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Random rays
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image042.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(20, () => {
  const center = [0.5, 0.5]
  const angle = s.randomAngle()
  const length = 0.3
  const endX = center[0] + Math.cos(angle) * length
  const endY = center[1] + Math.sin(angle) * length
  s.strokedPath()
    .moveTo(center)
    .lineTo([endX, endY])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
