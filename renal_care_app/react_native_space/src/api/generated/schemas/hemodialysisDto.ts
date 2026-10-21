// @ts-nocheck
import type { ScheduleItemDto } from './scheduleItemDto';
import type { VascularAccessDto } from './vascularAccessDto';

export interface HemodialysisDto {
  schedule: ScheduleItemDto[];
  sessionDuration: string;
  vascularAccess: VascularAccessDto;
  dryWeight: string;
}
