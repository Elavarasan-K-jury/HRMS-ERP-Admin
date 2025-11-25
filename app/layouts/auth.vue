<template>
    <!-- Main background controlled by themeStore.bgColor -->
    <div class="relative min-h-screen overflow-hidden" :style="{ backgroundColor: themeStore.bgColor }">

        <div v-if="!preloader" class="pointer-events-none absolute bottom-2 right-2 z-[100]">
            <a href="https://www.jurysoft.com" target="_blank" rel="noopener noreferrer" class="pointer-events-auto group inline-flex items-center gap-1.5 rounded-full
               bg-black/50 backdrop-blur-md ring-1 ring-white/25
               px-3 py-1.5 text-[11px] leading-none font-medium text-white/90
               shadow-lg shadow-black/30 transition
               hover:bg-black/60 hover:text-white
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Powered by Jurysoft (opens in a new tab)">
                <span aria-hidden="true">✨</span>
                <span class="hidden sm:inline opacity-80">Powered by</span>
                <span class="sm:ml-1 underline underline-offset-2 decoration-white/40 group-hover:decoration-white">
                    Jurysoft
                </span>
            </a>
        </div>

        <!-- Sidebar -->
        <UiSidebar v-if="!preloader" :menu-items="menu" :title="title" />

        <!-- 🎨 Color Picker Sidebar -->
        <UiColorSidebar />

        <!-- Main wrapper (shifts right when sidebar expands) -->
        <div v-if="!preloader" :class="sidebar ? 'ml-[250px]' : 'ml-[85px]'" class="transition-all duration-300">
            <UiHeader :breadcrumbs="breadcrumbs" @toggleSidebar="toggleSidebar" />
            <main class="mt-[60px] text-white">
                <slot />
            </main>
        </div>

        <div v-if="preloader" class="w-full h-screen backdrop-blur-xl bg-white/10 flex items-center justify-center">
            <UiLoader />
        </div>

    </div>
</template>

<script setup>
import { menu } from '../data/menu'
import { useThemeStore } from '../stores/theme.store'
import { useAuthStore } from '../stores/auth.store'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const title = 'JURY-HRMS'
const sidebar = computed(() => themeStore.sidebar)
const preloader = computed(() => themeStore.preloader)
const toggleSidebar = () => themeStore.toggleSidebar()

/* 🧭 Recursive breadcrumb resolver */
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

/* 🧠 Auto-generate breadcrumbs */
const breadcrumbs = computed(() => {
    const found = findBreadcrumb(menu, route.path)
    return found.length ? found : ['Dashboard']
})

onMounted(async () => {
    try {
        await authStore.loadLocalData()
        themeStore.loadColor()
    } catch (err) {
        console.error('[Layout] loadLocalData failed:', err)
        await authStore.logout('/login')
    } finally {
        setTimeout(() => {
            themeStore.preloader = false
        }, 1000)
    }
});
</script>
