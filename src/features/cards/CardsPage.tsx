import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { Chip, SectionHeader, TarotFrame } from "@components/ui/MysticPrimitives";
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
    <div className="space-y-5 px-5 py-5">
      <SectionHeader eyebrow="Cartas" title="Las 78 cartas" description="Galeria compacta para reconocer arcanos, palos y nombres rapidamente." />
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1" aria-label="Filtros de cartas">
        {filters.map((item) => (
          <Chip key={item.value} active={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3" data-testid="mock-card-grid">
        {visibleCards.map((card) => (
          <Link key={card.id} className="group rounded-[1.35rem] border border-[color:var(--color-border)] bg-surface/58 p-1.5 text-center shadow-[0_10px_30px_rgb(0_0_0/20%)] transition hover:border-[color:var(--color-border-strong)]" to={`/carta/${card.id}`} onContextMenu={(event) => { event.preventDefault(); void saveFavorite(card.id); }}>
            <TarotFrame className="w-full transition group-hover:scale-[1.015]" src={card.thumbnail} />
            <span className="mt-2 block truncate px-1 pb-1 text-[11px] font-medium text-ink">{card.shortName ?? card.nameEs}</span>
            <span className="sr-only">Abrir {card.nameEs}</span>
          </Link>
        ))}
      </div>
      {cards.length === 0 && <GlassCard><p className="text-sm text-muted">Cargando grilla premium...</p></GlassCard>}
    </div>
  );
}
