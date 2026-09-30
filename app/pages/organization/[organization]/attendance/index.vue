<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-2" data-testid="attendance-page">
        <!-- Persistent parent tabs (query-driven, one stable URL per tab) -->
        <div class="overflow-x-auto shrink-0" data-testid="attendance-tabs">
            <UiTabs v-model="activeTab" :tabs="tabs" color="#4aff7a" />
        </div>

        <!-- Employee Attendance: reuses the existing Monthly Attendance Overview UI -->
        <AttendanceEmployeeAttendanceTab v-if="activeTab === 0" />

        <!-- Coming Soon placeholders (no API, no backend wiring) -->
        <UiComingSoon v-else-if="activeTab === 1" title="Penalization Policy"
            description="Configure attendance penalty rules for your organization." testid="attendance-coming-soon" />
        <UiComingSoon v-else-if="activeTab === 2" title="Penalization Policy Allocation"
            testid="attendance-coming-soon" />

        <!-- Time Tracking Policy: master/detail listing + summary UI (isolated mock data, no backend) -->
        <AttendanceTimeTrackingPolicyTab v-else-if="activeTab === 3" />

        <UiComingSoon v-else-if="activeTab === 4" title="Time Tracking Allocation" testid="attendance-coming-soon" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

import AttendanceEmployeeAttendanceTab from '~/components/attendance/EmployeeAttendanceTab.vue'
import AttendanceTimeTrackingPolicyTab from '~/components/attendance/TimeTrackingPolicyTab.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath
})

const route = useRoute()
const router = useRouter()

const tabs = [
    { label: 'Employee Attendance', icon: 'ion:calendar-outline', testid: 'attendance-tab-employee' },
    { label: 'Penalization Policy', icon: 'ion:shield-half-outline', testid: 'attendance-tab-penalization-policy' },
    { label: 'Penalization Policy Allocation', icon: 'ion:people-outline', testid: 'attendance-tab-penalization-policy-allocation' },
    { label: 'Time Tracking Policy', icon: 'ion:time-outline', testid: 'attendance-tab-time-tracking-policy' },
    { label: 'Time Tracking Allocation', icon: 'ion:timer-outline', testid: 'attendance-tab-time-tracking-allocation' },
]

const validTabs = [
    'employee-attendance',
    'penalization-policy',
    'penalization-policy-allocation',
    'time-tracking-policy',
    'time-tracking-allocation',
]
const tabIndexMap = Object.fromEntries(validTabs.map((t, i) => [t, i]))
const indexToTab = [...validTabs]

// Default tab: Employee Attendance (clean URL stays valid without ?tab=)
const initialTab = route.query.tab && validTabs.includes(route.query.tab)
    ? tabIndexMap[route.query.tab]
    : 0
const activeTab = ref(initialTab)

watch(activeTab, (idx) => {
    const tab = indexToTab[idx]
    if (route.query.tab !== tab) {
        router.replace({ query: { ...route.query, tab } })
    }
})

watch(() => route.query.tab, (v) => {
    if (validTabs.includes(v) && tabIndexMap[v] !== activeTab.value) {
        activeTab.value = tabIndexMap[v]
    }
})

onMounted(() => {
    // Normalize an invalid ?tab= value back to the default tab
    if (route.query.tab && !validTabs.includes(route.query.tab)) {
        router.replace({ query: { ...route.query, tab: indexToTab[activeTab.value] } })
    }
})
</script>
