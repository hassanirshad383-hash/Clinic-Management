import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { journeySteps } from "../utils/data";

export function PatientJourney() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />

      <Container className="relative">
        <SectionHeading eyebrow="Patient Journey" title="A Simple, Comfortable Experience" />

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-6 hidden h-px w-[calc(100%-8rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-glow/30 to-transparent lg:block" />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {journeySteps.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.12}>
                <div className="group relative flex flex-col items-center gap-4 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full glass font-display text-sm font-bold text-cyan-glow transition-all duration-300 group-hover:shadow-glow-cyan">
                    {step.number}
                    <span className="absolute inset-0 -z-10 rounded-full border border-cyan-glow/20 animate-pulse-ring" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">{step.title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
