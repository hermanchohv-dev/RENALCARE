/** Descarga única de datos OSM. La app publicada no usa esta API. */
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const TARGET = path.join(ROOT, "src/transport/logrono-map.json");
const SOURCE = "https://overpass-api.de/api/interpreter";

function distance(a, b) {
  const rad = Math.PI / 180;
  const lat = ((a[1] + b[1]) * rad) / 2;
  return (
    Math.hypot((a[0] - b[0]) * rad * Math.cos(lat), (a[1] - b[1]) * rad) *
    6371000
  );
}
const driveable = new Set([
  "motorway",
  "motorway_link",
  "trunk",
  "trunk_link",
  "primary",
  "primary_link",
  "secondary",
  "secondary_link",
  "tertiary",
  "tertiary_link",
  "unclassified",
  "residential",
  "living_street",
  "service",
]);
function importMap(data, fetchedAt = new Date().toISOString()) {
  if (!Array.isArray(data.elements) || data.remark)
    throw new Error(
      "Respuesta de Overpass incompleta: " + (data.remark ?? "sin elementos"),
    );
  const nodes = new Map(
    data.elements
      .filter(
        (e) =>
          e.type === "node" && Number.isFinite(e.lat) && Number.isFinite(e.lon),
      )
      .map((e) => [e.id, [e.lon, e.lat]]),
  );
  const waysById = new Map(
    data.elements.filter((e) => e.type === "way").map((e) => [e.id, e]),
  );
  const coordinates = (e) => {
    if (e.type === "node") return [nodes.get(e.id)].filter(Boolean);
    if (e.type === "relation")
      return (e.members ?? []).flatMap((member) =>
        member.type === "way" && waysById.has(member.ref)
          ? coordinates(waysById.get(member.ref))
          : [],
      );
    return (e.nodes ?? []).map((id) => nodes.get(id)).filter(Boolean);
  };
  const center = (e) => {
    const points = coordinates(e);
    if (!points.length) return null;
    return [
      points.reduce((s, p) => s + p[0], 0) / points.length,
      points.reduce((s, p) => s + p[1], 0) / points.length,
    ];
  };
  const es = data.elements;
  const startCandidates = es.filter(
    (e) => /espol[oó]n/i.test(e.tags?.name ?? "") && coordinates(e).length,
  );
  const startFeature =
    startCandidates.find((e) => e.tags?.leisure === "park") ??
    startCandidates.find((e) => /paseo|parque/i.test(e.tags?.name ?? "")) ??
    startCandidates[0];
  const endFeature = es.find(
    (e) =>
      e.tags?.amenity === "hospital" &&
      /san pedro/i.test(e.tags?.name ?? "") &&
      coordinates(e).length,
  );
  if (!startFeature || !endFeature)
    throw new Error(
      "No se han identificado el Espolón y el Hospital San Pedro en los datos. No se inventarán posiciones.",
    );
  const start = center(startFeature),
    end = center(endFeature);
  if (distance(start, end) < 500 || distance(start, end) > 7000)
    throw new Error("Distancia entre lugares inesperada: revisar los datos.");
  const graph = new Map();
  const roadByEdge = new Map();
  const add = (a, b, name) => {
    if (!nodes.has(a) || !nodes.has(b)) return;
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph
      .get(a)
      .push({ node: b, meters: distance(nodes.get(a), nodes.get(b)) });
    roadByEdge.set(`${a}:${b}`, name);
  };
  const ways = es.filter(
    (e) => e.type === "way" && e.tags?.highway && (e.nodes ?? []).length > 1,
  );
  for (const w of ways) {
    const t = w.tags;
    if (
      !driveable.has(t.highway) ||
      ["no", "private"].includes(t.access) ||
      ["no", "private"].includes(t.motor_vehicle) ||
      ["no", "private"].includes(t.motorcar)
    )
      continue;
    const one =
      t.oneway === "-1"
        ? -1
        : ["yes", "1", "true"].includes(t.oneway) ||
            (t.junction === "roundabout" && t.oneway !== "no")
          ? 1
          : 0;
    for (let i = 1; i < w.nodes.length; i++) {
      if (one >= 0) add(w.nodes[i - 1], w.nodes[i], t.name ?? "Vía sin nombre");
      if (one <= 0) add(w.nodes[i], w.nodes[i - 1], t.name ?? "Vía sin nombre");
    }
  }
  const nearest = (point) => {
    const candidates = [...graph.keys()]
      .sort(
        (a, b) => distance(nodes.get(a), point) - distance(nodes.get(b), point),
      )
      .slice(0, 12);
    if (!candidates.length)
      throw new Error("No hay vías aptas para vehículos en los datos.");
    const closest = distance(nodes.get(candidates[0]), point);
    return candidates.filter(
      (id) => distance(nodes.get(id), point) <= closest + 40,
    );
  };
  // Probar varios accesos próximos evita elegir una calle sin salida o un nodo aislado.
  const starts = nearest(start),
    ends = new Set(nearest(end));
  const costs = new Map(),
    previous = new Map(),
    pending = new Set();
  for (const node of starts) {
    costs.set(node, distance(nodes.get(node), start));
    pending.add(node);
  }
  const visited = new Set();
  while (pending.size) {
    let current;
    for (const id of pending)
      if (current === undefined || costs.get(id) < costs.get(current))
        current = id;
    pending.delete(current);
    visited.add(current);
    for (const edge of graph.get(current) ?? []) {
      if (visited.has(edge.node)) continue;
      const cost = costs.get(current) + edge.meters;
      if (cost < (costs.get(edge.node) ?? Infinity)) {
        costs.set(edge.node, cost);
        previous.set(edge.node, current);
        pending.add(edge.node);
      }
    }
  }
  const reachable = [...ends]
    .filter((id) => costs.has(id))
    .sort(
      (a, b) =>
        costs.get(a) +
        distance(nodes.get(a), end) -
        (costs.get(b) + distance(nodes.get(b), end)),
    );
  if (!reachable.length)
    throw new Error("No hay un recorrido conectado entre ambos lugares.");
  const chain = [reachable[0]];
  while (previous.has(chain[0])) chain.unshift(previous.get(chain[0]));
  const route = chain.map((id) => nodes.get(id));
  if (
    route.length < 3 ||
    distance(route[0], start) > 450 ||
    distance(route.at(-1), end) > 450
  )
    throw new Error(
      "No se ha encontrado un acceso vial suficientemente cercano a ambos lugares.",
    );
  const round = (p) => p.map((n) => Number(n.toFixed(6)));
  const roads = ways
    .map((w) => ({ kind: w.tags.highway, points: coordinates(w).map(round) }))
    .filter((w) => w.points.length > 1);
  const areas = es
    .filter(
      (e) =>
        e.type === "way" &&
        (e.tags?.leisure === "park" || e.tags?.amenity === "hospital"),
    )
    .map((e) => ({
      kind: e.tags?.amenity === "hospital" ? "hospital" : "park",
      points: coordinates(e).map(round),
    }))
    .filter((a) => a.points.length > 2);
  const names = new Set(),
    labels = [];
  for (const w of ways) {
    if (
      !w.tags.name ||
      names.has(w.tags.name) ||
      !["primary", "secondary", "tertiary"].includes(w.tags.highway)
    )
      continue;
    const points = coordinates(w);
    if (points.length < 3) continue;
    labels.push({
      name: w.tags.name,
      point: round(points[Math.floor(points.length / 2)]),
    });
    names.add(w.tags.name);
  }
  const streetNames = [];
  for (let i = 1; i < chain.length; i++) {
    const name = roadByEdge.get(`${chain[i - 1]}:${chain[i]}`);
    if (name && name !== streetNames.at(-1)) streetNames.push(name);
  }
  return {
    ready: true,
    source: "OpenStreetMap via Overpass API",
    sourceUrl: SOURCE,
    fetchedAt,
    dataSha256: createHash("sha256").update(JSON.stringify(data)).digest("hex"),
    attribution: "© OpenStreetMap contributors · ODbL 1.0",
    licenseUrl: "https://www.openstreetmap.org/copyright",
    note: "Recorrido ilustrativo por la red vial OSM y sentidos registrados. No considera tráfico, restricciones de giro ni accesos operativos del hospital. No usar como navegación.",
    bounds: [-2.455, 42.44, -2.408, 42.47],
    start: {
      name: "Parque del Espolón",
      point: round(start),
      osmType: startFeature.type,
      osmId: startFeature.id,
    },
    end: {
      name: "Hospital Universitario San Pedro",
      point: round(end),
      osmType: endFeature.type,
      osmId: endFeature.id,
    },
    roads,
    areas,
    labels,
    route: route.map(round),
    distanceMeters: Math.round(
      route.slice(1).reduce((sum, p, i) => sum + distance(route[i], p), 0),
    ),
    streetNames,
  };
}
async function main() {
  let raw;
  if (process.argv[2])
    raw = fs.readFileSync(path.resolve(process.argv[2]), "utf8");
  else {
    console.log("Descargando cartografía de Logroño desde OpenStreetMap…");
    const query = fs.readFileSync(
      path.join(__dirname, "logrono.overpass"),
      "utf8",
    );
    const response = await fetch(SOURCE, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "RENALCARE-offline-demo/1.0",
      },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok)
      throw new Error(
        `Overpass respondió ${response.status}; vuelve a intentar más tarde. No se ha modificado el mapa.`,
      );
    raw = await response.text();
  }
  const result = importMap(JSON.parse(raw));
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.writeFileSync(TARGET + ".tmp", JSON.stringify(result));
  fs.renameSync(TARGET + ".tmp", TARGET);
  console.log(
    `Mapa incorporado: ${result.roads.length} vías, recorrido ${(result.distanceMeters / 1000).toFixed(1)} km, ${result.route.length} puntos.`,
  );
  console.log("Salida:", result.start.point, "Destino:", result.end.point);
  console.log("Calles del recorrido:", result.streetNames.join(" → "));
  console.log(
    "Ya puedes ejecutar yarn build:pwa. La demo no necesitará conexión para mostrar este mapa.",
  );
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { importMap, distance };
