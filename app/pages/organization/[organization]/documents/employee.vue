<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3">
        <UiTabs v-model="activeTab" :tabs="tabs" color="#4aff7a" />

        <div class="flex-1">
            <DocumentSettingsTab v-if="activeTab === 0" :organization-id="orgId" />
            <DocumentAssignmentTab v-else-if="activeTab === 1" :organization-id="orgId" />
            <PendingVerificationTab v-else-if="activeTab === 2" :organization-id="orgId" />
            <PendingOnEmployeeTab v-else-if="activeTab === 3" :organization-id="orgId" />
            <VerifiedDocumentsTab v-else-if="activeTab === 4" :organization-id="orgId" />
            <ExpiringDocumentsTab v-else-if="activeTab === 5" :organization-id="orgId" />
            <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/60">
                <Icon name="ion:file-tray-stacked-outline" class="w-8 h-8 opacity-40" />
                <p class="text-sm">{{ lifecylePlaceholders[activeTab] }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

import DocumentSettingsTab from '~/components/employee-documents/DocumentSettingsTab.vue'
import DocumentAssignmentTab from '~/components/employee-documents/DocumentAssignmentTab.vue'
import PendingOnEmployeeTab from '~/components/employee-documents/PendingOnEmployeeTab.vue'
import PendingVerificationTab from '~/components/employee-documents/PendingVerificationTab.vue'
import VerifiedDocumentsTab from '~/components/employee-documents/VerifiedDocumentsTab.vue'
import ExpiringDocumentsTab from '~/components/employee-documents/ExpiringDocumentsTab.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const router = useRouter()
const orgId = computed(() => route.params.organization)

const tabs = [
    { label: 'Settings', icon: 'ion:settings-outline' },
    { label: 'Document Assignment', icon: 'ion:person-add-outline' },
    { label: 'Pending Verification', icon: 'ion:checkmark-done-outline' },
    { label: 'Pending on Employee', icon: 'ion:person-outline' },
    { label: 'Verified Documents', icon: 'ion:shield-checkmark-outline' },
    { label: 'Expiring Docs', icon: 'ion:time-outline' },
    { label: 'Bulk Uploads', icon: 'ion:cloud-upload-outline' },
]

const lifecylePlaceholders = {
    6: 'Bulk Uploads feature is coming soon.',
}

const validTabs = ['settings', 'assignment', 'pending-verification', 'pending-on-employee', 'verified', 'expiring', 'bulk-uploads']
const tabIndexMap = { settings: 0, assignment: 1, 'pending-verification': 2, 'pending-on-employee': 3, verified: 4, expiring: 5, 'bulk-uploads': 6 }
const indexToTab = ['settings', 'assignment', 'pending-verification', 'pending-on-employee', 'verified', 'expiring', 'bulk-uploads']

// Settings is the default tab (index 0)
const initialTab = route.query.tab && validTabs.includes(route.query.tab)
    ? tabIndexMap[route.query.tab]
    : 0
const activeTab = ref(initialTab)

watch(activeTab, (idx) => {
    const tab = indexToTab[idx]
    router.replace({ query: { ...route.query, tab } })
})

watch(() => route.query.tab, (v) => {
    if (validTabs.includes(v) && tabIndexMap[v] !== activeTab.value) {
        activeTab.value = tabIndexMap[v]
    }
})

onMounted(() => {
    if (!route.query.tab) {
        router.replace({ query: { ...route.query, tab: indexToTab[activeTab.value] } })
    }
})
</script>
