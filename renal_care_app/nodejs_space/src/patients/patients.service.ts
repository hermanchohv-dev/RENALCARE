import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    const initials = patient.fullName
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
    return {
      id: patient.id,
      userId: patient.userId,
      fullName: patient.fullName,
      age: patient.age,
      medicalRecordNumber: patient.medicalRecordNumber,
      modality: patient.modality,
      bloodType: patient.bloodType,
      primaryDiagnosis: patient.primaryDiagnosis,
      treatmentStartDate: patient.treatmentStartDate.toISOString(),
      attendingDoctor: patient.attendingDoctor,
      avatarInitials: initials,
    };
  }

  async getClinicalHistory(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const labs = await this.prisma.lab_result.findMany({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' },
      take: 6,
    });

    const appointments = await this.prisma.appointment.findMany({
      where: { patientId: patient.id, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });

    const latest = labs[0];
    const getStatus = (val: number, low: number, high: number, critLow: number, critHigh: number): string => {
      if (val < critLow || val > critHigh) return 'critical';
      if (val < low || val > high) return 'alert';
      return 'normal';
    };

    const latestLabs = latest
      ? {
          date: latest.date.toISOString(),
          creatinine: { value: latest.creatinine, unit: 'mg/dL', status: getStatus(latest.creatinine, 0.7, 1.3, 0.5, 10) },
          urea: { value: latest.urea, unit: 'mg/dL', status: getStatus(latest.urea, 10, 50, 5, 200) },
          potassium: { value: latest.potassium, unit: 'mEq/L', status: getStatus(latest.potassium, 3.5, 5.0, 3.0, 6.0) },
          phosphorus: { value: latest.phosphorus, unit: 'mg/dL', status: getStatus(latest.phosphorus, 2.5, 4.5, 2.0, 7.0) },
          hemoglobin: { value: latest.hemoglobin, unit: 'g/dL', status: getStatus(latest.hemoglobin, 12.0, 17.0, 7.0, 20.0) },
        }
      : null;

    const sortedLabs = [...labs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return {
      primaryDiagnosis: patient.primaryDiagnosis,
      treatmentStartDate: patient.treatmentStartDate.toISOString(),
      bloodType: patient.bloodType,
      attendingDoctor: patient.attendingDoctor,
      latestLabs,
      labEvolution: {
        creatinine: sortedLabs.map((l) => ({ month: monthNames[l.date.getMonth()] ?? '', value: l.creatinine })),
        urea: sortedLabs.map((l) => ({ month: monthNames[l.date.getMonth()] ?? '', value: l.urea })),
        potassium: sortedLabs.map((l) => ({ month: monthNames[l.date.getMonth()] ?? '', value: l.potassium })),
      },
      appointments: appointments.map((a) => ({
        id: a.id,
        date: a.date.toISOString(),
        time: a.time,
        type: a.type,
        doctor: a.doctor,
      })),
    };
  }

  async getTreatment(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    let hemodialysis = null;
    let peritonealDialysis = null;
    let transplant = null;

    if (patient.modality === 'Hemodiálisis') {
      const hd = await this.prisma.hemodialysis_treatment.findUnique({
        where: { patientId: patient.id },
        include: { schedule: true },
      });
      if (hd) {
        hemodialysis = {
          schedule: hd.schedule.map((s) => ({ day: s.day, time: s.time })),
          sessionDuration: hd.sessionDuration,
          vascularAccess: {
            type: hd.vascularAccessType,
            location: hd.vascularAccessLocation,
            datePlaced: hd.vascularAccessDate.toISOString(),
          },
          dryWeight: hd.dryWeight,
        };
      }
    } else if (patient.modality === 'Diálisis Peritoneal') {
      const pd = await this.prisma.peritoneal_treatment.findUnique({
        where: { patientId: patient.id },
        include: { exchanges: true },
      });
      if (pd) {
        peritonealDialysis = {
          type: pd.dialysisType,
          exchanges: pd.exchanges.map((e) => ({
            time: e.time,
            volume: e.volume,
            dwellTime: e.dwellTime,
          })),
          solutions: pd.solutions,
        };
      }
    } else if (patient.modality === 'Trasplante Renal') {
      const tx = await this.prisma.transplant_treatment.findUnique({
        where: { patientId: patient.id },
        include: { medications: true },
      });
      if (tx) {
        transplant = {
          transplantDate: tx.transplantDate.toISOString(),
          donorType: tx.donorType,
          medications: tx.medications.map((m) => ({
            name: m.name,
            dose: m.dose,
            frequency: m.frequency,
          })),
          nextReview: tx.nextReview.toISOString(),
        };
      }
    }

    return {
      modality: patient.modality,
      hemodialysis,
      peritonealDialysis,
      transplant,
    };
  }

  async getDiet(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const diet = await this.prisma.diet_recommendation.findUnique({
      where: { modality: patient.modality },
    });
    if (!diet) throw new NotFoundException('Recomendaciones dietéticas no encontradas');

    return {
      modality: diet.modality,
      headline: diet.headline,
      fluidRestriction: {
        dailyLimit: diet.fluidDailyLimit,
        tips: diet.fluidTips,
      },
      recommendedFoods: diet.recommendedFoods,
      foodsToAvoid: diet.foodsToAvoid,
      minerals: {
        potassium: {
          limit: diet.potassiumLimit,
          tips: diet.potassiumTips,
          foodExamples: diet.potassiumFoodExamples,
        },
        phosphorus: {
          limit: diet.phosphorusLimit,
          tips: diet.phosphorusTips,
          foodExamples: diet.phosphorusFoodExamples,
        },
        sodium: {
          limit: diet.sodiumLimit,
          tips: diet.sodiumTips,
          foodExamples: diet.sodiumFoodExamples,
        },
      },
      practicalTips: diet.practicalTips,
    };
  }

  async getAmbulance(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const hospitalLat = 42.4627;
    const hospitalLng = -2.4445;

    if (patient.modality !== 'Hemodiálisis') {
      return {
        available: false,
        status: 'no_disponible',
        estimatedMinutes: 0,
        distanceKm: 0,
        hospitalLocation: { lat: hospitalLat, lng: hospitalLng },
        ambulanceLocation: { lat: hospitalLat, lng: hospitalLng },
        waypoints: [],
      };
    }

    // Simulate ambulance route near Logroño
    const startLat = 42.4520;
    const startLng = -2.4600;
    const waypoints = [
      { lat: 42.4520, lng: -2.4600 },
      { lat: 42.4545, lng: -2.4570 },
      { lat: 42.4565, lng: -2.4530 },
      { lat: 42.4585, lng: -2.4500 },
      { lat: 42.4605, lng: -2.4470 },
      { lat: hospitalLat, lng: hospitalLng },
    ];

    return {
      available: true,
      status: 'en_camino',
      estimatedMinutes: 15,
      distanceKm: 3.2,
      hospitalLocation: { lat: hospitalLat, lng: hospitalLng },
      ambulanceLocation: { lat: startLat, lng: startLng },
      waypoints,
    };
  }
}
