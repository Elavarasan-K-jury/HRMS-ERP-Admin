# `app/stores/holiday.store.js` — Holiday Management Store

## Purpose

Pinia store for managing organization holidays with CRUD, calendar view, and filtering.

## State

| Field | Type | Description |
|-------|------|-------------|
| `holidays` | Array | List of holidays |
| `calendar` | Array | Calendar day-by-day view |
| `holiday_id` | String | ID for edit/delete |
| `date, name, region, type` | Form | Holiday form fields |
| `policy_id` | String | Associated attendance policy |
| `filter_year, filter_type, filter_region, filter_policy` | Filters | Holiday filtering |

## Key Actions

```js
async fetchHolidays()              // List with filters
async fetchHolidayById(id)         // Single holiday
async createHoliday()              // Create holiday
async updateHoliday()              // Update holiday
async deleteHoliday(id)            // Delete holiday
async fetchHolidayCalendar(month)  // Monthly calendar view
resetForm()                        // Reset form fields
```

## Explanation

- Holidays have type: `PUBLIC` (default), `OPTIONAL`, `RESTRICTED`.
- Can be associated with a specific attendance policy.
- Calendar view returns day-by-day data for a given month (YYYY-MM format).
- Supports filtering by year, type, region, and policy.
