# Chapter 9: Exporting and Integration

## Introduction

Solandra-SVG provides multiple ways to export and integrate your graphics into various workflows. This chapter covers exporting to files, embedding in web pages, preparing for plotters and laser cutters, and integrating with other tools.

## Export Methods

### image - Basic SVG Export

The simplest way to get your SVG:

```typescript
import { SolandraSvg } from 'solandra-svg'

const s = new SolandraSvg(800, 800)

// ... create your artwork ...

const svgString = s.image
console.log(svgString)
```

This returns the complete SVG markup as a string, ready to save or embed.

### imageSrc() - Data URL

Get a data URL for direct embedding in HTML:

```typescript
const s = new SolandraSvg(400, 400)

// ... create your artwork ...

const dataUrl = s.imageSrc()
// Returns: "data:image/svg+xml;base64,..."

// Use in HTML:
// <img src="${dataUrl}" />
```

This is perfect for:
- Dynamic web content
- Email-safe graphics
- Inline embedding without external files

### UNSTABLE_imageInkscapeReady - Inkscape Export

For graphics that will be edited in Inkscape, use millimeter-based output:

```typescript
const s = new SolandraSvg(210, 297)  // A4 size in mm

// ... create your artwork ...

const inkscapeSvg = s.UNSTABLE_imageInkscapeReady

// Save this for opening in Inkscape
```

Note: This feature is marked as unstable and may change in future versions.

## Saving to Files (Node.js)

### Basic File Save

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

const s = new SolandraSvg(800, 800, 42)

// ... create your artwork ...

// Save to file
writeFileSync('output.svg', s.image, 'utf8')
console.log('Saved to output.svg')
```

### Batch Generation

Generate multiple variations:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Create output directory
mkdirSync('generated', { recursive: true })

// Generate 20 variations
for (let i = 0; i < 20; i++) {
  const s = new SolandraSvg(800, 800, i)  // Different seed each time

  // ... create your artwork ...

  const filename = join('generated', `artwork-${String(i).padStart(3, '0')}.svg`)
  writeFileSync(filename, s.image, 'utf8')

  console.log(`Generated ${filename}`)
}
```

### Parameterized Generation

Create variations with different parameters:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

function generatePattern(seed, layers, colors) {
  const s = new SolandraSvg(800, 800, seed)

  s.times(layers, (layer) => {
    const hue = colors[layer % colors.length]

    s.forTiling(
      { n: 5 + layer, type: 'square', margin: 0.1 },
      ([x, y], [d], [cX, cY]) => {
        s.strokedPath((attr) =>
          attr.fill(hue, 70, 50, 0.5)
        )
          .ellipse([cX, cY], d * 0.4)
      }
    )
  })

  return s.image
}

// Generate with different parameters
const svg1 = generatePattern(42, 3, [0, 120, 240])
writeFileSync('pattern-rgb.svg', svg1)

const svg2 = generatePattern(42, 5, [30, 60])
writeFileSync('pattern-warm.svg', svg2)
```

## Web Integration

### Static HTML

Embed SVG directly in HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Solandra-SVG Artwork</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f0f0;
    }
    #artwork {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div id="artwork"></div>

  <script type="module">
    import { SolandraSvg } from 'https://cdn.skypack.dev/solandra-svg'

    const s = new SolandraSvg(600, 600, 42)

    // Create artwork
    s.times(50, () => {
      s.strokedPath((attr) =>
        attr.fill(s.random() * 360, 70, 50, 0.5)
      )
        .moveTo(s.randomPoint())
        .arcTo(s.randomPoint())
    })

    // Insert into page
    document.getElementById('artwork').innerHTML = s.image
  </script>
</body>
</html>
```

### Interactive Web App

Create an interactive art generator:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Interactive Generator</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #controls { margin-bottom: 20px; }
    button { padding: 10px 20px; margin-right: 10px; cursor: pointer; }
    input { margin: 0 10px; }
  </style>
</head>
<body>
  <div id="controls">
    <label>
      Seed: <input type="number" id="seed" value="42" min="0">
    </label>
    <label>
      Count: <input type="number" id="count" value="50" min="1" max="200">
    </label>
    <button id="generate">Generate</button>
    <button id="download">Download SVG</button>
  </div>
  <div id="artwork"></div>

  <script type="module">
    import { SolandraSvg } from 'https://cdn.skypack.dev/solandra-svg'

    let currentSvg = ''

    function generate() {
      const seed = parseInt(document.getElementById('seed').value)
      const count = parseInt(document.getElementById('count').value)

      const s = new SolandraSvg(800, 800, seed)

      s.times(count, () => {
        s.strokedPath((attr) =>
          attr.fill(s.random() * 360, 70, 50, 0.6)
        )
          .moveTo(s.randomPoint())
          .arcTo(s.randomPoint())
      })

      currentSvg = s.image
      document.getElementById('artwork').innerHTML = currentSvg
    }

    function download() {
      const blob = new Blob([currentSvg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `artwork-${Date.now()}.svg`
      a.click()
      URL.revokeObjectURL(url)
    }

    document.getElementById('generate').addEventListener('click', generate)
    document.getElementById('download').addEventListener('click', download)

    // Generate initial artwork
    generate()
  </script>
</body>
</html>
```

### React Integration

Use Solandra-SVG in a React component:

```typescript
import React, { useEffect, useRef, useState } from 'react'
import { SolandraSvg } from 'solandra-svg'

function GenerativeArt() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [seed, setSeed] = useState(42)

  useEffect(() => {
    if (!containerRef.current) return

    const s = new SolandraSvg(600, 600, seed)

    // Create artwork
    s.times(50, () => {
      s.strokedPath((attr) =>
        attr.fill(s.random() * 360, 70, 50, 0.5)
      )
        .moveTo(s.randomPoint())
        .arcTo(s.randomPoint())
    })

    containerRef.current.innerHTML = s.image
  }, [seed])

  return (
    <div>
      <div>
        <label>
          Seed:{' '}
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
          />
        </label>
        <button onClick={() => setSeed(Math.floor(Math.random() * 10000))}>
          Random
        </button>
      </div>
      <div ref={containerRef} />
    </div>
  )
}

export default GenerativeArt
```

## Plotter and Laser Cutter Preparation

### Pen Plotter Output

Create plotter-ready graphics:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

const s = new SolandraSvg(297, 210, 42)  // A4 landscape in mm

// Use strokedPath for pen plotters
// Avoid fills, use outlines only

s.times(20, (i) => {
  s.strokedPath((attr) =>
    attr
      .noFill()
      .stroke(0, 0, 0)
      .strokeWidth(0.5)  // 0.5mm pen width
  )
    .ellipse([148.5, 105], 10 + i * 5)
})

writeFileSync('plotter-output.svg', s.UNSTABLE_imageInkscapeReady)
```

Key considerations for plotters:
- Use `noFill()` - plotters draw strokes, not fills
- Set appropriate `strokeWidth` for your pen
- Work in millimeters for precision
- Test with `UNSTABLE_imageInkscapeReady`

### Laser Cutter Output

Use preset paths for laser cutting:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

const s = new SolandraSvg(300, 200)  // Size in mm

// Outer boundary (cut)
s.cutPath()  // Red stroke for cutting
  .rect([10, 10], [290, 190])

// Internal decorative cuts
s.times(5, (i) => {
  s.cutPath()
    .ellipse([60 + i * 50, 100], 20)
})

// Fold lines (score/engrave)
s.creasePath()  // Blue stroke for folding
  .moveTo([150, 10])
  .lineTo([150, 190])

writeFileSync('laser-cut.svg', s.UNSTABLE_imageInkscapeReady)
```

Laser cutter conventions:
- **cutPath()**: Red lines for cutting through
- **creasePath()**: Blue lines for scoring/folding
- Work in millimeters
- Ensure no overlapping lines (wastes time)

### Multi-Layer Plotter Art

Create layered plots with color changes:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'

function createLayer(seed, color) {
  const s = new SolandraSvg(200, 200, seed)

  s.times(30, () => {
    s.strokedPath((attr) =>
      attr
        .noFill()
        .stroke(0, 0, 0)  // Will be plotted in physical pen color
        .strokeWidth(0.3)
    )
      .moveTo(s.randomPoint())
      .curveTo(s.randomPoint())
  })

  return s.image
}

// Generate separate files for each pen color
writeFileSync('layer-black.svg', createLayer(42, 'black'))
writeFileSync('layer-red.svg', createLayer(43, 'red'))
writeFileSync('layer-blue.svg', createLayer(44, 'blue'))

console.log('Plot each layer with the corresponding pen color')
```

## Advanced Export Workflows

### Tiled Output for Large Prints

Generate tiles for large-format printing:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync, mkdirSync } from 'fs'

const fullWidth = 3000
const fullHeight = 2000
const tileSize = 1000
const seed = 42

mkdirSync('tiles', { recursive: true })

for (let tx = 0; tx < Math.ceil(fullWidth / tileSize); tx++) {
  for (let ty = 0; ty < Math.ceil(fullHeight / tileSize); ty++) {
    const s = new SolandraSvg(tileSize, tileSize, seed)

    // Offset calculations for this tile
    const offsetX = (tx * tileSize) / fullWidth
    const offsetY = (ty * tileSize) / fullHeight
    const scaleX = tileSize / fullWidth
    const scaleY = tileSize / fullHeight

    // Draw only the portion visible in this tile
    s.group((t) =>
      t.scale([1/scaleX, 1/scaleY]).translate([-offsetX, -offsetY]),
      () => {
        // Your artwork here
        // This will be correctly positioned for each tile
      }
    )

    writeFileSync(
      `tiles/tile-${tx}-${ty}.svg`,
      s.image
    )
  }
}
```

### PNG Conversion (Node.js)

Convert SVG to PNG using sharp:

```typescript
import { SolandraSvg } from 'solandra-svg'
import sharp from 'sharp'  // npm install sharp

const s = new SolandraSvg(800, 800, 42)

// ... create artwork ...

const svgBuffer = Buffer.from(s.image)

await sharp(svgBuffer)
  .png()
  .toFile('output.png')

console.log('Converted to PNG')
```

### PDF Generation

Create PDF from SVG:

```typescript
import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'
import svg2pdf from 'svg2pdf.js'  // npm install svg2pdf.js jspdf
import { jsPDF } from 'jspdf'

const s = new SolandraSvg(210, 297)  // A4 in mm

// ... create artwork ...

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
})

const svgElement = new DOMParser()
  .parseFromString(s.image, 'image/svg+xml')
  .documentElement

await svg2pdf(svgElement, doc, {
  x: 0,
  y: 0,
  width: 210,
  height: 297
})

const pdfBlob = doc.output('blob')
writeFileSync('output.pdf', Buffer.from(await pdfBlob.arrayBuffer()))
```

## Command Line Tools

### CLI Script for Batch Generation

Create a command-line tool:

```typescript
#!/usr/bin/env node

import { SolandraSvg } from 'solandra-svg'
import { writeFileSync } from 'fs'
import { parseArgs } from 'util'

const { values } = parseArgs({
  options: {
    seed: { type: 'string', short: 's', default: '42' },
    output: { type: 'string', short: 'o', default: 'output.svg' },
    width: { type: 'string', short: 'w', default: '800' },
    height: { type: 'string', short: 'h', default: '800' },
    count: { type: 'string', short: 'c', default: '50' }
  }
})

const seed = parseInt(values.seed)
const width = parseInt(values.width)
const height = parseInt(values.height)
const count = parseInt(values.count)

const s = new SolandraSvg(width, height, seed)

s.times(count, () => {
  s.strokedPath((attr) =>
    attr.fill(s.random() * 360, 70, 50, 0.5)
  )
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})

writeFileSync(values.output, s.image)
console.log(`Generated ${values.output}`)
```

Usage:
```bash
./generate.js -s 42 -o artwork.svg -w 1200 -h 800 -c 100
```

## Best Practices

### Performance

- Generate smaller SVGs for web (< 1MB)
- Use lower iteration counts for complex patterns
- Consider PNG conversion for very complex graphics

### File Organization

```
project/
├── src/
│   ├── generators/
│   │   ├── mandala.ts
│   │   ├── flow-field.ts
│   │   └── landscape.ts
│   └── index.ts
├── output/
│   ├── web/          # Optimized for web
│   ├── print/        # High-res for printing
│   └── plotter/      # Plotter-ready files
└── package.json
```

### Version Control

- Commit your generator code, not generated files
- Use seeds for reproducibility
- Document parameters in README
- Tag interesting seeds/configurations

### Quality Assurance

```typescript
// Validate output before saving
function validateSvg(svg: string): boolean {
  if (svg.length === 0) return false
  if (!svg.includes('<svg')) return false
  if (!svg.includes('</svg>')) return false
  return true
}

const output = s.image

if (validateSvg(output)) {
  writeFileSync('output.svg', output)
} else {
  console.error('Invalid SVG generated')
}
```

## Key Takeaways

- **s.image**: Get SVG string for saving or embedding
- **s.imageSrc()**: Get data URL for HTML img tags
- **s.UNSTABLE_imageInkscapeReady**: Millimeter-based for Inkscape/plotters
- **Node.js**: Use `fs.writeFileSync()` to save files
- **Web**: Embed directly or use data URLs
- **Plotters**: Use `noFill()`, `strokeWidth()`, work in mm
- **Laser cutters**: Use `cutPath()` and `creasePath()` presets
- **Batch generation**: Loop with different seeds/parameters
- **Integration**: Works with React, vanilla JS, CLI tools

## Conclusion

You've now learned everything you need to create stunning generative graphics with Solandra-SVG! From basic shapes to complex generative systems, from web integration to plotter output, you have a complete toolkit for algorithmic art.

**Next Steps:**
- Experiment with the examples in this book
- Combine techniques in new ways
- Share your creations with the community
- Explore the Solandra ecosystem for more tools

Happy generating!
