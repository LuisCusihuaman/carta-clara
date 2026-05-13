import type { VisionScore } from "@/workers/cardMatcher";

export type PhotoWorkerRequest = { type: "match"; imageBitmap?: ImageBitmap };
export type PhotoWorkerResponse = { type: "result"; scores: VisionScore[] };

self.onmessage = (event: MessageEvent<PhotoWorkerRequest>) => {
  if (event.data.type === "match") {
    self.postMessage({ type: "result", scores: [] } satisfies PhotoWorkerResponse);
  }
};
