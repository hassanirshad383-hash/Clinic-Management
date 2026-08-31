import { Clock, MapPin, Navigation2, Phone } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { AppointmentForm } from "../components/forms/AppointmentForm";
import { InquiryForm } from "../components/forms/InquiryForm";
import { useClinicInfo } from "../hooks/useClinicInfo";
import { doctor } from "../utils/data";

export function Contact() {
  const clinic = useClinicInfo();
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${clinic.name}, ${clinic.fullAddress}`,
  )}`;

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-glow/10 blur-[140px]" />

      <Container className="relative">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your Imaging Starts With Clarity.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-mist/70 sm:text-lg">
            For ultrasound examination and clinic information, visit {doctor.name} at {clinic.name}.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="h-full rounded-[2rem] glass p-8 sm:p-10">
              <AppointmentForm />
            </div>
          </Reveal>

          <Reveal delay={0.2} className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-[2rem] glass p-8">
              <p className="font-display text-lg font-bold text-white">{doctor.name}</p>
              <p className="mt-1 text-sm text-cyan-glow">{doctor.title}</p>

              <div className="mt-6 flex flex-col gap-3 text-sm text-mist/80">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow" />
                  {clinic.name}, {clinic.fullAddress}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-cyan-glow" />
                  Available: {clinic.hours}
                </div>
                <a
                  href={clinic.phoneHref}
                  className="flex items-center gap-2 font-semibold text-cyan-glow transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {clinic.phoneDisplay}
                </a>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href={clinic.phoneHref} variant="primary" icon={false} className="justify-center">
                  <Phone className="h-4 w-4" strokeWidth={2.5} />
                  Call Now
                </Button>
                <Button
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  icon={false}
                  className="justify-center"
                >
                  <Navigation2 className="h-4 w-4" strokeWidth={2.5} />
                  Directions
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] glass p-8">
              <InquiryForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
