# Jury HRMS - Admin Panel

**Version:** Nuxt 4 | **Author:** Jurysoft  
**Stack:** Nuxt 4, Vue 3, Pinia, Tailwind CSS, Axios, ApexCharts

## Overview

A comprehensive **Human Resource Management System (HRMS)** admin panel built with Nuxt 4. This application serves as the super-admin and organization-level management interface for the Jury HRMS ecosystem. It enables managing organizations, employees, departments, designations, attendance, payroll, assets, subscriptions, expenses, and more through a modern glassmorphic UI.

### Key Features

- **Super Admin Dashboard** — Platform-wide analytics, service health monitoring, subscription risks, revenue trends, organization growth.
- **Organization Management** — CRUD for tenant organizations with subscription plans and limits.
- **Employee Management** — Full lifecycle: onboarding flows, categories, designations, departments, hierarchy.
- **Payroll & Finance** — Salary components, salary ranges, salary templates, payslip templates (EJS-based), PF/ESI/PTAX configuration.
- **Attendance** — Policies (grace period, geo-checkin, overtime), monthly tracking, auto-generated reports with auto-refresh.
- **Asset Management** — Categories, models, assets, assignments, employee requests with approve/reject workflow.
- **Storage** — Folder/file management with visibility controls (private/shared/public) and multipart uploads.
- **Subscription Plans** — Create/edit subscription tiers with plan features (unlimited/value-based), trial days, pricing.
- **Expenses** — Organization-level expense request approval workflow.
- **Holidays** — Calendar view, per-policy/region filtering, CRUD operations.
- **Traffic Analytics** — Super admin traffic reporting with service health, error breakdowns, latency, alerts.
- **Authentication** — OTP-based login with email/phone, token refresh, session management via cookies.

## Architecture

### Complete Folder Structure

```
Admin/
├── nuxt.config.js          # Modules, dev port 3030, runtime config (API base URLs)
├── .env                    # API base URLs, encryption secret
├── docker-compose.yml      # Docker setup
├── Dockerfile
├── app/
│   ├── app.vue             # Root component (NuxtLayout + NuxtPage, theme class, Toaster)
│   ├── pages/              # ⭐ ROUTES — auto-registered, folder = URL (no router config)
│   ├── layouts/            # ⭐ Page shells (default, auth, organization, employee)
│   ├── components/         # ⭐ Auto-imported components (21+ categories)
│   │   ├── ui/             # Shared UI: button, card, modal, tabs, search, switch, otp, sidebar, header, sidebarModal, panel, loader, colorSidebar
│   │   ├── form/           # FormInput, FormSelect, FormTextArea...
│   │   ├── employees/      # Tab components: DirectoryTab, OrgTreeTab, ProfileChangesTab, PrivateProfilesTab, ProbationTab, SettingsTab, LoginTab
│   │   ├── employee/       # dataTable, form, detailedView
│   │   ├── organization/   # dataTable, form...
│   │   ├── charts/         # Chart widgets per domain (platform/employee/payroll/attendance/...)
│   │   └── <module>/       # Each module has its own folder (department, designation, asset, payroll, holiday...)
│   ├── stores/             # ⭐ Pinia stores — one per module (auth, employee, department, designation, organization, ...)
│   ├── data/
│   │   └── menu.js         # ⭐ Sidebar menu definitions + permissions (menu, organization_menu, employee_menu)
│   ├── middleware/
│   │   └── auth.global.js  # Route guard: no token → redirect /login
│   ├── plugins/
│   │   └── axios.js        # $api instance + auth interceptor + x-org-id / x-employee-id headers
│   ├── constants/          # Static data (countries, industries, designations, input types)
│   └── utils/              # Helpers (encrypt/decrypt uploads, treeLayout)
└── server/                 # Not present — API is an external gateway (see .env)
```

### Routing Rules (pages → URLs)

Nuxt 4 registers every route automatically from the folder/file structure under `app/pages/` — there is **no router config file to edit**.

```
[organization]  → dynamic segment → route.params.organization
[employee]      → dynamic segment → route.params.employee
index.vue       → folder root page (e.g. organization/employees/index.vue → /organization/:org/organization/employees)
```

| Route | File |
|---|---|
| `/` | `app/pages/index.vue` |
| `/login` | `app/pages/login.vue` |
| `/organization/list` | `app/pages/organization/list.vue` |
| `/organization/:org/dashboard` | `app/pages/organization/[organization]/dashboard.vue` |
| `/organization/:org/organization/employees` | `.../[organization]/organization/employees/index.vue` |
| `/organization/:org/organization/employees/login` | `.../[organization]/organization/employees/login.vue` |
| `/organization/:org/employee/list` | `.../[organization]/employee/list.vue` |
| `/organization/:org/employee/categories` | `.../[organization]/employee/categories.vue` |
| `/organization/:org/employee/onboarding` | `.../[organization]/employee/onboarding.vue` |
| `/organization/:org/employee/:empId/home` | `.../[organization]/employee/[employee]/home.vue` |
| `/organization/:org/employee/:empId/attendance` | `.../[organization]/employee/[employee]/attendance.vue` |
| `/organization/:org/employee/:empId/holidays` | `.../[organization]/employee/[employee]/holidays.vue` |
| `/organization/:org/employee/:empId/finance/salary` | `.../[organization]/employee/[employee]/finance/salary.vue` |

Every page chooses its shell via `definePageMeta({ layout: 'organization' })` (or `default`, `auth`, `employee`).

### Super Admin vs Org Admin

| | Super Admin | Org Admin |
|---|---|---|
| Menu source | `menu` (`data/menu.js`) | `organization_menu(org_id)` (`data/menu.js`) |
| Layout | `default.vue` | `organization.vue` (sidebar + header + color picker) |
| Sidebar injection | Via `UiSidebar` in layout | `organization.vue` onMounted: `menu.value = organization_menu(route.params.organization)` |
| Dynamic menu | `/organization/list`, `/plans`, `/invoices`, `/modules`, `/settings/...` | `/organization/:org/...` |
| Route guard | `middleware/auth.global.js` | same middleware; redirects non-super-admin from `/` to their org dashboard |

The sidebar menu structure is defined in `app/data/menu.js`:

```
export const menu = [...]                    // super-admin menu
export const organization_menu = (org_id) => [...]   // org-admin menu
export const employee_menu = (org_id, employee_id) => [...]   // employee portal menu
```

Menu items support parent/children, `permission` keys (filtered via `auth.hasPermission`), icons, and full URLs with dynamic params.

### Page Creation Recipe (4-layer pattern)

Every module uses the same structure:

```
page (thin shell)
  └─ components/<module>/dataTable.vue     ← table + toolbar
  └─ components/<module>/form.vue          ← create/edit form (modal)
  └─ components/<module>/detailedView.vue  ← view modal
  └─ stores/<module>.store.js              ← API calls + state
```

Example — **Designations** (org level):

1. **Page** — `pages/organization/[organization]/designations.vue`: `definePageMeta({ layout: 'organization' })`, header card + `<DataTable :items="designations" />` + `<UiSidebarModal>` + `<DetailedView>` + `<UiModal>`. `onMounted` sets org id and calls `designationStore.fetchDesignations()`.
2. **Store** — `stores/designation.store.js`: state (`designations`, `loading`, pagination) + actions calling `await $api.get('/designations', { params })`.
3. **Components** — `components/designation/dataTable.vue`, `form.vue`, `detailedView.vue`: dumb display components receiving `items`/`loading` and emitting `@view/@edit/@delete`.
4. **Route** — automatic via file placement; register the page in `data/menu.js` to expose it in the sidebar.

### Tab Pages Pattern

Tab pages keep a single URL while switching panels via `v-show`:

- `organization/employees/index.vue` — `tabConfig` array + `<UiTabs v-model="activeTab" :tabs="tabConfig">` + one `<EmployeesXxxTab />` per index.
- `organization/employees/login.vue` — `<EmployeesLoginTab />` (its own internal tabs: Login Registrations / Login History / Failed Logins).

**Auto-import naming convention** (no import statements needed):

```
app/components/<dir>/<Name>.vue  →  use as  <DirName><Name />
app/components/employees/DirectoryTab.vue       → <EmployeesDirectoryTab />
app/components/charts/platform/SummaryKpis.vue  → <ChartsPlatformSummaryKpis />
app/components/ui/button.vue                    → <UiButton />
```

### API Layer & Functions

- Central Axios instance in `app/plugins/axios.js`: base URL from runtime config, 15s timeout, Bearer token injected from `ADMIN_ACCESS_KEY` cookie, `x-org-id` / `x-employee-id` headers set via `$setOrganizationId()` / `$setEmpId()`.
- **Auth flow** (`stores/auth.store.js`): OTP request/verify → `setToken()` → `getUserDetails()` → cookies `ADMIN_ACCESS_KEY` / `ADMIN_REFRESH_KEY`; `logout()` clears cookies and does a full-page reload to `/login`.
- **Store action pattern**:

```js
import { defineStore } from 'pinia'

export const useDesignationStore = defineStore('designation', {
    state: () => ({ designations: [], loading: false }),
    actions: {
        async fetchDesignations() {
            const { $api } = useNuxtApp()
            this.loading = true
            try {
                const { data } = await $api.get('/designations', { params: { page: 1 } })
                this.designations = data.designations
            } finally {
                this.loading = false
            }
        },
    },
})
```

Supported calls: `$api.get(url, { params })`, `$api.post(url, payload)`, `$api.put('/designations/:id', payload)`, `$api.delete('/designations/:id')`.

### How to Create New Pages / Tabs / APIs

**New page (no tabs):**
1. Create `app/pages/organization/[organization]/<name>/index.vue` (or `<name>.vue`)
2. `definePageMeta({ layout: 'organization' })`
3. Add a child entry in `organization_menu()` inside `app/data/menu.js` (optionally with `permission: 'module.action'`)
4. Create `stores/<name>.store.js` + `components/<name>/dataTable.vue` (+ `form.vue`/`detailedView.vue` as needed)

**New tab inside a tab page:**
1. Add an entry to `tabConfig` + a `<div v-show>` block with the auto-imported component in `app/components/employees/`
2. No route changes needed.

**New API call:** add an action to the module's store using `$api`, then call it from a page `onMounted` or a component event.

## Tech Stack

| Technology        | Purpose                        |
|-------------------|--------------------------------|
| **Nuxt 4**        | Vue framework with SSR/SSG     |
| **Vue 3**         | UI framework (Composition API) |
| **Pinia**         | State management               |
| **Tailwind CSS**  | Utility-first styling          |
| **Axios**         | HTTP client                    |
| **ApexCharts**    | Data visualization             |
| **vue3-apexcharts** | Vue integration for charts    |
| **vue-quill**     | Rich text editor               |
| **Quill**         | Text editor engine             |
| **CryptoJS**      | AES encryption for file uploads|
| **jsPDF**         | PDF generation                 |
| **Socket.IO**     | Real-time communication        |
| **izitoast**      | Toast notifications            |
| **@nuxt/icon**    | Icon library (Ionicons, Lucide, Heroicons) |
| **nuxt-toast**    | Toast plugin for Nuxt          |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server on port 3030
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Configured via `nuxt.config.js` runtime config:

```env
NUXT_PUBLIC_ENC_SECRET=SECRET KEY
NUXT_PUBLIC_API_BASE=/api
NUXT_PUBLIC_API_TRAFFIC_BASE=/api
NUXT_PUBLIC_API_USAGE_BASE=/api
```

## Authentication Flow

1. User enters email/phone → OTP sent via API
2. User enters OTP → Token issued (access + refresh)
3. Tokens stored in cookies (`ADMIN_ACCESS_KEY`, `ADMIN_REFRESH_KEY`)
4. Global middleware (`auth.global.js`) guards all routes except `/login`
5. Token auto-refresh on 401 responses

## API Integration

All API calls go through a centralized Axios instance (plugin `axios.js`):
- Base URL from runtime config
- Organization ID injected as `x-org-id` header
- Employee ID injected as `x-employee-id` header
- 15s timeout
- Response interceptor for error handling

## State Management (Pinia Stores)

The application uses 28 Pinia stores organized by domain:

| Store               | Domain                          |
|---------------------|---------------------------------|
| `auth.store`        | Authentication & session        |
| `theme.store`       | UI theme, sidebar, preloader    |
| `head.store`        | Document head meta              |
| `dashboard.store`   | Service health metrics          |
| `organization.store`| Tenant organizations CRUD       |
| `employee.store`    | Employee CRUD & reporting       |
| `department.store`  | Department management           |
| `designation.store` | Designation management          |
| `empCategory.store` | Employee categories             |
| `hierarchy.store`   | Org & department hierarchies    |
| `holiday.store`     | Holiday CRUD & calendar         |
| `onBoarding.store`  | Onboarding flow builder         |
| `expense.store`     | Expense approval workflow       |
| `finance.store`     | PF/ESI/PTAX configuration       |
| `salaryTemplate.store`| Salary template builder       |
| `salaryRange.store` | Salary ranges per template      |
| `payslipTemplate.store`| EJS payslip templates        |
| `componentDefinition.store`| Salary components        |
| `attendancePolicy.store`| Attendance policy CRUD      |
| `attendanceReport.store`| Attendance report generation|
| `orgAttendance.store`| Monthly org attendance         |
| `assets.store`      | Asset CRUD & assignment         |
| `assetsCategory.store`| Asset categories             |
| `assetModel.store`  | Asset models                    |
| `assetRequest.store`| Asset request workflow          |
| `organizationSubscription.store`| Subscriptions & invoices|
| `subscription-plan.store`| Plan & feature management  |
| `storage.store`     | Folder/file management          |
| `trafficReports.store`| Super admin traffic analytics |
| `employee/attendance.store`| Employee attendance view|
| `employee/holiday.store`| Employee holiday view      |
| `employee/salary.store`| Employee salary revisions    |

## Layout System

4 layouts handle different views:
- **`default.vue`** — Minimal conic-gradient background (login page)
- **`auth.vue`** — Authenticated super-admin view (sidebar + header + breadcrumbs)
- **`organization.vue`** — Organization-specific admin view with dynamic menu
- **`employee.vue`** — Employee self-service view with employee menu

## Color Theme

Custom Tailwind color palette in `tailwind.config.js`:
- **Brand** (blue) — Primary brand color
- **Plum** (purple) — Secondary
- **Rust** (orange/brown) — Accent
- **Clay** (warm brown) — Neutral warm
- **Neutral** (dark) — Dark mode base

Background color is user-selectable via `UiColorSidebar` component, persisted in localStorage.

## Hosting / Deployment

- Docker configuration provided (`Dockerfile`, `docker-compose.yml`)
- Nuxt 4 build output optimized for Node.js server or static hosting
