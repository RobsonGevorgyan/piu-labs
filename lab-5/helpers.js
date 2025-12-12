export function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 75;
  const lightness = 65 + Math.floor(Math.random() * 15);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function makeId(prefix = 'shape') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const randomPart = Math.floor(Math.random() * 1e6)
    .toString(16)
    .padStart(5, '0');
  return `${prefix}-${Date.now().toString(16)}-${randomPart}`;
}

export function countByType(shapes) {
  return shapes.reduce(
    (acc, shape) => {
      if (shape.type === 'circle') acc.circle += 1;
      if (shape.type === 'square') acc.square += 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, square: 0, circle: 0 }
  );
}
