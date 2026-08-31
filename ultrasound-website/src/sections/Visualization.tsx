import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";

export function Visualization() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <Reveal className="order-2 flex flex-col gap-6 lg:order-1">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-glow/25 bg-cyan-glow/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">
            Precision Imaging
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            See Beyond the Surface
          </h2>
          <p className="max-w-md text-base leading-relaxed text-mist/70 sm:text-lg">
            Advanced imaging. Thoughtful interpretation.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-mist/50">
            An abstract representation of ultrasound imaging technology — not a diagnostic image of any patient.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] bg-navy-950 shadow-2xl">
            <div className="absolute inset-0 grid-overlay opacity-30" />

            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="sectorFill" cx="50%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="sweepLine" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4" stopOpacity="0" />
                  <stop offset="90%" stopColor="#5eead4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d="M 200 30 L 60 340 A 220 220 0 0 0 340 340 Z" fill="url(#sectorFill)" stroke="#2dd4bf" strokeOpacity="0.25" />

              {[90, 150, 210, 270].map((r) => (
                <path
                  key={r}
                  d={`M ${200 - r * 0.42} ${30 + r * 0.965} A ${r} ${r} 0 0 0 ${200 + r * 0.42} ${30 + r * 0.965}`}
                  fill="none"
                  stroke="#7dd3fc"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                />
              ))}

              <ellipse cx="185" cy="210" rx="38" ry="26" fill="#7dd3fc" opacity="0.14" />
              <ellipse cx="230" cy="260" rx="26" ry="34" fill="#5eead4" opacity="0.12" />
              <circle cx="195" cy="230" r="10" fill="#5eead4" opacity="0.35" />

              {Array.from({ length: 14 }).map((_, i) => (
                <circle
                  key={i}
                  cx={130 + ((i * 37) % 150)}
                  cy={120 + ((i * 53) % 220)}
                  r={1.4}
                  fill="#a5f3fc"
                  opacity={0.5}
                />
              ))}

              <g style={{ transformOrigin: "200px 30px" }} className="origin-[200px_30px] animate-[spin_4s_linear_infinite]">
                <path d="M 200 30 L 60 340 A 220 220 0 0 0 90 355 Z" fill="url(#sweepLine)" opacity="0.5" />
              </g>
            </svg>

            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-glow/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" />
              Live Scan Simulation
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
