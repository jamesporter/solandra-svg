import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Geometric Mandala
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image072.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const layers = 8
// Outer circle
s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0).strokeWidth(0.003)
)
  .ellipse(center, 0.45)
// Create layers
s.times(layers, (layer) => {
  const radius = 0.4 - layer * 0.04
  const segments = 12 + layer * 4
  const hue = layer * 45
  // Create radial pattern for this layer
  s.times(segments, (i) => {
    const angle = (i / segments) * Math.PI * 2
    s.group((t) =>
      t.translate(center).rotate(angle),
      () => {
        // Petal shape
        s.strokedPath((attr) =>
          attr
            .fill(hue, 70, 60, 0.6)
            .strokeWidth(0.001)
            .stroke(hue, 80, 30)
        )
          .moveTo([0, radius * 0.6])
          .curveTo([radius * 0.15, radius], { polarity: 1, curveSize: 0.7 })
          .curveTo([0, radius * 0.6], { polarity: 1, curveSize: 0.7 })
          .close()
      }
    )
  })
  // Inner ring for this layer
  s.strokedPath((attr) =>
    attr.noFill().stroke(hue, 70, 40).strokeWidth(0.001)
  )
    .ellipse(center, radius * 0.5)
})
// Center decoration
s.strokedPath((attr) =>
  attr.fill(0, 0, 100).stroke(0, 0, 0).strokeWidth(0.001)
)
  .ellipse(center, 0.05)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
