import { writeFile } from "node:fs/promises";

const FPS = 60;
const DURATION_FRAMES = 420; // 7 seconds: slow enough for a premium hero loop.
const W = 1280;
const H = 520;
const CENTER_X = W / 2;
const CENTER_Y = H / 2;
const HELIX_WIDTH = 1240;
const RUNG_COUNT = 42;
const AMP = 128;
const FRAME_STEP = 35;
const FRAMES = Array.from({ length: DURATION_FRAMES / FRAME_STEP + 1 }, (_, index) => index * FRAME_STEP);

const COLORS = {
  bg: hexColor("#f7f7f4"),
  primary: hexColor("#315dff"),
  ink: hexColor("#2d2e31"),
  softBlue: hexColor("#c1ecff"),
  glass: hexColor("#ffffff"),
  glassEdge: hexColor("#d7f2ff"),
  glassFacet: hexColor("#9edaff"),
  white: hexColor("#ffffff"),
};

function hexColor(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  return [round(r), round(g), round(b), alpha];
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function linearEase(dimensions = 1) {
  return {
    i: { x: Array(dimensions).fill(0), y: Array(dimensions).fill(0) },
    o: { x: Array(dimensions).fill(1), y: Array(dimensions).fill(1) },
  };
}

function toArray(value) {
  return Array.isArray(value) ? value.map(round) : [round(value)];
}

function animatedProperty(valueAtFrame) {
  const keyframes = FRAMES.map((frame, index) => {
    const value = toArray(valueAtFrame(frame));
    const keyframe = { t: frame, s: value };

    if (index < FRAMES.length - 1) {
      Object.assign(keyframe, linearEase(value.length));
    }

    return keyframe;
  });

  return { a: 1, k: keyframes };
}

function staticProperty(value) {
  return { a: 0, k: value };
}

function pathShape(vertices, closed = true) {
  return {
    c: closed,
    v: vertices.map(([x, y]) => [round(x), round(y)]),
    i: vertices.map(() => [0, 0]),
    o: vertices.map(() => [0, 0]),
  };
}

function pathItem(vertices, closed = true) {
  return {
    ty: "sh",
    ks: staticProperty(pathShape(vertices, closed)),
  };
}

function pointAt(rungIndex, frame, side = 1) {
  // DNA structure generation:
  // Evenly spaced rungs now run horizontally across a hero-width composition,
  // matching the attached reference silhouette. Each side uses the same phase
  // offset by PI, keeping the two strands symmetrical.
  const normalized = rungIndex / (RUNG_COUNT - 1);
  const xBase = CENTER_X - HELIX_WIDTH / 2 + normalized * HELIX_WIDTH;
  const strandPhase = normalized * Math.PI * 7.7;
  const rotation = (frame / DURATION_FRAMES) * Math.PI * 2;
  const phase = strandPhase + rotation + (side < 0 ? Math.PI : 0);
  const organicFloat = Math.sin(rotation * 1.5 + normalized * Math.PI * 2) * 2.8;
  const y = CENTER_Y + Math.sin(phase) * AMP + organicFloat;
  const z = Math.cos(phase);

  return {
    x: xBase,
    y,
    z,
    front: (z + 1) / 2,
  };
}

function depthOpacity(front, min = 24, max = 96) {
  // Depth simulation:
  // Front-facing points become larger and more opaque. Rear-facing points fade
  // down instead of disappearing, creating a calm 3D illusion without particles.
  return min + (max - min) * front;
}

function depthScale(front, min = 72, max = 118) {
  return min + (max - min) * front;
}

function rectGroup({ name, width, height, radius, fillSid, strokeSid, strokeWidth = 0, opacity, transform }) {
  const items = [
    { ty: "rc", p: staticProperty([0, 0]), s: staticProperty([width, height]), r: staticProperty(radius) },
    { ty: "fl", c: { sid: fillSid }, o: staticProperty(opacity) },
  ];

  if (strokeSid && strokeWidth > 0) {
    items.push({
      ty: "st",
      c: { sid: strokeSid },
      o: staticProperty(Math.min(100, opacity + 18)),
      w: staticProperty(strokeWidth),
      lc: 2,
      lj: 2,
      ml: 4,
    });
  }

  return {
    ty: "gr",
    nm: name,
    it: [
      ...items,
      {
        ty: "tr",
        p: transform.p,
        a: staticProperty([0, 0]),
        s: transform.s,
        r: transform.r ?? staticProperty(0),
        o: transform.o,
      },
    ],
  };
}

function crystalNodeGroup({ name, size, fillSid, opacity, transform }) {
  // Glass texture with facets:
  // Each node is a crisp hexagonal "cut glass" bead. Inner triangular facets
  // create the panelled look from the reference without raster textures.
  const r = size / 2;
  const hex = [
    [0, -r],
    [r * 0.82, -r * 0.46],
    [r * 0.82, r * 0.46],
    [0, r],
    [-r * 0.82, r * 0.46],
    [-r * 0.82, -r * 0.46],
  ];
  const topFacet = [
    [0, -r * 0.9],
    [r * 0.7, -r * 0.42],
    [0, -r * 0.08],
    [-r * 0.7, -r * 0.42],
  ];
  const rightFacet = [
    [0, -r * 0.08],
    [r * 0.72, -r * 0.4],
    [r * 0.68, r * 0.36],
    [0, r * 0.12],
  ];
  const leftFacet = [
    [0, -r * 0.08],
    [0, r * 0.12],
    [-r * 0.68, r * 0.36],
    [-r * 0.72, -r * 0.4],
  ];

  return {
    ty: "gr",
    nm: name,
    it: [
      pathItem(hex),
      { ty: "fl", c: { sid: fillSid }, o: staticProperty(opacity) },
      { ty: "st", c: { sid: "glassEdgeColor" }, o: staticProperty(76), w: staticProperty(1.2), lc: 2, lj: 2, ml: 4 },
      pathItem(topFacet),
      { ty: "fl", c: { sid: "glassHighlightColor" }, o: staticProperty(34) },
      pathItem(rightFacet),
      { ty: "fl", c: { sid: "glassFacetColor" }, o: staticProperty(22) },
      pathItem(leftFacet),
      { ty: "fl", c: { sid: "strandColorA" }, o: staticProperty(12) },
      {
        ty: "tr",
        p: transform.p,
        a: staticProperty([0, 0]),
        s: transform.s,
        r: staticProperty(0),
        o: transform.o,
      },
    ],
  };
}

function strandShapeAt(frame, side) {
  const vertices = [];
  const inTangents = [];
  const outTangents = [];

  for (let index = 0; index < RUNG_COUNT; index += 1) {
    const current = pointAt(index, frame, side);
    const previous = pointAt(Math.max(index - 1, 0), frame, side);
    const next = pointAt(Math.min(index + 1, RUNG_COUNT - 1), frame, side);
    const tangentX = (next.x - previous.x) * 0.16;
    const tangentY = (next.y - previous.y) * 0.16;

    vertices.push([round(current.x - CENTER_X), round(current.y - CENTER_Y)]);
    inTangents.push(index === 0 ? [0, 0] : [round(-tangentX), round(-tangentY)]);
    outTangents.push(index === RUNG_COUNT - 1 ? [0, 0] : [round(tangentX), round(tangentY)]);
  }

  return {
    c: false,
    v: vertices,
    i: inTangents,
    o: outTangents,
  };
}

function animatedShapeProperty(side) {
  const keyframes = FRAMES.map((frame, index) => {
    const keyframe = { t: frame, s: [strandShapeAt(frame, side)] };

    if (index < FRAMES.length - 1) {
      Object.assign(keyframe, linearEase(1));
    }

    return keyframe;
  });

  return { a: 1, k: keyframes };
}

function strandPathGroup(side) {
  const strandName = side > 0 ? "primary-strand-path" : "secondary-strand-path";
  const strandColor = side > 0 ? "strandColorA" : "strandColorB";

  return {
    ty: "gr",
    nm: strandName,
    it: [
      { ty: "sh", ks: animatedShapeProperty(side) },
      {
        ty: "st",
        c: { sid: "glassHighlightColor" },
        o: staticProperty(side > 0 ? 62 : 54),
        w: staticProperty(18),
        lc: 2,
        lj: 2,
        ml: 4,
      },
      { ty: "sh", ks: animatedShapeProperty(side) },
      {
        ty: "st",
        c: { sid: strandColor },
        o: staticProperty(side > 0 ? 58 : 52),
        w: staticProperty(11),
        lc: 2,
        lj: 2,
        ml: 4,
      },
      { ty: "sh", ks: animatedShapeProperty(side) },
      {
        ty: "st",
        c: { sid: "glassEdgeColor" },
        o: staticProperty(82),
        w: staticProperty(2.4),
        lc: 2,
        lj: 2,
        ml: 4,
      },
      {
        ty: "tr",
        p: staticProperty([0, 0]),
        a: staticProperty([0, 0]),
        s: staticProperty([100, 100]),
        r: staticProperty(0),
        o: staticProperty(100),
      },
    ],
  };
}

function rungGroup(rungIndex) {
  const baseWidth = AMP * 2.16;
  return rectGroup({
    name: `base-pair-${rungIndex + 1}`,
    width: baseWidth,
    height: 8.8,
    radius: 4.4,
    fillSid: "glassHighlightColor",
    strokeSid: "glassEdgeColor",
    strokeWidth: 0.7,
    opacity: 42,
    transform: {
      p: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        const b = pointAt(rungIndex, frame, -1);
        return [(a.x + b.x) / 2 - CENTER_X, (a.y + b.y) / 2 - CENTER_Y];
      }),
      s: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        const b = pointAt(rungIndex, frame, -1);
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        return [(length / baseWidth) * 100, 100];
      }),
      r: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        const b = pointAt(rungIndex, frame, -1);
        return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      }),
      o: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        return depthOpacity(1 - Math.abs(a.front - 0.5) * 2, 14, 58);
      }),
    },
  });
}

function strandNodeGroup(rungIndex, side) {
  return crystalNodeGroup({
    name: `${side > 0 ? "right" : "left"}-node-${rungIndex + 1}`,
    size: 31,
    fillSid: "glassColor",
    opacity: side > 0 ? 46 : 38,
    transform: {
      p: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return [point.x - CENTER_X, point.y - CENTER_Y];
      }),
      s: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        const scale = depthScale(point.front, 78, 136);
        return [scale, scale];
      }),
      o: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return depthOpacity(point.front, 28, 92);
      }),
    },
  });
}

function facetShardGroup(rungIndex, side, offset) {
  // Additional glass facets:
  // Small skewed plates ride along the helix, suggesting prismatic cut planes.
  // They are sparse on purpose, keeping the animation premium instead of noisy.
  return rectGroup({
    name: `${side > 0 ? "right" : "left"}-facet-${rungIndex + 1}-${offset}`,
    width: 34,
    height: 9,
    radius: 2,
    fillSid: offset % 2 === 0 ? "glassFacetColor" : "glassHighlightColor",
    strokeSid: "glassEdgeColor",
    strokeWidth: 0.4,
    opacity: 34,
    transform: {
      p: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return [point.x - CENTER_X + side * 13, point.y - CENTER_Y + offset * 5];
      }),
      s: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        const scale = depthScale(point.front, 70, 112);
        return [scale, scale * 0.82];
      }),
      r: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return side * 28 + (point.front - 0.5) * 36;
      }),
      o: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return depthOpacity(point.front, 6, 38);
      }),
    },
  });
}

function makeShapeLayer({ name, shapes }) {
  return {
    ty: 4,
    nm: name,
    ip: 0,
    op: DURATION_FRAMES,
    st: 0,
    ks: {
      o: { sid: "overallOpacity" },
      r: staticProperty(0),
      a: staticProperty([0, 0, 0]),
      // Rotation logic:
      // The helix itself is generated in rotating positions. The full layer has
      // only a subtle float, keeping the loop stable and avoiding camera shake.
      p: animatedProperty((frame) => {
        const rotation = (frame / DURATION_FRAMES) * Math.PI * 2;
        return [CENTER_X, CENTER_Y + Math.sin(rotation) * 4, 0];
      }),
      s: staticProperty([100, 100, 100]),
    },
    shapes,
  };
}

function backgroundLayer() {
  return {
    ty: 4,
    nm: "editable-background",
    ip: 0,
    op: DURATION_FRAMES,
    st: 0,
    ks: {
      o: staticProperty(100),
      r: staticProperty(0),
      a: staticProperty([0, 0, 0]),
      s: staticProperty([100, 100, 100]),
      p: staticProperty([CENTER_X, CENTER_Y, 0]),
    },
    shapes: [
      {
        ty: "gr",
        nm: "background-fill",
        it: [
          { ty: "rc", p: staticProperty([0, 0]), s: staticProperty([W, H]), r: staticProperty(0) },
          { ty: "fl", c: { sid: "bgColor" }, o: staticProperty(100) },
          {
            ty: "tr",
            p: staticProperty([0, 0]),
            a: staticProperty([0, 0]),
            s: staticProperty([100, 100]),
            r: staticProperty(0),
            o: staticProperty(100),
          },
        ],
      },
    ],
  };
}

const rungs = [];
const nodes = [];
const facets = [];
for (let index = 0; index < RUNG_COUNT; index += 1) {
  rungs.push(rungGroup(index));
  nodes.push(strandNodeGroup(index, -1), strandNodeGroup(index, 1));
  if (index % 3 === 1) {
    facets.push(facetShardGroup(index, -1, -1), facetShardGroup(index, 1, 1));
  }
}

const lottie = {
  v: "5.7.0",
  fr: FPS,
  ip: 0,
  op: DURATION_FRAMES,
  w: W,
  h: H,
  assets: [],
  slots: {
    bgColor: { p: { a: 0, k: COLORS.bg } },
    strandColorA: { p: { a: 0, k: hexColor("#2f66ff", 0.82) } },
    strandColorB: { p: { a: 0, k: hexColor("#88dcff", 0.76) } },
    connectorColor: { p: { a: 0, k: COLORS.ink } },
    glassColor: { p: { a: 0, k: hexColor("#ffffff", 0.42) } },
    glassEdgeColor: { p: { a: 0, k: hexColor("#d7f2ff", 0.88) } },
    glassFacetColor: { p: { a: 0, k: hexColor("#9edaff", 0.42) } },
    glassHighlightColor: { p: { a: 0, k: hexColor("#ffffff", 0.78) } },
    overallOpacity: { p: { a: 0, k: 100 } },
  },
  layers: [
    // Performance optimization:
    // The animation uses two DNA vector layers and one background layer.
    // Continuous strands are animated as two paths, avoiding dozens of separate
    // segment layers. No raster images, no SVG imports, no particles, and no effects.
    makeShapeLayer({ name: "dna-glass-facets-and-nodes", shapes: [...facets, ...nodes] }),
    makeShapeLayer({ name: "dna-strands-and-base-pairs", shapes: [...rungs, strandPathGroup(-1), strandPathGroup(1)] }),
    backgroundLayer(),
  ],
};

const controls = {
  controls: [
    { sid: "bgColor", label: "Background color" },
    { sid: "strandColorA", label: "Primary strand color" },
    { sid: "strandColorB", label: "Secondary strand color" },
    { sid: "connectorColor", label: "Base pair color" },
    { sid: "glassColor", label: "Glass body color" },
    { sid: "glassEdgeColor", label: "Glass edge color" },
    { sid: "glassFacetColor", label: "Glass facet color" },
    { sid: "glassHighlightColor", label: "Glass highlight color" },
    { sid: "overallOpacity", label: "DNA opacity", min: 0, max: 100, step: 1 },
  ],
};

// Loop implementation:
// The last frame samples the same angular state as frame 0, so Skottie can loop
// endlessly without a pop at the seam.
await writeFile(new URL("../public/lottie.json", import.meta.url), `${JSON.stringify(lottie)}\n`);
await writeFile(new URL("../public/controls.json", import.meta.url), `${JSON.stringify(controls, null, 2)}\n`);

console.log(`Generated premium DNA Lottie: ${RUNG_COUNT} rungs, ${DURATION_FRAMES / FPS}s loop, ${lottie.layers.length} layers.`);
