const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { buildSync } = require("esbuild");
const Module = require("node:module");
const { importMap } = require("../scripts/prepare-map.cjs");
const { createTransportFixture } = require("./transport-fixture.cjs");
const compiled = buildSync({
  entryPoints: [resolve("src/transport/geometry.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
}).outputFiles[0].text;
const mod = new Module(resolve("src/transport/geometry.compiled.cjs"), module);
mod.filename = resolve("src/transport/geometry.compiled.cjs");
mod.paths = module.paths;
mod._compile(compiled, mod.filename);
const { alongRoute, projection } = mod.exports;
test("importación: identifica lugares y traza por una vía de sentido único", () => {
  const result = importMap(createTransportFixture());
  assert.equal(result.ready, true);
  assert.ok(result.route.length > 30);
  assert.ok(result.distanceMeters > 1500);
  assert.equal(result.streetNames[0], "Vía ficticia para tests");
});
test("no inventa lugares ni publica datos incompletos", () => {
  const missing = createTransportFixture();
  delete missing.elements[0].tags;
  assert.throws(() => importMap(missing), /No se han identificado/);
  assert.throws(
    () => importMap({ elements: [], remark: "timeout" }),
    /incompleta/,
  );
});
test("respeta calles privadas y sentidos de circulación", () => {
  const reversed = createTransportFixture();
  reversed.elements.at(-1).tags.oneway = "-1";
  assert.throws(() => importMap(reversed), /recorrido conectado/);
  const blocked = createTransportFixture();
  blocked.elements.at(-1).tags.access = "private";
  assert.throws(() => importMap(blocked), /vías aptas/);
});
test("avance proporcional a distancia, límites y proyección finita", () => {
  const route = [
    [-2.444, 42.462],
    [-2.443, 42.462],
    [-2.442, 42.462],
  ];
  assert.deepEqual(alongRoute(route, 0).point, route[0]);
  assert.deepEqual(alongRoute(route, 1).point, route[2]);
  assert.ok(Math.abs(alongRoute(route, 0.5).point[0] - route[1][0]) < 1e-8);
  const p = projection(route, 390, 340)(route[1]);
  assert.ok(p.every(Number.isFinite));
});
