<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <UiTabs v-model="activeTab" :tabs="tabs" />

        <div class="flex-1">
            <!-- TAB 0: Shifts & Weekly Offs -->
            <div v-if="activeTab === 0" class="flex flex-col gap-2 h-full">
                <!-- Sub-tabs -->
                <div class="flex items-center gap-1 border-b border-white/10">
                    <button v-for="sub in subTabs" :key="sub.key"
                        class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                        :class="activeSubTab === sub.key
                            ? 'text-white border-b-2 border-emerald-400'
                            : 'text-white/50 hover:text-white/70'"
                        @click="activeSubTab = sub.key">
                        {{ sub.label }}
                    </button>
                </div>

                <!-- Shifts Sub-tab -->
                <ShiftsTab v-if="activeSubTab === 'shifts'" />

                <!-- Weekly Offs Sub-tab -->
                <WeeklyOffsTab v-else-if="activeSubTab === 'weekly-offs'" />
            </div>

            <!-- TAB 1: Shift Allowance -->
            <div v-else-if="activeTab === 1">
                <div class="flex items-center justify-center h-64 text-white/50 text-sm">
                    Shift allowance coming soon.
                </div>
            </div>

            <!-- TAB 2: Assignments -->
            <div v-else-if="activeTab === 2" class="flex flex-col gap-2 h-full">
                <div class="flex items-center gap-1 border-b border-white/10">
                    <button v-for="sub in assignmentSubTabs" :key="sub.key"
                        class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                        :class="activeAssignmentTab === sub.key
                            ? 'text-white border-b-2 border-emerald-400'
                            : 'text-white/50 hover:text-white/70'"
                        :data-testid="`subtab-${sub.key}`"
                        @click="activeAssignmentTab = sub.key">
                        {{ sub.label }}
                    </button>
                </div>

                <AssignmentsTab v-if="activeAssignmentTab === 'employees'" />
                <RotationRosterTab v-else-if="activeAssignmentTab === 'rotation'" />
            </div>

            <!-- TAB 3: Holidays -->
            <div v-else-if="activeTab === 3">
                <HolidayPolicyPage />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import HolidayPolicyPage from './holidays.vue'
import ShiftsTab from '../../../../components/shift/ShiftsTab.vue'
import WeeklyOffsTab from '../../../../components/weekly-off/WeeklyOffsTab.vue'
import AssignmentsTab from '../../../../components/shift/AssignmentsTab.vue'
import RotationRosterTab from '../../../../components/shift/RotationRosterTab.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const activeTab = ref(0)
const activeSubTab = ref('shifts')
const activeAssignmentTab = ref('employees')

const tabs = [
    { label: 'Shifts & Weekly Offs', icon: 'ion:time-outline' },
    { label: 'Shift Allowance', icon: 'ion:calendar-outline' },
    { label: 'Shift & Weekly Off Assignments', icon: 'ion:calendar-number-outline' },
    { label: 'Holidays', icon: 'ion:calendar-number-outline' },
]

const subTabs = [
    { key: 'shifts', label: 'Shifts' },
    { key: 'weekly-offs', label: 'Weekly Offs' },
]

const assignmentSubTabs = [
    { key: 'employees', label: 'Employee Assignments' },
    { key: 'rotation', label: 'Shift Rotation / Roster' },
]
</script>
