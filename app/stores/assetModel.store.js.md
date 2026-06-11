# `app/stores/assetModel.store.js` — Asset Models Store

## Purpose

Pinia store for managing asset models with brand, specs, and category association.

## State

| Field | Type | Description |
|-------|------|-------------|
| `models` | Array | Paginated model list |
| `models_select` | Array | Simplified list for dropdowns |
| `category_id` | Object | Associated category |
| `brand, model_name, code` | Strings | Model identifiers |
| `description, specs` | Strings | Model details |
| `category_list` | Array | Category dropdown options |

## Key Actions

```js
async fetchAssetModels()            // Paginated list
async fetchAllAssetModels()         // All models for dropdown
async fetchAllCategories()          // Load category dropdown
async saveAssetModel()              // Create or update
async deleteAssetModel()            // Delete
resetForm()                         // Reset form
```

## Specs Structure

```js
specs: JSON.stringify([
  { key: '', value: '' }
])
```

## Explanation

- Models belong to a category (e.g., "Dell Latitude 5420" under "Laptop").
- Specs stored as JSON array of key-value pairs.
- Dropdown format: `ModelName (Brand)`.
- Used by the assets store for model filtering.
