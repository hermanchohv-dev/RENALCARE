// @ts-nocheck
import type { AppointmentDto } from './appointmentDto';
import type { LabEvolutionDto } from './labEvolutionDto';
import type { LatestLabsDto } from './latestLabsDto';

export interface ClinicalHistoryDto {
  primaryDiagnosis: string;
  treatmentStartDate: string;
  bloodType: string;
  attendingDoctor: string;
  /** @nullable */
  latestLabs: LatestLabsDto | null;
  labEvolution: LabEvolutionDto;
  appointments: AppointmentDto[];
}
