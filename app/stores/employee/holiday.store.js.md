# `app/stores/employee/holiday.store.js` — Employee Holiday Store

## Purpose

Pinia store for employees to view organization holidays with upcoming holiday calculation.

## State

| Field | Type | Description |
|-------|------|-------------|
| `holidays` | Array | All holidays for the organization |
| `upcomingHoliday` | Object | Next upcoming holiday |
| `filter_year` | Number | Selected year for filtering |

## Key Actions

```js
async fetchAllHolidays() {
  const { data } = await $api.get('/holidays', {
    params: { organization_id: auth.organization }
  })
  this.holidays = data.holidays || []
  this.computeUpcomingHoliday()
}

computeUpcomingHoliday() {
  // Maps holidays, filters those >= today, sorts by date, takes first
  const upcoming = this.holidays
    .map(h => ({ ...h, _key: normalize(h.date) }))
    .filter(h => h._key && h._key >= todayKey)
    .sort((a, b) => a._key > b._key ? 1 : -1)[0]
  this.upcomingHoliday = upcoming || null
}

getHolidaysByYear() {
  // Filter holidays by selected year
  return this.holidays.filter(h =>
    new Date(h.date).getFullYear() === Number(this.filter_year)
  )
}
```

## Explanation

- Read-only holiday view for employees (no CRUD).
- Automatically computes the next upcoming holiday (including today's).
- Multi-format date normalization (ISO 8601, JS Date, or null).
- Filterable by calendar year.
