# Chapter 2: Basic Drawing with Paths

## Understanding Paths

In Solandra-SVG, paths are the fundamental building blocks for all graphics. A path is a series of connected or disconnected points and curves that define shapes and lines.

### Creating Paths

There are three main ways to create paths:

```typescript
const s = new SolandraSvg(400, 400)

// 1. Basic path (no styling)
s.path()

// 2. Stroked path (preset for line drawings)
s.strokedPath()

// 3. Path with custom attributes
s.strokedPath((attr) =>
  attr.fill(200, 80, 50).strokeWidth(0.01)
)
```

The `strokedPath()` method is a convenience preset that's commonly used for line art.

## Drawing Lines

### moveTo() - Positioning the Pen

The `moveTo()` method positions your "pen" without drawing:

```typescript
s.strokedPath()
  .moveTo([0.2, 0.2])  // Move to this point
  .lineTo([0.8, 0.8])  // Draw from here to here
```

### lineTo() - Drawing Straight Lines

Connect points with straight lines:

```typescript
const s = new SolandraSvg(400, 400)

// Simple diagonal line
s.strokedPath()
  .moveTo([0.1, 0.1])
  .lineTo([0.9, 0.9])

// Multi-segment line (zigzag)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .lineTo([0.3, 0.3])
  .lineTo([0.5, 0.7])
  .lineTo([0.7, 0.3])
  .lineTo([0.9, 0.5])
```

### close() - Closing Paths

Create closed shapes by connecting the last point back to the first:

```typescript
// Triangle
s.strokedPath()
  .moveTo([0.5, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()  // Completes the triangle
```

## Drawing Curves

### arcTo() - Smooth Arcs

The `arcTo()` method creates smooth arcs between points:

```typescript
const s = new SolandraSvg(400, 400)

// Simple arc
s.strokedPath()
  .moveTo([0.1, 0.5])
  .arcTo([0.9, 0.5])  // Creates a smooth curve

// Chain multiple arcs
s.strokedPath()
  .moveTo([0.1, 0.1])
  .arcTo([0.5, 0.3])
  .arcTo([0.9, 0.1])
  .arcTo([0.5, 0.5])
```

### curveTo() - Custom Curves

For more control, use `curveTo()` with various options:

```typescript
// Basic curve
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5])  // Cubic Bézier curve

// With polarity (curve direction)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5], { polarity: 1 })  // Curves one way

s.strokedPath()
  .moveTo([0.1, 0.6])
  .curveTo([0.9, 0.6], { polarity: -1 })  // Curves the opposite way

// With curveSize (0-1, controls curve intensity)
s.strokedPath()
  .moveTo([0.1, 0.3])
  .curveTo([0.9, 0.3], { curveSize: 0.3 })  // Gentle curve

s.strokedPath()
  .moveTo([0.1, 0.7])
  .curveTo([0.9, 0.7], { curveSize: 0.9 })  // Pronounced curve

// With custom handles (full control)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .curveTo([0.9, 0.5], {
    curveSize: 0.5,
    polarity: 1,
    curveAngle: Math.PI / 4  // 45-degree angle
  })
```

## Drawing Shapes

### rect() - Rectangles

Draw rectangles easily:

```typescript
const s = new SolandraSvg(400, 400)

// Rectangle from top-left to bottom-right
s.strokedPath()
  .rect([0.2, 0.2], [0.8, 0.8])

// Square (equal width and height)
s.strokedPath()
  .rect([0.1, 0.1], [0.4, 0.4])
```

### ellipse() - Circles and Ellipses

Create circular and elliptical shapes:

```typescript
// Circle at center with radius
s.strokedPath()
  .ellipse([0.5, 0.5], 0.3)  // center point, radius

// Ellipse (different width and height)
s.strokedPath()
  .ellipse([0.5, 0.5], 0.4, 0.2)  // center, width radius, height radius
```

### regularPolygon() - Polygons

Draw regular polygons (triangle, pentagon, hexagon, etc.):

```typescript
const s = new SolandraSvg(400, 400)

// Triangle (3 sides)
s.strokedPath()
  .regularPolygon([0.25, 0.25], 0.15, 3)

// Pentagon (5 sides)
s.strokedPath()
  .regularPolygon([0.5, 0.5], 0.2, 5)

// Hexagon (6 sides)
s.strokedPath()
  .regularPolygon([0.75, 0.25], 0.15, 6)

// Octagon (8 sides)
s.strokedPath()
  .regularPolygon([0.75, 0.75], 0.15, 8)
```

## Combining Path Elements

The real power comes from combining these elements:

```typescript
const s = new SolandraSvg(800, 800)

// Flower-like shape
const center = [0.5, 0.5]
const petalCount = 8
const radius = 0.3

s.times(petalCount, (i) => {
  const angle = (i / petalCount) * Math.PI * 2
  const petalEnd = [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius
  ]

  s.strokedPath((attr) => attr.fill(i * 30, 70, 60, 0.6))
    .moveTo(center)
    .curveTo(petalEnd, { polarity: 1, curveSize: 0.8 })
    .curveTo(center, { polarity: 1, curveSize: 0.8 })
    .close()
})

// Add center circle
s.strokedPath((attr) => attr.fill(0, 0, 30))
  .ellipse(center, 0.05)
```

## Path Presets

Solandra-SVG includes useful presets for specific use cases:

### strokedPath() - General Purpose

The default for most drawing:

```typescript
s.strokedPath()
  .moveTo([0.1, 0.1])
  .lineTo([0.9, 0.9])
```

### cutPath() - Laser Cutting

Preset with red stroke for laser cutter cut lines:

```typescript
s.cutPath()
  .rect([0.2, 0.2], [0.8, 0.8])
// Produces red lines that laser cutters recognize as cut paths
```

### creasePath() - Fold Lines

Preset with blue stroke for fold/crease lines:

```typescript
s.creasePath()
  .moveTo([0.5, 0.2])
  .lineTo([0.5, 0.8])
// Produces blue lines for folding guides
```

## Practical Examples

### Grid of Squares

```typescript
const s = new SolandraSvg(800, 800)

for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    const size = 0.15
    const spacing = 0.2
    s.strokedPath()
      .rect(
        [x * spacing + 0.05, y * spacing + 0.05],
        [x * spacing + 0.05 + size, y * spacing + 0.05 + size]
      )
  }
}
```

### Concentric Circles

```typescript
const s = new SolandraSvg(800, 800)
const center = [0.5, 0.5]

s.times(20, (i) => {
  const radius = 0.05 + i * 0.02
  s.strokedPath((attr) =>
    attr.strokeWidth(0.001).stroke(i * 10, 70, 50)
  )
    .ellipse(center, radius)
})
```

### Spiral

```typescript
const s = new SolandraSvg(800, 800)
const center = [0.5, 0.5]
const path = s.strokedPath()

const turns = 5
const steps = 200
path.moveTo(center)

for (let i = 0; i <= steps; i++) {
  const t = i / steps
  const angle = t * turns * Math.PI * 2
  const radius = t * 0.4

  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius

  path.lineTo([x, y])
}
```

## Key Takeaways

- **Paths** are chains of drawing commands (moveTo, lineTo, curveTo, etc.)
- **moveTo()** positions without drawing
- **lineTo()** draws straight lines
- **arcTo()** and **curveTo()** create smooth curves
- **Shapes** (rect, ellipse, regularPolygon) are convenience methods
- **close()** completes a shape by connecting back to the start
- **Presets** (cutPath, creasePath) provide useful defaults for specific workflows

In the next chapter, we'll explore how to style these paths with colors, strokes, and transparency!
