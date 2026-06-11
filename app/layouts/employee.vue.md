# `app/layouts/employee.vue` — Employee Self-Service Layout

## Purpose

Layout for employee-facing pages. Displays employee-specific navigation menu and header with breadcrumbs.

## Template Structure

```vue
<template>
  <div :style="{ backgroundColor: themeStore.bgColor }">
    <UiSidebar :menu-items="menu" :title="title" />
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
import { employee_menu } from '../data/menu'

onMounted(async () => {
  await authStore.loadLocalData()
  if (route.params.organization && route.params.employee) {
    authStore.organization = route.params.organization
    authStore.employee = route.params.employee
    menu.value = employee_menu(route.params.organization, route.params.employee)
    // Set org ID and employee ID headers on Axios
    const { $setOrganizationId, $setEmpId } = useNuxtApp()
    $setOrganizationId(route.params.organization)
    $setEmpId(route.params.employee)
  }
  themeStore.loadColor()
})
```

## Explanation

- Builds the employee menu dynamically from route params (`organization` and `employee`).
- Sets `x-org-id` and `x-employee-id` headers on Axios for API calls scoped to the employee.
- Same sidebar/breadcrumb/color-theme system as the auth layout.
