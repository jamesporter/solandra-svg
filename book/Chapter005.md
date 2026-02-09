# Chapter 5: Iteration and Layout Helpers

## Introduction to Iteration

Creating repetitive patterns manually can be tedious. Solandra-SVG provides powerful iteration helpers that make generating grids, tiles, and patterns straightforward and expressive.

## Basic Iteration

### times() - Simple Loops

The most basic iteration method:

```typescript
const s = new SolandraSvg(400, 400)

// Execute a function 10 times
s.times(10, (i) => {
  const x = 0.1 + i * 0.08
  s.strokedPath()
    .ellipse([x, 0.5], 0.03)
})
```

The callback receives the index `i` (0-based):

```typescript
const s = new SolandraSvg(800, 800)

// Create circles with varying colors
s.times(20, (i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)  // Hue varies from 0 to 342
  )
    .ellipse([s.random(), s.random()], 0.05)
})
```

## Grid and Tiling Layouts

### forTiling() - Powerful Grid Layouts

The `forTiling()` method is one of the most useful features for creating grid-based patterns:

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling(
  { n: 5, type: 'square', margin: 0.1 },
  ([x, y], [dX, dY], [cX, cY]) => {
    // [x, y] = top-left corner
    // [dX, dY] = width and height of cell
    // [cX, cY] = center of cell

    s.strokedPath()
      .ellipse([cX, cY], dX * 0.4)
  }
)
```

Parameters explained:
- **n**: Number of tiles (5 means 5×5 grid)
- **type**: 'square' or 'proportionate'
- **margin**: Space around the grid (0.1 = 10% margin on each side)

The callback receives three arguments:
1. `[x, y]` - Top-left corner of the tile
2. `[dX, dY]` - Width and height of the tile
3. `[cX, cY]` - Center point of the tile

### Square Tiling Example

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling({ n: 6, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Note: for square type, dX = dY = d

  s.strokedPath((attr) =>
    attr.fill(x * 360, 70, 50)  // Hue based on x position
  )
    .rect([x, y], [x + d, y + d])
})
```

### Proportionate Tiling

Fills the entire canvas proportionally:

```typescript
const s = new SolandraSvg(800, 600)  // Non-square canvas

s.forTiling(
  { n: 5, type: 'proportionate', margin: 0.1 },
  ([x, y], [dX, dY], [cX, cY]) => {
    // dX and dY may be different to fill the canvas proportionally

    s.strokedPath()
      .ellipse([cX, cY], Math.min(dX, dY) * 0.4)
  }
)
```

### Tiling Order

Control the order in which tiles are visited:

```typescript
const s = new SolandraSvg(800, 800)

// Different orderings available:
// 'row-first' (default): left-to-right, top-to-bottom
// 'column-first': top-to-bottom, left-to-right
// 'random': random order

s.forTiling(
  { n: 5, type: 'square', margin: 0.1, order: 'random' },
  ([x, y], [d], [cX, cY], index) => {
    s.strokedPath((attr) =>
      attr.fill(index * 15, 70, 50)  // Color by visit order
    )
      .rect([x, y], [x + d, y + d])
  }
)
```

## Linear Layouts

### forHorizontal() - Horizontal Arrangement

Arrange items in a horizontal line:

```typescript
const s = new SolandraSvg(800, 400)

s.forHorizontal({ n: 8, margin: 0.1 }, (x, width, cX) => {
  // x = left edge
  // width = width of cell
  // cX = center x position

  s.strokedPath()
    .ellipse([cX, 0.5], width * 0.4)
})
```

### forVertical() - Vertical Arrangement

Arrange items in a vertical line:

```typescript
const s = new SolandraSvg(400, 800)

s.forVertical({ n: 8, margin: 0.1 }, (y, height, cY) => {
  // y = top edge
  // height = height of cell
  // cY = center y position

  s.strokedPath()
    .rect([0.2, y], [0.8, y + height * 0.8])
})
```

## Margin-Based Layouts

### forMargin() - Custom Margin Layout

Create layouts with specific margins:

```typescript
const s = new SolandraSvg(800, 800)

s.forMargin({ margin: 0.15 }, ([x, y], [width, height], [cX, cY]) => {
  // Create content within the margin
  s.strokedPath()
    .rect([x, y], [x + width, y + height])

  s.strokedPath()
    .ellipse([cX, cY], Math.min(width, height) * 0.4)
})
```

## Circular Arrangements

### aroundCircle() - Points on a Circle

Arrange points in a circle:

```typescript
const s = new SolandraSvg(800, 800)

const points = s.aroundCircle(12, 0.4, [0.5, 0.5])
// 12 points, radius 0.4, center at [0.5, 0.5]

points.forEach((pt, i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 30, 70, 50)
  )
    .ellipse(pt, 0.05)
})
```

Create a clock face:

```typescript
const s = new SolandraSvg(800, 800)

const center = [0.5, 0.5]
const hourPositions = s.aroundCircle(12, 0.35, center)

hourPositions.forEach((pt, i) => {
  s.strokedPath()
    .moveTo(center)
    .lineTo(pt)

  s.strokedPath((attr) => attr.fill(0, 0, 0))
    .ellipse(pt, 0.02)
})
```

## Advanced Iteration

### forGrid() - Integer Grid Iteration

Iterate over integer coordinates:

```typescript
const s = new SolandraSvg(800, 800)

s.forGrid({ from: 0, to: 10, inclusive: true }, ([x, y]) => {
  // x and y are integers from 0 to 10

  const nx = x / 10  // Normalize to 0-1
  const ny = y / 10

  s.strokedPath((attr) =>
    attr.fill((x + y) * 18, 70, 50)
  )
    .ellipse([nx, ny], 0.03)
})
```

### range() - Parametric Ranges

Create ranges for parametric designs:

```typescript
const s = new SolandraSvg(800, 800)

// Create values from 0 to 1 with 50 steps
const values = s.range({ from: 0, to: 1, steps: 50 })

values.forEach((t) => {
  const x = 0.1 + t * 0.8
  const y = 0.5 + Math.sin(t * Math.PI * 4) * 0.3

  s.strokedPath()
    .ellipse([x, y], 0.01)
})
```

### build() - Collect Results

Collect results from iteration functions:

```typescript
const s = new SolandraSvg(800, 800)

// Build an array of points
const points = s.build(10, (i) => {
  return [s.random(), s.random()]
})

// Use the points
points.forEach((pt, i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 36, 70, 50)
  )
    .ellipse(pt, 0.05)
})
```

### withRandomOrder() - Randomize Iteration

Execute iterations in random order:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.withRandomOrder(20, (i) => {
  // i is the original index, but execution order is random

  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)
  )
    .ellipse([s.random(), s.random()], 0.05)
})
```

## Practical Examples

### Checkerboard Pattern

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling({ n: 8, type: 'square', margin: 0 }, ([x, y], [d], _, __, index) => {
  const row = Math.floor(index / 8)
  const col = index % 8
  const isBlack = (row + col) % 2 === 0

  if (isBlack) {
    s.strokedPath((attr) =>
      attr.fill(0, 0, 0).noStroke()
    )
      .rect([x, y], [x + d, y + d])
  }
})
```

### Gradient Grid

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling({ n: 10, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  const lightness = 20 + (x + y) * 30

  s.strokedPath((attr) =>
    attr.fill(220, 60, lightness)
  )
    .rect([x, y], [x + d, y + d])
})
```

### Circular Pattern with Varying Sizes

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling({ n: 10, type: 'square', margin: 0.1 }, ([x, y], [d], [cX, cY]) => {
  const distFromCenter = Math.sqrt(
    Math.pow(cX - 0.5, 2) + Math.pow(cY - 0.5, 2)
  )

  const radius = d * 0.4 * (1 - distFromCenter * 1.5)

  if (radius > 0) {
    s.strokedPath((attr) =>
      attr.fill(distFromCenter * 360, 70, 50)
    )
      .ellipse([cX, cY], radius)
  }
})
```

### Radial Burst

```typescript
const s = new SolandraSvg(800, 800)

const center = [0.5, 0.5]
const rays = s.aroundCircle(24, 0.45, center)

rays.forEach((endpoint, i) => {
  s.strokedPath((attr) =>
    attr
      .stroke(i * 15, 70, 50)
      .strokeWidth(0.005)
  )
    .moveTo(center)
    .lineTo(endpoint)
})
```

### Parametric Wave

```typescript
const s = new SolandraSvg(800, 400)

const path = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.005)
)

const xValues = s.range({ from: 0, to: 1, steps: 100 })

path.moveTo([xValues[0], 0.5])

xValues.forEach((x) => {
  const y = 0.5 + Math.sin(x * Math.PI * 6) * 0.3
  path.lineTo([x, y])
})
```

### Nested Grid Pattern

```typescript
const s = new SolandraSvg(800, 800)

s.forTiling({ n: 5, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Draw outer square
  s.strokedPath((attr) =>
    attr.noFill().stroke(0, 0, 0).strokeWidth(0.002)
  )
    .rect([x, y], [x + d, y + d])

  // Draw inner circles in a 3×3 grid within each tile
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const innerX = x + (i + 0.5) * (d / 3)
      const innerY = y + (j + 0.5) * (d / 3)

      s.strokedPath((attr) =>
        attr.fill((i + j) * 60, 70, 50)
      )
        .ellipse([innerX, innerY], d / 8)
    }
  }
})
```

## Key Takeaways

- **times(n, callback)** - Simple iteration with index
- **forTiling()** - Powerful grid layouts with multiple options
- **forHorizontal()** / **forVertical()** - Linear arrangements
- **forMargin()** - Content within margins
- **aroundCircle()** - Circular point arrangements
- **forGrid()** - Integer grid iteration
- **range()** - Parametric value ranges
- **build()** - Collect iteration results
- **withRandomOrder()** - Randomize execution order

These iteration helpers dramatically simplify creating complex patterns and layouts. In the next chapter, we'll explore randomness and generative art techniques!
