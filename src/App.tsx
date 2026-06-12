import { ArrowRight, ChevronDown, Menu, Star } from "lucide-react";
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
    <section className="hero-section relative isolate min-h-[100svh] overflow-hidden bg-[#eef3f5]">
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
      className="dna-shader pointer-events-none absolute top-0 z-[5] hidden h-screen opacity-95 mix-blend-screen md:block"
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

function BrandDnaSection() {
  const [activeStep, setActiveStep] = useState(0);
  const activeProcess = processSteps[activeStep];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveStep((current) => (current + 1) % processSteps.length);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [activeStep]);

  return (
    <section className="align-process-section relative z-10 overflow-hidden bg-[#f7f7f4] text-[#2c2d2f]">
      <div className="pointer-events-none absolute inset-y-0 left-[max(1.25rem,calc((100vw-1480px)/2+1.75rem))] w-px bg-black/[0.06]" />
      <div className="pointer-events-none absolute inset-y-0 right-[max(1.25rem,calc((100vw-1480px)/2+1.75rem))] w-px bg-black/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.06]" />

      <div className="relative mx-auto max-w-[1480px] px-5 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32 lg:px-7 lg:pb-40">
        <div className="mx-auto mb-12 max-w-[980px] text-center">
          <div className="t-chip-reveal t-hover-lift mb-6 inline-flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[14px] font-medium text-[#3c3d40] shadow-[0_10px_28px_rgba(30,30,30,0.08)]">
            <Timer size={16} weight="fill" className="text-black/32" />
            <span className="t-shimmer-text">Rapid Alignment</span>
          </div>
          <h2 className="t-title-reveal mx-auto max-w-[960px] text-[clamp(2.35rem,4.35vw,4.8rem)] font-normal leading-[1.04] tracking-[-0.065em] text-[#2d2e31]">
            Make technical decisions faster before building screens
          </h2>
          <p className="t-subtitle-reveal mx-auto mt-7 max-w-[760px] text-[17px] leading-[1.6] text-black/28 sm:text-[20px]">
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
    <div className="t-tabs-reveal relative mx-auto mb-10 max-w-[880px] sm:mb-12">
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
      <SpinnerGap size={17} weight="regular" className="t-step-icon-active text-[#2f66ff]" />
      <CheckCircle size={18} weight="fill" className="t-step-icon-complete text-[#2fbf71]" />
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
    <div className="t-panel-shell relative mx-auto max-w-[1220px]">
      <div className="process-editor-stem" aria-hidden="true" />
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#eeeeec] shadow-[0_36px_90px_rgba(30,33,36,0.12)]">
        <div className="border-b border-black/10 bg-[#eeeeec] px-2.5 sm:px-3">
          <div className="grid items-center text-[14px] text-black/34 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
            <div className="flex items-center gap-2 px-3 py-5 sm:px-4">
              <BracketsCurly size={16} weight="fill" className="text-[#2f66ff]" />
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
            <div key={`code-${activeStep}`} className="t-panel-slide min-h-[720px] border-b border-black/10 p-6 font-mono text-[13px] leading-[1.78] text-black/48 sm:p-8 sm:text-[14px] lg:border-b-0 lg:border-r">
              {activeProcess.code.map((line, index) => (
                <div key={`${activeStep}-${line}-${index}`} className="t-code-line grid grid-cols-[32px_minmax(0,1fr)] gap-5" style={{ "--line-index": index } as React.CSSProperties}>
                  <span className="code-line-number select-none text-right">{index + 1}</span>
                  <span className={getCodeLineClass(line)}>
                    {line || "\u00a0"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex min-h-[720px] items-center justify-center bg-white p-6">
              <div key={`preview-${activeStep}`} className="t-panel-scale w-full max-w-[360px]">
                <div className="mb-7 flex items-center gap-3">
                  <div className="t-orb-pulse flex h-12 w-12 items-center justify-center rounded-full bg-[#315dff] text-white shadow-[0_18px_40px_rgba(49,93,255,0.26)]">
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
                      <CheckCircle size={28} weight="fill" className="shrink-0 text-[#315dff]" />
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
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6b8cff]" />
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
      tone: "text-[#315dff]",
    },
    {
      icon: CheckCircle,
      title: "Aligned stakeholder logic",
      text: activeProcess.detail,
      tone: "text-[#2fbf71]",
    },
    {
      icon: GitBranch,
      title: "Cleaner handoff",
      text: "Translate strategy into page architecture, content rules and component-ready direction.",
      tone: "text-[#315dff]",
    },
  ];

  return (
    <div className="relative mx-auto mt-12 max-w-[1050px]">
      <div className="output-connector" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {outputCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="t-hover-lift group text-center">
              <div className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black/30 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_32px_rgba(49,93,255,0.12)]">
                <Icon size={20} weight="fill" className={card.tone} />
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

export default App;
