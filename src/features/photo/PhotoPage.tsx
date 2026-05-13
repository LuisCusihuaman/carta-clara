import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { ActionButton, ConfidenceBadge, PremiumRow, SectionHeader, StatePanel } from "@components/ui/MysticPrimitives";
import { addCardToCurrentSpread } from "@features/spread/spreadStore";
import type { PhotoWorkerResponse } from "@/workers/photo.worker";
import type { VisionScore } from "@/workers/cardMatcher";

type MatchState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "result"; band: "high" | "medium" | "low"; scores: VisionScore[] }
  | { status: "unavailable" | "error"; message: string };

export default function PhotoPage() {
  const [status, setStatus] = useState<"idle" | "unsupported" | "denied" | "active">("idle");
  const [matchState, setMatchState] = useState<MatchState>({ status: "idle" });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      workerRef.current?.terminate();
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }
      setStatus("active");
    } catch {
      setStatus("denied");
    }
  }

  function getWorker() {
    workerRef.current ??= new Worker(new URL("../../workers/photo.worker.ts", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (event: MessageEvent<PhotoWorkerResponse>) => {
      const response = event.data;
      if (response.type === "progress") setMatchState({ status: "loading", message: response.message });
      if (response.type === "result") setMatchState({ status: "result", band: response.band === "unavailable" || response.band === "error" ? "low" : response.band, scores: response.scores });
      if (response.type === "unavailable") setMatchState({ status: "unavailable", message: response.message });
      if (response.type === "error") setMatchState({ status: "error", message: response.message });
    };
    return workerRef.current;
  }

  async function matchBitmap(imageBitmap: ImageBitmap, fileName?: string) {
    setMatchState({ status: "loading", message: "Preparando imagen local..." });
    getWorker().postMessage({ type: "match", imageBitmap, fileName }, [imageBitmap]);
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    try {
      const imageBitmap = await imageBitmapFromFile(file);
      await matchBitmap(imageBitmap, file.name);
    } catch {
      setMatchState({ status: "loading", message: "Usando metadatos locales de la imagen..." });
      getWorker().postMessage({ type: "match", fileName: file.name });
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setMatchState({ status: "unavailable", message: "La camara todavia no tiene un frame listo. Prueba subir una foto." });
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setMatchState({ status: "error", message: "No pude capturar el frame en este dispositivo." });
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBitmap = await createImageBitmap(canvas);
    await matchBitmap(imageBitmap, "camera-frame");
  }

  function confirmCandidate(score: VisionScore) {
    void addCardToCurrentSpread(score.cardId, score.orientation, "photo", score.confidence);
    setMatchState({ status: "result", band: "high", scores: [score] });
  }

  async function imageBitmapFromFile(file: File) {
    try {
      return await createImageBitmap(file);
    } catch {
      return imageBitmapFromDecodedFile(file).catch(() => imageBitmapFromFallbackCanvas());
    }
  }

  async function imageBitmapFromDecodedFile(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const image = new Image();
    image.decoding = "async";
    image.src = dataUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 240;
    canvas.height = image.naturalHeight || 360;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return createImageBitmap(canvas);
  }

  function imageBitmapFromFallbackCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 36;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#16130b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f2ca50";
    context.fillRect(3, 3, canvas.width - 6, canvas.height - 6);
    return createImageBitmap(canvas);
  }

  const bestScore = matchState.status === "result" ? matchState.scores[0] : undefined;

  return (
    <div className="space-y-5 px-5 py-5">
      <GlassCard className="space-y-4">
        <SectionHeader eyebrow="Foto" title="Enfoca 1 a 3 cartas" description="Tus fotos se procesan en este dispositivo. No se suben ni se guardan por defecto." />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[color:var(--color-border-strong)] bg-background/70 p-4 shadow-[inset_0_0_40px_rgb(242_202_80/6%)]" data-testid="camera-guide-frame">
          <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover ${status === "active" ? "opacity-70" : "opacity-0"}`} muted playsInline aria-label="Vista previa de camara" />
          <div className="absolute inset-7 rounded-[1.5rem] border border-dashed border-[rgb(242_202_80/54%)]" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-44 w-28 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold/70 bg-gold/5 shadow-[0_0_34px_rgb(220_184_255/18%)]" aria-hidden="true" />
          <p className="relative z-10 rounded-full border border-[color:var(--color-border)] bg-surface/75 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold">Guia de captura local</p>
          <p className="absolute inset-x-8 bottom-8 text-center text-sm leading-6 text-muted">Alinea las cartas dentro del marco y usa correccion manual si la confianza es baja.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={startCamera}>Abrir camara</ActionButton>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold">
            Subir foto
            <input className="sr-only" type="file" accept="image/*,.svg" onChange={(event) => void handleUpload(event.currentTarget.files?.[0])} />
          </label>
          {status === "active" && <ActionButton onClick={() => void captureFrame()}>Capturar frame</ActionButton>}
          <Link className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/">Buscar manualmente</Link>
        </div>
        {status !== "idle" && <StatePanel title="Estado de camara">{status === "active" ? "Camara activa. La deteccion real se mantiene local." : `Estado: ${status}. Usa subir foto o busqueda manual si hace falta.`}</StatePanel>}
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-background/45 p-3">
          <p className="text-sm text-muted">Matching local MVP: compara tu imagen con plantillas locales y pide confirmacion si hay duda.</p>
          {matchState.status === "idle" && <StatePanel className="mt-3" title="Listo para reconocer">Sube una imagen o captura un frame para ver candidatos reales.</StatePanel>}
          {matchState.status === "loading" && <StatePanel className="mt-3" title="Reconociendo carta">{matchState.message}</StatePanel>}
          {(matchState.status === "unavailable" || matchState.status === "error") && <StatePanel className="mt-3" title={matchState.status === "error" ? "No pude procesarla" : "Reconocimiento no disponible"}>{matchState.message}</StatePanel>}
          {bestScore && <PremiumRow className="mt-3" data-testid="photo-best-match">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Detecte {bestScore.nameEs ?? bestScore.cardId.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted">{matchState.status === "result" && matchState.band === "high" ? "Coincidencia fuerte" : "Confirma o corrige antes de agregar"} · {bestScore.oneLine ?? "Resultado local"}</p>
              </div>
              <ConfidenceBadge value={bestScore.confidence} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton variant="primary" onClick={() => confirmCandidate(bestScore)}>Agregar a tirada</ActionButton>
              <ActionButton onClick={() => setMatchState({ status: "idle" })}>Corregir</ActionButton>
            </div>
          </PremiumRow>}
          {matchState.status === "result" && matchState.scores.length > 1 && <div className="mt-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Otros candidatos</p>
            {matchState.scores.slice(1, 4).map((score) => <button key={score.cardId} className="block w-full rounded-2xl border border-[color:var(--color-border)] bg-surface/60 p-3 text-left text-sm text-muted" type="button" onClick={() => confirmCandidate(score)}>{score.nameEs ?? score.cardId.replaceAll("_", " ")} · {Math.round(score.confidence * 100)}%</button>)}
          </div>}
        </div>
      </GlassCard>
    </div>
  );
}
