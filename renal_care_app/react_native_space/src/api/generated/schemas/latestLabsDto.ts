// @ts-nocheck
import type { LabValueDto } from './labValueDto';

export interface LatestLabsDto {
  date: string;
  creatinine: LabValueDto;
  urea: LabValueDto;
  potassium: LabValueDto;
  phosphorus: LabValueDto;
  hemoglobin: LabValueDto;
}
