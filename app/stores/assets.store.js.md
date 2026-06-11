# `app/stores/assets.store.js` — Asset Management Store

## Purpose

Pinia store for managing organization assets: CRUD, assignment to employees, and listing with filters.

## State

| Field | Type | Description |
|-------|------|-------------|
| `assets` | Array | Paginated asset list |
| `category_id, model_id` | Objects | Filter dropdowns |
| `serial_number, asset_tag` | Strings | Asset identifiers |
| `user_name, password` | Strings | Asset credentials |
| `purchase_date, warranty_expire` | Dates | Asset lifecycle |
| `status, location` | — | Asset status and location |
| `addModal` | Boolean | Show add/edit modal |
| `assignModal` | Boolean | Show assign modal |
| `selectedAsset` | Object | Asset being assigned/deleted |
| `employeeId, condition_assign, notes` | — | Assignment form |

## Key Actions

```js
async fetchAssets()                    // Paginated list with filters
async createAsset()                    // Create new asset
async updateAsset()                    // Update existing asset
async deleteAssets()                   // Delete asset
async assignAssetToEmployee()          // Assign asset to employee
resetForm()                            // Reset create/edit form
```

## Asset Assignment

```js
async assignAssetToEmployee() {
  const { data } = await $api.post("/asset-assignments", {
    organization_id: auth.organization,
    asset_id: this.selectedAsset.id,
    employee_id: this.employeeId.value,
    assigned_date: new Date().toLocaleString('en-IN', { ... }),
    condition_assign: this.condition_assign?.value ?? 'GOOD',
    status: this.assignStatus?.value || 'ASSIGNED',
    notes: this.notes
  })
}
```

## Explanation

- Assets belong to categories and models.
- Assets can be assigned to employees with condition status and notes.
- Validation requires employee and condition selection before assignment.
- Status field controls asset lifecycle (AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED).
