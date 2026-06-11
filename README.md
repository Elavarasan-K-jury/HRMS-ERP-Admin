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

```
app/
├── app.vue                 # Root component (NuxtLayout + NuxtPage)
├── components/             # Reusable Vue components (21 categories)
│   ├── asset/
│   ├── charts/
│   ├── department/
│   ├── designation/
│   ├── employee/
│   ├── employee-category/
│   ├── expense/
│   ├── form/
│   ├── hierarchy/
│   ├── holiday/
│   ├── invoices/
│   ├── onboardingProcess/
│   ├── organization/
│   ├── policies/
│   ├── reports/
│   ├── salary-templates/
│   ├── subscriptionPlans/
│   ├── traffic/
│   ├── ui/                 # Base UI components (Sidebar, Header, Button, Modal, etc.)
│   └── usage/
├── constants/              # Static data (countries, industries, designations, input types)
├── data/                   # Menu definitions (employee_menu, organization_menu, super_admin menu)
├── layouts/                # Layout components (auth, default, employee, organization)
├── middleware/              # Route guard (auth.global.js)
├── pages/                  # Route pages (index, login, invoices, plans, pdf-view)
├── plugins/                # Nuxt plugins (axios, apexcharts, quill, error-handler)
├── stores/                 # Pinia stores (28 stores across business domains)
└── utils/                  # Utility functions (encrypt-download, decrypt-upload)
```

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
