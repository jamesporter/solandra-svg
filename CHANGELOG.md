# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `aroundCircle` now emits its first point at the top of the circle (angle
  `-π/2`), matching the documented starting angle. Previously every point was
  rotated forward by one step, so the top point was emitted last.
- Hues outside the `0`-`360` range (e.g. `h + 20` on a hue near `350`) now wrap
  correctly instead of collapsing to a flat colour once they were more than one
  turn out. Saturation and lightness outside their documented ranges are clamped,
  so `fill`/`stroke` can no longer emit an invalid hex colour.
- A curve that follows a `close` (which has no destination point of its own) now
  raises a clear error instead of failing inside the curve maths.
- Attribute values are now XML-escaped, so an `id`, `class` or any other
  attribute containing `&`, `<`, `>` or `"` produces valid markup instead of
  output no SVG renderer can parse. Values without those characters are
  unchanged.
- `chaikin` on a path with a single segment no longer duplicates that segment.
  There are no corners to cut with fewer than three segments, so such paths are
  now returned untouched.
- `range` with `n: 0` emitted `NaN` (from an infinite step). It now emits just
  the `from` value when `inclusive` (the default), and nothing otherwise.

### Changed

- Relaxed the development `engines` requirement from `>=25.9.0` to
  `^20.19.0 || >=22.12.0` (matching Vite 8's supported range) so the project can
  be built and tested on maintained LTS releases. The published package has no
  `engines` field and is unaffected.
- CI now reads the Node version from `.nvmrc` (set to `22`) as a single source
  of truth.
- Internal refactoring to remove duplication, with no change to rendered output:
  SVG serialisation, data URI generation, grid iteration order, the
  horizontal/vertical strip helpers, path insertion, and the `cutPath`/
  `creasePath` presets are each now defined once. The shared iteration callback
  signature is exported as `RegionCallback`.
- `Path` no longer casts segments to an unchecked helper type to read their end
  point, and its shape helpers (`rect`, `regularPolygon`, `ellipse`, `spiral`)
  build on its own fluent methods rather than pushing raw segments.
- `fillOklch` and `strokeOklch` now declare `alpha` as optional, matching the
  behaviour they already had.

### Added

- A `Package` CI workflow and `pnpm verify:package` script that build the
  publishable package and smoke-test both the ESM and CJS artifacts (public
  exports resolve, an SVG renders, and the two builds have matching surfaces),
  guarding against broken publishes.
- Tests for `aroundCircle`, `gaussian`, `poisson`, `proportionately`, and
  `uniformRandomInt`, which were previously untested.
- Test coverage for the layout iteration utilities (`forTiling`, `forMargin`,
  `forHorizontal`, `forVertical`, `forGrid`, `build`, `withRandomOrder`, `range`,
  `times`, `downFrom`, `doProportion`, `inDrawing`), the remaining randomness
  helpers (`sample`, `samples`, `shuffle`, `perturb`, `randomPoint`,
  `randomPolarity`, `randomAngle`, `uniformGridPoint`), the SVG output variants
  (`imageSrc`, the Inkscape-ready renderings, `groupWithId`, `clonePath`, and the
  path presets), and `perlin2`, which had no tests at all.
- Coverage reporting via `@vitest/coverage-v8`, a `pnpm test:coverage` script and
  a dedicated `vitest.config.ts`. The library is at 100% statement, branch, line
  and function coverage, enforced as a threshold in CI; the two genuinely
  unreachable defensive branches carry `v8 ignore` comments explaining why.
- Output-validity tests that parse every rendered drawing as XML and every `d`
  attribute as SVG path data, over a range of seeds, so malformed markup,
  invalid path commands and `NaN` coordinates fail the suite. The strict XML and
  path-data parsers used for this live in `src/lib/__tests__/helpers` and have
  tests of their own.
- Property-based tests (`forAll`, seeded from the library's own RNG so runs are
  reproducible) covering the laws the vector, scale, centroid, grid-transform,
  collection and noise helpers have to obey.
- Distribution tests for the randomness helpers: chi-squared uniformity for
  `random`, `uniformRandomInt`, `randomAngle`, `sample` and `shuffle`; the
  normal three-sigma shares for `gaussian`; mean, variance and per-count
  probabilities for `poisson`; and rate checks for `doProportion` and
  `proportionately`.
- A public API test that pins the exact export surface of the package, so an
  accidental rename or removal fails in the diff that causes it.
- Golden-file regression tests: six representative sketches render to checked-in
  `.svg` files under `src/lib/__tests__/__snapshots__`, which can be opened in a
  browser, so a change to what the library draws shows up as a reviewable diff.

## [0.6.2]

- Independent `sweep` flag for arcs (previously tied to `largeArc`), so all four
  arc variants between two points can be drawn.
- `ellipse` now draws four clean quarter arcs instead of overlapping
  half-ellipses (better for pen plotting; visually identical).
- Fixed the published package for Node ESM consumers: proper `exports` map,
  module-type markers, and file extensions in relative imports.
- Added LICENSE (MIT) and README to the published package.
- Documentation improvements (arcs/ellipse API reference and JSDoc).

## [0.6.1]

- Type safety improvements in `Path` and generics, improved path cloning.
- Replaced ESLint with oxlint (type-aware) and added CI workflows for tests and
  linting.

## [0.6.0]

- API reference page and more APIs.

## [0.5.1]

- Minor typo fixes and updated documentation on using with AIs.

## [0.5.0]

- OkLCH.
- Regular Polygon helper.
- More convenient APIs: `A` and `T` for concise Attributes and Transforms.
- Tweaks.

## [0.4.0]

- `groupWithId` to easily build out groups in SVGs (where you only care about
  logically separating).
- `cutPath` and `creasePath` for convenient paths for cut and fold patterns.
- `randomAngle`.
- `transformOrigin` attribute (so you can easily rotate things).
