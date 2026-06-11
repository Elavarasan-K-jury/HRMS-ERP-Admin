# `app/pages/organization/list.vue` — Organization List Page

## Purpose

Super admin page for listing, creating, editing, and deleting organizations with full address, plan, and limits management.

## Template

- **Header**: Title with total count, search with suggestions, "Add Organization" and "Reload" buttons.
- **Data Table**: `OrganizationDataTable` component with pagination.
- **Sidebar Modal**: Full form for organization details:
  - Basic info: name, domain, GST, email, contact person
  - Industry selection from `constants/industries.js`
  - Address fields: street, area, city, state, country, pincode
  - Plan & limits: subscription plan, payment duration, max employees, storage, API rate, payroll runs, leave policies, admin accounts
- **Delete Modal**: Confirmation dialog.

## Script Logic

```js
// Plan selection auto-fills limits from plan features
watch(plan, (val) => {
  if (val) {
    const planDetails = subscriptionPlanStore.plan_list.find(e => e.id == val.value)
    create.value.limits = {
      maxEmployees: planDetails.features.find(e => e.key == 'max_employees').value,
      storageGb: planDetails.features.find(e => e.key == 'storage_gb').value,
      // ... all limits auto-filled from plan
    }
  }
})

// On edit mode, loads existing subscription data
async function edit(org) {
  const subscription = await organizationSubscriptionStore.fetchOrganizationSubscription(org.id)
  plan.value = { value: subscription.plan_id, label: subscription.plan_name }
  planDuration.value = subscription.billing_interval
}
```

## Explanation

- When creating, selecting a plan auto-fills resource limits from the plan features.
- On edit, loads the current subscription and pre-fills the form.
- Search is debounced at 500ms.
- Uses `FormSelect` with searchable mode for industry, country, and plan selection.
