# `app/stores/organizationSubscription.store.js` — Organization Subscription Store

## Purpose

Pinia store for managing organization subscriptions and invoices.

## State

| Field | Type | Description |
|-------|------|-------------|
| `organizationSubscriptions` | Object | Subscription details |
| `invoices` | Array | Invoice list |
| `page, limit, search` | — | Pagination for invoices |
| `total, total_pages` | — | Invoice metadata |

## Key Actions

```js
async fetchOrganizationSubscription(organizationId)  // Get subscription for org
async fetchOrganizationSubscriptionByOrganization()   // Using auth store org
async fetchInvoices()                                  // Paginated invoice list
async reGeneratePaymentLink(invoiceId)                 // Regenerate payment link
```

## Explanation

- Subscriptions are fetched per organization.
- Invoices can be filtered by organization (if `authStore.organization` is set).
- Payment link regeneration creates a new payment URL for unpaid invoices.
- 500ms loading delay for UI smoothness.
