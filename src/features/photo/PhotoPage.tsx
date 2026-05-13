import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { ActionButton, ConfidenceBadge, PremiumRow, SectionHeader, StatePanel } from "@components/ui/MysticPrimitives";
import { addCardToCurrentSpread } from "@features/spread/spreadStore";

export default function PhotoPage() {
  const [status, setStatus] = useState<"idle" | "unsupported" | "denied" | "active">("idle");
  const [candidate, setCandidate] = useState<{ cardId: string; confidence: number }>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStatus("active");
    } catch {
      setStatus("denied");
    }
  }

  function selectDemoCandidate(cardId: string, confidence: number) {
    setCandidate({ cardId, confidence });
    void addCardToCurrentSpread(cardId, "unknown", "photo", confidence);
  }

  return (
    <div className="space-y-5 px-5 py-5">
      <GlassCard className="space-y-4">
        <SectionHeader eyebrow="Foto" title="Enfoca 1 a 3 cartas" description="Tus fotos se procesan en este dispositivo. No se suben ni se guardan por defecto." />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[color:var(--color-border-strong)] bg-background/70 p-4 shadow-[inset_0_0_40px_rgb(242_202_80/6%)]" data-testid="camera-guide-frame">
          <div className="absolute inset-7 rounded-[1.5rem] border border-dashed border-[rgb(242_202_80/54%)]" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-44 w-28 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold/70 bg-gold/5 shadow-[0_0_34px_rgb(220_184_255/18%)]" aria-hidden="true" />
          <p className="relative z-10 rounded-full border border-[color:var(--color-border)] bg-surface/75 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold">Guia de captura local</p>
          <p className="absolute inset-x-8 bottom-8 text-center text-sm leading-6 text-muted">Alinea las cartas dentro del marco y usa correccion manual si la confianza es baja.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={startCamera}>Abrir camara</ActionButton>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold">
            Subir foto
            <input className="sr-only" type="file" accept="image/*" />
          </label>
          <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/">Buscar manualmente</Link>
        </div>
        {status !== "idle" && <StatePanel title="Estado de camara">{status === "active" ? "Camara activa. La deteccion real se mantiene local." : `Estado: ${status}. Usa subir foto o busqueda manual si hace falta.`}</StatePanel>}
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-background/45 p-3">
          <p className="text-sm text-muted">Matching local MVP: usa top candidatos, confianza y correccion manual.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton className="min-h-9 px-3 text-xs" onClick={() => selectDemoCandidate("the_moon", 0.82)}>La Luna 82%</ActionButton>
            <ActionButton className="min-h-9 px-3 text-xs" onClick={() => selectDemoCandidate("three_of_swords", 0.64)}>Tres de Espadas 64%</ActionButton>
            <ActionButton className="min-h-9 px-3 text-xs" onClick={() => setCandidate(undefined)}>Corregir</ActionButton>
          </div>
          {candidate ? <PremiumRow className="mt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Detecte {candidate.cardId.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted">Agregada a la tirada actual con origen foto.</p>
              </div>
              <ConfidenceBadge value={candidate.confidence} />
            </div>
          </PremiumRow> : <StatePanel className="mt-3" title="Correccion guiada">Elige un candidato superior o vuelve a la busqueda manual para corregir la carta con baja confianza.</StatePanel>}
        </div>
      </GlassCard>
    </div>
  );
}
