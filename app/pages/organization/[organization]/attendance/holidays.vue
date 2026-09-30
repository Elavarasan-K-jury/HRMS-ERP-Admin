<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- LOADING -->
        <div v-if="initialLoading" class="flex items-center justify-center h-full w-full">
            <UiLoader />
        </div>

        <template v-else>
            <!-- TWO-COLUMN LAYOUT -->
            <div class="flex gap-2 flex-1 min-h-0">

                <!-- LEFT SIDEBAR: Policy List -->
                <div class="w-72 shrink-0 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    <!-- Search + Header -->
                    <div class="p-3 border-b border-white/10">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-sm font-semibold text-white/90">Holiday Policies</h3>
                            <span class="text-xs text-white/50">{{ policyStore.policies.length }}</span>
                        </div>
                        <input v-model="policySearch" type="text" placeholder="Search policies..."
                            class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                    </div>

                    <!-- Policy List -->
                    <div class="flex-1 overflow-y-auto">
                        <div v-if="filteredPolicies.length === 0" class="p-4 text-center">
                            <p class="text-xs text-white/50 mb-2">No holiday policies created yet.</p>
                            <UiButton @click="openCreatePolicyModal" color="#4aff7a" text="+ Create Holiday Policy"
                                size="sm" />
                        </div>
                        <button v-for="policy in filteredPolicies" :key="policy.id"
                            class="w-full text-left px-3 py-3 border-b border-white/5 transition-colors"
                            :class="policyStore.selected_policy_id === policy.id
                                ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                                : 'hover:bg-white/5 border-l-2 border-l-transparent'"
                            @click="selectPolicy(policy)">
                            <div class="text-sm font-medium text-white/90">{{ policy.name }}</div>
                            <div class="text-[11px] text-white/50 mt-0.5">
                                {{ policyEmployeeCounts[policy.id] || 0 }} Employees
                            </div>
                        </button>
                    </div>

                    <!-- New Policy Button -->
                    <div class="p-3 border-t border-white/10">
                        <UiButton @click="openCreatePolicyModal" color="#4aff7a" text="+ New Holiday Policy"
                            size="sm" class="w-full" />
                    </div>
                </div>

                <!-- RIGHT CONTENT: Selected Policy -->
                <div class="flex-1 flex flex-col rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    <!-- No Policy Selected -->
                    <div v-if="!policyStore.selected_policy_id"
                        class="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <Icon name="ion:calendar-number-outline" class="text-5xl text-white/20 mb-4" />
                        <p class="text-sm text-white/50 mb-3">No holiday policies created yet.</p>
                        <UiButton @click="openCreatePolicyModal" color="#4aff7a" text="+ Create Holiday Policy"
                            size="sm" />
                    </div>

                    <!-- Policy Selected -->
                    <template v-else>
                        <!-- Policy Header -->
                        <div class="px-4 pt-4 pb-2 border-b border-white/10">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-lg font-semibold text-white/90">
                                        {{ selectedPolicy?.name || 'Holiday Policy' }}
                                    </h2>
                                    <button class="text-xs text-emerald-400 hover:text-emerald-300 mt-0.5"
                                        @click="openEmployeeDrawer">
                                        <Icon name="ion:people-outline" class="inline mr-1" />
                                        {{ employeeCount }} Employees
                                    </button>
                                </div>
                                <div class="flex items-center gap-2">
                                    <UiButton @click="openAddHolidayRow" color="#4aff7a" text="+ Add Holiday"
                                        size="sm" prepend-icon="ion:add-circle"
                                        :disabled="!canCreateHolidaysForYear(selectedYear)" />
                                    <!-- Three-dot menu -->
                                    <div class="relative" ref="policyMenuRef">
                                        <button @click="policyMenuOpen = !policyMenuOpen"
                                            class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                            <Icon name="ion:ellipsis-vertical" class="w-4 h-4" />
                                        </button>
    <div v-if="policyMenuOpen"
        class="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
        <button @click="handlePolicyMenuEdit"
            class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2">
            <Icon name="ion:create-outline" class="w-4 h-4" />
            Edit Policy
        </button>
        <button @click="handlePolicyMenuBulkImport"
            :disabled="!canCreateHolidaysForYear(selectedYear)"
            class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <Icon name="ion:cloud-upload-outline" class="w-4 h-4" />
            Bulk Import Holidays
        </button>
        <button @click="handlePolicyMenuDelete"
            class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
            <Icon name="ion:trash" class="w-4 h-4" />
            Delete Policy
        </button>
    </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Year Tabs -->
                            <div class="flex items-center gap-1 mt-3 -mb-px overflow-x-auto scrollbar-none">
                                <button v-for="year in availableYears" :key="year"
                                    class="px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap"
                                    :class="selectedYear === year
                                        ? 'bg-white/10 text-white border-b-2 border-emerald-400'
                                        : 'text-white/50 hover:text-white/70 hover:bg-white/5'"
                                    @click="selectYear(year)">
                                    {{ year }}
                                </button>
                            </div>
                        </div>

                        <!-- Holiday Table -->
                        <div class="flex-1 overflow-y-auto">
                            <!-- Loading -->
                            <div v-if="holidayStore.loading" class="flex items-center justify-center h-40">
                                <UiLoader />
                            </div>

                            <!-- Empty State -->
                            <div v-else-if="policyHolidays.length === 0 && !newHolidayRow"
                                class="flex flex-col items-center justify-center h-40 text-center">
                                <Icon name="ion:calendar-outline" class="text-4xl text-white/20 mb-3" />
                                <p v-if="isPreparationYear(selectedYear)" class="text-sm text-white/50 mb-1">{{ preparationMessage }}</p>
                                <p v-else class="text-sm text-white/50 mb-3">No holidays for {{ selectedYear }}.</p>
                                <UiButton v-if="canCreateHolidaysForYear(selectedYear)" @click="openAddHolidayRow" color="#4aff7a" text="+ Add Holiday"
                                    size="sm" />
                            </div>

                            <!-- Holiday Table -->
                            <table v-else class="w-full text-sm">
                                <thead>
                                    <tr class="text-[11px] uppercase tracking-[0.18em] text-white/50 border-b border-white/10">
                                        <th class="text-left px-4 py-3 font-medium">Holiday Name</th>
                                        <th class="text-left px-4 py-3 font-medium">Date</th>
                                        <th class="text-left px-4 py-3 font-medium">Optional</th>
                                        <th class="text-right px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- NEW HOLIDAY ROW (inline add) -->
                                    <tr v-if="newHolidayRow" class="border-b border-emerald-500/20 bg-emerald-500/5">
                                        <td class="px-4 py-2">
                                            <input v-model="newHolidayRow.name" type="text" placeholder="Holiday name"
                                                class="w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                        </td>
                                        <td class="px-4 py-2">
                                            <input v-model="newHolidayRow.date" type="date"
                                                :max="`${selectedYear}-12-31`"
                                                :min="`${selectedYear}-01-01`"
                                                class="w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                        </td>
                                        <td class="px-4 py-2">
                                            <UiSwitch v-model="newHolidayRow.leave_optional" size="sm" />
                                        </td>
                                        <td class="px-4 py-2 text-right">
                                            <div class="flex items-center justify-end gap-1">
                                                <button @click="saveNewHoliday"
                                                    :disabled="newHolidaySaving"
                                                    class="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                                                    <Icon name="ion:checkmark" class="w-4 h-4" />
                                                </button>
                                                <button @click="cancelNewHoliday"
                                                    class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                                    <Icon name="ion:close" class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- EXISTING HOLIDAY ROWS -->
                                    <tr v-for="h in policyHolidays" :key="h.id"
                                        class="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        :class="editingHolidayId === h.id ? 'bg-white/5' : ''">
                                        <!-- View mode -->
                                        <template v-if="editingHolidayId !== h.id">
                                            <td class="px-4 py-3 font-medium text-white">{{ h.name }}</td>
                                            <td class="px-4 py-3 text-white/80">{{ formatDate(h.date) }}</td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                    :class="h.leave_optional ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'">
                                                    {{ h.leave_optional ? 'Yes' : 'No' }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-right">
                                                <div class="flex items-center justify-end gap-1">
                                                    <button @click="startEditHoliday(h)"
                                                        class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                                        <Icon name="ion:create-outline" class="w-4 h-4" />
                                                    </button>
                                                    <button @click="confirmDeleteHoliday(h)"
                                                        class="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                                        <Icon name="ion:trash" class="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </template>

                                        <!-- Edit mode -->
                                        <template v-else>
                                            <td class="px-4 py-2">
                                                <input v-model="editingHolidayData.name" type="text"
                                                    class="w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                            </td>
                                            <td class="px-4 py-2">
                                                <input v-model="editingHolidayData.date" type="date"
                                                    class="w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                            </td>
                                            <td class="px-4 py-2">
                                                <UiSwitch v-model="editingHolidayData.leave_optional" size="sm" />
                                            </td>
                                            <td class="px-4 py-2 text-right">
                                                <div class="flex items-center justify-end gap-1">
                                                    <button @click="saveEditHoliday"
                                                        :disabled="editingHolidaySaving"
                                                        class="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                                                        <Icon name="ion:checkmark" class="w-4 h-4" />
                                                    </button>
                                                    <button @click="cancelEditHoliday"
                                                        class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                                        <Icon name="ion:close" class="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </template>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <!-- CREATE POLICY MODAL -->
        <UiModal v-model="createPolicyModal" title="Create Holiday Policy" size="sm">
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wide">Policy Name
                        *</label>
                    <input v-model="policyStore.name" type="text" placeholder="e.g. Holiday List"
                        class="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
                </div>
            </div>
            <template #footer>
                <UiButton @click="createPolicyModal = false" color="#fff" text="Cancel" size="sm" />
                <UiButton @click="handleCreatePolicy" color="#4aff7a" text="Create Policy" size="sm"
                    :loading="policyStore.loading" />
            </template>
        </UiModal>

        <!-- EDIT POLICY DRAWER (right-side) -->
        <UiSidebarModal v-model="editPolicyDrawer" title="Edit Holiday Policy" width="480px">
            <div class="space-y-5">
                <div>
                    <label class="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">Policy Name
                        *</label>
                    <input v-model="editPolicyForm.name" type="text" placeholder="e.g. Holiday List"
                        class="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">Status</label>
                    <select v-model="editPolicyForm.is_active"
                        class="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60">
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
                    </select>
                </div>
            </div>
            <template #footer>
                <UiButton @click="editPolicyDrawer = false" color="#fff" text="Cancel" size="sm" />
                <UiButton @click="handleUpdatePolicy" color="#4aff7a" text="Save Changes" size="sm"
                    :loading="editPolicySaving" />
            </template>
        </UiSidebarModal>

        <!-- DELETE POLICY CONFIRM -->
        <UiModal v-model="deletePolicyModal" title="Delete Policy?" size="sm">
            <template #default>
                <span>Are you sure you want to delete <strong>{{ selectedPolicy?.name }}</strong>? All holidays under
                    this policy will also be removed.</span>
            </template>
            <template #footer>
                <UiButton @click="deletePolicyModal = false" color="#fff" text="Cancel" size="sm" />
                <UiButton @click="handleDeletePolicy" color="#750d0d" text="Delete Policy" size="sm" />
            </template>
        </UiModal>

        <!-- DELETE HOLIDAY CONFIRM -->
        <UiModal v-model="deleteHolidayModal" title="Delete Holiday?" size="sm">
            <template #default>
                <span>Are you sure you want to delete <strong>{{ deleteHolidayData?.name }}</strong>?</span>
            </template>
            <template #footer>
                <UiButton @click="deleteHolidayModal = false" color="#fff" text="Cancel" size="sm" />
                <UiButton @click="handleDeleteHoliday" color="#750d0d" text="Delete Holiday" size="sm"
                    :loading="deleteHolidaySaving" />
            </template>
        </UiModal>

        <!-- EMPLOYEE DRAWER -->
        <UiSidebarModal v-model="employeeDrawer" title="Employees" width="640px">
            <template #subtitle>
                {{ selectedPolicy?.name }}
            </template>

            <!-- Search -->
            <div class="mb-4">
                <input v-model="employeeSearch" type="text" placeholder="Search employees..."
                    class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
            </div>

            <!-- Loading -->
            <div v-if="employeeLoading" class="flex items-center justify-center h-40">
                <UiLoader />
            </div>

            <!-- Empty -->
            <div v-else-if="filteredEmployees.length === 0" class="text-center py-12">
                <Icon name="ion:people-outline" class="text-4xl text-white/20 mb-3" />
                <p class="text-sm text-white/50">No employees found.</p>
            </div>

            <!-- Employee Table -->
            <table v-else class="w-full text-sm">
                <thead>
                    <tr class="text-[11px] uppercase tracking-[0.18em] text-white/50 border-b border-white/10">
                        <th class="text-left px-3 py-2 font-medium">Employee</th>
                        <th class="text-left px-3 py-2 font-medium">Reporting To</th>
                        <th class="text-left px-3 py-2 font-medium">Department</th>
                        <th class="text-left px-3 py-2 font-medium">Location</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="emp in filteredEmployees" :key="emp.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-3 py-2">
                            <div class="font-medium text-white">{{ emp.full_name }}</div>
                            <div class="text-[11px] text-white/50">{{ emp.employee_code }}</div>
                        </td>
                        <td class="px-3 py-2 text-white/70">{{ emp.reporting_to || '—' }}</td>
                        <td class="px-3 py-2 text-white/70">{{ emp.department || '—' }}</td>
                        <td class="px-3 py-2 text-white/70">{{ emp.location || '—' }}</td>
                    </tr>
                </tbody>
            </table>
        </UiSidebarModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../../../stores/shared/auth.store'
import { useHolidayStore } from '../../../../stores/organization/holiday.store'
import { useHolidayPolicyStore } from '../../../../stores/organization/holidayPolicy.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

/* -----------------------------------------
   STORES
----------------------------------------- */
const authStore = useAuthStore()
const holidayStore = useHolidayStore()
const policyStore = useHolidayPolicyStore()

const { organization_id } = storeToRefs(holidayStore)

/* -----------------------------------------
   UI STATE
----------------------------------------- */
const initialLoading = ref(true)
const policySearch = ref('')

// Policy modals/drawer
const createPolicyModal = ref(false)
const editPolicyDrawer = ref(false)
const deletePolicyModal = ref(false)
const editPolicySaving = ref(false)
const editPolicyForm = ref({ name: '', is_active: true })

// Policy action menu
const policyMenuOpen = ref(false)
const policyMenuRef = ref(null)

// Year selection
const selectedYear = ref(new Date().getFullYear())
const availableYearsFromDB = ref([])

// Holiday inline add/edit
const newHolidayRow = ref(null)
const newHolidaySaving = ref(false)
const editingHolidayId = ref(null)
const editingHolidayData = ref(null)
const editingHolidaySaving = ref(false)

// Delete holiday
const deleteHolidayModal = ref(false)
const deleteHolidayData = ref(null)
const deleteHolidaySaving = ref(false)

// Employee drawer
const employeeDrawer = ref(false)
const employeeSearch = ref('')
const employeeLoading = ref(false)
const assignedEmployees = ref([])

// Per-policy employee counts: { [policyId]: count }
const policyEmployeeCounts = ref({})

/* -----------------------------------------
   COMPUTEDS
----------------------------------------- */
const filteredPolicies = computed(() => {
    if (!policySearch.value) return policyStore.policies
    const q = policySearch.value.toLowerCase()
    return policyStore.policies.filter(p =>
        p.name.toLowerCase().includes(q)
    )
})

const selectedPolicy = computed(() =>
    policyStore.policies.find(p => p.id === policyStore.selected_policy_id)
)

const policyHolidays = computed(() =>
    holidayStore.holidays.filter(h => h.policy_id === policyStore.selected_policy_id)
)

// Dynamic year list: historical years from DB + current year + next year
const currentYear = computed(() => new Date().getFullYear())
const nextYear = computed(() => currentYear.value + 1)

const availableYears = computed(() => {
    const years = new Set()
    years.add(currentYear.value)
    years.add(nextYear.value)

    availableYearsFromDB.value.forEach(y => years.add(y))

    return Array.from(years).sort((a, b) => a - b)
})

const isNextYearPreparationWindow = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const day = now.getDate()
    return month === 11 && day >= 25
})

const canCreateHolidaysForYear = (year) => {
    const now = new Date()
    const currentYr = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDay = now.getDate()

    if (year < currentYr) return false
    if (year === currentYr) return true
    if (year === currentYr + 1) {
        return currentMonth === 11 && currentDay >= 25
    }
    return false
}

const isPreparationYear = (year) => {
    const now = new Date()
    const currentYr = now.getFullYear()
    return year === currentYr + 1 && !canCreateHolidaysForYear(year)
}

const preparationMessage = computed(() => {
    const now = new Date()
    const currentYr = now.getFullYear()
    return `${nextYear.value} holiday preparation is not available yet. You can add ${nextYear.value} holidays from 25-Dec-${currentYr}.`
})

const employeeCount = computed(() => {
    if (!policyStore.selected_policy_id) return 0
    return policyEmployeeCounts.value[policyStore.selected_policy_id] || 0
})

const filteredEmployees = computed(() => {
    if (!employeeSearch.value) return assignedEmployees.value
    const q = employeeSearch.value.toLowerCase()
    return assignedEmployees.value.filter(e =>
        (e.full_name || '').toLowerCase().includes(q) ||
        (e.employee_code || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q)
    )
})

/* -----------------------------------------
   AVAILABLE YEARS
----------------------------------------- */
const fetchAvailableYears = async () => {
    try {
        const { $api } = useNuxtApp()
        const orgId = organization_id.value || authStore.organization
        if (!orgId) return
        const { data } = await $api.get('/holidays/available-years', {
            params: { organization_id: orgId },
        })
        availableYearsFromDB.value = data?.years || []
    } catch (err) {
        console.error('[holidays] Failed to fetch available years:', err)
    }
}

/* -----------------------------------------
   HELPERS
----------------------------------------- */
const formatDate = (date) => {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return date
    }
}

const getDefaultDate = () => {
    return `${selectedYear.value}-01-01`
}

/* -----------------------------------------
   YEAR SELECTION
----------------------------------------- */
const selectYear = (year) => {
    cancelNewHoliday()
    cancelEditHoliday()
    selectedYear.value = year
    holidayStore.filter_year = year
    holidayStore.fetchHolidays()
}

/* -----------------------------------------
   POLICY ACTIONS
----------------------------------------- */
const selectPolicy = (policy) => {
    cancelNewHoliday()
    cancelEditHoliday()
    policyStore.selectPolicy(policy.id)
    holidayStore.filter_policy = policy.id
    selectedYear.value = new Date().getFullYear()
    holidayStore.filter_year = selectedYear.value
    holidayStore.fetchHolidays()
}

const openCreatePolicyModal = () => {
    policyStore.resetForm()
    createPolicyModal.value = true
}

const handleCreatePolicy = async () => {
    const result = await policyStore.createPolicy()
    if (result) {
        createPolicyModal.value = false
        await fetchEmployeeCounts()
    }
}

const handlePolicyMenuEdit = () => {
    policyMenuOpen.value = false
    if (!selectedPolicy.value) return
    editPolicyForm.value = {
        name: selectedPolicy.value.name,
        is_active: selectedPolicy.value.is_active,
    }
    editPolicyDrawer.value = true
}

const handlePolicyMenuBulkImport = () => {
    policyMenuOpen.value = false
    if (!selectedPolicy.value) return
    if (!canCreateHolidaysForYear(selectedYear.value)) return
    const orgId = organization_id.value || authStore.organization
    const policyId = policyStore.selected_policy_id
    navigateTo(`/organization/${orgId}/attendance/holidays-import?policy_id=${policyId}&year=${selectedYear.value}`)
}

const handleUpdatePolicy = async () => {
    editPolicySaving.value = true
    try {
        policyStore.name = editPolicyForm.value.name
        policyStore.is_active = editPolicyForm.value.is_active
        const result = await policyStore.updatePolicy(policyStore.selected_policy_id)
        if (result) editPolicyDrawer.value = false
    } finally {
        editPolicySaving.value = false
    }
}

const handlePolicyMenuDelete = () => {
    policyMenuOpen.value = false
    deletePolicyModal.value = true
}

const handleDeletePolicy = async () => {
    await policyStore.deletePolicy(policyStore.selected_policy_id)
    deletePolicyModal.value = false
    await fetchEmployeeCounts()
}

/* -----------------------------------------
   HOLIDAY INLINE ADD
----------------------------------------- */
const openAddHolidayRow = () => {
    if (newHolidayRow.value) return
    newHolidayRow.value = {
        name: '',
        date: getDefaultDate(),
        leave_optional: false,
    }
}

const cancelNewHoliday = () => {
    newHolidayRow.value = null
    newHolidaySaving.value = false
}

const saveNewHoliday = async () => {
    if (!newHolidayRow.value) return
    const row = newHolidayRow.value

    if (!row.name?.trim()) {
        useToast().error({ title: 'Validation', message: 'Holiday name is required', timeout: 2000 })
        return
    }
    if (!row.date) {
        useToast().error({ title: 'Validation', message: 'Date is required', timeout: 2000 })
        return
    }

    newHolidaySaving.value = true
    try {
        const { $api } = useNuxtApp()

        const payload = {
            organization_id: organization_id.value,
            policy_id: policyStore.selected_policy_id,
            name: row.name.trim(),
            date: row.date,
            type: 'PUBLIC',
            leave_optional: row.leave_optional,
        }

        await $api.post('/holidays', payload)

        useToast().success({ title: 'Success!', message: 'Holiday created', timeout: 1500 })
        newHolidayRow.value = null

        // Check if the created holiday's year is in the available years
        const createdYear = new Date(row.date).getFullYear()
        if (createdYear && !availableYears.value.includes(createdYear)) {
            selectedYear.value = createdYear
        }

        holidayStore.filter_year = selectedYear.value
        holidayStore.filter_policy = policyStore.selected_policy_id
        await holidayStore.fetchHolidays()
    } catch (err) {
        useToast().error({ title: 'Error!', message: err.message || 'Failed to create holiday', timeout: 2000 })
    } finally {
        newHolidaySaving.value = false
    }
}

/* -----------------------------------------
   HOLIDAY INLINE EDIT
----------------------------------------- */
const startEditHoliday = (holiday) => {
    editingHolidayId.value = holiday.id
    editingHolidayData.value = {
        name: holiday.name,
        date: holiday.date ? holiday.date.split('T')[0] : '',
        leave_optional: holiday.leave_optional,
    }
}

const cancelEditHoliday = () => {
    editingHolidayId.value = null
    editingHolidayData.value = null
    editingHolidaySaving.value = false
}

const saveEditHoliday = async () => {
    if (!editingHolidayData.value) return
    const data = editingHolidayData.value

    if (!data.name?.trim()) {
        useToast().error({ title: 'Validation', message: 'Holiday name is required', timeout: 2000 })
        return
    }
    if (!data.date) {
        useToast().error({ title: 'Validation', message: 'Date is required', timeout: 2000 })
        return
    }

    editingHolidaySaving.value = true
    try {
        const { $api } = useNuxtApp()

        const payload = {
            name: data.name.trim(),
            date: data.date,
            type: 'PUBLIC',
            leave_optional: data.leave_optional,
        }

        await $api.put(`/holidays/${editingHolidayId.value}`, payload)

        useToast().success({ title: 'Updated!', message: 'Holiday updated', timeout: 1500 })
        editingHolidayId.value = null
        editingHolidayData.value = null

        holidayStore.filter_year = selectedYear.value
        holidayStore.filter_policy = policyStore.selected_policy_id
        await holidayStore.fetchHolidays()
    } catch (err) {
        useToast().error({ title: 'Error!', message: err.message || 'Failed to update holiday', timeout: 2000 })
    } finally {
        editingHolidaySaving.value = false
    }
}

/* -----------------------------------------
   HOLIDAY DELETE
----------------------------------------- */
const confirmDeleteHoliday = (holiday) => {
    deleteHolidayData.value = holiday
    deleteHolidayModal.value = true
}

const handleDeleteHoliday = async () => {
    if (!deleteHolidayData.value || deleteHolidaySaving.value) return
    deleteHolidaySaving.value = true
    try {
        const { $api } = useNuxtApp()
        await $api.delete(`/holidays/${deleteHolidayData.value.id}`)
        useToast().success({ title: 'Deleted!', message: 'Holiday deleted', timeout: 1500 })
        deleteHolidayModal.value = false
        deleteHolidayData.value = null

        holidayStore.filter_year = selectedYear.value
        holidayStore.filter_policy = policyStore.selected_policy_id
        await holidayStore.fetchHolidays()
    } catch (err) {
        useToast().error({ title: 'Error!', message: err.message || 'Failed to delete holiday', timeout: 2000 })
    } finally {
        deleteHolidaySaving.value = false
    }
}

/* -----------------------------------------
   EMPLOYEE DRAWER
----------------------------------------- */
const openEmployeeDrawer = async () => {
    if (!policyStore.selected_policy_id) return
    employeeDrawer.value = true
    employeeLoading.value = true
    assignedEmployees.value = []
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/holiday-policies/${policyStore.selected_policy_id}/assigned-employees`, {
            params: { organization_id: organization_id.value },
        })
        assignedEmployees.value = data?.employees || []
    } catch (err) {
        console.error('[holidays] Failed to fetch assigned employees:', err)
        useToast().error({ title: 'Error', message: err.message || 'Failed to load employees', timeout: 2000 })
    } finally {
        employeeLoading.value = false
    }
}

/* -----------------------------------------
   EMPLOYEE COUNTS PER POLICY
----------------------------------------- */
const fetchEmployeeCounts = async () => {
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/holiday-policies/employee-counts', {
            params: { organization_id: organization_id.value },
        })
        policyEmployeeCounts.value = data?.counts || {}
    } catch (err) {
        console.error('[holidays] Failed to fetch employee counts:', err)
    }
}

/* -----------------------------------------
   CLOSE POLICY MENU ON OUTSIDE CLICK
----------------------------------------- */
const handleOutsideClick = (e) => {
    if (policyMenuRef.value && !policyMenuRef.value.contains(e.target)) {
        policyMenuOpen.value = false
    }
}

/* -----------------------------------------
   WATCHERS
----------------------------------------- */
// Reconcile selected_policy_id after policy list refresh
watch(() => policyStore.policies, (policies) => {
    if (!policies.length) {
        policyStore.selected_policy_id = null
        return
    }
    if (policyStore.selected_policy_id && !policies.find(p => p.id === policyStore.selected_policy_id)) {
        policyStore.selected_policy_id = policies[0].id
    } else if (!policyStore.selected_policy_id) {
        policyStore.selected_policy_id = policies[0].id
    }
}, { deep: true })

/* -----------------------------------------
   ON MOUNT
----------------------------------------- */
onMounted(async () => {
    document.addEventListener('click', handleOutsideClick)

    if (authStore.organization) {
        organization_id.value = authStore.organization
    }

    holidayStore.filter_year = selectedYear.value

    await Promise.all([
        policyStore.fetchPolicies(),
        fetchEmployeeCounts(),
        fetchAvailableYears(),
    ])

    if (policyStore.selected_policy_id) {
        holidayStore.filter_policy = policyStore.selected_policy_id
        await holidayStore.fetchHolidays()
    }

    initialLoading.value = false
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
})
</script>
