# `app/stores/subscription-plan.store.js` — Subscription Plans Store

## Purpose

Pinia store for managing subscription plans with features, CRUD, and pagination.

## State

| Field | Type | Description |
|-------|------|-------------|
| `plans` | Array | Paginated plan list |
| `plan_list` | Array | All plans for dropdowns |
| `features` | Array | Plan features (edit mode) |
| `meta` | Object | Pagination: page, limit, total, search |
| `create` | Object | Form: name, description, monthly_price, yearly_price, trial_days, gst, is_active |
| `editId, editData, deleteId, deleteData` | — | UI state |

## Key Actions

```js
async fetchPlans()                  // Paginated list
async fetchPlansForSelect()         // All plans for dropdowns
async createPlan()                  // Create new plan
async updatePlan()                  // Update plan
async deletePlan()                  // Delete plan
async fetchFeatures(planId)         // Load plan features
async updateFeature(featureId, payload) // Update feature value
nextPage() / prevPage() / refresh()  // Pagination
```

## Plan Normalization

```js
_normalize(plan) {
  return {
    ...plan,
    monthly_price: Number(plan.monthly_price ?? 0),
    yearly_price: Number(plan.yearly_price ?? 0),
    trial_days: Number(plan.trial_days ?? 0),
    gst: Number(plan.gst ?? 0),
    is_active: Boolean(plan.is_active),
  }
}
```

## Explanation

- Plans have monthly/yearly pricing with trial period and GST.
- Features are key-value pairs with optional unlimited flag.
- Features are fetched separately via plan ID.
- Plan activation/deactivation via `is_active` flag.
- Server-side pagination and search.
