# `app/stores/salaryTemplate.store.js` — Salary Template Store

## Purpose

Pinia store for managing salary templates — groups of salary components assigned to departments/designations.

## State

| Field | Type | Description |
|-------|------|-------------|
| `templates` | Array | Paginated template list |
| `templatesSelect` | Array | Simplified list for dropdowns |
| `templateId` | String | Current template being edited |
| `form` | Object | { name, description, departments, designations, isDefault, isActive, components } |
| `builder` | Object | { components, template } — template builder data |
| `viewModal` | Boolean | Template detail view modal |

## Key Actions

```js
async fetchTemplates()                      // Paginated list
async fetchTemplatesForSelect()             // All templates for dropdown
async loadTemplate(template)                // Load template into edit form
async fetchBuilderData(template, details)   // Load template builder data
async saveTemplate()                        // Create or update
async deleteTemplate(templateId)            // Delete template
resetForm()                                 // Reset form state
```

## Template Form

```js
form: {
  name: "",
  description: "",
  departments: [],      // Array of { value, label }
  designations: [],     // Array of { value, label }
  isDefault: false,
  isActive: true,
  components: []        // TemplateComponent rows (commented out in current version)
}
```

## Explanation

- Templates are scoped to an organization.
- Can be assigned to specific departments and designations.
- Template builder allows configuring salary components per template.
- IS_ACTIVE and isDefault flags control template behavior.
