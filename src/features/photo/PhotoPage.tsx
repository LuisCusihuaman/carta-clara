import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
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
      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Foto</p>
        <h2 className="mt-2 font-display text-3xl">Enfoca 1 a 3 cartas</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Tus fotos se procesan en este dispositivo. No se suben ni se guardan por defecto.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-background" type="button" onClick={startCamera}>Abrir camara</button>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[color:var(--color-border)] px-4 text-sm text-gold">
            Subir foto
            <input className="sr-only" type="file" accept="image/*" />
          </label>
          <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] px-4 text-sm text-muted" to="/">Buscar manualmente</Link>
        </div>
        {status !== "idle" && <p className="mt-4 text-sm text-muted">Estado: {status}</p>}
        <div className="mt-5 rounded-2xl border border-[color:var(--color-border)] bg-background p-3">
          <p className="text-sm text-muted">Matching local MVP: usa top candidatos, confianza y correccion manual.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" type="button" onClick={() => selectDemoCandidate("the_moon", 0.82)}>La Luna 82%</button>
            <button className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" type="button" onClick={() => selectDemoCandidate("three_of_swords", 0.64)}>Tres de Espadas 64%</button>
            <button className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" type="button" onClick={() => setCandidate(undefined)}>Corregir</button>
          </div>
          {candidate && <p className="mt-3 text-sm text-ink">Detecte {candidate.cardId.replaceAll("_", " ")} · {Math.round(candidate.confidence * 100)}%</p>}
        </div>
      </GlassCard>
    </div>
  );
}
