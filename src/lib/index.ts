/**
 * Solandra SVG - A declarative, fluent, type-safe SVG drawing library.
 *
 * @packageDocumentation
 */

export * from "./svg"
export * from "./attributes"
export * from "./transforms"
export * from "./path"

export * from "./util/noise"
/** Vector/point math utilities (add, subtract, rotate, scale, etc.) */
export { default as v } from "./util/vectors"
/** Collection operations (pairWise, tripleWise, zip2, sum, arrayOf) */
export { default as c } from "./util/collectionOps"
export * from "./util/util"

export * from "./util/types"
