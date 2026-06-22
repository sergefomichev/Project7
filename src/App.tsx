import { ArrowRight, ChevronDown, Menu, Play, Star, X } from "lucide-react";
import {
  BracketsCurly,
  CaretRight,
  CheckCircle,
  Circle,
  FlowArrow,
  Gauge,
  GitBranch,
  SpinnerGap,
  Timer,
  UsersThree,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";

const navItems = [
  "Case studies",
  "Services",
  "Expertise",
  "How we deliver",
  "Insights",
  "About",
];

const visibleSections = {
  heroDnaShader: false,
  caseProof: false,
} as const;

type CursorState = {
  rx: number;
  ry: number;
  x: number;
  y: number;
  active: boolean;
};

type Panel = {
  id: number;
  offset: number;
  yOffset: number;
  depth: number;
  rowShiftX: number;
  rowShiftY: number;
};

const basePanels = [
  { id: 1, offset: -2.5, yOffset: -225, depth: 0.56 },
  { id: 2, offset: -1.5, yOffset: -135, depth: 0.56 },
  { id: 3, offset: -0.5, yOffset: -45, depth: 0.56 },
  { id: 4, offset: 0.5, yOffset: 45, depth: 0.56 },
  { id: 5, offset: 1.5, yOffset: 135, depth: 0.56 },
  { id: 6, offset: 2.5, yOffset: 225, depth: 0.56 },
];

const panelRows = [
  { id: 0, shiftX: -960, shiftY: 80 },
  { id: 1, shiftX: -560, shiftY: -80 },
  { id: 2, shiftX: -320, shiftY: -240 },
];

const panels: Panel[] = panelRows.flatMap((row) =>
  basePanels.map((panel) => ({
    ...panel,
    id: row.id * 10 + panel.id,
    rowShiftX: row.shiftX,
    rowShiftY: row.shiftY,
  })),
);

function useHeroCursor() {
  const [cursor, setCursor] = useState<CursorState>({ rx: 0, ry: 0, x: 0, y: 0, active: false });
  const target = useRef<CursorState>({ rx: 0, ry: 0, x: 0, y: 0, active: false });
  const current = useRef<CursorState>({ rx: 0, ry: 0, x: 0, y: 0, active: false });
  const viewport = useRef({ width: 1440, height: 900 });

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let frame = 0;

    if (reduceMotion.matches || coarsePointer.matches) {
      return undefined;
    }

    const updateViewport = () => {
      viewport.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    function tick() {
      current.current.rx += (target.current.rx - current.current.rx) * 0.07;
      current.current.ry += (target.current.ry - current.current.ry) * 0.07;
      current.current.x += (target.current.x - current.current.x) * 0.16;
      current.current.y += (target.current.y - current.current.y) * 0.16;
      current.current.active = target.current.active;
      setCursor({ ...current.current });

      const stillMoving =
        target.current.active ||
        Math.abs(target.current.rx - current.current.rx) > 0.001 ||
        Math.abs(target.current.ry - current.current.ry) > 0.001 ||
        Math.abs(target.current.x - current.current.x) > 0.5 ||
        Math.abs(target.current.y - current.current.y) > 0.5;

      frame = stillMoving ? window.requestAnimationFrame(tick) : 0;
    }

    const startTick = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { width, height } = viewport.current;

      target.current = {
        rx: (event.clientX / width - 0.5) * 2,
        ry: (event.clientY / height - 0.5) * 2,
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
      startTick();
    };

    const handlePointerLeave = () => {
      const { width, height } = viewport.current;
      target.current = { rx: 0, ry: 0, x: width / 2, y: height / 2, active: false };
      startTick();
    };

    updateViewport();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", updateViewport, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", updateViewport);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return cursor;
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update, { passive: true });

    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealSelector = "[data-reveal], [data-section-reveal]";
    const seen = new WeakSet<Element>();

    const revealNow = (element: Element) => {
      element.classList.add("is-visible");
      seen.add(element);
    };

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      document.querySelectorAll(revealSelector).forEach(revealNow);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          revealNow(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "18% 0px 18% 0px",
        threshold: 0,
      },
    );

    const registerRevealElement = (element: Element) => {
      if (seen.has(element)) {
        return;
      }

      if (element.closest(".hero-section") || element.closest("[data-section-reveal].is-visible")) {
        revealNow(element);
        return;
      }

      observer.observe(element);
      seen.add(element);
    };

    const registerTree = (node: Node) => {
      if (!(node instanceof Element)) {
        return;
      }

      if (node.matches(revealSelector)) {
        registerRevealElement(node);
      }

      node.querySelectorAll(revealSelector).forEach(registerRevealElement);
    };

    document.querySelectorAll(revealSelector).forEach(registerRevealElement);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(registerTree);
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

function App() {
  useScrollReveal();

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#f6f8ff]">
      <HeroSection />
      <BrandDnaSection />
      <AerospaceDnaSection />
      <ClientConfessionsSection />
      {visibleSections.caseProof ? <DnaCaseProofSection /> : null}
    </main>
  );
}

function HeroSection() {
  const cursor = useHeroCursor();
  const viewport = useViewportSize();

  return (
    <section className="hero-section relative isolate min-h-[100svh] overflow-hidden bg-[#050712]">
      <ShaderBackground />
      <InteractiveGlassPanels cursor={cursor} viewport={viewport} />
      <div className="absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(4,7,18,0.18)_0%,rgba(4,7,18,0.02)_42%,rgba(4,7,18,0.78)_100%)]" />
      {visibleSections.heroDnaShader ? <DnaShader /> : null}
      <TopNav />
      <HeroContent />
    </section>
  );
}

function ShaderBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden hero-gradient">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(3,6,18,0)_0%,rgba(3,6,18,0.26)_48%,rgba(3,6,18,0.88)_100%)]" />
      <div className="hero-dot-pattern absolute inset-x-0 bottom-0 h-[500px]" aria-hidden="true" />
    </div>
  );
}

function InteractiveGlassPanels({
  cursor,
  viewport,
}: {
  cursor: CursorState;
  viewport: { width: number; height: number };
}) {
  const viewportWidth = viewport.width;
  const viewportHeight = viewport.height;
  const panelSize = Math.min(Math.max(viewportWidth * 0.12, 132), 200);
  const panelWidth = panelSize * 2.7;
  const panelHeight = panelSize * 4;
  const panelGap = 80;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden perspective-hero" aria-hidden="true">
      {panels.map((panel) => {
        const rotateX = cursor.ry * 30 * panel.depth;
        const rotateY = cursor.rx * -30 * panel.depth;
        const translateX = cursor.rx * 27 * panel.depth;
        const translateY = cursor.ry * 18 * panel.depth;
        const panelLeft =
          viewportWidth / 2 +
          panel.rowShiftX +
          panel.offset * (panelWidth + panelGap) -
          panelWidth / 2 +
          translateX;
        const panelTop =
          viewportHeight * 0.105 +
          200 +
          panel.rowShiftY -
          panelHeight +
          panel.yOffset +
          translateY;
        const lightX = ((cursor.x - panelLeft) / panelWidth) * 100;
        const lightY = ((cursor.y - panelTop) / panelHeight) * 100;
        const dx = Math.max(Math.abs(lightX - 50) - 50, 0) / 36;
        const dy = Math.max(Math.abs(lightY - 50) - 50, 0) / 36;
        const lightOpacity = cursor.active ? Math.max(0, 1 - Math.hypot(dx, dy)) : 0;

        return (
          <div
            key={panel.id}
            className="glass-panel hero-glass-square absolute"
            data-reveal="glass"
            style={{
              "--panel-offset": panel.offset,
              "--panel-y-offset": `${panel.yOffset}px`,
              "--panel-row-shift-x": `${panel.rowShiftX}px`,
              "--panel-row-shift-y": `${panel.rowShiftY}px`,
              "--glass-light-x": `${lightX}%`,
              "--glass-light-y": `${lightY}%`,
              "--glass-light-opacity": lightOpacity,
              "--reveal-index": panel.id % 10,
              transform: `translate3d(${translateX}px, ${translateY}px, 0) skewY(12deg) rotateX(${rotateX * 0.18}deg) rotateY(${-8 + rotateY * 0.12}deg)`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

function DnaShader() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ThreeModule, setThreeModule] = useState<typeof import("three") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("three").then((mod) => {
      if (!cancelled) setThreeModule(mod);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ThreeModule) return;
    const THREE = ThreeModule;
    const mount = mountRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const pointCount = 220;
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const rungPairs: Array<[THREE.Vector3, THREE.Vector3]> = [];
    const colorA = new THREE.Color("#ffffff");
    const colorB = new THREE.Color("#ffffff");
    const colorC = new THREE.Color("#ffffff");

    for (let i = 0; i < pointCount; i += 1) {
      const t = i / (pointCount - 1);
      const angle = t * Math.PI * 12;
      const y = (t - 0.5) * 9.4;
      const radius = 1.54 + Math.sin(t * Math.PI * 4) * 0.10;
      const strandA = [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
      const strandB = [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius];
      const strandColorA = colorA.clone().lerp(colorB, 0.28 + t * 0.5);
      const strandColorB = colorC.clone().lerp(colorB, 0.25 + (1 - t) * 0.35);

      positions.push(...strandA, ...strandB);
      colors.push(strandColorA.r, strandColorA.g, strandColorA.b, strandColorB.r, strandColorB.g, strandColorB.b);
      sizes.push(48 + Math.sin(i * 0.73) * 12, 38 + Math.cos(i * 0.61) * 10);

      if (i % 5 === 0) {
        rungPairs.push([
          new THREE.Vector3(strandA[0], strandA[1], strandA[2]),
          new THREE.Vector3(strandB[0], strandB[1], strandB[2]),
        ]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (10.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          float alpha = smoothstep(0.5, 0.08, d);
          gl_FragColor = vec4(vColor, alpha * 0.96);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.scale.setScalar(1.42);
    points.rotation.z = -0.14;
    points.rotation.x = 0.22;
    scene.add(points);

    const rungGroup = new THREE.Group();
    const rungGeometry = new THREE.CylinderGeometry(0.0235, 0.0235, 1, 8);
    const rungMaterial = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.74,
      blending: THREE.AdditiveBlending,
    });
    const direction = new THREE.Vector3();
    const midpoint = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);

    rungPairs.forEach(([start, end]) => {
      const length = start.distanceTo(end);
      midpoint.copy(start).add(end).multiplyScalar(0.5);
      direction.copy(end).sub(start).normalize();
      quaternion.setFromUnitVectors(yAxis, direction);

      const rung = new THREE.Mesh(rungGeometry, rungMaterial);
      rung.position.copy(midpoint);
      rung.quaternion.copy(quaternion);
      rung.scale.set(1, length, 1);
      rungGroup.add(rung);
    });

    rungGroup.scale.copy(points.scale);
    rungGroup.rotation.copy(points.rotation);
    scene.add(rungGroup);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const animate = () => {
      const time = performance.now() * 0.001;
      if (!reduceMotion.matches) {
        points.rotation.y = time * 0.18;
        rungGroup.rotation.y = points.rotation.y;
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      rungGeometry.dispose();
      rungMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [ThreeModule]);

  return (
    <div
      ref={mountRef}
      className="dna-shader pointer-events-none absolute top-0 z-[5] hidden h-screen opacity-95 mix-blend-screen md:block"
      aria-hidden="true"
    >
      {!ThreeModule && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
    </div>
  );
}

function TopNav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20 px-5 pt-4 sm:px-6 lg:px-7">
      <nav className="mx-auto flex max-w-[1480px] items-start justify-between gap-5 text-[13px] leading-none text-white/82">
        <a className="group flex items-center gap-[9px] self-start" href="#" aria-label="The Only Trusted home" data-reveal="fade-down">
          <LogoIcon className="h-12 w-12 shrink-0 text-white" />
          <span className="max-w-[90px] text-[14.4px] font-semibold leading-[0.92] tracking-[-0.04em] sm:text-[15.6px]">
            The Only Trusted
          </span>
        </a>

        <div className="hidden flex-1 justify-center gap-8 pt-3 text-[14px] md:flex lg:gap-9" data-reveal="fade-down" style={{ "--reveal-index": 1 } as React.CSSProperties}>
          {navItems.map((item) => (
            <a
              key={item}
              className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-300 hover:text-white"
              href="#"
            >
              {item}
              {["Services", "Expertise", "Insights", "About"].includes(item) ? (
                <ChevronDown size={13} strokeWidth={1.7} />
              ) : null}
            </a>
          ))}
        </div>

        <a
          className="hidden border border-white/24 bg-white/10 px-6 py-4 text-[13px] font-medium text-white shadow-[0_12px_34px_rgba(0,255,170,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/16 sm:inline-flex"
          href="#"
          data-reveal="fade-down"
          style={{ "--reveal-index": 2 } as React.CSSProperties}
        >
          View case study
        </a>

        <button
          className="inline-flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-white backdrop-blur-md md:hidden"
          type="button"
          aria-label="Open navigation"
          data-reveal="fade-down"
          style={{ "--reveal-index": 1 } as React.CSSProperties}
        >
          <Menu size={19} />
        </button>
      </nav>
    </header>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M8 5h7l9 5v17h-7l-9-5V5Zm5 5v10l6 3V13l-6-3Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeroContent() {
  const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index), []);

  return (
    <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col px-5 pb-7 pt-24 sm:px-6 sm:pb-8 lg:px-7" id="main-content">
      <div className="flex-1" />

      <div className="grid items-end gap-9 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex flex-col justify-end sm:-translate-x-4">
          <p className="mb-5 max-w-[390px] text-[13px] font-medium uppercase tracking-[0.18em] text-white/48 sm:hidden" data-reveal="fade-up">
            Brand DNA / stakeholder alignment / engineering velocity
          </p>

          <h1 className="max-w-[1120px] text-[clamp(2.2rem,5.72vw,5.36rem)] font-normal leading-[0.94] tracking-[-0.065em] text-white sm:text-[clamp(2.92rem,4.84vw,5.36rem)] lg:max-w-[1120px]" data-reveal="title">
            Rebuild trust with
            <br />
            velocity and clarity
          </h1>
        </div>
      </div>

      <div className="mt-10 grid gap-5 text-[13px] leading-[1.25] text-white/70 sm:mt-12 sm:grid-cols-[minmax(0,450px)_42px_minmax(0,310px)_minmax(0,1fr)] sm:items-end lg:mt-14">
        <p className="sm:-translate-x-4" data-reveal="fade-up" style={{ "--reveal-index": 1 } as React.CSSProperties}>
          A business-first rebuild for a large tech website, aligning Brand DNA,
          stakeholders and engineering teams before a single interface decision.
        </p>

        <a
          className="hidden h-9 w-9 -translate-x-4 items-center justify-center text-white transition duration-300 hover:-translate-x-3 sm:inline-flex"
          href="#"
          aria-label="Move to case study details"
          data-reveal="scale"
          style={{ "--reveal-index": 2 } as React.CSSProperties}
        >
          <ArrowRight size={22} strokeWidth={1.5} />
        </a>

        <p className="sm:-translate-x-4" data-reveal="fade-up" style={{ "--reveal-index": 3 } as React.CSSProperties}>Built for CTOs, engineering leads and decision-makers who need alignment before acceleration.</p>

        <div className="hidden w-full max-w-[260px] translate-x-4 justify-self-end text-right text-[13px] leading-tight text-white/62 sm:block" data-reveal="fade-left" style={{ "--reveal-index": 4 } as React.CSSProperties}>
          <div className="mb-1 flex items-center justify-end gap-2">
            <span className="font-medium text-white">4.8 / 5</span>
            <span className="flex gap-0.5 text-[#ff4fd8]" aria-label="5 star rating">
              {stars.map((star) => (
                <Star key={star} size={13} fill="currentColor" strokeWidth={1.7} />
              ))}
            </span>
          </div>
          <p>trusted by engineering-led teams</p>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-white/16 pt-4 sm:hidden" data-reveal="fade-up" style={{ "--reveal-index": 4 } as React.CSSProperties}>
          <a
            className="border border-white/24 bg-white/10 px-5 py-3 text-[13px] font-medium text-white backdrop-blur-xl"
            href="#"
          >
            View case study
          </a>
          <div className="text-right text-[12px] leading-tight text-white/62">
            <div className="mb-1 flex items-center justify-end gap-1.5">
              <span className="font-medium text-white">4.8 / 5</span>
              <span className="flex gap-0.5 text-[#ff4fd8]">
                {stars.map((star) => (
                  <Star key={star} size={11} fill="currentColor" strokeWidth={1.7} />
                ))}
              </span>
            </div>
            <p>trusted by engineering-led teams</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const processSteps = [
  {
    label: "Define Brand DNA",
    detail: "Extract the product promise, category language, buyer anxieties and proof hierarchy before UI starts.",
    file: "brand-dna.ts",
    code: [
      "import { StakeholderMap } from '@trusted/process';",
      "import { defineBrandDNA } from '@trusted/strategy';",
      "",
      "type Buyer = 'CTO' | 'VP Engineering' | 'Product Lead';",
      "",
      "export const brandDNA = defineBrandDNA({",
      "  audience: ['CTO', 'engineering leads'] satisfies Buyer[],",
      "  promise: 'clarity before velocity',",
      "  category: 'business-first technical rebuild',",
      "  tensions: [",
      "    'migration risk',",
      "    'team focus',",
      "    'delivery confidence',",
      "  ],",
      "  proof: StakeholderMap.fromSessions({",
      "    source: 'leadership interviews',",
      "    confidence: 0.92,",
      "  }),",
      "  language: {",
      "    avoid: ['cosmetic redesign', 'generic refresh'],",
      "    emphasize: ['decision clarity', 'engineering alignment'],",
      "  },",
      "});",
      "",
      "export const brandDecision = brandDNA.toDecisionFrame();",
    ],
    previewTitle: "Strategic spine",
    previewSubtitle: "Shared language for product, leadership and engineering.",
    outputs: ["Positioning logic", "Buyer anxieties", "Proof hierarchy"],
  },
  {
    label: "Align stakeholder path",
    detail: "Turn interviews into a decision path that shows what technical buyers need to see, believe and approve.",
    file: "decision-path.tsx",
    code: [
      "import { createDecisionPath } from '@trusted/strategy';",
      "",
      "const path = createDecisionPath({",
      "  buyer: 'engineering-led committee',",
      "  entry: 'problem clarity',",
      "  validation: [",
      "    'technical proof',",
      "    'implementation scope',",
      "    'delivery sequencing',",
      "  ],",
      "  approval: 'risk removed before redesign begins',",
      "  checkpoints: {",
      "    cto: 'architecture confidence',",
      "    product: 'message-market fit',",
      "    finance: 'delivery risk reduced',",
      "  },",
      "});",
      "",
      "const stakeholderRoute = path.map((stage) => ({",
      "  ...stage,",
      "  evidence: stage.questions.flatMap(findProof),",
      "  owner: assignDecisionOwner(stage),",
      "}));",
      "",
      "export const approvalMap = stakeholderRoute.toApprovalMap();",
    ],
    previewTitle: "Decision route",
    previewSubtitle: "A clear path from stakeholder doubt to shared commitment.",
    outputs: ["CTO evaluation path", "Internal objections", "Messaging order"],
  },
  {
    label: "Translate into execution",
    detail: "Convert alignment into page architecture, content states and implementation-ready component direction.",
    file: "handoff-system.ts",
    code: [
      "import { buildExecutionSystem } from '@trusted/handoff';",
      "",
      "export function buildExecutionSystem(input) {",
      "  return {",
      "    pages: input.decisionPath.toArchitecture(),",
      "    components: input.proof.toReusableBlocks(),",
      "    content: input.brandDNA.toMessagingSystem(),",
      "    risks: input.stakeholders.toDecisionRisks(),",
      "    milestones: [",
      "      'strategy lock',",
      "      'page architecture',",
      "      'component direction',",
      "      'engineering handoff',",
      "    ],",
      "    handoff: 'ready for engineering alignment',",
      "  };",
      "}",
      "",
      "export const system = buildExecutionSystem(alignmentInput);",
    ],
    previewTitle: "Execution-ready system",
    previewSubtitle: "Strategy becomes page logic, components and delivery focus.",
    outputs: ["Page architecture", "Component direction", "Engineering handoff"],
  },
];

const dnaCaseSlides = [
  {
    eyebrow: "Signal decode / 01",
    headline: "Decode the signals before the rebuild begins",
    description:
      "We turn stakeholder interviews, buyer anxieties and product proof into a clear Brand DNA system, so technical teams stop guessing what the website needs to prove.",
  },
  {
    eyebrow: "Decision path / 02",
    headline: "Align every decision around what buyers must believe",
    description:
      "CTO criteria, leadership concerns and engineering constraints are mapped into one decision path, giving the team a shared logic for content, structure and priority.",
  },
];

const dnaCaseSlideOneFrames = Array.from({ length: 9 }, (_, index) => `/assets/images/dna-case-frame-${index + 1}.png`);
const dnaCaseSlideTwoFrames = Array.from(
  { length: 6 },
  (_, index) => `/assets/images/dna-case-slide-2-frame-${index + 1}.png`,
);
const dnaCaseFrameSequences = [
  dnaCaseSlideOneFrames,
  dnaCaseSlideTwoFrames,
];
const dnaCasePoster = dnaCaseSlideOneFrames[0];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useDnaCaseProgress(sectionRef: React.RefObject<HTMLElement | null>, reducedMotion: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || reducedMotion) {
      setProgress(0);
      return undefined;
    }

    let frame = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      setProgress(clamp(-rect.top / scrollable));
      frame = 0;
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [sectionRef, reducedMotion]);

  return progress;
}

function useDnaCaseFramePreload(frameSequences: string[][]) {
  useEffect(() => {
    const frames = frameSequences.flat();

    frames.forEach((frameSrc) => {
      const image = new Image();
      image.src = frameSrc;
    });
  }, [frameSequences]);
}

function BrandDnaSection() {
  const [activeStep, setActiveStep] = useState(0);
  const activeProcess = processSteps[activeStep];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveStep((currentStep) => (currentStep + 1) % processSteps.length);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [activeStep]);

  return (
    <section className="align-process-section relative z-10 overflow-hidden bg-[#f7f7f4] text-[#2c2d2f]" data-section-reveal>
      <div className="pointer-events-none absolute inset-y-0 left-[max(1.25rem,calc((100vw-1480px)/2+1.75rem))] w-px bg-black/[0.06]" />
      <div className="pointer-events-none absolute inset-y-0 right-[max(1.25rem,calc((100vw-1480px)/2+1.75rem))] w-px bg-black/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.06]" />
      <div className="process-dot-field pointer-events-none absolute" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1480px] px-5 pb-24 pt-[120px] sm:px-6 sm:pb-32 lg:px-7 lg:pb-40">
        <div className="mx-auto mb-12 max-w-[980px] text-center">
          <div className="t-chip-reveal t-hover-lift mb-6 inline-flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[14px] font-medium text-[#3c3d40] shadow-[0_10px_28px_rgba(30,30,30,0.08)]" data-reveal="scale">
            <Timer size={16} weight="fill" className="text-black/32" />
            <span className="t-shimmer-text">Rapid Alignment</span>
          </div>
          <h2 className="t-title-reveal mx-auto max-w-[960px] text-[clamp(2.35rem,4.35vw,4.8rem)] font-normal leading-[1.04] tracking-[-0.065em] text-[#2d2e31]" data-reveal="title" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            Make technical decisions faster before building screens
          </h2>
          <p className="t-subtitle-reveal mx-auto mt-7 max-w-[760px] text-[17px] leading-[1.6] text-black/28 sm:text-[20px]" data-reveal="fade-up" style={{ "--reveal-index": 2 } as React.CSSProperties}>
            <span>Rapidly turn </span>
            <span className="font-medium text-[#252628]">Brand DNA</span>
            <span>, stakeholder sessions and </span>
            <span className="font-medium text-[#252628]">engineering alignment</span>
            <span> into a clear build path.</span>
          </p>
        </div>

        <ProcessTabs activeStep={activeStep} onSelect={setActiveStep} />
        <ProcessEditor activeStep={activeStep} activeProcess={activeProcess} />
        <ProcessOutputs activeProcess={activeProcess} />
      </div>
    </section>
  );
}

function ProcessTabs({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="t-tabs-reveal relative mx-auto mb-10 max-w-[880px] sm:mb-12" data-reveal="fade-up" style={{ "--reveal-index": 3 } as React.CSSProperties}>
      <div className="process-connector" aria-hidden="true" />
      <div className="process-tabs-track grid gap-3 md:grid-cols-3 md:gap-8" style={{ "--active-index": activeStep } as React.CSSProperties}>
        <span className="tab-chevron tab-chevron-left" aria-hidden="true">
          <CaretRight size={13} weight="regular" />
        </span>
        <span className="tab-chevron tab-chevron-right" aria-hidden="true">
          <CaretRight size={13} weight="regular" />
        </span>
        {processSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <button
              key={step.label}
              className={isActive ? "process-tab process-tab-active" : "process-tab"}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={isActive}
            >
              <StepStateIcon active={isActive} complete={isComplete} />
              <span className="relative z-10 truncate">{step.label}</span>
              {isActive ? <TabProgressBorder key={activeStep} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabProgressBorder() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [box, setBox] = useState({ width: 220, height: 46 });

  useEffect(() => {
    const svg = svgRef.current;
    const tab = svg?.parentElement;

    if (!tab) {
      return undefined;
    }

    const update = () => {
      const rect = tab.getBoundingClientRect();
      setBox({
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(tab);

    return () => observer.disconnect();
  }, []);

  const inset = 1;
  const width = box.width;
  const height = box.height;
  const radius = Math.max(height / 2 - inset, 0);
  const right = width - inset;
  const bottom = height - inset;
  const left = inset;
  const top = inset;
  const path = [
    `M ${width / 2} ${top}`,
    `H ${right - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${height / 2}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H ${left + radius}`,
    `A ${radius} ${radius} 0 0 1 ${left} ${height / 2}`,
    `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
    `H ${width / 2}`,
  ].join(" ");

  return (
    <svg ref={svgRef} className="process-tab-progress-ring" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" pathLength={100} />
    </svg>
  );
}

function StepStateIcon({ active, complete }: { active: boolean; complete: boolean }) {
  return (
    <span className="t-step-icon relative z-10" data-state={active ? "active" : complete ? "complete" : "idle"}>
      <Circle size={17} weight="regular" className="t-step-icon-idle text-black/24" />
      <SpinnerGap size={17} weight="regular" className="t-step-icon-active text-[#ff4fd8]" />
      <CheckCircle size={18} weight="fill" className="t-step-icon-complete text-[#25ffad]" />
    </span>
  );
}

function getCodeLineClass(line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("import") || trimmed.startsWith("export") || trimmed.startsWith("type")) {
    return "code-token-keyword";
  }

  if (trimmed.startsWith("const") || trimmed.startsWith("return")) {
    return "code-token-declaration";
  }

  if (line.includes("'") || line.includes('"')) {
    return "code-token-string";
  }

  if (line.includes(":") || line.includes("=>")) {
    return "code-token-property";
  }

  return "code-token-base";
}

function ProcessEditor({
  activeStep,
  activeProcess,
}: {
  activeStep: number;
  activeProcess: (typeof processSteps)[number];
}) {
  return (
    <div className="t-panel-shell relative mx-auto max-w-[1220px]" data-reveal="panel" style={{ "--reveal-index": 5 } as React.CSSProperties}>
      <div className="process-editor-stem" aria-hidden="true" />
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#eeeeec] shadow-[0_36px_90px_rgba(30,33,36,0.12)]">
        <div className="border-b border-black/10 bg-[#eeeeec] px-2.5 sm:px-3">
          <div className="grid items-center text-[14px] text-black/34 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
            <div className="flex items-center gap-2 px-3 py-5 sm:px-4">
              <BracketsCurly size={16} weight="fill" className="text-[#ff4fd8]" />
              <span className="font-mono">{activeProcess.file}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-black/35" />
            </div>
            <div className="hidden items-center gap-2 border-l border-black/10 px-3 py-5 sm:flex sm:px-4">
              <Circle size={13} weight="regular" className="text-black/24" />
              <span className="font-mono">preview</span>
            </div>
          </div>
        </div>

        <div className="bg-[#eeeeec] p-2.5 sm:p-3">
          <div className="process-editor-inner grid overflow-hidden rounded-[22px] bg-white shadow-[0_22px_70px_rgba(31,35,40,0.11)] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
            <div key={`code-${activeStep}`} className="t-panel-slide min-h-[720px] border-b border-black/10 p-6 font-mono text-[13px] leading-[1.78] text-black/48 sm:p-8 sm:text-[14px] lg:border-b-0 lg:border-r" data-reveal="fade-right">
              {activeProcess.code.map((line, index) => (
                <div key={`${activeStep}-${line}-${index}`} className="t-code-line grid grid-cols-[32px_minmax(0,1fr)] gap-5" style={{ "--line-index": index } as React.CSSProperties}>
                  <span className="code-line-number select-none text-right">{index + 1}</span>
                  <span className={getCodeLineClass(line)}>
                    {line || "\u00a0"}
                  </span>
                </div>
              ))}
            </div>

            <div className="process-preview-pane flex min-h-[720px] items-center justify-center p-6">
              <div key={`preview-${activeStep}`} className="t-panel-scale w-full max-w-[360px]" data-reveal="fade-left" style={{ "--reveal-index": 7 } as React.CSSProperties}>
                <div className="mb-7 flex items-center gap-3">
                  <div className="process-preview-orb t-orb-pulse flex h-12 w-12 items-center justify-center rounded-full text-white">
                    <FlowArrow size={24} weight="fill" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-black/32">Decision system</p>
                    <h3 className="t-text-swap text-[23px] font-semibold tracking-[-0.04em] text-[#222326]">{activeProcess.previewTitle}</h3>
                  </div>
                </div>
                <p className="t-text-swap max-w-[320px] text-[15px] leading-[1.5] text-black/52">{activeProcess.previewSubtitle}</p>
                <div className="mt-8 space-y-3">
                  {["CTO criteria", "Engineering proof", "Leadership confidence"].map((item, index) => (
                    <div key={item} className="t-list-item flex items-center gap-3 rounded-[14px] bg-[#f7f7f4] px-4 py-3 text-[14px] font-medium text-black/62 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" style={{ "--line-index": index } as React.CSSProperties}>
                      <span className="process-list-icon">
                        <CheckCircle size={24} weight="bold" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-[16px] bg-[#24272a] p-4 text-white shadow-[0_18px_46px_rgba(20,22,24,0.16)]">
                  <div className="mb-3 flex items-center justify-between text-[12px] text-white/46">
                    <span>active output</span>
                    <span>0{activeStep + 1}/03</span>
                  </div>
                  <div className="space-y-2">
                    {activeProcess.outputs.map((output, index) => (
                      <div key={output} className="t-list-item flex items-center gap-2 text-[13px] text-white/74" style={{ "--line-index": index } as React.CSSProperties}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#25ffad]" />
                        {output}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessOutputs({ activeProcess }: { activeProcess: (typeof processSteps)[number] }) {
  const outputCards = [
    {
      icon: Gauge,
      title: "Faster decision-making",
      text: "Reduce redesign loops by making business priorities explicit before interface work starts.",
    },
    {
      icon: CheckCircle,
      title: "Aligned stakeholder logic",
      text: activeProcess.detail,
    },
    {
      icon: GitBranch,
      title: "Cleaner handoff",
      text: "Translate strategy into page architecture, content rules and component-ready direction.",
    },
  ];

  return (
    <div className="relative mx-auto mt-12 max-w-[1050px]" data-reveal="fade-up" style={{ "--reveal-index": 8 } as React.CSSProperties}>
      <div className="output-connector" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {outputCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="t-hover-lift group text-center" data-reveal="fade-up" style={{ "--reveal-index": index } as React.CSSProperties}>
              <div className="process-output-icon mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full text-white transition duration-300 group-hover:-translate-y-1">
                <Icon size={20} weight="fill" />
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#2c2d2f]">{card.title}</h3>
              <p className="mx-auto mt-2 max-w-[290px] text-[15px] leading-[1.45] text-black/46">{card.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const aerospaceSpecs = [
  ["Layer", "03"],
  ["Inputs", "18"],
  ["People", "07"],
  ["Proof", "92%"],
  ["Status", "READY"],
];

const clientConfessions = [
  {
    quote:
      "We came in asking for a redesign. The team politely ignored that and uncovered the real problem: nobody agreed what the site had to prove.",
    name: "Mira Chen",
    role: "VP Product / HelioGrid",
    tone: "light",
  },
  {
    quote:
      "The uncomfortable part was how quickly the workshop exposed our internal contradictions. The useful part was everything that happened after.",
    name: "Anton Vale",
    role: "Founder / Vector Assembly",
    tone: "dark",
  },
  {
    quote:
      "Engineering finally had language they could stand behind. Leadership finally had a story they could sell. That almost never happens in the same room.",
    name: "Leah Brooks",
    role: "CTO / Northstar Systems",
    tone: "light",
  },
  {
    quote:
      "It felt less like buying pages and more like getting our decision-making cleaned up in public. Annoyingly effective.",
    name: "Rafael Ortiz",
    role: "Chief Strategy Officer / Kinetic Labs",
    tone: "dark",
  },
  {
    quote:
      "Their sharpest move was making our proof impossible to misunderstand. Buyers stopped asking what we do and started asking how fast we could start.",
    name: "Nadia Stone",
    role: "Growth Lead / Orbit Foundry",
    tone: "light",
  },
  {
    quote:
      "The process had just enough friction to be honest. We left with fewer opinions, better decisions and a site narrative our sales team actually uses.",
    name: "Cole Mercer",
    role: "Director of Engineering / Relay Works",
    tone: "dark",
  },
];

const dnaReferenceSrc = new URL("../assets/DNA 3d block.png", import.meta.url).href;
const dnaFallbackSrc = "/assets/images/dna-case-frame-1.png";

function AerospaceDnaSection() {
  const hudTicks = useMemo(() => Array.from({ length: 96 }, (_, index) => index), []);
  const useFallbackDnaImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src.endsWith(dnaFallbackSrc)) {
      return;
    }

    event.currentTarget.src = dnaFallbackSrc;
  };

  return (
    <section className="aerospace-dna-section relative isolate min-h-[100svh] overflow-hidden text-[#25272a]" data-section-reveal>
      <div className="aerospace-field-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="aerospace-bg-title pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none" aria-hidden="true">
        BRAND DNA
      </div>

      <div className="aerospace-hud-wrap pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="aerospace-hud-ring">
          {hudTicks.map((tick) => (
            <span
              key={tick}
              className={tick % 8 === 0 ? "aerospace-hud-tick aerospace-hud-tick-major" : "aerospace-hud-tick"}
              style={{ "--tick-angle": `${tick * 3.75}deg` } as React.CSSProperties}
            />
          ))}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            <circle className="aerospace-hud-circle" cx="50" cy="50" r="42" />
            <circle className="aerospace-hud-circle aerospace-hud-circle-inner" cx="50" cy="50" r="31" />
            <path className="aerospace-hud-arc" d="M 16 50 A 34 34 0 0 1 84 50" />
            <path className="aerospace-hud-arc aerospace-hud-arc-lower" d="M 84 50 A 34 34 0 0 1 16 50" />
          </svg>
          <span className="aerospace-hud-label aerospace-hud-label-top">SIGNAL 0.92</span>
          <span className="aerospace-hud-label aerospace-hud-label-bottom">PROOF MAP</span>
        </div>
      </div>

      <div className="aerospace-dna-object pointer-events-none absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="aerospace-dna-float">
          <div className="aerospace-dna-image-stack">
            <img
              className="aerospace-dna-image aerospace-dna-image-depth"
              src={dnaReferenceSrc}
              alt=""
              width={1024}
              height={1536}
              loading="lazy"
              decoding="async"
              onError={useFallbackDnaImage}
            />
            <img
              className="aerospace-dna-image aerospace-dna-image-main"
              src={dnaReferenceSrc}
              alt=""
              width={1024}
              height={1536}
              loading="lazy"
              decoding="async"
              onError={useFallbackDnaImage}
            />
            <span className="aerospace-dna-glass-sheen" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1480px] grid-rows-[auto_1fr_auto] px-5 py-8 sm:px-6 sm:py-10 lg:px-7 lg:py-12">
        <div className="flex items-start justify-between gap-8">
          <div className="aerospace-module-label" data-reveal="fade-right">
            <p>Brand DNA Diagnostic</p>
            <span>Strategy locked</span>
          </div>

          <div className="aerospace-specs" data-reveal="fade-left" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            {aerospaceSpecs.map(([label, value]) => (
              <div key={label} className="aerospace-spec-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none" />

        <div className="aerospace-copy pb-2" data-reveal="fade-up" style={{ "--reveal-index": 2 } as React.CSSProperties}>
          <h2>
            Decode the story
            <br />
            before screens
          </h2>
          <a className="aerospace-link pointer-events-auto" href="#">
            <span>Learn more</span>
            <ArrowRight size={18} strokeWidth={1.6} />
          </a>
        </div>
      </div>
    </section>
  );
}

function ClientConfessionsSection() {
  const baseConfessionCount = clientConfessions.length;
  const [trackOffset, setTrackOffset] = useState(0);
  const [carouselTransition, setCarouselTransition] = useState(true);
  const [swipeTilt, setSwipeTilt] = useState(0);
  const dragStart = useRef<{ x: number; y: number; offset: number } | null>(null);
  const dragVelocity = useRef({ offset: 0, time: 0, velocity: 0 });
  const pendingDragFrame = useRef(0);
  const pendingDragState = useRef({ offset: 0, tilt: 0 });
  const inertiaFrame = useRef(0);
  const confessionRows = useMemo(() => {
    const deck = Array.from({ length: clientConfessions.length * 5 }, (_, index) => ({
      ...clientConfessions[index % clientConfessions.length],
      id: `${clientConfessions[index % clientConfessions.length].name}-${index}`,
      displayTone: index % 2 === 0 ? "dark" : "light",
    }));

    return [
      deck.map((item, index) => ({ ...item, displayTone: index % 2 === 0 ? "dark" : "light" })),
      deck.map((item, index) => ({ ...item, displayTone: index % 2 === 0 ? "light" : "dark" })),
    ];
  }, []);

  useEffect(() => {
    const getCardStep = () => {
      const viewportWidth = window.innerWidth;
      const cardWidth =
        viewportWidth <= 700
          ? Math.min(viewportWidth * 0.82, 330)
          : viewportWidth <= 1024
            ? Math.min(Math.max(viewportWidth * 0.42, 300), 390)
            : Math.min(Math.max(viewportWidth * 0.27, 310), 440);

      return cardWidth + 48;
    };

    const updateInitialOffset = () => {
      setCarouselTransition(false);
      setTrackOffset(baseConfessionCount * 3 * getCardStep());
    };

    updateInitialOffset();
    window.addEventListener("resize", updateInitialOffset);

    return () => window.removeEventListener("resize", updateInitialOffset);
  }, [baseConfessionCount]);

  useEffect(() => {
    return () => {
      if (inertiaFrame.current) {
        window.cancelAnimationFrame(inertiaFrame.current);
      }
      if (pendingDragFrame.current) {
        window.cancelAnimationFrame(pendingDragFrame.current);
      }
    };
  }, []);

  const normalizeTrackOffset = (offset: number) => {
    const repeatedWidth = (() => {
      if (typeof window === "undefined") {
        return baseConfessionCount * 488;
      }

      const viewportWidth = window.innerWidth;
      const cardWidth =
        viewportWidth <= 700
          ? Math.min(viewportWidth * 0.82, 330)
          : viewportWidth <= 1024
            ? Math.min(Math.max(viewportWidth * 0.42, 300), 390)
            : Math.min(Math.max(viewportWidth * 0.27, 310), 440);

      return baseConfessionCount * (cardWidth + 48);
    })();

    const normalized = ((offset % repeatedWidth) + repeatedWidth) % repeatedWidth;
    return repeatedWidth * 3 + normalized;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (inertiaFrame.current) {
      window.cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = 0;
    }

    setCarouselTransition(false);
    setSwipeTilt(0);
    dragStart.current = { x: event.clientX, y: event.clientY, offset: trackOffset };
    dragVelocity.current = { offset: trackOffset, time: event.timeStamp, velocity: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const scheduleDragUpdate = (offset: number, tilt: number) => {
    pendingDragState.current = { offset, tilt };

    if (pendingDragFrame.current) {
      return;
    }

    pendingDragFrame.current = window.requestAnimationFrame(() => {
      pendingDragFrame.current = 0;
      setSwipeTilt(pendingDragState.current.tilt);
      setTrackOffset(pendingDragState.current.offset);
    });
  };

  const handlePointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;

    if (!start) {
      return;
    }

    const nextOffset = start.offset - (event.clientX - start.x);
    const elapsed = Math.max(event.timeStamp - dragVelocity.current.time, 16);
    const instantVelocity = (nextOffset - dragVelocity.current.offset) / elapsed;

    dragVelocity.current = {
      offset: nextOffset,
      time: event.timeStamp,
      velocity: instantVelocity * 0.72 + dragVelocity.current.velocity * 0.28,
    };

    scheduleDragUpdate(nextOffset, Math.max(Math.min(-dragVelocity.current.velocity * 10, 9), -9));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;

    if (!start) {
      return;
    }

    if (pendingDragFrame.current) {
      window.cancelAnimationFrame(pendingDragFrame.current);
      pendingDragFrame.current = 0;
      setSwipeTilt(pendingDragState.current.tilt);
      setTrackOffset(pendingDragState.current.offset);
    }

    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaY) < 24) {
      const initialVelocity = Math.max(Math.min(dragVelocity.current.velocity, 1.28), -1.28);
      let velocity = initialVelocity;
      let lastTime = performance.now();

      const glide = (time: number) => {
        const deltaTime = Math.min(time - lastTime, 32);
        lastTime = time;

        setTrackOffset((current) => current + velocity * deltaTime);
        setSwipeTilt(Math.max(Math.min(-velocity * 10, 9), -9));

        velocity *= Math.exp(-deltaTime / 360);

        if (Math.abs(velocity) > 0.018) {
          inertiaFrame.current = window.requestAnimationFrame(glide);
          return;
        }

        inertiaFrame.current = 0;
        setSwipeTilt(0);
        setTrackOffset((current) => normalizeTrackOffset(current));
      };

      if (Math.abs(velocity) > 0.018) {
        inertiaFrame.current = window.requestAnimationFrame(glide);
      } else {
        setSwipeTilt(0);
        setTrackOffset((current) => normalizeTrackOffset(current));
      }
    }
  };

  const handleCardMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--card-light-x", `${x}%`);
    event.currentTarget.style.setProperty("--card-light-y", `${y}%`);
  };

  return (
    <section className="client-confessions-section relative isolate overflow-visible bg-[#050712] text-white" data-section-reveal>
      <div className="client-confessions-transition pointer-events-none absolute inset-x-0 top-0 z-0" aria-hidden="true" />
      <div className="client-confessions-aurora pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      <div className="client-confessions-grid pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 pt-[120px] sm:px-6 sm:pb-32 lg:px-7 lg:pb-40">
        <div className="client-confessions-heading-wrap mx-auto mb-12 max-w-[980px] text-center">
          <div className="t-chip-reveal t-hover-lift mb-6 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/8 px-3 py-2 text-[14px] font-medium text-white/82 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl" data-reveal="scale">
            <UsersThree size={16} weight="fill" className="text-[#25ffad]" />
            <span>Client confessions</span>
          </div>
          <h2 className="client-confessions-title t-title-reveal mx-auto max-w-[960px] text-[clamp(2.35rem,4.35vw,4.8rem)] font-normal leading-[1.04] tracking-[-0.065em] text-white" data-reveal="title" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            What clients admit
            <br />
            after the alignment
          </h2>
          <p className="client-confessions-subtitle t-subtitle-reveal mx-auto mt-7 max-w-[760px] text-[17px] leading-[1.6] text-white/28 sm:text-[20px]" data-reveal="fade-up" style={{ "--reveal-index": 2 } as React.CSSProperties}>
            <span>Rapidly turn </span>
            <strong>Brand DNA</strong>
            <span>, </span>
            <strong>stakeholder sessions</strong>
            <span> and </span>
            <strong>engineering alignment</strong>
            <span> into an </span>
            <strong>interactive year build path</strong>
            <span>. Subtitles by DimaTorzok.</span>
          </p>
        </div>

        <div
          className="client-confessions-carousel"
          data-reveal="scale"
          style={{ "--reveal-index": 3, "--swipe-tilt": `${swipeTilt}deg` } as React.CSSProperties}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerDrag}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStart.current = null;
          }}
        >
          <div className="client-confessions-stage" aria-live="polite">
            {confessionRows.map((row, rowIndex) => (
              <div
                key={`confession-row-${rowIndex}`}
                className={carouselTransition ? "client-confessions-row" : "client-confessions-row client-confessions-row-instant"}
                style={{
                  "--row-shift": `${-trackOffset}px`,
                } as React.CSSProperties}
              >
                {row.map((confession, index) => (
                  <article
                    key={confession.id}
                    className={[
                      "client-confession-card",
                      confession.displayTone === "light" ? "client-confession-card-light" : "client-confession-card-dark",
                    ].join(" ")}
                    onPointerMove={handleCardMove}
                  >
                    <span className="client-confession-quote-mark client-confession-quote-mark-top" aria-hidden="true">
                      "
                    </span>
                    <p className="client-confession-quote">{confession.quote}</p>
                    <div className="client-confession-author">
                      <strong>{confession.name}</strong>
                      <span>{confession.role}</span>
                    </div>
                    <span className="client-confession-quote-mark client-confession-quote-mark-bottom" aria-hidden="true">
                      "
                    </span>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DnaCaseProofSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const progress = useDnaCaseProgress(sectionRef, reducedMotion);
  const [modalOpen, setModalOpen] = useState(false);
  const slideCount = dnaCaseSlides.length;
  const activeIndex = reducedMotion ? 0 : Math.min(slideCount - 1, Math.floor(progress * slideCount));
  const activeSlide = dnaCaseSlides[activeIndex];
  const activeSequence = dnaCaseFrameSequences[activeIndex] ?? dnaCaseFrameSequences[dnaCaseFrameSequences.length - 1];
  const slideStart = activeIndex / slideCount;
  const slideEnd = (activeIndex + 1) / slideCount;
  const slideProgress = reducedMotion ? 0 : clamp((progress - slideStart) / Math.max(slideEnd - slideStart, 0.0001));
  const framePosition = activeSequence.length === 1 ? 0 : slideProgress * (activeSequence.length - 1);
  const baseFrameIndex = Math.floor(framePosition);
  const nextFrameIndex = Math.min(activeSequence.length - 1, baseFrameIndex + 1);
  const frameBlend = smoothstep(framePosition - baseFrameIndex);
  const currentFrameSrc = activeSequence[baseFrameIndex];
  const nextFrameSrc = activeSequence[nextFrameIndex];

  useDnaCaseFramePreload(dnaCaseFrameSequences);

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  if (reducedMotion) {
    return (
      <section className="dna-case-section dna-case-section-reduced relative bg-[#06111f] text-white" ref={sectionRef}>
        <div className="relative mx-auto grid min-h-screen max-w-[1480px] items-end overflow-hidden px-5 py-16 sm:px-6 lg:px-7">
          <img
            className="dna-case-reduced-image"
            src={dnaCasePoster}
            alt=""
            aria-hidden="true"
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
          />
          <div className="dna-case-vignette" aria-hidden="true" />
          <div className="relative z-10 max-w-[860px] space-y-8">
            {dnaCaseSlides.map((slide) => (
              <article key={slide.headline} className="max-w-[620px]">
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f3a33f]">{slide.eyebrow}</p>
                <h2 className="text-[clamp(2.35rem,4.35vw,4.8rem)] font-normal leading-[0.96] tracking-[-0.07em]">{slide.headline}</h2>
                <p className="mt-5 max-w-[480px] text-[16px] leading-[1.55] text-white/66">{slide.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="dna-case-section relative bg-[#06111f] text-white"
      ref={sectionRef}
      style={{ height: `${slideCount * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#06111f]" />
        <div
          className="dna-case-visual-stack absolute inset-0"
          style={{
            transform: `translate3d(0, 0, 0) scale(${1.01 + activeIndex * 0.008 + slideProgress * 0.016})`,
          }}
        >
          <img
            className="dna-case-visual-frame absolute inset-0 h-full w-full object-cover"
            src={currentFrameSrc}
            alt=""
            aria-hidden="true"
            width={1672}
            height={941}
            loading="eager"
            decoding="async"
            style={{ opacity: 1 - frameBlend }}
          />
          <img
            className="dna-case-visual-frame absolute inset-0 h-full w-full object-cover"
            src={nextFrameSrc}
            alt=""
            aria-hidden="true"
            width={1672}
            height={941}
            loading="eager"
            decoding="async"
            style={{ opacity: frameBlend }}
          />
        </div>
        <div className="dna-case-vignette" aria-hidden="true" />
        <div className="dna-case-amber" aria-hidden="true" />
        <div className="dna-case-grid" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1480px] flex-col px-5 pb-8 pt-[80px] sm:px-6 lg:px-7">
          <div className="flex items-start justify-between gap-6">
            <div className="hidden text-[12px] font-semibold uppercase tracking-[0.22em] text-white/36 sm:block">
              Case proof / Brand DNA
            </div>
            <button className="dna-watch-button group ml-auto" type="button" onClick={() => setModalOpen(true)}>
              <span className="dna-watch-button-orb">
                <Play size={15} fill="currentColor" strokeWidth={2} />
              </span>
              <span className="dna-watch-label">Watch case reel</span>
            </button>
          </div>

          <div className="flex-1" />

          <div className="mb-8 grid gap-8 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)] lg:items-end">
            <div key={activeSlide.headline} className="dna-case-copy max-w-[650px]">
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f4a747]">
                {activeSlide.eyebrow}
              </p>
              <h2 className="text-[clamp(2.35rem,4.35vw,4.8rem)] font-normal leading-[0.92] tracking-[-0.075em] text-white">
                {activeSlide.headline}
              </h2>
              <p className="mt-6 max-w-[500px] text-[16px] leading-[1.55] text-white/66 sm:text-[17px]">
                {activeSlide.description}
              </p>
            </div>

            <div className="dna-case-progress justify-self-end">
              {dnaCaseSlides.map((slide, index) => (
                <span key={slide.eyebrow} className={index === activeIndex ? "is-active" : ""}>
                  0{index + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen ? <CaseReelModal onClose={() => setModalOpen(false)} /> : null}
    </section>
  );
}

function CaseReelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="case-reel-modal fixed inset-0 z-50 flex items-center justify-center px-5 py-8" role="dialog" aria-modal="true" aria-labelledby="case-reel-title">
      <button className="absolute inset-0 cursor-default bg-[#020711]/78 backdrop-blur-xl" type="button" aria-label="Close case reel" onClick={onClose} />
      <div className="case-reel-panel relative z-10 w-full max-w-[920px] overflow-hidden border border-white/12 bg-[#07111e] shadow-[0_40px_120px_rgba(0,0,0,0.44)]">
        <button className="case-reel-close" type="button" aria-label="Close case reel" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="case-reel-placeholder">
          <div className="case-reel-play">
            <Play size={22} fill="currentColor" />
          </div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#f4a747]">Case reel</p>
          <h2 id="case-reel-title" className="mt-3 text-[clamp(2.5rem,5vw,5.2rem)] font-normal leading-[0.9] tracking-[-0.075em] text-white">
            Video placeholder
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-center text-[16px] leading-[1.55] text-white/58">
            This space is ready for the final case video. Drop in a video URL later without changing the section interaction.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
