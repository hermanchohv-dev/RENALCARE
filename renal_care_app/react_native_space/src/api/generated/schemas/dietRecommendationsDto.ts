// @ts-nocheck
import type { FluidRestrictionDto } from './fluidRestrictionDto';
import type { MineralsDto } from './mineralsDto';

export interface DietRecommendationsDto {
  modality: string;
  headline: string;
  fluidRestriction: FluidRestrictionDto;
  recommendedFoods: string[];
  foodsToAvoid: string[];
  minerals: MineralsDto;
  practicalTips: string[];
}
