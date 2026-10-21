# RENAL-CARE — UX Specification

## Design Direction

- **Theme**: Light medical theme — warm off-whites (#F7F9FC, #EDF2F7) with soft blue-green medical palette
- **Primary color**: Medical Teal #0D9488 (trust, health)
- **Accent color**: Coral Vitality #F97316 (warmth, energy)
- **Secondary**: Soft Blue #3B82F6 (calm, clinical)
- **Surfaces**: White #FFFFFF cards on #F1F5F9 backgrounds
- **Text**: Dark Slate #1E293B (headings), #475569 (body), #94A3B8 (caption)
- **Error/Alert**: #EF4444
- **Success**: #10B981
- **Typography**: Google Fonts — `Nunito` for headings (bold, rounded, friendly-medical), `Source Sans 3` for body (clean, readable)
- **Type scale**: Display 32px → Heading 22px → Subheading 18px → Body 16px → Caption 13px
- **Language**: ALL UI text in Spanish
- **Backgrounds**: Subtle gradient from #F7F9FC to #E2E8F0, cards are white with shadow
- **Icons**: Medical-themed, using `MaterialCommunityIcons`

## Animation & Motion

- Splash: Logo fade-in + scale with pulse, upward swipe gesture indicator with bouncing chevron
- Screen transitions: smooth horizontal slide for stack pushes
- Dashboard cards: staggered fade-in on mount (100ms delay between cards)
- Button press: scale 0.97 spring + light haptic
- Map ambulance: animated marker moving along a path toward hospital
- Loading: skeleton shimmer placeholders
- Charts: animated line drawing on mount
- Respect reduced motion preferences
- Haptics: skip on web platform

## File Structure

```
app/
  _layout.tsx              # Root layout: AuthProvider wrapper, font loading, splash control
  index.tsx                # Splash/Welcome screen (unauthenticated entry)
  auth/
    _layout.tsx            # Auth stack layout: if isAuthenticated → <Redirect href="/tabs" />
    login.tsx              # Login screen
  tabs/
    _layout.tsx            # Tab layout: if !isAuthenticated → <Redirect href="/auth/login" />; renders <Tabs> with 2 tabs: Inicio, Perfil
    index.tsx              # Dashboard (Inicio tab)
    profile.tsx            # Perfil / Configuración tab (logout, notification settings)
  historia/
    index.tsx              # Mi Historia Clínica screen
  tratamiento/
    index.tsx              # Mi Tratamiento screen
  dieta/
    index.tsx              # Dieta screen
  ambulancia/
    index.tsx              # Mi Ambulancia screen (map + simulation)
  contacto/
    index.tsx              # Contacto Médico screen
```

## Screens

### 1. Splash / Welcome Screen (`app/index.tsx`)
- **Purpose**: Animated welcome screen, entry point
- **Layout**:
  - Full-screen gradient background (teal to soft blue)
  - Centered RENAL-CARE logo (large text-based logo with kidney icon from MaterialCommunityIcons `kidney`)
  - Subtitle: "Hospital Universitario San Pedro de Logroño"
  - Bottom area: bouncing chevron-up icon + text "Desliza hacia arriba para continuar"
- **Interactions**:
  - Swipe-up gesture or tap on chevron → navigates imperatively to `/auth/login`
  - Logo animates: fade-in (0→1, 800ms) then gentle pulse
- **Auth guard**: If `isAuthenticated` is true (checked via root `_layout.tsx`), this screen should still be visitable but the user can also navigate directly. The root layout does NOT auto-redirect from index — the splash is always the cold-start entry. The auth layout and tabs layout handle guarding.

### 2. Login Screen (`app/auth/login.tsx`)
- **Purpose**: Email/password authentication
- **Layout**:
  - Top: RENAL-CARE small logo + "Iniciar Sesión" heading
  - Form card (white, rounded 16px, shadow):
    - Email input (floating label "Correo electrónico", keyboard type email)
    - Password input (floating label "Contraseña", secure entry, eye toggle)
    - "Iniciar Sesión" gradient button [#0D9488 → #3B82F6]
  - Below form: "Versión Demo" badge + list of demo credentials:
    - herman@demo.com / demo123 — Hemodiálisis
    - maria@demo.com / demo123 — Diálisis Peritoneal
    - carlos@demo.com / demo123 — Trasplante Renal
  - Footer: Hospital name + logo
- **Interactions**:
  - Tap "Iniciar Sesión" → calls `login(email, password)` from AuthProvider. On success, AuthProvider state updates; the auth layout detects `isAuthenticated=true` and switches to tabs via `<Redirect>`.
  - Validation: email format, password min 4 chars. Error shake animation on invalid.
  - API error → red banner with message ("Credenciales incorrectas")
  - Loading state on button during API call

### 3. Dashboard (`app/tabs/index.tsx`)
- **Purpose**: Patient home screen with profile summary and navigation cards
- **Layout**:
  - **Header area** (teal gradient background, rounded bottom):
    - Avatar circle (initials-based, colored) + patient full name
    - "Nº Historia: XXXXX" caption
    - Modalidad badge (colored pill): "Hemodiálisis" (blue), "Diálisis Peritoneal" (green), "Trasplante Renal" (purple)
    - Age display
  - **Navigation cards grid** (2 columns, staggered fade-in):
    - "Mi Tratamiento" — icon: `medical-bag`, color teal
    - "Mi Historia Clínica" — icon: `file-document-outline`, color blue
    - "Dieta" — icon: `food-apple-outline`, color orange
    - "Mi Ambulancia" — icon: `ambulance`, color red (ONLY visible if patient modality is "Hemodiálisis")
    - "Contacto" — icon: `phone-message`, color green
  - Each card: white background, rounded 16px, icon + label, subtle shadow, press animation
- **Data needed**: Patient profile from GET /api/patients/me
- **Interactions**:
  - Tap card → push to corresponding screen (`/tratamiento`, `/historia`, `/dieta`, `/ambulancia`, `/contacto`)
  - Pull-to-refresh to reload patient data

### 4. Mi Historia Clínica (`app/historia/index.tsx`)
- **Purpose**: Display patient medical history and lab results
- **Layout**:
  - Back arrow header + title "Mi Historia Clínica"
  - **Section 1 — Datos Generales** (card):
    - Diagnóstico principal
    - Fecha inicio tratamiento
    - Grupo sanguíneo
    - Médico responsable
  - **Section 2 — Última Analítica** (card with date):
    - Row items with icon, label, value, unit, and color-coded status indicator (normal=green, alert=orange, critical=red):
      - Creatinina (mg/dL)
      - Urea (mg/dL)
      - Potasio (mEq/L)
      - Fósforo (mg/dL)
      - Hemoglobina (g/dL)
  - **Section 3 — Evolución** (card):
    - Line chart showing last 6 months of creatinine values (simple SVG line chart or react-native-chart-kit)
    - Toggle buttons to switch between creatinine/urea/potassium charts
  - **Section 4 — Próximas Citas** (card):
    - List of upcoming appointments with date, time, type, doctor
- **Data needed**: GET /api/patients/me/clinical-history
- **Interactions**: Scroll, tap chart toggles, pull-to-refresh

### 5. Mi Tratamiento (`app/tratamiento/index.tsx`)
- **Purpose**: Treatment details specific to patient's modality
- **Layout**:
  - Back arrow header + title "Mi Tratamiento"
  - Modality badge at top
  - **If Hemodiálisis**:
    - Card: Horario de sesiones (days + times table)
    - Card: Duración de sesión (e.g., "4 horas")
    - Card: Acceso vascular (type, location, date placed)
    - Card: Peso seco objetivo
  - **If Diálisis Peritoneal**:
    - Card: Tipo de diálisis (DPCA/DPA)
    - Card: Esquema de intercambios (table with times, volume, dwell time)
    - Card: Soluciones utilizadas
  - **If Trasplante Renal**:
    - Card: Fecha del trasplante
    - Card: Tipo de donante
    - Card: Medicación inmunosupresora (list with name, dose, frequency)
    - Card: Próxima revisión
- **Data needed**: GET /api/patients/me/treatment
- **Interactions**: Scroll, cards with subtle entry animation

### 6. Dieta (`app/dieta/index.tsx`)
- **Purpose**: Personalized dietary recommendations by modality
- **Layout**:
  - Back arrow header + title "Mi Dieta"
  - **Top summary card**: Modality-specific headline (e.g., "Recomendaciones para Hemodiálisis")
  - **Restricción de Líquidos card**: Daily limit, tips, icon 💧
  - **Alimentos Recomendados card**: Green-themed card with list of foods with checkmark icons
  - **Alimentos a Evitar card**: Red-themed card with list of foods with X icons
  - **Mineral cards** (expandable/collapsible):
    - Potasio: limit, tips, food examples
    - Fósforo: limit, tips, food examples
    - Sodio: limit, tips, food examples
  - **Tips Prácticos card**: Bulleted list of practical cooking/eating tips
- **Data needed**: GET /api/patients/me/diet
- **Interactions**: Scroll, expand/collapse mineral sections, cards with food icons

### 7. Mi Ambulancia (`app/ambulancia/index.tsx`)
- **Purpose**: Simulated ambulance tracking (HD patients only)
- **Guard**: If patient modality is not Hemodiálisis, show message "Este servicio solo está disponible para pacientes en Hemodiálisis" and back button
- **Layout**:
  - Back arrow header + title "Mi Ambulancia"
  - **Map area** (60% of screen): react-native-maps MapView centered on Hospital San Pedro de Logroño (42.4627, -2.4445)
    - Hospital marker (red cross icon)
    - Ambulance marker (ambulance icon) at simulated starting position
  - **Info panel** (bottom 40%, white card with rounded top):
    - Estado: "En camino" / "Llegando" / "En el hospital" with colored dot
    - Tiempo estimado: countdown (e.g., "12 minutos")
    - Distancia: "3.2 km"
    - "Simular Recorrido" button → starts ambulance animation along predefined route
- **Simulation**: On button press, ambulance marker moves along waypoints toward hospital over ~15 seconds, ETA counts down, status changes
- **Data needed**: GET /api/patients/me/ambulance (returns simulated ambulance status)
- **Interactions**: Tap simulate button, watch animation, map is pannable/zoomable

### 8. Contacto Médico (`app/contacto/index.tsx`)
- **Purpose**: Send medical queries to nephrology team
- **Layout**:
  - Back arrow header + title "Contacto Médico"
  - **Info card** (top):
    - "Servicio de Nefrología"
    - "Hospital Universitario San Pedro"
    - Email: contactonefrologia@riojasalud.es
    - Horario de respuesta: 08:00 - 15:00h
    - Icon: clock + envelope
  - **Form card**:
    - Asunto input (floating label)
    - Mensaje textarea (floating label, multiline, min 4 lines)
    - "Enviar Consulta" gradient button
  - **Previous messages** (below form): list of sent messages with date and status
- **Data needed**: POST /api/contact-messages, GET /api/contact-messages
- **Interactions**:
  - Tap "Enviar Consulta" → POST to API → success modal/overlay with checkmark animation + "Tu consulta ha sido enviada correctamente. Recibirás respuesta en horario de 08:00 a 15:00h."
  - Validation: subject required, message required (min 10 chars)
  - Loading state on button

### 9. Perfil / Configuración (`app/tabs/profile.tsx`)
- **Purpose**: Profile view, notification settings, logout
- **Layout**:
  - Header: Avatar + name + email
  - **Section: Mis Datos** (card):
    - Nombre, email, modalidad, Nº historia (read-only display)
  - **Section: Notificaciones** (card):
    - Toggle: Recordatorio de medicación (switch, default on)
    - Toggle: Recordatorio de citas (switch, default on)
    - Toggle: Recordatorio de dieta (switch, default off)
    - Caption: "Los recordatorios son simulados en esta versión demo"
  - **Section: Información** (card):
    - App version: "RENAL-CARE Demo v1.0"
    - Hospital: "H.U. San Pedro de Logroño"
  - **Cerrar Sesión** button (red outline, bottom): calls `logout()` from AuthProvider. AuthProvider state updates; tabs layout detects `isAuthenticated=false` and redirects to auth via `<Redirect>`.
- **Data needed**: Patient profile (already loaded), notification preferences local-only (AsyncStorage)
- **Interactions**: Toggle switches (local storage only for demo), logout button

## Navigation

- **Unauthenticated flow**: `index.tsx` (splash) → swipe/tap → `/auth/login` → login
- **Auth guard**: `app/auth/_layout.tsx` redirects to `/tabs` if authenticated. `app/tabs/_layout.tsx` redirects to `/auth/login` if not authenticated.
- **Authenticated flow**: Tabs layout with 2 tabs:
  - Tab 1: "Inicio" (icon: `home`) → Dashboard
  - Tab 2: "Perfil" (icon: `account-cog`) → Profile/Settings
- **Stack screens** (outside tabs, still auth-guarded by root layout checking auth state):
  - `/historia` — pushed from dashboard card
  - `/tratamiento` — pushed from dashboard card
  - `/dieta` — pushed from dashboard card
  - `/ambulancia` — pushed from dashboard card (only shown for HD)
  - `/contacto` — pushed from dashboard card
- All stack pushes use horizontal slide transition
- Back navigation via header back arrow (pop)

## Component Standards

- Cards: white (#FFFFFF), rounded 16px, shadow (elevation 2), padding 16px
- Gradient buttons: LinearGradient [#0D9488, #3B82F6], rounded 12px, height 48px
- Inputs: outlined style, rounded 8px, floating labels, teal focus color
- Status badges: pill shape, rounded 20px, colored background with white text
- Lab value rows: icon + label + value + unit + status dot (green/orange/red)
- Touch targets: minimum 44pt
- Accessibility: Spanish labels, contrast ≥ 4.5:1
- Empty states: friendly illustration + message in Spanish
- 8pt spacing grid throughout
