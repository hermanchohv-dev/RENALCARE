// @ts-nocheck
import type { MedicationDto } from './medicationDto';

export interface TransplantDto {
  transplantDate: string;
  donorType: string;
  medications: MedicationDto[];
  nextReview: string;
}
