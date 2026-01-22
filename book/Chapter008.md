# Chapter 8: Complete Examples and Projects

## Introduction

This chapter presents complete, practical examples that demonstrate how to combine Solandra-SVG's features to create compelling graphics. Each project includes the full code and explanations.

## Project 1: Geometric Mandala

Create a symmetrical mandala with layered geometric patterns:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 123)

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

console.log(s.image)
```

## Project 2: Flow Field

Generate organic flow fields using Perlin noise:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { createNoise2D } from 'simplex-noise'  // npm install simplex-noise

const s = new SolandraSvg(800, 800, 42)
const noise = createNoise2D()

const scale = 3  // Noise scale
const particleCount = 100
const steps = 80

s.times(particleCount, (n) => {
  // Random starting point
  let pt = s.randomPoint()

  const path = s.strokedPath((attr) =>
    attr
      .noFill()
      .stroke(s.random() * 360, 70, 50, 0.7)
      .strokeWidth(0.001)
  )

  path.moveTo(pt)

  // Follow the flow field
  s.times(steps, () => {
    // Get angle from noise
    const angle = noise(pt[0] * scale, pt[1] * scale) * Math.PI * 2

    // Move in that direction
    const stepSize = 0.005
    const newPt = [
      pt[0] + Math.cos(angle) * stepSize,
      pt[1] + Math.sin(angle) * stepSize
    ]

    // Stop if out of bounds
    if (newPt[0] < 0 || newPt[0] > 1 || newPt[1] < 0 || newPt[1] > 1) {
      return
    }

    path.lineTo(newPt)
    pt = newPt
  })
})

console.log(s.image)
```

## Project 3: Procedural Trees

Create natural-looking trees with recursive branching:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 789)

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

console.log(s.image)
```

## Project 4: Islamic Geometric Pattern

Create intricate Islamic-inspired tile patterns:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800)

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

console.log(s.image)
```

## Project 5: Maze Generator

Generate random mazes using depth-first search:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 456)

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

console.log(s.image)
```

## Project 6: Sunburst Radial Pattern

Create a retro sunburst effect:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800)

const center = [0.5, 0.5]
const rays = 48
const colors = [
  [30, 80, 50],   // Orange
  [50, 80, 60]    // Yellow
]

s.times(rays, (i) => {
  const angle1 = (i / rays) * Math.PI * 2
  const angle2 = ((i + 1) / rays) * Math.PI * 2
  const radius = 0.6

  const p1 = [
    center[0] + Math.cos(angle1) * radius,
    center[1] + Math.sin(angle1) * radius
  ]

  const p2 = [
    center[0] + Math.cos(angle2) * radius,
    center[1] + Math.sin(angle2) * radius
  ]

  const color = colors[i % 2]

  s.strokedPath((attr) =>
    attr.fill(color[0], color[1], color[2]).noStroke()
  )
    .moveTo(center)
    .lineTo(p1)
    .lineTo(p2)
    .close()
})

// Center circle
s.strokedPath((attr) =>
  attr.fill(0, 0, 100)
)
  .ellipse(center, 0.15)

console.log(s.image)
```

## Project 7: Cellular Growth Simulation

Simulate organic cellular growth:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 321)

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

console.log(s.image)
```

## Project 8: Plotter-Ready Hatching

Create cross-hatching suitable for pen plotters:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 567)

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

console.log(s.image)
```

## Project 9: Generative Landscape

Create abstract landscape with layered mountains:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(1200, 600, 789)

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

console.log(s.image)
```

## Key Takeaways

These complete examples demonstrate:
- **Combining techniques**: Iteration, transformation, randomness
- **Algorithmic approaches**: Recursion, procedural generation, simulations
- **Practical applications**: Mandalas, flow fields, trees, mazes
- **Styling for purpose**: Print-ready, plotter-friendly, web graphics
- **Code organization**: Reusable functions, clear structure

Use these as starting points for your own generative art experiments. Modify parameters, combine techniques, and create something unique!

In the final chapter, we'll cover exporting your work and integrating Solandra-SVG into different environments.
