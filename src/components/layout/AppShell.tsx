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
    <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col overflow-hidden border-x border-(--color-border) bg-background text-ink shadow-glow">
      <header className="sticky top-0 z-20 border-b border-(--color-border) bg-(--color-surface-glass) px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Carta Clara</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="font-display text-2xl leading-tight text-ink">Radar de significado</h1>
          <span className="rounded-full border border-(--color-border) px-2 py-1 text-[11px] text-muted">
            {bootState.label}
          </span>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-(--color-border) bg-[rgb(14_11_22/92%)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl" aria-label="Principal">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-1 text-xs transition ${
                  isActive ? "bg-elevated text-gold" : "text-muted hover:bg-surface"
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
