import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useScrolled } from "../hooks/useScrolled";
import { navLinks, doctor } from "../utils/data";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";

export function Navigation() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)]" : "bg-transparent py-6"
      }`}
    >
      <Container className="flex items-center justify-between">
        <a href="#home" className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-[0.08em] text-white sm:text-xl">
            DR. HASSAN IRSHAD
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-glow sm:text-xs">
            {doctor.title}
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist/80 transition-colors duration-300 hover:text-cyan-glow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="#contact" variant="secondary" icon={false} className="!px-6 !py-2.5 text-xs">
            Book / Contact
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-full glass text-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <Container className="flex flex-col gap-1 pb-6 pt-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-xl px-4 py-3 text-base font-medium text-mist/90 transition-colors hover:bg-white/5 hover:text-cyan-glow"
                >
                  {link.label}
                </motion.a>
              ))}
              <Button href="#contact" onClick={() => setOpen(false)} className="mt-3 justify-center">
                Book / Contact
              </Button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
