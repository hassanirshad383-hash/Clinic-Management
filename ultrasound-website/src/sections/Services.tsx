import { useState } from "react";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { ServiceCard } from "../components/ServiceCard";
import { ServiceModal } from "../components/ServiceModal";
import { type Service } from "../utils/data";
import { useServices } from "../hooks/useServices";

export function Services() {
  const [active, setActive] = useState<Service | null>(null);
  const services = useServices();

  return (
    <section id="services" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-25" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-teal-med/10 blur-[130px]" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Services"
          title="Comprehensive Ultrasound Services"
          subtitle="Advanced ultrasound imaging for accurate assessment across a wide range of clinical needs."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 3) * 0.08}>
              <ServiceCard service={service} onOpen={setActive} />
            </Reveal>
          ))}
        </div>
      </Container>

      <ServiceModal service={active} onClose={() => setActive(null)} />
    </section>
  );
}
