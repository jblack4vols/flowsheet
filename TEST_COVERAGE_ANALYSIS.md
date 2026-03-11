# Test Coverage Analysis — Tristar PT Flowsheets

## Current State

**Test coverage: 0%**. The project has no test files, no testing framework, no coverage tooling, and no CI pipeline. For a healthcare application handling patient data with HIPAA compliance requirements, this is a critical gap.

---

## Recommended Testing Infrastructure

Since the project uses **Vite + React**, the natural choice is:

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner (native Vite integration, Jest-compatible API) |
| **React Testing Library** | Component rendering and interaction testing |
| **jsdom** | Browser environment simulation |
| **MSW (Mock Service Worker)** | Supabase API mocking |
| **c8 / @vitest/coverage-v8** | Code coverage reporting |

---

## Priority Areas for Testing

### Priority 1 — Critical (Data Integrity & Auth)

#### 1. `src/lib/supabase.js` — Database Helper Functions
- **Why:** Every data operation flows through these functions. Bugs here affect patient records directly.
- **What to test:**
  - `fetchPatients()` — correct query construction, clinic filtering logic (`"All Clinics"` bypass), error propagation
  - `updatePatientStatus()` — confirms `updated_at` is set, correct patient targeted by ID
  - `insertVisit()` / `insertPatient()` — return shape, error handling
  - `fetchClinics()` — mapping `data.map(c => c.name)` works correctly, handles empty arrays
  - `insertAuditEntry()` — silently fails (no `throw`) — verify this is intentional vs. a bug
- **Risk if untested:** Corrupted patient records, lost visits, broken audit trail

#### 2. `src/contexts/AuthContext.jsx` — Authentication & Session Management
- **Why:** Controls who can access patient data and what gets audit-logged.
- **What to test:**
  - Session restoration on mount (`getSession` flow)
  - `onAuthStateChange` handler — SIGNED_IN loads profile, SIGNED_OUT clears state
  - `isAdmin` derivation (`profile?.role === 'Admin'`)
  - `signOut()` creates audit entry before signing out
  - `addAuditEntry()` no-ops when `user` is null
  - `selectedClinic` defaults to profile's clinic or `'All Clinics'`
- **Risk if untested:** Unauthorized access, broken login/logout, missing audit entries

### Priority 2 — High (Core Business Logic)

#### 3. `src/App.jsx` — State Management & Data Flow
- **Why:** Orchestrates all data loading, status changes, and visit insertion with complex state updates.
- **What to test:**
  - `handleStatusChange()` — optimistic update uses `patient_id` (not `id`) to match, audit entry fires
  - `handleAddVisit()` — visit appended to state, patient's `last_visit` updated, `selectedPatient` synced
  - `loadData()` — error state set on failure, loading state managed correctly
  - Navigation gating: admin-only pages (audit log, settings) not rendered for non-admins
  - Conditional rendering: loading spinner → login page → main app
- **Risk if untested:** Stale UI after mutations, lost visit records, admin pages exposed to regular users

#### 4. `src/components/VisitModal.jsx` — Visit Form Validation
- **Why:** This is the primary data entry point for clinical records.
- **What to test:**
  - Required field validation (`date`, `bp`, `hr` must be present)
  - `hr` and `painLevel` parsed as integers
  - Empty exercises filtered out (`exercises.filter(e => e.trim())`)
  - Therapist falls back to `'Unknown'` if profile name missing
  - Exercise add/remove/update handlers maintain correct state
- **Risk if untested:** Invalid vital signs saved, malformed visit records

#### 5. `src/components/PatientsList.jsx` — Filtering & Pagination
- **Why:** Contains search, status filtering, and pagination logic — all purely computational and easy to test.
- **What to test:**
  - Search matches first name, last name, and patient ID
  - Search is case-insensitive
  - Status filter correctly partitions patients (`Active` / `Inactive` / `DC`)
  - Pagination math: `totalPages`, `startIdx`, boundary conditions
  - Page resets to 1 when search term or status filter changes
  - Empty state rendering when no patients match
- **Risk if untested:** Patients not findable, pagination off-by-one errors

### Priority 3 — Medium (Dashboard & Display)

#### 6. `src/components/Dashboard.jsx` — Stats Computation
- **Why:** Computes aggregate stats and chart data from raw arrays.
- **What to test:**
  - Clinic filtering logic for both patients and visits
  - Visit-to-patient clinic join (visits filtered by matching patient's clinic)
  - `visitsToday` and `visitsThisWeek` date comparisons
  - Chart data generation — maps clinic names to patient counts
  - Chart hidden when specific clinic selected (not "All Clinics")
- **Risk if untested:** Incorrect dashboard numbers misleading clinical staff

#### 7. `src/components/StatusBadge.jsx` & `StatusToggle.jsx` — Simple Components
- **Why:** Low complexity but good candidates for snapshot or render tests.
- **What to test:**
  - StatusBadge renders correct color/text for each status value
  - StatusToggle calls `onChange` with correct value
- **Risk if untested:** Low — visual/cosmetic issues only

### Priority 4 — Recommended Additions

#### 8. Integration / Smoke Tests
- App renders without crashing when authenticated
- App shows login page when not authenticated
- Full flow: navigate to patients → select patient → open visit modal → save

#### 9. Accessibility Tests
- Form inputs have associated labels
- Modal traps focus and is dismissible via keyboard
- Color contrast meets WCAG AA (important for clinical use)

---

## Notable Bugs / Risks Found During Analysis

| Location | Issue | Severity |
|----------|-------|----------|
| `supabase.js:61` | `insertAuditEntry()` does not `throw` on error (unlike every other function). Audit failures are silently swallowed. | Medium |
| `App.jsx:79` | `handleStatusChange` matches on `patient_id` but `updatePatientStatus` uses `id`. If `id !== patient_id`, the DB update targets a different row than the UI update. | High |
| `App.jsx:91` | `handleAddVisit` appends to visits with `[...visits, newVisit]` but visits are ordered `descending` by date from the DB. New visit goes to end instead of beginning. | Low |
| `VisitModal.jsx:40` | `hr` is parsed with `parseInt` but no `radix` parameter. Works in practice but flagged by linters. | Low |
| `Dashboard.jsx:34-37` | Week calculation uses `setDate(getDate() - 7)` which can cross month boundaries incorrectly in edge cases. | Low |

---

## Suggested Implementation Order

1. **Set up Vitest + React Testing Library** (add deps, config, `test` script)
2. **Test `supabase.js`** — mock the Supabase client, verify query building and error handling
3. **Test `AuthContext.jsx`** — mock Supabase auth, verify session lifecycle
4. **Test `PatientsList.jsx`** — pure filtering/pagination logic, no mocking needed
5. **Test `VisitModal.jsx`** — form validation and data construction
6. **Test `Dashboard.jsx`** — stat computation with mock data
7. **Test `App.jsx`** — integration-level tests with all mocked dependencies
8. **Add coverage thresholds** and a CI pipeline to enforce them
