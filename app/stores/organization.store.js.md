# `app/stores/organization.store.js` — Organization Management Store

## Purpose

Comprehensive Pinia store for managing tenant organizations: CRUD operations, subscription assignment, pagination, and search.

## State

| Field | Type | Description |
|-------|------|-------------|
| `organizations` | Array | List of organizations |
| `organizations_select` | Array | Simplified list for dropdowns |
| `organization` | Object | Currently selected organization details |
| `meta` | Object | Pagination: page, limit, total, search, sort |
| `create` | Object | Form state for create/edit (name, domain, gst, address, limits, plan) |
| `editId` | String | ID of organization being edited |
| `deleteId` | String | ID of organization to delete |

## Key Actions

```js
async fetchOrganizations()          // Paginated list with sort/search
async fetchOrganizationsForSelect() // Simplified list for dropdowns
async createOrganization()          // Create + optionally assign subscription plan
async updateOrganization()          // Update + optionally assign subscription plan
async saveOrganization(id)          // Fetch single org and set as current
async deleteOrganization()          // Delete with confirmation
nextPage() / prevPage() / setSort() // Pagination & sorting
```

## Form Fields (create/edit)

```js
create: {
  name: null, domain: null, gst_number: null, email: null,
  contact_person_name: null, contact_person_number: null,
  industry: null, size: null, plan: null, plan_duration: null,
  address: { streetName, streetNumber, landmark, area, locality, city, state, country, postalCode },
  limits: { maxEmployees, storageGb, apiRatePerMinute, payrollRunsPerMonth, maxLeavePolicies, maxAdmins },
}
```

## Explanation

- When creating/updating an org with a plan, it also creates a subscription via `/organizations/{id}/subscription`.
- Address is serialized to JSON for API transmission.
- Uses toast notifications for success/error feedback.
- Sorting and searching are server-side (passed as query params).
