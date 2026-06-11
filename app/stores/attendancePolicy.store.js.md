# `app/stores/attendancePolicy.store.js` — Attendance Policy Store

## Purpose

Pinia store for managing attendance policies with configurable rules for check-in, overtime, geo-fencing, and rounding.

## State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `policies` | Array | `[]` | List of policies |
| `name` | String | `''` | Policy name |
| `grace_minutes` | Number | `0` | Grace period for late check-in |
| `half_day_minutes` | Number | `360` | Minutes for half day mark |
| `full_day_minutes` | Number | `540` | Minutes for full day mark |
| `allow_geo_checkin` | Boolean | `true` | Enable geo-location check-in |
| `allow_outside_geo` | Boolean | `true` | Allow check-in outside geo-fence |
| `auto_mark_absent` | Boolean | `true` | Auto-mark absent if no check-in |
| `checkin_buffer_min` | Number | `0` | Buffer before shift start |
| `checkout_buffer_min` | Number | `0` | Buffer after shift end |
| `rounding_strategy` | Object | `basic` | How to round time |
| `overtime_allowed` | Boolean | `true` | Enable overtime |
| `min_overtime_minutes` | Number | `0` | Minimum OT duration |

## Key Actions

```js
async fetchPolicies()      // List all policies for organization
async createPolicy()       // Create new policy
async updatePolicy()       // Update existing policy
loadPolicy(policy)         // Load policy into form for editing
resetForm()                // Reset form to defaults
```

## Explanation

- Attendance policies define rules for employee time tracking.
- Rounding strategies control how clock-in/out times are rounded.
- Geo-fencing support with optional outside-geo allowance.
- Overtime configurable with minimum duration threshold.
- Organization-scoped (each org can have multiple policies).
