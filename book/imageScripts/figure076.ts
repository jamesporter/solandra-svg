import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Maze Generator
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image076.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const gridSize = 15
const cellSize = 0.9 / gridSize
const margin = 0.05
// Initialize grid
const visited = Array(gridSize).fill(null).map(() =>
  Array(gridSize).fill(false)
)
const walls = {
  horizontal: Array(gridSize + 1).fill(null).map(() =>
    Array(gridSize).fill(true)
  ),
  vertical: Array(gridSize).fill(null).map(() =>
    Array(gridSize + 1).fill(true)
  )
}
// Recursive backtracking maze generation
function carveMaze(x, y) {
  visited[y][x] = true
  const directions = s.shuffle([
    [0, -1], [1, 0], [0, 1], [-1, 0]  // up, right, down, left
  ])
  directions.forEach(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize &&
        !visited[ny][nx]) {
      // Remove wall
      if (dx === 1) walls.vertical[y][x + 1] = false
      if (dx === -1) walls.vertical[y][x] = false
      if (dy === 1) walls.horizontal[y + 1][x] = false
      if (dy === -1) walls.horizontal[y][x] = false
      carveMaze(nx, ny)
    }
  })
}
carveMaze(0, 0)
// Draw maze
s.forGrid({ from: 0, to: gridSize, inclusive: true }, ([x, y]) => {
  const px = margin + x * cellSize
  const py = margin + y * cellSize
  // Draw horizontal walls
  if (y < gridSize + 1 && x < gridSize && walls.horizontal[y][x]) {
    s.strokedPath((attr) =>
      attr.stroke(0, 0, 0).strokeWidth(0.003)
    )
      .moveTo([px, py])
      .lineTo([px + cellSize, py])
  }
  // Draw vertical walls
  if (x < gridSize + 1 && y < gridSize && walls.vertical[y][x]) {
    s.strokedPath((attr) =>
      attr.stroke(0, 0, 0).strokeWidth(0.003)
    )
      .moveTo([px, py])
      .lineTo([px, py + cellSize])
  }
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
