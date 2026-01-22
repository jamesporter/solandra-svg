# Chapter 3: Attributes and Styling

## Understanding Attributes

Attributes control the visual appearance of paths: colors, stroke properties, opacity, and more. In Solandra-SVG, you apply attributes when creating paths or modify them with the `Attributes` class.

## Setting Attributes on Paths

There are two ways to set attributes:

### Method 1: Using a Callback Function

```typescript
const s = new SolandraSvg(400, 400)

s.strokedPath((attr) =>
  attr.fill(200, 70, 50).stroke(0, 0, 0).strokeWidth(0.005)
)
  .ellipse([0.5, 0.5], 0.3)
```

### Method 2: Using the Attributes Class

```typescript
const s = new SolandraSvg(400, 400)

// Create an attributes object
const attrs = new Attributes()
  .fill(200, 70, 50)
  .stroke(0, 0, 0)
  .strokeWidth(0.005)

s.strokedPath(attrs)
  .ellipse([0.5, 0.5], 0.3)
```

### Shorthand with s.A

For convenience, use `s.A` as a shorthand:

```typescript
const s = new SolandraSvg(400, 400)

const attrs = s.A.fill(120, 80, 60).strokeWidth(0.002)

s.strokedPath(attrs)
  .rect([0.2, 0.2], [0.8, 0.8])
```

## Color: HSL Color Space

Solandra-SVG uses the HSL (Hue, Saturation, Lightness) color model by default:

- **Hue** (0-360): The color wheel position
  - 0 = Red
  - 60 = Yellow
  - 120 = Green
  - 180 = Cyan
  - 240 = Blue
  - 300 = Magenta
- **Saturation** (0-100): Color intensity (0 = gray, 100 = vibrant)
- **Lightness** (0-100): Brightness (0 = black, 50 = pure color, 100 = white)

### fill() - Fill Color

```typescript
const s = new SolandraSvg(400, 400)

// Red circle: hue=0, saturation=80, lightness=50
s.strokedPath((attr) => attr.fill(0, 80, 50))
  .ellipse([0.25, 0.5], 0.15)

// Green circle
s.strokedPath((attr) => attr.fill(120, 80, 50))
  .ellipse([0.5, 0.5], 0.15)

// Blue circle
s.strokedPath((attr) => attr.fill(240, 80, 50))
  .ellipse([0.75, 0.5], 0.15)
```

### Fill with Opacity

Add a fourth parameter for opacity (0-1):

```typescript
const s = new SolandraSvg(400, 400)

// Semi-transparent overlapping circles
s.strokedPath((attr) => attr.fill(0, 80, 50, 0.5))
  .ellipse([0.4, 0.5], 0.2)

s.strokedPath((attr) => attr.fill(120, 80, 50, 0.5))
  .ellipse([0.5, 0.5], 0.2)

s.strokedPath((attr) => attr.fill(240, 80, 50, 0.5))
  .ellipse([0.6, 0.5], 0.2)
```

### stroke() - Stroke Color

```typescript
const s = new SolandraSvg(400, 400)

// Black stroke (hue doesn't matter when saturation is 0)
s.strokedPath((attr) => attr.stroke(0, 0, 0))
  .ellipse([0.3, 0.5], 0.2)

// Colored stroke
s.strokedPath((attr) => attr.stroke(300, 70, 50).strokeWidth(0.01))
  .ellipse([0.7, 0.5], 0.2)
```

### noFill() and noStroke()

Remove fill or stroke:

```typescript
const s = new SolandraSvg(400, 400)

// Stroke only, no fill
s.strokedPath((attr) => attr.noFill().stroke(0, 0, 0).strokeWidth(0.005))
  .ellipse([0.3, 0.5], 0.2)

// Fill only, no stroke
s.strokedPath((attr) => attr.fill(200, 70, 50).noStroke())
  .ellipse([0.7, 0.5], 0.2)
```

## OkLCH Color Space

For more perceptually uniform colors, use OkLCH:

```typescript
const s = new SolandraSvg(400, 400)

// Fill with OkLCH
s.strokedPath((attr) =>
  attr.fillOkLCH({
    l: 0.7,   // Lightness (0-1)
    c: 0.15,  // Chroma/saturation (0-0.4 typical)
    h: 250    // Hue (0-360)
  })
)
  .ellipse([0.5, 0.5], 0.3)
```

## Stroke Properties

### strokeWidth() - Line Thickness

```typescript
const s = new SolandraSvg(400, 400)

// Thin line
s.strokedPath((attr) => attr.strokeWidth(0.001))
  .moveTo([0.1, 0.3]).lineTo([0.9, 0.3])

// Medium line
s.strokedPath((attr) => attr.strokeWidth(0.005))
  .moveTo([0.1, 0.5]).lineTo([0.9, 0.5])

// Thick line
s.strokedPath((attr) => attr.strokeWidth(0.02))
  .moveTo([0.1, 0.7]).lineTo([0.9, 0.7])
```

### strokeLinecap() - Line Endings

Control how line ends appear:

```typescript
const s = new SolandraSvg(400, 400)

// Butt (default) - flat end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('butt'))
  .moveTo([0.2, 0.3]).lineTo([0.8, 0.3])

// Round - rounded end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('round'))
  .moveTo([0.2, 0.5]).lineTo([0.8, 0.5])

// Square - extended flat end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('square'))
  .moveTo([0.2, 0.7]).lineTo([0.8, 0.7])
```

### strokeLinejoin() - Corner Joins

Control how corners connect:

```typescript
const s = new SolandraSvg(400, 400)

// Miter (default) - sharp corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('miter')
)
  .moveTo([0.1, 0.3]).lineTo([0.2, 0.2]).lineTo([0.3, 0.3])

// Round - rounded corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('round')
)
  .moveTo([0.4, 0.3]).lineTo([0.5, 0.2]).lineTo([0.6, 0.3])

// Bevel - flat corner
s.strokedPath((attr) =>
  attr.strokeWidth(0.02).strokeLinejoin('bevel')
)
  .moveTo([0.7, 0.3]).lineTo([0.8, 0.2]).lineTo([0.9, 0.3])
```

### strokeDasharray() - Dashed Lines

Create dashed or dotted lines:

```typescript
const s = new SolandraSvg(400, 400)

// Dashed line: 0.02 dash, 0.01 gap
s.strokedPath((attr) => attr.strokeDasharray([0.02, 0.01]))
  .moveTo([0.1, 0.3]).lineTo([0.9, 0.3])

// Dotted line
s.strokedPath((attr) => attr.strokeDasharray([0.005, 0.005]))
  .moveTo([0.1, 0.5]).lineTo([0.9, 0.5])

// Complex pattern: long dash, short gap, short dash, short gap
s.strokedPath((attr) => attr.strokeDasharray([0.04, 0.01, 0.01, 0.01]))
  .moveTo([0.1, 0.7]).lineTo([0.9, 0.7])
```

## Opacity

### opacity() - Overall Transparency

Controls both fill and stroke transparency:

```typescript
const s = new SolandraSvg(400, 400)

s.times(5, (i) => {
  s.strokedPath((attr) =>
    attr.fill(200, 70, 50).opacity(0.2 + i * 0.15)
  )
    .ellipse([0.3 + i * 0.1, 0.5], 0.15)
})
```

### fillOpacity() - Fill Transparency Only

Control fill and stroke opacity independently:

```typescript
const s = new SolandraSvg(400, 400)

// Semi-transparent fill, opaque stroke
s.strokedPath((attr) =>
  attr
    .fill(200, 70, 50)
    .fillOpacity(0.3)
    .stroke(0, 0, 0)
    .strokeWidth(0.005)
)
  .ellipse([0.5, 0.5], 0.3)
```

## CSS Classes and IDs

Add classes and IDs for styling with external CSS:

### className() - CSS Class

```typescript
const s = new SolandraSvg(400, 400)

s.strokedPath((attr) => attr.className('my-circle'))
  .ellipse([0.5, 0.5], 0.2)

// The SVG can then be styled with CSS:
// .my-circle { fill: red; }
```

### id() - Element ID

```typescript
const s = new SolandraSvg(400, 400)

s.strokedPath((attr) => attr.id('main-shape'))
  .rect([0.2, 0.2], [0.8, 0.8])
```

## Practical Color Examples

### Rainbow Gradient

```typescript
const s = new SolandraSvg(800, 600)

s.times(36, (i) => {
  const hue = i * 10  // 0 to 350
  s.strokedPath((attr) =>
    attr.fill(hue, 80, 60).noStroke()
  )
    .rect([i / 36, 0.3], [(i + 1) / 36, 0.7])
})
```

### Monochrome with Varying Lightness

```typescript
const s = new SolandraSvg(800, 800)

s.times(10, (i) => {
  const lightness = 10 + i * 8  // 10 to 82
  s.strokedPath((attr) =>
    attr.fill(220, 50, lightness)
  )
    .ellipse([0.5, 0.5], 0.05 + i * 0.04)
})
```

### Saturation Variations

```typescript
const s = new SolandraSvg(800, 400)

s.times(10, (i) => {
  const saturation = i * 10  // 0 to 90
  s.strokedPath((attr) =>
    attr.fill(30, saturation, 50)
  )
    .rect([i * 0.1, 0.2], [i * 0.1 + 0.09, 0.8])
})
```

## Transform Origin

Set the point around which transformations occur:

```typescript
const s = new SolandraSvg(400, 400)

s.strokedPath((attr) =>
  attr
    .fill(200, 70, 50)
    .transformOrigin([0.5, 0.5])  // Rotate around center
)
  .rect([0.3, 0.3], [0.7, 0.7])
```

## Combining Attributes

Attributes are chainable, so you can combine many properties:

```typescript
const s = new SolandraSvg(800, 800)

s.strokedPath((attr) =>
  attr
    .fill(160, 70, 60, 0.7)              // Teal fill with transparency
    .stroke(280, 80, 30)                  // Purple stroke
    .strokeWidth(0.008)                   // Medium thickness
    .strokeLinecap('round')               // Rounded ends
    .strokeLinejoin('round')              // Rounded corners
    .strokeDasharray([0.02, 0.01])        // Dashed
    .className('decorative-shape')        // CSS class
)
  .regularPolygon([0.5, 0.5], 0.3, 6)
```

## Reusing Attribute Sets

Create reusable attribute configurations:

```typescript
const s = new SolandraSvg(800, 800)

// Define styles
const primaryStyle = s.A
  .fill(200, 70, 50)
  .strokeWidth(0.003)
  .stroke(0, 0, 0)

const secondaryStyle = s.A
  .fill(120, 60, 60)
  .strokeWidth(0.002)
  .stroke(0, 0, 30)

// Use them multiple times
s.strokedPath(primaryStyle)
  .ellipse([0.3, 0.5], 0.2)

s.strokedPath(secondaryStyle)
  .ellipse([0.7, 0.5], 0.2)
```

## Key Takeaways

- **HSL color space**: Hue (0-360), Saturation (0-100), Lightness (0-100)
- **fill()** sets fill color, **stroke()** sets stroke color
- **strokeWidth()** controls line thickness
- **strokeLinecap()** and **strokeLinejoin()** control line endings and corners
- **strokeDasharray()** creates dashed patterns
- **opacity()** and **fillOpacity()** control transparency
- **Attributes are chainable** for combining multiple properties
- **s.A** provides a convenient shorthand for creating attributes

In the next chapter, we'll explore transformations to rotate, scale, and position your graphics!
