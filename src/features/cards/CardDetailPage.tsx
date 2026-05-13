import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { ActionButton, InterpretationRow, SectionHeader, TarotFrame } from "@components/ui/MysticPrimitives";
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
  const money = orientation === "upright" ? detail?.moneyUpright : detail?.moneyReversed;
  const advice = orientation === "upright" ? detail?.adviceUpright : detail?.adviceReversed;

  return (
    <div className="space-y-5 px-5 py-5">
      <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/">← Buscar</Link>
      <GlassCard className="space-y-5">
        <TarotFrame size="hero" src={detail?.fullImage} />
        <SectionHeader
          eyebrow={detail?.roman ? `Arcano ${detail.roman}` : cardId.replaceAll("_", " ")}
          title={detail?.nameEs ?? "Detalle no disponible"}
          description={detail ? `${detail.nameEn} · ${detail.keywordsUpright.slice(0, 4).join(" · ")}` : "Si estas offline, puede faltar el detalle completo."}
        />
        <div className="mt-4">
          <SegmentedControl
            label="Orientacion"
            value={orientation}
            options={[{ value: "upright", label: "Derecha" }, { value: "reversed", label: "Invertida" }]}
            onChange={setOrientation}
          />
        </div>
        <div className="rounded-3xl border border-[color:var(--color-border-strong)] bg-gold/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Lectura rapida</p>
          <p className="mt-2 text-lg leading-7 text-ink">{oneLine ?? "Resumen disponible cuando el detalle se cachea."}</p>
          {quick && <p className="mt-3 text-sm leading-6 text-muted">{quick}</p>}
        </div>
        {detail && <div className="grid gap-3">
          <InterpretationRow label="Amor">{love}</InterpretationRow>
          <InterpretationRow label="Trabajo">{work}</InterpretationRow>
          <InterpretationRow label="Dinero">{money}</InterpretationRow>
          <InterpretationRow label="Consejo">{advice}</InterpretationRow>
        </div>}
        {detail && <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => void copyText(`${detail.nameEs}: ${oneLine}`)}>Copiar significado</ActionButton>
          <ActionButton onClick={() => void runRecoverableStorageAction(() => saveFavorite(detail.id))}>Guardar</ActionButton>
          <ActionButton onClick={() => void runRecoverableStorageAction(() => addCardToCurrentSpread(detail.id, orientation, "search"))}>Agregar a tirada</ActionButton>
          <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/tirada">Ver tirada</Link>
        </div>}
      </GlassCard>
      {detail && detail.relatedCards.length > 0 && <GlassCard>
        <h3 className="font-display text-2xl text-ink">Parecidas</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {detail.relatedCards.map((relatedId) => <Link key={relatedId} className="rounded-full border border-[color:var(--color-border)] bg-surface/60 px-3 py-2 text-xs font-semibold text-gold" to={`/carta/${relatedId}`}>{relatedId.replaceAll("_", " ")}</Link>)}
        </div>
      </GlassCard>}
    </div>
  );
}
