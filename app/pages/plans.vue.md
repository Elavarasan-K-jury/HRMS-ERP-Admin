# `app/pages/plans.vue` — Subscription Plans Management Page

## Purpose

Super admin page for managing subscription plans with CRUD operations, plan features configuration, and search/pagination.

## Features

- **Plans Table**: Lists all subscription plans with pagination.
- **Create/Edit Modal**: Sidebar modal with plan details (name, description, monthly/yearly price, trial days, GST, active toggle).
- **Plan Features**: In edit mode, displays and allows editing of plan features (keys, values, unlimited toggle).
- **Delete Confirmation**: Modal with confirmation before deletion.

## Script Logic

```js
definePageMeta({ layout: 'auth' })

// Debounced search (500ms)
watch(search, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    meta.value.page = 1
    store.fetchPlans()
  }, 500)
})

async function savePlan() {
  const resp = editId.value ? await store.updatePlan() : await store.createPlan()
  if (editId.value && features.value.length) {
    await Promise.all(features.value.map(f =>
      store.updateFeature(f.id, { value, unit, is_unlimited })
    ))
  }
  closePlanModal()
  await store.fetchPlans()
}
```

## Key Components Used

- `SubscriptionPlansDataTable` — Table with edit/delete actions
- `UiSidebarModal` — Create/edit form
- `UiModal` — Delete confirmation
- `FormInput`, `FormInputArea` — Form fields
- `UiSwitch` — Active/inactive toggle
- `UiButton`, `UiSearch` — UI controls

## Explanation

- Plans have monthly/yearly pricing, trial days, GST percentage, and active status.
- Features are key-value pairs with optional unlimited flag (e.g., "maxEmployees": 100 or "unlimited").
- Features are saved in bulk after plan creation/update.
