<template>
    <div class="flex flex-col flex-1 min-h-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <div>
                <p class="text-xs text-white/50">Manage employee shift timings and working schedules.</p>
            </div>
            <UiButton color="#4aff7a" text="+ Add Shift" size="sm" prepend-icon="ion:add-circle"
                @click="openAddShift" />
        </div>

        <!-- Content -->
        <div class="flex gap-2 flex-1 min-h-0">
            <!-- LEFT: Shift List -->
            <div class="w-80 shrink-0 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div class="p-3 border-b border-white/10">
                    <input v-model="searchQuery" type="text" placeholder="Search shifts..."
                        class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                </div>

                <div class="flex-1 overflow-y-auto">
                    <div v-if="filteredShifts.length === 0" class="p-4 text-center">
                        <Icon name="ion:time-outline" class="text-3xl text-white/20 mb-2" />
                        <p class="text-xs text-white/50">
                            {{ searchQuery ? 'No shifts match your search.' : 'No shifts created yet.' }}
                        </p>
                    </div>

                    <button v-for="shift in filteredShifts" :key="shift.id"
                        data-testid="shift-card" :data-shift-id="shift.id" :data-count="shift.employees"
                        class="w-full text-left px-3 py-3 border-b border-white/5 transition-colors"
                        :class="selectedShift?.id === shift.id
                            ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                            : 'hover:bg-white/5 border-l-2 border-l-transparent'"
                        @click="selectShift(shift)">
                        <div class="flex items-center justify-between">
                            <div class="min-w-0 flex-1">
                                <div class="text-sm font-medium text-white/90 truncate">{{ shift.name }}</div>
                                <div class="text-[11px] text-white/50 mt-0.5 truncate">
                                    {{ shift.code }} &middot; {{ shift.shiftType === 'fixed' ? 'Fixed' : 'Flexible' }}
                                </div>
                            </div>
                            <div class="relative shrink-0 ml-2">
                                <button @click.stop="toggleShiftMenu(shift.id)"
                                    class="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icon name="ion:ellipsis-vertical" class="w-3.5 h-3.5" />
                                </button>
                                <div v-if="openShiftMenu === shift.id"
                                    class="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
                                    <button @click="editShift(shift)"
                                        class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:create-outline" class="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button @click="confirmDeleteShift(shift)"
                                        class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:trash" class="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="text-[11px] text-white/40 mt-1">
                            {{ pluralizeEmployees(shift.employees) }}
                        </div>
                    </button>
                </div>
            </div>

            <!-- RIGHT: Shift Detail -->
            <div class="flex-1 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div v-if="!selectedShift"
                    class="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Icon name="ion:time-outline" class="text-5xl text-white/20 mb-4" />
                    <p class="text-sm text-white/50">Select a shift to view details.</p>
                </div>

                <template v-else>
                    <div class="px-4 pt-4 pb-2 border-b border-white/10">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-white/90">{{ selectedShift.name }}</h2>
                                <p class="text-xs text-white/50 mt-0.5">{{ selectedShift.code }} &middot; {{ selectedShift.shiftType === 'fixed' ? 'Fixed Shift' : 'Flexible Hours' }}</p>
                            </div>
                            <div class="relative">
                                <button @click="openDetailMenu = !openDetailMenu"
                                    class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icon name="ion:ellipsis-vertical" class="w-4 h-4" />
                                </button>
                                <div v-if="openDetailMenu"
                                    class="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
                                    <button @click="editShift(selectedShift); openDetailMenu = false"
                                        class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:create-outline" class="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button @click="confirmDeleteShift(selectedShift); openDetailMenu = false"
                                        class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
                                        <Icon name="ion:trash" class="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 px-4 border-b border-white/10">
                        <button v-for="tab in detailTabs" :key="tab.key"
                            class="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                            :class="activeDetailTab === tab.key
                                ? 'text-white border-b-2 border-emerald-400'
                                : 'text-white/50 hover:text-white/70'"
                            @click="activeDetailTab = tab.key">
                            {{ tab.label }}
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4">
                        <!-- Summary Tab -->
                        <div v-if="activeDetailTab === 'summary'" class="space-y-4">
                            <div class="rounded-lg border border-white/10 p-4">
                                <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Shift Information</h4>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Shift Code</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.code }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Shift Type</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.shiftType === 'fixed' ? 'Fixed Shift Timings' : 'Flexible Work Hours' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Assigned Employees</p>
                                        <p class="text-sm text-emerald-300">{{ pluralizeEmployees(selectedShift.employees) }}</p>
                                    </div>
                                    <div v-if="selectedShift.description" class="col-span-2">
                                        <p class="text-xs text-white/50 mb-1">Description</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.description }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Fixed Shift Details -->
                            <div v-if="selectedShift.shiftType === 'fixed'" class="rounded-lg border border-white/10 p-4">
                                <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Schedule</h4>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Working Days</p>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            <span v-for="day in selectedShift.workingDays" :key="day"
                                                class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                                                {{ day }}
                                            </span>
                                            <span v-if="!selectedShift.workingDays?.length" class="text-xs text-white/40">None</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Shift Timings</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.timings }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Break Duration</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.breakMinutes }} minutes</p>
                                    </div>
                                    <div v-if="selectedShift.requireGrossHours">
                                        <p class="text-xs text-white/50 mb-1">Gross Hours</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.grossHours }} hrs</p>
                                    </div>
                                    <div v-if="selectedShift.requireGrossHours && selectedShift.effectiveHours != null">
                                        <p class="text-xs text-white/50 mb-1">Effective Hours</p>
                                        <p class="text-sm text-emerald-300 font-medium">{{ formatEffectiveHours(selectedShift.effectiveHours) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Flexible Shift Details -->
                            <div v-if="selectedShift.shiftType === 'flexible'" class="rounded-lg border border-white/10 p-4">
                                <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Configuration</h4>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Working Days</p>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            <span v-for="day in selectedShift.workingDays" :key="day"
                                                class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                                                {{ day }}
                                            </span>
                                            <span v-if="!selectedShift.workingDays?.length" class="text-xs text-white/40">None</span>
                                        </div>
                                    </div>
                                    <div v-if="selectedShift.requireGrossHours">
                                        <p class="text-xs text-white/50 mb-1">Gross Hours</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.grossHours }} hrs</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Break Duration</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.breakMinutes }} minutes</p>
                                    </div>
                                    <div v-if="selectedShift.requireGrossHours && selectedShift.effectiveHours != null">
                                        <p class="text-xs text-white/50 mb-1">Effective Hours</p>
                                        <p class="text-sm text-emerald-300 font-medium">{{ formatEffectiveHours(selectedShift.effectiveHours) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/50 mb-1">Maximum Duration</p>
                                        <p class="text-sm text-white/90">{{ selectedShift.maxDuration }} hrs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="activeDetailTab === 'employees'" class="space-y-3">
                            <!-- Assignment date range filter (server-side filtered) -->
                            <div class="flex flex-wrap items-end gap-2">
                                <div class="flex flex-col gap-1">
                                    <label for="shift-emp-from" class="text-[11px] text-white/50">From Date</label>
                                    <input id="shift-emp-from" data-testid="shift-emp-from" v-model="assignmentFrom"
                                        type="date"
                                        class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                        @change="onDateRangeChange" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label for="shift-emp-to" class="text-[11px] text-white/50">To Date</label>
                                    <input id="shift-emp-to" data-testid="shift-emp-to" v-model="assignmentTo"
                                        type="date"
                                        class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                        @change="onDateRangeChange" />
                                </div>
                                <button type="button" data-testid="shift-emp-reset"
                                    class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition"
                                    @click="resetDateRange">
                                    Reset
                                </button>
                                <span data-testid="shift-emp-count"
                                    class="text-[11px] text-white/50 shrink-0 pb-1.5 ml-auto">
                                    {{ pluralizeEmployees(employeesState?.loading
                                        ? (selectedShift?.employees ?? 0)
                                        : (employeesState?.total ?? selectedShift?.employees ?? 0)) }}
                                </span>
                            </div>

                            <p v-if="dateRangeError" data-testid="shift-emp-date-error"
                                class="text-xs text-rose-300">
                                {{ dateRangeError }}
                            </p>

                            <div class="flex items-center justify-between gap-2">
                                <input v-model="employeeSearchInput" data-testid="shift-emp-search" type="text"
                                    placeholder="Search by name or employee number..."
                                    class="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                    @input="onEmployeeSearchInput" />
                            </div>

                            <div v-if="!employeesState || employeesState?.loading" class="space-y-2">
                                <div v-for="i in 5" :key="i" class="h-10 rounded bg-white/5 animate-pulse" />
                            </div>

                            <div v-else-if="employeesState?.error"
                                class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center justify-between gap-3">
                                <span>{{ employeesState.error }}</span>
                                <button class="text-xs underline text-rose-200 hover:text-white" @click="retryEmployees">
                                    Retry
                                </button>
                            </div>

                            <div v-else-if="!employeesState?.employees?.length"
                                class="rounded-lg border border-white/10 p-8 text-center">
                                <Icon name="ion:people-outline" class="text-4xl text-white/20 mb-3" />
                                <p class="text-sm text-white/50">
                                    {{ employeeSearchInput ? 'No employees match your search.' : 'No employees are assigned to this shift.' }}
                                </p>
                            </div>

                            <div v-else class="rounded-lg border border-white/10 overflow-hidden">
                                <div class="overflow-x-auto">
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
                                            <tr v-for="emp in employeesState.employees" :key="emp.id"
                                                data-testid="shift-emp-row" class="border-t border-white/5">
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

                                <div v-if="employeesState.total > employeesState.limit"
                                    class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-white/10 bg-white/5">
                                    <div class="text-xs text-white/70">
                                        <span class="text-white">{{ employeeRangeStart }} to {{ employeeRangeEnd }}</span>
                                        of
                                        <span class="text-white">{{ employeesState.total }}</span>
                                        <span class="mx-1 opacity-50">&middot;</span>
                                        Page <span class="text-white">{{ employeesState.page }}</span> of
                                        <span class="text-white">{{ employeeTotalPages }}</span>
                                    </div>
                                    <div class="flex items-center gap-1.5">
                                        <button class="btn-lite" :disabled="employeesState.page <= 1"
                                            @click="goEmployeePage(employeesState.page - 1)">
                                            <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                                        </button>
                                        <button class="btn-lite" :disabled="employeesState.page >= employeeTotalPages"
                                            @click="goEmployeePage(employeesState.page + 1)">
                                            Next <Icon name="lucide:chevron-right" class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="activeDetailTab === 'versions'" class="text-center py-8">
                            <Icon name="ion:git-branch-outline" class="text-4xl text-white/20 mb-3" />
                            <p class="text-sm text-white/50">Shift version tracking coming soon.</p>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- ADD/EDIT SHIFT DRAWER -->
        <UiSidebarModal v-model="shiftDrawerOpen" :title="editingShift ? 'Edit Shift' : 'Add Shift'" width="900px">
            <ShiftForm ref="shiftFormRef" :shift="editingShift" :saving="shiftSaving" @save="handleSave" @cancel="shiftDrawerOpen = false" />
            <template #footer>
                <UiButton color="#fff" text="Cancel" size="sm" @click="shiftDrawerOpen = false" />
                <UiButton color="#4aff7a" :text="editingShift ? 'Save Changes' : 'Save Shift'" size="sm"
                    @click="handleSaveClick" :loading="shiftSaving" />
            </template>
        </UiSidebarModal>

        <!-- DELETE SHIFT CONFIRM -->
        <UiModal v-model="deleteShiftModal" title="Delete Shift?" size="sm">
            <template #default>
                <span>Are you sure you want to delete <strong>{{ deleteShiftData?.name }}</strong>?</span>
            </template>
            <template #footer>
                <UiButton color="#fff" text="Cancel" size="sm" @click="deleteShiftModal = false" />
                <UiButton color="#750d0d" text="Delete Shift" size="sm" @click="handleDeleteShift" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ShiftForm from './ShiftForm.vue'
import { useShiftStore } from '~/stores/organization/shift.store'

const shiftStore = useShiftStore()
const route = useRoute()
const orgSlug = computed(() => route.params.organization)

onMounted(async () => {
    if (orgSlug.value) await shiftStore.fetchShifts(orgSlug.value)
})

const searchQuery = ref('')
const selectedShift = ref(null)
const openShiftMenu = ref(null)
const openDetailMenu = ref(false)
const activeDetailTab = ref('summary')

const shiftDrawerOpen = ref(false)
const editingShift = ref(null)
const shiftSaving = ref(false)
const shiftFormRef = ref(null)

const deleteShiftModal = ref(false)
const deleteShiftData = ref(null)

const employeeSearchInput = ref('')
const employeePage = ref(1)
const employeeLimit = 10
let employeeSearchTimer = null
let lastLoadedEmployeeKey = ''

// Assignment date range filter — empty → server default (today's assignments)
const assignmentFrom = ref('')
const assignmentTo = ref('')

const dateRangeError = computed(() => {
    const from = assignmentFrom.value || ''
    const to = assignmentTo.value || ''
    if (from && to && from > to) return 'From date cannot be later than To date.'
    return ''
})

const detailTabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'employees', label: 'Employees' },
    { key: 'versions', label: 'Track Shift Versions' },
]

const filteredShifts = computed(() => {
    const list = shiftStore.shifts
    if (!searchQuery.value) return list
    const q = searchQuery.value.toLowerCase()
    return list.filter(s => s.name?.toLowerCase().includes(q))
})

const employeesState = computed(() => {
    if (!selectedShift.value?.id) return null
    return shiftStore.assignedEmployeesByShift[selectedShift.value.id] || null
})

const employeeTotalPages = computed(() => {
    const state = employeesState.value
    if (!state?.limit) return 1
    return Math.max(1, Math.ceil((state.total || 0) / state.limit))
})

const employeeRangeStart = computed(() => {
    const state = employeesState.value
    if (!state?.employees?.length) return 0
    return (state.page - 1) * state.limit + 1
})

const employeeRangeEnd = computed(() => {
    const state = employeesState.value
    if (!state?.employees?.length) return 0
    return (state.page - 1) * state.limit + state.employees.length
})

const pluralizeEmployees = (count) => {
    const n = Number(count) || 0
    return n === 1 ? '1 employee' : `${n} employees`
}

/** 8 → "8 hrs", 8.5 → "8 hrs 30 mins", 7.25 → "7 hrs 15 mins" */
const formatEffectiveHours = (h) => {
    if (h === null || h === undefined || !Number.isFinite(Number(h))) return '—'
    const totalMins = Math.round(Number(h) * 60)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    if (hrs === 0 && mins === 0) return '0 hrs'
    if (mins === 0) return `${hrs} hr${hrs === 1 ? '' : 's'}`
    if (hrs === 0) return `${mins} min${mins === 1 ? '' : 's'}`
    return `${hrs} hr${hrs === 1 ? '' : 's'} ${mins} min${mins === 1 ? '' : 's'}`
}

const employeeCacheKey = () => {
    const shiftId = selectedShift.value?.id || ''
    return `${shiftId}:${employeePage.value}:${employeeSearchInput.value || ''}:${assignmentFrom.value || ''}:${assignmentTo.value || ''}`
}

const loadEmployees = async ({ force = false } = {}) => {
    const shiftId = selectedShift.value?.id
    if (!shiftId || activeDetailTab.value !== 'employees') return
    await shiftStore.fetchShiftEmployees(shiftId, {
        page: employeePage.value,
        limit: employeeLimit,
        search: employeeSearchInput.value || '',
        force,
        assignmentFrom: assignmentFrom.value || '',
        assignmentTo: assignmentTo.value || '',
    })
}

/** Refresh card counts for the current range and re-sync selectedShift (fetchShifts replaces the array). */
const refreshShiftCounts = async () => {
    const selectedId = selectedShift.value?.id
    await shiftStore.fetchShifts(orgSlug.value, {
        assignmentFrom: assignmentFrom.value || '',
        assignmentTo: assignmentTo.value || '',
    })
    if (selectedId) {
        selectedShift.value = shiftStore.shifts.find(s => s.id === selectedId) || selectedShift.value
    }
}

const onDateRangeChange = async () => {
    if (dateRangeError.value) return // invalid range → never hit the API
    employeePage.value = 1
    lastLoadedEmployeeKey = ''
    await refreshShiftCounts()
    await loadEmployees({ force: true })
}

const resetDateRange = async () => {
    assignmentFrom.value = ''
    assignmentTo.value = ''
    employeePage.value = 1
    lastLoadedEmployeeKey = ''
    await refreshShiftCounts()
    await loadEmployees({ force: true })
}

const onEmployeeSearchInput = () => {
    if (employeeSearchTimer) clearTimeout(employeeSearchTimer)
    employeeSearchTimer = setTimeout(() => {
        employeePage.value = 1
        loadEmployees()
    }, 300)
}

const goEmployeePage = (page) => {
    employeePage.value = page
    loadEmployees()
}

const retryEmployees = () => {
    loadEmployees({ force: true })
}

watch(activeDetailTab, (tab) => {
    if (tab !== 'employees') return
    const shiftId = selectedShift.value?.id
    if (!shiftId) return
    const key = employeeCacheKey()
    const state = shiftStore.assignedEmployeesByShift[shiftId]
    if (state?.loaded && !state.error && lastLoadedEmployeeKey === key) return
    lastLoadedEmployeeKey = key
    loadEmployees()
})

watch([employeePage, employeeSearchInput], () => {
    if (activeDetailTab.value !== 'employees') return
    const shiftId = selectedShift.value?.id
    if (!shiftId) return
    const key = employeeCacheKey()
    if (lastLoadedEmployeeKey === key) return
    lastLoadedEmployeeKey = key
    loadEmployees()
})

const selectShift = (shift) => {
    selectedShift.value = shift
    openShiftMenu.value = null
    openDetailMenu.value = false
    activeDetailTab.value = 'summary'
    // Preserve current search + date range when switching shifts
    employeePage.value = 1
    lastLoadedEmployeeKey = ''
}

const toggleShiftMenu = (id) => {
    openShiftMenu.value = openShiftMenu.value === id ? null : id
}

const openAddShift = () => {
    editingShift.value = null
    shiftDrawerOpen.value = true
}

const editShift = (shift) => {
    editingShift.value = { ...shift }
    openShiftMenu.value = null
    openDetailMenu.value = false
    shiftDrawerOpen.value = true
}

const handleSaveClick = () => {
    if (shiftFormRef.value) shiftFormRef.value.handleSave()
}

const handleSave = async (shiftData) => {
    shiftSaving.value = true
    try {
        if (editingShift.value) {
            await shiftStore.updateShift(editingShift.value.id, shiftData, orgSlug.value)
            if (selectedShift.value?.id === editingShift.value.id) {
                selectedShift.value = shiftStore.shifts.find(s => s.id === editingShift.value.id)
            }
            shiftStore.resetShiftEmployees(editingShift.value.id)
            if (activeDetailTab.value === 'employees') {
                lastLoadedEmployeeKey = ''
                loadEmployees({ force: true })
            }
        } else {
            await shiftStore.createShift(orgSlug.value, shiftData)
        }
        shiftDrawerOpen.value = false
    } catch (e) {
        // toast already shown by store
    } finally {
        shiftSaving.value = false
    }
}

const confirmDeleteShift = (shift) => {
    deleteShiftData.value = shift
    openShiftMenu.value = null
    openDetailMenu.value = false
    deleteShiftModal.value = true
}

const handleDeleteShift = async () => {
    if (!deleteShiftData.value) return
    try {
        await shiftStore.deleteShift(deleteShiftData.value.id)
        if (selectedShift.value?.id === deleteShiftData.value.id) {
            selectedShift.value = null
        }
    } catch (e) {
        // toast already shown by store
    }
    deleteShiftModal.value = false
    deleteShiftData.value = null
}
</script>

<style scoped>
.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

input[type="date"] {
    color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(1.6);
    opacity: 0.85;
    cursor: pointer;
}
</style>
