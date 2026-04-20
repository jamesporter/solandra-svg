import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 8: Flow Field
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image073.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

import { createNoise2D } from 'simplex-noise'  // npm install simplex-noise
const noise = createNoise2D()
const scale = 3  // Noise scale
const particleCount = 100
const steps = 80
s.times(particleCount, (n) => {
  // Random starting point
  let pt = s.randomPoint()
  const path = s.strokedPath((attr) =>
    attr
      .noFill()
      .stroke(s.random() * 360, 70, 50, 0.7)
      .strokeWidth(0.001)
  )
  path.moveTo(pt)
  // Follow the flow field
  s.times(steps, () => {
    // Get angle from noise
    const angle = noise(pt[0] * scale, pt[1] * scale) * Math.PI * 2
    // Move in that direction
    const stepSize = 0.005
    const newPt = [
      pt[0] + Math.cos(angle) * stepSize,
      pt[1] + Math.sin(angle) * stepSize
    ]
    // Stop if out of bounds
    if (newPt[0] < 0 || newPt[0] > 1 || newPt[1] < 0 || newPt[1] > 1) {
      return
    }
    path.lineTo(newPt)
    pt = newPt
  })
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
