import { ArrowRight, ChevronDown, Menu, Star } from "lucide-react";
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
  return <HeroSection />;
}

function HeroSection() {
  const cursor = useHeroCursor();

  return (
    <main className="min-h-screen bg-[#eef3f5] text-[#252728]">
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <ShaderBackground />
        <InteractiveGlassPanels cursor={cursor} />
        <div className="absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(244,247,248,0.18)_54%,rgba(239,244,245,0.82)_100%)]" />
        <DnaShader />
        <TopNav />
        <HeroContent />
      </section>
    </main>
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

export default App;
