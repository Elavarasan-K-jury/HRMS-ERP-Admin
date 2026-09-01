<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3">
        <UiTabs v-model="activeTab" :tabs="tabs" color="#4aff7a" />

        <div class="flex-1">
            <ExpenseTravelPoliciesTab v-if="activeTab === 0" :organization-id="orgId" />
            <ExpenseCategoriesTab v-else-if="activeTab === 1" :organization-id="orgId" />
            <CurrencyConversionsTab v-else-if="activeTab === 2" />
            <ClaimSettingsTab v-else-if="activeTab === 3" />
            <UsageTypesTab v-else-if="activeTab === 4" :organization-id="orgId" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

import ExpenseTravelPoliciesTab from '~/components/expense-travel/ExpenseTravelPoliciesTab.vue'
import ExpenseCategoriesTab from '~/components/expense-travel/ExpenseCategoriesTab.vue'
import CurrencyConversionsTab from '~/components/expense-travel/CurrencyConversionsTab.vue'
import ClaimSettingsTab from '~/components/expense-travel/ClaimSettingsTab.vue'
import UsageTypesTab from '~/components/expense-travel/UsageTypesTab.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const router = useRouter()
const orgId = computed(() => route.params.organization)

const tabs = [
    { label: 'Expense & Travel Policies', icon: 'ion:document-text-outline' },
    { label: 'Expense & Travel Categories', icon: 'ion:pricetags-outline' },
    { label: 'Currency Conversions', icon: 'heroicons:currency-dollar' },
    { label: 'Claim Settings', icon: 'ion:settings-outline' },
    { label: 'Usage Types', icon: 'ion:list-outline' },
]

const validTabs = ['policies', 'categories', 'currency', 'claim', 'usage']
const tabIndexMap = { policies: 0, categories: 1, currency: 2, claim: 3, usage: 4 }
const indexToTab = ['policies', 'categories', 'currency', 'claim', 'usage']

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
