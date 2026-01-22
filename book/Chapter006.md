# Chapter 6: Randomness and Generative Art

## Introduction to Generative Art

Generative art uses algorithms and randomness to create unique, often unpredictable visual compositions. Solandra-SVG's deterministic random number generation (via seeds) makes it perfect for creating reproducible generative artwork.

## Understanding Seeds

Seeds enable reproducible randomness:

```typescript
// Same seed = same output every time
const s1 = new SolandraSvg(400, 400, 12345)
const s2 = new SolandraSvg(400, 400, 12345)
// s1 and s2 will generate identical graphics

// Different seed = different output
const s3 = new SolandraSvg(400, 400, 67890)
// s3 will generate different graphics
```

This is crucial for:
- Creating variations of a design
- Sharing reproducible artwork
- Systematic exploration
- Version control of generative pieces

## Basic Random Functions

### random() - Uniform Distribution

Returns a random number between 0 and 1:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(50, () => {
  const x = s.random()  // 0 to 1
  const y = s.random()  // 0 to 1
  const radius = s.random() * 0.1  // 0 to 0.1

  s.strokedPath()
    .ellipse([x, y], radius)
})
```

### randomAngle() - Random Angle

Returns a random angle from 0 to 2π:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(20, () => {
  const center = [0.5, 0.5]
  const angle = s.randomAngle()
  const length = 0.3

  const endX = center[0] + Math.cos(angle) * length
  const endY = center[1] + Math.sin(angle) * length

  s.strokedPath()
    .moveTo(center)
    .lineTo([endX, endY])
})
```

### randomPoint() - Random Point on Canvas

Returns a random [x, y] point within the canvas:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(100, () => {
  s.strokedPath()
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})
```

### uniformRandomInt() - Random Integers

Returns a random integer in a range:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(50, () => {
  const sides = s.uniformRandomInt(3, 8)  // 3 to 8 sides

  s.strokedPath((attr) =>
    attr.fill(s.random() * 360, 70, 50)
  )
    .regularPolygon([s.random(), s.random()], 0.05, sides)
})
```

### randomPolarity() - Random ±1

Returns either -1 or 1 (useful for random directions):

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(30, (i) => {
  const polarity = s.randomPolarity()

  s.strokedPath()
    .moveTo([0.1 + i * 0.03, 0.5])
    .curveTo([0.1 + (i + 1) * 0.03, 0.5], {
      polarity: polarity,
      curveSize: 0.5
    })
})
```

## Array Operations

### sample() - Random Element

Pick a random element from an array:

```typescript
const s = new SolandraSvg(800, 800, 42)

const colors = [
  [0, 70, 50],      // Red
  [120, 70, 50],    // Green
  [240, 70, 50],    // Blue
  [60, 70, 50]      // Yellow
]

s.times(20, () => {
  const color = s.sample(colors)

  s.strokedPath((attr) =>
    attr.fill(color[0], color[1], color[2])
  )
    .ellipse(s.randomPoint(), 0.05)
})
```

### samples() - Multiple Random Elements

Pick multiple random elements:

```typescript
const s = new SolandraSvg(800, 800, 42)

const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon']

const selectedShapes = s.samples(shapes, 3)
// Returns 3 random shapes (without replacement)

selectedShapes.forEach((shape, i) => {
  const x = 0.2 + i * 0.3

  if (shape === 'circle') {
    s.strokedPath().ellipse([x, 0.5], 0.1)
  } else if (shape === 'square') {
    s.strokedPath().rect([x - 0.1, 0.4], [x + 0.1, 0.6])
  }
  // ... handle other shapes
})
```

### shuffle() - Randomize Array Order

Shuffle an array using Fisher-Yates algorithm:

```typescript
const s = new SolandraSvg(800, 800, 42)

const positions = []
for (let i = 0; i < 20; i++) {
  positions.push([0.1 + i * 0.04, 0.5])
}

const shuffled = s.shuffle(positions)

shuffled.forEach((pos, i) => {
  s.strokedPath((attr) =>
    attr.fill(i * 18, 70, 50)
  )
    .ellipse(pos, 0.02)
})
```

## Statistical Distributions

### gaussian() - Normal Distribution

Generate normally distributed random values (bell curve):

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(200, () => {
  // Mean = 0.5, standard deviation = 0.1
  const x = s.gaussian(0.5, 0.1)
  const y = s.gaussian(0.5, 0.1)

  s.strokedPath((attr) =>
    attr.fill(200, 70, 50, 0.3)
  )
    .ellipse([x, y], 0.01)
})
// Creates a cluster of points around the center
```

Visualizing the distribution:

```typescript
const s = new SolandraSvg(800, 400, 42)

s.times(1000, () => {
  const x = s.random()  // Uniform across canvas
  const y = s.gaussian(0.5, 0.15)  // Clustered around middle

  s.strokedPath((attr) =>
    attr.fill(0, 0, 0, 0.1)
  )
    .ellipse([x, y], 0.003)
})
```

### poisson() - Poisson Distribution

Generate values from a Poisson distribution:

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(100, () => {
  const count = s.poisson(5)  // Lambda = 5

  s.times(count, () => {
    s.strokedPath((attr) =>
      attr.fill(count * 30, 70, 50)
    )
      .ellipse(s.randomPoint(), 0.01)
  })
})
```

## Noise and Perturbation

### perturb() - Add Noise to Points

Add random displacement to points:

```typescript
const s = new SolandraSvg(800, 800, 42)

// Create a regular grid
s.forTiling({ n: 10, type: 'square', margin: 0.1 }, ([x, y], [d], [cX, cY]) => {
  // Perturb the center point
  const perturbedPoint = s.perturb([cX, cY], 0.03)

  s.strokedPath()
    .ellipse(perturbedPoint, 0.02)
})
// Creates a slightly irregular grid
```

Amount controls the maximum displacement:

```typescript
const s = new SolandraSvg(800, 800, 42)

const path = s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0).strokeWidth(0.002)
)

// Create a wavy line by perturbing points
const y = 0.5
path.moveTo([0, y])

s.times(50, (i) => {
  const x = i / 50
  const perturbedPoint = s.perturb([x, y], 0.1)
  path.lineTo(perturbedPoint)
})
```

## Generative Patterns

### Random Walk

```typescript
const s = new SolandraSvg(800, 800, 42)

s.times(10, () => {
  let pos = s.randomPoint()
  const path = s.strokedPath((attr) =>
    attr.noFill().stroke(s.random() * 360, 70, 50).strokeWidth(0.002)
  )

  path.moveTo(pos)

  s.times(100, () => {
    const angle = s.randomAngle()
    const stepSize = 0.01

    pos = [
      pos[0] + Math.cos(angle) * stepSize,
      pos[1] + Math.sin(angle) * stepSize
    ]

    path.lineTo(pos)
  })
})
```

### Organic Shapes

Use randomness to create organic, natural-looking forms:

```typescript
const s = new SolandraSvg(800, 800, 42)

const center = [0.5, 0.5]
const points = 12

const path = s.strokedPath((attr) =>
  attr.fill(150, 60, 50, 0.7).strokeWidth(0.002)
)

const vertices = []
s.times(points, (i) => {
  const angle = (i / points) * Math.PI * 2
  const radius = 0.2 + s.gaussian(0, 0.05)  // Varying radius

  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius
  vertices.push([x, y])
})

path.moveTo(vertices[0])
vertices.forEach((v) => {
  path.curveTo(v, { curveSize: s.random() * 0.5 })
})
path.close()
```

### Scattered Composition

```typescript
const s = new SolandraSvg(800, 800, 42)

const palette = [
  [0, 70, 50],
  [30, 70, 50],
  [200, 70, 50],
  [280, 70, 50]
]

s.times(150, () => {
  const pos = s.randomPoint()
  const size = s.random() * 0.08 + 0.01
  const color = s.sample(palette)
  const opacity = s.random() * 0.5 + 0.3

  s.strokedPath((attr) =>
    attr.fill(color[0], color[1], color[2], opacity)
  )
    .ellipse(pos, size)
})
```

### Random Grid Disruption

```typescript
const s = new SolandraSvg(800, 800, 42)

s.forTiling({ n: 15, type: 'square', margin: 0.05 }, ([x, y], [d], [cX, cY]) => {
  // Randomly skip some cells
  if (s.random() < 0.3) return

  // Random rotation
  const rotation = s.random() * Math.PI * 2

  s.group((t) =>
    t.translate([cX, cY]).rotate(rotation),
    () => {
      const size = d * (0.3 + s.random() * 0.5)

      s.strokedPath((attr) =>
        attr.fill(s.random() * 360, 70, 50)
      )
        .rect([-size/2, -size/2], [size/2, size/2])
    }
  )
})
```

### Branching Structure

```typescript
const s = new SolandraSvg(800, 800, 42)

function branch(start, angle, length, depth) {
  if (depth === 0 || length < 0.01) return

  const end = [
    start[0] + Math.cos(angle) * length,
    start[1] + Math.sin(angle) * length
  ]

  s.strokedPath((attr) =>
    attr.stroke(0, 0, 0).strokeWidth(depth * 0.002)
  )
    .moveTo(start)
    .lineTo(end)

  // Random branching
  const numBranches = s.uniformRandomInt(2, 4)

  s.times(numBranches, () => {
    const newAngle = angle + s.gaussian(0, Math.PI / 6)
    const newLength = length * (0.6 + s.random() * 0.2)

    branch(end, newAngle, newLength, depth - 1)
  })
}

// Start the tree
branch([0.5, 0.9], -Math.PI / 2, 0.15, 5)
```

### Cellular/Voronoi-like Pattern

```typescript
const s = new SolandraSvg(800, 800, 42)

// Generate random seed points
const seedPoints = s.build(30, () => s.randomPoint())

// Create cells around each seed
s.forTiling({ n: 50, type: 'square', margin: 0 }, ([x, y], [d], [cX, cY]) => {
  // Find nearest seed point
  let minDist = Infinity
  let nearestIndex = 0

  seedPoints.forEach((seed, i) => {
    const dist = Math.sqrt(
      Math.pow(cX - seed[0], 2) + Math.pow(cY - seed[1], 2)
    )
    if (dist < minDist) {
      minDist = dist
      nearestIndex = i
    }
  })

  s.strokedPath((attr) =>
    attr.fill(nearestIndex * 12, 70, 50).strokeWidth(0.001)
  )
    .rect([x, y], [x + d, y + d])
})
```

## Controlled Randomness

### Probability-Based Decisions

```typescript
const s = new SolandraSvg(800, 800, 42)

s.forTiling({ n: 20, type: 'square', margin: 0 }, ([x, y], [d], [cX, cY]) => {
  // 70% chance of drawing a circle, 30% chance of square
  if (s.random() < 0.7) {
    s.strokedPath().ellipse([cX, cY], d * 0.4)
  } else {
    s.strokedPath().rect([x, y], [x + d, y + d])
  }
})
```

### Weighted Randomness

```typescript
const s = new SolandraSvg(800, 800, 42)

function weightedChoice(options, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let rand = s.random() * total

  for (let i = 0; i < options.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return options[i]
  }

  return options[options.length - 1]
}

const shapes = ['circle', 'square', 'triangle']
const weights = [5, 2, 1]  // Circles most common

s.times(50, () => {
  const shape = weightedChoice(shapes, weights)
  const pos = s.randomPoint()

  if (shape === 'circle') {
    s.strokedPath().ellipse(pos, 0.03)
  } else if (shape === 'square') {
    s.strokedPath().rect([pos[0] - 0.03, pos[1] - 0.03],
                          [pos[0] + 0.03, pos[1] + 0.03])
  } else {
    s.strokedPath().regularPolygon(pos, 0.03, 3)
  }
})
```

## Key Takeaways

- **Seeds** enable reproducible randomness
- **random()** - uniform 0-1 distribution
- **randomAngle()** - random angle 0-2π
- **randomPoint()** - random canvas point
- **uniformRandomInt()** - random integers
- **randomPolarity()** - random ±1
- **sample()** / **samples()** - random array selection
- **shuffle()** - randomize array order
- **gaussian()** - normal distribution (clustering)
- **poisson()** - Poisson distribution
- **perturb()** - add random displacement
- Combine randomness with iteration for powerful generative patterns

In the next chapter, we'll explore advanced path operations for sophisticated graphics!
