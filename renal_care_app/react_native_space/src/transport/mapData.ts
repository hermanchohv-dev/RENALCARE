import imported from "./logrono-map.json";
import type { Point } from "./geometry";
export interface TransportMap {
  ready: boolean;
  testing?: boolean;
  attribution: string;
  start?: { name: string; point: Point };
  end?: { name: string; point: Point };
  roads: { kind: string; points: Point[] }[];
  areas: { kind: string; points: Point[] }[];
  labels: { name: string; point: Point }[];
  route: Point[];
  distanceMeters: number;
  streetNames: string[];
}
export const transportMap = imported as unknown as TransportMap;
