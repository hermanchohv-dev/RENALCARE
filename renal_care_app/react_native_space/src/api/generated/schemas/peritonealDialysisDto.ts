// @ts-nocheck
import type { ExchangeDto } from './exchangeDto';

export interface PeritonealDialysisDto {
  type: string;
  exchanges: ExchangeDto[];
  solutions: string[];
}
