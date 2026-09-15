# `app/stores/componentDefinition.store.js` — Salary Component Definitions Store

## Purpose

Pinia store for managing salary component definitions (earnings and deductions) with category tabs, CRUD, and default components.

## State

| Field | Type | Description |
|-------|------|-------------|
| `components` | Array | Paginated component list |
| `tabs` | Array | Category tabs: recurring, adhoc, allowance, custom |
| `activeTab` | Number | Active tab index |
| `componentId` | String | Component being edited |
| `form` | Object | { key, name, type, category, defaultFormula, description, isDefault, isTaxable, isVariable, isStatutory, includeInCTC, includeInGross, displayOrder, isActive } |

## Component Types

```js
types: [
  { value: "earning", label: "Earning" },
  { value: "deduction", label: "Deduction" },
  { value: "reimbursement", label: "Reimbursement" },
  { value: "benefit", label: "Benefit" },
  { value: "tax", label: "Tax" }
]
```

## Key Actions

```js
async fetchAllComponents()       // All components (unpaginated) for dropdowns
async fetchComponents()          // Paginated with tab filter
async saveComponent()            // Create or update
async deleteComponent()          // Delete
loadComponent(item)              // Load component into edit form
resetForm()                      // Reset form to defaults
```

## Explanation

- Components are categorized by tab (recurring, adhoc, allowance, custom) with badge counts.
- Each component has taxability, CTC inclusion, gross inclusion, and statutory flags.
- Default components (isDefault) have simplified payload (only name + key).
- Components are referenced by salary ranges and templates.
- Component definitions are organization-specific.
