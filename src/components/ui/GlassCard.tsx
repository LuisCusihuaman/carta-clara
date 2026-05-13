import type { ReactNode } from "react";
import { clsx } from "clsx";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <section className={clsx("mystic-panel rounded-[2rem] p-4", className)}>
      {children}
    </section>
  );
}
