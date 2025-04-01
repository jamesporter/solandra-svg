import { PageLayout } from "@/components/PageLayout"
import { Attributes, Point2D, SolandraSvg, v } from "@/lib"
import { useControls } from "leva"

export default function CutAndFold() {
  return (
    <PageLayout>
      <h1>Cut and Fold</h1>

      <RegularTree />
    </PageLayout>
  )
}

function radius(n: number, s: number) {
  return s / (2 * Math.sin(Math.PI / n))
}

function sketch(
  N: number,
  seed: number,
  baseProportion: number,
  baseH: number,
  touchGround: boolean
) {
  const s = new SolandraSvg(1000, 1000, seed)

  const treeProportion = 1 - baseProportion

  const bottom = s.meta.bottom

  const treeY = bottom * (1 - baseH)

  const treeBottom = bottom * (1 - 0.02)

  const dX = treeProportion / N

  s.groupWithId("tree-fold", () => {
    s.creasePath().moveTo([0, treeY]).lineTo([treeProportion, treeY])
    s.creasePath().moveTo([0, treeBottom]).lineTo([treeProportion, treeBottom])

    for (let i = 1; i <= N; i++) {
      s.creasePath()
        .moveTo([i * dX, treeY])
        .lineTo([i * dX, treeBottom])
    }
  })

  s.groupWithId("tree-cuts", () => {
    for (let i = 0; i <= N + 1; i++) {
      if (i === 0) {
        s.cutPath()
          .moveTo([i * dX, 0])
          .lineTo([i * dX, bottom])
      } else if (i === N + 1) {
        s.cutPath()
          .moveTo([(i - 1) * dX, treeBottom])
          .lineTo([i * dX, treeBottom - 0.025])
          .lineTo([i * dX, treeY + 0.025])
          .lineTo([(i - 1) * dX, treeY])
      } else {
        s.cutPath()
          .moveTo([i * dX, 0])
          .lineTo([i * dX, treeY])

        s.cutPath()
          .moveTo([i * dX, treeBottom])
          .lineTo([i * dX, bottom])
      }
    }

    s.cutPath().moveTo([0, bottom]).lineTo([treeProportion, bottom])

    s.cutPath().moveTo([0, 0]).lineTo([treeProportion, 0])
  })

  s.groupWithId("base-cuts", () => {
    // only need on three sides, as alreay will have enough on LHS from tree cuts
    s.cutPath()
      .moveTo([1 - baseProportion, 0])
      .lineTo([1, 0])
      .lineTo([1, baseProportion])
      .lineTo([1 - baseProportion, baseProportion])

    const cx = 1 - baseProportion / 2
    const cy = baseProportion / 2

    const r = radius(N, dX)
    const dA = (2 * Math.PI) / N

    let x = cx + r * Math.cos(0)
    let y = cy + r * Math.sin(0)

    const rootPath = s.cutPath().moveTo([x, y])

    for (let i = 1; i <= N; i++) {
      const a = dA * i
      let x = cx + r * Math.cos(a)
      let y = cy + r * Math.sin(a)

      rootPath.lineTo([x, y])
    }

    if (touchGround) {
      for (let i = 1; i <= N; i++) {
        const a1 = dA * (i - 1)
        const a2 = dA * i
        let x1 = cx + r * Math.cos(a1)
        let y1 = cy + r * Math.sin(a1)

        let x2 = cx + r * Math.cos(a2)
        let y2 = cy + r * Math.sin(a2)

        const deltaScale = ((0.15 + s.random()) * baseProportion) / 3.2

        const vX = deltaScale * Math.cos((a1 + a2) / 2)
        const vY = deltaScale * Math.sin((a1 + a2) / 2)

        const v1: Point2D = [x1 + vX, y1 + vY]
        const v2: Point2D = [x2 + vX, y2 + vY]

        // make the cuts a bit bigger to allow easy slotting in
        const v1Adj = v.pointAlong(v1, v2, -0.1)
        const v2Adj = v.pointAlong(v1, v2, 1.1)

        s.cutPath().moveTo(v1Adj).lineTo(v2Adj)
      }
    }
  })

  return s
}

export function RegularTree() {
  const { n, seed, baseProportion, baseH, touchGround } = useControls({
    n: {
      value: 12,
      min: 3,
      max: 24,
      step: 1,
    },
    seed: {
      value: 0,
      min: 0,
      max: 100,
      step: 1,
    },
    baseProportion: {
      value: 0.5,
      min: 0.3,
      max: 0.6,
      step: 0.02,
    },
    baseH: {
      value: 0.2,
      min: 0.05,
      max: 0.4,
      step: 0.01,
    },
    touchGround: {
      value: true,
    },
  })

  const s = sketch(n, seed, baseProportion, baseH, touchGround)

  return (
    <div className="flex flex-col gap-8 mx-auto container my-8">
      <img src={s.imageSrc()} className="size-[800px] shadow-xl" />

      <div className="flex flex-row justify-start">
        <a
          href={s.imageSrc()}
          download={`regular-tree-${n}-sides-${seed}-seed.svg`}
        >
          Download
        </a>
      </div>
    </div>
  )
}
