export type CardRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
  quality: number;
};

export function detectCardRectangles(width = 0, height = 0) {
  if (width <= 0 || height <= 0) return [] satisfies CardRectangle[];
  const cardWidth = Math.min(width * 0.72, height * 0.45);
  const cardHeight = cardWidth * 1.5;
  return [{
    x: Math.max(0, (width - cardWidth) / 2),
    y: Math.max(0, (height - cardHeight) / 2),
    width: cardWidth,
    height: cardHeight,
    quality: 0.55
  }];
}
