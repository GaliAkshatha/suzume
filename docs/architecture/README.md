# suzume Architecture

## Overview

suzume is a modular monolith: a single React SPA talking to a single Express
API, backed by one PostgreSQL database via Prisma. There is no microservice
split, no message queue, and no cache layer — the domain doesn't need one at
this scale, and adding one would be pure ceremony.

## Request Flow

```
Frontend (React)
    ↓  fetch via services/api/*
Express Route
    ↓
Middleware (auth, validation)
    ↓
Controller  (thin — parses req, calls service, shapes res)
    ↓
Service     (business logic lives here)
    ↓
Prisma Client
    ↓
PostgreSQL
```

Controllers never talk to Prisma directly, and never contain business logic —
they exist purely to translate HTTP in and out of service calls. Services
never touch `req`/`res`. This keeps the domain logic testable and reusable
independent of HTTP.

## Backend Module Layout

Each domain in `apps/api/src/modules/<domain>/` generally contains:

```
<domain>.routes.ts       Express Router, wires middleware + controller
<domain>.controller.ts   Thin HTTP handlers
<domain>.service.ts      Business logic + Prisma queries
```

Ownership is enforced at the service layer: every query that touches a
user-scoped resource (applications, rounds, experiences, questions,
learnings, action items, preparation progress) filters by the authenticated
`userId` taken from the verified JWT — never from a client-supplied ID. This
is what prevents one user from reading or mutating another user's data.

## "Store Once, Derive Everywhere"

This is the central data design rule in suzume. There is exactly one source
of truth for scheduling data: the `Round.scheduledAt` and
`Application.deadline` fields. Nothing else stores a duplicate copy of a
date or event.

- **Dashboard** (`dashboard.service.ts`) computes upcoming events, active
  processes, and preparation overview by querying `Application` and `Round`
  directly at request time.
- **Calendar** (`calendar.service.ts`) does the same — it has no dedicated
  `Event` table. Every calendar entry is either a `Round.scheduledAt` or an
  `Application.deadline`, mapped into a uniform `CalendarEvent` shape.
- **Analytics** (`analytics.service.ts`) aggregates the same underlying
  `Application`, `Round`, `Question`, `Learning`, and `PreparationProgress`
  rows — no separate analytics/event-log table.

If you add a round to an application, it appears on the dashboard, the
company timeline, and the calendar immediately, because they're all reading
the same row.

## Data Model

```
User
 ├── Applications
 │     ├── Company (many-to-one)
 │     └── Rounds
 │           └── Experience (one-to-one)
 │                 └── Questions
 ├── Learnings
 │     └── ActionItems
 └── PreparationProgress
       └── PreparationTopic (many-to-one)
```

See `docs/database/schema.sql` for the full DDL (tables, enums, indexes, and
foreign keys with cascade behavior), or `apps/api/prisma/schema.prisma` for
the Prisma source of truth.

## Auth

JWT access tokens (15 min TTL) are returned in the response body and held in
memory on the frontend; they're attached as `Authorization: Bearer <token>`
on every request. Refresh tokens (7 day TTL) are stored in an httpOnly,
`SameSite=Lax` cookie scoped to `/api/auth`, and their hash (not the raw
token) is persisted in the `refresh_tokens` table so they can be revoked on
logout or rotation. Passwords are hashed with bcrypt (cost factor 12) and
never returned in any API response.

## Frontend Structure

- `pages/` — route-level components, one per URL.
- `features/` — domain-specific components that aren't full pages (forms,
  modals) grouped by the same domain boundaries as the backend.
- `components/ui`, `components/layout`, `components/feedback` — generic,
  reusable, domain-agnostic building blocks.
- `services/api/` — one module per backend domain (`applicationApi`,
  `roundApi`, etc.), all going through a single `client.ts` that handles
  auth headers and silent access-token refresh on 401.
- `app/providers/AuthProvider.tsx` — session state, backed by a silent
  refresh on load so a page reload doesn't log you out.

Server state (applications, rounds, etc.) is fetched per-page via a small
`useAsyncData` hook with explicit loading/error/reload states — deliberately
not duplicated into a global store, since the API is the source of truth and
each page's data needs are different enough that a shared cache would add
complexity without a clear payoff at this scale.

## Extraction Pipeline

`apps/api/src/modules/extraction/` turns unstructured text (a pasted email,
placement-cell notice, or message) into structured suggestions, without ever
writing to the database itself:

```
Raw Text -> ExtractionProvider.extract() -> RawExtraction
    -> extraction.service matches against the user's existing applications
    -> ExtractionResult (fields + confidences + suggested action)
    -> returned to the frontend for review
    -> frontend calls the SAME applicationApi / roundApi used by manual entry
```

This is a deliberate architectural choice: `POST /api/extraction/parse` is
read-only. It never calls `prisma.application.create` or
`prisma.round.create` itself. Once the user reviews and confirms, the
frontend calls the ordinary `applicationApi.create` / `applicationApi.update`
/ `roundApi.create` — the exact same functions the manual "Add Application"
form uses — so there is exactly one code path that writes applications and
rounds to the database, regardless of whether the data came from a form or
from pasted text.

`extraction.provider.ts` defines an `ExtractionProvider` interface with a
single `extract(text, context)` method. The shipped implementation
(`mockExtractionProvider`) is a deterministic regex-based parser chosen
specifically so the feature is fully testable and works with zero external
dependencies in local dev — it is intentionally conservative and returns
`null` rather than guessing when it isn't confident. `extraction.service.ts`
selects the provider via the `EXTRACTION_PROVIDER` environment variable
(defaulting to `mock`), so a real AI-backed provider can be added later
without touching the controller, routes, or frontend at all.

Every `Application` and `Round` carries a `source` field
(`MANUAL | PASTED_TEXT | GMAIL | WHATSAPP`) precisely so a future Gmail or
WhatsApp-forwarding integration can reuse this same pipeline — since the
extraction service only operates on plain text, it doesn't care whether that
text came from a paste box or an email body.

## Password Change & Reset

Mirrors the `RefreshToken` pattern already used for sessions: a
`PasswordResetToken` row stores only a hash of the reset token (never the
raw value), with an expiry and a `usedAt` marker so a token can't be
replayed. `requestPasswordReset` always behaves identically whether or not
the email matches an account, so the endpoint can't be used to enumerate
registered users. Both a successful password change and a successful reset
revoke every existing refresh token for that user — logging out all
sessions, since the old password could have been compromised.

Email delivery goes through the same provider-interface pattern as
extraction: `EmailProvider` has one real implementation shipped
(`consoleEmailProvider`), which logs the reset link instead of sending it —
enough to develop and test the flow without an email API key. Swap in a
real provider later via `EMAIL_PROVIDER` without touching the service logic
that calls it.

## Daily Preparation Log

`PreparationLog` is a separate, append-only journal from `PreparationProgress`
— deliberately not merged into it. `PreparationProgress` holds the topic's
running totals and self-assessed confidence (edited via the "Update Topic"
modal); `PreparationLog` holds dated entries of what was actually done in a
session (topic, questions solved, time spent, notes). Keeping them distinct
means a log entry never silently overwrites a manually-set progress number,
and the log itself doubles as a revision-notes journal independent of any
single topic's stats.

## Preparation Onboarding & External Sources

`User.preparationSetupCompletedAt` gates the one-time onboarding step. It is
never used alone: `needsSetup()` also checks whether the user already has
any `PreparationProgress` or `PreparationLog` rows, so a pre-existing user
is never prompted just because the flag happens to be unset on their row —
only genuinely new, empty accounts see the setup screen.

`PreparationProgress.initialLevel` is a separate field from `confidence`,
set once during onboarding and never touched again automatically. This is
deliberate: "what I think I know starting out" and "my current preparation"
are different numbers that both stay visible, rather than collapsing into
one value.

External platforms (LeetCode, and whatever comes after it) go through a
`PreparationSourceProvider` interface — the same provider-abstraction
pattern already used for extraction and email. `PreparationSource` stores
only `provider`, `profileUrl`, and a normalized `metrics` JSON blob; it has
no relation to `PreparationLog` or `PreparationProgress` at the schema
level, so removing a source can never delete Suzume-owned study history,
and a failed refresh updates only `lastSyncError` — the last known-good
`metrics` are left untouched rather than being wiped by a transient
failure. Adding a second provider later is one new file plus one line in
`providerRegistry.ts`; nothing in the Preparation UI is LeetCode-specific.
