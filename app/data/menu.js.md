# `app/data/menu.js` — Navigation Menu Definitions

## Purpose

Defines three menu structures used by different layouts:
- **`employee_menu(org_id, employee_id)`** — Employee self-service sidebar
- **`organization_menu(org_id)`** — Organization admin sidebar
- **`menu`** — Super admin platform-level sidebar

## Menu Structure

Each menu is an array of groups, where each group has a label and items. Items can have nested `children` for sub-navigation.

```js
export const employee_menu = (org_id, employee_id) => [
  {
    group: 'Home',
    items: [
      { label: 'Home', path: `/organization/${org_id}/employee/${employee_id}/home`, icon: 'ion:home-outline' },
      { label: 'Holidays', path: `/organization/${org_id}/employee/${employee_id}/holidays`, icon: 'ion:calendar-outline' },
    ]
  },
  { group: 'Self', items: [Attendance, Leaves, Performance] },
  { group: 'Inbox', items: [Mails, Notifications, Chat, Channels, Events] },
  { group: 'Finalnce', items: [Salary, Payslips, Income Tax, Forms] },
  { group: 'Team', items: [My Team, Hierarchy] },
  { group: 'Settings', items: [Profile] },
]
```

## Organization Menu Groups

- **Core HR**: Dashboard, Organization (Departments, Designations, Hierarchy, Holidays), Employee (List, Categories, Onboarding, Permissions), Attendance, Leave
- **Payroll & Finance**: Payroll (Components, Groups, Payslip Template, Payslips, Bonuses, Settings), Expenses (Subscription, Invoices, Office, Other), Reimbursement
- **Performance & Talent**: Performance (Appraisals, Goals & KPIs, Feedback), Onboarding
- **Operations**: Asset Management (Categories, Models, Assets, Requests), Employee Self-Service
- **Storage**: Folders & Files
- **Reports & Analytics**: HR Reports, Payroll Reports, Attendance Reports
- **System**: Calculators (Salary), Integrations (HRMS APIs, Third-Party), Settings (General, Roles, Notifications)

## Super Admin Menu Groups

- **Analytics**: Dashboard
- **Tenants**: Organization, Plans
- **Billing**: Invoices, Payments
- **Offers**: Discounts
- **Reports & Analytics**: Traffic Reports, Payment Reports, Usage Reports
- **System**: Modules, General Settings, Notifications
