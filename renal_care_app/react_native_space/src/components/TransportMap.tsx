import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";
import { transportMap as data } from "../transport/mapData";
import { alongRoute, projection, type Point } from "../transport/geometry";
import { AmbulanceVehicle } from "./AmbulanceVehicle";

const pathFor = (points: Point[], project: (p: Point) => Point) =>
  points
    .map((p, i) => {
      const [x, y] = project(p);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
const streets = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "residential",
  "unclassified",
  "living_street",
  "service",
]);
const BaseMap = memo(function BaseMap({
  project,
  width,
  height,
}: {
  project: (p: Point) => Point;
  width: number;
  height: number;
}) {
  const layers = useMemo(() => {
    const visible = (points: Point[]) => {
      const screen = points.map(project);
      return (
        screen.some(
          (p) =>
            p[0] >= -30 &&
            p[0] <= width + 30 &&
            p[1] >= -30 &&
            p[1] <= height + 30,
        ) ||
        (Math.min(...screen.map((p) => p[0])) < width &&
          Math.max(...screen.map((p) => p[0])) > 0 &&
          Math.min(...screen.map((p) => p[1])) < height &&
          Math.max(...screen.map((p) => p[1])) > 0)
      );
    };
    const groups: Record<string, string[]> = {
      major: [],
      local: [],
      minor: [],
      park: [],
      hospital: [],
    };
    for (const area of data.areas)
      if (visible(area.points))
        groups[area.kind === "park" ? "park" : "hospital"].push(
          pathFor(area.points, project) + "Z",
        );
    for (const road of data.roads) {
      if (!visible(road.points)) continue;
      const kind = [
        "motorway",
        "trunk",
        "primary",
        "secondary",
        "tertiary",
      ].includes(road.kind)
        ? "major"
        : streets.has(road.kind)
          ? "local"
          : "minor";
      groups[kind].push(pathFor(road.points, project));
    }
    const labels: { name: string; x: number; y: number }[] = [];
    const endpoints = data.route.length
      ? [project(data.route[0]), project(data.route[data.route.length - 1])]
      : [];
    const candidates = [...data.labels].sort(
      (a, b) =>
        Number(data.streetNames.includes(b.name)) -
        Number(data.streetNames.includes(a.name)),
    );
    for (const label of candidates) {
      const [x, y] = project(label.point),
        half = label.name.length * 2.3;
      if (x - half < 5 || x + half > width - 5 || y < 18 || y > height - 20)
        continue;
      if (endpoints.some((p) => Math.hypot(p[0] - x, p[1] - y) < 40)) continue;
      if (
        labels.some(
          (other) =>
            Math.abs(other.y - y) < 17 &&
            Math.abs(other.x - x) <
              (other.name.length + label.name.length) * 2.3 + 8,
        )
      )
        continue;
      labels.push({ name: label.name, x, y });
      if (labels.length === 12) break;
    }
    return {
      paths: Object.fromEntries(
        Object.entries(groups).map(([key, paths]) => [key, paths.join(" ")]),
      ),
      labels,
    };
  }, [project, width, height]);
  return (
    <G>
      <Path d={layers.paths.park} fill="#CDE7D4" stroke="none" />
      <Path d={layers.paths.hospital} fill="#E3DBF4" stroke="none" />
      <Path
        d={layers.paths.minor}
        fill="none"
        stroke="#D9E2DA"
        strokeWidth={1.5}
      />
      {(["major", "local"] as const).map((kind) => (
        <G key={kind}>
          <Path
            d={layers.paths[kind]}
            fill="none"
            stroke="#D1DBD7"
            strokeWidth={kind === "major" ? 7 : 4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={layers.paths[kind]}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={kind === "major" ? 5 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      ))}
      {layers.labels.map((label) => (
        <SvgText
          key={label.name}
          x={label.x}
          y={label.y}
          fill="#788C83"
          fontSize={9}
          textAnchor="middle"
        >
          {label.name}
        </SvgText>
      ))}
    </G>
  );
});
export function TransportMap({
  width,
  progress,
}: {
  width: number;
  progress: number;
}) {
  const height = 340;
  const frame = useMemo(
    () =>
      data.route.length
        ? [
            ...data.route,
            ...(data.start ? [data.start.point] : []),
            ...(data.end ? [data.end.point] : []),
          ]
        : ([
            [0, 0],
            [1, 1],
          ] as Point[]),
    [],
  );
  const project = useMemo(
    () => projection(frame, width, height),
    [frame, width],
  );
  if (!data.ready || data.route.length < 2)
    return (
      <View style={[styles.pending, { width, height }]}>
        <AmbulanceVehicle size={54} />
        <Text style={styles.pendingTitle}>
          Cartografía pendiente de preparar
        </Text>
        <Text style={styles.pendingText}>
          El mapa real del Espolón al Hospital San Pedro se incorporará antes de
          publicar esta versión.
        </Text>
      </View>
    );
  const position = alongRoute(data.route, progress);
  const [x, y] = project(position.point),
    [nx, ny] = project(position.next);
  const previous = project(data.route[Math.max(0, data.route.length - 2)]);
  const heading =
    progress >= 1
      ? (Math.atan2(x - previous[0], -(y - previous[1])) * 180) / Math.PI
      : (Math.atan2(nx - x, -(ny - y)) * 180) / Math.PI;
  const start = project(data.route[0]),
    end = project(data.route[data.route.length - 1]);
  return (
    <View style={[styles.map, { width, height }]} testID="transport-map">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <BaseMap project={project} width={width} height={height} />
        <Path
          d={pathFor(data.route, project)}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={pathFor(data.route, project)}
          fill="none"
          stroke="#A4C6F3"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={pathFor(position.trail, project)}
          fill="none"
          stroke="#287BE0"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={start[0]}
          cy={start[1]}
          r={6}
          fill="#FFFFFF"
          stroke="#208562"
          strokeWidth={3}
        />
        <Circle
          cx={end[0]}
          cy={end[1]}
          r={11}
          fill="#FFFFFF"
          stroke="#2E79C8"
          strokeWidth={2}
        />
        <Path
          d={`M${end[0] - 5} ${end[1]}h10M${end[0]} ${end[1] - 5}v10`}
          stroke="#2E79C8"
          strokeWidth={2.5}
        />
        <SvgText
          x={start[0]}
          y={start[1] + 20}
          fill="#245640"
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          El Espolón
        </SvgText>
        <SvgText
          x={end[0]}
          y={end[1] + 25}
          fill="#245075"
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          Hospital San Pedro
        </SvgText>
        <Circle cx={x} cy={y} r={26} fill="#438FF0" opacity={0.14} />
        <G transform={`translate(${x} ${y}) rotate(${heading})`}>
          <G transform="translate(-16 -24)">
            <AmbulanceVehicle size={32} />
          </G>
        </G>
      </Svg>
      {data.testing && (
        <Text style={styles.testLabel}>
          PRUEBA TÉCNICA · GEOMETRÍA FICTICIA
        </Text>
      )}
      <Text style={styles.attribution}>
        © OpenStreetMap contributors · ODbL
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  map: { backgroundColor: "#EDF2EB", borderRadius: 24, overflow: "hidden" },
  testLabel: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "#8A4E10",
    backgroundColor: "#FFF1D4",
    padding: 6,
    borderRadius: 6,
  },
  attribution: {
    position: "absolute",
    bottom: 5,
    right: 7,
    fontSize: 9,
    color: "#566B60",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 4,
  },
  pending: {
    backgroundColor: "#EAF1F8",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  pendingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#28445D",
    marginTop: 16,
    textAlign: "center",
  },
  pendingText: {
    fontSize: 13,
    color: "#526B80",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
});
