import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import type { CardSummary } from "@/data/cardTypes";
import { saveFavorite } from "@features/saved/favoritesStore";

const filters = [
  { label: "Todos", value: "all" },
  { label: "Mayores", value: "major" },
  { label: "Copas", value: "cups" },
  { label: "Espadas", value: "swords" },
  { label: "Bastos", value: "wands" },
  { label: "Oros", value: "pentacles" }
] as const;

export function CardsPage() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/data/cards.summary.v1.json")
      .then((response) => response.json() as Promise<CardSummary[]>)
      .then((nextCards) => {
        if (!cancelled) setCards(nextCards);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCards = useMemo(() => cards.filter((card) => filter === "all" || card.arcana === filter || card.suit === filter), [cards, filter]);

  return (
    <div className="space-y-4 px-5 py-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Cartas</p>
        <h2 className="mt-2 font-display text-3xl">Las 78 cartas</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item.value} className={`min-h-11 shrink-0 rounded-full border border-[color:var(--color-border)] px-4 text-sm ${filter === item.value ? "bg-elevated text-gold" : "text-muted"}`} type="button" onClick={() => setFilter(item.value)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {visibleCards.map((card) => (
          <Link key={card.id} className="rounded-2xl border border-[color:var(--color-border)] bg-surface p-2 text-center" to={`/carta/${card.id}`} onContextMenu={(event) => { event.preventDefault(); void saveFavorite(card.id); }}>
            <img className="mx-auto aspect-[2/3] w-full rounded-xl object-cover" src={card.thumbnail} alt="" loading="lazy" />
            <span className="mt-2 block truncate text-xs text-ink">{card.shortName ?? card.nameEs}</span>
          </Link>
        ))}
      </div>
      {cards.length === 0 && <GlassCard><p className="text-muted">Cargando grilla...</p></GlassCard>}
    </div>
  );
}
