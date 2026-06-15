import { writeFile } from "node:fs/promises";

const FPS = 60;
const DURATION_FRAMES = 420; // 7 seconds: slow enough for a premium hero loop.
const W = 512;
const H = 720;
const CENTER_X = W / 2;
const CENTER_Y = H / 2;
const HELIX_HEIGHT = 560;
const RUNG_COUNT = 26;
const AMP = 98;
const FRAME_STEP = 35;
const FRAMES = Array.from({ length: DURATION_FRAMES / FRAME_STEP + 1 }, (_, index) => index * FRAME_STEP);

const COLORS = {
  bg: hexColor("#f7f7f4"),
  primary: hexColor("#315dff"),
  ink: hexColor("#2d2e31"),
  softBlue: hexColor("#c1ecff"),
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

function pointAt(rungIndex, frame, side = 1) {
  // DNA structure generation:
  // Evenly spaced rungs define a vertical double helix. Each side uses the same
  // phase offset by PI, which keeps the strands perfectly symmetrical.
  const normalized = rungIndex / (RUNG_COUNT - 1);
  const yBase = CENTER_Y - HELIX_HEIGHT / 2 + normalized * HELIX_HEIGHT;
  const strandPhase = normalized * Math.PI * 7.2;
  const rotation = (frame / DURATION_FRAMES) * Math.PI * 2;
  const phase = strandPhase + rotation + (side < 0 ? Math.PI : 0);
  const organicFloat = Math.sin(rotation * 2 + normalized * Math.PI * 2) * 2.4;
  const x = Math.sin(phase) * AMP;
  const z = Math.cos(phase);

  return {
    x,
    y: yBase + organicFloat,
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

function rectGroup({ name, width, height, radius, fillSid, opacity, transform }) {
  return {
    ty: "gr",
    nm: name,
    it: [
      { ty: "rc", p: staticProperty([0, 0]), s: staticProperty([width, height]), r: staticProperty(radius) },
      { ty: "fl", c: { sid: fillSid }, o: staticProperty(opacity) },
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

function ellipseGroup({ name, size, fillSid, opacity, transform }) {
  return {
    ty: "gr",
    nm: name,
    it: [
      { ty: "el", p: staticProperty([0, 0]), s: staticProperty([size, size]) },
      { ty: "fl", c: { sid: fillSid }, o: staticProperty(opacity) },
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

    vertices.push([round(current.x), round(current.y - CENTER_Y)]);
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
  return {
    ty: "gr",
    nm: side > 0 ? "primary-strand-path" : "secondary-strand-path",
    it: [
      { ty: "sh", ks: animatedShapeProperty(side) },
      {
        ty: "st",
        c: { sid: side > 0 ? "strandColorA" : "strandColorB" },
        o: staticProperty(side > 0 ? 84 : 72),
        w: staticProperty(3.4),
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
  const baseWidth = AMP * 2;
  return rectGroup({
    name: `base-pair-${rungIndex + 1}`,
    width: baseWidth,
    height: 2.2,
    radius: 1.1,
    fillSid: "connectorColor",
    opacity: 100,
    transform: {
      p: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        return [0, a.y - CENTER_Y];
      }),
      s: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        const length = Math.abs(a.x) * 2;
        return [(length / baseWidth) * 100, 100];
      }),
      o: animatedProperty((frame) => {
        const a = pointAt(rungIndex, frame, 1);
        return depthOpacity(1 - Math.abs(a.front - 0.5) * 2, 14, 44);
      }),
    },
  });
}

function strandNodeGroup(rungIndex, side) {
  return ellipseGroup({
    name: `${side > 0 ? "right" : "left"}-node-${rungIndex + 1}`,
    size: 10.5,
    fillSid: side > 0 ? "strandColorA" : "strandColorB",
    opacity: 100,
    transform: {
      p: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return [point.x, point.y - CENTER_Y];
      }),
      s: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        const scale = depthScale(point.front);
        return [scale, scale];
      }),
      o: animatedProperty((frame) => {
        const point = pointAt(rungIndex, frame, side);
        return depthOpacity(point.front, 28, 100);
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
for (let index = 0; index < RUNG_COUNT; index += 1) {
  rungs.push(rungGroup(index));
  nodes.push(strandNodeGroup(index, -1), strandNodeGroup(index, 1));
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
    strandColorA: { p: { a: 0, k: COLORS.primary } },
    strandColorB: { p: { a: 0, k: COLORS.softBlue } },
    connectorColor: { p: { a: 0, k: COLORS.ink } },
    overallOpacity: { p: { a: 0, k: 100 } },
  },
  layers: [
    // Performance optimization:
    // The animation uses two DNA vector layers and one background layer.
    // Continuous strands are animated as two paths, avoiding dozens of separate
    // segment layers. No raster images, no SVG imports, no particles, and no effects.
    makeShapeLayer({ name: "dna-nodes", shapes: nodes }),
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
    { sid: "overallOpacity", label: "DNA opacity", min: 0, max: 100, step: 1 },
  ],
};

// Loop implementation:
// The last frame samples the same angular state as frame 0, so Skottie can loop
// endlessly without a pop at the seam.
await writeFile(new URL("../public/lottie.json", import.meta.url), `${JSON.stringify(lottie)}\n`);
await writeFile(new URL("../public/controls.json", import.meta.url), `${JSON.stringify(controls, null, 2)}\n`);

console.log(`Generated premium DNA Lottie: ${RUNG_COUNT} rungs, ${DURATION_FRAMES / FPS}s loop, ${lottie.layers.length} layers.`);
