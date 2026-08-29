import { Clock, MapPin, Navigation2 } from "lucide-react";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { clinic } from "../utils/data";

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${clinic.name}, ${clinic.fullAddress}`,
)}`;

export function Clinic() {
  return (
    <section id="clinic" className="relative overflow-hidden bg-navy-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-15" />

      <Container className="relative">
        <SectionHeading eyebrow="Clinic" title="Visit the Clinic" />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          <Reveal className="lg:col-span-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-navy-950 shadow-2xl sm:aspect-[16/10]">
              <svg viewBox="0 0 500 340" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <rect width="500" height="340" fill="#071120" />
                <g opacity="0.12" stroke="#7dd3fc" strokeWidth="1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="340" />
                  ))}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 42} x2="500" y2={i * 42} />
                  ))}
                </g>

                <path
                  d="M -20 260 C 100 220, 180 300, 260 230 S 420 150, 540 190"
                  fill="none"
                  stroke="#1c3a60"
                  strokeWidth="26"
                  strokeLinecap="round"
                />
                <path
                  d="M -20 260 C 100 220, 180 300, 260 230 S 420 150, 540 190"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                />

                <path
                  d="M 240 40 C 240 40, 150 150, 240 190 C 330 150, 240 40, 240 40 Z"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </svg>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%]">
                <div className="relative flex flex-col items-center">
                  <div className="absolute -bottom-2 h-3 w-10 rounded-full bg-black/40 blur-sm" />
                  <MapPin className="h-14 w-14 fill-cyan-glow text-navy-950 drop-shadow-[0_0_20px_rgba(94,234,212,0.6)] animate-float-slow" strokeWidth={1.5} />
                  <span className="absolute -top-2 h-4 w-4 rounded-full border-2 border-cyan-glow animate-pulse-ring" />
                </div>
              </div>

              <div className="absolute left-5 top-5 rounded-xl glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-glow">
                Stadium Road
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-center gap-8 rounded-[2rem] glass p-8 sm:p-10">
              <div>
                <p className="font-display text-2xl font-bold text-white">{clinic.name}</p>
                <p className="mt-1 text-sm text-mist/60">Ultrasound &amp; Doppler Imaging Clinic</p>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cyan-glow" />
                  <p className="text-sm leading-relaxed text-mist/80">{clinic.fullAddress}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cyan-glow" />
                  <p className="text-sm leading-relaxed text-mist/80">{clinic.hours}</p>
                </div>
              </div>

              <Button href={directionsUrl} target="_blank" rel="noopener noreferrer" variant="primary" icon={false} className="w-fit">
                <Navigation2 className="h-4 w-4" strokeWidth={2.5} />
                Get Directions
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
