import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "../utils/data";
import { serviceIcons } from "../utils/icons";

interface ServiceCardProps {
  service: Service;
  onOpen: (service: Service) => void;
}

export function ServiceCard({ service, onOpen }: ServiceCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const Icon = serviceIcons[service.id] ?? serviceIcons.general;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-40, 40], [8, -8]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-40, 40], [-8, 8]), { stiffness: 220, damping: 20 });

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => onOpen(service)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl glass p-6 text-left transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(94,234,212,0.15)] focus-visible:outline-cyan-glow"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-br from-cyan-glow/0 via-transparent to-teal-med/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:border-cyan-glow/25" />

      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-glow/0 blur-2xl transition-all duration-500 group-hover:bg-cyan-glow/15" />

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-glow/10 text-cyan-glow transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-display text-lg font-semibold text-white">{service.name}</h3>
        <p className="text-sm leading-relaxed text-mist/65">{service.description}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-glow">
        View details
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.button>
  );
}
