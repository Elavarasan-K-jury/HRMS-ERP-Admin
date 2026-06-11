# `app/stores/expense.store.js` — Expense Management Store

## Purpose

Pinia store for managing employee expense requests with approval/rejection workflow.

## State

| Field | Type | Description |
|-------|------|-------------|
| `expenses` | Array | List of expense requests |
| `type` | Object | Expense type filter (ALL, TRAVEL, FOOD, ACCOMMODATION, OTHER) |
| `status` | Object | Status filter (ALL, PENDING, APPROVED, REJECTED) |
| `fromDate, toDate` | Date | Date range filter |
| `employeeId` | String | Employee filter |
| `search` | String | Search query |

## Key Actions

```js
async fetchExpenseRequests()        // List with all filters
async approveExpenseRequest(id)     // Approve expense
async rejectExpenseRequest(id)      // Reject expense
```

## Approval Flow

```js
async approveExpenseRequest(id) {
  const { data } = await $api.patch(
    `/organisation/${organizationId}/expense/${id}/status`,
    { approver_id: 'SUPER_ADMIN', status: 'APPROVED' }
  )
  // Shows success toast and refreshes list
}
```

## Explanation

- Expenses are organization-scoped via `authStore.organization`.
- Super admin acts as the approver (`approver_id: 'SUPER_ADMIN'`).
- Supports filtering by type, status, date range, employee, and search.
- Pagination with server-side total count.
