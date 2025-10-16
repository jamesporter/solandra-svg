# Solandra SVG Documentation for LLMs

This document provides a comprehensive overview of the `solandra-svg` library, designed to be easily understood and utilized by Large Language Models. It includes a description of the library's core concepts, annotated code examples, and tutorials based on the examples found in the `src/pages` directory of the project.

## Core Concepts

`solandra-svg` is a TypeScript library for declaratively creating SVG graphics. It uses a fluent API, which allows for chaining methods together to build complex SVG structures in an intuitive way. The library is designed to be lightweight and has zero dependencies.

There are four key parts to the library:

### `SolandraSvg` Class

This is the main class of the library. It is responsible for creating the SVG element and provides a set of utility functions for generating random numbers, colors, and points. It also manages the overall state of the SVG canvas. In the examples, an instance of this class is typically referred to as `s`.

### `Path` Class

The `Path` class is used to define the geometry of an SVG shape. You can create a new path using `s.path()` or more specific methods like `s.strokedPath()`. Once you have a path object, you can use methods like `moveTo()`, `lineTo()`, `arcTo()`, and `curveTo()` to define its shape.

### `Attributes` Class

The `Attributes` class is used to set the visual properties of a path, such as its stroke, fill, and opacity. You can create a new `Attributes` object using `s.A` and then chain methods like `stroke()`, `fill()`, and `opacity()` to configure the desired attributes.

### `Transform` Class

The `Transform` class is used to apply transformations to a path, such as rotation, scaling, and skewing. You can create a new `Transform` object using `s.T` and then chain methods like `rotate()`, `scale()`, and `skewX()` to define the transformation.

## Code Examples and Tutorials

The following examples are based on the code in `src/pages/Home.tsx` and demonstrate how to use `solandra-svg` to create various types of graphics.

### Basic Shapes

This example demonstrates how to create a simple drawing with random arcs.

**Code:**

```typescript
s.times(25, () => {
  s.strokedPath((attr) =>
    attr.fill(s.sample([h - 20, h, h + 20]), 90, 50, 0.2)
  )
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})
```

**Explanation:**

*   `s.times(25, () => { ... })`: This loop runs the provided function 25 times.
*   `s.strokedPath((attr) => ...)`: This creates a new path with a stroke. The function passed to it is used to configure the path's attributes.
*   `attr.fill(s.sample([h - 20, h, h + 20]), 90, 50, 0.2)`: This sets the fill color of the path. The hue is a random sample from the given array, and the saturation, lightness, and alpha are fixed.
*   `.moveTo(s.randomPoint())`: This moves the starting point of the path to a random point on the canvas.
*   `.arcTo(s.randomPoint())`: This draws an arc from the current point to another random point on the canvas.

### Tiling

This example demonstrates how to create a tiled background.

**Code:**

```typescript
s.forTiling(
  { n: 5, type: "square", margin: 0.1 },
  ([x, y], [dX]) => {
    const path = s
      .strokedPath((attr) =>
        attr.stroke(355, 10, 10, 0.9).fill(340, 90, 70, 0.2)
      )
      .moveTo([0.5, 0.5])

    s.times(10, () => {
      const pt = s.randomPoint()
      path.lineTo([x + pt[0] * dX, y + pt[1] * dX])
    })
  }
)
```

**Explanation:**

*   `s.forTiling({ n: 5, type: "square", margin: 0.1 }, ...)`: This function creates a 5x5 square grid with a 10% margin between tiles. The provided callback function is executed for each tile in the grid.
*   `([x, y], [dX])`: The callback function receives the coordinates of the tile's top-left corner (`x`, `y`) and the size of the tile (`dX`).
*   The rest of the code is similar to the previous example, but it draws lines within each tile instead of arcs.

### Curves

This example demonstrates how to draw smooth curves.

**Code:**

```typescript
s.times(15, () => {
  let start = [s.random(), bottom]
  let end = [s.random(), bottom]
  s.strokedPath((attr) => attr.stroke(20, 90, 60, 0.5))
    .moveTo(start)
    .curveTo(end, { curveSize: 3 })

  start = [s.random(), 0]
  end = [s.random(), 0]
  s.strokedPath((attr) => attr.stroke(0, 90, 60, 0.5))
    .moveTo(start)
    .curveTo(end, { polarlity: -1, curveSize: 3 })
})
```

**Explanation:**

*   `s.strokedPath(...).moveTo(start).curveTo(end, { curveSize: 3 })`: This creates a path that starts at `start` and draws a curve to `end`. The `curveSize` option controls the amount of curvature.
*   `polarlity: -1`: This option flips the direction of the curve.

### Rectangles

This example demonstrates how to draw rectangles.

**Code:**

```typescript
s.times(25, () => {
  s.strokedPath((attr) => attr.fill(220, 90, 50, 0.2)).rect(
    s.randomPoint(),
    s.gaussian({ sd: 0.05, mean: 0.2 }),
    s.gaussian({ sd: 0.1, mean: 0.3 })
  )
})
```

**Explanation:**

*   `s.strokedPath(...).rect(s.randomPoint(), ..., ...)`: This creates a rectangle at a random point on the canvas. The width and height of the rectangle are determined by a Gaussian distribution.

### Ellipses

This example demonstrates how to draw ellipses.

**Code:**

```typescript
s.times(35, () => {
  const size = s.gaussian({ sd: 0.2, mean: 0.25 })
  s.strokedPath((attr) =>
    attr.fill(s.sample([130, 200, 210]), 90, 40, 0.2)
  ).ellipse(s.randomPoint(), size, size / 1.25)
})
```

**Explanation:**

*   `s.strokedPath(...).ellipse(s.randomPoint(), size, size / 1.25)`: This creates an ellipse at a random point on the canvas. The `size` variable determines the width of the ellipse, and the height is set to `size / 1.25`.

### Chaiken Algorithm

This example demonstrates how to use the Chaiken algorithm to smooth a path of lines.

**Code:**

```typescript
const { bottom } = s.meta
s.times(4, (n) => {
  const path = s
    .strokedPath((attr) =>
      attr.strokeOpacity(0.2 + n * 0.1).stroke(15, 90, 60)
    )
    .moveTo([0.1, bottom * 0.4])
  for (let i = 0.1; i <= 0.9; i += 0.2) {
    path.lineTo([i, bottom * 0.4 + 0.3 * Math.cos(i * 10)])
  }

  path
    .map((el) => {
      if (el.kind === "line" || el.kind === "move") {
        return { ...el, to: v.add(el.to, [0, 0.1 * n]) }
      } else {
        return el
      }
    })
    .chaiken(n + 1)
})
```

**Explanation:**

*   The code first creates a path with a series of straight lines.
*   `.map(...)`: This function is used to modify the points of the path before applying the Chaiken algorithm. In this case, it's used to create a layered effect.
*   `.chaiken(n + 1)`: This applies the Chaiken algorithm to the path `n + 1` times, which progressively smooths the corners of the path.

### Transforms

This example demonstrates how to apply transformations to a path.

**Code:**

```typescript
s.strokedPath((attr) =>
  attr
    .fill(210, 90, 20, 0.5)
    .transform(s.T.rotate(Math.PI / 8))
).rect([0.3, 0.3], 0.2, 0.3)
```

**Explanation:**

*   `.transform(s.T.rotate(Math.PI / 8))`: This applies a rotation transformation to the rectangle. The `s.T.rotate()` function creates a rotation matrix.

### Cloning Paths

This example demonstrates how to clone a path and apply different attributes to each clone.

**Code:**

```typescript
const path = s.strokedPath().ellipse([0, 0], 0.3, 0.4)

s.times(20, (n) => {
  s.clonePath(path).configureAttributes((attr) =>
    attr
      .transform(s.T.scale(n / 2, n / 2))
      .stroke(n * 5, 90, 40)
  )
})
```

**Explanation:**

*   `const path = s.strokedPath().ellipse(...)`: This creates the original path that will be cloned.
*   `s.clonePath(path)`: This creates a clone of the original path.
*   `.configureAttributes((attr) => ...)`: This function is used to configure the attributes of the cloned path. In this case, it applies a scaling transformation and sets the stroke color.

### Groups

This example demonstrates how to group multiple paths together and apply attributes to the entire group.

**Code:**

```typescript
const { center } = s.meta
s.times(8, (n) => {
  s.group(
    Attributes.stroked.transform(
      s.T.translate(center).scale((4 + n) / 14)
    ),
    () => {
      s.path(s.A.opacity((8 - n) / 10)).rect([0, 0], 1, 1)

      s.path(
        s.A.stroke(n * 4, 90, 50).transform(s.T.rotate(n))
      ).ellipse([0, 0], 1, 0.8)
    }
  )
})
```

**Explanation:**

*   `s.group(Attributes.stroked.transform(...), () => { ... })`: This creates a group of paths. The first argument is an `Attributes` object that is applied to the entire group. The second argument is a function that contains the paths to be included in the group.
*   In this example, the group is translated to the center of the canvas and scaled. The paths within the group are a rectangle and an ellipse, each with their own attributes.