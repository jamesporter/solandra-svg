import { A4InkscapeSketch } from "@/components/SVGSketch"
import { perlin2, Point2D, v } from "@/lib"

import { useState } from "react"
import { PageLayout } from "@/components/PageLayout"

export default function Two() {
  const [nMaze, setNMaze] = useState(64)
  const [n, setN] = useState(48)
  const [depth, setDepth] = useState(200)
  const [noiseX, setNoiseX] = useState(0)

  return (
    <PageLayout>
      <h1>More plots</h1>
      <p>With new, hopefully more Inkscape ready approach</p>
      <h2>Third Set</h2>
      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const path = s.strokedPath().moveTo(center)
          s.times(40, () => {
            const pt = v.add(
              [0.15, 0.15 * bottom],
              v.scale(s.randomPoint(), 0.7)
            )
            path.curveTo(pt)
            s.strokedPath().ellipse(pt, 0.03, 0.02)
          })
        }}
      />
      <A4InkscapeSketch
        sketch={(s) => {
          s.forHorizontal(
            { n: 30, margin: 0.1 },
            ([x, y], [dX, dY], [cX, cY], i) => {
              const a: Point2D = [cX, y]
              const b: Point2D = [cX, y + dY * Math.random()]

              s.strokedPath().moveTo(a).lineTo(b)
            }
          )

          s.forVertical(
            { n: 20, margin: 0.1 },
            ([x, y], [dX, dY], [cX, cY], i) => {
              const a: Point2D = [x, cY]
              const b: Point2D = [x + dX * Math.random(), cY]

              s.strokedPath().moveTo(a).lineTo(b)
            }
          )
        }}
      />
      <A4InkscapeSketch
        sketch={(s) => {
          const points = s.shuffle(
            s.build(
              s.aroundCircle,
              { n: 40, r: 0.25, at: s.meta.center },
              (pt) => pt
            )
          )
          const path = s.strokedPath().moveTo(points[0])
          points.slice(1).forEach((pt) => path.lineTo(pt))
        }}
      />
      <h2>Fourth Set</h2>
      <div className="param">
        <label>Noise Offset</label>&nbsp;
        <input
          min={0}
          max={10}
          step={0.01}
          type="number"
          value={noiseX}
          onChange={(evt) => setNoiseX(parseFloat(evt.target.value))}
        />
      </div>
      <A4InkscapeSketch
        sketch={(s) => {
          const d = 0.005
          s.times(200, (n) => {
            const { bottom } = s.meta
            let pt = s.randomPoint()
            const path = s.strokedPath().moveTo(pt)
            s.times(60, () => {
              const a =
                Math.PI * 2 * perlin2(pt[0] + n / 1000 + noiseX || 0.0, pt[1])
              let newPt = v.add(pt, [d * Math.cos(a), d * Math.sin(a)])
              if (
                newPt[0] > 0.9 ||
                newPt[0] < 0.1 ||
                newPt[1] < 0.1 * bottom ||
                newPt[1] > 0.9 * bottom
              ) {
                return
              }
              path.lineTo(newPt)
              pt = newPt
            })
          })
        }}
      />
      <div className="param">
        <label>Depth</label>&nbsp;
        <input
          min={10}
          max={1000}
          type="number"
          value={depth}
          onChange={(evt) => setDepth(parseInt(evt.target.value))}
        />
      </div>

      <div className="param">
        <label>Size</label>&nbsp;
        <input
          min={10}
          max={1000}
          type="number"
          value={nMaze}
          onChange={(evt) => setNMaze(parseInt(evt.target.value))}
        />
      </div>

      <div className="param">
        <label>N</label>&nbsp;
        <input
          min={10}
          max={1000}
          type="number"
          value={n}
          onChange={(evt) => setN(parseInt(evt.target.value))}
        />
      </div>
      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom } = s.meta
          const N = nMaze || 64

          const margin = 0.1

          const dX = (1 - margin * 2) / N
          const hYG = Math.floor((bottom - margin * 2) / dX)

          const sX = 0.1
          const sY = (bottom - hYG * dX) / 2

          const maxX = N
          const maxY = hYG

          const gridToPoint = (gp: Point2D): Point2D =>
            v.add([sX, sY], v.scale(gp, dX))
          const visited = new Set()

          const hasVisited = (pt: Point2D) => visited.has(pt.join(","))
          const recordVisit = (pt: Point2D) => visited.add(pt.join(","))

          const inBounds = (el: Point2D) =>
            el[0] >= 0 && el[1] >= 0 && el[0] <= maxX && el[1] <= maxY

          const rGridPoint = (): Point2D => {
            const candidate: Point2D = [
              Math.round(N * s.random()),
              Math.round(N * s.random() * bottom),
            ]
            if (inBounds(candidate) && !hasVisited(candidate)) {
              return candidate
            } else {
              return rGridPoint()
            }
          }
          s.times(n || 48, () => {
            let pt = rGridPoint()
            const path = s.strokedPath().moveTo(gridToPoint(pt))
            recordVisit(pt)

            for (let i = 0; i < (depth || 200); i++) {
              let successors: Point2D[] = s.shuffle([
                [pt[0] + 1, pt[1]],
                [pt[0] - 1, pt[1]],
                [pt[0], pt[1] + 1],
                [pt[0], pt[1] - 1],
              ])

              successors = successors.filter(inBounds)

              let foundValid = false
              for (let j = 0; j < successors.length; j++) {
                if (!hasVisited(successors[j])) {
                  foundValid = true
                  path.lineTo(gridToPoint(successors[j]))
                  pt = successors[j]
                  recordVisit(pt)
                  break
                }
              }
              if (!foundValid) return
            }
          })
        }}
      />
    </PageLayout>
  )
}
