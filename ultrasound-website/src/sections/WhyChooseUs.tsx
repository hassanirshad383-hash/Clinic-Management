import { ClipboardCheck, FileCheck2, HeartHandshake, Layers } from "lucide-react";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { whyChooseUs } from "../utils/data";

const icons = [Layers, ClipboardCheck, FileCheck2, HeartHandshake];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-med/10 blur-[130px]" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Why Choose Dr. Hassan Irshad"
          tone="light"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-navy-950/8 bg-navy-950/[0.015] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-med/30 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-cyan-glow transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-navy-950">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-navy-700/70">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
