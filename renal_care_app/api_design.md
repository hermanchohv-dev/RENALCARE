# RENAL-CARE — API Specification

Base URL: `/api`

All authenticated endpoints require `Authorization: Bearer <token>` header. 401 returned if invalid/missing.

## Auth Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/auth/login | {email: string (required), password: string (required)} | {token: string, user: {id: UUID, email: string, name: string}} | No |
| GET | /api/auth/me | — | {user: {id: UUID, email: string, name: string}} | Bearer |

Note: No signup endpoint — this is a demo app with pre-seeded users only. The login screen does not offer registration.

## Patient Endpoints

### GET /api/patients/me
Returns the authenticated patient's profile.

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/patients/me | — | PatientProfile (see below) | Bearer |

**PatientProfile response:**
```
{
  id: UUID,
  userId: UUID,
  fullName: string,
  age: integer,
  medicalRecordNumber: string,
  modality: "Hemodiálisis" | "Diálisis Peritoneal" | "Trasplante Renal",
  bloodType: string,
  primaryDiagnosis: string,
  treatmentStartDate: ISO8601,
  attendingDoctor: string,
  avatarInitials: string
}
```

### GET /api/patients/me/clinical-history
Returns clinical history including lab results, evolution data, and appointments.

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/patients/me/clinical-history | — | ClinicalHistory (see below) | Bearer |

**ClinicalHistory response:**
```
{
  primaryDiagnosis: string,
  treatmentStartDate: ISO8601,
  bloodType: string,
  attendingDoctor: string,
  latestLabs: {
    date: ISO8601,
    creatinine: { value: number, unit: string, status: "normal" | "alert" | "critical" },
    urea: { value: number, unit: string, status: "normal" | "alert" | "critical" },
    potassium: { value: number, unit: string, status: "normal" | "alert" | "critical" },
    phosphorus: { value: number, unit: string, status: "normal" | "alert" | "critical" },
    hemoglobin: { value: number, unit: string, status: "normal" | "alert" | "critical" }
  },
  labEvolution: {
    creatinine: { month: string, value: number }[],
    urea: { month: string, value: number }[],
    potassium: { month: string, value: number }[]
  },
  appointments: {
    id: UUID,
    date: ISO8601,
    time: string,
    type: string,
    doctor: string
  }[]
}
```

### GET /api/patients/me/treatment
Returns treatment details based on patient modality.

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/patients/me/treatment | — | TreatmentInfo (see below) | Bearer |

**TreatmentInfo response:**
```
{
  modality: "Hemodiálisis" | "Diálisis Peritoneal" | "Trasplante Renal",
  hemodialysis: {
    schedule: { day: string, time: string }[],
    sessionDuration: string,
    vascularAccess: { type: string, location: string, datePlaced: ISO8601 },
    dryWeight: string
  } | null,
  peritonealDialysis: {
    type: string,
    exchanges: { time: string, volume: string, dwellTime: string }[],
    solutions: string[]
  } | null,
  transplant: {
    transplantDate: ISO8601,
    donorType: string,
    medications: { name: string, dose: string, frequency: string }[],
    nextReview: ISO8601
  } | null
}
```
Only the field matching the patient's modality is non-null.

### GET /api/patients/me/diet
Returns dietary recommendations for the patient's modality.

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/patients/me/diet | — | DietRecommendations (see below) | Bearer |

**DietRecommendations response:**
```
{
  modality: string,
  headline: string,
  fluidRestriction: {
    dailyLimit: string,
    tips: string[]
  },
  recommendedFoods: string[],
  foodsToAvoid: string[],
  minerals: {
    potassium: { limit: string, tips: string[], foodExamples: string[] },
    phosphorus: { limit: string, tips: string[], foodExamples: string[] },
    sodium: { limit: string, tips: string[], foodExamples: string[] }
  },
  practicalTips: string[]
}
```

### GET /api/patients/me/ambulance
Returns simulated ambulance status. Only meaningful for HD patients.

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/patients/me/ambulance | — | AmbulanceStatus (see below) | Bearer |

**AmbulanceStatus response:**
```
{
  available: boolean,
  status: "en_camino" | "llegando" | "en_hospital" | "no_disponible",
  estimatedMinutes: integer,
  distanceKm: number,
  hospitalLocation: { lat: number, lng: number },
  ambulanceLocation: { lat: number, lng: number },
  waypoints: { lat: number, lng: number }[]
}
```
If patient modality is not Hemodiálisis, returns `{ available: false, status: "no_disponible", estimatedMinutes: 0, distanceKm: 0, hospitalLocation: {...}, ambulanceLocation: {...}, waypoints: [] }`.

## Contact Messages

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/contact-messages | {subject: string (required), message: string (required)} | {id: UUID, subject: string, message: string, status: "enviado", createdAt: ISO8601} | Bearer |
| GET | /api/contact-messages | — | {items: ContactMessage[]} | Bearer |

**ContactMessage:**
```
{
  id: UUID,
  subject: string,
  message: string,
  status: "enviado" | "leído" | "respondido",
  createdAt: ISO8601
}
```

The POST endpoint simulates sending to contactonefrologia@riojasalud.es (no actual email sent in demo). It stores the message and returns success.
