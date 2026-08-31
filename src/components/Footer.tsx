import { navLinks, doctor, disclaimer } from "../utils/data";
import { useClinicInfo } from "../hooks/useClinicInfo";
import { Container } from "./ui/Container";

export function Footer() {
  const year = new Date().getFullYear();
  const clinic = useClinicInfo();

  return (
    <footer className="relative border-t border-white/5 bg-navy-950 pb-8 pt-16">
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-white">{doctor.name.toUpperCase()}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-glow">{doctor.title}</p>
            <p className="mt-3 text-sm text-mist/50">Ultrasound Services</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/40">Links</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-mist/65 transition-colors hover:text-cyan-glow">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/40">Clinic</p>
            <p className="mt-4 text-sm text-mist/65">{clinic.name}</p>
            <p className="mt-1 text-sm text-mist/65">{clinic.fullAddress}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/40">Contact</p>
            <p className="mt-4 text-sm text-mist/65">{clinic.hours}</p>
            <a href={clinic.phoneHref} className="mt-1 block text-sm text-cyan-glow transition-colors hover:text-white">
              {clinic.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-white/5 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-mist/35">{disclaimer}</p>
          <p className="mt-4 text-xs text-mist/30">© {year} {doctor.name}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
