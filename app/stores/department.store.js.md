# `app/stores/department.store.js` — Department Management Store

## Purpose

Pinia store for CRUD operations on departments within an organization.

## State

| Field | Type | Description |
|-------|------|-------------|
| `departments` | Array | Paginated department list |
| `department_select` | Array | Simplified list for dropdowns |
| `name, code, description, note` | Strings | Form fields |
| `department_head_id` | Object | Selected department head |
| `department_head_start_date` | String | Department head start date |
| `organization_id` | String | Current organization |

## Key Actions

```js
async fetchDepartments()                    // Paginated list
async fetchAllDepartments()                 // All departments for dropdown
async fetchDepartmentEmployees(orgId, deptId) // Employees in a department
async saveDepartment()                      // Create or update
async deleteDepartment()                    // Delete department
```

## Explanation

- Departments have name, code, description, optional note, and optional head employee.
- Department head assignment includes start date.
- Department select options are formatted as `Name (CODE)`.
- Pagination and search are server-side.
