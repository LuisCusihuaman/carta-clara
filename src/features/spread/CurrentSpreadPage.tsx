import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import type { CardDetail } from "@/data/cardTypes";
import type { CurrentSpread } from "@/db/schema";
import { cardRepository } from "@features/cards/cardRepository";
import { getCurrentSpread } from "@features/spread/spreadStore";
import { summarizeSpread, type SpreadSummary } from "@features/spread/spreadRules";

export function CurrentSpreadPage() {
  const [summary, setSummary] = useState<SpreadSummary>();

  useEffect(() => {
    let cancelled = false;
    getCurrentSpread().then(async (spread) => {
      if (!spread || spread.cards.length === 0) return undefined;
      await cardRepository.getSummaries();
      const details = (await Promise.all(spread.cards.map((card: CurrentSpread["cards"][number]) => cardRepository.getDetail(card.cardId)))) as CardDetail[];
      return summarizeSpread(spread.cards.filter((card: CurrentSpread["cards"][number]) => card.orientation !== "unknown") as Array<{ cardId: string; orientation: "upright" | "reversed" }>, details);
    }).then((nextSummary) => {
      if (!cancelled) setSummary(nextSummary);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-5 py-5">
      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Tirada actual</p>
        <h2 className="mt-2 font-display text-3xl">Resumen simple</h2>
        {summary ? <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
          <p>{summary.headline}</p>
          {summary.cardLines.map((line) => <p key={line.cardId}><strong className="text-ink">{line.cardId.replaceAll("_", " ")}:</strong> {line.text}</p>)}
          <p><strong className="text-ink">Consejo:</strong> {summary.advice}</p>
        </div> : <p className="mt-2 text-sm leading-6 text-muted">Agrega hasta 3 cartas desde un detalle o una foto. El resumen usa reglas y significados existentes, sin AI generativa.</p>}
        <Link className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] px-4 text-sm text-gold" to="/">Agregar carta</Link>
      </GlassCard>
    </div>
  );
}
