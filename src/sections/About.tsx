import { Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { aboutHighlights, doctor } from "../utils/data";
import portrait from "../assets/dr-hassan-irshad.jpg";

const philosophy = [
  {
    icon: ShieldCheck,
    title: "Careful, Systematic Assessment",
    text: "Every examination is approached methodically, ensuring relevant structures are assessed with care.",
  },
  {
    icon: Sparkles,
    title: "Precision-Focused Imaging",
    text: "Ultrasound imaging performed with attention to detail, supporting accurate and reliable findings.",
  },
  {
    icon: HeartHandshake,
    title: "Patient-Centered Care",
    text: "A respectful, comfortable experience for every patient who walks through the door.",
  },
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-soft/10 blur-[120px]" />

      <Container>
        <SectionHeading eyebrow="About" title="Precision in Every Scan" tone="light" align="left" />

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-12">
          <Reveal className="lg:col-span-2" delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-navy-950 shadow-2xl">
              <img
                src={portrait}
                alt={`${doctor.name}, ${doctor.title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-cyan-glow/10" />
              <div className="absolute inset-0 grid-overlay opacity-[0.08]" />
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-cyan-glow/60 to-transparent animate-scan" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-lg font-semibold text-white">{doctor.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-glow">{doctor.title}</p>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-10 lg:col-span-3">
            <Reveal delay={0.15}>
              <p className="text-lg leading-relaxed text-navy-800/85">
                <span className="font-semibold text-navy-950">{doctor.name}</span> is a{" "}
                {doctor.title} providing comprehensive ultrasound services with an emphasis on
                accurate imaging, careful assessment, and clear reporting.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {aboutHighlights.map((item, i) => (
                <Reveal key={item} delay={0.2 + i * 0.08}>
                  <div className="rounded-2xl border border-navy-950/8 bg-navy-950/[0.02] px-5 py-6 text-center">
                    <p className="font-display text-sm font-semibold text-navy-950">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {philosophy.map((item, i) => (
                <Reveal key={item.title} delay={0.3 + i * 0.1}>
                  <div className="group flex h-full flex-col gap-3 rounded-2xl border border-navy-950/8 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-soft/40 hover:shadow-xl">
                    <item.icon className="h-6 w-6 text-teal-med" strokeWidth={1.75} />
                    <p className="font-display text-sm font-semibold text-navy-950">{item.title}</p>
                    <p className="text-sm leading-relaxed text-navy-700/70">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
