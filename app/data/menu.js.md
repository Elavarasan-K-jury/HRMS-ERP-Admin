# `app/data/menu.js` — Navigation Menu Definitions

## Purpose

Defines three menu structures used by different layouts:
- **`employee_menu()`** — Employee Portal sidebar only; static `/employee/*` paths (Phase 28/29)
- **`organization_menu(org_id)`** — Complete Organization Admin sidebar (Organization Portal + Organization Admin → Employee pages)
- **`menu`** — Super admin platform-level sidebar

## Menu Data Flow (Phase 29)

### Employee Portal (`/employee/*`)
```
employee_menu() → auth.vue (employee scope) → UiSidebar
```

### Organization Admin (`/organization/:org/*`)
```
organization_menu(org) → organization.vue → UiSidebar
```

### Organization Admin → Employee (`/organization/:org/employee/:employee/*`)
```
organization_menu(org) → employee.vue → UiSidebar   // admin employee management pages
organization_menu(org) → organization.vue → UiSidebar // profile uses organization layout
```

Same UiSidebar component/design for all three contexts; different menu arrays.

### Super Admin
```
menu (static) → auth.vue → UiSidebar
```

## Menu Structure

```js
export const employee_menu = () => [
  { group: 'Home', items: [Dashboard → /employee] },
  { group: 'Self', items: [Me → Profile, Attendance, Holidays, Expenses] },
]
```

Features without a dedicated `/employee/*` page are omitted (see PHASE_29 report).

## Organization Menu Groups

- **Overview**: Dashboard
- **Employees**: Employees List, Login
- **Org Structure**: Departments, Branches, Designations, Hierarchy, Pay Grades, Legal Entities, Location
- **Time Attend**: Attendance Tracking, Policy, Report, Approvals, Shifts/Weekly Offs & Holidays, Overtime, Leaves, Leave Types, Reports, Settings, Approval Flows
- **Exits**: Summary, Exit Process, Reverted Exits, Task Tracking, Task Templates, Exit Survey, Bulk Actions, Exit Settings
- **Expenses**: Summary, Expenses, Advances, Policies, Reports and Invoices
- **Documents**: Document Templates, Employee Documents, Organization Documents
- **My Finance**: Salary Components, Salary Groups, Payslip Templates, Payslips, Bonuses, Settings
- **Storage**: Folders & Files
- **Reports & Analytics**: HR Reports, Payroll Reports, Attendance Reports
- **Tools**: Calculators, Integrations

