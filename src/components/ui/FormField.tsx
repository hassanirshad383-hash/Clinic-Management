import type { ReactNode } from "react";

export const fieldInputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-mist/40 outline-none transition-colors duration-200 focus:border-cyan-glow/50 focus:bg-white/[0.06] disabled:opacity-50";

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required, error, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wider text-mist/60">
        {label}
        {required && <span className="text-cyan-glow"> *</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
