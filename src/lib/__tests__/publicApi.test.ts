import { describe, expect, it } from "vitest"
import * as lib from "../index"

// solandra-svg is a published library, so its export surface is part of its
// contract. This test fails loudly on an accidental rename or removal — and on
// an accidental *addition*, which is a prompt to decide whether the new name is
// really meant to be public before it ships.
//
// scripts/verify-package.mjs makes the same kind of check against the built
// artifact; this one catches the problem at source, in the diff that caused it.

/** Every value the package exports, and the shape consumers can rely on. */
const PUBLIC_API = {
  // Core drawing classes
  SolandraSvg: "function",
  Path: "function",
  Group: "function",
  Attributes: "function",
  Transform: "function",
  // Namespaced helpers
  v: "object",
  c: "object",
  // Scalar and geometric utilities
  clamp: "function",
  scaler: "function",
  scaler2d: "function",
  centroid: "function",
  isoTransform: "function",
  hexTransform: "function",
  triTransform: "function",
  // Noise
  perlin2: "function",
} as const

describe("the public API", () => {
  it("exports exactly the documented names", () => {
    expect(Object.keys(lib).sort()).toEqual(Object.keys(PUBLIC_API).sort())
  })

  it.each(Object.entries(PUBLIC_API))("exports %s as a %s", (name, kind) => {
    expect(typeof lib[name as keyof typeof lib]).toBe(kind)
  })

  it("exposes the vector helpers on v", () => {
    expect(Object.keys(lib.v).sort()).toEqual([
      "add",
      "distance",
      "dot",
      "magnitude",
      "normalise",
      "pointAlong",
      "polarToCartesian",
      "rotate",
      "scale",
      "subtract",
    ])
  })

  it("exposes the collection helpers on c", () => {
    expect(Object.keys(lib.c).sort()).toEqual([
      "arrayOf",
      "pairWise",
      "sum",
      "tripleWise",
      "zip2",
    ])
  })
})

describe("the drawing entry point", () => {
  it("can render a drawing using only the public exports", () => {
    const s = new lib.SolandraSvg(200, 100, 1)

    s.groupWithId("demo", () => {
      s.path(s.A.fill(200, 80, 50).transform(s.T.rotate(Math.PI / 8)))
        .rect(s.meta.center, 0.2, 0.2)
        .close()
    })

    expect(s.image).toContain("<svg")
    expect(s.image).toContain('<g id="demo">')
    expect(s.image).toContain("<path")
  })

  it("hands out fresh Attributes and Transform builders each time", () => {
    const s = new lib.SolandraSvg(100, 100, 1)

    expect(s.A).toBeInstanceOf(lib.Attributes)
    expect(s.T).toBeInstanceOf(lib.Transform)
    // Shared builders would leak styling between paths.
    expect(s.A).not.toBe(s.A)
    expect(s.T).not.toBe(s.T)
  })

  it("builds paths and groups of the exported classes", () => {
    const s = new lib.SolandraSvg(100, 100, 1)
    s.groupWithId("g", () => {
      s.path().moveTo([0, 0]).lineTo([1, 1])
    })

    const group = s.elements[0]
    expect(group).toBeInstanceOf(lib.Group)
    expect((group as InstanceType<typeof lib.Group>).children[0]).toBeInstanceOf(lib.Path)
  })
})
