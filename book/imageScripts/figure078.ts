import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Cellular Growth Simulation
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image078.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const cells = []
const maxCells = 150
const minRadius = 0.01
const maxRadius = 0.05
// Initialize with first cell
cells.push({
  pos: [0.5, 0.5],
  radius: maxRadius,
  color: s.random() * 360
})
// Grow cells
while (cells.length < maxCells) {
  let placed = false
  let attempts = 0
  while (!placed && attempts < 100) {
    const newPos = s.randomPoint()
    const newRadius = minRadius + s.random() * (maxRadius - minRadius)
    // Check if it fits
    let fits = newPos[0] - newRadius > 0 &&
               newPos[0] + newRadius < 1 &&
               newPos[1] - newRadius > 0 &&
               newPos[1] + newRadius < 1
    if (fits) {
      for (const cell of cells) {
        const dist = Math.sqrt(
          Math.pow(newPos[0] - cell.pos[0], 2) +
          Math.pow(newPos[1] - cell.pos[1], 2)
        )
        if (dist < newRadius + cell.radius) {
          fits = false
          break
        }
      }
    }
    if (fits) {
      cells.push({
        pos: newPos,
        radius: newRadius,
        color: s.random() * 360
      })
      placed = true
    }
    attempts++
  }
  if (!placed) break
}
// Draw cells
cells.forEach((cell) => {
  s.strokedPath((attr) =>
    attr
      .fill(cell.color, 70, 60, 0.7)
      .stroke(cell.color, 80, 30)
      .strokeWidth(0.001)
  )
    .ellipse(cell.pos, cell.radius)
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
