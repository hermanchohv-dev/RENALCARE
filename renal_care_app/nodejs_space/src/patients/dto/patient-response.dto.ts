import { ApiProperty } from '@nestjs/swagger';

export class PatientProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty() age!: number;
  @ApiProperty() medicalRecordNumber!: string;
  @ApiProperty() modality!: string;
  @ApiProperty() bloodType!: string;
  @ApiProperty() primaryDiagnosis!: string;
  @ApiProperty() treatmentStartDate!: string;
  @ApiProperty() attendingDoctor!: string;
  @ApiProperty() avatarInitials!: string;
}

export class LabValueDto {
  @ApiProperty() value!: number;
  @ApiProperty() unit!: string;
  @ApiProperty() status!: string;
}

export class LatestLabsDto {
  @ApiProperty() date!: string;
  @ApiProperty({ type: () => LabValueDto }) creatinine!: LabValueDto;
  @ApiProperty({ type: () => LabValueDto }) urea!: LabValueDto;
  @ApiProperty({ type: () => LabValueDto }) potassium!: LabValueDto;
  @ApiProperty({ type: () => LabValueDto }) phosphorus!: LabValueDto;
  @ApiProperty({ type: () => LabValueDto }) hemoglobin!: LabValueDto;
}

export class LabEvolutionPointDto {
  @ApiProperty() month!: string;
  @ApiProperty() value!: number;
}

export class LabEvolutionDto {
  @ApiProperty({ type: () => [LabEvolutionPointDto] }) creatinine!: LabEvolutionPointDto[];
  @ApiProperty({ type: () => [LabEvolutionPointDto] }) urea!: LabEvolutionPointDto[];
  @ApiProperty({ type: () => [LabEvolutionPointDto] }) potassium!: LabEvolutionPointDto[];
}

export class AppointmentDto {
  @ApiProperty() id!: string;
  @ApiProperty() date!: string;
  @ApiProperty() time!: string;
  @ApiProperty() type!: string;
  @ApiProperty() doctor!: string;
}

export class ClinicalHistoryDto {
  @ApiProperty() primaryDiagnosis!: string;
  @ApiProperty() treatmentStartDate!: string;
  @ApiProperty() bloodType!: string;
  @ApiProperty() attendingDoctor!: string;
  @ApiProperty({ type: () => LatestLabsDto, nullable: true }) latestLabs!: LatestLabsDto | null;
  @ApiProperty({ type: () => LabEvolutionDto }) labEvolution!: LabEvolutionDto;
  @ApiProperty({ type: () => [AppointmentDto] }) appointments!: AppointmentDto[];
}

export class ScheduleItemDto {
  @ApiProperty() day!: string;
  @ApiProperty() time!: string;
}

export class VascularAccessDto {
  @ApiProperty() type!: string;
  @ApiProperty() location!: string;
  @ApiProperty() datePlaced!: string;
}

export class HemodialysisDto {
  @ApiProperty({ type: () => [ScheduleItemDto] }) schedule!: ScheduleItemDto[];
  @ApiProperty() sessionDuration!: string;
  @ApiProperty({ type: () => VascularAccessDto }) vascularAccess!: VascularAccessDto;
  @ApiProperty() dryWeight!: string;
}

export class ExchangeDto {
  @ApiProperty() time!: string;
  @ApiProperty() volume!: string;
  @ApiProperty() dwellTime!: string;
}

export class PeritonealDialysisDto {
  @ApiProperty() type!: string;
  @ApiProperty({ type: () => [ExchangeDto] }) exchanges!: ExchangeDto[];
  @ApiProperty({ type: [String] }) solutions!: string[];
}

export class MedicationDto {
  @ApiProperty() name!: string;
  @ApiProperty() dose!: string;
  @ApiProperty() frequency!: string;
}

export class TransplantDto {
  @ApiProperty() transplantDate!: string;
  @ApiProperty() donorType!: string;
  @ApiProperty({ type: () => [MedicationDto] }) medications!: MedicationDto[];
  @ApiProperty() nextReview!: string;
}

export class TreatmentInfoDto {
  @ApiProperty() modality!: string;
  @ApiProperty({ type: () => HemodialysisDto, nullable: true }) hemodialysis!: HemodialysisDto | null;
  @ApiProperty({ type: () => PeritonealDialysisDto, nullable: true }) peritonealDialysis!: PeritonealDialysisDto | null;
  @ApiProperty({ type: () => TransplantDto, nullable: true }) transplant!: TransplantDto | null;
}

export class FluidRestrictionDto {
  @ApiProperty() dailyLimit!: string;
  @ApiProperty({ type: [String] }) tips!: string[];
}

export class MineralInfoDto {
  @ApiProperty() limit!: string;
  @ApiProperty({ type: [String] }) tips!: string[];
  @ApiProperty({ type: [String] }) foodExamples!: string[];
}

export class MineralsDto {
  @ApiProperty({ type: () => MineralInfoDto }) potassium!: MineralInfoDto;
  @ApiProperty({ type: () => MineralInfoDto }) phosphorus!: MineralInfoDto;
  @ApiProperty({ type: () => MineralInfoDto }) sodium!: MineralInfoDto;
}

export class DietRecommendationsDto {
  @ApiProperty() modality!: string;
  @ApiProperty() headline!: string;
  @ApiProperty({ type: () => FluidRestrictionDto }) fluidRestriction!: FluidRestrictionDto;
  @ApiProperty({ type: [String] }) recommendedFoods!: string[];
  @ApiProperty({ type: [String] }) foodsToAvoid!: string[];
  @ApiProperty({ type: () => MineralsDto }) minerals!: MineralsDto;
  @ApiProperty({ type: [String] }) practicalTips!: string[];
}

export class CoordinatesDto {
  @ApiProperty() lat!: number;
  @ApiProperty() lng!: number;
}

export class AmbulanceStatusDto {
  @ApiProperty() available!: boolean;
  @ApiProperty() status!: string;
  @ApiProperty() estimatedMinutes!: number;
  @ApiProperty() distanceKm!: number;
  @ApiProperty({ type: () => CoordinatesDto }) hospitalLocation!: CoordinatesDto;
  @ApiProperty({ type: () => CoordinatesDto }) ambulanceLocation!: CoordinatesDto;
  @ApiProperty({ type: () => [CoordinatesDto] }) waypoints!: CoordinatesDto[];
}
