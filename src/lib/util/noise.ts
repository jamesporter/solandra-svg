import { dot } from "./vectors";

/**
 * 2D Perlin noise implementation.
 *
 * Adapted from public domain code:
 * {@link https://github.com/josephg/noisejs/blob/master/perlin.js}
 *
 * @module
 */

/**
 * Applies the smoothstep fade function `6t^5 - 15t^4 + 10t^3` for smooth interpolation.
 *
 * @param t - The input value
 * @returns The smoothed value
 * @internal
 */
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linearly interpolates between two values.
 *
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor in `[0, 1]`
 * @returns The interpolated value
 * @internal
 */
function lerp(a: number, b: number, t: number) {
  return (1 - t) * a + t * b;
}

/** Gradient vectors for 3D noise (only x,y components used for 2D Perlin noise). */
const grad3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1]
];

/** Ken Perlin's original permutation table (256 entries). */
var p = [
  151,
  160,
  137,
  91,
  90,
  15,
  131,
  13,
  201,
  95,
  96,
  53,
  194,
  233,
  7,
  225,
  140,
  36,
  103,
  30,
  69,
  142,
  8,
  99,
  37,
  240,
  21,
  10,
  23,
  190,
  6,
  148,
  247,
  120,
  234,
  75,
  0,
  26,
  197,
  62,
  94,
  252,
  219,
  203,
  117,
  35,
  11,
  32,
  57,
  177,
  33,
  88,
  237,
  149,
  56,
  87,
  174,
  20,
  125,
  136,
  171,
  168,
  68,
  175,
  74,
  165,
  71,
  134,
  139,
  48,
  27,
  166,
  77,
  146,
  158,
  231,
  83,
  111,
  229,
  122,
  60,
  211,
  133,
  230,
  220,
  105,
  92,
  41,
  55,
  46,
  245,
  40,
  244,
  102,
  143,
  54,
  65,
  25,
  63,
  161,
  1,
  216,
  80,
  73,
  209,
  76,
  132,
  187,
  208,
  89,
  18,
  169,
  200,
  196,
  135,
  130,
  116,
  188,
  159,
  86,
  164,
  100,
  109,
  198,
  173,
  186,
  3,
  64,
  52,
  217,
  226,
  250,
  124,
  123,
  5,
  202,
  38,
  147,
  118,
  126,
  255,
  82,
  85,
  212,
  207,
  206,
  59,
  227,
  47,
  16,
  58,
  17,
  182,
  189,
  28,
  42,
  223,
  183,
  170,
  213,
  119,
  248,
  152,
  2,
  44,
  154,
  163,
  70,
  221,
  153,
  101,
  155,
  167,
  43,
  172,
  9,
  129,
  22,
  39,
  253,
  19,
  98,
  108,
  110,
  79,
  113,
  224,
  232,
  178,
  185,
  112,
  104,
  218,
  246,
  97,
  228,
  251,
  34,
  242,
  193,
  238,
  210,
  144,
  12,
  191,
  179,
  162,
  241,
  81,
  51,
  145,
  235,
  249,
  14,
  239,
  107,
  49,
  192,
  214,
  31,
  181,
  199,
  106,
  157,
  184,
  84,
  204,
  176,
  115,
  121,
  50,
  45,
  127,
  4,
  150,
  254,
  138,
  236,
  205,
  93,
  222,
  114,
  67,
  29,
  24,
  72,
  243,
  141,
  128,
  195,
  78,
  66,
  215,
  61,
  156,
  180
];

/** Doubled permutation table (512 entries) for wrapping lookups. */
const perm = new Array(512);
/** Doubled gradient lookup table (512 entries) for wrapping lookups. */
const gradP = new Array(512);

/**
 * Seeds the noise permutation tables using the given seed value.
 *
 * Fractional seeds in `(0, 1)` are scaled up to a 16-bit integer range.
 * Seeds below 256 are expanded to use both high and low bytes.
 *
 * @param seed - The seed value
 * @internal
 */
function seedNoise(seed: number) {
  if (seed > 0 && seed < 1) {
    seed *= 65536;
  }

  seed = Math.floor(seed);
  if (seed < 256) {
    seed |= seed << 8;
  }

  for (var i = 0; i < 256; i++) {
    var v;
    if (i & 1) {
      v = p[i] ^ (seed & 255);
    } else {
      v = p[i] ^ ((seed >> 8) & 255);
    }

    perm[i] = perm[i + 256] = v;
    gradP[i] = gradP[i + 256] = grad3[v % 12];
  }
}

seedNoise(0);

/**
 * Computes 2D Perlin noise at the given coordinates.
 *
 * Returns a value roughly in the range `[-1, 1]` (though typically smaller in magnitude).
 * The noise is deterministic for the same input coordinates and seed.
 *
 * @param ax - The x coordinate
 * @param ay - The y coordinate
 * @returns The Perlin noise value at `(ax, ay)`
 */
export function perlin2(ax: number, ay: number) {
  let X = Math.floor(ax);
  let Y = Math.floor(ay);

  let x = ax - X;
  let y = ay - Y;

  X = X & 255;
  Y = Y & 255;

  // Calculate noise contributions from each of the four corners
  var n00 = dot(gradP[X + perm[Y]], [x, y]);
  var n01 = dot(gradP[X + perm[Y + 1]], [x, y - 1]);
  var n10 = dot(gradP[X + 1 + perm[Y]], [x - 1, y]);
  var n11 = dot(gradP[X + 1 + perm[Y + 1]], [x - 1, y - 1]);

  const u = fade(x);

  // Interpolate the four results
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
}
