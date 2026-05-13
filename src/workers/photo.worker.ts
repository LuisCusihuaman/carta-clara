import type { CardSummary } from "@/data/cardTypes";
import { buildAverageHash, classifyConfidence, rankVisionScores, scoreImageSignature, type ImageSignature, type VisionMatchBand, type VisionScore } from "@/workers/cardMatcher";

export type PhotoWorkerRequest = { type: "match"; imageBitmap?: ImageBitmap; fileName?: string };
export type PhotoWorkerResponse =
  | { type: "progress"; message: string }
  | { type: "result"; band: VisionMatchBand; scores: VisionScore[] }
  | { type: "unavailable"; message: string }
  | { type: "error"; message: string };

type Template = CardSummary & { signature: ImageSignature };

let templatesPromise: Promise<Template[]> | undefined;

async function loadTemplates() {
  templatesPromise ??= fetch("/data/cards.summary.v1.json")
    .then((response) => response.json() as Promise<CardSummary[]>)
    .then(async (cards) => Promise.all(cards.map(async (card) => ({ ...card, signature: await signatureFromUrl(card.thumbnail).catch(() => ({ hash: "", samples: [] })) }))));
  return templatesPromise;
}

async function signatureFromUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const signature = signatureFromBitmap(bitmap);
  bitmap.close();
  return signature;
}

function signatureFromBitmap(bitmap: ImageBitmap): ImageSignature {
  const width = 24;
  const height = 36;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { hash: "", samples: [] };
  context.drawImage(bitmap, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  const samples: number[] = [];
  for (let index = 0; index < data.length; index += 4) {
    samples.push(Math.round((data[index]! * 0.299) + (data[index + 1]! * 0.587) + (data[index + 2]! * 0.114)));
  }
  return { hash: buildAverageHash(samples), samples };
}

async function matchImage(imageBitmap?: ImageBitmap, fileName?: string) {
  const templates = await loadTemplates();
  if (templates.length === 0) return { type: "unavailable", message: "No hay plantillas locales disponibles para comparar." } satisfies PhotoWorkerResponse;
  if (!imageBitmap && !fileName) return { type: "unavailable", message: "No pude leer la imagen. Prueba subir otra foto o busca manualmente." } satisfies PhotoWorkerResponse;
  const input = imageBitmap ? signatureFromBitmap(imageBitmap) : { hash: "", samples: [] };
  imageBitmap?.close();
  const scores = rankVisionScores(templates.map((template) => {
    const score = scoreImageSignature(template.id, input, template.signature, 0.72, fileName);
    return {
      ...score,
      nameEs: template.nameEs,
      thumbnail: template.thumbnail,
      oneLine: template.oneLineUpright
    };
  })).slice(0, 5);
  return { type: "result", band: classifyConfidence(scores), scores } satisfies PhotoWorkerResponse;
}

self.onmessage = (event: MessageEvent<PhotoWorkerRequest>) => {
  if (event.data.type === "match") {
    self.postMessage({ type: "progress", message: "Comparando imagen con plantillas locales..." } satisfies PhotoWorkerResponse);
    void matchImage(event.data.imageBitmap, event.data.fileName)
      .then((response) => self.postMessage(response))
      .catch(() => self.postMessage({ type: "error", message: "No pude procesar la imagen en este dispositivo." } satisfies PhotoWorkerResponse));
  }
};
