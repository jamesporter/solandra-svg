# Chapter 4: Transformations

## Understanding Transformations

Transformations allow you to modify the position, rotation, scale, and skew of your graphics. In Solandra-SVG, transformations are applied using the `Transform` class or through groups with transformations.

## Creating Transforms

There are several ways to create and apply transformations:

### Using the Transform Class

```typescript
const s = new SolandraSvg(400, 400)

// Create a transform
const transform = new Transform()
  .rotate(Math.PI / 4)        // Rotate 45 degrees
  .translate([0.1, 0.1])      // Move right and down
```

### Shorthand with s.T

```typescript
const s = new SolandraSvg(400, 400)

// s.T is shorthand for new Transform()
const transform = s.T
  .rotate(Math.PI / 4)
  .scale(1.5)
```

## Basic Transformations

### rotate() - Rotation

Rotate shapes around a point (angle in radians):

```typescript
const s = new SolandraSvg(400, 400)

// Rotate a square 45 degrees
s.group((transform) => transform.rotate(Math.PI / 4), () => {
  s.strokedPath()
    .rect([0.3, 0.3], [0.7, 0.7])
})
```

Remember: Radians conversion
- 0 radians = 0°
- Math.PI / 4 = 45°
- Math.PI / 2 = 90°
- Math.PI = 180°
- 2 * Math.PI = 360°

```typescript
const s = new SolandraSvg(400, 400)

// Create a rotated pattern
s.times(8, (i) => {
  const angle = (i / 8) * Math.PI * 2  // 0 to 2π

  s.group((t) => t.rotate(angle), () => {
    s.strokedPath((attr) => attr.fill(i * 40, 70, 50))
      .rect([0.45, 0.1], [0.55, 0.4])
  })
})
```

### translate() - Position

Move shapes horizontally and vertically:

```typescript
const s = new SolandraSvg(400, 400)

// Move a circle to the right and down
s.group((t) => t.translate([0.3, 0.2]), () => {
  s.strokedPath()
    .ellipse([0.2, 0.2], 0.1)  // Original position [0.2, 0.2]
                                 // Will appear at [0.5, 0.4]
})
```

Creating a grid with translation:

```typescript
const s = new SolandraSvg(800, 800)

for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    s.group((t) => t.translate([x * 0.2, y * 0.2]), () => {
      s.strokedPath((attr) => attr.fill((x + y) * 20, 70, 50))
        .ellipse([0.1, 0.1], 0.08)
    })
  }
}
```

### scale() - Scaling

Make shapes larger or smaller:

```typescript
const s = new SolandraSvg(400, 400)

// Uniform scaling (same in both directions)
s.group((t) => t.scale(2), () => {
  s.strokedPath()
    .ellipse([0.5, 0.5], 0.1)  // Will appear twice as large
})

// Non-uniform scaling [scaleX, scaleY]
s.group((t) => t.scale([2, 0.5]), () => {
  s.strokedPath()
    .ellipse([0.5, 0.5], 0.1)  // Wide and flat ellipse
})
```

Growing circles:

```typescript
const s = new SolandraSvg(800, 800)

s.times(10, (i) => {
  const scaleFactor = 0.2 + i * 0.1

  s.group((t) => t.scale(scaleFactor), () => {
    s.strokedPath((attr) =>
      attr.noFill().stroke(i * 30, 70, 50).strokeWidth(0.005)
    )
      .ellipse([0.5, 0.5], 0.4)
  })
})
```

### skewX() and skewY() - Skewing

Create slanted/sheared shapes:

```typescript
const s = new SolandraSvg(400, 400)

// Skew horizontally
s.group((t) => t.skewX(Math.PI / 6), () => {
  s.strokedPath()
    .rect([0.2, 0.2], [0.5, 0.5])
})

// Skew vertically
s.group((t) => t.skewY(Math.PI / 6), () => {
  s.strokedPath()
    .rect([0.6, 0.2], [0.9, 0.5])
})
```

## Combining Transformations

Chain multiple transformations together:

```typescript
const s = new SolandraSvg(400, 400)

s.group((t) =>
  t
    .translate([0.5, 0.5])      // Move to center
    .rotate(Math.PI / 4)        // Rotate 45 degrees
    .scale(1.5)                 // Make 50% larger
    .translate([-0.1, -0.1]),   // Offset
  () => {
    s.strokedPath()
      .rect([0, 0], [0.2, 0.2])
  }
)
```

**Important**: The order of transformations matters!

```typescript
const s = new SolandraSvg(800, 800)

// Translate then rotate
s.group((t) => t.translate([0.3, 0]).rotate(Math.PI / 4), () => {
  s.strokedPath((attr) => attr.fill(0, 70, 50))
    .rect([0.2, 0.2], [0.4, 0.4])
})

// Rotate then translate (different result!)
s.group((t) => t.rotate(Math.PI / 4).translate([0.3, 0]), () => {
  s.strokedPath((attr) => attr.fill(240, 70, 50))
    .rect([0.2, 0.2], [0.4, 0.4])
})
```

## Groups with Transformations

Groups allow you to apply transformations to multiple shapes at once:

### Basic Group

```typescript
const s = new SolandraSvg(400, 400)

s.group((t) => t.rotate(Math.PI / 6), () => {
  // Everything in here is rotated
  s.strokedPath().ellipse([0.3, 0.5], 0.1)
  s.strokedPath().ellipse([0.7, 0.5], 0.1)
  s.strokedPath().moveTo([0.3, 0.5]).lineTo([0.7, 0.5])
})
```

### Nested Groups

Groups can be nested for hierarchical transformations:

```typescript
const s = new SolandraSvg(800, 800)

s.group((t) => t.translate([0.5, 0.5]), () => {
  // Outer group: move to center

  s.times(6, (i) => {
    const angle = (i / 6) * Math.PI * 2

    s.group((t) => t.rotate(angle), () => {
      // Inner groups: rotate around center

      s.strokedPath((attr) => attr.fill(i * 60, 70, 50))
        .ellipse([0.2, 0], 0.05)
    })
  })
})
```

### Groups with IDs

Create identifiable groups:

```typescript
const s = new SolandraSvg(400, 400)

s.groupWithId(
  'my-group',
  (t) => t.rotate(Math.PI / 4),
  () => {
    s.strokedPath().rect([0.2, 0.2], [0.8, 0.8])
  }
)
```

## Practical Examples

### Rotating Star Pattern

```typescript
const s = new SolandraSvg(800, 800)

const points = 12
s.times(points, (i) => {
  const angle = (i / points) * Math.PI * 2

  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .rotate(angle),
    () => {
      s.strokedPath((attr) =>
        attr
          .fill(i * 30, 80, 60, 0.7)
          .strokeWidth(0.002)
      )
        .moveTo([0, 0])
        .lineTo([0.4, 0])
        .lineTo([0.3, -0.1])
        .close()
    }
  )
})
```

### Spirograph Effect

```typescript
const s = new SolandraSvg(800, 800)

s.times(36, (i) => {
  const angle = (i / 36) * Math.PI * 2
  const scale = 0.3 + Math.sin(i * 0.5) * 0.2

  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .rotate(angle)
      .scale(scale),
    () => {
      s.strokedPath((attr) =>
        attr.fill(i * 10, 70, 60, 0.3)
      )
        .ellipse([0.3, 0], 0.1)
    }
  )
})
```

### Grid with Random Rotations

```typescript
const s = new SolandraSvg(800, 800, 123)

const gridSize = 5
const spacing = 1 / gridSize

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    const posX = x * spacing + spacing / 2
    const posY = y * spacing + spacing / 2
    const rotation = s.random() * Math.PI * 2

    s.group((t) =>
      t
        .translate([posX, posY])
        .rotate(rotation),
      () => {
        s.strokedPath((attr) =>
          attr.fill((x + y) * 20, 70, 50)
        )
          .rect([-spacing * 0.3, -spacing * 0.3],
                [spacing * 0.3, spacing * 0.3])
      }
    )
  }
}
```

### Scaling Animation Effect

Create a "bursting" effect with scaled elements:

```typescript
const s = new SolandraSvg(800, 800)

s.times(20, (i) => {
  const scaleFactor = 0.1 + i * 0.05
  const opacity = 1 - (i / 20)

  s.group((t) =>
    t
      .translate([0.5, 0.5])
      .scale(scaleFactor),
    () => {
      s.strokedPath((attr) =>
        attr
          .noFill()
          .stroke(200, 70, 50)
          .strokeWidth(0.01)
          .opacity(opacity)
      )
        .regularPolygon([0, 0], 0.5, 6)
    }
  )
})
```

### Perspective Effect with Skew

```typescript
const s = new SolandraSvg(800, 600)

// Create a pseudo-3D floor pattern
const rows = 10
for (let i = 0; i < rows; i++) {
  const y = 0.3 + i * 0.05
  const skewAmount = (i / rows) * Math.PI / 6

  s.group((t) =>
    t
      .translate([0, y])
      .skewX(skewAmount),
    () => {
      s.strokedPath((attr) =>
        attr.strokeWidth(0.002).stroke(0, 0, 20 + i * 5)
      )
        .moveTo([0.2, 0])
        .lineTo([0.8, 0])
    }
  )
}
```

## Transform Origins

By default, transformations occur around the origin [0, 0]. You can change this using `transformOrigin()` in attributes:

```typescript
const s = new SolandraSvg(400, 400)

// Rotate around the center of the shape
s.strokedPath((attr) =>
  attr.transformOrigin([0.5, 0.5])
)
  .rect([0.2, 0.2], [0.8, 0.8])

// Apply rotation to the group
s.group((t) => t.rotate(Math.PI / 4), () => {
  s.strokedPath((attr) => attr.transformOrigin([0.5, 0.5]))
    .rect([0.2, 0.2], [0.8, 0.8])
})
```

## Key Takeaways

- **rotate()** rotates shapes (use radians: Math.PI = 180°)
- **translate()** moves shapes horizontally and vertically
- **scale()** changes size (uniform or non-uniform)
- **skewX()** and **skewY()** create slanted effects
- **Groups** apply transformations to multiple shapes
- **Transformation order matters** - different orders produce different results
- **Nested groups** create hierarchical transformations
- **transformOrigin()** controls the center point of transformations

In the next chapter, we'll explore iteration and layout helpers that make creating complex patterns much easier!
