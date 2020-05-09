# solandra-svg

[Try out](https://codesandbox.io/s/simple-solandra-svg-demo-obinl)

[Site](https://solandra-svg.netlify.app/)

[Install](https://www.npmjs.com/package/solandra-svg)

![Sample](./sample.svg)

```typescript
s.times(25, () => {
  s.strokedPath((attr) => attr.fill(20, 90, 50, 0.2))
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})
```

## To develop or run locally

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## The Plan

Core, relevant bits of Solandra applied to SVG for static renders. Include html-ish stuff like classes, ids. Do groups, layers, ...

Don't do fill/draw separately (as Solandra)

Main short term goal is for plotting type stuff.

Keep it minimal

Output in various ways: inital focus preview/sketch-book + svg file (or something equiv)

Probably just support svg, path and g(roup)

## TO DO/Roadmap

- [x] Basics
- [x] Transforms
- [x] Arcs (within path)
- [x] Ellipse (as move, arc)
- [x] Custom path transform (i.e. user supplied functiont to transform; at least points, maybe other aspects of path spec?)
- [x] Chaiken
- [x] clone path
- [x] squash commits(!), publish to npm, open source

### Post v'0.1'

- [x] Inkscape friendly export (dimensions, colours, ...?)
- [x] Groups (have plans for closure based approach for nesting)
- [x] Quick website update (animated transitions, links to source code (but keep very simple, raw GH nothing embedded(!)))

### After

- [x] Object literal apis for attributes and transforms

## API

## Publishing

`yarn build:package`

`cd package`

`npm publish`

## Deploy (this docs/examples site)

I don't really care about old browsers etc so happy to use flatMap and other modern features. If you want to deploy this with SSR you will also need to either use a modern node version e.g. I use Netlify and set in the environment variables:

```
NODE_VERSION 14
```
