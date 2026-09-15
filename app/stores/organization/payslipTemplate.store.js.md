# `app/stores/payslipTemplate.store.js` — Payslip Template Store

## Purpose

Pinia store for managing EJS-based payslip templates with rendering, saving, and variable management.

## State

| Field | Type | Description |
|-------|------|-------------|
| `templates` | Array | List of payslip templates |
| `variables` | Array | Template variables for EJS rendering |
| `selectedTemplate` | Object | Currently selected template |
| `ejsContent` | String | EJS template HTML content |
| `renderedHtml` | String | Rendered payslip HTML |
| `saving` | Boolean | Save operation in progress |

## Key Actions

```js
async fetchTemplates()                       // List all templates
async fetchTemplateByPath(templatePath)      // Load template details + variables + EJS content
async saveTemplate(payload)                  // Save template (name, path, ejs_content, variables)
async renderTemplate(payload)                // Render template with variables → HTML
```

## Template Rendering

```js
async renderTemplate(payload) {
  const resp = await $api.post("/payslip-templates/render", {
    organization_id: auth.organization,
    ...payload,  // ejs_content, variables, etc.
  })
  if (resp.data?.success) {
    this.renderedHtml = resp.data.html_content
    this.renderedTemplatePath = resp.data.template_path
    this.renderedTemplateName = resp.data.template_name
  }
}
```

## Explanation

- Templates use EJS (Embedded JavaScript) templating engine for dynamic payslip generation.
- Variables are calculated/synced from the server during rendering.
- Save and render are separate API calls.
- Organization-scoped (each org can have custom payslip templates).
