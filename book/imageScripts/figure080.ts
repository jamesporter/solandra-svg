import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Generative Landscape
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image080.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const layers = 6
s.times(layers, (layer) => {
  const baseY = 0.3 + layer * 0.12
  const amplitude = 0.08 + layer * 0.02
  const frequency = 2 + layer
  const lightness = 70 - layer * 8
  const hue = 200 + layer * 10
  const mountain = s.strokedPath((attr) =>
    attr
      .fill(hue, 40, lightness, 0.8)
      .strokeWidth(0.001)
      .stroke(hue, 60, lightness - 20)
  )
  mountain.moveTo([0, 1])
  mountain.lineTo([0, baseY])
  const steps = 100
  s.times(steps + 1, (i) => {
    const x = i / steps
    const noise = Math.sin(x * Math.PI * frequency) +
                  Math.sin(x * Math.PI * frequency * 2.3) * 0.5
    const y = baseY + noise * amplitude
    mountain.lineTo([x, y])
  })
  mountain.lineTo([1, 1])
  mountain.close()
  mountain.chaiken(2)
})
// Sun
s.strokedPath((attr) =>
  attr.fill(50, 80, 70, 0.9).noStroke()
)
  .ellipse([0.8, 0.2], 0.08)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
