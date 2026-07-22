# KoboWorth Implementation Steps

## Phase 1: Scaffold & Database
- Initial FastAPI application scaffold
- Docker Compose setup (PostgreSQL, Redis, Celery, API)
- GitHub Actions CI/CD pipeline
- PostgreSQL Alembic migrations with 9 base models

## Phase 2: Core Backend Logic (USSD)
- Africa's Talking webhook endpoint (POST `/ussd/session`)
- Redis session state manager (90-second TTL)
- USSD state machine router
- Collector PIN authentication (bcrypt)
- PIN lockout handler (3 strikes)
- Single member contribution logging
- Duplicate contribution guard
- Language router (English/Pidgin)
- Worker self-service menu (score check, passport request)
- Confirmation screen middleware

## Phase 3: Project Setup (Frontend)
- React + Vite scaffold with TypeScript, Tailwind CSS v4, React Router
- Axios API client with JWT interceptor and 401 redirect
- Environment config (.env) for API base URL, S3 bucket, feature flags

## Phase 4: SMS & Consent
- Termii SMS client wrapper
- Inbound SMS reply handler (YES, NO, BLOCK, INFO)
- Initial consent SMS trigger on first contribution
- Consent writer (INSERT only to `consent_logs`)
- Consent status checker
- Per-lender consent check
- BLOCK reply processor (revokes lender access)
- Notification SMS triggers (Lender Access, Tier Milestone, Passport Ready)
- **TDD Unit & Integration Tests Passed**

## Phase 5: Scoring Engine
- `calculate_ajo_score()`
- `calculate_catch_up_bonus()`
- `calculate_velocity_score()`
- `calculate_trade_credit_score()`
- `calculate_telco_score()`
- `calculate_composite_score()` (with proportional redistribution)
- `classify_tier()` (NONE/BRONZE/SILVER/GOLD)
- Celery async task: `recalculate_score()`
- TrustScore UPSERT writer
- Tier change detector
- **TDD Unit Tests Passed**

## Phase 6: Fraud Detection
- FRAUD-01: Bulk backdating detector
- FRAUD-02: Perfect streak anomaly flag
- FRAUD-03: Same-day duplicate guard
- FRAUD-04: Dormant collector surge detector
- FRAUD-05: New group instant consistency flag
- Fraud post-processor Celery task
- **TDD Unit Tests Passed**

## Phase 7: Trust Passport
- Passport code generator (`TP-[4ALPHA]-[3DIGIT]` format, unambiguous chars)
- WeasyPrint PDF generator logic
- QR code generator linking to verify endpoint
- S3 mock uploader
- Verification endpoint (`GET /verify/{passport_code}`) handling status, expiry, consent
- Passport reissuance Celery job
- **TDD Unit Tests Passed**

## Phase 8: Lender API & Security
- POST `/v1/auth/token`: Lender authentication route
- GET `/v1/passports/{code}`: Lender workflow to look up worker's Trust Profile
- POST `/v1/score-events`: Report `LOAN_REPAID` or `LOAN_DEFAULTED` logic
- GET `/v1/usage`: Usage analytics endpoints for lender dashboards
- Audit Log Middleware: Synchronous block-write logging for CBN compliance
- Redis Rate Limiter Middleware: Protects endpoints against external partners
- JWT Auth Dependency: Protects routes requiring bearer tokens via PyJWT
- **TDD Unit Tests Passed**

## Phase 9: Admin & Privacy
- GET `/admin/workers/{id}/data-export`: Full ops-team data export handler
- USSD Dispute Entry logic: Triggered via `*347#` internally
- DELETE `/admin/workers/{id}`: Account deletion route queuing the purge worker job
- GET `/admin/audit-logs/export`: CSV return for audit trails
- Instant SMS summary logic for privacy flow in USSD handler
- **TDD Unit Tests Passed**

## Phase 10: Monitoring
- Sentry Integration: Full crash reporting on USSD, Scoring Engine, and Lender API via `sentry-sdk`.
- Prometheus Metrics: Fully automated FastAPI router tracing and instrumentation via `prometheus-fastapi-instrumentator` over `/metrics`.
- Health Check Endpoint: Comprehensive `GET /health` pipeline verifying mock readiness for Database, Redis, Celery, and S3 hooks.
- **TDD Unit Tests Passed**

## Phase 11: Frontend Application (Lender Portal)
- Login Page: Auth implementation securely routing keys via Axios to obtain JWTs in React state.
- Auth Context Manager: Global protected-route wrappers redirecting expired tokens smoothly.
- Lender Usage Dashboard: Full analytic suite running Recharts Pie diagrams visualizing Bronze/Silver/Gold distributions.
- Passport Lookup Engine: Interactive UI querying TP-XXXX-XXX Trust Passports instantly parsing Score, Max Loan, and Tier constraints.
- Score Event Reporter: On-page action hooks to push `LOAN_REPAID` or `LOAN_DEFAULTED` signals natively to the backend worker record.
- Account Settings UI: Secret key masking & visual warning modals protecting API Key Rotations.
- **Production TypeScript Build Passed**

## Phase 12: Public Passport Verification Portal
- Public Route Setup: Standalone `/p/{code}` component completely bypassing JWT Auth.
- Valid Passport Rendering: Beautifully renders Tier Badges, dynamic Mock QR Codes, and exact Loan Limits.
- Revoked & Expired State Handlers: Strictly restricts data access if consent was revoked or passport aged out.
- Print-Optimised CSS Engine: Custom Tailwind `@media print` utilities converting the UI into a clean, borderless A5 PDF layout specifically for bank lending officers.
- **Production TypeScript Build Passed**

## Phase 13: KoboWorth Ops Admin Dashboard
- Admin Login: Isolated `/admin/login` routing enforcing segregated credentials from external lenders.
- Collector Management: Dynamic list rendering worker groups, flagging fraud scores, and `is_active` toggles that automatically enqueue disputed contribution events when a collector is suspended.
- Dispute Queue: Centralized review panel empowering Ops admins to APPROVE (exclude from score) or REJECT (keep) flagged transactions.
- Logging Architectures: Comprehensive viewer separating `AuditLogs` and `ConsentEvents` by granular filters like Lender, Date, or Response Codes.
- Lender Configurations: Setup UI allowing the generation of one-time API keys and exact rate-limit overrides.
- System Health Terminal: Integrated metrics displaying PostgesSQL connections, Redis Queue Depth, active Celery workers, and SMS Delivery metrics beside a mocked live server terminal feed.
- **Production TypeScript Build Passed**

## Phase 14: Shared Components (UI Library)
- Navbar: Standardized responsive top-level navigation framework.
- StatCard: Scalable `<StatCard />` element accepting dynamic numbers, context labels, and red/green trend vectors (`lucide-react` graph icons).
- DataTable: A universal `<DataTable />` utility featuring generic typings, built-in dynamic pagination, and automatic column-sorting mechanics.
- Empty State: Centralized `<EmptyState />` visual placeholder rendering an aesthetic 'open box' graphic when data fetch yields `0` results.
- Loading Skeleton: Smooth, non-blocking `<LoadingSkeleton />` that pulses placeholder shapes while Axios API signals are running.
- Toast Notification System: Global `<ToastProvider />` context dynamically stacking Success, Error, and Warning flashes across the viewport.
- Confirm Modal: Blocking `<ConfirmModal />` interceptor to catch any destructive actions (suspensions/deletions) before they emit API dispatches.
- Error Boundary: High-level `React.Component` wrapping the entire DOM tree in `main.tsx` to trap application layer crashes, halting white-screens of death with a styled recovery terminal.
- **Production TypeScript Build Passed**

## Final Polish
- Added UI Mock Fallbacks to the frontend to allow presentation of the dashboards, modals, and tables even when the Docker backend microservices are offline.

## Phase 15: Admin UI & Backend Refinements (Today)
- **Modular Frontend Restructuring**: Decoupled the overarching frontend into three distinct applications (`frontend`, `frontend-collector`, `frontend-lender`).
- **Trust Passport Real Data Hookup**: Implemented automatic, dynamic `TP-` unique code generation securely tethered to the backend database.
- **Worker Web Dashboard Improvements**: Implemented dynamic filtering for the savings chart (1D to 1Y), dynamically calculated the `savingsConsistency` variable instead of using hardcoded mocks, and refined calendar view resizing.
- **IT Specialist Admin Portal Upgrade**: 
  - Eradicated all hardcoded placeholders and attached the frontend admin components (`SystemHealth.tsx`, `CollectorManagement.tsx`, `DisputeQueue.tsx`, `AuditLogs.tsx`, `LenderManagement.tsx`) directly to five new active PostgreSQL `/admin/*` backend endpoints.
  - Rebranded "Ops Admin" references exclusively to **"IT Specialist"**.
  - Engineered advanced CSS filter tricks (`brightness-0 invert drop-shadow-[0_0_1px_rgba(255,255,255,1)]`) to create a perfectly thick, pure-white rendering of the Koboworth logo atop the dark sidebar across all admin interfaces.
  - Resolved the `twilio` dependency crashing the Docker backend by correctly rebuilding the environment to fully encompass the SMS integration.
- **Collector Dashboard UI**: Precision-tuned the primary header logo height to exact mathematical equivalents of `156px` to maintain rigid visual consistency.
