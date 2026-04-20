# Chapter 1: Introduction and Getting Started

## What is Solandra-SVG?

Solandra-SVG is a declarative, fluent, and type-safe TypeScript library for creating dynamic and static SVG graphics. It's designed specifically for generative art, algorithmic design, and creative coding, providing an elegant API that makes complex graphics simple to create.

### Key Features

- **Zero Dependencies**: Lightweight and standalone
- **Type-Safe**: Full TypeScript support with excellent IntelliSense
- **Declarative API**: Fluent, chainable methods for intuitive coding
- **Deterministic**: Seeded randomness for reproducible artwork
- **Export-Friendly**: Generate SVG for web, plotting, laser cutting, or Inkscape

### What Can You Create?

With Solandra-SVG, you can create:

- Generative art and algorithmic patterns
- Flow fields and noise-based compositions
- Geometric designs and tessellations
- Plotter-ready line art
- Laser-cut and fold patterns
- Interactive parametric graphics
- Data visualizations
- Abstract and organic forms

## Installation

Install Solandra-SVG via npm:

```bash
npm install solandra-svg
```

Or with yarn:

```bash
yarn add solandra-svg
```

## Your First Drawing

Let's create a simple drawing to get started. The basic workflow is:

1. Create a `SolandraSvg` instance with dimensions
2. Draw paths with various methods
3. Export the SVG

```typescript
import { SolandraSvg } from 'solandra-svg'

// Create a canvas: width, height, optional seed for randomness
const s = new SolandraSvg(400, 400)

// Draw a simple line
s.strokedPath()
  .moveTo([0.1, 0.1])  // Start position [x, y]
  .lineTo([0.9, 0.9])  // End position

// Get the SVG output
const svg = s.image
console.log(svg)
```

### Understanding Coordinates

Solandra-SVG uses **normalized coordinates** from 0 to 1 by default:

- `[0, 0]` is the top-left corner
- `[1, 1]` is the bottom-right corner
- `[0.5, 0.5]` is the center

This makes your code resolution-independent and easy to scale.

## A More Interesting Example

Let's create something more visually interesting with randomness:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800, 42) // 42 is the random seed

// Draw 50 random arcs
s.times(50, () => {
  s.strokedPath()
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})

// Export as SVG
const svg = s.image
```

This creates 50 curved lines connecting random points. The seed (42) ensures that running this code will always produce the same image.

## Adding Color and Style

You can customize the appearance using attributes:

```typescript
const s = new SolandraSvg(800, 800)

s.times(25, (i) => {
  // Create a path with custom attributes
  s.strokedPath((attr) =>
    attr
      .fill(i * 10, 80, 60, 0.5)  // HSL: hue, saturation, lightness, opacity
      .strokeWidth(0.002)
      .stroke(0, 0, 0)  // Black stroke
  )
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})
```

This creates 25 arcs with varying hues, semi-transparent fills, and thin black strokes.

## Working with Seeds

One of Solandra-SVG's powerful features is deterministic randomness:

```typescript
// Same seed = same output
const s1 = new SolandraSvg(400, 400, 12345)
const s2 = new SolandraSvg(400, 400, 12345)
// s1 and s2 will produce identical graphics

// Different seed = different output
const s3 = new SolandraSvg(400, 400, 67890)
// s3 will produce different graphics
```

This is invaluable for:
- Creating variations of a design
- Reproducing specific outputs
- Systematic exploration of generative space

## Exporting Your Work

Solandra-SVG provides multiple export options:

```typescript
const s = new SolandraSvg(400, 400)
// ... create your artwork ...

// Get SVG as string
const svgString = s.image

// Get data URL (for img src)
const dataUrl = s.imageSrc()

// For Inkscape (millimeters instead of pixels)
const inkscapeSvg = s.UNSTABLE_imageInkscapeReady
```

### Saving to a File (Node.js)

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

const s = new SolandraSvg(800, 800)
// ... create your artwork ...

writeFileSync('output.svg', s.image)
```

### Using in a Web Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>Solandra-SVG Example</title>
</head>
<body>
  <div id="artwork"></div>

  <script type="module">
    import { SolandraSvg } from './node_modules/solandra-svg/dist/index.js'

    const s = new SolandraSvg(600, 600)
    s.times(30, () => {
      s.strokedPath().moveTo(s.randomPoint()).arcTo(s.randomPoint())
    })

    document.getElementById('artwork').innerHTML = s.image
  </script>
</body>
</html>
```

## Next Steps

Now that you've created your first drawings, you're ready to explore:

- **Chapter 2**: Learn all the path drawing methods
- **Chapter 3**: Master attributes and styling
- **Chapter 4**: Apply transformations (rotate, scale, translate)
- **Chapter 5**: Use iteration helpers for complex layouts
- **Chapter 6**: Dive deep into randomness and generative techniques

The journey into algorithmic art begins here!
