# `app/stores/empCategory.store.js` — Employee Category Store

## Purpose

Pinia store for managing employee categories (e.g., Permanent, Contract, Intern) with configurable HR policies.

## State

| Field | Type | Description |
|-------|------|-------------|
| `categories` | Array | Paginated category list |
| `category_list` | Array | Simplified list for dropdowns |
| `name, code, description, id_prefix` | Strings | Basic category info |
| `is_permanent` | Boolean | Whether category is permanent |
| `benefits_applicable` | Boolean | Benefits eligibility |
| `training_required, training_months` | — | Training policy |
| `probation_required, probation_months` | — | Probation policy |
| `notice_required, notice_months` | — | Notice period policy |
| `is_active` | Boolean | Active flag |

## Key Actions

```js
async fetchEmployeeCategories()     // Paginated list
async fetchAllEmployeeCategories()  // All for dropdowns (formatted as "Name (PREFIX)")
async saveEmpCategory()             // Create or update
async deleteEmployeeCategory()      // Delete
```

## Explanation

- Categories define employment types with configurable HR policies (training, probation, notice).
- `id_prefix` is used for employee ID generation (e.g., "EMP" → EMP001).
- Category dropdown shows `Name (PREFIX)` format.
- Server-side pagination and search.
