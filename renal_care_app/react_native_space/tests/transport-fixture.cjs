/** Red geométrica inventada EXCLUSIVAMENTE para pruebas. Nunca se publica. */
const { importMap } = require("../scripts/prepare-map.cjs");
function createTransportFixture() {
  const elements = [];
  for (let i = 0; i <= 40; i++)
    elements.push({
      type: "node",
      id: i + 1,
      lon: -2.444 + i * 0.0005,
      lat: 42.462 - i * 0.000275,
    });
  elements[0].tags = { name: "Parque del Espolón", leisure: "park" };
  elements[elements.length - 1].tags = {
    name: "Hospital San Pedro",
    amenity: "hospital",
  };
  elements.push({
    type: "way",
    id: 100,
    nodes: elements.map((e) => e.id),
    tags: {
      highway: "residential",
      name: "Vía ficticia para tests",
      oneway: "yes",
    },
  });
  return { elements };
}
function testMap() {
  return {
    ...importMap(createTransportFixture(), "2026-10-22T12:00:00Z"),
    testing: true,
  };
}
module.exports = { createTransportFixture, testMap };
