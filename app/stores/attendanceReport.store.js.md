# `app/stores/attendanceReport.store.js` — Attendance Report Store

## Purpose

Pinia store for generating and viewing attendance reports with auto-refresh for pending reports.

## State

| Field | Type | Description |
|-------|------|-------------|
| `reports` | Array | List of generated reports |
| `singleReport` | Object | Single report details |
| `page, limit, total` | — | Pagination state |
| `department_id, designation_id, employee_id` | Filter | Report generation filters |
| `start_date, end_date` | Date | Date range filter |

## Key Actions

```js
async fetchReports({ page, limit })     // List reports with auto-refresh
async fetchReportById(reportId)         // Single report details
async generateReport()                  // Generate new report
resetGenerateForm()                     // Reset filter form
```

## Auto-Refresh Feature

```js
// Automatically polls every 2 seconds while reports are pending
const hasPending = this.reports.some(r =>
  r.status !== 'COMPLETED' && r.status !== 'FAILED'
)
if (hasPending) {
  refreshInterval = setInterval(() => {
    this.fetchReports({ page: this.page, limit: this.limit })
  }, 2000)
}
```

## Explanation

- Reports are generated asynchronously with status tracking (PENDING → COMPLETED/FAILED).
- Auto-refresh polls every 2 seconds until all reports complete or fail.
- Filters include department, designation, employee, and date range.
- Report ID validation (must be 24-character MongoDB ObjectId).
