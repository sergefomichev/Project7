import {
  ArrowRight,
  Boxes,
  Braces,
  ChevronDown,
  Code2,
  GitBranch,
  Menu,
  MessageSquareText,
  Star,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const navItems = [
  "Case studies",
  "Services",
  "Expertise",
  "How we deliver",
  "Insights",
  "About",
];

type CursorState = {
  rx: number;
  ry: number;
};

type Panel = {
  id: number;
  className: string;
  depth: number;
  tilt: number;
};

const panels: Panel[] = [
  {
    id: 1,
    className: "left-[-10%] top-[-360px] h-[calc(46.5vh+440px)] w-[24vw] min-w-[220px]",
    depth: 0.62,
    tilt: -23,
  },
  {
    id: 2,
    className: "left-[8%] top-[calc(-45vh-360px)] h-[calc(55.5vh+440px)] w-[22vw] min-w-[230px]",
    depth: 0.8,
    tilt: -24,
  },
  {
    id: 3,
    className: "left-[26%] top-[calc(-36vh-360px)] h-[calc(58.5vh+440px)] w-[28vw] min-w-[300px]",
    depth: 0.52,
    tilt: -24,
  },
  {
    id: 4,
    className: "left-[45%] top-[calc(-27vh-360px)] h-[calc(57vh+440px)] w-[23vw] min-w-[260px]",
    depth: 0.72,
    tilt: -24,
  },
  {
    id: 5,
    className: "right-[5%] top-[calc(-42vh-360px)] h-[calc(60vh+440px)] w-[21vw] min-w-[240px]",
    depth: 0.58,
    tilt: -24,
  },
  {
    id: 6,
    className: "right-[-12%] top-[calc(6vh-560px)] h-[calc(46.5vh+440px)] w-[28vw] min-w-[310px]",
    depth: 0.42,
    tilt: -24,
  },
  {
    id: 7,
    className: "left-[35%] top-[calc(18vh-560px)] h-[calc(48vh+440px)] w-[22vw] min-w-[240px]",
    depth: 0.36,
    tilt: -24,
  },
  {
    id: 8,
    className: "right-[20%] top-[calc(24vh-560px)] h-[calc(45vh+440px)] w-[19vw] min-w-[220px]",
    depth: 0.34,
    tilt: -24,
  },
  {
    id: 9,
    className: "left-[-18%] top-[calc(24vh-560px)] h-[calc(45vh+440px)] w-[23vw] min-w-[260px]",
    depth: 0.3,
    tilt: -24,
  },
];

function useHeroCursor() {
  const [cursor, setCursor] = useState<CursorState>({ rx: 0, ry: 0 });
  const target = useRef<CursorState>({ rx: 0, ry: 0 });
  const current = useRef<CursorState>({ rx: 0, ry: 0 });

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reduceMotion.matches || coarsePointer.matches) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      target.current = {
        rx: (event.clientX / window.innerWidth - 0.5) * 2,
        ry: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const handlePointerLeave = () => {
      target.current = { rx: 0, ry: 0 };
    };

    let frame = 0;
    const tick = () => {
      current.current.rx += (target.current.rx - current.current.rx) * 0.07;
      current.current.ry += (target.current.ry - current.current.ry) * 0.07;
      setCursor({ ...current.current });
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return cursor;
}

function App() {
  return (
    <main className="min-h-screen bg-[#f4f4f1] text-[#252728]">
      <HeroSection />
      <BrandDnaSection />
    </main>
  );
}

function HeroSection() {
  const cursor = useHeroCursor();

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#eef3f5]">
      <ShaderBackground />
      <InteractiveGlassPanels cursor={cursor} />
      <div className="absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(244,247,248,0.18)_54%,rgba(239,244,245,0.82)_100%)]" />
      <DnaShader />
      <TopNav />
      <HeroContent />
    </section>
  );
}

function ShaderBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden hero-gradient">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_38%,rgba(245,248,249,0.72)_100%)]" />
    </div>
  );
}

function InteractiveGlassPanels({ cursor }: { cursor: CursorState }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden perspective-hero" aria-hidden="true">
      {panels.map((panel) => {
        const rotateX = cursor.ry * 20 * panel.depth;
        const rotateY = cursor.rx * -20 * panel.depth;
        const translateX = cursor.rx * 18 * panel.depth;
        const translateY = cursor.ry * 12 * panel.depth;

        return (
          <div
            key={panel.id}
            className={`glass-panel absolute ${panel.className}`}
            style={{
              transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${panel.tilt}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

function DnaShader() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

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
      const radius = 1.28 + Math.sin(t * Math.PI * 4) * 0.08;
      const strandA = [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
      const strandB = [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius];
      const strandColorA = colorA.clone().lerp(colorB, 0.28 + t * 0.5);
      const strandColorB = colorC.clone().lerp(colorB, 0.25 + (1 - t) * 0.35);

      positions.push(...strandA, ...strandB);
      colors.push(strandColorA.r, strandColorA.g, strandColorA.b, strandColorB.r, strandColorB.g, strandColorB.b);
      sizes.push(40 + Math.sin(i * 0.73) * 10, 32 + Math.cos(i * 0.61) * 8);

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
          gl_PointSize = aSize * (8.0 / -mvPosition.z);
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
    points.scale.setScalar(1.18);
    points.rotation.z = -0.14;
    points.rotation.x = 0.22;
    scene.add(points);

    const rungGroup = new THREE.Group();
    const rungGeometry = new THREE.CylinderGeometry(0.0196, 0.0196, 1, 8);
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
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute right-[max(1.75rem,calc((100vw-1480px)/2+1.75rem))] top-0 z-[5] hidden h-screen w-[42vw] max-w-[620px] opacity-95 mix-blend-screen md:block"
      aria-hidden="true"
    />
  );
}

function TopNav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20 px-5 pt-4 sm:px-6 lg:px-7">
      <nav className="mx-auto flex max-w-[1480px] items-start justify-between gap-5 text-[13px] leading-none text-[#161819]">
        <a className="group flex items-center gap-[9px] self-start" href="#" aria-label="The Only Trusted home">
          <LogoIcon className="h-12 w-12 shrink-0" />
          <span className="max-w-[90px] text-[14.4px] font-semibold leading-[0.92] tracking-[-0.04em] sm:text-[15.6px]">
            The Only Trusted
          </span>
        </a>

        <div className="hidden flex-1 justify-center gap-8 pt-3 md:flex lg:gap-9">
          {navItems.map((item) => (
            <a
              key={item}
              className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-300 hover:text-black/55"
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
          className="hidden border border-black/55 bg-[#282b2c] px-6 py-4 text-[13px] font-medium text-white shadow-[0_12px_28px_rgba(32,38,42,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#161819] sm:inline-flex"
          href="#"
        >
          View case study
        </a>

        <button
          className="inline-flex h-11 w-11 items-center justify-center border border-black/20 bg-white/30 text-[#161819] backdrop-blur-md md:hidden"
          type="button"
          aria-label="Open navigation"
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
        fill="#111414"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeroContent() {
  const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index), []);

  return (
    <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col px-5 pb-7 pt-24 sm:px-6 sm:pb-8 lg:px-7">
      <div className="flex-1" />

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          <p className="mb-5 max-w-[390px] text-[13px] font-medium uppercase tracking-[0.18em] text-black/45 sm:hidden">
            Brand DNA / stakeholder alignment / engineering velocity
          </p>

          <h1 className="max-w-[900px] text-[clamp(2.75rem,7.15vw,6.7rem)] font-normal leading-[0.94] tracking-[-0.065em] text-[#2a2d2e] sm:text-[clamp(3.65rem,6.05vw,6.7rem)] lg:max-w-[900px]">
            Rebuild trust
            <br />
            with velocity
            <br />
            and clarity
          </h1>
        </div>
      </div>

      <div className="mt-10 grid gap-5 text-[13px] leading-[1.25] text-black/70 sm:mt-12 sm:grid-cols-[minmax(0,450px)_42px_minmax(0,310px)_minmax(0,1fr)] sm:items-end lg:mt-14">
        <p>
          A business-first rebuild for a large tech website, aligning Brand DNA,
          stakeholders and engineering teams before a single interface decision.
        </p>

        <a
          className="hidden h-9 w-9 items-center justify-center text-[#1e2223] transition duration-300 hover:translate-x-1 sm:inline-flex"
          href="#"
          aria-label="Move to case study details"
        >
          <ArrowRight size={22} strokeWidth={1.5} />
        </a>

        <p>Built for CTOs, engineering leads and decision-makers who need alignment before acceleration.</p>

        <div className="hidden w-full max-w-[260px] justify-self-end text-right text-[13px] leading-tight text-black/62 sm:block">
          <div className="mb-1 flex items-center justify-end gap-2">
            <span className="font-medium text-[#242728]">4.8 / 5</span>
            <span className="flex gap-0.5 text-[#e72727]" aria-label="5 star rating">
              {stars.map((star) => (
                <Star key={star} size={13} fill="currentColor" strokeWidth={1.7} />
              ))}
            </span>
          </div>
          <p>trusted by engineering-led teams</p>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-black/15 pt-4 sm:hidden">
          <a
            className="border border-black/55 bg-[#282b2c] px-5 py-3 text-[13px] font-medium text-white"
            href="#"
          >
            View case study
          </a>
          <div className="text-right text-[12px] leading-tight text-black/62">
            <div className="mb-1 flex items-center justify-end gap-1.5">
              <span className="font-medium text-[#242728]">4.8 / 5</span>
              <span className="flex gap-0.5 text-[#e72727]">
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
    icon: Boxes,
    label: "Brand DNA",
    meta: "FOUNDATION",
    description: "Clarify the product promise, buying context and language system before interface work begins.",
  },
  {
    icon: MessageSquareText,
    label: "Stakeholder Sessions",
    meta: "ALIGNMENT",
    description: "Map priorities across product, sales, leadership and engineering without flattening the nuance.",
  },
  {
    icon: GitBranch,
    label: "Decision Path",
    meta: "CTO FLOW",
    description: "Define how technical buyers evaluate proof, risk, implementation and time-to-value.",
  },
  {
    icon: Workflow,
    label: "Engineering Handoff",
    meta: "VELOCITY",
    description: "Turn the narrative into reusable systems, page logic and execution-ready direction.",
  },
];

function BrandDnaSection() {
  return (
    <section className="relative z-20 -mt-8 overflow-hidden rounded-t-[34px] bg-[#f7f7f4] text-[#252728] shadow-[0_-28px_70px_rgba(35,48,54,0.06)] sm:-mt-10 sm:rounded-t-[48px] lg:-mt-14 lg:rounded-t-[64px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,244,0))]" />
      <div className="pointer-events-none absolute left-1/2 top-[-18%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(118,190,255,0.14),rgba(255,207,118,0.09)_36%,transparent_70%)] blur-3xl" />

      <div className="relative mx-auto max-w-[1480px] px-5 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-7 lg:pb-36 lg:pt-24">
        <div className="mb-14 grid gap-8 border-b border-black/10 pb-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-black/45">
              <span className="h-2 w-2 rounded-full bg-[#ff4b24]" />
              Case intro / process
            </div>
            <h2 className="max-w-[840px] text-[clamp(3rem,6.2vw,7rem)] font-normal leading-[0.94] tracking-[-0.065em] text-[#242728]">
              We started with Brand DNA, not UI.
            </h2>
          </div>

          <div className="grid gap-6 lg:justify-items-end">
            <p className="max-w-[520px] text-[17px] leading-[1.45] tracking-[-0.02em] text-black/68 sm:text-[20px]">
              Before redesigning screens, we rebuilt the shared decision model: what the product means, who must believe it, and how engineering-led buyers move from doubt to commitment.
            </p>
            <div className="flex w-full max-w-[520px] items-center justify-between border-t border-black/12 pt-5 text-[12px] uppercase tracking-[0.16em] text-black/42">
              <span>Discovery</span>
              <ArrowRight size={18} strokeWidth={1.4} />
              <span>Alignment</span>
              <ArrowRight size={18} strokeWidth={1.4} />
              <span>Execution</span>
            </div>
          </div>
        </div>

        <ProcessRibbon />
        <EditorSurface />
      </div>
    </section>
  );
}

function ProcessRibbon() {
  return (
    <div className="relative mb-10 rounded-[24px] border border-black/10 bg-white/42 px-4 py-5 shadow-[0_20px_70px_rgba(26,35,38,0.06)] backdrop-blur-xl sm:px-6 lg:mb-12">
      <div className="grid gap-4 md:grid-cols-4 md:divide-x md:divide-black/10">
        {processSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.label} className="group relative px-2 py-3 md:px-5">
              <div className="mb-5 flex items-center gap-3">
                <div className={index === 0 ? "process-icon process-icon-active" : "process-icon"}>
                  <Icon size={18} strokeWidth={1.7} />
                </div>
                <span className="rounded-full border border-black/10 bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/42">
                  {step.meta}
                </span>
              </div>
              <h3 className="mb-2 text-[16px] font-medium tracking-[-0.02em] text-[#242728]">{step.label}</h3>
              <p className="max-w-[270px] text-[13px] leading-[1.35] text-black/52">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditorSurface() {
  const codeLines = [
    "brandDNA.define({",
    "  audience: 'CTO + engineering leads',",
    "  promise: 'velocity without loss of clarity',",
    "  riskModel: ['migration', 'team focus', 'delivery confidence'],",
    "  decisionPath: mapStakeholders(sessions),",
    "});",
    "",
    "handoff.createSystem({",
    "  narrative: brandDNA.language,",
    "  proof: decisionPath.evidence,",
    "  implementation: 'component-ready direction',",
    "});",
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-black/10 bg-[#eeeeeb]/82 shadow-[0_42px_120px_rgba(30,38,42,0.12)] backdrop-blur-2xl lg:rounded-[42px]">
      <div className="flex items-center justify-between border-b border-black/8 px-5 py-5 text-[13px] text-black/36 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f0645b]" />
          <span className="h-3 w-3 rounded-full bg-[#efbd45]" />
          <span className="h-3 w-3 rounded-full bg-[#67bf6b]" />
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-3 w-3 rounded-full border border-black/18" />
          <span>onlytrusted.process</span>
        </div>
        <div className="flex items-center gap-3 text-black/24">
          <Braces size={17} />
          <Code2 size={17} />
        </div>
      </div>

      <div className="grid min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="hidden border-r border-black/8 bg-white/28 p-6 lg:block">
          <div className="mb-5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-black/36">
            <span className="h-2 w-2 rounded-full bg-[#ff4b24]" />
            Sessions
          </div>
          {["Leadership priorities", "Buyer objections", "Engineering constraints", "Migration anxieties", "Proof hierarchy"].map((item, index) => (
            <div
              key={item}
              className={index === 1 ? "mb-2 rounded-[14px] bg-white px-4 py-3 text-[14px] text-black/70 shadow-[0_12px_30px_rgba(0,0,0,0.05)]" : "mb-2 rounded-[14px] px-4 py-3 text-[14px] text-black/34"}
            >
              {item}
            </div>
          ))}
        </aside>

        <div className="relative border-r border-black/8 p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between border-b border-black/8 pb-4 text-[13px] text-black/38">
            <span>brand-dna.ts</span>
            <span>case-intro</span>
          </div>
          <div className="font-mono text-[13px] leading-[1.95] text-black/38 sm:text-[14px]">
            {codeLines.map((line, index) => (
              <div key={`${line}-${index}`} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4">
                <span className="select-none text-right text-black/16">{index + 1}</span>
                <span className={line.includes("brandDNA") || line.includes("handoff") ? "text-[#4267ff]/78" : line.includes("'") ? "text-[#7661ff]/62" : ""}>
                  {line || "\u00a0"}
                </span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,rgba(247,247,244,0),rgba(247,247,244,0.94)_70%)]" />
          <div className="absolute bottom-8 left-1/2 w-[min(520px,calc(100%-40px))] -translate-x-1/2 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#ff4b24]/25 bg-white/80 text-[#ff4b24] shadow-[0_18px_48px_rgba(255,75,36,0.12)]">
              <Workflow size={26} strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-[24px] font-medium tracking-[-0.04em] text-[#282b2c]">A process layer before the interface layer</h3>
            <p className="mx-auto max-w-[470px] text-[14px] leading-[1.45] text-black/48">
              Every screen inherited a shared strategic spine, so product, marketing and engineering could move faster without re-litigating the story.
            </p>
          </div>
        </div>

        <aside className="relative hidden bg-white/24 p-6 lg:block">
          <div className="mb-5 text-[12px] font-medium uppercase tracking-[0.14em] text-black/36">Preview</div>
          <div className="space-y-4">
            {[
              ["Audience clarity", "CTOs and engineering leads"],
              ["Primary tension", "move faster without losing trust"],
              ["System output", "narrative, IA and component direction"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[18px] border border-black/8 bg-white/56 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-black/32">{label}</div>
                <div className="text-[15px] leading-[1.25] tracking-[-0.02em] text-black/70">{value}</div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-[22px] bg-[#282b2c] p-5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
            <div className="mb-8 text-[12px] uppercase tracking-[0.18em] text-white/40">Next</div>
            <div className="flex items-end justify-between gap-5">
              <p className="max-w-[190px] text-[22px] leading-[1.02] tracking-[-0.05em]">Turn alignment into page architecture.</p>
              <ArrowRight size={22} strokeWidth={1.4} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
