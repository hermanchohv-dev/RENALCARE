// @ts-nocheck
import type { HemodialysisDto } from './hemodialysisDto';
import type { PeritonealDialysisDto } from './peritonealDialysisDto';
import type { TransplantDto } from './transplantDto';

export interface TreatmentInfoDto {
  modality: string;
  /** @nullable */
  hemodialysis: HemodialysisDto | null;
  /** @nullable */
  peritonealDialysis: PeritonealDialysisDto | null;
  /** @nullable */
  transplant: TransplantDto | null;
}
