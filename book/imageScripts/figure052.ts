import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 6: Scattered composition
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image052.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.times(10, () => {
  let pos = s.randomPoint()
  const path = s.strokedPath((attr) =>
    attr.noFill().stroke(s.random() * 360, 70, 50).strokeWidth(0.002)
  )
  path.moveTo(pos)
  s.times(100, () => {
    const angle = s.randomAngle()
    const stepSize = 0.01
    pos = [
      pos[0] + Math.cos(angle) * stepSize,
      pos[1] + Math.sin(angle) * stepSize
    ]
    path.lineTo(pos)
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
