<template>
    <div class="relative min-h-screen overflow-hidden" :style="{ backgroundColor: themeStore.bgColor }">

        <div v-if="!preloader" class="pointer-events-none absolute bottom-2 right-2 z-[100]">
            <a href="https://www.jurysoft.com" target="_blank" rel="noopener noreferrer" class="pointer-events-auto group inline-flex items-center gap-1.5 rounded-full
               bg-black/50 backdrop-blur-md ring-1 ring-white/25
               px-3 py-1.5 text-[11px] leading-none font-medium text-white/90
               shadow-lg shadow-black/30 transition
               hover:bg-black/60 hover:text-white
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Powered by Jurysoft (opens in a new tab)">
                <span aria-hidden="true"></span>
                <span class="hidden sm:inline opacity-80">Powered by</span>
                <span class="sm:ml-1 underline underline-offset-2 decoration-white/40 group-hover:decoration-white">
                    Jurysoft
                </span>
            </a>
        </div>

        <!-- Sidebar -->
        <UiSidebar v-if="!preloader" :menu-items="activeMenu" :title="title" :titleShort="titleShort" />

        <UiColorSidebar />

        <!-- Main wrapper -->
        <div v-if="!preloader" :class="sidebar ? 'ml-[250px]' : 'ml-[85px]'" class="transition-all duration-300">
            <UiHeader :breadcrumbs="breadcrumbs" @toggleSidebar="toggleSidebar" />

            <main class="mt-[60px] text-white">
                <slot />
            </main>
        </div>

        <div v-if="preloader" class="w-full h-screen backdrop-blur-xl bg-white/10 flex items-center justify-center">
            <UiLoader />
        </div>

        <IpRestrictedModal />
    </div>
</template>

<script setup>
import { menu, employee_menu } from '../data/menu'
import { useThemeStore } from '../stores/shared/theme.store'
import { useAuthStore } from '../stores/shared/auth.store'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isEmployee = computed(() => authStore.scope === 'employee')
const user = computed(() => authStore.user)

const title = computed(() => {
    if (isEmployee.value) return authStore.user?.organization?.name || 'JURY-HRMS'
    return 'JURY-HRMS'
})

const titleShort = computed(() => {
    const name = authStore.user?.organization?.name
    if (!name) return 'JH'
    const nameSplitted = name.split(' ')
    if (nameSplitted.length > 2) {
        return `${nameSplitted[0][0]}${nameSplitted[1][0]}`
    } else {
        return nameSplitted.map(e => e[0]).join('')
    }
})

const activeMenu = computed(() => {
    if (isEmployee.value) {
        const orgId = authStore.organization
        const empId = authStore.employee
        if (orgId && empId) {
            return employee_menu()
        }
        return []
    }
    return menu
})

const sidebar = computed(() => themeStore.sidebar)
const preloader = computed(() => themeStore.preloader)
const toggleSidebar = () => themeStore.toggleSidebar()

function findBreadcrumb(menuGroups, path, parents = []) {
    for (const group of menuGroups) {
        for (const item of group.items) {
            if (item.path === path) return [...parents, group.group, item.label]

            if (item.children) {
                const found = findBreadcrumb(
                    [{ group: item.label, items: item.children }],
                    path,
                    [...parents, group.group]
                )
                if (found.length) return found
            }
        }
    }
    return []
}

const breadcrumbs = computed(() => {
    const found = findBreadcrumb(activeMenu.value, route.path)
    return found.length ? found : ['Dashboard']
})

onMounted(async () => {
    try {
        await authStore.loadLocalData()
        themeStore.loadColor()
    } catch (err) {
        console.error('[Layout] loadLocalData failed:', err)
        if (authStore.accessToken) {
            await authStore.logout('/login')
        }
    } finally {
        themeStore.preloader = false
    }
});
</script>
