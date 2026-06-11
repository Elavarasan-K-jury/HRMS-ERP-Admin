# `app/constants/designations.js` — Designation Level Constants

## Purpose

Provides a list of standard career level designations used in the designation management module.

## Data

```js
export default [
  { label: "Entry Level", value: "entry_level" },
  { label: "Junior Level", value: "junior_level" },
  { label: "Intermediate / Associate Level", value: "intermediate_level" },
  { label: "Senior / Specialist Level", value: "senior_level" },
  { label: "Lead / Supervisor Level", value: "lead_level" },
  { label: "Managerial Level", value: "managerial_level" },
  { label: "Senior Management", value: "senior_management" },
  { label: "Executive Level", value: "executive_level" },
  { label: "Board / Governance Level", value: "board_level" }
]
```

## Explanation

- 9 levels from entry to board level.
- Used in the designation store (`designation.store.js`) when creating/editing designations.
- Values are snake_case for API compatibility.
