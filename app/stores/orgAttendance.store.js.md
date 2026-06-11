# `app/stores/orgAttendance.store.js` — Organization Attendance Store

## Purpose

Pinia store for fetching monthly attendance data at the organization level (admin view).

## State

| Field | Type | Description |
|-------|------|-------------|
| `days` | Array | Daily attendance records for the month |
| `stats` | Object | Monthly attendance statistics |
| `month` | String | Current viewed month (YYYY-MM) |
| `loading` | Boolean | Loading state |

## Key Actions

```js
async fetchMonthlyAttendance(month) {
  const { data } = await $api.get('/attendance/organization-monthly', {
    params: { organization_id: auth.organization, month }
  })
  this.days = data.days || []
  this.stats = data.stats || null
}

reset()  // Clear all data
```

## Getters

```js
totalWorkingDays: (s) => s.days?.length || 0,
totalPresentDays: (s) => s.days?.filter(d =>
  d.attendance?.some(a => a.status !== 'ABSENT')
).length || 0,
```

## Explanation

- Fetches attendance data for the entire organization for a given month.
- `days` array contains records for each day with attendance status.
- `stats` provides aggregate information.
- Used by the organization attendance view components.
