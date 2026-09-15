# `app/stores/onBoarding.store.js` — Employee Onboarding Flow Store

## Purpose

Pinia store for building and managing employee onboarding flows with multi-step processes and dynamic form features.

## State

| Field | Type | Description |
|-------|------|-------------|
| `onBoardingFlows` | Array | List of onboarding flows |
| `name, description, estimated_days` | Form | Flow metadata |
| `flow_id` | String | Current flow being edited |
| `process_steps` | Array | Steps with nested features |

## Process Steps Structure

```js
process_steps: [
  {
    id: null, name: null,
    features: [
      {
        id: null, name: null,
        type: null,           // Input type from constants
        hasOptions: false,
        options: []           // For select/radio fields
      },
    ]
  },
]
```

## Key Actions

```js
async fetchOnboardingFlows()          // Paginated list
async saveOnboarding()                // Create/update flow + steps + features
async deleteOnboardingFlow()          // Delete entire flow
addProcessStep(index)                 // Add step after index
removeProcessStep(index)              // Remove step (with server delete if saved)
deleteProcessStep(id)                 // Delete step from server
addFeature(step_index, feature_index) // Add feature to step
removeFeature(step_index, feature_index) // Remove feature from step
deleteStepFeature(id)                 // Delete feature from server
```

## Explanation

- Onboarding flows are hierarchical: Flow → Steps → Features.
- Each feature has an input type (text, email, select, etc.) with optional options for select/radio fields.
- Supports export/import of flows via encrypted `.jhrmsenc` files (uses `encrypt-download.js` / `decrypt-upload.js`).
- Dynamic add/remove of steps and features during flow editing.
