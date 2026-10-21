// @ts-nocheck
import type { CoordinatesDto } from './coordinatesDto';

export interface AmbulanceStatusDto {
  available: boolean;
  status: string;
  estimatedMinutes: number;
  distanceKm: number;
  hospitalLocation: CoordinatesDto;
  ambulanceLocation: CoordinatesDto;
  waypoints: CoordinatesDto[];
}
