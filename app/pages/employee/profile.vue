<template>
    <div class="h-[calc(100vh-4rem)] overflow-y-auto px-2 py-3">
        <!-- Initial loading skeleton -->
        <div v-if="loading" class="space-y-4">
            <div class="skeleton-banner" />
            <div class="skeleton-strip" />
            <div class="skeleton-strip" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center gap-4 py-20">
            <Icon name="lucide:triangle-alert" class="h-12 w-12 text-red-400/60" />
            <p class="text-sm text-white/60">Failed to load profile.</p>
            <UiButton color="#4aff7a" text="Retry" prepend-icon="ion:refresh" @click="loadEmployee" />
        </div>

        <!-- Profile shell -->
        <div v-else-if="employee" class="space-y-4">
            <EmployeeProfileHeader :employee="employee" @updated="loadEmployee" />
            <EmployeeContactInfo :employee="employee" />
            <EmployeeOrganizationInfo :employee="employee" />
            <ProfileTabs :active="activeTab" @change="setTab" />

            <div class="tab-content">
                <AboutTab v-if="activeTab === 'about'" :employee="employee" />
                <ProfileTab v-else-if="activeTab === 'profile'" :employee="employee" @updated="loadEmployee" />
                <JobTab v-else-if="activeTab === 'job'" :employee="employee" />
                <DocumentsTab v-else-if="activeTab === 'documents'" :employee="employee" />
                <AssetsTab v-else-if="activeTab === 'assets'" :employee="employee" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeesStore } from '../../stores/organization/employee.store'
import { useAuthStore } from '../../stores/shared/auth.store'

import EmployeeProfileHeader from '../../components/employee/profile/EmployeeProfileHeader.vue'
import EmployeeContactInfo from '../../components/employee/profile/EmployeeContactInfo.vue'
import EmployeeOrganizationInfo from '../../components/employee/profile/EmployeeOrganizationInfo.vue'
import ProfileTabs from '../../components/employee/profile/ProfileTabs.vue'
import AboutTab from '../../components/employee/profile/AboutTab.vue'
import ProfileTab from '../../components/employee/profile/ProfileTab.vue'
import JobTab from '../../components/employee/profile/JobTab.vue'
import DocumentsTab from '../../components/employee/profile/DocumentsTab.vue'
import AssetsTab from '../../components/employee/profile/AssetsTab.vue'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const router = useRouter()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const employee = ref(null)
const loading = ref(true)
const error = ref(null)

const VALID_TABS = ['about', 'profile', 'job', 'documents', 'assets']
const activeTab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'about')

const setTab = (tab) => {
    if (!VALID_TABS.includes(tab)) return
    activeTab.value = tab
    router.replace({ query: { ...route.query, tab } })
}

watch(() => route.query.tab, (tab) => {
    if (VALID_TABS.includes(tab)) activeTab.value = tab
})

const loadEmployee = async () => {
    loading.value = true
    error.value = null
    try {
        const empId = authStore.employee
        if (!empId) {
            error.value = new Error('No employee ID')
            return
        }
        const data = await employeesStore.fetchEmployee(empId)
        employee.value = data?.employee || null
        if (!employee.value) error.value = new Error('Employee not found')
    } catch (err) {
        console.error('[Profile] Load employee failed:', err)
        error.value = err
    } finally {
        loading.value = false
    }
}

onMounted(loadEmployee)
</script>

<style scoped>
.tab-content {
    animation: fade-in .2s ease;
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

.skeleton-banner {
    height: 180px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.16), rgba(255,255,255,.08));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-strip {
    height: 88px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.16), rgba(255,255,255,.08));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    to { background-position: -200% 0; }
}
</style>
