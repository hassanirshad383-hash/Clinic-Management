import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", tone = "dark" }: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  const titleColor = tone === "dark" ? "text-white" : "text-navy-950";
  const subtitleColor = tone === "dark" ? "text-mist/70" : "text-navy-700/70";

  return (
    <Reveal className={`flex flex-col gap-4 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${titleColor}`}>
        {title}
      </h2>
      {subtitle && <p className={`max-w-2xl text-base leading-relaxed sm:text-lg ${subtitleColor}`}>{subtitle}</p>}
    </Reveal>
  );
}
