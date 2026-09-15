<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div class="text-center p-8">
            <Icon :name="statusIcon" class="w-16 h-16 mx-auto mb-4" :class="statusColor" />
            <h1 class="text-4xl font-bold mb-2">{{ statusCode }}</h1>
            <p class="text-white/70 text-lg mb-8">{{ statusMessage }}</p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <NuxtLink 
                    :to="homePath" 
                    class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-400 text-slate-900 font-semibold transition-colors"
                >
                    <Icon name="ion:home-outline" class="w-5 h-5" />
                    Go to {{ homeLabel }}
                </NuxtLink>
                <button 
                    @click="goBack" 
                    class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/20"
                >
                    <Icon name="ion:arrow-back-outline" class="w-5 h-5" />
                    Go Back
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/shared/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const props = defineProps({
    statusCode: { type: [Number, String], default: 404 },
    statusMessage: { type: String, default: 'Page Not Found' }
})

const statusColor = computed(() => {
    if (props.statusCode >= 500) return 'text-red-400'
    if (props.statusCode >= 400) return 'text-amber-400'
    return 'text-blue-400'
})

const statusIcon = computed(() => {
    if (props.statusCode >= 500) return 'ion:alert-circle-outline'
    if (props.statusCode >= 400) return 'ion:warning-outline'
    return 'ion:information-circle-outline'
})

// Resolve the home target using three sources, in priority order:
// 1) the current route's :organization param (most accurate — the user is inside that org),
// 2) the logged-in admin's own organization_id,
// 3) the super-admin flag (no org) -> platform dashboard.
const orgIdFromRoute = computed(() => route.params.organization)

const resolvedOrgId = computed(
    () => orgIdFromRoute.value || authStore.admin?.organization_id || authStore.organization || null
)

const homePath = computed(() => {
    if (authStore.isEmployee) return '/employee'
    if (resolvedOrgId.value) return `/organization/${resolvedOrgId.value}/dashboard`
    if (authStore.isSuperAdmin) return '/'
    return '/login'
})

const homeLabel = computed(() => {
    if (authStore.isEmployee) return 'Employee Dashboard'
    if (resolvedOrgId.value) return 'Org Admin Dashboard'
    if (authStore.isSuperAdmin) return 'Super Admin Dashboard'
    return 'Login'
})

function goBack() {
    if (window.history.length > 1) {
        window.history.back()
    } else {
        navigateTo(homePath.value)
    }
}
</script>