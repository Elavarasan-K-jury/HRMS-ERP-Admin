# `app/stores/hierarchy.store.js` — Organization & Department Hierarchy Store

## Purpose

Pinia store for fetching organization-wide designation hierarchies and department-level reporting hierarchies.

## State

| Field | Type | Description |
|-------|------|-------------|
| `orgHierarchy` | Object | Org-wide hierarchy with levels |
| `deptHierarchy` | Object | Department reporting tree |
| `currentOrgId` | String | Currently selected org |
| `currentDeptId` | String | Currently selected department |

## Key Actions

```js
// Fetch organization-wide designation hierarchy
async fetchOrganizationHierarchy(organizationId) {
  const { data } = await $api.get(`/organizations/${organizationId}/hierarchy`)
  // data.levels = [{ level, label, designation_count, employee_count, designations, employees }]
  this.orgHierarchy = data
}

// Fetch department reporting hierarchy (tree)
async fetchDepartmentHierarchy(organizationId, departmentId) {
  const { data } = await $api.get(
    `/organizations/${organizationId}/departments/${departmentId}/hierarchy`
  )
  // data.hierarchy = { id, full_name, reportees: [...] }
  this.deptHierarchy = data.hierarchy ? data : null
}

resetOrgHierarchy() / resetDeptHierarchy() / resetAll()
```

## Getters

- `hasOrgHierarchy` / `hasDeptHierarchy` — Check if data exists
- `orgLevels` — Array of hierarchy levels
- `deptTree` — Department tree root node

## Explanation

- Two types of hierarchies: designation-based (org-wide) and reporting-based (department-specific).
- Department hierarchy is a recursive tree structure with employees and their reportees.
- 500ms minimum loading delay for UI smoothness.
