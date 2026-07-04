# PathFinder AI — v1 Plan

**Important stack note:** This project runs on Lovable's stack (React + TanStack Start + Lovable Cloud/Postgres), not PHP/MySQL/XAMPP. All the same features (auth, roles, guided flow, AI recommendations, dataset, admin) will be built as a modern web app. Offline-first LAN hosting via XAMPP is not possible here; the app will be online, mobile-responsive, and can later be made installable as a PWA.

Tagline: *"Find your path — clear, realistic, reliable."*
Theme: Clean blue + white, EN/TL toggle.

---

## 1. Backend (Lovable Cloud)

**Enable Lovable Cloud** for database, auth, and secrets.

**Tables**
- `profiles` — id (→ auth.users), full_name, section, location_region, location_province, location_city, current_status, created_at
- `user_roles` — user_id, role (`student` | `counselor` | `admin`) — separate table, `has_role()` security-definer function
- `intake_responses` — id, user_id, skills[], hobbies[], next_step, target_field, mode, budget, location fields, other_notes, created_at
- `saved_plans` — id, user_id, intake_id, title, ai_result_json, created_at
- `schools` — name, type, region, city, tuition_min, tuition_max, accreditation, programs[], scholarships_available, pros, cons, source_url, last_verified, valid_until
- `scholarships` — name, provider, eligibility, amount, deadline, application_window, source_url, last_verified
- `careers` — name, field, starting_salary_min, starting_salary_max, mid_salary_min, mid_salary_max, requirements, typical_path
- `data_corrections` — user_id, table_name, row_id, suggested_change, status (pending/approved/rejected), reviewed_by
- `audit_log` — user_id, action, entity, entity_id, meta, created_at

**RLS:** users read/write own profile+intakes+plans; counselors read assigned students (v1: read all students, add assignment later); admin full access via `has_role`.

**Auth**
- Email + password (Lovable Cloud native). No security question in v1 (Cloud has password reset via email; adding a custom security-question flow duplicates auth and is fragile — I'll flag this in UI).
- Default admin: seeded via migration creating `admin@pathfinder.local` / `admin123` and admin role.
- Signup form collects the extra profile fields (full name, role request, section, location, current status) → written to `profiles` + `user_roles` via trigger.

---

## 2. Seeded PH Dataset

Migration seeds ~30–50 rows across schools (UP, ADMU, DLSU, UST, PUP, TESDA centers, PSHS, MAAP, PMMA, PMA, PNPA, etc.), ~20 scholarships (DOST, CHED-UniFAST, SM, Ayala, GSIS, etc.), and ~25 careers spanning the 9 target fields. Each row includes source_url + last_verified + valid_until.

---

## 3. Guided Intake Flow (`/intake`)

One-question-at-a-time conversational UI, 8 steps as specified (status → skills → hobbies → next step → target field → mode → budget → location cascade). Progress bar, back/next, "Other" free text where noted. Region→Province→City cascade uses a static PH admin dataset (bundled JSON).

Saves to `intake_responses` on completion, then redirects to `/results/:id`.

---

## 4. AI Recommendations (`/results/:id`)

Server function calls Lovable AI Gateway (Gemini) with:
- The user's intake
- A filtered slice of the seeded dataset (schools/scholarships/careers matching field + budget + region)

Prompt requests structured JSON with the 11 required sections (paths, comparison table, eligibility ✅/⚠️/❌, timeline, cost breakdown, scholarships, schools, employers, income, next steps, source+validity). Renders as rich cards + a comparison table. Minimum 3 paths.

- "Save Plan" → `saved_plans`
- "Print / Save as PDF" via `window.print()` with print stylesheet
- "Report incorrect info" → `data_corrections`
- Persistent follow-up chat box below results (streaming, same intake+result as context)

---

## 5. Role-Based UI

- **Student:** dashboard with saved plans, new intake, follow-up chat, report data
- **Counselor:** list of students, view their plans, add notes (v1: read-only students table)
- **Admin:** `/admin` with tabs — Users, Schools, Scholarships, Careers (CRUD), Correction Requests queue (approve/reject), Audit Log viewer

---

## 6. Design / UX

- Tailwind + shadcn; blue (`oklch` primary) + white
- Fully responsive
- EN/TL toggle via lightweight i18n dictionary (`src/lib/i18n.ts`) — every visible string keyed
- Semantic head tags per route, real title/description

---

## 7. Out of scope for v1 (documented, not built)

- PWA offline mode + USB update packs (can add later — this is the closest we can get to "offline-first")
- Versioned data pack import/export UI (schema supports it; admin UI can be added in v2)
- Security-question password recovery (email reset used instead)
- Counselor↔student assignment logic (v1: counselors see all students)

---

## Technical section

- **Stack:** TanStack Start, Lovable Cloud (Supabase), Lovable AI Gateway (`google/gemini-3-flash-preview`).
- **Auth gate:** `_authenticated/` layout (integration-managed). Admin/counselor pages nested under `_authenticated/admin/` and `_authenticated/counselor/` with `beforeLoad` role check via `has_role`.
- **AI call:** `createServerFn` in `src/lib/recommendations.functions.ts`, structured output via `Output.object` with a small flat schema; limits stated in prompt; guarded `NoObjectGeneratedError` fallback.
- **Follow-up chat:** `/api/chat` server route using `streamText` + `useChat` with `DefaultChatTransport`, thread scoped to `saved_plans.id`.
- **Seeding:** SQL migration inserts dataset + creates default admin via `auth.users` insert + `user_roles`.
- **Corrections + audit:** RLS-protected inserts from students/counselors; admin approval RPC updates target row and writes audit_log.

Ready to build on approval.
