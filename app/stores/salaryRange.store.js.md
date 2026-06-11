# `app/stores/salaryRange.store.js` — Salary Range Store

## Purpose

Pinia store for managing salary ranges within salary templates. Each range has a low/high gross amount and custom component values.

## State

| Field | Type | Description |
|-------|------|-------------|
| `ranges` | Array | Salary ranges for active template |
| `activeRangeId` | String | Currently selected range |
| `rangeComponents` | Array | Components mapped to active range |
| `saving` | Boolean | Save operation in progress |

## Range Structure

```js
ranges: [{
  id, low, high, label, saved: true,
  components: []  // Filled on demand
}]
```

## Key Actions

```js
async fetchRanges(templateId)                        // Load ranges for a template
async createRange(templateId, range)                 // Add new range
async updateRange(range, templateId)                 // Update range
async deleteRange(rangeId)                           // Delete range
async fetchRangeComponents(rangeId)                  // Load components for range
async saveRangeComponents(templateId, rangeId, components) // Save component values
async setActiveRange(rangeId)                        // Select range and load components
```

## Component Structure

```js
rangeComponents: [{
  id, componentId: { value, label }, kind, formula,
  value, priority, minValue, maxValue, condition,
  isDefault, isDeletable
}]
```

## Explanation

- Ranges define gross salary brackets (e.g., 0-3 LPA, 3-6 LPA, 6-12 LPA).
- Each range has custom component values (earnings and deductions).
- Components reference `componentDefinition.store` for metadata.
- Full replace strategy for component saving (POST replaces all components at once).
