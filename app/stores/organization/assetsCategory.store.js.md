# `app/stores/assetsCategory.store.js` — Asset Categories Store

## Purpose

Pinia store for managing asset categories (e.g., Laptops, Monitors, Phones).

## State

| Field | Type | Description |
|-------|------|-------------|
| `categories` | Array | Paginated category list |
| `category_list` | Array | Simplified list for dropdowns |
| `name, code, description` | Strings | Category form fields |
| `is_active` | Boolean | Active flag |

## Key Actions

```js
async fetchAssetsCategories()       // Paginated list
async fetchAllAssetsCategories()    // All categories for dropdown
async saveAssetsCategory()          // Create or update
async deleteAssetsCategory()        // Delete
```

## Explanation

- Categories have name, code, description, and active status.
- Dropdown format: `Name (CODE)`.
- Used by asset model and asset stores for filtering.
- Server-side pagination and search.
