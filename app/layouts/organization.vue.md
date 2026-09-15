# `app/layouts/organization.vue` — Organization Admin Layout

## Purpose

Layout for organization-specific admin pages. Displays organization name in sidebar and loads org-specific menu.

## Template Structure

```vue
<template>
  <div :style="{ backgroundColor: themeStore.bgColor }">
    <UiSidebar :menu-items="menu" :title="title" :titleShort="titleShort" />
    <UiColorSidebar />
    <div :class="sidebar ? 'ml-[250px]' : 'ml-[85px]'">
      <UiHeader :breadcrumbs="breadcrumbs" @toggleSidebar="toggleSidebar" />
      <main><slot /></main>
    </div>
    <UiLoader v-if="preloader" />
  </div>
</template>
```

## Script Logic

```js
import { organization_menu } from '../data/menu'
import { useOrganizationStore } from '../stores/organization/organization.store'
import { useFinanceStore } from '../stores/super-admin/finance.store'

const title = computed(() => organizationStore.organization.name)
const titleShort = computed(() => {
  const name = organizationStore.organization.name
  const parts = name.split(' ')
  return parts.length > 2 ? `${parts[0][0]}${parts[1][0]}` : parts.map(e => e[0]).join('')
})

onMounted(async () => {
  await authStore.loadLocalData()
  if (route.params.organization) {
    await organizationStore.saveOrganization(route.params.organization)
    menu.value = organization_menu(route.params.organization)
    await financeStore.checkFinanceEnabled()
    $setOrganizationId(route.params.organization)
    $setEmpId(null)
  }
  themeStore.loadColor()
})
```

## Explanation

- Sidebar title dynamically shows the organization name with an abbreviated short form for collapsed mode.
- On mount, loads the organization details, builds the org menu, checks if finance module is enabled.
- Clears the employee ID header (null) since this is org-level admin view.
