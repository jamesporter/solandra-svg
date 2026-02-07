import { SVGSketch } from "./SVGSketch"

export function OkLCHExample() {
  return (
    <SVGSketch
      className="bg-zinc-100"
      width={360}
      height={120}
      sketch={(s) => {
        const h = s.meta.bottom

        s.path(
          s.A.fillOklch(0.7, 0.2541, 6.35, 0.9326)
            .transform(s.T.rotate(-Math.PI / 12))
            .transformOrigin([1 / 6, h / 2])
        ).rect([0, 0], 1 / 3, h, "topLeft")

        s.path(
          s.A.fillOklch(0.7, 0.185, 232.94, 0.8978)
            .transform(s.T.rotate(Math.PI / 12))
            .transformOrigin([1 / 2, h / 2])
        ).rect([1 / 3, 0], 1 / 3, h, "topLeft")

        s.path(
          s.A.fillOklch(
            0.7,

            0.2541,
            155.65,
            0.9326
          )
            .transform(s.T.rotate(-Math.PI / 12))
            .transformOrigin([5 / 6, h / 2])
        ).rect([2 / 3, 0], 1 / 3, h, "topLeft")
      }}
    />
  )
}

export function PolygonExample() {
  return (
    <SVGSketch
      className="bg-zinc-100"
      width={360}
      height={120}
      sketch={(s) => {
        s.forHorizontal({ n: 12, margin: 0.1 }, (p, d, c, i) => {
          s.strokedPath((a) => a.fill(340 - i * 5, 90, 60, 0.6)).regularPolygon(
            c,
            4 + i,
            d[1] * s.gaussian({ mean: 0.8, sd: 0.1 })
          )
        })
      }}
    />
  )
}
