import { Clock, MapPin, Navigation2 } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { clinic, doctor } from "../utils/data";

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${clinic.name}, ${clinic.fullAddress}`,
)}`;

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-glow/10 blur-[140px]" />

      <Container className="relative flex flex-col items-center gap-10 text-center">
        <Reveal className="flex flex-col items-center gap-5">
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your Imaging Starts With Clarity.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-mist/70 sm:text-lg">
            For ultrasound examination and clinic information, visit {doctor.name} at {clinic.name}.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="w-full max-w-lg rounded-[2rem] glass p-8 sm:p-10">
          <p className="font-display text-xl font-bold text-white">{doctor.name}</p>
          <p className="mt-1 text-sm text-cyan-glow">{doctor.title}</p>

          <div className="mt-6 flex flex-col gap-3 text-sm text-mist/80">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-glow" />
              {clinic.name}, {clinic.fullAddress}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-cyan-glow" />
              Available: {clinic.hours}
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button href="#clinic" variant="primary">
              Contact Clinic
            </Button>
            <Button href={directionsUrl} target="_blank" rel="noopener noreferrer" variant="secondary" icon={false}>
              <Navigation2 className="h-4 w-4" strokeWidth={2.5} />
              Get Directions
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
