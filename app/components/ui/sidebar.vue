<template>
    <aside class="fixed left-0 top-0 h-full flex flex-col text-white shadow-xl
           border-r border-white/20 backdrop-blur-xl bg-white/10
           transition-[width,background,backdrop-filter] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        :class="sidebar ? 'w-[250px]' : 'w-[85px]'">
        <!-- Logo / Title -->
        <div
            class="flex items-center justify-center border-b border-white/20 font-semibold h-[60px] relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="block w-[200px] text-center">
                    <transition name="fade" mode="out-in">
                        <span :key="sidebar" class="inline-block">
                            {{ sidebar ? title : titleShort }}
                        </span>
                    </transition>
                </span>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-4 px-3 pt-4 overflow-y-auto glass-scroll">
            <div v-for="group in menuItems" :key="group.group" class="space-y-2">
                <!-- Group Title -->
                <transition name="fade" mode="out-in">
                    <h2 v-if="sidebar" class="text-xs font-semibold uppercase tracking-wider text-white/50 px-3">
                        {{ group.group }}
                    </h2>
                </transition>

                <!-- Group Items -->
                <div class="space-y-1">
                    <div v-for="item in group.items" :key="item.path || item.label" class="relative">
                        <!-- Top-level item (with or without children) -->
                        <div :class="[
                            'group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/10 relative overflow-hidden cursor-pointer',
                            isActiveItem(item) ? 'bg-white/20 text-white shadow-md' : 'text-white/70'
                        ]" @click="onItemClick(item)" @keydown.enter.prevent="onItemClick(item)" role="button"
                            tabindex="0" :aria-expanded="hasChildren(item) ? String(isOpen(item)) : undefined"
                            :title="!sidebar ? item.label : undefined">
                            <Icon :name="item.icon"
                                class="w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />

                            <transition v-if="sidebar" name="fade" mode="out-in">
                                <span v-if="sidebar" class="text-sm font-medium whitespace-nowrap opacity-90"
                                    :key="item.label">
                                    {{ item.label }}
                                </span>
                            </transition>

                            <!-- Caret for items with children -->
                            <Icon v-if="hasChildren(item) && sidebar"
                                :name="isOpen(item) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                                class="ml-auto w-4 h-4 opacity-80 transition-transform" />
                        </div>

                        <!-- Collapsible children (when sidebar is expanded) -->
                        <transition name="collapse">
                            <div v-if="hasChildren(item) && isOpen(item) && sidebar"
                                class="mt-1 ml-3 pl-4 space-y-1 border-l border-white/10">
                                <NuxtLink v-for="child in item.children" :key="child.path" :to="child.path"
                                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                                    :class="route.path === child.path ? 'bg-white/15 text-white' : ''">
                                    <Icon :name="child.icon || 'lucide:dot'" class="w-4 h-4 opacity-80" />
                                    <span class="text-sm">{{ child.label }}</span>
                                </NuxtLink>
                            </div>
                        </transition>

                        <!-- Flyout children (when sidebar is collapsed) -->
                        <div v-if="hasChildren(item) && !sidebar"
                            class="absolute left-full top-0 ml-2 min-w-[220px] z-40">
                            <div class="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto
                       transition-opacity duration-200">
                                <div
                                    class="rounded-xl border border-white/15 bg-[rgba(20,20,30,0.7)] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.35)] p-2">
                                    <div class="px-2 py-1.5 text-xs uppercase tracking-wider text-white/60">
                                        {{ item.label }}
                                    </div>
                                    <NuxtLink v-for="child in item.children" :key="child.path" :to="child.path"
                                        class="flex items-center gap-2 px-3 py-2 rounded-lg text-white/85 hover:bg-white/10 transition-colors"
                                        :class="route.path === child.path ? 'bg-white/15 text-white' : ''">
                                        <Icon :name="child.icon || 'lucide:dot'" class="w-4 h-4 opacity-80" />
                                        <span class="text-sm">{{ child.label }}</span>
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Footer -->
        <div class="mt-auto py-4 text-center border-t border-white/10 text-xs text-white/60 relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center">
                <transition name="fade" mode="out-in">
                    <div :key="sidebar">
                        © {{ new Date().getFullYear() }}
                        <br v-if="!sidebar" />
                        Jurysoft
                    </div>
                </transition>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useThemeStore } from '~/stores/theme.store'

const themeStore = useThemeStore()
const sidebar = computed(() => themeStore.sidebar)

const props = defineProps({
    title: { type: String, default: 'JURY-HRMS' },
    titleShort: { type: String, default: 'JH' },
    menuItems: {
        type: Array,
        default: () => [
            {
                group: 'Core HR',
                items: [
                    { label: 'Dashboard', path: '/dashboard', icon: 'lucide:layout-dashboard' },
                    {
                        label: 'Employees',
                        path: '/employees',
                        icon: 'lucide:users',
                        children: [
                            { label: 'All Employees', path: '/employees', icon: 'lucide:user-circle-2' },
                            { label: 'Categories', path: '/employees/categories', icon: 'lucide:tags' },
                            { label: 'Trainees', path: '/employees/trainees', icon: 'lucide:graduation-cap' },
                            { label: 'Onboarding', path: '/employees/onboarding', icon: 'lucide:badge-check' },
                        ],
                    },
                    { label: 'Departments', path: '/departments', icon: 'lucide:building-2' },
                ],
            },
            {
                group: 'Payroll',
                items: [
                    { label: 'Payroll', path: '/payroll', icon: 'lucide:wallet' },
                    { label: 'Attendance', path: '/attendance', icon: 'lucide:calendar-clock' },
                    { label: 'Leave', path: '/leave', icon: 'lucide:plane' },
                ],
            },
            {
                group: 'Reports & Analytics',
                items: [
                    { label: 'Reports', path: '/reports', icon: 'lucide:bar-chart' },
                    { label: 'Analytics', path: '/analytics', icon: 'lucide:activity' },
                ],
            },
        ],
    },
})

const route = useRoute()
const router = useRouter()

/** Open-state map for items with children (keyed by path or label) */
const openMap = reactive(new Map())

const keyOf = (item) => item.path || item.label

const hasChildren = (item) => Array.isArray(item.children) && item.children.length > 0

const isChildActive = (item) =>
    hasChildren(item) && item.children.some((c) => route.path.startsWith(c.path))

const isSelfActive = (item) => !!item.path && route.path === item.path

const isActiveItem = (item) => isSelfActive(item) || isChildActive(item)

/** read open state */
const isOpen = (item) => !!openMap.get(keyOf(item))

/** toggle open (or navigate if no children) */
function onItemClick(item) {
    if (hasChildren(item)) {
        openMap.set(keyOf(item), !isOpen(item))
    } else if (item.path) {
        router.push(item.path)
    }
}

/** Ensure correct submenu is open if current route matches a child */
function syncOpenFromRoute() {
    props.menuItems.forEach((group) => {
        group.items.forEach((item) => {
            if (!hasChildren(item)) return
            const shouldOpen = isChildActive(item)
            openMap.set(keyOf(item), shouldOpen)
        })
    })
}

onMounted(syncOpenFromRoute)
watch(() => route.path, syncOpenFromRoute);
</script>

<style scoped>
/* fades */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* collapse height animation */
.collapse-enter-active,
.collapse-leave-active {
    overflow: hidden;
    transition: height 0.25s ease;
}

.collapse-enter-from,
.collapse-leave-to {
    height: 0;
}

/* Scroll aesthetics (glass) */
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 8px;
}

.glass-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 9999px;
    backdrop-filter: blur(8px);
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: linear-gradient(180deg, #1b6594aa, #392651aa, #9c3c1baa);
}

/* Divider between groups */
nav>div:not(:last-child)::after {
    content: '';
    display: block;
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 8px 0;
}
</style>
