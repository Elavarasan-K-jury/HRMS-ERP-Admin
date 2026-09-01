<template>
    <div class="flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Employee Login</h2>
                <p class="text-xs text-white/55">Manage registered access and review sign-in activity.</p>
            </div>
            <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="refreshActiveTab" />
        </div>

        <UiTabs v-model="activeTab" :tabs="tabs" color="#4aff7a">
            <section v-show="activeTab === 0" class="mt-2 login-card overflow-hidden">
                <div class="flex flex-wrap items-center gap-2 border-b border-white/10 p-3">
                    <div class="relative min-w-[200px] flex-1">
                        <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                        <input v-model="searchQuery" type="text" placeholder="Search name, code, email, mobile..."
                            class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
                    </div>
                    <EmployeesFilterDropdown v-model="buFilter" :options="buOptions" title="Business Unit" />
                    <EmployeesFilterDropdown v-model="statusFilter" :options="statusOptions" title="Login Status" />
                    <EmployeesFilterDropdown v-model="deptFilter" :options="deptOptions" title="Department" />
                    <EmployeesFilterDropdown v-model="locationFilter" :options="locationOptions" title="Location" />
                    <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                        @click="resetFilters" :disabled="!hasActiveFilters" />
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="bg-white/10 border-b border-white/10">
                            <tr>
                                <th class="th">Employee Code</th>
                                <th class="th">Employee</th>
                                <th class="th">Email</th>
                                <th class="th">Mobile</th>
                                <th class="th">Department</th>
                                <th class="th">Sub Department</th>
                                <th class="th">Designation</th>
                                <th class="th">Business Unit</th>
                                <th class="th">Location</th>
                                <th class="th">Login Status</th>
                                <th class="th">Available Methods</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="loading">
                                <tr v-for="index in 5" :key="index" class="border-b border-white/5 animate-pulse">
                                    <td v-for="cell in 11" :key="cell" class="px-4 py-4"><div class="h-4 w-3/4 rounded bg-white/10" /></td>
                                </tr>
                            </template>
                            <template v-else-if="!filteredRegistrations.length">
                                <tr>
                                    <td colspan="11" class="px-4 py-12 text-center text-white/55">
                                        {{ hasActiveFilters ? 'No registrations match your filters.' : 'No employee login registrations found.' }}
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-for="employee in filteredRegistrations" :key="employee.id" class="border-b border-white/5 hover:bg-white/5">
                                    <td class="px-4 py-3 font-mono text-xs text-white/70">{{ employee.employee_code || '—' }}</td>
                                    <td class="px-4 py-3 font-medium">{{ employee.name }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.email || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.phone || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.department }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.sub_department }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.designation }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.business_unit }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ employee.location }}</td>
                                    <td class="px-4 py-3">
                                        <span class="badge" :class="employee.login_status === 'Registered' ? 'badge-active' : 'badge-inactive'">
                                            {{ employee.login_status }}
                                        </span>
                                        <p v-if="employee.login_registered_at" class="mt-1 whitespace-nowrap text-xs text-white/50">
                                            {{ employee.login_registered_at }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3 text-white/70">{{ authenticationMethods(employee) }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </section>

            <section v-show="activeTab === 1" class="mt-2 login-card overflow-hidden">
                <div class="flex flex-wrap items-center gap-2 border-b border-white/10 p-3">
                    <div class="relative min-w-[200px] flex-1">
                        <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                        <input v-model="historySearch" type="text" placeholder="Search name, code, email, mobile, IP..."
                            class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <Icon name="ion:calendar-outline" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-white/40" />
                            <select v-model="historyRange" class="range-select" title="Date range">
                                <option value="">All Time</option>
                                <option value="7">Last 7 Days</option>
                                <option value="14">Last 14 Days</option>
                                <option value="40">Last 40 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <template v-if="historyRange === 'custom'">
                            <div class="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5">
                                <Icon name="ion:calendar-outline" class="text-white/40" />
                                <input v-model="historyFrom" type="date"
                                    class="bg-transparent text-sm text-white/90 outline-none [color-scheme:dark]" title="From date" />
                            </div>
                            <span class="text-white/40 text-xs">to</span>
                            <div class="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5">
                                <Icon name="ion:calendar-outline" class="text-white/40" />
                                <input v-model="historyTo" type="date"
                                    class="bg-transparent text-sm text-white/90 outline-none [color-scheme:dark]" title="To date" />
                            </div>
                        </template>
                    </div>
                    <EmployeesFilterDropdown v-model="historyDeptFilter" :options="historyDeptOptions" title="Department" />
                    <EmployeesFilterDropdown v-model="historySubDeptFilter" :options="historySubDeptOptions" title="Sub Department" />
                    <EmployeesFilterDropdown v-model="historyLocFilter" :options="historyLocOptions" title="Location" />
                    <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                        @click="resetHistoryFilters" :disabled="!hasHistoryFilters" />
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="bg-white/10 border-b border-white/10">
                            <tr>
                                <th class="th">Employee</th>
                                <th class="th">Email</th>
                                <th class="th">IP Address</th>
                                <th class="th">Department</th>
                                <th class="th">Sub Department</th>
                                <th class="th">Designation</th>
                                <th class="th">Business Unit</th>
                                <th class="th">Location</th>
                                <th class="th">Method</th>
                                <th class="th">Signed In</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="historyLoading">
                                <tr v-for="index in 5" :key="index" class="border-b border-white/5 animate-pulse">
                                    <td v-for="cell in 10" :key="cell" class="px-4 py-4"><div class="h-4 w-3/4 rounded bg-white/10" /></td>
                                </tr>
                            </template>
                            <template v-else-if="!filteredHistoryLogs.length">
                                <tr>
                                    <td colspan="10" class="px-4 py-12 text-center">
                                        <Icon name="ion:time-outline" class="mx-auto mb-3 text-4xl text-white/40" />
                                        <p class="text-white/55">{{ hasHistoryFilters ? 'No login history matches your filters.' : 'No login history yet.' }}</p>
                                        <p class="mx-auto mt-1 max-w-md text-sm text-white/45">
                                            {{ hasHistoryFilters ? 'Try adjusting the filters or resetting them.' : 'Successful employee sign-ins will appear here once employees log in.' }}
                                        </p>
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-for="log in filteredHistoryLogs" :key="log.id" class="border-b border-white/5 hover:bg-white/5">
                                    <td class="px-4 py-3">
                                        <div class="font-medium">{{ log.employee_name || '—' }}</div>
                                        <div v-if="log.employee_code" class="font-mono text-xs text-white/60">{{ log.employee_code }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-white/70">{{ log.email || '—' }}</td>
                                    <td class="px-4 py-3 font-mono text-xs text-white/60">{{ log.ip_address || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.department || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.sub_department || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.designation || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.business_unit || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ locationById(logLocationId(log)) }}</td>
                                    <td class="px-4 py-3">
                                        <span class="badge badge-active">{{ log.authentication_type || 'Basic' }}</span>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-white/70">{{ log.created_at }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </section>

            <section v-show="activeTab === 2" class="mt-2 login-card overflow-hidden">
                <div class="flex flex-wrap items-center gap-2 border-b border-white/10 p-3">
                    <div class="relative min-w-[200px] flex-1">
                        <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                        <input v-model="failedSearch" type="text" placeholder="Search name, code, email, mobile, IP..."
                            class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <Icon name="ion:calendar-outline" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-white/40" />
                            <select v-model="failedRange" class="range-select" title="Date range">
                                <option value="">All Time</option>
                                <option value="7">Last 7 Days</option>
                                <option value="14">Last 14 Days</option>
                                <option value="40">Last 40 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <template v-if="failedRange === 'custom'">
                            <div class="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5">
                                <Icon name="ion:calendar-outline" class="text-white/40" />
                                <input v-model="failedFrom" type="date"
                                    class="bg-transparent text-sm text-white/90 outline-none [color-scheme:dark]" title="From date" />
                            </div>
                            <span class="text-white/40 text-xs">to</span>
                            <div class="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5">
                                <Icon name="ion:calendar-outline" class="text-white/40" />
                                <input v-model="failedTo" type="date"
                                    class="bg-transparent text-sm text-white/90 outline-none [color-scheme:dark]" title="To date" />
                            </div>
                        </template>
                    </div>
                    <EmployeesFilterDropdown v-model="failedDeptFilter" :options="failedDeptOptions" title="Department" />
                    <EmployeesFilterDropdown v-model="failedSubDeptFilter" :options="failedSubDeptOptions" title="Sub Department" />
                    <EmployeesFilterDropdown v-model="failedLocFilter" :options="failedLocOptions" title="Location" />
                    <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                        @click="resetFailedFilters" :disabled="!hasFailedFilters" />
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="bg-white/10 border-b border-white/10">
                            <tr>
                                <th class="th">Employee</th>
                                <th class="th">Email / Phone</th>
                                <th class="th">IP Address</th>
                                <th class="th">Department</th>
                                <th class="th">Sub Department</th>
                                <th class="th">Designation</th>
                                <th class="th">Business Unit</th>
                                <th class="th">Location</th>
                                <th class="th">Issue</th>
                                <th class="th">Method</th>
                                <th class="th">Attempted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="failedLoading">
                                <tr v-for="index in 5" :key="index" class="border-b border-white/5 animate-pulse">
                                    <td v-for="cell in 11" :key="cell" class="px-4 py-4"><div class="h-4 w-3/4 rounded bg-white/10" /></td>
                                </tr>
                            </template>
                            <template v-else-if="!filteredFailedLogs.length">
                                <tr>
                                    <td colspan="11" class="px-4 py-12 text-center">
                                        <Icon name="ion:checkmark-circle-outline" class="mx-auto mb-3 text-4xl text-emerald-300/60" />
                                        <p class="text-white/55">{{ hasFailedFilters ? 'No failed logins match your filters.' : 'No failed logins.' }}</p>
                                        <p class="mx-auto mt-1 max-w-md text-sm text-white/45">
                                            {{ hasFailedFilters ? 'Try adjusting the filters or resetting them.' : 'Failed employee sign-in attempts will appear here with the issue detected.' }}
                                        </p>
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-for="log in filteredFailedLogs" :key="log.id" class="border-b border-white/5 hover:bg-white/5">
                                    <td class="px-4 py-3">
                                        <div class="font-medium">{{ log.employee_name || 'Unknown employee' }}</div>
                                        <div v-if="log.employee_code" class="font-mono text-xs text-white/60">{{ log.employee_code }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-white/70">{{ log.email || log.phone || '—' }}</td>
                                    <td class="px-4 py-3 font-mono text-xs text-white/60">{{ log.ip_address || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.department || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.sub_department || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.designation || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ log.business_unit || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ locationById(logLocationId(log)) }}</td>
                                    <td class="px-4 py-3">
                                        <span class="badge badge-inactive">{{ log.issue || 'Failed' }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-white/70">{{ log.authentication_type || '—' }}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-white/70">{{ log.created_at }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </section>
        </UiTabs>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '~/stores/employee.store'
import { useDepartmentStore } from '~/stores/department.store'
import { useBranchStore } from '~/stores/branch.store'
import { useLocationStore } from '~/stores/location.store'

const activeTab = ref(0)
const loading = ref(false)
const historyLoading = ref(false)
const failedLoading = ref(false)
const historyLogs = ref([])
const failedLogs = ref([])
const route = useRoute()
const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()
const branchStore = useBranchStore()
const locationStore = useLocationStore()
const { all_employees } = storeToRefs(employeesStore)

const tabs = [
    { label: 'Login Registrations', icon: 'ion:person-add-outline' },
    { label: 'Login History', icon: 'ion:time-outline' },
    { label: 'Failed Logins', icon: 'ion:warning-outline' },
]

// 🔽 Filter state (arrays for multi-select)
const searchQuery = ref('')
const buFilter = ref([])
const statusFilter = ref([])
const deptFilter = ref([])
const locationFilter = ref([]) // 🔒 Location pending — enabled once implemented

const registrations = computed(() => (all_employees.value || []).map(employee => {
    const department = primaryDepartment(employee)
    const branch = branchById(employee.branch_id || employee.branch?.id)
    return {
        id: employee.id,
        name: employee.full_name || employee.name || [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'Unnamed employee',
        employee_code: employee.employee_code,
        email: employee.email,
        phone: employee.phone,
        is_active: employee.is_active ?? true,
        login_status: employee.login_status || (employee.is_active === false ? 'Disabled' : 'Registered'),
        login_registered_at: employee.login_registered_at || employee.created_at || '',
        department: department.department,
        sub_department: department.subDepartment,
        designation: employee.designation?.name || '—',
        // Business Unit = assigned branch if present, otherwise the main organization
        business_unit: branch || employee.organization?.name || department.businessUnit,
        location_id: derivedLocationId(employee),
        location: locationById(derivedLocationId(employee)),
    }
}))

// 🏢 Look up a branch label from the branch store
const branchById = (id) => {
    if (!id) return ''
    const match = branchStore.branch_select.find(b => b.value === id)
    return match?.label || ''
}

const toOptions = (values) =>
    [...new Set(values.filter(v => v && v !== '—'))].sort().map(v => ({ value: v, label: v }))

const buOptions = computed(() => {
    // Start with branches from the branch store + main org name
    const branchLabels = branchStore.branch_select.map(b => b.label)
    const orgName = employeesStore.organization?.name || ''
    const all = [...branchLabels, orgName]
    // Also include any business_units already present in registrations (fallback)
    const fromReg = registrations.value.map(r => r.business_unit)
    return toOptions([...all, ...fromReg])
})

const statusOptions = computed(() => toOptions(registrations.value.map(r => r.login_status)))
const deptOptions = computed(() => toOptions(registrations.value.map(r => r.department)))
const locationOptions = computed(() => {
    const branchesById = {}
    branchStore.branch_select.forEach(b => { branchesById[b.value] = b.label })
    return (locationStore.locations || []).map(loc => {
        let label = loc.formatted_address || 'Location'
        if (loc.entity_type === 'branch' && branchesById[loc.entity_id]) {
            label = `${branchesById[loc.entity_id]} — ${label}`
        } else if (loc.entity_type === 'organization') {
            label = `Organization${loc.is_headquarters ? ' (HQ)' : ''} — ${label}`
        }
        return { value: loc.id, label }
    })
})

const locationById = (id) => {
    if (!id) return '—'
    const match = locationOptions.value.find(o => o.value === id)
    return match?.label || '—'
}

// Derive an employee's location: explicit location_id first, then their
// branch's location, then the organization (HQ) location.
const derivedLocationId = (employee) => {
    if (!employee) return ''
    if (employee.location_id) return employee.location_id
    const branchId = employee.branch_id || employee.branch?.id
    if (branchId) {
        const loc = (locationStore.locations || []).find(l =>
            l.entity_type === 'branch' && String(l.entity_id) === String(branchId))
        if (loc) return loc.id
    }
    const orgLoc = (locationStore.locations || []).find(l =>
        l.entity_type === 'organization' && (!l.entity_id || l.entity_id === ''))
    return orgLoc?.id || ''
}

// A login log's location: the stored employee location_id, else derive from the
// linked employee record (fallback for logs created before the field existed).
const logLocationId = (log) => {
    if (!log) return ''
    if (log.location_id) return log.location_id
    const emp = (all_employees.value || []).find(e => e.id === log.employee_id)
    return emp ? derivedLocationId(emp) : ''
}

const hasActiveFilters = computed(() =>
    !!searchQuery.value
    || buFilter.value.length > 0
    || statusFilter.value.length > 0
    || deptFilter.value.length > 0
    || locationFilter.value.length > 0)

const filteredRegistrations = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    return registrations.value.filter(r => {
        if (q) {
            const hay = [r.name, r.employee_code, r.email, r.phone, r.designation]
                .filter(Boolean).join(' ').toLowerCase()
            if (!hay.includes(q)) return false
        }
        if (buFilter.value.length && !buFilter.value.includes(r.business_unit)) return false
        if (statusFilter.value.length && !statusFilter.value.includes(r.login_status)) return false
        if (deptFilter.value.length && !deptFilter.value.includes(r.department)) return false
        if (locationFilter.value.length && !locationFilter.value.includes(r.location_id)) return false
        return true
    })
})

const resetFilters = () => {
    searchQuery.value = ''
    buFilter.value = []
    statusFilter.value = []
    deptFilter.value = []
    locationFilter.value = []
}

// 🔽 Department helpers (name-based, from the department store so ALL depts are listed)
const parseLeafName = (label) => (label || '').split('>>').pop().replace(/\s*\([^)]*\)\s*$/, '').trim()

const storeTopDeptNames = computed(() =>
    departmentStore.department_select.filter(d => !d.parent_id).map(d => parseLeafName(d.label)).filter(Boolean))

const storeSubDeptMap = computed(() => {
    const map = {}
    const byId = new Map(departmentStore.department_select.map(d => [d.value, d]))
    departmentStore.department_select.forEach(d => {
        if (!d.parent_id) return
        const parentEntry = byId.get(d.parent_id)
        if (!parentEntry) return
        const parentName = parseLeafName(parentEntry.label)
        const childName = parseLeafName(d.label)
        if (parentName && childName) (map[parentName] ??= new Set()).add(childName)
    })
    return map
})

const splitParts = (value) => (value || '').split(',').map(s => s.trim()).filter(Boolean)

const logDeptNames = (logs) => [...new Set(logs.flatMap(l => splitParts(l.department)))]
const logSubDeptNames = (logs) => [...new Set(logs.flatMap(l => splitParts(l.sub_department)))]

const subDeptCandidates = (logs, deptSelection) => {
    const names = new Set()
    const selected = new Set(deptSelection)
    if (!selected.size) {
        Object.values(storeSubDeptMap.value).forEach(set => set.forEach(n => names.add(n)))
        return names
    }
    selected.forEach(d => (storeSubDeptMap.value[d] || []).forEach(n => names.add(n)))
    logs.forEach(l => {
        if (splitParts(l.department).some(p => selected.has(p))) {
            splitParts(l.sub_department).forEach(n => names.add(n))
        }
    })
    return names
}

// 🔽 Login History filters
const historySearch = ref('')
const historyRange = ref('')
const historyFrom = ref('')
const historyTo = ref('')
const historyDeptFilter = ref([])
const historySubDeptFilter = ref([])
const historyLocFilter = ref([])

const historyDeptOptions = computed(() =>
    toOptions([...storeTopDeptNames.value, ...logDeptNames(historyLogs.value)]))
const historySubDeptOptions = computed(() =>
    toOptions([...subDeptCandidates(historyLogs.value, historyDeptFilter.value), ...logSubDeptNames(historyLogs.value)]))
const historyLocOptions = computed(() => locationOptions.value)

const hasHistoryFilters = computed(() =>
    !!historySearch.value
    || !!historyRange.value
    || !!historyFrom.value
    || !!historyTo.value
    || historyDeptFilter.value.length > 0
    || historySubDeptFilter.value.length > 0
    || historyLocFilter.value.length > 0)

const filteredHistoryLogs = computed(() => {
    const { from, to } = resolveDateRange(historyRange.value, historyFrom.value, historyTo.value)
    return filterLogs(historyLogs.value, {
        search: historySearch.value,
        from,
        to,
        dept: historyDeptFilter.value,
        subDept: historySubDeptFilter.value,
        loc: historyLocFilter.value,
    })
})

const resetHistoryFilters = () => {
    historySearch.value = ''
    historyRange.value = ''
    historyFrom.value = ''
    historyTo.value = ''
    historyDeptFilter.value = []
    historySubDeptFilter.value = []
    historyLocFilter.value = []
}

// 🔽 Failed Logins filters
const failedSearch = ref('')
const failedRange = ref('')
const failedFrom = ref('')
const failedTo = ref('')
const failedDeptFilter = ref([])
const failedSubDeptFilter = ref([])
const failedLocFilter = ref([])

const failedDeptOptions = computed(() =>
    toOptions([...storeTopDeptNames.value, ...logDeptNames(failedLogs.value)]))
const failedSubDeptOptions = computed(() =>
    toOptions([...subDeptCandidates(failedLogs.value, failedDeptFilter.value), ...logSubDeptNames(failedLogs.value)]))
const failedLocOptions = computed(() => locationOptions.value)

const hasFailedFilters = computed(() =>
    !!failedSearch.value
    || !!failedRange.value
    || !!failedFrom.value
    || !!failedTo.value
    || failedDeptFilter.value.length > 0
    || failedSubDeptFilter.value.length > 0
    || failedLocFilter.value.length > 0)

const filteredFailedLogs = computed(() => {
    const { from, to } = resolveDateRange(failedRange.value, failedFrom.value, failedTo.value)
    return filterLogs(failedLogs.value, {
        search: failedSearch.value,
        from,
        to,
        dept: failedDeptFilter.value,
        subDept: failedSubDeptFilter.value,
        loc: failedLocFilter.value,
    })
})

const resetFailedFilters = () => {
    failedSearch.value = ''
    failedRange.value = ''
    failedFrom.value = ''
    failedTo.value = ''
    failedDeptFilter.value = []
    failedSubDeptFilter.value = []
    failedLocFilter.value = []
}

const resolveDateRange = (range, from, to) => {
    if (range === 'custom') return { from, to }
    if (range) {
        const start = new Date()
        start.setDate(start.getDate() - Number(range))
        start.setHours(0, 0, 0, 0)
        return { from: start.toISOString(), to: new Date().toISOString() }
    }
    return { from: '', to: '' }
}

// ISO timestamp preferred; fallback parses the en-IN "DD/MM/YYYY, hh:mm am/pm" display string
const toLogDate = (log) => {
    if (log.timestamp) {
        const d = new Date(log.timestamp)
        if (!Number.isNaN(d.getTime())) return d
    }
    const m = String(log.created_at || '').match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})\s*([ap]m)/)
    if (m) {
        let h = Number(m[4])
        if (m[6] === 'pm' && h !== 12) h += 12
        if (m[6] === 'am' && h === 12) h = 0
        return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), h, Number(m[5]))
    }
    return new Date(log.created_at)
}

const filterLogs = (logs, f) => {
    const q = f.search.trim().toLowerCase()
    return logs.filter(log => {
        if (q) {
            const hay = [log.employee_name, log.employee_code, log.email, log.phone, log.ip_address,
                    log.department, log.sub_department, log.designation, log.business_unit, log.issue]
                .filter(Boolean).join(' ').toLowerCase()
            if (!hay.includes(q)) return false
        }
        if (f.from || f.to) {
            const time = toLogDate(log).getTime()
            if (Number.isNaN(time)) return !f.from && !f.to
            if (f.from && time < new Date(f.from).getTime()) return false
            if (f.to) {
                const end = new Date(f.to)
                end.setHours(23, 59, 59, 999)
                if (time > end.getTime()) return false
            }
        }
        if (f.dept.length) {
            const parts = splitParts(log.department)
            if (!parts.some(p => f.dept.includes(p))) return false
        }
        if (f.subDept.length) {
            const parts = splitParts(log.sub_department)
            if (!parts.some(p => f.subDept.includes(p))) return false
        }
        if (f.loc.length && !f.loc.includes(logLocationId(log))) return false
        return true
    })
}

const refreshActiveTab = () => {
    if (activeTab.value === 0) loadRegistrations()
    else if (activeTab.value === 1) fetchLoginLogs('SUCCESS')
    else if (activeTab.value === 2) fetchLoginLogs('FAILED')
}

const fetchLoginLogs = async (status) => {
    const loadingRef = status === 'SUCCESS' ? historyLoading : failedLoading
    const targetRef = status === 'SUCCESS' ? historyLogs : failedLogs
    loadingRef.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/organizations/${route.params.organization}/login-logs`, {
            params: { status, page: 1, limit: 50 },
        })
        targetRef.value = data?.logs || []
    } catch (err) {
        console.error(`Failed to fetch ${status} login logs:`, err)
        targetRef.value = []
    } finally {
        loadingRef.value = false
    }
}

const loadRegistrations = async () => {
    loading.value = true
    try {
        if (!employeesStore.organization_id) {
            employeesStore.organization_id = route.params.organization
        }
        if (!departmentStore.organization_id) {
            departmentStore.organization_id = route.params.organization
        }
        if (!branchStore.organization_id) {
            branchStore.organization_id = route.params.organization
        }
        if (!locationStore.organization_id) {
            locationStore.organization_id = route.params.organization
        }
        await Promise.all([
            employeesStore.fetchAllEmployees(),
            departmentStore.fetchAllDepartments(),
            branchStore.fetchAllBranches(),
            locationStore.fetchLocations(),
        ])
    } finally {
        loading.value = false
    }
}

const handleRefresh = (event) => {
    if (event.detail?.tab === 'login' || event.detail?.tab === 0) {
        refreshActiveTab()
    }
}

onMounted(() => {
    loadRegistrations()
    fetchLoginLogs('SUCCESS')
    fetchLoginLogs('FAILED')
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => window.removeEventListener('refresh-tab', handleRefresh))

// 🏢 Primary department & business unit helpers
const primaryDepartment = (employee) => {
    const assignments = employee.departments || []
    const departments = assignments.map(a => a.department).filter(Boolean)
    if (!departments.length) return { department: '—', subDepartment: '—', businessUnit: '—' }

    const hierarchy = departments.map((department) => {
        if (department.parent) {
            return {
                department: department.parent.name || '—',
                subDepartment: department.name || '—',
            }
        }

        const selected = departmentStore.department_select.find(item => item.value === department.id)
        if (selected?.parent_id) {
            const parent = departmentStore.department_select.find(item => item.value === selected.parent_id)
            if (parent) {
                return {
                    department: parent.label.replace(/^—+\s*/, ''),
                    subDepartment: department.name || '—',
                }
            }
        }

        return { department: department.name || '—', subDepartment: '—' }
    })

    return {
        department: hierarchy.map(item => item.department).join(', '),
        subDepartment: hierarchy.map(item => item.subDepartment).filter(item => item !== '—').join(', ') || '—',
        businessUnit: businessUnitOf(departments[0]),
    }
}

const businessUnitOf = (department) => {
    let current = department
    while (current.parent) current = current.parent
    while (current.id) {
        const next = departmentStore.department_select.find(item => item.value === current.id)?.parent_id
        const parent = next ? departmentStore.department_select.find(item => item.value === next) : null
        if (parent) current = { id: parent.value, name: parent.label.replace(/^—+\s*/, '') }
        else break
    }
    return current.name || '—'
}

const authenticationMethods = (employee) => {
    const methods = []
    if (employee.email) methods.push('Basic')
    if (employee.phone) methods.push('Mobile OTP')
    return methods.join(', ') || '—'
}
</script>

<style scoped>
.login-card { @apply rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg; }
.range-select { @apply appearance-none rounded-lg border border-white/15 bg-black/20 py-2 pl-8 pr-3 text-sm text-white/90 outline-none transition focus:border-emerald-300/60 [color-scheme:dark]; }
.range-select option { @apply bg-neutral-900 text-white/90; }
.th { @apply px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60; }
.badge { @apply inline-flex rounded-full px-2 py-0.5 text-xs font-medium; }
.badge-active { @apply bg-emerald-500/20 text-emerald-300; }
.badge-inactive { @apply bg-red-500/20 text-red-300; }
</style>