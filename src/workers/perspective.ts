export type NormalizedCrop<T> = {
  image: T;
  orientation: "upright" | "reversed" | "unknown";
};

export function normalizeCardCrop<T>(crop: T): NormalizedCrop<T> {
  return { image: crop, orientation: "unknown" };
}
