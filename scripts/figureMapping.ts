export interface FigureMapping {
  figure: string
  chapter: number
  description: string
  codeBlockIndex: number // Index of the code block in the chapter (0-based)
}

export const figureMapping: FigureMapping[] = [
  // Chapter 1: Introduction and Getting Started (3 examples from 6 blocks)
  {
    figure: '001',
    chapter: 1,
    description: 'Simple diagonal line',
    codeBlockIndex: 0,
  },
  {
    figure: '002',
    chapter: 1,
    description: 'Random arcs pattern',
    codeBlockIndex: 1,
  },
  {
    figure: '003',
    chapter: 1,
    description: 'Colored arcs with varying hues',
    codeBlockIndex: 2,
  },

  // Chapter 2: Basic Drawing with Paths (9 examples from 16 blocks)
  {
    figure: '004',
    chapter: 2,
    description: 'Zigzag line',
    codeBlockIndex: 2,
  },
  {
    figure: '005',
    chapter: 2,
    description: 'Triangle',
    codeBlockIndex: 3,
  },
  {
    figure: '006',
    chapter: 2,
    description: 'Chained arcs',
    codeBlockIndex: 4,
  },
  {
    figure: '007',
    chapter: 2,
    description: 'Curves with polarity',
    codeBlockIndex: 5,
  },
  {
    figure: '008',
    chapter: 2,
    description: 'Regular polygons',
    codeBlockIndex: 8,
  },
  {
    figure: '009',
    chapter: 2,
    description: 'Flower shape',
    codeBlockIndex: 9,
  },
  {
    figure: '010',
    chapter: 2,
    description: 'Grid of squares',
    codeBlockIndex: 13,
  },
  {
    figure: '011',
    chapter: 2,
    description: 'Concentric circles',
    codeBlockIndex: 14,
  },
  {
    figure: '012',
    chapter: 2,
    description: 'Spiral',
    codeBlockIndex: 15,
  },

  // Chapter 3: Attributes and Styling (9 examples from 22 blocks)
  {
    figure: '013',
    chapter: 3,
    description: 'RGB circles',
    codeBlockIndex: 3,
  },
  {
    figure: '014',
    chapter: 3,
    description: 'Overlapping semi-transparent circles',
    codeBlockIndex: 4,
  },
  {
    figure: '015',
    chapter: 3,
    description: 'Stroke width variations',
    codeBlockIndex: 8,
  },
  {
    figure: '016',
    chapter: 3,
    description: 'Line cap styles',
    codeBlockIndex: 9,
  },
  {
    figure: '017',
    chapter: 3,
    description: 'Line join styles',
    codeBlockIndex: 10,
  },
  {
    figure: '018',
    chapter: 3,
    description: 'Dashed lines',
    codeBlockIndex: 11,
  },
  {
    figure: '019',
    chapter: 3,
    description: 'Rainbow gradient',
    codeBlockIndex: 16,
  },
  {
    figure: '020',
    chapter: 3,
    description: 'Monochrome concentric',
    codeBlockIndex: 17,
  },
  {
    figure: '021',
    chapter: 3,
    description: 'Saturation variations',
    codeBlockIndex: 18,
  },

  // Chapter 4: Transformations (10 examples from 20 blocks)
  {
    figure: '022',
    chapter: 4,
    description: 'Rotated square',
    codeBlockIndex: 2,
  },
  {
    figure: '023',
    chapter: 4,
    description: 'Rotated pattern',
    codeBlockIndex: 3,
  },
  {
    figure: '024',
    chapter: 4,
    description: 'Grid with translation',
    codeBlockIndex: 5,
  },
  {
    figure: '025',
    chapter: 4,
    description: 'Growing circles',
    codeBlockIndex: 7,
  },
  {
    figure: '026',
    chapter: 4,
    description: 'Transform order comparison',
    codeBlockIndex: 10,
  },
  {
    figure: '027',
    chapter: 4,
    description: 'Rotating star pattern',
    codeBlockIndex: 14,
  },
  {
    figure: '028',
    chapter: 4,
    description: 'Spirograph effect',
    codeBlockIndex: 15,
  },
  {
    figure: '029',
    chapter: 4,
    description: 'Grid with random rotations',
    codeBlockIndex: 16,
  },
  {
    figure: '030',
    chapter: 4,
    description: 'Scaling animation effect',
    codeBlockIndex: 17,
  },
  {
    figure: '031',
    chapter: 4,
    description: 'Perspective with skew',
    codeBlockIndex: 18,
  },

  // Chapter 5: Iteration and Layout Helpers (9 examples from 21 blocks)
  {
    figure: '032',
    chapter: 5,
    description: 'Simple times() loop',
    codeBlockIndex: 1,
  },
  {
    figure: '033',
    chapter: 5,
    description: 'Basic forTiling',
    codeBlockIndex: 3,
  },
  {
    figure: '034',
    chapter: 5,
    description: 'Colored square grid',
    codeBlockIndex: 4,
  },
  {
    figure: '035',
    chapter: 5,
    description: 'Checkerboard pattern',
    codeBlockIndex: 13,
  },
  {
    figure: '036',
    chapter: 5,
    description: 'Gradient grid',
    codeBlockIndex: 14,
  },
  {
    figure: '037',
    chapter: 5,
    description: 'Circular pattern with varying sizes',
    codeBlockIndex: 15,
  },
  {
    figure: '038',
    chapter: 5,
    description: 'Radial burst',
    codeBlockIndex: 16,
  },
  {
    figure: '039',
    chapter: 5,
    description: 'Parametric wave',
    codeBlockIndex: 17,
  },
  {
    figure: '040',
    chapter: 5,
    description: 'Nested grid pattern',
    codeBlockIndex: 18,
  },

  // Chapter 6: Randomness and Generative Art (16 examples from 22 blocks)
  {
    figure: '041',
    chapter: 6,
    description: 'Random circles',
    codeBlockIndex: 1,
  },
  {
    figure: '042',
    chapter: 6,
    description: 'Random rays',
    codeBlockIndex: 2,
  },
  {
    figure: '043',
    chapter: 6,
    description: 'Random polygons',
    codeBlockIndex: 3,
  },
  {
    figure: '044',
    chapter: 6,
    description: 'Random polarity curves',
    codeBlockIndex: 4,
  },
  {
    figure: '045',
    chapter: 6,
    description: 'Color sampling',
    codeBlockIndex: 5,
  },
  {
    figure: '046',
    chapter: 6,
    description: 'Gaussian distribution',
    codeBlockIndex: 7,
  },
  {
    figure: '047',
    chapter: 6,
    description: 'Gaussian visualization',
    codeBlockIndex: 8,
  },
  {
    figure: '048',
    chapter: 6,
    description: 'Perturbed grid',
    codeBlockIndex: 10,
  },
  {
    figure: '049',
    chapter: 6,
    description: 'Wavy line',
    codeBlockIndex: 11,
  },
  {
    figure: '050',
    chapter: 6,
    description: 'Random walk',
    codeBlockIndex: 12,
  },
  {
    figure: '051',
    chapter: 6,
    description: 'Organic shape',
    codeBlockIndex: 13,
  },
  {
    figure: '052',
    chapter: 6,
    description: 'Scattered composition',
    codeBlockIndex: 14,
  },
  {
    figure: '053',
    chapter: 6,
    description: 'Random grid disruption',
    codeBlockIndex: 15,
  },
  {
    figure: '054',
    chapter: 6,
    description: 'Branching structure',
    codeBlockIndex: 16,
  },
  {
    figure: '055',
    chapter: 6,
    description: 'Cellular/Voronoi pattern',
    codeBlockIndex: 17,
  },
  {
    figure: '056',
    chapter: 6,
    description: 'Weighted randomness',
    codeBlockIndex: 19,
  },

  // Chapter 7: Advanced Path Operations (15 examples from 18 blocks)
  {
    figure: '057',
    chapter: 7,
    description: 'Chaiken smoothing comparison',
    codeBlockIndex: 1,
  },
  {
    figure: '058',
    chapter: 7,
    description: 'Smooth random walk',
    codeBlockIndex: 2,
  },
  {
    figure: '059',
    chapter: 7,
    description: 'Organic shape from polygon',
    codeBlockIndex: 3,
  },
  {
    figure: '060',
    chapter: 7,
    description: 'Natural terrain',
    codeBlockIndex: 4,
  },
  {
    figure: '061',
    chapter: 7,
    description: 'Wavy line with map()',
    codeBlockIndex: 6,
  },
  {
    figure: '062',
    chapter: 7,
    description: 'Displacement with map()',
    codeBlockIndex: 7,
  },
  {
    figure: '063',
    chapter: 7,
    description: 'Path cloning',
    codeBlockIndex: 8,
  },
  {
    figure: '064',
    chapter: 7,
    description: 'Clone with transformations',
    codeBlockIndex: 9,
  },
  {
    figure: '065',
    chapter: 7,
    description: 'Smooth random shapes',
    codeBlockIndex: 10,
  },
  {
    figure: '066',
    chapter: 7,
    description: 'Layered smooth paths',
    codeBlockIndex: 11,
  },
  {
    figure: '067',
    chapter: 7,
    description: 'Iterative smoothing',
    codeBlockIndex: 12,
  },
  {
    figure: '068',
    chapter: 7,
    description: 'Wobbling spiral',
    codeBlockIndex: 13,
  },
  {
    figure: '069',
    chapter: 7,
    description: 'Mirrored paths',
    codeBlockIndex: 14,
  },
  {
    figure: '070',
    chapter: 7,
    description: 'Kaleidoscope effect',
    codeBlockIndex: 15,
  },
  {
    figure: '071',
    chapter: 7,
    description: 'Deformed grid',
    codeBlockIndex: 16,
  },

  // Chapter 8: Complete Examples and Projects (9 examples - all 9 blocks)
  {
    figure: '072',
    chapter: 8,
    description: 'Geometric Mandala',
    codeBlockIndex: 0,
  },
  {
    figure: '073',
    chapter: 8,
    description: 'Flow Field',
    codeBlockIndex: 1,
  },
  {
    figure: '074',
    chapter: 8,
    description: 'Procedural Trees',
    codeBlockIndex: 2,
  },
  {
    figure: '075',
    chapter: 8,
    description: 'Islamic Geometric Pattern',
    codeBlockIndex: 3,
  },
  {
    figure: '076',
    chapter: 8,
    description: 'Maze Generator',
    codeBlockIndex: 4,
  },
  {
    figure: '077',
    chapter: 8,
    description: 'Sunburst Radial Pattern',
    codeBlockIndex: 5,
  },
  {
    figure: '078',
    chapter: 8,
    description: 'Cellular Growth Simulation',
    codeBlockIndex: 6,
  },
  {
    figure: '079',
    chapter: 8,
    description: 'Plotter-Ready Hatching',
    codeBlockIndex: 7,
  },
  {
    figure: '080',
    chapter: 8,
    description: 'Generative Landscape',
    codeBlockIndex: 8,
  },
]
