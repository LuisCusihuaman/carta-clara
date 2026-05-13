import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ClassNameProp = {
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, className }: ClassNameProp & { eyebrow: string; title: string; description?: string }) {
  return (
    <div className={clsx("space-y-2", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
      <h2 className="font-display text-3xl leading-tight text-ink">{title}</h2>
      {description && <p className="text-sm leading-6 text-muted">{description}</p>}
    </div>
  );
}

export function Chip({ children, active = false, className, ...props }: ClassNameProp & { children: ReactNode; active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "min-h-11 shrink-0 rounded-full border px-4 text-sm transition",
        active ? "border-[color:var(--color-border-strong)] bg-gold text-background shadow-[0_0_18px_rgb(242_202_80/16%)]" : "border-[color:var(--color-border)] bg-surface/70 text-muted hover:text-ink",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionLink({ children, className, variant = "ghost", ...props }: ClassNameProp & { children: ReactNode; variant?: "primary" | "ghost" } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition",
        variant === "primary" ? "bg-gold text-background shadow-[0_0_22px_rgb(242_202_80/18%)]" : "border border-[color:var(--color-border)] bg-surface/60 text-gold hover:text-ink",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function ActionButton({ children, className, variant = "ghost", ...props }: ClassNameProp & { children: ReactNode; variant?: "primary" | "ghost" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "min-h-11 rounded-full px-4 text-sm font-semibold transition",
        variant === "primary" ? "bg-gold text-background shadow-[0_0_22px_rgb(242_202_80/18%)]" : "border border-[color:var(--color-border)] bg-surface/60 text-gold hover:text-ink",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function StatePanel({ title, children, className }: ClassNameProp & { title: string; children: ReactNode }) {
  return (
    <div className={clsx("rounded-3xl border border-[color:var(--color-border)] bg-background/45 p-4", className)}>
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-muted">{children}</div>
    </div>
  );
}

export function TarotFrame({ src, alt = "", size = "thumb", className }: ClassNameProp & { src?: string; alt?: string; size?: "thumb" | "hero" }) {
  const inner = src ? <img className="h-full w-full rounded-[inherit] object-cover" src={src} alt={alt} loading="lazy" /> : <div className="h-full w-full rounded-[inherit]" aria-hidden="true" />;
  return (
    <div className={clsx("etched-card relative overflow-hidden p-1", size === "hero" ? "mx-auto aspect-[2/3] w-full max-w-[280px] rounded-[1.8rem]" : "aspect-[2/3] rounded-2xl", className)}>
      <div className="h-full rounded-[calc(1.5rem-4px)] border border-[rgb(242_202_80/24%)] bg-background/40 p-1">{inner}</div>
      <span className="pointer-events-none absolute inset-3 rounded-[inherit] border border-[rgb(242_202_80/16%)]" aria-hidden="true" />
    </div>
  );
}

export function InterpretationRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-background/38 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{label}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{children}</p>
    </div>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const percent = Math.round(value * 100);
  return <span className="rounded-full border border-[color:var(--color-border)] bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{percent}% confianza</span>;
}

export function PremiumRow({ children, className }: ClassNameProp & { children: ReactNode }) {
  return <div className={clsx("rounded-2xl border border-[color:var(--color-border)] bg-surface/70 p-3 shadow-[0_10px_28px_rgb(0_0_0/20%)]", className)}>{children}</div>;
}
