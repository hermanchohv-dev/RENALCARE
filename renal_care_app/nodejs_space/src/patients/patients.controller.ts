import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PatientsService } from './patients.service';
import {
  PatientProfileDto,
  ClinicalHistoryDto,
  TreatmentInfoDto,
  DietRecommendationsDto,
  AmbulanceStatusDto,
} from './dto/patient-response.dto';

@ApiTags('Patients')
@UseGuards(AuthGuard('jwt'))
@Controller('api/patients/me')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  async getProfile(@Req() req: Request): Promise<PatientProfileDto> {
    const user = req.user as { id: string };
    return this.patientsService.getProfile(user.id);
  }

  @Get('clinical-history')
  async getClinicalHistory(@Req() req: Request): Promise<ClinicalHistoryDto> {
    const user = req.user as { id: string };
    return this.patientsService.getClinicalHistory(user.id);
  }

  @Get('treatment')
  async getTreatment(@Req() req: Request): Promise<TreatmentInfoDto> {
    const user = req.user as { id: string };
    return this.patientsService.getTreatment(user.id);
  }

  @Get('diet')
  async getDiet(@Req() req: Request): Promise<DietRecommendationsDto> {
    const user = req.user as { id: string };
    return this.patientsService.getDiet(user.id);
  }

  @Get('ambulance')
  async getAmbulance(@Req() req: Request): Promise<AmbulanceStatusDto> {
    const user = req.user as { id: string };
    return this.patientsService.getAmbulance(user.id);
  }
}
