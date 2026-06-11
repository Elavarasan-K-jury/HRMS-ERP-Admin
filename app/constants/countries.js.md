# `app/constants/countries.js` — Country Data Constants

## Purpose

Provides two exported arrays used across the application for country selection dropdowns:

- **`countries`** — Country names with flags for general selection
- **`countryCodes`** — Country names with dialing codes for phone input

## Country Data

```js
export const countries = [
  { label: 'United States', value: 'us', icon: 'circle-flags:us' },
  { label: 'India', value: 'in', icon: 'circle-flags:in' },
  // ... 40+ countries across all continents
  { label: 'Other / Global', value: 'global', icon: 'lucide:globe' },
]

export const countryCodes = [
  { label: 'India (+91)', value: '+91', icon: 'circle-flags:in' },
  // ... 50+ country codes
  { label: 'Other / Global (+000)', value: '+000', icon: 'lucide:globe' },
]
```

## Explanation

- Covers 6 continents: North America, South America, Europe, Asia, Africa, Oceania.
- Uses `circle-flags` icon set for flag display.
- Fallback "Other / Global" entry for unlisted countries.
- Country codes are used in employee/org contact forms.
