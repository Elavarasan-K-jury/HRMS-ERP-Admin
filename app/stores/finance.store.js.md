# `app/stores/finance.store.js` — Finance Configuration Store

## Purpose

Pinia store for managing organization finance settings: PF (Provident Fund), ESI (Employee State Insurance), and PTAX (Professional Tax) configuration.

## State

| Field | Type | Description |
|-------|------|-------------|
| `financeEnabledMap` | Object | Cache of org → finance enabled status |
| `financeDetails` | Object | Full finance configuration |
| `pf_enabled, pf_formula, pf_registration_number, pf_registered_organization_name` | — | PF settings |
| `esi_enabled, esi_formula, esi_registration_number, esi_registered_organization_name` | — | ESI settings |
| `ptax_enabled, ptax_formula, ptax_registration_number, ptax_registered_organization_name` | — | PTAX settings |

## Key Actions

```js
async checkFinanceEnabled()         // Check if finance is enabled for org (cached)
async fetchFinanceDetails()         // Full finance configuration
async enablePf()                    // Enable and save PF settings
async enableDisablePf()             // Toggle PF on/off
async enableEsi() / enableDisableEsi()    // ESI management
async enablePtax() / enableDisablePtax()  // PTAX management
```

## Finance Details API

```js
async fetchFinanceDetails() {
  const { data } = await $api.get(`/finance/details/${organizationId}`)
  if (data?.success && data.financeEnabled) {
    // Maps all PF/ESI/PTAX fields to store
    this.financeDetails = { pf_enabled, pf_formula, ... }
  }
}
```

## Explanation

- Finance configuration is cached per organization to avoid redundant API calls.
- Each tax type (PF, ESI, PTAX) has: enabled flag, formula, registration number, and registered org name.
- Separate create and toggle endpoints for each tax type.
- Used by `organization.vue` layout to determine if payroll features should be shown.
