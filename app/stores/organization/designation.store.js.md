# `app/stores/designation.store.js` — Designation Management Store

## Purpose

Pinia store for CRUD operations on designations within an organization.

## State

| Field | Type | Description |
|-------|------|-------------|
| `designations` | Array | Paginated designation list |
| `designation_list` | Array | Simplified list for dropdowns |
| `name` | String | Designation name |
| `designation_level` | Object | Level (entry_level, junior_level, etc.) |
| `description` | String | Designation description |
| `department_id` | Object | Associated department |

## Key Actions

```js
async fetchDesignations()              // Paginated list
async fetchDesignationList()           // All designations for dropdown
async saveDesignation()                // Create or update
async deleteDesignation()              // Delete designation
```

## Explanation

- Designation levels come from `constants/designations.js` (9 levels: Entry → Board).
- Each designation can optionally be linked to a department.
- Select options are formatted as `Name (LEVEL)` with the level uppercased.
- Supports server-side pagination and search.
