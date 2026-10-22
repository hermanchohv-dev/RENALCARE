/** Datos ficticios de presentación. No se exportan bases de datos de pacientes. */
import diets from './diet.json';
import { transportMap } from '../transport/mapData';
import type {
  PatientProfileDto, ClinicalHistoryDto, TreatmentInfoDto,
  DietRecommendationsDto, AmbulanceStatusDto,
} from '../api/generated/schemas';

export const DEMO_PROFILES: PatientProfileDto[] = [
  { id: 'demo-herman', userId: 'demo-herman', fullName: 'Herman · Paciente ficticio', age: 48,
    medicalRecordNumber: 'DEMO-001', modality: 'Hemodiálisis', bloodType: 'A+',
    primaryDiagnosis: 'Enfermedad renal crónica estadio 5 · Caso ficticio',
    treatmentStartDate: '2022-03-15T12:00:00.000Z', attendingDoctor: 'Equipo demo de Nefrología', avatarInitials: 'HD' },
  { id: 'demo-maria', userId: 'demo-maria', fullName: 'María · Paciente ficticia', age: 62,
    medicalRecordNumber: 'DEMO-002', modality: 'Diálisis Peritoneal', bloodType: 'O+',
    primaryDiagnosis: 'Enfermedad renal crónica estadio 5 · Caso ficticio',
    treatmentStartDate: '2023-01-10T12:00:00.000Z', attendingDoctor: 'Equipo demo de Nefrología', avatarInitials: 'MD' },
  { id: 'demo-carlos', userId: 'demo-carlos', fullName: 'Carlos · Paciente ficticio', age: 35,
    medicalRecordNumber: 'DEMO-003', modality: 'Trasplante Renal', bloodType: 'B+',
    primaryDiagnosis: 'Trasplante renal · Caso ficticio',
    treatmentStartDate: '2021-06-20T12:00:00.000Z', attendingDoctor: 'Equipo demo de Nefrología', avatarInitials: 'CD' },
];
export const DEMO_EMAILS = ['herman@demo.com', 'maria@demo.com', 'carlos@demo.com'];

const labSeries = [
  [[9.1,160,5.4,6.2,10.1],[8.8,155,5.3,6,10.2],[8.5,150,5.2,5.9,10.3],[8.6,148,5,5.7,10.4],[8.4,147,5.1,5.9,10.4],[8.2,145,5.1,5.8,10.5]],
  [[6.5,120,4.2,5,11],[6.3,118,4.1,4.9,11.1],[6.4,115,4,4.8,11.2],[6.2,112,3.9,4.7,11.3],[6.1,110,4,4.6,11.4],[6,108,4.1,4.5,11.5]],
  [[1.5,45,4.5,3.2,13],[1.4,43,4.4,3.1,13.2],[1.3,42,4.3,3,13.5],[1.4,40,4.2,3.1,13.4],[1.3,41,4.3,3,13.6],[1.2,39,4.2,2.9,13.8]],
];

export function clinicalHistory(index: number, now: Date): ClinicalHistoryDto {
  const p = DEMO_PROFILES[index];
  const rows = labSeries[index];
  const last = rows[5];
  const month = (i: number) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    .toLocaleDateString('es-ES', { month: 'short' });
  const point = (column: number) => rows.map((r, i) => ({ month: month(i), value: r[column] }));
  const future = (days: number) => { const d = new Date(now); d.setDate(d.getDate() + days); return d.toISOString(); };
  // No se clasifican resultados ficticios como alertas clínicas validadas.
  const lab = (value: number, unit: string) => ({ value, unit, status: 'demo' });
  return {
    primaryDiagnosis: p.primaryDiagnosis, treatmentStartDate: p.treatmentStartDate,
    bloodType: p.bloodType, attendingDoctor: p.attendingDoctor,
    latestLabs: { date: now.toISOString(), creatinine: lab(last[0], 'mg/dL'),
      urea: lab(last[1], 'mg/dL'), potassium: lab(last[2], 'mEq/L'),
      phosphorus: lab(last[3], 'mg/dL'), hemoglobin: lab(last[4], 'g/dL') },
    labEvolution: { creatinine: point(0), urea: point(1), potassium: point(2) },
    appointments: [
      { id: `${p.id}-cita-1`, date: future(7), time: '09:00', type: 'Consulta de demostración', doctor: p.attendingDoctor },
      { id: `${p.id}-cita-2`, date: future(14), time: '08:00', type: 'Analítica de demostración', doctor: 'Equipo demo' },
    ],
  };
}

export function treatment(index: number, now: Date): TreatmentInfoDto {
  const review = new Date(now); review.setDate(review.getDate() + 30);
  return {
    modality: DEMO_PROFILES[index].modality,
    hemodialysis: index === 0 ? {
      schedule: ['Lunes','Miércoles','Viernes'].map(day => ({ day, time: '08:00' })),
      sessionDuration: '4 horas', dryWeight: '72.5 kg',
      vascularAccess: { type: 'Fístula arteriovenosa', location: 'Brazo izquierdo', datePlaced: '2022-02-20T12:00:00.000Z' },
    } : null,
    peritonealDialysis: index === 1 ? {
      type: 'DPCA', solutions: ['Solución de demostración 1.36%', 'Solución de demostración 2.27%'],
      exchanges: ['07:00','12:00','17:00','22:00'].map(time => ({ time, volume: '2000 ml', dwellTime: '4 horas' })),
    } : null,
    transplant: index === 2 ? {
      transplantDate: '2023-09-15T12:00:00.000Z', donorType: 'Donante fallecido', nextReview: review.toISOString(),
      medications: [
        { name: 'Tacrolimus · Ejemplo', dose: '3 mg', frequency: 'Cada 12 horas' },
        { name: 'Micofenolato · Ejemplo', dose: '500 mg', frequency: 'Cada 12 horas' },
        { name: 'Prednisona · Ejemplo', dose: '5 mg', frequency: 'Una vez al día' },
      ],
    } : null,
  };
}

export function diet(index: number): DietRecommendationsDto {
  const key = ['hemodialisis', 'dialisis_peritoneal', 'trasplante_renal'][index] as keyof typeof diets.modalidades;
  const d = diets.modalidades[key];
  const potassiumTips = 'tecnicas_culinarias' in d.restriccion_potasio
    ? d.restriccion_potasio.tecnicas_culinarias
    : [d.restriccion_potasio.vigilancia].flat();
  return {
    modality: DEMO_PROFILES[index].modality, headline: d.descripcion,
    fluidRestriction: { dailyLimit: d.restriccion_liquidos.cantidad_diaria_ml, tips: d.restriccion_liquidos.consejos },
    recommendedFoods: d.alimentos_recomendados, foodsToAvoid: d.alimentos_a_evitar,
    minerals: {
      potassium: { limit: 'limite_diario_mg' in d.restriccion_potasio ? d.restriccion_potasio.limite_diario_mg : 'Individualizado',
        tips: potassiumTips, foodExamples: 'alimentos_altos_evitar' in d.restriccion_potasio ? d.restriccion_potasio.alimentos_altos_evitar : [] },
      phosphorus: { limit: 'limite_diario_mg' in d.restriccion_fosforo ? d.restriccion_fosforo.limite_diario_mg : 'Individualizado',
        tips: d.restriccion_fosforo.consejos, foodExamples: 'alimentos_altos_evitar' in d.restriccion_fosforo ? d.restriccion_fosforo.alimentos_altos_evitar : [] },
      sodium: { limit: d.restriccion_sodio.limite_diario_mg,
        tips: 'alternativas' in d.restriccion_sodio ? d.restriccion_sodio.alternativas : ['Seguir indicaciones individualizadas.'],
        foodExamples: d.restriccion_sodio.alimentos_evitar },
    },
    practicalTips: d.consejos_practicos,
  };
}

export function ambulance(index: number): AmbulanceStatusDto {
  if (transportMap.ready && transportMap.route.length > 1) {
    const route = transportMap.route.map(([lng, lat]) => ({ lat, lng }));
    const hospital =
      transportMap.end?.point ??
      transportMap.route[transportMap.route.length - 1];
    const hospitalLocation = { lat: hospital[1], lng: hospital[0] };
    return {
      available: index === 0,
      status: index === 0 ? "en_camino" : "no_disponible",
      estimatedMinutes:
        index === 0
          ? Math.max(
              5,
              Math.round((transportMap.distanceMeters / 1000 / 25) * 60),
            )
          : 0,
      distanceKm: index === 0 ? transportMap.distanceMeters / 1000 : 0,
      hospitalLocation,
      ambulanceLocation: index === 0 ? route[0] : hospitalLocation,
      waypoints: index === 0 ? route : [],
    };
  }
  const hospital = { lat: 42.4627, lng: -2.4445 };
  const waypoints = index === 0 ? [
    { lat: 42.452, lng: -2.46 }, { lat: 42.4545, lng: -2.457 },
    { lat: 42.4565, lng: -2.453 }, { lat: 42.4585, lng: -2.45 },
    { lat: 42.4605, lng: -2.447 }, hospital,
  ] : [];
  return { available: index === 0, status: index === 0 ? 'en_camino' : 'no_disponible',
    estimatedMinutes: index === 0 ? 15 : 0, distanceKm: index === 0 ? 3.2 : 0,
    hospitalLocation: hospital, ambulanceLocation: waypoints[0] ?? hospital, waypoints };
}
