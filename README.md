# Sabah Yıldızı Admin Interview Project

> A full-stack interview exercise featuring an Angular 20 admin dashboard powered by a lightweight Node.js mock API.

The project demonstrates a modular Angular application that consumes a custom REST API to manage products and their orders. It showcases standalone components, signal-based state management, DevExtreme data grids, and a transactional save flow for nested resources. The repository also ships with a self-contained HTTP server (no Express) that implements JWT authentication, seeded catalog data, and realistic validation.

---

## Highlights

- **Angular 20 with standalone components** – lazy-loaded `AuthModule` and `AdminModule`, extensive use of signals/computed values, and `OnPush` change detection on feature pages.
- **Rich admin experience** – DevExtreme DataGrid for product CRUD, dashboard analytics, and detailed product drill-down pages integrated with Bootstrap 5 styling.
- **Mock API for interviews** – vanilla Node.js HTTP server with JWT auth, PBKDF2 password hashing, in-memory catalog + order data, and an integration smoke test script.
- **User feedback & ergonomics** – reusable loading card, toast notifications, dynamic navbar title/product selector, and interceptor-driven error handling/reauth flows.
- **Deployment ready** – production build script, Dockerfile + Nginx config for static hosting, and environment configuration via Angular injection tokens.

---

## Repository Layout

```
├── api/                     # Standalone mock REST API (Node.js, no framework)
│   ├── src/
│   │   ├── server.js        # HTTP router, auth guard, CORS, JSON helpers
│   │   ├── store.js         # In-memory persistence + transactional helpers
│   │   ├── auth.js          # Register/login flows using PBKDF2 hashes
│   │   └── utils/           # JWT signer/verifier and password helpers
│   └── scripts/test-api.js  # Integration smoke tests (node scripts/test-api.js)
├── src/app/
│   ├── app.config.ts        # Angular providers (router, HTTP interceptors, API_CONFIG)
│   ├── features/            # Lazy modules for auth & admin areas
│   ├── pages/               # Route-level standalone components (login, dashboard, etc.)
│   ├── components/          # Navbar, footer, loading card, etc.
│   └── helpers/             # Services, interceptors, tokens, models, UI helpers
├── Dockerfile               # Serves production bundle via nginx
├── nginx.config             # History API fallback configuration
└── delivery-plan.md         # Historical delivery notes & timeline
```

Additional documentation: `interview_project_todo.md` (feature checklist), `.vscode/` snippets, and Angular CLI metadata in `angular.json`.

---

## Getting Started

### Prerequisites

- Node.js 20+ (frontend and API)
- npm 10+

### 1. Install dependencies

```bash
# Frontend
npm install

# Mock API
cd api
npm install
```

### 2. Run the mock API

```bash
cd api
npm start
```

Default host/port: `http://127.0.0.1:3000`. You can override with `PORT`, `HOST`, or `JWT_SECRET` environment variables.

### 3. Serve the Angular app

```bash
# From repository root
npm run start
```

The dev server runs at `http://localhost:4200` with live reload.

### 4. Production workflows

```bash
# Optimized build (outputs to dist/sabahyildizi-interview-1)
npm run build

# Production build preview on localhost:8080
npm run prod:serve

# Optional: build & serve with Docker (after npm run build)
docker build -t sabahyildizi-admin .
docker run -p 8080:80 sabahyildizi-admin
```

### 5. Run tests

```bash
# Angular unit tests
npm test

# API integration checks
cd api
npm test
```

---

## Frontend Features

- **Authentication flow** (`/auth/login`, `/auth/register`)
  - Reactive Forms with validation messaging and loading/error signals.
  - `AuthService` persists the authenticated user in `localStorage` (`currentUser`) and exposes signals for UI bindings.
  - Interceptors automatically attach bearer tokens and redirect to `/auth/login` on 401 responses.
- **Admin layout** (`/admin`)
  - `AdminLayoutComponent` stitches together the navbar, routed content, and footer.
  - `NavbarComponent` swaps its header between a static title and a DevExtreme `dx-select-box` when viewing product detail routes, driven by `NgComponentOutlet` and computed signals.
  - User profile chip renders reactive initials derived from the authenticated user.
- **Dashboard** (`/admin/home`)
  - Aggregates product/order streams to compute KPIs, low-stock alerts, and recent orders with currency/date pipes.
  - Provides call-to-action links back to product management.
- **Product catalog**
  - `ProductListComponent` backs a DevExtreme DataGrid with a custom store that proxies CRUD operations through `ProductService`.
  - Inline editing, search panel, filter row, action buttons, and router integration for detail/edit routes.
  - `ProductComponent` shows a richly styled detail view with order rollups, inventory stats, and a DevExtreme grid for associated orders.
  - `ProductEditComponent` exposes a single form that edits product fields and nested orders via FormArrays; saves are executed through the transactional `saveProductWithOrders` service method.
- **Shared UI utilities**
  - `LoadingCardComponent` for consistent pending states.
  - Bootstrap 5 styling with SCSS, complemented by the DevExtreme `dx.light.css` theme.
  - Toast helper centralizes `notify` usage for success/error surfaces.

---

## Services & Data Flow

- `AuthService`
  - Wraps `HttpClient` auth calls, stores tokens, and exposes signal-based getters/setters for UI consumers.
- `ProductService`
  - Standard CRUD helpers plus `saveProductWithOrders`, which orchestrates product + order mutations with rollback support if any step fails.
- `OrderService`
  - CRUD helpers scoped to the authenticated user; leverages toast notifications to confirm actions.
- Interceptors
  - `loggingInterceptor` classifies HTTP errors (network, client, server) and surfaces them as toasts/console diagnostics.
  - `authInterceptor` injects bearer tokens and redirects to login on unauthorized responses.
- API configuration is supplied via the `API_CONFIG` injection token (`app.config.ts`). Adjust the URL or add headers here if you point to a different backend.

---

## Mock API Overview (`api/`)

- Minimal Node.js HTTP server with CORS, JSON helpers, and artificial latency to simulate real-world calls.
- Endpoints (all require `Authorization: Bearer <token>` except auth routes):
  | Method | Path | Description |
  | ------ | ---- | ----------- |
  | `POST` | `/auth/register` | Create a user (PBKDF2 password hashing) |
  | `POST` | `/auth/login` | Authenticate and receive a JWT (HS256) |
  | `GET` | `/products` | List seeded products with embedded orders |
  | `POST` | `/products` | Create a product |
  | `GET` | `/products/:id` | Retrieve a product snapshot |
  | `PUT` | `/products/:id` | Update product fields |
  | `DELETE` | `/products/:id` | Delete a product and its orders |
  | `GET` | `/orders` | List the caller’s orders |
  | `POST` | `/orders` | Create an order (validates product, amount, dates) |
  | `GET` | `/orders/:id` | Get a specific order (scoped to owner) |
  | `PUT` | `/orders/:id` | Update order fields with validation |
  | `DELETE` | `/orders/:id` | Remove an order |
- Seed data: ~50 products and ~240 historical orders seeded on startup (`store.js`). An admin user (`development@development.com`) is preloaded; alternatively, register a new user via the UI/API.
- `scripts/test-api.js` performs a registration → login → product list → order create smoke test and validates authentication failures.

---

## Configuration Notes

- The Angular app expects the API at `http://localhost:3000`. Update `API_CONFIG` in `src/app/app.config.ts` if you deploy elsewhere.
- Auth tokens are stored in `localStorage` under `currentUser`; clear this key to reset the session manually.
- DevExtreme styles are imported globally via `angular.json` (`node_modules/devextreme/dist/css/dx.light.css`).
- Global styles live in `src/styles.scss`, which also imports Bootstrap’s SCSS bundle.

---

## Known Gaps & TODOs

Refer to [`interview_project_todo.md`](interview_project_todo.md) for the original checklist. Notable pending items include:

- Completing the transactional create/edit flows for nested orders in the product form beyond the current scaffolding.
- Ensuring every component opts into `ChangeDetectionStrategy.OnPush` (some shared pieces still use the default).
- Hardening the auth guard/route protection and surfacing richer error states.
- Finalizing production build validation and repository automation.

---

## Additional Resources

- Angular CLI docs: [https://angular.dev/tools/cli](https://angular.dev/tools/cli)
- DevExtreme Angular components: [https://js.devexpress.com/Documentation/Guide/Angular_Components/](https://js.devexpress.com/Documentation/Guide/Angular_Components/)

Happy hacking!
