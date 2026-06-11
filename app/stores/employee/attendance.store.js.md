# `app/stores/employee/attendance.store.js` — Employee Attendance Store

## Purpose

Pinia store for fetching an individual employee's attendance records.

## State

| Field | Type | Description |
|-------|------|-------------|
| `attendanceList` | Array | Monthly attendance records |
| `month` | Object | Selected month (value + label) |
| `year` | Object | Selected year (value + label) |
| `loading` | Boolean | Loading state |

## Key Actions

```js
async getAttendancesList() {
  const { data } = await $api.get('/attendance', {
    params: {
      employee_id: authStore.employee,
      month: `${this.year.value}-${pad month}`,
    },
  })
  this.attendanceList = data.attendance
}
```

## Explanation

- Fetches attendance for the employee identified by `authStore.employee`.
- Month format: `YYYY-MM`.
- Defaults to current month and year on mount.
- Used by employee self-service attendance view.
