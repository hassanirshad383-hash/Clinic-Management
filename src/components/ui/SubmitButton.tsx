import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function SubmitButton({
  loading = false,
  variant = "primary",
  disabled,
  className = "",
  children,
  ...props
}: SubmitButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-cyan-glow to-teal-med text-navy-950 shadow-[0_0_30px_rgba(94,234,212,0.35)] hover:shadow-[0_0_45px_rgba(94,234,212,0.55)]",
    secondary: "glass text-white hover:border-cyan-glow/40",
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
