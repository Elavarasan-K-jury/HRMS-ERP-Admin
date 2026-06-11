# `app/pages/invoices.vue` — Invoices Management Page

## Purpose

Super admin page for viewing and managing organization invoices. Lists all invoices with search, organization filter, pagination, and actions.

## Template

```vue
<template>
  <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll">
    <div class="rounded-lg p-5 bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-between">
      <h2>{{ total }} Invoice(s)</h2>
      <div class="flex items-center gap-2">
        <UiSearch v-model="search" />
        <FormSelect v-model="organization" :options="organizations" placeholder="Select Organization" />
        <UiButton text="Reload" @click="fetchInvoices" />
      </div>
    </div>
    <InvoiceTable :items="invoices" :loading="invoiceLoading" @prev="prevPage" @next="nextPage"
      @view="viewInvoice" @download="downloadInvoice" @regenerate="regenerate" />
  </div>
</template>
```

## Script Logic

```js
definePageMeta({ layout: 'auth' })

const organizations = computed(() => organizationStore.organizations_select)

watch(organization, async () => {
  authStore.organization = organization.value?.value || null
  await fetchInvoices()
})

// Debounced search (350ms)
watch(search, async () => {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(fetchInvoices, 350)
})
```

## Explanation

- Layout: `auth` (super admin).
- Organization filter updates `authStore.organization` and refetches invoices scoped to that org.
- Search is debounced at 350ms to avoid excessive API calls.
- Invoice actions: view, download, and regenerate payment link.
