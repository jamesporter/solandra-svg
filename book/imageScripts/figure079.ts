import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Plotter-Ready Hatching
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image079.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Define a shape to hatch
const shapePath = s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0).strokeWidth(0.002)
)
  .ellipse([0.5, 0.5], 0.35)
// Create hatching
const hatchDensity = 40
const hatchAngle1 = Math.PI / 4
const hatchAngle2 = -Math.PI / 4
function drawHatching(angle, offset = 0) {
  const spacing = 1 / hatchDensity
  for (let i = -50; i < 50; i++) {
    const pos = i * spacing + offset
    const perpAngle = angle + Math.PI / 2
    const farDist = 1.5
    const start = [
      0.5 + Math.cos(perpAngle) * pos - Math.cos(angle) * farDist,
      0.5 + Math.sin(perpAngle) * pos - Math.sin(angle) * farDist
    ]
    const end = [
      0.5 + Math.cos(perpAngle) * pos + Math.cos(angle) * farDist,
      0.5 + Math.sin(perpAngle) * pos + Math.sin(angle) * farDist
    ]
    // Clip to canvas bounds
    if (start[0] >= 0 && start[0] <= 1 && start[1] >= 0 && start[1] <= 1 &&
        end[0] >= 0 && end[0] <= 1 && end[1] >= 0 && end[1] <= 1) {
      s.strokedPath((attr) =>
        attr.stroke(0, 0, 0).strokeWidth(0.001)
      )
        .moveTo(start)
        .lineTo(end)
    }
  }
}
drawHatching(hatchAngle1)
drawHatching(hatchAngle2)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
