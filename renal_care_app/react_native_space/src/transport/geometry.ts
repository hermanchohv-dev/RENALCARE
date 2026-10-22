export type Point = [number, number]; // longitud, latitud
export function meters(a: Point, b: Point) {
  const rad = Math.PI / 180;
  return (
    Math.hypot(
      (a[0] - b[0]) * rad * Math.cos(((a[1] + b[1]) * rad) / 2),
      (a[1] - b[1]) * rad,
    ) * 6371000
  );
}
export function alongRoute(route: Point[], progress: number) {
  if (route.length < 2)
    return {
      point: route[0] ?? ([0, 0] as Point),
      next: route[0] ?? ([0, 0] as Point),
      trail: route,
    };
  const lengths = route.slice(1).map((point, i) => meters(route[i], point));
  let remaining =
    lengths.reduce((a, b) => a + b, 0) * Math.min(1, Math.max(0, progress));
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const fraction = lengths[i] ? Math.min(1, remaining / lengths[i]) : 0;
      const a = route[i],
        b = route[i + 1];
      const point: Point = [
        a[0] + (b[0] - a[0]) * fraction,
        a[1] + (b[1] - a[1]) * fraction,
      ];
      return { point, next: b, trail: [...route.slice(0, i + 1), point] };
    }
    remaining -= lengths[i];
  }
  return {
    point: route[route.length - 1],
    next: route[route.length - 1],
    trail: route,
  };
}
export function projection(points: Point[], width: number, height: number) {
  const latitude = points.reduce((s, p) => s + p[1], 0) / (points.length || 1);
  const cos = Math.cos((latitude * Math.PI) / 180);
  const xy = (p: Point) => [p[0] * 111320 * cos, -p[1] * 111320];
  const coordinates = points.map(xy);
  const xs = coordinates.map((p) => p[0]),
    ys = coordinates.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const scale = Math.min(
    (width - 76) / Math.max(maxX - minX, 300),
    (height - 88) / Math.max(maxY - minY, 300),
  );
  return (p: Point): Point => {
    const [x, y] = xy(p);
    return [
      (x - (minX + maxX) / 2) * scale + width / 2,
      (y - (minY + maxY) / 2) * scale + height / 2,
    ];
  };
}
