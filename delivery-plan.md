# Completion Plan (Deadline: Thu Sep 25, 12:00 GMT+03)

## Current Gaps
- `src/app/app.routes.ts:1` still lazy-loads standalone components only; requirement for two feature modules (e.g., Auth + Admin) not met.
- `OnPush` change detection is missing across components (e.g., `src/app/pages/admin/product-list/product-list.component.ts`, `src/app/pages/auth/login/login.component.ts`).
- Auth flow is incomplete: no JWT simulation, no signal-backed user store, navbar lacks reactive user display (`src/app/helpers/services/auth.service.ts`, `src/app/components/navbar/navbar.component.ts`).
- Admin workflows unfinished: dashboard placeholder, product create/update forms do not persist orders, navigation buttons do not route (`src/app/pages/admin/home/home.component.ts`, `src/app/pages/admin/product-add/product-edit.component.ts`).
- Technical polish outstanding: interceptor does not surface 500 errors to UI, production build unverified, GitHub remote missing.

## Wednesday (Sep 24)
- **09:00–11:00** – Establish `AuthModule` & `AdminModule`, host existing standalone components inside, organise providers and routing.
- **11:00–14:00** – Enable `OnPush` everywhere; refactor subscriptions to signals/async pipes to keep views reactive.
- **14:00–16:00** – Implement auth simulation (mock backend or Northwind auth), return fake JWT, add signal store with persistence helpers.
- **16:00–18:00** – Finalise auth UX: navbar user display, guards/redirects, toast or alert service via interceptors for 500 errors, ensure 401 redirect flow is stable.
- **18:00–20:00** – Flesh out admin dashboard with KPIs/links and prep typed mappers for product/order forms.

## Thursday (Sep 25)
- **08:30–10:00** – Finish product create/update: reuse editor for create & edit, wire `ProductService` create/update, complete order FormArray CRUD with single submit.
- **10:00–11:00** – Tighten admin navigation: hook list/detail buttons to add/edit routes, confirm cancel/back paths, ensure navbar select works for edit view.
- **11:00–11:30** – Run `ng build --configuration production`, fix build/lint issues, add quick tests around auth service if feasible.
- **11:30–12:00** – Polish: refresh `README`, update `interview_project_todo.md`, initialise GitHub repo and push, prepare handoff notes.

## Risks & Mitigations
- Mock auth expectations may shift; confirm API contract early and keep a fallback JSON mock ready.
- Switching to `OnPush` can expose stale bindings; leave buffer for change detection fixes.
- DevExtreme grid updates may need adapter logic; budget extra time if API schema diverges.
- Northwind uptime is uncertain; cache sample payloads locally to avoid blockers.

## Final Checks
- Run `ng test` plus manual login/product flows before push.
- If time remains, tackle one optional extra (e.g., responsive sidenav) to demonstrate initiative.
