import React from "react"
import { SolandraSvg } from "../lib/index"

export function SVGSketch({
  sketch,
  width,
  height,
}: {
  sketch: (sol: SolandraSvg) => void
  width: number
  height: number
}) {
  const svg = new SolandraSvg(width, height, 1)
  sketch(svg)
  const image = svg.image

  return (
    <img src={`data:image/svg+xml;utf8,${image}`} style={{ width, height }} />
  )
}
