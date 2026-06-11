# `app/stores/employee/salary.store.js` — Employee Salary Store

## Purpose

Pinia store for employees to view salary revisions, preview salary structures, and request salary updates.

## State

| Field | Type | Description |
|-------|------|-------------|
| `revisions` | Array | List of salary revisions |
| `salaryUpdateModal` | Boolean | Show update modal |
| `template` | Object | Selected salary template |
| `grossAmount` | Number | Annual gross amount |
| `effectiveFrom` | Date | Effective date for revision |
| `status` | Object | Status: ACTIVE, INACTIVE, SUPERSEDED |
| `isCurrentActive` | Boolean | Whether current revision is active |
| `deductFromInHand` | Boolean | Deduct from in-hand salary |
| `salaryCalculated` | Object | Preview of calculated structure |

## Key Actions

```js
async fetchAllSalaryRevisions()     // All revisions for current employee
async previewSalaryStructure()      // Preview structure before assigning
async fetchDetailedSalary(id)       // Detailed structure of a revision
async assignSalaryStructure()       // Assign new salary structure
```

## Salary Preview

```js
async previewSalaryStructure() {
  const { data } = await $api.post('/salary/structure/preview', {
    templateId: this.template.value,
    grossAnnual: Number(this.grossAmount)
  })
  this.salaryCalculated = data.structure
}
```

## Explanation

- Employee-specific salary management.
- Salary structure is computed from a template + gross amount.
- Preview shows detailed breakdown before assignment.
- Revisions track historical salary changes.
- Each revision has a status and effective date.
