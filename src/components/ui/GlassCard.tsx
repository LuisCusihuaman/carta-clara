import type { ReactNode } from "react";
import { clsx } from "clsx";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <section className={clsx("rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-glass)] p-4 shadow-glow backdrop-blur", className)}>
      {children}
    </section>
  );
}
