import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { Service } from "../utils/data";
import { serviceIcons } from "../utils/icons";
import { Button } from "./ui/Button";

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [service, onClose]);

  const Icon = service ? (serviceIcons[service.id] ?? serviceIcons.general) : null;

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl glass p-8"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-mist/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-glow/10 text-cyan-glow">
              {Icon && <Icon className="h-7 w-7" strokeWidth={1.75} />}
            </div>

            <h3 id="service-modal-title" className="mt-5 font-display text-2xl font-bold text-white">
              {service.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist/70">{service.description}</p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">
              Areas Assessed
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {service.areas.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-mist/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-med" strokeWidth={2} />
                  {area}
                </li>
              ))}
            </ul>

            <Button href="#contact" onClick={onClose} className="mt-8 w-full justify-center sm:w-auto">
              Contact Clinic
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
