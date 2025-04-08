import { Attributes, Transform } from "@/lib"
import { SVGSketch } from "./SVGSketch"

export function OkLCHExample() {
  return (
    <SVGSketch
      width={360}
      height={120}
      sketch={(s) => {
        const h = s.meta.bottom

        s.path(
          Attributes.of({
            fillOKLCH: {
              l: 0.7,
              c: 0.2541,
              h: 6.35,
              a: 0.9326,
            },
            transform: Transform.of({ rotate: -Math.PI / 12 }),
            transformOrigin: [1 / 6, h / 2],
          })
        ).rect([0, 0], 1 / 3, h, "topLeft")

        s.path(
          Attributes.of({
            fillOKLCH: {
              l: 0.7,
              c: 0.185,
              h: 232.94,
              a: 0.8978,
            },
            transform: Transform.of({ rotate: -Math.PI / 12 }),
            transformOrigin: [1 / 2, h / 2],
          })
        ).rect([1 / 3, 0], 1 / 3, h, "topLeft")

        s.path(
          Attributes.of({
            fillOKLCH: {
              l: 0.7,
              c: 0.2121,
              h: 155.65,
              a: 0.9326,
            },
            transform: Transform.of({ rotate: Math.PI / 12 }),
            transformOrigin: [5 / 6, h / 2],
          })
        ).rect([2 / 3, 0], 1 / 3, h, "topLeft")
      }}
    />
  )
}
