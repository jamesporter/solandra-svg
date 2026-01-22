# Chapter 7: Advanced Path Operations

## Introduction

Beyond basic drawing, Solandra-SVG provides powerful path manipulation tools that allow you to transform, smooth, and clone paths programmatically. These advanced operations enable sophisticated graphics with less code.

## Path Smoothing with Chaiken

### chaiken() - Corner Cutting Algorithm

The Chaiken algorithm smooths paths by iteratively cutting corners, creating flowing, organic curves from angular paths:

```typescript
const s = new SolandraSvg(800, 800)

// Create an angular path
const rough = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.002)
)
  .moveTo([0.1, 0.5])
  .lineTo([0.3, 0.2])
  .lineTo([0.5, 0.8])
  .lineTo([0.7, 0.3])
  .lineTo([0.9, 0.6])

// Smooth it with Chaiken
const smooth = rough.chaiken()
```

The `chaiken()` method accepts an iterations parameter (default is 4):

```typescript
const s = new SolandraSvg(800, 800)

const original = s.strokedPath()
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()

// Light smoothing (1 iteration)
s.strokedPath((attr) => attr.stroke(0, 70, 50))
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
  .chaiken(1)

// Heavy smoothing (6 iterations)
s.strokedPath((attr) => attr.stroke(240, 70, 50))
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
  .chaiken(6)
```

### Practical Chaiken Examples

**Smooth Random Walk:**

```typescript
const s = new SolandraSvg(800, 800, 42)

let pos = [0.1, 0.5]
const path = s.strokedPath((attr) =>
  attr.noFill().stroke(180, 70, 50).strokeWidth(0.003)
)

path.moveTo(pos)

s.times(15, () => {
  pos = [
    pos[0] + s.random() * 0.1,
    pos[1] + (s.random() - 0.5) * 0.2
  ]
  path.lineTo(pos)
})

// Apply smoothing
path.chaiken(4)
```

**Organic Shapes from Polygons:**

```typescript
const s = new SolandraSvg(800, 800)

s.strokedPath((attr) =>
  attr.fill(150, 60, 50, 0.7).strokeWidth(0.001)
)
  .regularPolygon([0.5, 0.5], 0.3, 6)
  .chaiken(5)
// Hexagon becomes a smooth, organic blob
```

**Natural Terrain:**

```typescript
const s = new SolandraSvg(800, 400, 42)

const terrain = s.strokedPath((attr) =>
  attr.fill(120, 50, 40).stroke(80, 60, 30).strokeWidth(0.002)
)

terrain.moveTo([0, 0.7])

s.times(20, (i) => {
  const x = i / 19
  const y = 0.5 + s.gaussian(0, 0.1)
  terrain.lineTo([x, y])
})

terrain.lineTo([1, 0.7])
  .lineTo([1, 1])
  .lineTo([0, 1])
  .close()
  .chaiken(3)
```

## Path Transformation with map()

### map() - Transform Path Segments

The `map()` method applies a transformation to each segment of a path:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.strokedPath()
  .moveTo([0.2, 0.5])
  .lineTo([0.8, 0.5])
  .map((segment) => {
    // Add random vertical offset to each point
    return {
      ...segment,
      to: [segment.to[0], segment.to[1] + (s.random() - 0.5) * 0.1]
    }
  })
```

The callback receives segment objects with properties like:
- `to`: The endpoint coordinates
- `command`: The drawing command ('M', 'L', 'C', etc.)

### Practical map() Examples

**Wavy Line Effect:**

```typescript
const s = new SolandraSvg(800, 800)

const steps = 50
const path = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.003)
)

path.moveTo([0.1, 0.5])

s.times(steps, (i) => {
  path.lineTo([0.1 + (i / steps) * 0.8, 0.5])
})

path.map((segment, index) => {
  return {
    ...segment,
    to: [
      segment.to[0],
      segment.to[1] + Math.sin(index * 0.5) * 0.1
    ]
  }
})
```

**Displacement Effect:**

```typescript
const s = new SolandraSvg(800, 800, 42)

s.strokedPath()
  .rect([0.2, 0.2], [0.8, 0.8])
  .map((segment) => {
    // Displace each point randomly
    return {
      ...segment,
      to: s.perturb(segment.to, 0.05)
    }
  })
```

## Path Cloning

### clone() - Duplicate Paths with Modifications

Create copies of paths with different attributes:

```typescript
const s = new SolandraSvg(800, 800)

// Create original path
const original = s.strokedPath((attr) =>
  attr.fill(0, 70, 50)
)
  .ellipse([0.5, 0.5], 0.2)

// Clone with different attributes
original.clone((attr) =>
  attr.fill(120, 70, 50).opacity(0.5)
)

original.clone((attr) =>
  attr.fill(240, 70, 50).opacity(0.5)
)
```

### Clone with Transformations

Combine cloning with groups for interesting effects:

```typescript
const s = new SolandraSvg(800, 800)

const original = s.strokedPath((attr) =>
  attr.fill(200, 70, 50, 0.6)
)
  .regularPolygon([0.5, 0.5], 0.15, 5)

// Create rotated copies
s.times(8, (i) => {
  s.group((t) => t.rotate((i / 8) * Math.PI * 2), () => {
    original.clone((attr) =>
      attr.fill(i * 45, 70, 50, 0.4)
    )
  })
})
```

## Combining Advanced Operations

### Smooth Random Shapes

```typescript
const s = new SolandraSvg(800, 800, 42)

const center = [0.5, 0.5]
const points = 8

const shape = s.strokedPath((attr) =>
  attr.fill(280, 60, 50, 0.7).strokeWidth(0.002)
)

const vertices = s.aroundCircle(points, 0.3, center)

shape.moveTo(vertices[0])

vertices.forEach((v) => {
  const perturbedV = s.perturb(v, 0.08)
  shape.lineTo(perturbedV)
})

shape.close().chaiken(4)
```

### Layered Smooth Paths

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(5, (layer) => {
  const path = s.strokedPath((attr) =>
    attr
      .fill(layer * 60, 70, 50, 0.3)
      .strokeWidth(0.001)
  )

  path.moveTo([0.1, 0.3 + layer * 0.08])

  s.times(10, (i) => {
    const x = 0.1 + (i / 9) * 0.8
    const y = 0.3 + layer * 0.08 + s.gaussian(0, 0.03)
    path.lineTo([x, y])
  })

  path.chaiken(3)
})
```

### Iterative Smoothing with Clones

```typescript
const s = new SolandraSvg(800, 800)

// Create base angular shape
let currentPath = s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0, 1).strokeWidth(0.002)
)
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()

// Show progressive smoothing
s.times(6, (i) => {
  const smoothed = currentPath.chaiken(1)

  smoothed.clone((attr) =>
    attr.stroke(i * 60, 70, 50, 0.7 - i * 0.1).strokeWidth(0.001)
  )

  currentPath = smoothed
})
```

### Complex Map Transformations

```typescript
const s = new SolandraSvg(800, 800, 42)

const spiral = s.strokedPath((attr) =>
  attr.noFill().stroke(200, 70, 50).strokeWidth(0.002)
)

const center = [0.5, 0.5]
const turns = 3
const steps = 100

spiral.moveTo(center)

s.times(steps, (i) => {
  const t = i / steps
  const angle = t * turns * Math.PI * 2
  const radius = t * 0.4

  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius

  spiral.lineTo([x, y])
})

// Add wobble to the spiral
spiral.map((segment, index) => {
  if (index === 0) return segment

  const wobble = Math.sin(index * 0.3) * 0.02

  return {
    ...segment,
    to: [
      segment.to[0] + wobble,
      segment.to[1] + wobble
    ]
  }
})
```

## Advanced Composition Techniques

### Mirrored Paths

```typescript
const s = new SolandraSvg(800, 800, 42)

// Create one half
const halfPath = s.strokedPath((attr) =>
  attr.fill(180, 70, 50, 0.7)
)

halfPath.moveTo([0.5, 0.2])

s.times(10, (i) => {
  const t = i / 9
  const x = 0.5 + t * 0.3
  const y = 0.2 + Math.sin(t * Math.PI) * 0.4 + s.gaussian(0, 0.02)
  halfPath.lineTo([x, y])
})

halfPath.lineTo([0.5, 0.8]).close().chaiken(3)

// Mirror it
halfPath.clone().map((segment) => {
  return {
    ...segment,
    to: [1 - segment.to[0], segment.to[1]]
  }
})
```

### Kaleidoscope Effect

```typescript
const s = new SolandraSvg(800, 800, 42)

// Create one segment
const segment = s.strokedPath((attr) =>
  attr.fill(300, 70, 50, 0.6)
)
  .moveTo([0.5, 0.5])
  .lineTo([0.5, 0.2])
  .lineTo([0.6, 0.25])
  .close()
  .chaiken(2)

// Repeat in circle
const segments = 12
s.times(segments, (i) => {
  const angle = (i / segments) * Math.PI * 2

  s.group((t) =>
    t.translate([0.5, 0.5]).rotate(angle).translate([-0.5, -0.5]),
    () => {
      segment.clone((attr) =>
        attr.fill(i * 30, 70, 50, 0.6)
      )
    }
  )
})
```

### Deformed Grid

```typescript
const s = new SolandraSvg(800, 800, 42)

s.forTiling({ n: 8, type: 'square', margin: 0.1 }, ([x, y], [d]) => {
  const path = s.strokedPath((attr) =>
    attr.noFill().stroke(0, 0, 0).strokeWidth(0.001)
  )
    .rect([x, y], [x + d, y + d])

  // Deform each rectangle
  path.map((segment, index) => {
    if (index === 0) return segment

    return {
      ...segment,
      to: s.perturb(segment.to, 0.01)
    }
  })
})
```

## Performance Considerations

Advanced operations can be computationally intensive:

```typescript
const s = new SolandraSvg(800, 800)

// Efficient: Apply Chaiken once
const path = s.strokedPath()
  .moveTo([0.1, 0.5])
  .lineTo([0.5, 0.2])
  .lineTo([0.9, 0.5])
  .chaiken(4)

// Less efficient: Multiple Chaiken calls
// Avoid doing this in loops
```

## Key Takeaways

- **chaiken()** smooths paths using corner-cutting algorithm
  - More iterations = smoother curves
  - Great for organic shapes from angular paths
- **map()** transforms each segment of a path
  - Useful for displacement, waves, and custom effects
  - Receives segment objects with `to`, `command`, etc.
- **clone()** duplicates paths with different attributes
  - Combine with transformations for complex patterns
  - Efficient way to create variations
- **Combine operations** for sophisticated effects:
  - Smooth random shapes with chaiken
  - Clone and transform for kaleidoscope effects
  - Map for custom distortions

In the next chapter, we'll put everything together with complete examples and project ideas!
