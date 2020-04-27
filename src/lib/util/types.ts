export type Point2D = [number, number]
export type Vector2D = [number, number]

export type CurveConfig = {
  polarlity?: 1 | -1
  curveSize?: number
  curveAngle?: number
  bulbousness?: number
  twist?: number
}

export type ArcConfig = {
  rX?: number
  rY?: number
  xAxisRotation?: number
  largeArc?: boolean // is > π
  // will do sweep = largeArc flags, I think that is typically 'correct'
}
