<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Employee List</h2>
            <div class="flex items-center gap-2">
                <UiButton @click="refreshActiveTab" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <UiTabs v-model="activeTab" :tabs="tabConfig" color="#4aff7a">
            <div v-show="activeTab === 0" class="mt-2">
                <EmployeesDirectoryTab />
            </div>
            <div v-show="activeTab === 1" class="mt-2">
                <EmployeesOrgTreeTab />
            </div>
            <div v-show="activeTab === 2" class="mt-2">
                <EmployeesProfileChangesTab />
            </div>
            <div v-show="activeTab === 3" class="mt-2">
                <EmployeesProbationTab />
            </div>
            <div v-show="activeTab === 4" class="mt-2">
                <EmployeesSettingsTab />
            </div>
        </UiTabs>
    </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
    layout: 'organization',
})

const tabConfig = [
    { label: 'Employee Directory', icon: 'ion:person-outline' },
    { label: 'Organization Tree', icon: 'ion:git-network-outline' },
    { label: 'Profile Changes', icon: 'ion:swap-horizontal-outline' },
    { label: 'Probation', icon: 'ion:time-outline' },
    { label: 'Settings', icon: 'ion:settings-outline' },
]

const activeTab = ref(0)

const refreshActiveTab = () => {
    const event = new CustomEvent('refresh-tab', { detail: { tab: activeTab.value } })
    window.dispatchEvent(event)
}
</script>
