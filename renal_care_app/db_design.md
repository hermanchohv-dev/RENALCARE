# RENAL-CARE — Database Schema

PostgreSQL with Prisma ORM. UUIDs for all PKs.

## Entities

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| email | String | Unique, required |
| password | String | bcrypt hashed |
| name | String | Required |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

### Patient
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User, unique, required, ON DELETE CASCADE |
| fullName | String | Required |
| age | Int | Required |
| medicalRecordNumber | String | Unique, required |
| modality | String | Required, enum-like: "Hemodiálisis", "Diálisis Peritoneal", "Trasplante Renal" |
| bloodType | String | Required (e.g., "A+", "O-") |
| primaryDiagnosis | String | Required |
| treatmentStartDate | DateTime | Required |
| attendingDoctor | String | Required |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

Relation: User 1:1 Patient

### LabResult
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, required, ON DELETE CASCADE |
| date | DateTime | Required |
| creatinine | Float | Required |
| urea | Float | Required |
| potassium | Float | Required |
| phosphorus | Float | Required |
| hemoglobin | Float | Required |
| createdAt | DateTime | Auto |

Relation: Patient 1:N LabResult
Index: (patientId, date DESC)

### Appointment
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, required, ON DELETE CASCADE |
| date | DateTime | Required |
| time | String | Required (e.g., "09:30") |
| type | String | Required (e.g., "Consulta Nefrología", "Analítica", "Sesión HD") |
| doctor | String | Required |
| createdAt | DateTime | Auto |

Relation: Patient 1:N Appointment
Index: (patientId, date ASC)

### HemodialysisTreatment
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, unique, required, ON DELETE CASCADE |
| sessionDuration | String | Required (e.g., "4 horas") |
| vascularAccessType | String | Required (e.g., "Fístula arteriovenosa") |
| vascularAccessLocation | String | Required (e.g., "Brazo izquierdo") |
| vascularAccessDate | DateTime | Required |
| dryWeight | String | Required (e.g., "72.5 kg") |
| createdAt | DateTime | Auto |

Relation: Patient 1:0..1 HemodialysisTreatment

### HemodialysisSchedule
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| hemodialysisTreatmentId | UUID | FK to HemodialysisTreatment, required, ON DELETE CASCADE |
| day | String | Required (e.g., "Lunes") |
| time | String | Required (e.g., "08:00") |

Relation: HemodialysisTreatment 1:N HemodialysisSchedule

### PeritonealDialysisTreatment
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, unique, required, ON DELETE CASCADE |
| dialysisType | String | Required (e.g., "DPCA", "DPA") |
| solutions | String[] | Required (array of solution names) |
| createdAt | DateTime | Auto |

Relation: Patient 1:0..1 PeritonealDialysisTreatment

### PeritonealExchange
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| peritonealDialysisTreatmentId | UUID | FK to PeritonealDialysisTreatment, required, ON DELETE CASCADE |
| time | String | Required (e.g., "07:00") |
| volume | String | Required (e.g., "2000 ml") |
| dwellTime | String | Required (e.g., "4 horas") |

Relation: PeritonealDialysisTreatment 1:N PeritonealExchange

### TransplantTreatment
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, unique, required, ON DELETE CASCADE |
| transplantDate | DateTime | Required |
| donorType | String | Required (e.g., "Donante cadáver", "Donante vivo") |
| nextReview | DateTime | Required |
| createdAt | DateTime | Auto |

Relation: Patient 1:0..1 TransplantTreatment

### TransplantMedication
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| transplantTreatmentId | UUID | FK to TransplantTreatment, required, ON DELETE CASCADE |
| name | String | Required (e.g., "Tacrolimus") |
| dose | String | Required (e.g., "3 mg") |
| frequency | String | Required (e.g., "Cada 12 horas") |

Relation: TransplantTreatment 1:N TransplantMedication

### DietRecommendation
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| modality | String | Unique, required (one record per modality) |
| headline | String | Required |
| fluidDailyLimit | String | Required |
| fluidTips | String[] | Required |
| recommendedFoods | String[] | Required |
| foodsToAvoid | String[] | Required |
| potassiumLimit | String | Required |
| potassiumTips | String[] | Required |
| potassiumFoodExamples | String[] | Required |
| phosphorusLimit | String | Required |
| phosphorusTips | String[] | Required |
| phosphorusFoodExamples | String[] | Required |
| sodiumLimit | String | Required |
| sodiumTips | String[] | Required |
| sodiumFoodExamples | String[] | Required |
| practicalTips | String[] | Required |
| createdAt | DateTime | Auto |

Index: (modality) unique

### ContactMessage
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| patientId | UUID | FK to Patient, required, ON DELETE CASCADE |
| subject | String | Required |
| message | String | Required (text) |
| status | String | Required, default "enviado" (values: "enviado", "leído", "respondido") |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

Relation: Patient 1:N ContactMessage
Index: (patientId, createdAt DESC)

## Seed Data

The database must be seeded with:

### Users (3 demo patients)
1. **Herman**: email=herman@demo.com, password=bcrypt("demo123"), name="Herman Hernández V."
2. **María**: email=maria@demo.com, password=bcrypt("demo123"), name="María López García"
3. **Carlos**: email=carlos@demo.com, password=bcrypt("demo123"), name="Carlos Ruiz Martín"

### Patients
1. **Herman**: fullName="Herman Hernández V.", age=48, medicalRecordNumber="HSP-2024-1847", modality="Hemodiálisis", bloodType="A+", primaryDiagnosis="Enfermedad Renal Crónica Estadio 5 - Nefropatía diabética", treatmentStartDate=2022-03-15, attendingDoctor="Dra. Ana Martínez Sáenz"
2. **María**: fullName="María López García", age=62, medicalRecordNumber="HSP-2024-2103", modality="Diálisis Peritoneal", bloodType="O+", primaryDiagnosis="Enfermedad Renal Crónica Estadio 5 - Nefroesclerosis hipertensiva", treatmentStartDate=2023-01-10, attendingDoctor="Dr. Javier Pérez Ruiz"
3. **Carlos**: fullName="Carlos Ruiz Martín", age=35, medicalRecordNumber="HSP-2024-0956", modality="Trasplante Renal", bloodType="B+", primaryDiagnosis="Enfermedad Renal Crónica Estadio 5 - Glomerulonefritis IgA", treatmentStartDate=2021-06-20, attendingDoctor="Dra. Laura Fernández Gil"

### Lab Results (6 months of data per patient)
Seed 6 LabResult records per patient with monthly dates and realistic values varying slightly month to month. Latest values for Herman: creatinine=8.2, urea=145, potassium=5.1, phosphorus=5.8, hemoglobin=10.5.

### Appointments (2-3 upcoming per patient)
Seed future-dated appointments.

### Treatment data
- Herman: HemodialysisTreatment + 3 HemodialysisSchedule entries (Lunes/Miércoles/Viernes, 08:00)
- María: PeritonealDialysisTreatment (DPCA) + 4 PeritonealExchange entries
- Carlos: TransplantTreatment (2023-09-15, donante cadáver) + 3 TransplantMedication entries (Tacrolimus, Micofenolato, Prednisona)

### Diet Recommendations (3 records, one per modality)
Seed from the renal diet data with comprehensive Spanish-language recommendations for each modality.
