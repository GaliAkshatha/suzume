# Suzume System Architecture

## 1. High-Level Architecture

Suzume uses a modular-monolith architecture. The frontend and backend are separate applications inside one pnpm workspace, while the backend owns the domain logic and database access.

```mermaid
flowchart TD
    Browser[Browser]
    Frontend[React SPA\nVite + TypeScript + Tailwind]
    APIClient[Frontend API Services]
    API[Express API]
    Auth[Auth + Validation Middleware]
    Routes[Domain Routes]
    Controllers[Controllers]
    Services[Domain Services]
    Prisma[Prisma Client]
    DB[(PostgreSQL / Supabase)]

    Browser --> Frontend
    Frontend --> APIClient
    APIClient --> API
    API --> Auth
    Auth --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
```

## 2. Domain Modules

```text
apps/api/src/modules/
├── auth/
├── companies/
├── applications/
├── rounds/
├── experiences/
├── questions/
├── learnings/
├── preparation/
├── dashboard/
├── calendar/
├── analytics/
└── extraction/
```

Each domain generally follows:

```text
routes → controller → service → Prisma
```

The controller is intentionally thin. Business rules and user ownership checks live in services.

## 3. Store Once, Derive Everywhere

The system avoids duplicated scheduling and analytics data.

```mermaid
flowchart LR
    Application[Application]
    Round[Round]
    Deadline[Application Deadline]
    Dashboard[Dashboard]
    Timeline[Company Timeline]
    Calendar[Calendar]
    Analytics[Analytics]

    Application --> Dashboard
    Application --> Timeline
    Application --> Analytics
    Round --> Dashboard
    Round --> Timeline
    Round --> Calendar
    Round --> Analytics
    Deadline --> Dashboard
    Deadline --> Calendar
```

There is no separate `Event` table. Calendar entries are derived from application deadlines and scheduled rounds.

## 4. Preparation Data Flow

```mermaid
flowchart TD
    Setup[Initial Preparation Setup]
    Progress[PreparationProgress]
    Logs[PreparationLog]
    Topics[PreparationTopic]
    Sources[PreparationSource]
    Activity[Preparation Activity Aggregation]
    Heatmap[Study Heatmap]
    Calendar[Study Calendar]
    Recent[Recent Topics]

    Setup --> Progress
    Topics --> Progress
    Topics --> Logs
    Logs --> Activity
    Activity --> Heatmap
    Activity --> Calendar
    Activity --> Recent
    Sources --> Progress
```

`PreparationProgress` stores the user's preparation state and initial assessment. `PreparationLog` is the dated journal of actual study activity. External preparation sources are kept separate from Suzume-owned study history.

## 5. Extraction Pipeline

```mermaid
flowchart LR
    Input[Raw Placement Text]
    Provider[ExtractionProvider]
    Result[Raw Extraction]
    Matching[Existing Application Matching]
    Review[Frontend Review]
    Write[Application / Round API]
    DB[(PostgreSQL)]

    Input --> Provider
    Provider --> Result
    Result --> Matching
    Matching --> Review
    Review -->|Confirm| Write
    Write --> DB
```

The extraction endpoint does not directly create database records. This keeps extraction safe and allows the same write path to be used for manual entry and future Gmail/WhatsApp integrations.

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as Express API
    participant DB as PostgreSQL

    B->>A: Login email + password
    A->>DB: Load user
    A->>A: Verify bcrypt password
    A->>DB: Store refresh-token hash
    A-->>B: Access token + httpOnly refresh cookie
    B->>A: API request with Bearer access token
    A->>A: Verify JWT
    A-->>B: Protected response
```

Access tokens are short-lived and held in frontend memory. Refresh tokens are stored in an HTTP-only cookie and persisted as hashes so sessions can be revoked.
