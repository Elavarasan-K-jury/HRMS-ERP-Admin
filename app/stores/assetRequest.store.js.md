# `app/stores/assetRequest.store.js` — Asset Request Store

## Purpose

Pinia store for managing employee asset requests with approve/reject workflow.

## State

| Field | Type | Description |
|-------|------|-------------|
| `asset_requests` | Array | Paginated request list |
| `selectedRequest` | Object | Request being processed |
| `approveModal, rejectionModal` | Boolean | Modal visibility |
| `reason` | String | Rejection reason (mandatory) |

## Key Actions

```js
async fetchAssetRequests()           // Paginated list
async approveAssetRequest()          // Approve pending request
async rejectAssetRequest()           // Reject with reason
```

## Approval Flow

```js
// Approve
await $api.put(`/asset-requests/${id}/status`, {
  status: 'APPROVED',
  approved_by: auth.admin.id,
  approved_at: new Date().toLocaleString('en-IN', { ... })
})

// Reject (reason is mandatory)
await $api.put(`/asset-requests/${id}/status`, {
  status: 'REJECTED',
  rejection_reason: this.reason,
  ...
})
```

## Explanation

- Employees submit asset requests which admins can approve or reject.
- Rejection requires a mandatory reason.
- Approval/Rejection timestamps are formatted in Indian locale.
- After processing, the request list is refreshed.
