import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { SectionHeader, TarotFrame } from "@components/ui/MysticPrimitives";
import type { CardDetail } from "@/data/cardTypes";
import type { CurrentSpread } from "@/db/schema";
import { cardRepository } from "@features/cards/cardRepository";
import { getCurrentSpread } from "@features/spread/spreadStore";
import { summarizeSpread, type SpreadSummary } from "@features/spread/spreadRules";

export function CurrentSpreadPage() {
  const [summary, setSummary] = useState<SpreadSummary>();
  const [details, setDetails] = useState<CardDetail[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCurrentSpread().then(async (spread) => {
      if (!spread || spread.cards.length === 0) return undefined;
      await cardRepository.getSummaries();
      const details = (await Promise.all(spread.cards.map((card: CurrentSpread["cards"][number]) => cardRepository.getDetail(card.cardId)))) as CardDetail[];
      return {
        details,
        summary: summarizeSpread(spread.cards.filter((card: CurrentSpread["cards"][number]) => card.orientation !== "unknown") as Array<{ cardId: string; orientation: "upright" | "reversed" }>, details)
      };
    }).then((nextState) => {
      if (!cancelled) {
        setSummary(nextState?.summary);
        setDetails(nextState?.details ?? []);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-5 py-5">
      <GlassCard className="space-y-4">
        <SectionHeader eyebrow="Tirada actual" title="Resumen simple" description="Lectura breve con reglas locales y significados existentes, sin AI generativa." />
        {details.length > 0 && <div className="grid grid-cols-3 gap-2 rounded-3xl border border-[color:var(--color-border)] bg-background/35 p-3" data-testid="spread-card-strip">
          {details.map((detail) => <TarotFrame key={detail.id} className="w-full" src={detail.thumbnail} />)}
        </div>}
        {summary ? <div className="space-y-3 text-sm leading-6 text-muted">
          <div className="rounded-2xl border border-[color:var(--color-border-strong)] bg-gold/10 p-3 text-ink">{summary.headline}</div>
          {summary.cardLines.map((line) => <p key={line.cardId} className="rounded-2xl border border-[color:var(--color-border)] bg-surface/55 p-3"><strong className="text-ink">{line.cardId.replaceAll("_", " ")}:</strong> {line.text}</p>)}
          <p className="rounded-2xl border border-[color:var(--color-border)] bg-violet/10 p-3"><strong className="text-ink">Consejo:</strong> {summary.advice}</p>
        </div> : <p className="text-sm leading-6 text-muted">Agrega hasta 3 cartas desde un detalle o una foto. La lectura aparecera como una tirada compacta.</p>}
        <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/">Agregar carta</Link>
      </GlassCard>
    </div>
  );
}
