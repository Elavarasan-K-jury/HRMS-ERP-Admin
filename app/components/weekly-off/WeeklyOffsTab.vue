<template>
    <div class="flex flex-col flex-1 min-h-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <div>
                <p class="text-xs text-white/50">Manage weekly off days for each shift.</p>
            </div>
            <div class="flex items-center gap-2">
                <!-- <button @click="goToImport" class="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-lg hover:bg-white/20 transition">
                    Import Excel
                </button> -->
                <UiButton color="#4aff7a" text="+ Add Weekly Off" size="sm" prepend-icon="ion:add-circle" @click="openAddWeeklyOff" />
            </div>
        </div>

        <!-- Content -->
        <div class="flex gap-2 flex-1 min-h-0">
            <!-- LEFT: Weekly Off List -->
            <div class="w-80 shrink-0 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div class="p-3 border-b border-white/10">
                    <input v-model="searchQuery" type="text" placeholder="Search weekly offs..."
                        class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                </div>

                <div class="flex-1 overflow-y-auto">
                    <div v-if="filteredWeeklyOffs.length === 0" class="p-4 text-center">
                        <Icon name="ion:calendar-outline" class="text-3xl text-white/20 mb-2" />
                        <p class="text-xs text-white/50">
                            {{ searchQuery ? 'No weekly offs match your search.' : 'No weekly offs configured yet.' }}
                        </p>
                    </div>

                    <button v-for="item in filteredWeeklyOffs" :key="item.id"
                        class="w-full text-left px-3 py-3 border-b border-white/5 transition-colors"
                        :class="selectedWeeklyOff?.id === item.id
                            ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                            : 'hover:bg-white/5 border-l-2 border-l-transparent'"
                        @click="selectWeeklyOff(item)">
                        <div class="flex items-center justify-between">
                            <div class="min-w-0 flex-1">
                                <div class="text-sm font-medium text-white/90 truncate">{{ item.name }}</div>
                                <div class="text-[11px] text-white/50 mt-0.5 truncate">
                                    {{ item.days.join(', ') }}
                                </div>
                                <div class="text-[11px] text-emerald-300/80 mt-1">
                                    {{ pluralizeEmployees(item.employee_count) }}
                                </div>
                            </div>
                            <div class="relative shrink-0 ml-2">
                                <button @click.stop="toggleWeeklyOffMenu(item.id)"
                                    class="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icon name="ion:ellipsis-vertical" class="w-3.5 h-3.5" />
                                </button>
                                <div v-if="openWeeklyOffMenu === item.id"
                                    class="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
                                    <button @click="editWeeklyOff(item)"
                                        class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:create-outline" class="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button @click="confirmDeleteWeeklyOff(item)"
                                        class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:trash" class="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- RIGHT: Weekly Off Detail -->
            <div class="flex-1 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div v-if="!selectedWeeklyOff"
                    class="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Icon name="ion:calendar-outline" class="text-5xl text-white/20 mb-4" />
                    <p class="text-sm text-white/50">Select a weekly off to view details.</p>
                </div>

                <template v-else>
                    <div class="px-4 pt-4 pb-2 border-b border-white/10">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-white/90">{{ selectedWeeklyOff.name }}</h2>
                                <p v-if="selectedWeeklyOff.description" class="text-xs text-white/50 mt-0.5">{{ selectedWeeklyOff.description }}</p>
                            </div>
                            <div class="relative">
                                <button @click="openDetailMenu = !openDetailMenu"
                                    class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icon name="ion:ellipsis-vertical" class="w-4 h-4" />
                                </button>
                                <div v-if="openDetailMenu"
                                    class="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
                                    <button @click="editWeeklyOff(selectedWeeklyOff); openDetailMenu = false"
                                        class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:create-outline" class="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button @click="confirmDeleteWeeklyOff(selectedWeeklyOff); openDetailMenu = false"
                                        class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:trash" class="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 mt-3 -mb-1">
                            <button type="button"
                                class="px-3 py-1.5 text-xs rounded-t-lg border-b-2 transition-colors"
                                :class="detailTab === 'summary'
                                    ? 'border-emerald-400 text-white/90 bg-white/5'
                                    : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'"
                                @click="detailTab = 'summary'">
                                Summary
                            </button>
                            <button type="button"
                                class="px-3 py-1.5 text-xs rounded-t-lg border-b-2 transition-colors"
                                :class="detailTab === 'employees'
                                    ? 'border-emerald-400 text-white/90 bg-white/5'
                                    : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'"
                                @click="detailTab = 'employees'">
                                Employees
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4">
                        <div v-if="detailTab === 'summary'" class="space-y-4">
                            <div class="rounded-lg border border-white/10 p-4">
                                <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Weekly Off Information</h4>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Off Days</p>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            <span v-for="day in selectedWeeklyOff.days" :key="day"
                                                class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                                                {{ day }}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Assigned Employees</p>
                                        <p class="text-sm text-emerald-300">{{ pluralizeEmployees(selectedWeeklyOff.employee_count) }}</p>
                                    </div>
                                    <div v-if="selectedWeeklyOff.dayConfigs">
                                        <p class="text-xs text-white/50 mb-2">Configuration</p>
                                        <div v-for="(configs, day) in selectedWeeklyOff.dayConfigs" :key="day" class="mb-2">
                                            <p class="text-xs text-white/70 font-medium mb-1">{{ day }}</p>
                                            <div v-for="(config, i) in configs" :key="i"
                                                class="ml-2 text-[11px] text-white/50">
                                                {{ formatOccurrenceLabel(config.occurrences, day) }} &middot; {{ formatTypeLabel(config.type) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="detailTab === 'employees'" class="space-y-3">
                            <div v-if="weeklyOffStore.assignedEmployeesLoading"
                                class="flex items-center justify-center py-10 text-white/50 text-sm">
                                Loading employees...
                            </div>
                            <div v-else-if="weeklyOffStore.assignedEmployeesError"
                                class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                                {{ weeklyOffStore.assignedEmployeesError }}
                            </div>
                            <div v-else-if="weeklyOffStore.assignedEmployees.length === 0"
                                class="rounded-lg border border-white/10 p-8 text-center">
                                <Icon name="ion:people-outline" class="text-4xl text-white/20 mb-3" />
                                <p class="text-sm text-white/50">No Employees are assigned to this weekly off policy.</p>
                            </div>
                            <div v-else class="rounded-lg border border-white/10 overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="bg-white/5 text-left text-xs text-white/50">
                                            <th class="px-3 py-2 font-medium">Employee</th>
                                            <th class="px-3 py-2 font-medium">Employee Number</th>
                                            <th class="px-3 py-2 font-medium">Job Title</th>
                                            <th class="px-3 py-2 font-medium">Reporting To</th>
                                            <th class="px-3 py-2 font-medium">Department</th>
                                            <th class="px-3 py-2 font-medium">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="emp in weeklyOffStore.assignedEmployees" :key="emp.id"
                                            class="border-t border-white/5">
                                            <td class="px-3 py-2 text-white/90">{{ emp.employee_name || '—' }}</td>
                                            <td class="px-3 py-2 text-white/60">{{ emp.employee_code || '—' }}</td>
                                            <td class="px-3 py-2 text-white/60">{{ emp.job_title || '—' }}</td>
                                            <td class="px-3 py-2 text-white/60">{{ emp.reporting_to || '—' }}</td>
                                            <td class="px-3 py-2 text-white/60">{{ emp.department || '—' }}</td>
                                            <td class="px-3 py-2 text-white/60">{{ emp.location || '—' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- ADD/EDIT WEEKLY OFF DRAWER -->
        <UiSidebarModal v-model="weeklyOffDrawerOpen" :title="editingWeeklyOff ? 'Edit Weekly Off' : 'Add Weekly Off'" width="900px">
            <WeeklyOffForm ref="weeklyOffFormRef" :weekly-off="editingWeeklyOff" :saving="weeklyOffSaving" @save="handleSave" @cancel="weeklyOffDrawerOpen = false" />
            <template #footer>
                <UiButton color="#fff" text="Cancel" size="sm" @click="weeklyOffDrawerOpen = false" />
                <UiButton color="#4aff7a" :text="editingWeeklyOff ? 'Save Changes' : 'Save Weekly Off'" size="sm"
                    @click="handleSaveClick" :loading="weeklyOffSaving" />
            </template>
        </UiSidebarModal>

        <!-- DELETE WEEKLY OFF CONFIRM -->
        <UiModal v-model="deleteWeeklyOffModal" title="Delete Weekly Off?" size="sm">
            <template #default>
                <span>Are you sure you want to delete <strong>{{ deleteWeeklyOffData?.name }}</strong>?</span>
            </template>
            <template #footer>
                <UiButton color="#fff" text="Cancel" size="sm" @click="deleteWeeklyOffModal = false" />
                <UiButton color="#750d0d" text="Delete" size="sm" @click="handleDeleteWeeklyOff" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import WeeklyOffForm from './WeeklyOffForm.vue'
import { useWeeklyOffStore } from '~/stores/organization/weeklyOff.store'

const weeklyOffStore = useWeeklyOffStore()
const route = useRoute()
const orgSlug = computed(() => route.params.organization)

onMounted(async () => {
    if (orgSlug.value) await weeklyOffStore.fetchPolicies(orgSlug.value)
})

const searchQuery = ref('')
const selectedWeeklyOff = ref(null)
const openWeeklyOffMenu = ref(null)
const openDetailMenu = ref(false)
const detailTab = ref('summary')

const weeklyOffDrawerOpen = ref(false)
const editingWeeklyOff = ref(null)
const weeklyOffSaving = ref(false)
const weeklyOffFormRef = ref(null)

const deleteWeeklyOffModal = ref(false)
const deleteWeeklyOffData = ref(null)

const filteredWeeklyOffs = computed(() => {
    const list = weeklyOffStore.policies
    if (!searchQuery.value) return list
    const q = searchQuery.value.toLowerCase()
    return list.filter(w =>
        w.name?.toLowerCase().includes(q) ||
        (w.days || []).some(d => d.toLowerCase().includes(q))
    )
})

const selectWeeklyOff = (item) => {
    selectedWeeklyOff.value = item
    openWeeklyOffMenu.value = null
    openDetailMenu.value = false
    detailTab.value = 'summary'
    weeklyOffStore.resetAssignedEmployees()
    if (item?.id) weeklyOffStore.fetchAssignedEmployees(item.id)
}

watch(detailTab, (tab) => {
    if (tab === 'employees' && selectedWeeklyOff.value?.id && !weeklyOffStore.assignedEmployeesLoading) {
        weeklyOffStore.fetchAssignedEmployees(selectedWeeklyOff.value.id)
    }
})

const pluralizeEmployees = (count) => {
    const n = Number(count) || 0
    return n === 1 ? '1 employee' : `${n} employees`
}

function goToImport() {
    navigateTo(`/organization/${orgSlug.value}/attendance/shift-import?type=weekly-off`)
}

const toggleWeeklyOffMenu = (id) => {
    openWeeklyOffMenu.value = openWeeklyOffMenu.value === id ? null : id
}

const openAddWeeklyOff = () => {
    editingWeeklyOff.value = null
    weeklyOffDrawerOpen.value = true
}

const editWeeklyOff = (item) => {
    editingWeeklyOff.value = { ...item }
    openWeeklyOffMenu.value = null
    openDetailMenu.value = false
    weeklyOffDrawerOpen.value = true
}

const handleSaveClick = () => {
    if (weeklyOffFormRef.value) weeklyOffFormRef.value.handleSave()
}

const handleSave = async (data) => {
    weeklyOffSaving.value = true
    try {
        if (editingWeeklyOff.value) {
            await weeklyOffStore.updatePolicy(editingWeeklyOff.value.id, data)
            if (selectedWeeklyOff.value?.id === editingWeeklyOff.value.id) {
                selectedWeeklyOff.value = weeklyOffStore.policies.find(p => p.id === editingWeeklyOff.value.id)
                if (detailTab.value === 'employees') {
                    weeklyOffStore.fetchAssignedEmployees(selectedWeeklyOff.value.id)
                }
            }
        } else {
            await weeklyOffStore.createPolicy(data)
        }
        weeklyOffDrawerOpen.value = false
    } catch (e) {
        // toast already shown by store
    } finally {
        weeklyOffSaving.value = false
    }
}

const confirmDeleteWeeklyOff = (item) => {
    deleteWeeklyOffData.value = item
    openWeeklyOffMenu.value = null
    openDetailMenu.value = false
    deleteWeeklyOffModal.value = true
}

const handleDeleteWeeklyOff = async () => {
    if (!deleteWeeklyOffData.value) return
    try {
        await weeklyOffStore.deletePolicy(deleteWeeklyOffData.value.id)
        if (selectedWeeklyOff.value?.id === deleteWeeklyOffData.value.id) {
            selectedWeeklyOff.value = null
            weeklyOffStore.resetAssignedEmployees()
            detailTab.value = 'summary'
        }
    } catch (e) {
        // toast already shown by store
    }
    deleteWeeklyOffModal.value = false
    deleteWeeklyOffData.value = null
}

const formatOccurrenceLabel = (occurrences, day) => {
    if (!occurrences || occurrences.length === 0) return ''
    if (occurrences.includes('ALL')) return `All ${day}s`
    const labels = occurrences.map(o => {
        if (o === 'LAST') return `Last ${day}`
        const suffix = o === '1' ? 'st' : o === '2' ? 'nd' : o === '3' ? 'rd' : 'th'
        return `${o}${suffix} ${day}`
    })
    return labels.join(', ')
}

const formatTypeLabel = (type) => {
    const map = { FULL_DAY: 'Full Day', FIRST_HALF: 'First Half', SECOND_HALF: 'Second Half' }
    return map[type] || type
}
</script>
