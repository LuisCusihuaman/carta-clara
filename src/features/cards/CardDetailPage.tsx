import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import type { CardDetail, Orientation } from "@/data/cardTypes";
import { cardRepository } from "@features/cards/cardRepository";
import { copyText } from "@/lib/clipboard";
import { recordRecentCard } from "@features/saved/historyStore";
import { saveFavorite } from "@features/saved/favoritesStore";
import { addCardToCurrentSpread } from "@features/spread/spreadStore";
import { runRecoverableStorageAction } from "@features/saved/storageFeedback";

export function CardDetailPage() {
  const { cardId = "the_moon" } = useParams();
  const [orientation, setOrientation] = useState<Orientation>("upright");
  const [detail, setDetail] = useState<CardDetail>();

  useEffect(() => {
    let cancelled = false;
    cardRepository.getSummaries()
      .then(() => cardRepository.getDetail(cardId))
      .then((nextDetail) => {
        if (!cancelled) {
          setDetail(nextDetail);
          void recordRecentCard(cardId, "related");
        }
      })
      .catch(() => {
        if (!cancelled) setDetail(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const oneLine = orientation === "upright" ? detail?.oneLineUpright : detail?.oneLineReversed;
  const quick = orientation === "upright" ? detail?.quickUpright : detail?.quickReversed;
  const love = orientation === "upright" ? detail?.loveUpright : detail?.loveReversed;
  const work = orientation === "upright" ? detail?.workUpright : detail?.workReversed;
  const advice = orientation === "upright" ? detail?.adviceUpright : detail?.adviceReversed;

  return (
    <div className="space-y-5 px-5 py-5">
      <Link className="text-sm text-gold" to="/">← Buscar</Link>
      <GlassCard>
        {detail ? <img className="aspect-[2/3] w-full rounded-2xl border border-[color:var(--color-border)] object-cover" src={detail.fullImage} alt="" /> : <div className="aspect-[2/3] rounded-2xl border border-[color:var(--color-border)] bg-elevated" aria-hidden="true" />}
        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-muted">{cardId}</p>
        <h2 className="font-display text-4xl text-ink">{detail?.nameEs ?? "Detalle no disponible"}</h2>
        <p className="mt-1 text-sm text-muted">{detail ? `${detail.nameEn}${detail.roman ? ` · Arcano Mayor ${detail.roman}` : ""}` : "Si estas offline, puede faltar el detalle completo."}</p>
        <div className="mt-4">
          <SegmentedControl
            label="Orientacion"
            value={orientation}
            options={[{ value: "upright", label: "Derecha" }, { value: "reversed", label: "Invertida" }]}
            onChange={setOrientation}
          />
        </div>
        <p className="mt-4 text-lg leading-7 text-ink">{oneLine ?? "Resumen disponible cuando el detalle se cachea."}</p>
        {quick && <p className="mt-3 text-sm leading-6 text-muted">{quick}</p>}
        {detail && <div className="mt-4 grid gap-3 text-sm leading-6 text-muted">
          <p><strong className="text-ink">Amor:</strong> {love}</p>
          <p><strong className="text-ink">Trabajo:</strong> {work}</p>
          <p><strong className="text-ink">Consejo:</strong> {advice}</p>
        </div>}
        {detail && <div className="mt-4 flex flex-wrap gap-2">
          <button className="min-h-11 rounded-full border border-[color:var(--color-border)] px-4 text-sm text-gold" type="button" onClick={() => void copyText(`${detail.nameEs}: ${oneLine}`)}>Copiar significado</button>
          <button className="min-h-11 rounded-full border border-[color:var(--color-border)] px-4 text-sm text-gold" type="button" onClick={() => void runRecoverableStorageAction(() => saveFavorite(detail.id))}>Guardar</button>
          <button className="min-h-11 rounded-full border border-[color:var(--color-border)] px-4 text-sm text-muted" type="button" onClick={() => void runRecoverableStorageAction(() => addCardToCurrentSpread(detail.id, orientation, "search"))}>Agregar a tirada</button>
          <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] px-4 text-sm text-muted" to="/tirada">Ver tirada</Link>
        </div>}
      </GlassCard>
      {detail && detail.relatedCards.length > 0 && <GlassCard>
        <h3 className="font-display text-2xl">Parecidas</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {detail.relatedCards.map((relatedId) => <Link key={relatedId} className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" to={`/carta/${relatedId}`}>{relatedId.replaceAll("_", " ")}</Link>)}
        </div>
      </GlassCard>}
    </div>
  );
}
