import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Procedural Trees
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image074.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

function drawTree(start, angle, length, depth, thickness) {
  if (depth === 0 || length < 0.01) return
  const end = [
    start[0] + Math.cos(angle) * length,
    start[1] + Math.sin(angle) * length
  ]
  // Draw branch
  s.strokedPath((attr) =>
    attr
      .stroke(30, 40, 20 + depth * 5)
      .strokeWidth(thickness)
      .strokeLinecap('round')
  )
    .moveTo(start)
    .lineTo(end)
  // Recursive branches
  if (depth > 1) {
    const branches = s.uniformRandomInt(2, 4)
    s.times(branches, () => {
      const angleVariation = s.gaussian(0, Math.PI / 8)
      const newAngle = angle + angleVariation
      const lengthReduction = 0.6 + s.random() * 0.15
      const newLength = length * lengthReduction
      drawTree(
        end,
        newAngle,
        newLength,
        depth - 1,
        thickness * 0.7
      )
    })
  } else {
    // Leaves at the end
    s.strokedPath((attr) =>
      attr.fill(120, 60, 40 + s.random() * 20, 0.6)
    )
      .ellipse(end, 0.015)
  }
}
// Draw multiple trees
s.times(3, (i) => {
  const x = 0.2 + i * 0.3
  drawTree(
    [x, 0.9],           // Start position
    -Math.PI / 2,       // Angle (upward)
    0.15,               // Initial length
    7,                  // Depth
    0.01                // Initial thickness
  )
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
