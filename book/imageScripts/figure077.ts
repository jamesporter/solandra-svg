import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Sunburst Radial Pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image077.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const rays = 48
const colors = [
  [30, 80, 50],   // Orange
  [50, 80, 60]    // Yellow
]
s.times(rays, (i) => {
  const angle1 = (i / rays) * Math.PI * 2
  const angle2 = ((i + 1) / rays) * Math.PI * 2
  const radius = 0.6
  const p1 = [
    center[0] + Math.cos(angle1) * radius,
    center[1] + Math.sin(angle1) * radius
  ]
  const p2 = [
    center[0] + Math.cos(angle2) * radius,
    center[1] + Math.sin(angle2) * radius
  ]
  const color = colors[i % 2]
  s.strokedPath((attr) =>
    attr.fill(color[0], color[1], color[2]).noStroke()
  )
    .moveTo(center)
    .lineTo(p1)
    .lineTo(p2)
    .close()
})
// Center circle
s.strokedPath((attr) =>
  attr.fill(0, 0, 100)
)
  .ellipse(center, 0.15)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
