import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Read diet data
  const dietDataRaw = fs.readFileSync(
    path.resolve(__dirname, '../../renal_diet_recommendations.json'),
    'utf-8',
  );
  const dietData = JSON.parse(dietDataRaw);

  const hashedDemo = await bcrypt.hash('demo123', 10);
  const hashedAdmin = await bcrypt.hash('johndoe123', 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedAdmin,
      name: 'John Doe',
      role: 'admin',
    },
  });

  // ---- Herman (Hemodiálisis) ----
  const hermanUser = await prisma.user.upsert({
    where: { email: 'herman@demo.com' },
    update: {},
    create: {
      email: 'herman@demo.com',
      password: hashedDemo,
      name: 'Herman Hernández V.',
    },
  });

  const herman = await prisma.patient.upsert({
    where: { userId: hermanUser.id },
    update: {},
    create: {
      userId: hermanUser.id,
      fullName: 'Herman Hernández V.',
      age: 48,
      medicalRecordNumber: 'HSP-2024-1847',
      modality: 'Hemodiálisis',
      bloodType: 'A+',
      primaryDiagnosis: 'Enfermedad Renal Crónica Estadio 5 - Nefropatía diabética',
      treatmentStartDate: new Date('2022-03-15'),
      attendingDoctor: 'Dra. Ana Martínez Sáenz',
    },
  });

  // ---- María (Diálisis Peritoneal) ----
  const mariaUser = await prisma.user.upsert({
    where: { email: 'maria@demo.com' },
    update: {},
    create: {
      email: 'maria@demo.com',
      password: hashedDemo,
      name: 'María López García',
    },
  });

  const maria = await prisma.patient.upsert({
    where: { userId: mariaUser.id },
    update: {},
    create: {
      userId: mariaUser.id,
      fullName: 'María López García',
      age: 62,
      medicalRecordNumber: 'HSP-2024-2103',
      modality: 'Diálisis Peritoneal',
      bloodType: 'O+',
      primaryDiagnosis: 'Enfermedad Renal Crónica Estadio 5 - Nefroesclerosis hipertensiva',
      treatmentStartDate: new Date('2023-01-10'),
      attendingDoctor: 'Dr. Javier Pérez Ruiz',
    },
  });

  // ---- Carlos (Trasplante Renal) ----
  const carlosUser = await prisma.user.upsert({
    where: { email: 'carlos@demo.com' },
    update: {},
    create: {
      email: 'carlos@demo.com',
      password: hashedDemo,
      name: 'Carlos Ruiz Martín',
    },
  });

  const carlos = await prisma.patient.upsert({
    where: { userId: carlosUser.id },
    update: {},
    create: {
      userId: carlosUser.id,
      fullName: 'Carlos Ruiz Martín',
      age: 35,
      medicalRecordNumber: 'HSP-2024-0956',
      modality: 'Trasplante Renal',
      bloodType: 'B+',
      primaryDiagnosis: 'Enfermedad Renal Crónica Estadio 5 - Glomerulonefritis IgA',
      treatmentStartDate: new Date('2021-06-20'),
      attendingDoctor: 'Dra. Laura Fernández Gil',
    },
  });

  // ---- Lab Results (6 months each) ----
  const now = new Date();
  const months = [5, 4, 3, 2, 1, 0];

  const hermanLabs = [
    { creatinine: 9.1, urea: 160, potassium: 5.4, phosphorus: 6.2, hemoglobin: 10.1 },
    { creatinine: 8.8, urea: 155, potassium: 5.3, phosphorus: 6.0, hemoglobin: 10.2 },
    { creatinine: 8.5, urea: 150, potassium: 5.2, phosphorus: 5.9, hemoglobin: 10.3 },
    { creatinine: 8.6, urea: 148, potassium: 5.0, phosphorus: 5.7, hemoglobin: 10.4 },
    { creatinine: 8.4, urea: 147, potassium: 5.1, phosphorus: 5.9, hemoglobin: 10.4 },
    { creatinine: 8.2, urea: 145, potassium: 5.1, phosphorus: 5.8, hemoglobin: 10.5 },
  ];

  const mariaLabs = [
    { creatinine: 6.5, urea: 120, potassium: 4.2, phosphorus: 5.0, hemoglobin: 11.0 },
    { creatinine: 6.3, urea: 118, potassium: 4.1, phosphorus: 4.9, hemoglobin: 11.1 },
    { creatinine: 6.4, urea: 115, potassium: 4.0, phosphorus: 4.8, hemoglobin: 11.2 },
    { creatinine: 6.2, urea: 112, potassium: 3.9, phosphorus: 4.7, hemoglobin: 11.3 },
    { creatinine: 6.1, urea: 110, potassium: 4.0, phosphorus: 4.6, hemoglobin: 11.4 },
    { creatinine: 6.0, urea: 108, potassium: 4.1, phosphorus: 4.5, hemoglobin: 11.5 },
  ];

  const carlosLabs = [
    { creatinine: 1.5, urea: 45, potassium: 4.5, phosphorus: 3.2, hemoglobin: 13.0 },
    { creatinine: 1.4, urea: 43, potassium: 4.4, phosphorus: 3.1, hemoglobin: 13.2 },
    { creatinine: 1.3, urea: 42, potassium: 4.3, phosphorus: 3.0, hemoglobin: 13.5 },
    { creatinine: 1.4, urea: 40, potassium: 4.2, phosphorus: 3.1, hemoglobin: 13.4 },
    { creatinine: 1.3, urea: 41, potassium: 4.3, phosphorus: 3.0, hemoglobin: 13.6 },
    { creatinine: 1.2, urea: 39, potassium: 4.2, phosphorus: 2.9, hemoglobin: 13.8 },
  ];

  for (const [pId, labs] of [
    [herman.id, hermanLabs],
    [maria.id, mariaLabs],
    [carlos.id, carlosLabs],
  ] as const) {
    for (let i = 0; i < months.length; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - months[i], 15);
      const l = (labs as any)[i];
      // Use upsert-style: just create if not exists based on unique check
      const existing = await prisma.lab_result.findFirst({
        where: { patientId: pId, date: d },
      });
      if (!existing) {
        await prisma.lab_result.create({
          data: {
            patientId: pId,
            date: d,
            creatinine: l.creatinine,
            urea: l.urea,
            potassium: l.potassium,
            phosphorus: l.phosphorus,
            hemoglobin: l.hemoglobin,
          },
        });
      }
    }
  }

  // ---- Appointments ----
  const futureAppointments = [
    { patientId: herman.id, daysAhead: 7, time: '09:00', type: 'Consulta Nefrología', doctor: 'Dra. Ana Martínez Sáenz' },
    { patientId: herman.id, daysAhead: 14, time: '08:00', type: 'Analítica', doctor: 'Enfermería HD' },
    { patientId: herman.id, daysAhead: 30, time: '10:30', type: 'Sesión HD - Revisión', doctor: 'Dra. Ana Martínez Sáenz' },
    { patientId: maria.id, daysAhead: 10, time: '11:00', type: 'Consulta Nefrología', doctor: 'Dr. Javier Pérez Ruiz' },
    { patientId: maria.id, daysAhead: 21, time: '09:30', type: 'Analítica', doctor: 'Enfermería DP' },
    { patientId: carlos.id, daysAhead: 5, time: '10:00', type: 'Consulta Trasplante', doctor: 'Dra. Laura Fernández Gil' },
    { patientId: carlos.id, daysAhead: 15, time: '08:30', type: 'Analítica', doctor: 'Laboratorio' },
    { patientId: carlos.id, daysAhead: 45, time: '12:00', type: 'Ecografía Renal', doctor: 'Dr. Radiología' },
  ];

  for (const apt of futureAppointments) {
    const aptDate = new Date(now);
    aptDate.setDate(aptDate.getDate() + apt.daysAhead);
    const existing = await prisma.appointment.findFirst({
      where: { patientId: apt.patientId, type: apt.type, time: apt.time },
    });
    if (!existing) {
      await prisma.appointment.create({
        data: {
          patientId: apt.patientId,
          date: aptDate,
          time: apt.time,
          type: apt.type,
          doctor: apt.doctor,
        },
      });
    }
  }

  // ---- HD Treatment (Herman) ----
  const existingHD = await prisma.hemodialysis_treatment.findUnique({ where: { patientId: herman.id } });
  if (!existingHD) {
    await prisma.hemodialysis_treatment.create({
      data: {
        patientId: herman.id,
        sessionDuration: '4 horas',
        vascularAccessType: 'Fístula arteriovenosa',
        vascularAccessLocation: 'Brazo izquierdo',
        vascularAccessDate: new Date('2022-02-20'),
        dryWeight: '72.5 kg',
        schedule: {
          create: [
            { day: 'Lunes', time: '08:00' },
            { day: 'Miércoles', time: '08:00' },
            { day: 'Viernes', time: '08:00' },
          ],
        },
      },
    });
  }

  // ---- PD Treatment (María) ----
  const existingPD = await prisma.peritoneal_treatment.findUnique({ where: { patientId: maria.id } });
  if (!existingPD) {
    await prisma.peritoneal_treatment.create({
      data: {
        patientId: maria.id,
        dialysisType: 'DPCA',
        solutions: ['Dianeal PD4 1.36%', 'Dianeal PD4 2.27%', 'Extraneal (Icodextrina)'],
        exchanges: {
          create: [
            { time: '07:00', volume: '2000 ml', dwellTime: '4 horas' },
            { time: '12:00', volume: '2000 ml', dwellTime: '4 horas' },
            { time: '17:00', volume: '2000 ml', dwellTime: '4 horas' },
            { time: '22:00', volume: '2500 ml', dwellTime: '8 horas (nocturno)' },
          ],
        },
      },
    });
  }

  // ---- Transplant Treatment (Carlos) ----
  const existingTX = await prisma.transplant_treatment.findUnique({ where: { patientId: carlos.id } });
  if (!existingTX) {
    await prisma.transplant_treatment.create({
      data: {
        patientId: carlos.id,
        transplantDate: new Date('2023-09-15'),
        donorType: 'Donante cadáver',
        nextReview: new Date(now.getFullYear(), now.getMonth() + 2, 10),
        medications: {
          create: [
            { name: 'Tacrolimus (Prograf)', dose: '3 mg', frequency: 'Cada 12 horas' },
            { name: 'Micofenolato mofetilo (CellCept)', dose: '500 mg', frequency: 'Cada 12 horas' },
            { name: 'Prednisona', dose: '5 mg', frequency: 'Una vez al día' },
          ],
        },
      },
    });
  }

  // ---- Diet Recommendations ----
  const hd = dietData.modalidades.hemodialisis;
  const dp = dietData.modalidades.dialisis_peritoneal;
  const tx = dietData.modalidades.trasplante_renal;

  await prisma.diet_recommendation.upsert({
    where: { modality: 'Hemodiálisis' },
    update: {},
    create: {
      modality: 'Hemodiálisis',
      headline: hd.descripcion,
      fluidDailyLimit: hd.restriccion_liquidos.cantidad_diaria_ml,
      fluidTips: hd.restriccion_liquidos.consejos,
      recommendedFoods: hd.alimentos_recomendados,
      foodsToAvoid: hd.alimentos_a_evitar,
      potassiumLimit: hd.restriccion_potasio.limite_diario_mg,
      potassiumTips: hd.restriccion_potasio.tecnicas_culinarias,
      potassiumFoodExamples: hd.restriccion_potasio.alimentos_altos_evitar,
      phosphorusLimit: hd.restriccion_fosforo.limite_diario_mg,
      phosphorusTips: hd.restriccion_fosforo.consejos,
      phosphorusFoodExamples: hd.restriccion_fosforo.alimentos_altos_evitar,
      sodiumLimit: hd.restriccion_sodio.limite_diario_mg,
      sodiumTips: hd.restriccion_sodio.alternativas,
      sodiumFoodExamples: hd.restriccion_sodio.alimentos_evitar,
      practicalTips: hd.consejos_practicos,
    },
  });

  await prisma.diet_recommendation.upsert({
    where: { modality: 'Diálisis Peritoneal' },
    update: {},
    create: {
      modality: 'Diálisis Peritoneal',
      headline: dp.descripcion,
      fluidDailyLimit: dp.restriccion_liquidos.cantidad_diaria_ml,
      fluidTips: dp.restriccion_liquidos.consejos,
      recommendedFoods: dp.alimentos_recomendados,
      foodsToAvoid: dp.alimentos_a_evitar,
      potassiumLimit: dp.restriccion_potasio.limite_diario_mg,
      potassiumTips: dp.restriccion_potasio.vigilancia,
      potassiumFoodExamples: [],
      phosphorusLimit: dp.restriccion_fosforo.limite_diario_mg,
      phosphorusTips: dp.restriccion_fosforo.consejos,
      phosphorusFoodExamples: dp.restriccion_fosforo.alimentos_altos_evitar,
      sodiumLimit: dp.restriccion_sodio.limite_diario_mg,
      sodiumTips: [dp.restriccion_sodio.importancia],
      sodiumFoodExamples: dp.restriccion_sodio.alimentos_evitar,
      practicalTips: dp.consejos_practicos,
    },
  });

  await prisma.diet_recommendation.upsert({
    where: { modality: 'Trasplante Renal' },
    update: {},
    create: {
      modality: 'Trasplante Renal',
      headline: tx.descripcion,
      fluidDailyLimit: tx.restriccion_liquidos.cantidad_diaria_ml,
      fluidTips: tx.restriccion_liquidos.consejos,
      recommendedFoods: tx.alimentos_recomendados,
      foodsToAvoid: tx.alimentos_a_evitar,
      potassiumLimit: tx.restriccion_potasio.limite_diario_mg ?? 'Sin restricción habitual',
      potassiumTips: [tx.restriccion_potasio.vigilancia],
      potassiumFoodExamples: [],
      phosphorusLimit: tx.restriccion_fosforo.limite_diario_mg ?? 'Sin restricción habitual',
      phosphorusTips: tx.restriccion_fosforo.consejos,
      phosphorusFoodExamples: [],
      sodiumLimit: tx.restriccion_sodio.limite_diario_mg,
      sodiumTips: [tx.restriccion_sodio.motivo],
      sodiumFoodExamples: tx.restriccion_sodio.alimentos_evitar,
      practicalTips: tx.consejos_practicos,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
