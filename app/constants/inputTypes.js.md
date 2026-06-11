# `app/constants/inputTypes.js` — Form Input Type Constants

## Purpose

Defines the available form input field types used in the onboarding process feature builder.

## Data

```js
export default [
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Password", value: "password" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Time", value: "time" },
  { label: "File", value: "file" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Select", value: "select" },
]
```

## Explanation

- Used in the onboarding process builder to define field types for each onboarding step feature.
- Covers 10 common input types.
- Each feature in an onboarding step can have a different input type.
