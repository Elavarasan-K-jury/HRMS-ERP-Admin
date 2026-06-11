# `app/stores/employee.store.js` — Employee Management Store

## Purpose

Pinia store for managing employees: CRUD, listing with filters, department assignment, and reporting.

## State

| Field | Type | Description |
|-------|------|-------------|
| `employees` | Array | Paginated employee list |
| `all_employees` | Array | All employees (unpaginated) |
| `employeeReport` | Object | Employee report data |
| `first_name, last_name, email, phone, ...` | Strings | Form fields for create/edit |
| `employee_department` | Array | Department assignments with reporting to |
| `employee_category` | Object | Selected category (value/label) |
| `employee_designation` | Object | Selected designation (value/label) |
| `page, limit, totalPages, search` | — | Pagination state |

## Key Actions

```js
async fetchEmployees()                 // Paginated employee list
async fetchAllEmployees(department_id) // All employees (for dropdowns)
async fetchEmployee(id)                // Single employee details
async fetchEmployeeReport(id)          // Employee report data
async saveEmployee()                   // Create or update employee + department assignments
async deleteEmployee()                 // Delete employee
addNewDepartment() / removeDepartment() // Dynamic department row management
```

## Employee Creation Flow

```js
async saveEmployee() {
  // POST /employees with personal details
  // For each department in employee_department[]:
  //   POST /employees/departments (or PUT if editing)
  // On completion: refresh list and reset form
}
```

## Explanation

- Employees can belong to multiple departments with different reporting managers and date ranges.
- Department assignments are created/updated separately from the employee record.
- Supports employee type: `EMPLOYEE` or `ADMIN` (isAdmin flag).
- Form automatically resets after successful save.
