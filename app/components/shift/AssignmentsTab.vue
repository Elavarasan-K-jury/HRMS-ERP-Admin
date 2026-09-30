<template>
    <div class="flex flex-col gap-3 p-2">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h3 class="text-lg font-semibold text-white">Shift & Weekly Off Assignments</h3>
                <p class="text-xs text-white/45 mt-0.5">Assign shifts and weekly off policies to organization employees.</p>
            </div>
            <span class="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">{{ total }} employee<span v-if="total !== 1">s</span></span>
        </div>

        <!-- Filter toolbar -->
        <div class="relative z-20 flex flex-wrap items-center gap-2 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg px-4 py-3">
            <div class="relative min-w-[220px] flex-1">
                <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                <input v-model="search" type="text" placeholder="Search employees..."
                    class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
            </div>
            <EmployeesFilterDropdown v-model="selectedBranches" :options="branchOptions" title="Branches" />
            <EmployeesFilterDropdown v-model="selectedDepartments" :options="deptOptions" title="Department" />
            <EmployeesFilterDropdown v-model="selectedSubDepartments" :options="subDeptOptions" title="Sub Department" />
            <EmployeesFilterDropdown v-model="selectedLocations" :options="locationOptions" title="Location" />
            <select v-model="selectedShiftId"
                class="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-emerald-300/60 min-w-[140px]">
                <option value="">Shift: All</option>
                <option v-for="s in shiftOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <label class="flex items-center gap-1.5 text-xs text-white/60 select-none">
                <span class="whitespace-nowrap">As of</span>
                <input v-model="asOfDate" data-testid="assignments-as-of-date" type="date"
                    class="rounded-lg border border-white/15 bg-black/20 px-2 py-1.5 text-sm text-white/90 outline-none transition focus:border-emerald-300/60" />
            </label>
            <select v-model="selectedPolicyId"
                class="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-emerald-300/60 min-w-[160px]">
                <option value="">Weekly Off: All</option>
                <option v-for="p in policyOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                @click="resetFilters" :disabled="!hasActiveFilters" />
        </div>

        <!-- Error -->
        <div v-if="error && !loading"
            class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center justify-between gap-3">
            <span>{{ error }}</span>
            <button class="text-xs underline text-rose-200 hover:text-white" @click="fetchEmployees">Retry</button>
        </div>

        <!-- Empty -->
        <div v-else-if="!loading && !employees.length && !error"
            class="rounded-lg border border-white/15 bg-white/10 px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/70">
            <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
            <span>No employees found</span>
            <UiButton v-if="hasActiveFilters" size="xs" color="#4aff7a" text="Clear filters"
                prepend-icon="ion:close-circle-outline" @click="resetFilters" />
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="loading" class="rounded-lg border border-white/15 overflow-hidden">
            <div class="h-10 bg-white/5 animate-pulse" />
            <div v-for="i in 5" :key="i" class="h-12 border-t border-white/5 bg-white/[0.03] animate-pulse" />
        </div>

        <!-- Employee table -->
        <div v-else class="overflow-x-auto rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-white/5 text-left text-xs text-white/50">
                        <th class="px-3 py-2.5 font-medium">Employee</th>
                        <th class="px-3 py-2.5 font-medium">Employee Number</th>
                        <th class="px-3 py-2.5 font-medium">Department</th>
                        <th class="px-3 py-2.5 font-medium">Location</th>
                        <th class="px-3 py-2.5 font-medium">Business Unit</th>
                        <th class="px-3 py-2.5 font-medium">Reporting Manager</th>
                        <th class="px-3 py-2.5 font-medium">Shift Type</th>
                        <th class="px-3 py-2.5 font-medium">Weekly Off</th>
                        <th class="px-3 py-2.5 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="emp in employees" :key="emp.id"
                        class="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-3 py-2.5">
                            <div class="flex items-center gap-2.5 min-w-0">
                                <div class="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-semibold">
                                    {{ initials(emp) }}
                                </div>
                                <div class="min-w-0">
                                    <p class="text-white/90 truncate">{{ emp.full_name || '—' }}</p>
                                    <p class="text-xs text-white/45 truncate">{{ designationName(emp) || '—' }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-2.5 text-white/60">{{ emp.employee_code || '—' }}</td>
                        <td class="px-3 py-2.5 text-white/60">
                            <span>{{ emp.department_name || '—' }}</span>
                            <span v-if="emp.sub_department_name && emp.sub_department_name !== emp.department_name"
                                class="block text-xs text-white/40">{{ emp.sub_department_name }}</span>
                        </td>
                        <td class="px-3 py-2.5 text-white/60">{{ emp.location_name || '—' }}</td>
                        <td class="px-3 py-2.5 text-white/60">{{ emp.business_unit || emp.organization?.name || '—' }}</td>
                        <td class="px-3 py-2.5 text-white/60">{{ emp.reporting_manager?.full_name || '—' }}</td>
                        <td class="px-3 py-2.5">
                            <span v-if="shiftFor(emp)" class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                                {{ shiftLabel(shiftFor(emp)) }}
                            </span>
                            <span v-else class="text-white/35 text-xs">Not assigned</span>
                        </td>
                        <td class="px-3 py-2.5">
                            <span v-if="weeklyOffFor(emp)" class="text-sky-400 text-xs bg-sky-500/10 px-2 py-0.5 rounded">
                                {{ weeklyOffFor(emp).name }}
                            </span>
                            <span v-else class="text-white/35 text-xs">Not assigned</span>
                        </td>
                        <td class="px-3 py-2.5">
                            <div class="flex items-center gap-1">
                                <button type="button" title="Update Shift" aria-label="Update Shift"
                                    class="p-1.5 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                                    @click="openShiftDrawer(emp)">
                                    <Icon name="ion:time-outline" class="w-4 h-4" />
                                </button>
                                <button type="button" title="Update Weekly Off" aria-label="Update Weekly Off"
                                    class="p-1.5 rounded text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/20 transition-colors"
                                    @click="openWeeklyOffDrawer(emp)">
                                    <Icon name="ion:calendar-outline" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="total > 0"
                class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-white/10 bg-white/5">
                <div class="flex items-center gap-2 text-xs text-white/70">
                    <span>Rows</span>
                    <select v-model.number="limit" @change="changeLimit"
                        class="rounded border border-white/15 bg-black/20 px-2 py-1 text-white/90 outline-none">
                        <option v-for="n in [10, 25, 50]" :key="n" :value="n">{{ n }}</option>
                    </select>
                    <span class="mx-1 opacity-50">&middot;</span>
                    <span class="text-white">{{ rangeStart }}–{{ rangeEnd }}</span>
                    of
                    <span class="text-white">{{ total }}</span>
                    <span class="mx-1 opacity-50">&middot;</span>
                    Page <span class="text-white">{{ page }}</span> of
                    <span class="text-white">{{ totalPages }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button class="btn-lite" :disabled="page <= 1 || loading" @click="prevPage">
                        <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                    </button>
                    <button class="btn-lite" :disabled="page >= totalPages || loading" @click="nextPage">
                        Next <Icon name="lucide:chevron-right" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Reused drawers (history hidden on this page) -->
        <EmployeeShiftDrawer
            v-model="shiftDrawerOpen"
            :employee-id="activeEmployee?.id || ''"
            :organization-id="orgId"
            :current-shift-id="shiftFor(activeEmployee)?.id || ''"
            :current-shift-name="shiftFor(activeEmployee) ? shiftLabel(shiftFor(activeEmployee)) : ''"
            :current-assignment="activeShiftAssignment"
            :show-history="false"
            @saved="onShiftSaved"
        />
        <EmployeeWeeklyOffDrawer
            v-model="weeklyOffDrawerOpen"
            :employee-id="activeEmployee?.id || ''"
            :organization-id="orgId"
            :current-policy-id="weeklyOffFor(activeEmployee)?.id || ''"
            :current-policy-name="weeklyOffFor(activeEmployee)?.name || ''"
            :current-assignment="activeWeeklyOffAssignment"
            :show-history="false"
            @saved="onWeeklyOffSaved"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useShiftStore } from '~/stores/organization/shift.store'
import { useWeeklyOffStore } from '~/stores/organization/weeklyOff.store'
import { useDepartmentStore } from '~/stores/organization/department.store'
import { useBranchStore } from '~/stores/organization/branch.store'
import { useLocationStore } from '~/stores/organization/location.store'
import { useAuthStore } from '~/stores/shared/auth.store'
import EmployeeShiftDrawer from '~/components/employee/profile/EmployeeShiftDrawer.vue'
import EmployeeWeeklyOffDrawer from '~/components/employee/profile/EmployeeWeeklyOffDrawer.vue'
import { todayStr } from '~/data/shiftRotation'

const route = useRoute()
const authStore = useAuthStore()
const shiftStore = useShiftStore()
const weeklyOffStore = useWeeklyOffStore()
const departmentStore = useDepartmentStore()
const branchStore = useBranchStore()
const locationStore = useLocationStore()

const orgId = computed(() => authStore.organization || route.params.organization || '')

// Table state (server-side)
const employees = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(0)
const loading = ref(false)
const error = ref('')

// Filters
const search = ref(null)
const selectedBranches = ref([])
const selectedDepartments = ref([])
const selectedSubDepartments = ref([])
const selectedLocations = ref([])
const selectedShiftId = ref('')
const selectedPolicyId = ref('')
// Explicit as-of date (YYYY-MM-DD). Default = today, which keeps the existing
// current-assignment display byte-for-byte identical (no extra params sent).
const asOfDate = ref(todayStr())

const branchFilter = ref(null)
const departmentFilter = ref(null)
const locationFilter = ref(null)

const { shifts } = storeToRefs(shiftStore)
const { policies } = storeToRefs(weeklyOffStore)

const shiftOptions = computed(() =>
    (shifts.value || []).filter(s => !s.deleted_at).map(s => ({ id: s.id, name: s.name }))
)
const policyOptions = computed(() =>
    (policies.value || []).filter(p => !p.deleted_at).map(p => ({ id: p.id, name: p.name }))
)

const departments = computed(() => departmentStore.department_select.filter(d => !d.parent_id))
const subDepartments = computed(() => {
    const selected = selectedDepartments.value
    if (!selected.length) return []
    return departmentStore.department_select.filter(d => selected.includes(d.parent_id))
})
const deptOptions = computed(() => departments.value.map(d => ({ value: d.value, label: d.label })))
const subDeptOptions = computed(() => subDepartments.value.map(d => ({ value: d.value, label: d.label })))
const branchOptions = computed(() => branchStore.branch_select.map(b => ({ value: b.value, label: b.label })))

const locationOptions = computed(() => {
    const branchesById = {}
    branchStore.branch_select.forEach(b => { branchesById[b.value] = b.label })
    return (locationStore.locations || []).map(loc => {
        let label = loc.formatted_address || loc.name || 'Location'
        if (loc.entity_type === 'branch' && branchesById[loc.entity_id]) {
            label = `${branchesById[loc.entity_id]} — ${label}`
        } else if (loc.entity_type === 'organization') {
            label = `Organization${loc.is_headquarters ? ' (HQ)' : ''} — ${label}`
        }
        return { value: loc.id, label }
    })
})

const hasActiveFilters = computed(() =>
    !!search.value ||
    selectedBranches.value.length > 0 ||
    selectedDepartments.value.length > 0 ||
    selectedSubDepartments.value.length > 0 ||
    selectedLocations.value.length > 0 ||
    !!selectedShiftId.value ||
    !!selectedPolicyId.value ||
    asOfDate.value !== todayStr()
)

const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1))
const rangeEnd = computed(() => Math.min(page.value * limit.value, total.value))

const initials = (emp) => {
    const name = emp?.full_name || ''
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '—'
}

const designationName = (emp) => emp?.designation?.name || emp?.designation_name || ''

const to12h = (hhmm) => {
    if (!hhmm) return ''
    const [h, m] = hhmm.split(':').map(Number)
    if (Number.isNaN(h)) return hhmm
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hr = h % 12 || 12
    return `${String(hr).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${ampm}`
}

const shiftLabel = (shift) => {
    if (!shift) return ''
    if (shift.start_time && shift.end_time) {
        return `${to12h(shift.start_time)} - ${to12h(shift.end_time)} Shift`
    }
    return shift.name || 'Shift'
}

// Badge source: as-of today => current_shift (existing behavior, unchanged).
// Any other as-of date => shift_for_date resolved server-side for that date —
// a future assignment is never shown as today's current assignment.
const shiftFor = (emp) => {
    if (asOfDate.value && asOfDate.value !== todayStr()) return emp?.shift_for_date || null
    return emp?.current_shift || null
}

// Same convention as shiftFor(): as-of today => current_weekly_off (existing
// behavior, unchanged); any other as-of date => weekly_off_for_date resolved
// server-side for that date (inclusive date-only bounds).
const weeklyOffFor = (emp) => {
    if (!emp) return null
    if (asOfDate.value && asOfDate.value !== todayStr()) return emp?.weekly_off_for_date || null
    return emp?.current_weekly_off || null
}

// Fetch page
async function fetchEmployees() {
    if (!orgId.value) return
    loading.value = true
    error.value = ''
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/employees', {
            params: {
                organization_id: orgId.value,
                page: page.value,
                limit: limit.value,
                search: search.value || undefined,
                branch_id: branchFilter.value || undefined,
                department_id: departmentFilter.value || undefined,
                location_id: locationFilter.value || undefined,
                shift_id: selectedShiftId.value || undefined,
                weekly_off_policy_id: selectedPolicyId.value || undefined,
                // Only sent when the as-of date differs from today, so default
                // behavior (current assignment) stays exactly as before.
                assignment_date: asOfDate.value && asOfDate.value !== todayStr()
                    ? asOfDate.value
                    : undefined,
                include_current_assignments: true,
            },
        })
        employees.value = data?.employees || []
        total.value = Number(data?.total || 0)
        totalPages.value = Number(data?.total_pages || 0)
    } catch (err) {
        console.error('[AssignmentsTab] fetchEmployees:', err)
        employees.value = []
        total.value = 0
        totalPages.value = 0
        error.value = err?.response?.data?.error || 'Failed to load employees'
    } finally {
        loading.value = false
    }
}

// Filter watchers (reset page to 1)
watch(search, () => {
    clearTimeout(search._t)
    search._t = setTimeout(() => { page.value = 1; fetchEmployees() }, 400)
})

watch(selectedBranches, () => {
    if (selectedBranches.value.includes('__org__')) branchFilter.value = null
    else branchFilter.value = selectedBranches.value.length ? selectedBranches.value.join(',') : null
    page.value = 1
    fetchEmployees()
})

watch(selectedDepartments, () => {
    selectedSubDepartments.value = []
    departmentFilter.value = selectedDepartments.value.length ? selectedDepartments.value.join(',') : null
    page.value = 1
    fetchEmployees()
})

watch(selectedSubDepartments, () => {
    departmentFilter.value = selectedSubDepartments.value.length
        ? selectedSubDepartments.value.join(',')
        : selectedDepartments.value.length
            ? selectedDepartments.value.join(',')
            : null
    page.value = 1
    fetchEmployees()
})

watch(selectedLocations, () => {
    locationFilter.value = selectedLocations.value.length ? selectedLocations.value.join(',') : null
    page.value = 1
    fetchEmployees()
})

watch(selectedShiftId, () => { page.value = 1; fetchEmployees() })
watch(selectedPolicyId, () => { page.value = 1; fetchEmployees() })
watch(asOfDate, () => { page.value = 1; fetchEmployees() })

function resetFilters() {
    search.value = null
    selectedBranches.value = []
    selectedDepartments.value = []
    selectedSubDepartments.value = []
    selectedLocations.value = []
    selectedShiftId.value = ''
    selectedPolicyId.value = ''
    asOfDate.value = todayStr()
    branchFilter.value = null
    departmentFilter.value = null
    locationFilter.value = null
    page.value = 1
    fetchEmployees()
}

function prevPage() {
    if (page.value > 1) { page.value -= 1; fetchEmployees() }
}
function nextPage() {
    if (page.value < totalPages.value) { page.value += 1; fetchEmployees() }
}
function changeLimit() {
    page.value = 1
    fetchEmployees()
}

// Drawers
const shiftDrawerOpen = ref(false)
const weeklyOffDrawerOpen = ref(false)
const activeEmployee = ref(null)

// As-of-aware: uses the same shiftFor() source as the badge (current_shift for today,
// shift_for_date for any other as-of date) so the drawer always edits the assignment the
// user is actually looking at — including future/upcoming rows. Never current_shift-only.
const activeShiftAssignment = computed(() => {
    const s = shiftFor(activeEmployee.value)
    if (!s) return null
    return {
        id: s.assignment_id,
        employee_id: activeEmployee.value?.id,
        shift_id: s.id,
        valid_from: s.valid_from || '',
        valid_to: s.valid_to || '',
    }
})

const activeWeeklyOffAssignment = computed(() => {
    const w = weeklyOffFor(activeEmployee.value)
    if (!w) return null
    return {
        id: w.assignment_id,
        employee_id: activeEmployee.value?.id,
        weekly_off_policy_id: w.id,
        effective_from: w.effective_from,
        effective_to: w.effective_to || '',
    }
})

function openShiftDrawer(emp) {
    activeEmployee.value = emp
    shiftDrawerOpen.value = true
}

function openWeeklyOffDrawer(emp) {
    activeEmployee.value = emp
    weeklyOffDrawerOpen.value = true
}

async function onShiftSaved() {
    // Refresh only the affected row's current shift if practical; preserve filters/page
    await fetchEmployees()
}

async function onWeeklyOffSaved() {
    await fetchEmployees()
}

onMounted(async () => {
    if (!orgId.value) return
    departmentStore.organization_id = orgId.value
    branchStore.organization_id = orgId.value
    locationStore.organization_id = orgId.value
    await Promise.all([
        shiftStore.fetchShifts(orgId.value),
        weeklyOffStore.fetchPolicies(orgId.value),
        departmentStore.fetchAllDepartments(),
        branchStore.fetchAllBranches(),
        locationStore.fetchLocations(),
        fetchEmployees(),
    ])
})
</script>
