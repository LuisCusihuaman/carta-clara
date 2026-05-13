import { NavLink, Outlet } from "react-router-dom";
import { useAppBootState } from "@app/useAppBootState";

const tabs = [
  { to: "/", label: "Buscar", icon: "✦" },
  { to: "/foto", label: "Foto", icon: "◌" },
  { to: "/cartas", label: "Cartas", icon: "▥" },
  { to: "/guardadas", label: "Guardadas", icon: "♡" }
];

export function AppShell() {
  const bootState = useAppBootState();

  return (
    <div className="cosmic-noise relative mx-auto flex min-h-svh w-full max-w-[430px] flex-col overflow-hidden border-x border-[color:var(--color-border)] bg-background text-ink shadow-glow">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(242_202_80/10%),transparent_18rem),radial-gradient(circle_at_85%_20%,rgb(220_184_255/12%),transparent_16rem)]" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[rgb(22_19_11/84%)] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-gold">Carta Clara</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="font-display text-[1.65rem] leading-tight text-ink">Radar de significado</h1>
          <span className="rounded-full border border-[color:var(--color-border)] bg-surface/70 px-2.5 py-1 text-[11px] text-muted">
            {bootState.label}
          </span>
        </div>
      </header>
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-[color:var(--color-border)] bg-[rgb(18_15_9/88%)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl" aria-label="Principal">
        <div className="grid grid-cols-4 gap-2 rounded-[1.6rem] border border-[color:var(--color-border)] bg-background/55 p-1.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-1 text-xs transition ${
                  isActive ? "bg-gold text-background shadow-[0_0_18px_rgb(242_202_80/18%)]" : "text-muted hover:bg-surface hover:text-ink"
                }`
              }
            >
              <span aria-hidden="true" className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
