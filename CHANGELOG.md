# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `aroundCircle` now emits its first point at the top of the circle (angle
  `-π/2`), matching the documented starting angle. Previously every point was
  rotated forward by one step, so the top point was emitted last.

### Changed

- Relaxed the development `engines` requirement from `>=25.9.0` to
  `^20.19.0 || >=22.12.0` (matching Vite 8's supported range) so the project can
  be built and tested on maintained LTS releases. The published package has no
  `engines` field and is unaffected.
- CI now reads the Node version from `.nvmrc` (set to `22`) as a single source
  of truth.

### Added

- A `Package` CI workflow and `pnpm verify:package` script that build the
  publishable package and smoke-test both the ESM and CJS artifacts (public
  exports resolve, an SVG renders, and the two builds have matching surfaces),
  guarding against broken publishes.
- Tests for `aroundCircle`, `gaussian`, `poisson`, `proportionately`, and
  `uniformRandomInt`, which were previously untested.

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
