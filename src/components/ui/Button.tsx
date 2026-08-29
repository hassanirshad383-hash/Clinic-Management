import { type AnchorHTMLAttributes, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: boolean;
}

export function Button({ variant = "primary", icon = true, className = "", children, ...props }: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    el.style.setProperty("--mx", `${x * 0.25}px`);
    el.style.setProperty("--my", `${y * 0.35}px`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };

  const base =
    "group relative inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-[colors,transform] duration-300 will-change-transform [transform:translate(var(--mx,0px),var(--my,0px))]";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-cyan-glow to-teal-med text-navy-950 shadow-[0_0_30px_rgba(94,234,212,0.35)] hover:shadow-[0_0_45px_rgba(94,234,212,0.55)]",
    secondary: "glass text-white hover:border-cyan-glow/40",
    ghost: "text-mist hover:text-cyan-glow",
  };

  return (
    <a
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon && (
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
      )}
    </a>
  );
}
