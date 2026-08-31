import { motion, useReducedMotion } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { doctor } from "../utils/data";
import { useClinicInfo } from "../hooks/useClinicInfo";
import scanSession from "../assets/dr-irshad-abdominal-scan.jpg";

export function Hero() {
  const reduced = useReducedMotion();
  const clinic = useClinicInfo();

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 pt-28 pb-16">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-glow/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-teal-med/10 blur-[120px]" />

      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/25 bg-cyan-glow/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">
            {doctor.name} — {doctor.title}
          </span>

          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Advanced Ultrasound.
            <br />
            <span className="text-gradient">Clearer Answers.</span>
            <br />
            Better Care.
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-mist/75 sm:text-lg">
            Comprehensive ultrasound imaging performed with precision, advanced technology, and a
            patient-focused approach.
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <Button href="#contact" variant="primary">
              Book / Contact Clinic
            </Button>
            <Button href="#services" variant="secondary">
              Explore Ultrasound Services
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl glass px-6 py-5 sm:flex-row sm:items-center sm:gap-8">
            <div>
              <p className="text-sm font-semibold text-white">{clinic.name}</p>
              <p className="text-xs text-mist/60">Ultrasound &amp; Doppler Imaging</p>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-2 text-sm text-mist/75">
              <Clock className="h-4 w-4 text-cyan-glow" />
              {clinic.hours}
            </div>
            <div className="flex items-center gap-2 text-sm text-mist/75">
              <MapPin className="h-4 w-4 text-cyan-glow" />
              {clinic.fullAddress}
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <a
              href={clinic.phoneHref}
              className="flex items-center gap-2 text-sm font-semibold text-cyan-glow transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {clinic.phoneDisplay}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, scale: 0.94 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative h-[420px] sm:h-[520px] lg:h-[600px]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] shadow-2xl">
            <img
              src={scanSession}
              alt={`${doctor.name} performing an abdominal ultrasound examination`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-navy-950/30" />
            <div className="absolute inset-0 grid-overlay opacity-[0.06]" />
            <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent animate-scan" />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6">
              <div>
                <p className="font-display text-lg font-semibold text-white">{doctor.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-glow">{doctor.title}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-glow">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" />
                Abdominal Ultrasound
              </span>
            </div>
          </div>
        </motion.div>
      </Container>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-mist/40 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-9 w-5 rounded-full border border-mist/25 p-1">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-cyan-glow"
            animate={reduced ? undefined : { y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
