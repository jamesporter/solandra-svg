import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Islamic Geometric Pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image075.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.forTiling({ n: 4, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Outer square
  s.strokedPath((attr) =>
    attr.noFill().stroke(200, 70, 40).strokeWidth(0.003)
  )
    .rect([x, y], [x + d, y + d])
  // Inner rotated square
  s.group((t) =>
    t.translate([cX, cY]).rotate(Math.PI / 4),
    () => {
      const innerSize = d * 0.6
      s.strokedPath((attr) =>
        attr.noFill().stroke(200, 70, 40).strokeWidth(0.003)
      )
        .rect(
          [-innerSize/2, -innerSize/2],
          [innerSize/2, innerSize/2]
        )
    }
  )
  // Center star
  const points = 8
  const outerRadius = d * 0.25
  const innerRadius = d * 0.12
  const starPath = s.strokedPath((attr) =>
    attr.fill(200, 70, 60, 0.7).strokeWidth(0.001)
  )
  s.times(points * 2, (i) => {
    const angle = (i / (points * 2)) * Math.PI * 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const px = cX + Math.cos(angle) * radius
    const py = cY + Math.sin(angle) * radius
    if (i === 0) {
      starPath.moveTo([px, py])
    } else {
      starPath.lineTo([px, py])
    }
  })
  starPath.close()
  // Corner decorations
  const corners = [
    [x, y],
    [x + d, y],
    [x + d, y + d],
    [x, y + d]
  ]
  corners.forEach((corner) => {
    s.strokedPath((attr) =>
      attr.fill(200, 70, 50, 0.5)
    )
      .ellipse(corner, d * 0.08)
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
